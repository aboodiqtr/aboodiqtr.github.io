import { ConflictError, NotFoundError, ValidationError } from "../errors/index.js";
import type { Project, ProjectStatus } from "../models/index.js";
import { systemClock, type Clock, type ProjectRepository } from "../repositories/index.js";
import { isUrl, newId, slugify, Validator } from "../utils/index.js";

export type NewProject = Omit<Project, "id" | "slug" | "createdAt" | "updatedAt" | "status" | "featured" | "tags"> & {
  slug?: string;
  status?: ProjectStatus;
  featured?: boolean;
  tags?: string[];
};

export interface ProjectQuery {
  tag?: string;
  tech?: string;
  search?: string;
  featuredOnly?: boolean;
}

export class ProjectService {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly clock: Clock = systemClock,
  ) {}

  /** Public list: only published projects, featured first, newest first. */
  async listPublished(query: ProjectQuery = {}): Promise<Project[]> {
    const q = query.search?.trim().toLowerCase();
    const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
    return (await this.repo.list())
      .filter((p) => p.status === "published")
      .filter((p) => !query.featuredOnly || p.featured)
      .filter((p) => !query.tag || p.tags.some((t) => eq(t, query.tag!)))
      .filter((p) => !query.tech || p.techStack.some((t) => eq(t, query.tech!)))
      .filter((p) => !q || [p.title, p.summary, p.description].some((f) => f.toLowerCase().includes(q)))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || dateOf(b) - dateOf(a));
  }

  async listFeatured(limit = 3): Promise<Project[]> {
    return (await this.listPublished({ featuredOnly: true })).slice(0, limit);
  }

  /** For the project details page. Drafts are hidden from visitors. */
  async getPublishedBySlug(slug: string): Promise<Project> {
    const p = await this.repo.getBySlug(slug);
    if (!p || p.status !== "published") throw new NotFoundError("Project", slug);
    return p;
  }

  /** All tags used by published projects, with counts (for filter chips). */
  async listTags(): Promise<{ tag: string; count: number }[]> {
    const counts = new Map<string, number>();
    for (const p of await this.listPublished()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }

  // ---- admin side ----

  async listAll(): Promise<Project[]> {
    return (await this.repo.list()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createProject(input: NewProject): Promise<Project> {
    const now = this.clock.now();
    const project: Project = {
      ...input,
      id: newId(),
      slug: slugify(input.slug || input.title),
      tags: normalizeList(input.tags ?? []),
      techStack: normalizeList(input.techStack ?? []),
      featured: input.featured ?? false,
      status: input.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    };
    this.validate(project);
    if (await this.repo.getBySlug(project.slug)) throw new ConflictError(`Slug "${project.slug}" is taken`);
    await this.repo.save(project);
    return project;
  }

  async updateProject(id: string, changes: Partial<NewProject>): Promise<Project> {
    const current = await this.repo.getById(id);
    if (!current) throw new NotFoundError("Project", id);
    const next: Project = { ...current, ...changes, id, createdAt: current.createdAt, updatedAt: this.clock.now() } as Project;
    if (changes.slug !== undefined) next.slug = slugify(changes.slug);
    if (changes.tags) next.tags = normalizeList(changes.tags);
    if (changes.techStack) next.techStack = normalizeList(changes.techStack);
    this.validate(next);
    if (next.slug !== current.slug) {
      const other = await this.repo.getBySlug(next.slug);
      if (other && other.id !== id) throw new ConflictError(`Slug "${next.slug}" is taken`);
    }
    await this.repo.save(next);
    return next;
  }

  publish(id: string) {
    return this.updateProject(id, { status: "published" });
  }
  archive(id: string) {
    return this.updateProject(id, { status: "archived" });
  }
  setFeatured(id: string, featured: boolean) {
    return this.updateProject(id, { featured });
  }

  async deleteProject(id: string): Promise<void> {
    if (!(await this.repo.delete(id))) throw new NotFoundError("Project", id);
  }

  private validate(p: Project): void {
    const v = new Validator()
      .require(p.title, "title")
      .require(p.summary, "summary")
      .require(p.slug, "slug")
      .maxLength(p.title, 100, "title")
      .maxLength(p.summary, 280, "summary");
    for (const field of ["repoUrl", "liveUrl", "imageUrl"] as const) {
      if (p[field]) v.check(isUrl(p[field]!), `${field} is not a valid URL`);
    }
    if (p.startedAt && p.completedAt) v.check(p.completedAt >= p.startedAt, "completedAt must be after startedAt");
    if (p.status === "published") v.check(!!p.description?.trim(), "description is required before publishing");
    if (v.issues.length) throw new ValidationError(v.issues);
  }
}

const dateOf = (p: Project) => (p.completedAt ?? p.startedAt ?? p.createdAt).getTime();

function normalizeList(items: string[]): string[] {
  const seen = new Map<string, string>();
  for (const raw of items) {
    const t = raw.trim();
    if (t && !seen.has(t.toLowerCase())) seen.set(t.toLowerCase(), t);
  }
  return [...seen.values()];
}
