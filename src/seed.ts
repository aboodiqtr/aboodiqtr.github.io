// Real content for Abdulrahman's site, taken from the GitHub profile README and repositories.
// Edit freely: this is the only file you need to touch to change what the site says.
import type { BusinessLayer } from "./container.js";
import type { SkillLevel } from "./models/index.js";

export async function seedExample(app: BusinessLayer): Promise<void> {
  await app.profile.updateProfile({
    fullName: "Abdulrahman Yahya",
    headline: "Full-Stack & Mobile Developer",
    bio:
      "Software Development student at Istanbul Aydın University (3rd year, GPA 3.31) who ships real products: " +
      "a double-entry accounting & POS system, a cross-platform budget app, an AI assistant and a habit-to-savings tracker. " +
      "I care about clean architecture, user-centered interfaces and solving real problems. Fluent in Arabic and English.",
    location: "Istanbul, Turkey / Doha, Qatar",
    email: "abdulrahman.sharafaddin1@gmail.com",
    availableForWork: true,
    highlights: [
      { value: "4", label: "Products shipped end-to-end" },
      { value: "3.31", label: "University GPA · IAU" },
      { value: "97.81%", label: "High school grade · Distinction" },
      { value: "3", label: "Languages · AR, EN, TR" },
    ],
    languages: [
      { name: "Arabic", level: "Native", percent: 100 },
      { name: "English", level: "Professional", percent: 80 },
      { name: "Turkish", level: "A1 · Certified", percent: 20 },
    ],
    socialLinks: [
      { platform: "github", url: "https://github.com/aboodiqtr" },
      { platform: "linkedin", url: "https://www.linkedin.com/in/abdulrahman-yahya-mohammed-s" },
      { platform: "email", url: "mailto:abdulrahman.sharafaddin1@gmail.com" },
    ],
  });

  const skills: [string, string, SkillLevel][] = [
    ["JavaScript", "Languages", "advanced"],
    ["Dart", "Languages", "advanced"],
    ["C#", "Languages", "intermediate"],
    ["Python", "Languages", "intermediate"],
    ["Java", "Languages", "intermediate"],
    ["C", "Languages", "intermediate"],
    ["React", "Frontend & Mobile", "advanced"],
    ["Next.js", "Frontend & Mobile", "intermediate"],
    ["Angular", "Frontend & Mobile", "intermediate"],
    ["Tailwind / Bootstrap", "Frontend & Mobile", "advanced"],
    ["Flutter", "Frontend & Mobile", "advanced"],
    ["React Native (Expo)", "Frontend & Mobile", "intermediate"],
    ["Node.js / Express", "Backend & Data", "advanced"],
    [".NET", "Backend & Data", "intermediate"],
    ["FastAPI / Flask", "Backend & Data", "intermediate"],
    ["Socket.IO", "Backend & Data", "intermediate"],
    ["PostgreSQL / Supabase", "Backend & Data", "advanced"],
    ["MySQL", "Backend & Data", "advanced"],
    ["Firebase", "Backend & Data", "intermediate"],
    ["Docker", "Cloud & Tools", "intermediate"],
    ["AWS / Azure / GCP", "Cloud & Tools", "beginner"],
    ["Render / Cloudflare", "Cloud & Tools", "intermediate"],
    ["Sentry", "Cloud & Tools", "intermediate"],
    ["Git & GitHub", "Cloud & Tools", "advanced"],
    ["Figma", "Cloud & Tools", "intermediate"],
    ["Jira", "Cloud & Tools", "intermediate"],
  ];
  for (const [name, category, level] of skills) await app.skills.addSkill({ name, category, level });

  const projects = [
    {
      title: "COSMALINE — Accounting, Inventory & POS",
      slug: "cosmaline",
      priority: 1,
      summary: "Full-stack POS, inventory and accounting system for a cosmetics business, plus its own online store. A double-entry engine auto-posts every sale and expense into the ledger and financial statements. Barcode POS, stock alerts, payment gateways, roles, Arabic/English.",
      description:
        "Every sale or expense posts an automatic journal entry. Includes chart of accounts, ledger, trial balance, " +
        "income statement and balance sheet, receivables, role-based access (admin, accountant, cashier, warehouse), " +
        "barcode/camera scanning, card-payment settlement flow, full Arabic (RTL) / English (LTR) UI and Sentry monitoring. " +
        "Payment gateways: Moyasar, PayTabs, MyFatoorah. Migrated SQLite → MySQL → PostgreSQL with full end-to-end testing at each step.",
      techStack: ["Node.js", "Express", "PostgreSQL", "JWT", "Docker", "Sentry"],
      tags: ["web", "business", "fintech"],
      parts: [
        {
          title: "COSMALINE Online Store",
          summary:
            "Bilingual storefront connected to the system: live stock, card and Apple Pay checkout, automatic invoices, order tracking and order stages managed from the dashboard.",
          techStack: ["HTML/CSS/JS", "Cloudflare Pages", "PayTabs", "Apple Pay"],
          liveUrl: "https://cosmaline-qa.pages.dev",
          highlights: ["Live stock", "Card & Apple Pay", "Order tracking", "Arabic / English"],
        },
      ],
      featured: true,
    },
    {
      title: "Mizaniyati — Budget & Expense Tracker",
      slug: "mizaniyati",
      priority: 2,
      summary: "Cross-platform budget app (Android, iOS, Web) for income, expenses, savings goals and subscriptions. Imports bank statements and bank SMS with automatic categorization. Real-time Firebase sync, multi-currency, bilingual, designed in Figma.",
      description:
        "Flutter app with Google, phone (SMS code) and email sign-in, Firebase cloud sync, multi-country and multi-currency " +
        "support, importing expenses from bank statements and bank SMS, bilingual Arabic/English UI. Designed in Figma.",
      techStack: ["Flutter", "Dart", "Firestore", "Figma"],
      tags: ["mobile", "fintech"],
      featured: true,
    },
    {
      title: "Islamic AI Assistant",
      slug: "islamic-ai-assistant",
      priority: 3,
      summary: "AI-powered platform that answers Islamic jurisprudence questions by retrieving from trusted fatwa sources (IslamWeb, Sheikh Ibn Baz). Avatar-based chat UI, Google / Apple / email sign-in, and a clear disclaimer to verify the source.",
      description:
        "Retrieves answers from established sources such as IslamWeb and Ibn Baz instead of generating freely, " +
        "with Google, Apple and email sign-in, a clean chat UI and a clear 'always check the original source' disclaimer.",
      techStack: ["Python", "LLM", "HTML/CSS", "Render"],
      tags: ["ai", "web"],
      liveUrl: "https://islamic-ai-assistant-2.onrender.com/",
      featured: true,
    },
    {
      title: "iTrack — Habit & Savings Tracker",
      slug: "itrack",
      priority: 4,
      summary: "Turns self-discipline into savings: every successful habit adds a monetary reward to a growing balance. Streaks, a financial feedback loop and community accountability with real-time chat.",
      description:
        "Client-server system: React Native (Expo) mobile app and React + Vite + Tailwind web app (packaged with " +
        "Capacitor and Electron), Node.js/Express REST API with JWT auth, Socket.IO real-time messaging and MySQL.",
      techStack: ["React Native", "React", "Node.js", "Socket.IO", "MySQL", "JWT"],
      tags: ["mobile", "fintech", "real-time"],
      repoUrl: "https://github.com/aboodiqtr/Smart-Habit-Tracker-Discipline-System",
      featured: false,
    },
  ];
  for (const p of projects) {
    const created = await app.projects.createProject(p);
    await app.projects.publish(created.id);
  }

  await app.experience.addExperience({
    role: "BSc Software Development",
    organization: "Istanbul Aydın University",
    type: "education",
    location: "Istanbul, Turkey / Doha, Qatar",
    startDate: new Date("2023-09-01"),
    description: "Currently in 3rd year. Cumulative GPA 3.31 / 4.00.",
    highlights: ["OOP & software design", "Database design", "Web & mobile development"],
  });

  await app.experience.addExperience({
    role: "Primary, Preparatory & Secondary Education",
    organization: "Government Schools of Qatar",
    type: "education",
    location: "Qatar",
    startDate: new Date("2010-09-01"),
    endDate: new Date("2023-06-01"),
    description: "Final grade 97.81% (Distinction).",
    highlights: [],
  });
}
