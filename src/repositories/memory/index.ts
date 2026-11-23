import type {
  ContactMessageRepository,
  CrudRepository,
  ExperienceRepository,
  ProfileRepository,
  ProjectRepository,
  SkillRepository,
} from "../index.js";
import type { ContactMessage, Experience, Profile, Project, Skill } from "../../models/index.js";

const clone = <T>(v: T): T => structuredClone(v);

export class InMemoryProfileRepository implements ProfileRepository {
  constructor(private profile: Profile | null = null) {}
  async get() {
    return this.profile ? clone(this.profile) : null;
  }
  async save(profile: Profile) {
    this.profile = clone(profile);
  }
}

class InMemoryCrud<T extends { id: string }> implements CrudRepository<T> {
  protected items = new Map<string, T>();
  constructor(seed: T[] = []) {
    seed.forEach((s) => this.items.set(s.id, clone(s)));
  }
  async list() {
    return [...this.items.values()].map(clone);
  }
  async getById(id: string) {
    const v = this.items.get(id);
    return v ? clone(v) : null;
  }
  async save(entity: T) {
    this.items.set(entity.id, clone(entity));
  }
  async delete(id: string) {
    return this.items.delete(id);
  }
}

export class InMemorySkillRepository extends InMemoryCrud<Skill> implements SkillRepository {}
export class InMemoryExperienceRepository extends InMemoryCrud<Experience> implements ExperienceRepository {}

export class InMemoryProjectRepository extends InMemoryCrud<Project> implements ProjectRepository {
  async getBySlug(slug: string) {
    const v = [...this.items.values()].find((p) => p.slug === slug);
    return v ? clone(v) : null;
  }
}

export class InMemoryContactMessageRepository
  extends InMemoryCrud<ContactMessage>
  implements ContactMessageRepository
{
  async countSince(email: string, since: Date) {
    const e = email.toLowerCase();
    return [...this.items.values()].filter(
      (m) => m.email.toLowerCase() === e && m.createdAt >= since,
    ).length;
  }
}
