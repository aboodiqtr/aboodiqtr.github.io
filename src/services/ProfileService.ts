import { NotFoundError, ValidationError } from "../errors/index.js";
import type { Profile } from "../models/index.js";
import type { ProfileRepository } from "../repositories/index.js";
import { isEmail, isUrl, Validator } from "../utils/index.js";

export class ProfileService {
  constructor(private readonly repo: ProfileRepository) {}

  async getProfile(): Promise<Profile> {
    const p = await this.repo.get();
    if (!p) throw new NotFoundError("Profile", "me");
    return p;
  }

  async updateProfile(changes: Partial<Profile>): Promise<Profile> {
    const current = await this.repo.get();
    const next = { ...(current ?? {}), ...changes } as Profile;
    next.socialLinks = next.socialLinks ?? [];
    next.availableForWork = next.availableForWork ?? false;
    ProfileService.validate(next);
    await this.repo.save(next);
    return next;
  }

  async setAvailability(available: boolean): Promise<Profile> {
    return this.updateProfile({ availableForWork: available });
  }

  static validate(p: Profile): void {
    const v = new Validator()
      .require(p.fullName, "fullName")
      .require(p.headline, "headline")
      .require(p.bio, "bio")
      .require(p.email, "email")
      .maxLength(p.headline, 120, "headline")
      .maxLength(p.bio, 2000, "bio");
    if (p.email) v.check(isEmail(p.email), "email is not valid");
    for (const field of ["avatarUrl", "resumeUrl"] as const) {
      if (p[field]) v.check(isUrl(p[field]!), `${field} is not a valid URL`);
    }
    p.socialLinks.forEach((l, i) => v.check(isUrl(l.url), `socialLinks[${i}].url is not a valid URL`));
    if (v.issues.length) throw new ValidationError(v.issues);
  }
}
