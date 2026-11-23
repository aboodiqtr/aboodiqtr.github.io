// Composition root: wires repositories into services.
// Pass your own repositories (e.g. database ones) to replace the in-memory defaults.

import type {
  Clock,
  ContactMessageRepository,
  ContactNotifier,
  ExperienceRepository,
  ProfileRepository,
  ProjectRepository,
  SkillRepository,
} from "./repositories/index.js";
import { systemClock } from "./repositories/index.js";
import {
  InMemoryContactMessageRepository,
  InMemoryExperienceRepository,
  InMemoryProfileRepository,
  InMemoryProjectRepository,
  InMemorySkillRepository,
} from "./repositories/memory/index.js";
import {
  ContactService,
  ExperienceService,
  PortfolioService,
  ProfileService,
  ProjectService,
  SkillService,
  type ContactOptions,
} from "./services/index.js";

export interface BusinessLayerDeps {
  profiles?: ProfileRepository;
  skills?: SkillRepository;
  projects?: ProjectRepository;
  experience?: ExperienceRepository;
  contacts?: ContactMessageRepository;
  notifier?: ContactNotifier;
  clock?: Clock;
  contactOptions?: Partial<ContactOptions>;
}

export function createBusinessLayer(deps: BusinessLayerDeps = {}) {
  const clock = deps.clock ?? systemClock;
  const profile = new ProfileService(deps.profiles ?? new InMemoryProfileRepository());
  const skills = new SkillService(deps.skills ?? new InMemorySkillRepository());
  const projects = new ProjectService(deps.projects ?? new InMemoryProjectRepository(), clock);
  const experience = new ExperienceService(deps.experience ?? new InMemoryExperienceRepository(), clock);
  const contact = new ContactService(
    deps.contacts ?? new InMemoryContactMessageRepository(),
    deps.notifier,
    clock,
    deps.contactOptions,
  );
  const portfolio = new PortfolioService(profile, skills, projects, experience);
  return { profile, skills, projects, experience, contact, portfolio };
}

export type BusinessLayer = ReturnType<typeof createBusinessLayer>;
