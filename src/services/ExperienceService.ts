import { NotFoundError, ValidationError } from "../errors/index.js";
import type { Experience } from "../models/index.js";
import { systemClock, type Clock, type ExperienceRepository } from "../repositories/index.js";
import { monthsBetween, newId, Validator } from "../utils/index.js";

export type NewExperience = Omit<Experience, "id">;

export class ExperienceService {
  constructor(
    private readonly repo: ExperienceRepository,
    private readonly clock: Clock = systemClock,
  ) {}

  /** Timeline for the "Experience" section: current jobs first, then most recent. */
  async getTimeline(): Promise<Experience[]> {
    return (await this.repo.list()).sort((a, b) => {
      const ae = a.endDate?.getTime() ?? Infinity;
      const be = b.endDate?.getTime() ?? Infinity;
      return be - ae || b.startDate.getTime() - a.startDate.getTime();
    });
  }

  async getWorkHistory(): Promise<Experience[]> {
    return (await this.getTimeline()).filter((e) => e.type !== "education");
  }

  async getEducation(): Promise<Experience[]> {
    return (await this.getTimeline()).filter((e) => e.type === "education");
  }

  /**
   * Total years of real work experience (education excluded).
   * Overlapping jobs are merged so they are not counted twice.
   */
  async getTotalYearsOfExperience(): Promise<number> {
    const now = this.clock.now();
    const ranges = (await this.getWorkHistory())
      .map((e) => ({ start: e.startDate, end: e.endDate ?? now }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let months = 0;
    let cur: { start: Date; end: Date } | null = null;
    for (const r of ranges) {
      if (cur && r.start <= cur.end) {
        if (r.end > cur.end) cur.end = r.end;
      } else {
        if (cur) months += monthsBetween(cur.start, cur.end);
        cur = { ...r };
      }
    }
    if (cur) months += monthsBetween(cur.start, cur.end);
    return Math.round((months / 12) * 10) / 10;
  }

  /** Human friendly duration, e.g. "2 yrs 3 mos". */
  durationLabel(e: Experience): string {
    const m = monthsBetween(e.startDate, e.endDate ?? this.clock.now()) + 1;
    const y = Math.floor(m / 12);
    const r = m % 12;
    const parts = [];
    if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
    if (r) parts.push(`${r} mo${r > 1 ? "s" : ""}`);
    return parts.join(" ") || "1 mo";
  }

  async addExperience(input: NewExperience): Promise<Experience> {
    const e: Experience = { ...input, highlights: input.highlights ?? [], id: newId() };
    this.validate(e);
    await this.repo.save(e);
    return e;
  }

  async updateExperience(id: string, changes: Partial<NewExperience>): Promise<Experience> {
    const current = await this.repo.getById(id);
    if (!current) throw new NotFoundError("Experience", id);
    const next = { ...current, ...changes, id };
    this.validate(next);
    await this.repo.save(next);
    return next;
  }

  async removeExperience(id: string): Promise<void> {
    if (!(await this.repo.delete(id))) throw new NotFoundError("Experience", id);
  }

  private validate(e: Experience): void {
    const v = new Validator().require(e.role, "role").require(e.organization, "organization").require(e.startDate, "startDate");
    if (e.startDate) v.check(e.startDate <= this.clock.now(), "startDate cannot be in the future");
    if (e.startDate && e.endDate) v.check(e.endDate >= e.startDate, "endDate must be after startDate");
    if (v.issues.length) throw new ValidationError(v.issues);
  }
}
