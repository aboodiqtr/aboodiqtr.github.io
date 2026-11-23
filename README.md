# Dev site business layer

The "brain" behind a personal developer website: everything about **you** (profile, skills, projects, experience) plus the **Contact me** form. No UI here; any frontend or API (Next.js, Express, React, etc.) can sit on top.

## Structure

```
src/
  models/        What things look like: Profile, Skill, Project, Experience, ContactMessage
  errors/        ValidationError, NotFoundError, ConflictError, RateLimitError
  repositories/  Interfaces for saving/loading data + in-memory versions
  services/      The business rules
  container.ts   createBusinessLayer(): wires it all together
  seed.ts        Example content (replace with your real info)
tests/           17 tests covering the rules below
```

## What each service does

| Service | Main methods | Rules |
|---|---|---|
| `profile` | `getProfile`, `updateProfile`, `setAvailability` | name, headline, bio, email required; URLs checked |
| `skills` | `listSkills`, `getSkillsByCategory`, `addSkill`, `updateSkill`, `removeSkill` | no duplicates; sorted strongest first |
| `projects` | `listPublished({tag, tech, search})`, `listFeatured`, `getPublishedBySlug`, `listTags`, `createProject`, `publish`, `archive`, `setFeatured` | auto slug from title; drafts hidden from visitors; needs a description to publish |
| `experience` | `getTimeline`, `getWorkHistory`, `getEducation`, `getTotalYearsOfExperience`, `durationLabel` | current job first; overlapping jobs not double counted |
| `contact` | `submit`, `listInbox`, `unreadCount`, `markRead/Replied/Spam` | validation, 3 messages per email per hour, honeypot + spam words, notifies you (failure never loses the message) |
| `portfolio` | `getOverview()` | everything the homepage needs in one call |

## Use it

```ts
import { createBusinessLayer, seedExample } from "./src/index.js";

const app = createBusinessLayer({
  notifier: { notify: async (m) => console.log("New message from", m.email) },
});
await seedExample(app);

const home = await app.portfolio.getOverview();
await app.contact.submit({ name: "Sara", email: "sara@x.com", message: "Let's work together!" });
```

To use a real database later, write classes that implement the interfaces in `src/repositories/index.ts` and pass them in: `createBusinessLayer({ projects: new PostgresProjectRepository(db) })`. The services don't change.

## Run the website

```
npm install
npm start          # builds, then opens the site at http://localhost:3000
```

The page is rendered from the business layer (`src/web/render.ts`), and the contact form posts to `/api/contact`, which runs `ContactService` (validation, spam check, rate limit). New messages are printed in the terminal.

Other endpoints: `GET /api/portfolio`, `GET /api/projects/:slug`, `GET /health`.

`npm run export` writes a static `site/index.html` you can host anywhere (GitHub Pages, Netlify). In the static version the contact form falls back to your email.

## Commands

```
npm install
npm test         # run the tests
npm run build    # compile to dist/
```
