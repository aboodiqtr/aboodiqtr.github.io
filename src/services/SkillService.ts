import { ConflictError, NotFoundError, ValidationError } from "../errors/index.js";
import { SKILL_LEVELS, type Skill } from "../models/index.js";
import type { SkillRepository } from "../repositories/index.js";
import { newId, Validator } from "../utils/index.js";

export type NewSkill = Omit<Skill, "id">;

export class SkillService {
  constructor(private readonly repo: SkillRepository) {}

  /** All skills, strongest first, then by name. */
  async listSkills(): Promise<Skill[]> {
    const skills = await this.repo.list();
    return skills.sort(
      (a, b) =>
        SKILL_LEVELS.indexOf(b.level) - SKILL_LEVELS.indexOf(a.level) || a.name.localeCompare(b.name),
    );
  }

  /** e.g. { Frontend: [...], Backend: [...] } — handy for the "Skills" section. */
  async getSkillsByCategory(): Promise<Record<string, Skill[]>> {
    const grouped: Record<string, Skill[]> = {};
    for (const s of await this.listSkills()) (grouped[s.category] ??= []).push(s);
    return grouped;
  }

  async addSkill(input: NewSkill): Promise<Skill> {
    this.validate(input);
    const all = await this.repo.list();
    if (all.some((s) => s.name.toLowerCase() === input.name.trim().toLowerCase())) {
      throw new ConflictError(`Skill "${input.name}" already exists`);
    }
    const skill: Skill = { ...input, name: input.name.trim(), category: input.category.trim(), id: newId() };
    await this.repo.save(skill);
    return skill;
  }

  async updateSkill(id: string, changes: Partial<NewSkill>): Promise<Skill> {
    const current = await this.repo.getById(id);
    if (!current) throw new NotFoundError("Skill", id);
    const next = { ...current, ...changes, id };
    this.validate(next);
    await this.repo.save(next);
    return next;
  }

  async removeSkill(id: string): Promise<void> {
    if (!(await this.repo.delete(id))) throw new NotFoundError("Skill", id);
  }

  private validate(s: NewSkill): void {
    const v = new Validator()
      .require(s.name, "name")
      .require(s.category, "category")
      .check(SKILL_LEVELS.includes(s.level), `level must be one of ${SKILL_LEVELS.join(", ")}`);
    if (s.yearsOfExperience !== undefined) {
      v.check(s.yearsOfExperience >= 0 && s.yearsOfExperience <= 60, "yearsOfExperience must be 0-60");
    }
    if (v.issues.length) throw new ValidationError(v.issues);
  }
}
