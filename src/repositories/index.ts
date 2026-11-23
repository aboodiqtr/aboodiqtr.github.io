// Data access contracts. The services only depend on these interfaces,
// so you can swap the in-memory versions for a real database (Postgres,
// MongoDB, a JSON file, a headless CMS...) without touching business logic.

import type { ContactMessage, Experience, Profile, Project, Skill } from "../models/index.js";

export interface ProfileRepository {
  get(): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
}

export interface CrudRepository<T extends { id: string }> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>; // insert or update
  delete(id: string): Promise<boolean>;
}

export interface SkillRepository extends CrudRepository<Skill> {}

export interface ProjectRepository extends CrudRepository<Project> {
  getBySlug(slug: string): Promise<Project | null>;
}

export interface ExperienceRepository extends CrudRepository<Experience> {}

export interface ContactMessageRepository extends CrudRepository<ContactMessage> {
  countSince(email: string, since: Date): Promise<number>;
}

/** Sends you a notification when someone contacts you (email, Telegram, Slack...). */
export interface ContactNotifier {
  notify(message: ContactMessage): Promise<void>;
}

/** Lets tests control "now". */
export interface Clock {
  now(): Date;
}
export const systemClock: Clock = { now: () => new Date() };
