// Tiny web server: serves the portfolio page and the contact-form API. No extra dependencies.
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createBusinessLayer } from "../container.js";
import { DomainError, NotFoundError, RateLimitError, ValidationError } from "../errors/index.js";
import { seedExample } from "../seed.js";
import { renderPage } from "./render.js";

const PORT = Number(process.env.PORT ?? 3000);

const app = createBusinessLayer({
  notifier: {
    // Replace with a real email/Telegram notifier later.
    notify: async (m) => console.log(`📩 New message from ${m.name} <${m.email}>: ${m.message.slice(0, 80)}`),
  },
});
await seedExample(app);

function send(res: ServerResponse, status: number, body: string, type = "text/html; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff" });
  res.end(body);
}
const json = (res: ServerResponse, status: number, data: unknown) => send(res, status, JSON.stringify(data), "application/json");

function readJson(req: IncomingMessage, limit = 20_000): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > limit) { reject(new ValidationError(["request is too large"])); req.destroy(); }
    });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new ValidationError(["invalid JSON"])); } });
    req.on("error", reject);
  });
}

function errorStatus(e: unknown): [number, unknown] {
  if (e instanceof ValidationError) return [400, { error: "Validation failed", issues: e.issues }];
  if (e instanceof NotFoundError) return [404, { error: e.message }];
  if (e instanceof RateLimitError) return [429, { error: e.message }];
  if (e instanceof DomainError) return [409, { error: e.message }];
  console.error(e);
  return [500, { error: "Something went wrong" }];
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  try {
    if (req.method === "GET" && url.pathname === "/") {
      const overview = await app.portfolio.getOverview(4);
      return send(res, 200, renderPage(overview, await app.projects.listPublished()));
    }
    if (req.method === "GET" && url.pathname === "/api/portfolio") return json(res, 200, await app.portfolio.getOverview());
    if (req.method === "GET" && url.pathname.startsWith("/api/projects/"))
      return json(res, 200, await app.projects.getPublishedBySlug(decodeURIComponent(url.pathname.slice(14))));
    if (req.method === "POST" && url.pathname === "/api/contact") {
      const result = await app.contact.submit(await readJson(req));
      return json(res, 201, { ok: true, ...result });
    }
    if (req.method === "GET" && url.pathname === "/health") return json(res, 200, { ok: true });
    return json(res, 404, { error: "Not found" });
  } catch (e) {
    const [status, body] = errorStatus(e);
    return json(res, status, body);
  }
});

server.listen(PORT, () => console.log(`✅ Portfolio running at http://localhost:${PORT}`));
