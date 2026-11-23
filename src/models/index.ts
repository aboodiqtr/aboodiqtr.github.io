// Domain models: the "things" your dev site talks about.

export interface SocialLink {
  platform: "github" | "linkedin" | "x" | "website" | "email" | "other";
  url: string;
}

export interface Profile {
  fullName: string;
  headline: string; // e.g. "Full-stack developer"
  bio: string;
  location?: string;
  email: string;
  avatarUrl?: string;
  resumeUrl?: string;
  availableForWork: boolean;
  socialLinks: SocialLink[];
  /** Big numbers shown under the hero, e.g. { value: "3.31", label: "University GPA" }. */
  highlights?: { value: string; label: string }[];
  /** Spoken languages with a 0-100 level for the bars. */
  languages?: { name: string; level: string; percent: number }[];
}

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export const SKILL_LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced", "expert"];

export interface Skill {
  id: string;
  name: string; // e.g. "TypeScript"
  category: string; // e.g. "Frontend", "Backend", "Tools"
  level: SkillLevel;
  yearsOfExperience?: number;
}

export type ProjectStatus = "draft" | "published" | "archived";

export interface Project {
  id: string;
  slug: string; // url friendly, e.g. "my-cool-app"
  title: string;
  summary: string; // short one-liner for cards
  description: string; // longer text for the details page
  techStack: string[];
  tags: string[];
  repoUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
  status: ProjectStatus;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type EmploymentType = "full-time" | "part-time" | "freelance" | "internship" | "education";

export interface Experience {
  id: string;
  role: string; // e.g. "Backend Developer" or "BSc Computer Science"
  organization: string;
  type: EmploymentType;
  location?: string;
  startDate: Date;
  endDate?: Date; // undefined = current
  description: string;
  highlights: string[];
}

export type ContactStatus = "new" | "read" | "replied" | "spam";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
}

// What the homepage needs in one call.
export interface PortfolioOverview {
  profile: Profile;
  skillsByCategory: Record<string, Skill[]>;
  featuredProjects: Project[];
  timeline: Experience[];
  stats: {
    yearsOfExperience: number;
    publishedProjects: number;
    skills: number;
  };
}
