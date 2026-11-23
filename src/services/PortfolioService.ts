import type { PortfolioOverview } from "../models/index.js";
import type { ExperienceService } from "./ExperienceService.js";
import type { ProfileService } from "./ProfileService.js";
import type { ProjectService } from "./ProjectService.js";
import type { SkillService } from "./SkillService.js";

/** One call that gives the homepage everything it needs to introduce you. */
export class PortfolioService {
  constructor(
    private readonly profiles: ProfileService,
    private readonly skills: SkillService,
    private readonly projects: ProjectService,
    private readonly experience: ExperienceService,
  ) {}

  async getOverview(featuredLimit = 3): Promise<PortfolioOverview> {
    const [profile, skillsByCategory, featuredProjects, published, timeline, years] = await Promise.all([
      this.profiles.getProfile(),
      this.skills.getSkillsByCategory(),
      this.projects.listFeatured(featuredLimit),
      this.projects.listPublished(),
      this.experience.getTimeline(),
      this.experience.getTotalYearsOfExperience(),
    ]);
    return {
      profile,
      skillsByCategory,
      featuredProjects,
      timeline,
      stats: {
        yearsOfExperience: years,
        publishedProjects: published.length,
        skills: Object.values(skillsByCategory).reduce((n, list) => n + list.length, 0),
      },
    };
  }
}
