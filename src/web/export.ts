// Writes the page as a single static file (site/index.html), e.g. for GitHub Pages or a quick preview.
import { mkdirSync, writeFileSync } from "node:fs";
import { createBusinessLayer } from "../container.js";
import { seedExample } from "../seed.js";
import { renderNotFound, renderPage } from "./render.js";

const app = createBusinessLayer();
await seedExample(app);
mkdirSync("site", { recursive: true });
writeFileSync("site/index.html", renderPage(await app.portfolio.getOverview(4), await app.projects.listPublished()));
writeFileSync("site/404.html", renderNotFound((await app.portfolio.getOverview()).profile));
console.log("Wrote site/index.html and site/404.html");
