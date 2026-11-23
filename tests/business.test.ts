import { beforeEach, describe, expect, it } from "vitest";
import {
  ConflictError,
  createBusinessLayer,
  NotFoundError,
  RateLimitError,
  seedExample,
  ValidationError,
  type BusinessLayer,
  type ContactMessage,
} from "../src/index.js";

let now = new Date("2026-06-01T12:00:00Z");
const clock = { now: () => now };

let app: BusinessLayer;
let notified: ContactMessage[];

beforeEach(() => {
  now = new Date("2026-06-01T12:00:00Z");
  notified = [];
  app = createBusinessLayer({ clock, notifier: { notify: async (m) => void notified.push(m) } });
});

describe("ProfileService", () => {
  it("throws NotFound before a profile exists", async () => {
    await expect(app.profile.getProfile()).rejects.toBeInstanceOf(NotFoundError);
  });

  it("saves a valid profile and rejects a bad one", async () => {
    await app.profile.updateProfile({ fullName: "A", headline: "Dev", bio: "Hi", email: "a@b.co" });
    expect((await app.profile.getProfile()).availableForWork).toBe(false);
    await expect(app.profile.updateProfile({ email: "nope" })).rejects.toBeInstanceOf(ValidationError);
    await app.profile.setAvailability(true);
    expect((await app.profile.getProfile()).availableForWork).toBe(true);
  });
});

describe("SkillService", () => {
  it("groups by category, strongest first, and blocks duplicates", async () => {
    await app.skills.addSkill({ name: "CSS", category: "Frontend", level: "intermediate" });
    await app.skills.addSkill({ name: "React", category: "Frontend", level: "expert" });
    await app.skills.addSkill({ name: "Node", category: "Backend", level: "advanced" });
    const g = await app.skills.getSkillsByCategory();
    expect(g.Frontend.map((s) => s.name)).toEqual(["React", "CSS"]);
    expect(g.Backend).toHaveLength(1);
    await expect(app.skills.addSkill({ name: "react", category: "X", level: "beginner" })).rejects.toBeInstanceOf(ConflictError);
  });

  it("validates level", async () => {
    await expect(app.skills.addSkill({ name: "X", category: "Y", level: "god" as any })).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("ProjectService", () => {
  const base = { title: "My Cool App!", summary: "Short", description: "Long text", techStack: ["TS", "ts", " React "] };

  it("creates drafts with a slug and hides them from visitors", async () => {
    const p = await app.projects.createProject(base);
    expect(p.slug).toBe("my-cool-app");
    expect(p.status).toBe("draft");
    expect(p.techStack).toEqual(["TS", "React"]);
    expect(await app.projects.listPublished()).toHaveLength(0);
    await expect(app.projects.getPublishedBySlug("my-cool-app")).rejects.toBeInstanceOf(NotFoundError);
    await app.projects.publish(p.id);
    expect((await app.projects.getPublishedBySlug("my-cool-app")).id).toBe(p.id);
  });

  it("rejects duplicate slugs", async () => {
    await app.projects.createProject(base);
    await expect(app.projects.createProject(base)).rejects.toBeInstanceOf(ConflictError);
  });

  it("needs a description to publish", async () => {
    const p = await app.projects.createProject({ ...base, description: "" });
    await expect(app.projects.publish(p.id)).rejects.toBeInstanceOf(ValidationError);
  });

  it("filters by tag/tech/search and puts featured first", async () => {
    const a = await app.projects.createProject({ ...base, title: "Alpha", tags: ["web"], status: "published" });
    const b = await app.projects.createProject({ ...base, title: "Beta", tags: ["cli"], techStack: ["Go"], status: "published", featured: true });
    expect((await app.projects.listPublished()).map((p) => p.id)).toEqual([b.id, a.id]);
    expect((await app.projects.listPublished({ tag: "WEB" })).map((p) => p.id)).toEqual([a.id]);
    expect((await app.projects.listPublished({ tech: "go" })).map((p) => p.id)).toEqual([b.id]);
    expect((await app.projects.listPublished({ search: "alp" })).map((p) => p.id)).toEqual([a.id]);
    expect(await app.projects.listTags()).toEqual([{ tag: "cli", count: 1 }, { tag: "web", count: 1 }]);
  });
});

describe("ExperienceService", () => {
  it("orders current job first and merges overlapping years", async () => {
    await app.experience.addExperience({ role: "Junior", organization: "A", type: "full-time", startDate: new Date("2022-06-01"), endDate: new Date("2024-06-01"), description: "", highlights: [] });
    await app.experience.addExperience({ role: "Freelance", organization: "B", type: "freelance", startDate: new Date("2023-06-01"), endDate: new Date("2024-01-01"), description: "", highlights: [] });
    await app.experience.addExperience({ role: "Senior", organization: "C", type: "full-time", startDate: new Date("2024-06-01"), description: "", highlights: [] });
    await app.experience.addExperience({ role: "BSc", organization: "Uni", type: "education", startDate: new Date("2018-09-01"), endDate: new Date("2022-06-01"), description: "", highlights: [] });

    expect((await app.experience.getTimeline())[0].role).toBe("Senior");
    expect(await app.experience.getTotalYearsOfExperience()).toBe(4); // Jun 2022 -> Jun 2026, overlap not double counted
    expect(await app.experience.getEducation()).toHaveLength(1);
  });

  it("rejects end before start", async () => {
    await expect(
      app.experience.addExperience({ role: "X", organization: "Y", type: "full-time", startDate: new Date("2024-01-01"), endDate: new Date("2023-01-01"), description: "", highlights: [] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("ContactService", () => {
  const form = { name: "Sara", email: "Sara@Example.com", message: "Hi, I'd like to hire you for a project." };

  it("saves a message and notifies you", async () => {
    await app.contact.submit(form);
    expect(notified).toHaveLength(1);
    expect(notified[0].email).toBe("sara@example.com");
    expect(await app.contact.unreadCount()).toBe(1);
  });

  it("validates input", async () => {
    await expect(app.contact.submit({ name: "", email: "bad", message: "hi" })).rejects.toMatchObject({
      issues: expect.arrayContaining(["name is required", "email is not valid"]),
    });
  });

  it("quietly flags honeypot spam without notifying", async () => {
    await app.contact.submit({ ...form, website: "http://spam.example" });
    expect(notified).toHaveLength(0);
    expect(await app.contact.listInbox()).toHaveLength(0);
    expect(await app.contact.listInbox(true)).toHaveLength(1);
  });

  it("rate limits per email per hour", async () => {
    for (let i = 0; i < 3; i++) await app.contact.submit(form);
    await expect(app.contact.submit(form)).rejects.toBeInstanceOf(RateLimitError);
    now = new Date(now.getTime() + 61 * 60 * 1000);
    await expect(app.contact.submit(form)).resolves.toBeTruthy();
  });

  it("keeps the message even if notification fails", async () => {
    const a = createBusinessLayer({ clock, notifier: { notify: async () => { throw new Error("smtp down"); } } });
    await a.contact.submit(form);
    expect(await a.contact.listInbox()).toHaveLength(1);
  });

  it("marks messages read", async () => {
    const { id } = await app.contact.submit(form);
    await app.contact.markRead(id);
    expect(await app.contact.unreadCount()).toBe(0);
  });
});

describe("PortfolioService", () => {
  it("builds the homepage overview from seed data", async () => {
    await seedExample(app);
    const o = await app.portfolio.getOverview();
    expect(o.profile.fullName).toBeTruthy();
    expect(o.featuredProjects).toHaveLength(3);
    expect(o.stats.skills).toBe(26);
    expect(o.stats.publishedProjects).toBe(4);
    expect(o.stats.yearsOfExperience).toBe(0); // education only
  });
});
