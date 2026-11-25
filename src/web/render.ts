// Turns the business layer's PortfolioOverview into the HTML page.
// Visual system: Geist only (Geist Mono only inside the code card), Tailwind type scale through named
// text styles, spacing tokens 0/2/4/8/12/16/24/32/40/48/64/80/96, flat backgrounds, one easing curve.
import type { Experience, PortfolioOverview, Profile, Project, Skill } from "../models/index.js";
import { icon, type IconName } from "./icons.js";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const SITE_URL = "https://aboodiqtr.github.io/";
const CATEGORY_ORDER = ["Languages", "Frontend & Mobile", "Backend & Data", "Cloud & Tools"];
const CATEGORY_ICON: Record<string, IconName> = {
  Languages: "brackets-curly",
  "Frontend & Mobile": "device-mobile",
  "Backend & Data": "database",
  "Cloud & Tools": "cloud",
};
const NAV = [
  ["about", "About"],
  ["work", "Work"],
  ["skills", "Skills"],
  ["education", "Education"],
  ["contact", "Contact"],
] as const;

// The tagline reveal, written at meaningful line breaks.
const TAGLINE = ["From the data model", "to the last pixel,", "I own every layer", "of what I ship."];

const label = (t: string) => {
  const s = t.replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const ext = (href: string, text: string, cls = "") =>
  `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${text}${icon("arrow-up-right", "ic ext")}</a>`;

const initials = (p: Profile) => p.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("");
const favicon = (p: Profile) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0a0a0a"/><text x="32" y="42" font-family="Geist,system-ui,sans-serif" font-size="26" font-weight="600" text-anchor="middle" fill="#fff">${initials(p)}</text></svg>`,
  );

function head(p: Profile, title: string, description: string, path = ""): string {
  return `<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${SITE_URL}${path}" />
<link rel="icon" href="${favicon(p)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${SITE_URL}${path}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${SITE_URL}og.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#ffffff" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
<script>document.documentElement.classList.add("js")</script>
<style>${CSS}</style>`;
}

function projectCard(p: Project, i: number): string {
  const cover = p.title.split(/\s[—:-]\s|:/)[0];
  const links = [
    p.liveUrl ? ext(p.liveUrl, "Live demo") : `<a href="#contact">Ask me about it${icon("arrow-right")}</a>`,
    p.repoUrl ? ext(p.repoUrl, "Source code", "quiet") : `<span class="quiet">Private repository</span>`,
  ];
  return `<article class="card project reveal">
    <div class="cover"><span class="caption-4 idx">${String(i + 1).padStart(2, "0")}</span><span class="heading-3 cover-title">${esc(cover)}</span></div>
    <div class="body">
      <p class="caption-1 eyebrow">${esc(p.tags.map(label).join(" · "))}</p>
      <h3 class="heading-5">${esc(p.title)}</h3>
      <p class="body-3 sub">${esc(p.summary)}</p>
      <div class="tags">${p.techStack.slice(0, 5).map((t) => `<span class="caption-4 tag">${esc(t)}</span>`).join("")}</div>
      ${(p.parts ?? []).map(partBlock).join("")}
      <div class="title-4 links">${links.join("")}</div>
    </div>
  </article>`;
}

function partBlock(part: NonNullable<Project["parts"]>[number]): string {
  return `<div class="part">
    <div class="part-head"><span class="caption-4 part-label">${icon("storefront")}Inside this project</span>${part.liveUrl ? ext(part.liveUrl, "Visit store", "btn primary sm button-sm part-link") : ""}</div>
    <strong class="title-2">${esc(part.title)}</strong>
    <p class="body-6 sub">${esc(part.summary)}</p>
    <ul class="body-6 part-points">${(part.highlights ?? []).map((h) => `<li>${icon("check-circle")}${esc(h)}</li>`).join("")}</ul>
    <div class="tags">${part.techStack.map((t) => `<span class="caption-4 tag">${esc(t)}</span>`).join("")}</div>
  </div>`;
}

function skillGroup(name: string, skills: Skill[]): string {
  return `<div class="card skill-group">
    <div class="sg-head"><span class="icon-box">${icon(CATEGORY_ICON[name] ?? "brackets-curly")}</span><h3 class="title-3">${esc(name)}</h3></div>
    <div class="tags">${skills.map((s) => `<span class="caption-4 tag" title="${esc(s.level)}">${esc(s.name)}</span>`).join("")}</div>
  </div>`;
}

function eduEntry(e: Experience, current: boolean): string {
  const years = e.endDate ? `Until ${e.endDate.getFullYear()}` : `${e.startDate.getFullYear()} to present`;
  return `<div class="entry"><span class="marker${current ? " on" : ""}"></span><div>
    <p class="caption-4 quiet">${esc(years)}</p><h3 class="heading-5">${esc(e.organization)}</h3>
    <p class="body-3 sub">${esc(e.role)}</p><p class="body-6 quiet">${esc(e.description)}${e.location ? " · " + esc(e.location) : ""}</p>
  </div></div>`;
}

const sectionHead = (eyebrow: string, title: string, lead?: string) => `<div class="section-head reveal">
    <p class="caption-1 eyebrow">${eyebrow}</p>
    <h2 class="heading-2">${title}</h2>
    ${lead ? `<p class="body-7 lead">${lead}</p>` : ""}
  </div>`;

function nav(p: Profile): string {
  const links = NAV.map(([id, text]) => `<li><a class="title-4" href="#${id}" data-nav="${id}">${text}</a></li>`).join("");
  const menuLinks = NAV.map(
    ([id, text], i) => `<a class="heading-4" href="#${id}" data-nav="${id}" style="--i:${i}">${text}</a>`,
  ).join("");
  return `<header class="nav-shell">
  <nav class="nav" aria-label="Main">
    <a class="logo title-4" href="#top" aria-label="${esc(p.fullName)}, back to top"><span class="mark caption-3">${esc(initials(p))}</span>${esc(p.fullName.split(" ")[0].toLowerCase())}.dev</a>
    <ul class="nav-links">${links}</ul>
    <a class="btn primary sm button-sm nav-cta" href="#contact">Let's talk${icon("arrow-right")}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span></span><span></span></button>
  </nav>
</header>
<div class="menu" id="menu" aria-hidden="true">
  ${menuLinks}
  <a class="btn primary button-md" href="#contact" style="--i:${NAV.length}">Let's talk${icon("arrow-right")}</a>
</div>`;
}

function footer(p: Profile, github: string, linkedin: string): string {
  return `<footer class="wrap footer">
  <hr />
  <div class="footer-row">
    <span class="caption-5 quiet">© ${new Date().getFullYear()} ${esc(p.fullName)} · Designed in Figma, built with care.</span>
    <span class="caption-1 footer-links"><a href="${esc(github)}" target="_blank" rel="noopener">GitHub</a><a href="${esc(linkedin)}" target="_blank" rel="noopener">LinkedIn</a><a href="mailto:${esc(p.email)}">Email</a><a href="#top">Back to top${icon("arrow-up")}</a></span>
  </div>
</footer>`;
}

export function renderPage(o: PortfolioOverview, allProjects: Project[]): string {
  const p = o.profile;
  const link = (platform: string) => p.socialLinks.find((l) => l.platform === platform)?.url ?? SITE_URL;
  const cats = Object.keys(o.skillsByCategory).sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
  );
  const education = o.timeline.filter((e) => e.type === "education");
  const firstName = p.fullName.split(" ")[0];
  const github = link("github");
  const linkedin = link("linkedin");
  let w = 0;
  const tagline = TAGLINE.map((line) =>
    line.split(" ").map((word) => `<span class="w" style="--w:${w++}">${esc(word)}</span>`).join(" "),
  ).join(`<br class="lb" /> `);

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head(p, `${p.fullName} · ${p.headline}`, p.bio)}
</head>
<body class="body-3">
<a class="skip button-sm" href="#main">Skip to content</a>
${nav(p)}

<main id="main">
<section class="hero wrap" id="top">
  <div class="intro">
    ${p.availableForWork ? `<span class="caption-4 badge"><i></i>Open to internships &amp; freelance · ${esc(p.location ?? "")}</span>` : ""}
    <p class="heading-6 hello">Hi, I'm ${esc(p.fullName)} 👋</p>
    <h1 class="heading-1 grad">I build web &amp; mobile<br class="lb" /> products that people<br class="lb" /> actually use.</h1>
    <p class="body-7 lead">${esc(p.bio)}</p>
    <div class="ctas">
      <a class="btn primary button-md" href="#work">See my work${icon("arrow-right")}</a>
      ${p.resumeUrl ? `<a class="btn secondary button-md" href="${esc(p.resumeUrl)}">Download CV${icon("arrow-right")}</a>` : `<a class="btn secondary button-md" href="#contact">Get in touch</a>`}
    </div>
    <div class="caption-1 socials">${ext(github, `${icon("github-logo", "ic lg")}GitHub`)}${ext(linkedin, `${icon("linkedin-logo", "ic lg")}LinkedIn`)}<a href="mailto:${esc(p.email)}">${icon("envelope-simple", "ic lg")}Email</a></div>
  </div>
  <div class="code" role="img" aria-label="A short summary of ${esc(firstName)} written as code">
    <div class="bar"><i></i><i></i><i></i><span>about-me.ts</span></div>
<pre><span class="k">const</span> <span class="w0">${esc(firstName.toLowerCase())}</span> = {
  <span class="g">role:</span> <span class="w0">"${esc(p.headline)}"</span>,
  <span class="g">based:</span> <span class="w0">"${esc(p.location ?? "")}"</span>,
  <span class="g">studying:</span> <span class="w0">"BSc Software Dev @ IAU"</span>,
  <span class="g">stack:</span> <span class="w0">["Node", "Flutter", "React"]</span>,
  <span class="g">shipped:</span> <span class="n">${o.stats.publishedProjects}</span>,
  <span class="g">languages:</span> <span class="w0">[${(p.languages ?? []).map((l) => `"${esc(l.name)}"`).join(", ")}]</span>,
  <span class="g">openToWork:</span> <span class="n">${p.availableForWork}</span>,
};</pre>
  </div>
</section>

<section class="stats wrap reveal" aria-label="Highlights">
  ${(p.highlights ?? []).map((h) => `<div class="card stat"><strong class="heading-2">${esc(h.value)}</strong><span class="body-6 quiet">${esc(h.label.replace(/-/g, " "))}</span></div>`).join("")}
</section>

<section id="about" class="wrap section">
  <div class="about reveal">
    <div><p class="caption-1 eyebrow">About</p><h2 class="heading-2">Turning real problems into clean, working software.</h2></div>
    <div class="about-copy">
      <p class="body-7 lead">I'm a third year Software Development student at Istanbul Aydın University, and I learn by building. I like owning a product from the database to the last pixel: designing the data model, writing the business logic, and shipping an interface people enjoy using.</p>
      <p class="body-7 lead">I work across web, mobile and desktop, and I'm comfortable in multicultural teams, working fluently in Arabic and English.</p>
      <div class="tags">${["Clean architecture", "Double entry accounting", "Realtime apps", "Bilingual RTL and LTR interfaces", "Figma to code"].map((t) => `<span class="caption-1 tag lg">${t}</span>`).join("")}</div>
    </div>
  </div>
</section>

<section class="wrap section tagline" aria-label="How I work">
  <p class="heading-1 tagline-text" data-words>${tagline}</p>
</section>

<section id="work" class="wrap section">
  ${sectionHead("Selected work", "Things I've designed, built and shipped.", `${allProjects.length} products across web, mobile and AI, each built end to end: data model, business logic, API and interface.`)}
  <div class="grid2">${allProjects.map(projectCard).join("")}</div>
</section>

<section id="skills" class="wrap section">
  ${sectionHead("Skills and tools", "My toolbox.", "Strong foundations in OOP, database design and problem solving, applied with a modern, practical stack.")}
  <div class="grid4 reveal">${cats.map((c) => skillGroup(c, o.skillsByCategory[c])).join("")}</div>
  <div class="card strengths reveal"><span class="caption-1 quiet">Core strengths</span><ul class="body-6">${["Full stack web apps", "Cross platform mobile apps", "OOP and clean design", "Database design", "Problem solving", "UI and UX awareness"].map((s) => `<li>${s}</li>`).join("")}</ul></div>
</section>

<section id="education" class="wrap section">
  ${sectionHead("Education and languages", "Always learning.")}
  <div class="edu reveal">
    <div class="card timeline">${education.map((e, i) => eduEntry(e, i === 0)).join("")}</div>
    <div class="card langs"><h3 class="heading-5">Languages</h3>${(p.languages ?? []).map((l) => `<div class="lang"><div><strong class="title-3">${esc(l.name)}</strong><span class="caption-4 quiet">${esc(l.level)}</span></div><div class="track" role="img" aria-label="${esc(l.name)}: ${esc(l.level)}"><b style="transform:scaleX(${Math.max(0, Math.min(100, l.percent)) / 100})"></b></div></div>`).join("")}</div>
  </div>
</section>

<section id="contact" class="wrap section">
  <div class="card contact reveal">
    <div class="pitch">
      <p class="caption-1 eyebrow">Contact</p>
      <h2 class="heading-2">Have a project or a role in mind? Let's talk.</h2>
      <p class="body-7 lead">I'm open to internships, freelance projects and junior roles. I usually reply within a day.</p>
      <dl>
        <dt class="caption-4">Email</dt><dd class="title-4"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></dd>
        <dt class="caption-4">GitHub</dt><dd class="title-4"><a href="${esc(github)}" target="_blank" rel="noopener">${esc(github.replace("https://", ""))}</a></dd>
        <dt class="caption-4">LinkedIn</dt><dd class="title-4"><a href="${esc(linkedin)}" target="_blank" rel="noopener">${esc(linkedin.replace(/^https:\/\/(www\.)?linkedin\.com\//, ""))}</a></dd>
        <dt class="caption-4">Based in</dt><dd class="title-4">${esc(p.location ?? "")}</dd>
      </dl>
    </div>
    <form id="contact-form" class="form" novalidate>
      <div class="field"><label class="caption-1" for="f-name">Name</label><input class="body-3" id="f-name" name="name" autocomplete="name" placeholder="Your name" required maxlength="100" aria-describedby="e-name" /><p class="caption-5 field-err" id="e-name"></p></div>
      <div class="field"><label class="caption-1" for="f-email">Email</label><input class="body-3" id="f-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required aria-describedby="e-email" /><p class="caption-5 field-err" id="e-email"></p></div>
      <div class="field"><label class="caption-1" for="f-message">Message</label><textarea class="body-3" id="f-message" name="message" rows="5" placeholder="Tell me about your project" required minlength="10" maxlength="5000" aria-describedby="e-message"></textarea><p class="caption-5 field-err" id="e-message"></p></div>
      <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <button class="btn primary button-md" type="submit"><span class="btn-label">Send message</span>${icon("arrow-right")}</button>
      <p id="form-status" class="body-6 status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
</main>

${footer(p, github, linkedin)}
<script>${SCRIPT.replace(/__EMAIL__/g, esc(p.email))}</script>
</body>
</html>`;
}

/** A branded 404 page for GitHub Pages (site/404.html). */
export function renderNotFound(p: Profile): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head(p, `Page not found · ${p.fullName}`, "This page does not exist.", "404.html")}
<meta name="robots" content="noindex" />
</head>
<body class="body-3">
<main id="main" class="wrap notfound">
  <span class="mark caption-3">${esc(initials(p))}</span>
  <p class="caption-1 eyebrow">Error 404</p>
  <h1 class="heading-2 grad">This page doesn't exist.</h1>
  <p class="body-7 lead">The link may be old or mistyped. Everything about my work is on the homepage.</p>
  <a class="btn primary button-md" href="/">Back to the homepage${icon("arrow-right")}</a>
</main>
</body>
</html>`;
}

const SCRIPT = `
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu: full height panel, animated toggle, links arrive one after another.
  const btn = document.querySelector(".menu-btn");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("locked", open);
  };
  btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Scroll reveals, once per element.
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Current section in the navigation.
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.dataset.nav === e.target.id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
  }), { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  // Tagline: words light up one at a time, in reading order, as the section scrolls through.
  const tag = document.querySelector("[data-words]");
  const words = [...tag.querySelectorAll(".w")];
  if (reduce) words.forEach((w) => w.classList.add("on"));
  else {
    let lit = 0, ticking = false;
    const update = () => {
      ticking = false;
      const r = tag.getBoundingClientRect(), vh = innerHeight;
      const start = vh * 0.85, end = vh * 0.4;
      const progress = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const n = Math.round(progress * words.length);
      while (lit < n) words[lit++].classList.add("on");
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Contact form: inline validation, a loading state, and an email fallback when there is no backend.
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const rules = {
    name: (v) => v.trim() ? "" : "Please enter your name.",
    email: (v) => !v.trim() ? "Please enter your email." : /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v.trim()) ? "" : "That email doesn't look right. Check for typos.",
    message: (v) => v.trim().length >= 10 ? "" : "Please write at least 10 characters.",
  };
  const check = (field) => {
    const msg = rules[field.name](field.value);
    field.setAttribute("aria-invalid", String(Boolean(msg)));
    document.getElementById("e-" + field.name).textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach((n) => {
    const f = form.elements[n];
    f.addEventListener("blur", () => f.value && check(f));
    f.addEventListener("input", () => f.getAttribute("aria-invalid") === "true" && check(f));
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = Object.keys(rules).map((n) => form.elements[n]);
    const ok = fields.map(check).every(Boolean);
    if (!ok) { fields.find((f) => f.getAttribute("aria-invalid") === "true").focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    const submit = form.querySelector("button");
    const lbl = submit.querySelector(".btn-label");
    submit.disabled = true; submit.classList.add("loading"); lbl.textContent = "Sending message";
    status.className = "body-6 status"; status.textContent = "";
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => null);
      if (!body) throw new Error("no backend");
      if (res.ok) { form.reset(); status.className = "body-6 status ok"; status.textContent = "Message sent. I usually reply within a day."; }
      else { status.className = "body-6 status err"; status.textContent = (body.issues || [body.error || "The message could not be sent. Please try again."]).join(" · "); }
    } catch {
      status.className = "body-6 status err";
      status.innerHTML = 'The contact form is offline right now. Please email me at <a href="mailto:__EMAIL__">__EMAIL__</a>.';
    } finally { submit.disabled = false; submit.classList.remove("loading"); lbl.textContent = "Send message"; }
  });
})();`;

const CSS = `
:root{--bg:#fff;--surface:#f6f6f6;--elev:#ececec;--border:#e3e3e3;--text:#0a0a0a;--text2:#454545;--muted:#737373;
--ease:cubic-bezier(0.22,1,0.36,1);--sans:"Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--sans);-webkit-font-smoothing:antialiased;overflow-x:hidden}
body.locked{overflow:hidden}
ul{list-style:none}
a{color:inherit;text-decoration:none;text-underline-offset:4px}
h1,h2,h3,.heading-1,.heading-2{text-wrap:balance}
p,li,dd{text-wrap:pretty}
:focus-visible{outline:2px solid var(--text);outline-offset:2px;border-radius:4px}
section[id]{scroll-margin-top:96px}

/* Text styles (Tailwind scale) */
.heading-1{font-size:60px;line-height:60px;font-weight:600;letter-spacing:-.04em}
.heading-2{font-size:48px;line-height:48px;font-weight:600;letter-spacing:-.03em}
.heading-3{font-size:36px;line-height:40px;font-weight:600;letter-spacing:-.02em}
.heading-4{font-size:30px;line-height:36px;font-weight:600;letter-spacing:-.02em}
.heading-5{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.01em}
.heading-6{font-size:20px;line-height:28px;font-weight:600}
.title-2{font-size:18px;line-height:28px;font-weight:500}
.title-3{font-size:16px;line-height:24px;font-weight:500}
.title-4{font-size:14px;line-height:20px;font-weight:500}
.body-3{font-size:16px;line-height:24px;font-weight:400}
.body-6{font-size:14px;line-height:20px;font-weight:400}
.body-7{font-size:18px;line-height:28px;font-weight:400}
.button-md{font-size:16px;line-height:24px;font-weight:600}
.button-sm{font-size:14px;line-height:20px;font-weight:600}
.caption-1{font-size:14px;line-height:20px;font-weight:500}
.caption-3{font-size:12px;line-height:16px;font-weight:600}
.caption-4{font-size:12px;line-height:16px;font-weight:500}
.caption-5{font-size:12px;line-height:16px;font-weight:400}

.wrap{max-width:1264px;margin:0 auto;padding-left:32px;padding-right:32px}
.quiet{color:var(--muted)}.sub,.lead{color:var(--text2)}
.eyebrow{color:var(--muted)}
.grad{background:linear-gradient(90deg,#000000,#666666);-webkit-background-clip:text;background-clip:text;color:transparent}
.ic{width:16px;height:16px;flex:none}.ic.lg{width:20px;height:20px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:24px}

/* Buttons and links */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;border-radius:9999px;border:1px solid transparent;cursor:pointer;font-family:inherit;white-space:nowrap;
  transition:transform .5s var(--ease),background-color .3s var(--ease),opacity .3s var(--ease)}
.btn .ic{transition:transform .5s var(--ease)}
.btn:hover{transform:translateY(-2px)}.btn:hover .ic{transform:translateX(2px)}
.btn:active{transform:scale(.98)}
.btn.primary{background:var(--text);color:#fff}.btn.primary:hover{background:#2a2a2a}
.btn.secondary{background:var(--bg);border-color:var(--border);color:var(--text)}.btn.secondary:hover{background:var(--surface)}
.btn:disabled{cursor:progress}
.btn.loading .btn-label{animation:pulse 1.2s var(--ease) infinite}
@keyframes pulse{50%{opacity:.4}}
.links a,.socials a,.footer-links a,dd a{display:inline-flex;align-items:center;gap:4px;transition:opacity .3s var(--ease)}
.links a:hover,.socials a:hover,.footer-links a:hover,dd a:hover{text-decoration:underline}
.links a:active,.socials a:active{transform:translateY(1px)}
.skip{position:fixed;left:16px;top:16px;z-index:100;padding:8px 12px;border-radius:9999px;background:var(--text);color:#fff;transform:translateY(-200%);transition:transform .5s var(--ease)}
.skip:focus{transform:none}

/* Floating navigation */
.nav-shell{position:fixed;top:16px;left:0;right:0;z-index:50;display:flex;justify-content:center;padding:0 16px;pointer-events:none}
.nav{pointer-events:auto;display:flex;align-items:center;gap:24px;padding:8px;border-radius:9999px;border:1px solid rgba(0,0,0,.08);
  background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(16px) saturate(1.5);backdrop-filter:blur(16px) saturate(1.5);box-shadow:0 8px 32px -12px rgba(0,0,0,.18)}
.logo{display:flex;align-items:center;gap:8px;padding-right:8px}
.mark{width:32px;height:32px;border-radius:9999px;background:var(--text);color:#fff;display:inline-grid;place-items:center}
.nav-links{display:flex;gap:4px}
.nav-links a{display:block;padding:8px 12px;border-radius:9999px;color:var(--text2);transition:background-color .3s var(--ease),color .3s var(--ease)}
.nav-links a:hover{background:rgba(0,0,0,.05);color:var(--text)}
.nav-links a[aria-current]{background:var(--text);color:#fff}
.menu-btn{display:none;position:relative;width:40px;height:40px;border-radius:9999px;border:0;background:var(--text);cursor:pointer}
.menu-btn span{position:absolute;left:12px;right:12px;height:2px;border-radius:2px;background:#fff;transition:transform .5s var(--ease)}
.menu-btn span:first-child{transform:translateY(-4px)}.menu-btn span:last-child{transform:translateY(4px)}
.menu-btn[aria-expanded="true"] span:first-child{transform:rotate(45deg)}
.menu-btn[aria-expanded="true"] span:last-child{transform:rotate(-45deg)}
.menu-btn:active{transform:scale(.98)}
.menu{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:16px;padding:96px 24px 48px;
  background:rgba(255,255,255,.94);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);opacity:0;visibility:hidden;transition:opacity .5s var(--ease),visibility 0s .5s}
.menu.open{opacity:1;visibility:visible;transition:opacity .5s var(--ease)}
.menu>a{opacity:0;transform:translateY(24px);transition:opacity .5s var(--ease),transform .5s var(--ease)}
.menu.open>a{opacity:1;transform:none;transition-delay:calc(var(--i) * 60ms)}
.menu>a.heading-4[aria-current]{text-decoration:underline;text-underline-offset:8px}
.menu .btn{margin-top:16px}

/* Hero */
.hero{display:grid;grid-template-columns:minmax(0,680px) minmax(0,1fr);gap:64px;align-items:center;padding-top:96px;padding-bottom:96px}
main{padding-top:64px}
.intro{display:flex;flex-direction:column;gap:24px;max-width:680px}
.hero h1,.hero .lead{max-width:680px}
.badge{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;padding:4px 12px;border:1px solid var(--border);background:var(--surface);border-radius:9999px;color:var(--text2)}
.badge i{width:8px;height:8px;border-radius:9999px;background:var(--text);box-shadow:0 0 0 4px rgba(0,0,0,.08)}
.hello{color:var(--text2)}
.ctas{display:flex;flex-wrap:wrap;gap:12px;padding-top:8px}
.socials{display:flex;flex-wrap:wrap;gap:24px;color:var(--text2)}.socials a{gap:8px}.socials .ext{display:none}
.code{background:#181818;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -24px rgba(0,0,0,.3)}
.code .bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#1f1f1f;font:400 12px/16px var(--mono);color:#7a7a7a}
.code .bar span{margin-left:8px}
.code .bar i{width:12px;height:12px;border-radius:9999px;background:#4a4a4a}.code .bar i:nth-child(2){background:#6a6a6a}.code .bar i:nth-child(3){background:#8a8a8a}
.code pre{padding:24px;font:400 14px/20px var(--mono);color:#7a7a7a;white-space:pre-wrap}
.code .k{color:#c4c4c4}.code .w0{color:#fff}.code .g{color:#9b9b9b}.code .n{color:#c4c4c4}

/* Stats */
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.stat{padding:24px;display:flex;flex-direction:column;gap:8px;border-radius:16px}

/* Sections */
.section{padding-top:96px}
.section-head{display:flex;flex-direction:column;gap:16px;max-width:760px}
.about{display:grid;grid-template-columns:1fr 1fr;gap:64px}.about>div:first-child{display:flex;flex-direction:column;gap:16px}
.about-copy{display:flex;flex-direction:column;gap:24px}
.tags{display:flex;flex-wrap:wrap;gap:8px}
.tag{padding:4px 8px;border-radius:9999px;background:var(--elev);border:1px solid var(--border);color:var(--text2)}
.tag.lg{padding:8px 12px;background:var(--surface)}

/* Tagline reveal */
.tagline{padding-top:96px;padding-bottom:0}
.tagline-text{max-width:680px;margin:0 auto;padding:96px 0;color:var(--text)}
.tagline-text .w{opacity:.3;transition:opacity .5s var(--ease)}
.js .tagline-text .w.on,html:not(.js) .tagline-text .w{opacity:1}

/* Work */
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:48px;align-items:start}
.project{position:relative;overflow:hidden;transition:transform .5s var(--ease)}
.project::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:0 32px 64px -24px rgba(0,0,0,.18);opacity:0;pointer-events:none;transition:opacity .3s var(--ease)}
.project:hover{transform:translateY(-4px)}.project:hover::after{opacity:1}
.cover{height:200px;position:relative;background:var(--elev)}
.cover .idx{position:absolute;left:32px;top:24px;color:var(--muted)}
.cover .cover-title{position:absolute;left:32px;bottom:24px}
.project .body{padding:32px;display:flex;flex-direction:column;gap:16px}
.part{padding:16px;border:1px solid var(--border);border-radius:16px;background:var(--bg);display:flex;flex-direction:column;gap:8px}
.part-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:4px}
.part-label{display:inline-flex;align-items:center;gap:8px;color:var(--muted)}
.part-link{flex:none}
.part-points{display:flex;flex-wrap:wrap;gap:8px 16px;color:var(--text2)}
.part-points li{display:inline-flex;align-items:center;gap:4px}
.part .tags{padding-top:4px}
.links{display:flex;flex-wrap:wrap;gap:24px;padding-top:8px}.links .quiet{color:var(--muted)}

/* Skills */
.grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:48px}
.skill-group{padding:24px;display:flex;flex-direction:column;gap:16px}
.sg-head{display:flex;align-items:center;gap:12px}
.icon-box{width:40px;height:40px;border-radius:12px;background:var(--elev);display:grid;place-items:center}.icon-box .ic{width:20px;height:20px}
.strengths{margin-top:16px;padding:24px;display:flex;flex-wrap:wrap;align-items:center;gap:16px 32px}
.strengths ul{display:flex;flex-wrap:wrap;gap:12px 24px;color:var(--text2)}
.strengths li::before{content:"";display:inline-block;width:6px;height:6px;border-radius:9999px;background:var(--text);margin-right:8px;vertical-align:middle}

/* Education */
.edu{display:grid;grid-template-columns:minmax(0,1fr) 440px;gap:16px;margin-top:48px;align-items:start}
.timeline{padding:32px;display:flex;flex-direction:column;gap:32px}
.entry{display:flex;gap:24px}.entry>div{display:flex;flex-direction:column;gap:4px}
.marker{flex:none;width:12px;height:12px;border-radius:9999px;background:var(--border);margin-top:4px}.marker.on{background:var(--text)}
.langs{padding:32px;display:flex;flex-direction:column;gap:24px}
.lang{display:flex;flex-direction:column;gap:8px}.lang>div:first-child{display:flex;justify-content:space-between;align-items:center}
.track{height:8px;border-radius:9999px;background:var(--elev);overflow:hidden}
.track b{display:block;height:100%;background:var(--text);transform-origin:left center;border-radius:9999px}

/* Contact */
.contact{padding:64px;display:grid;grid-template-columns:minmax(0,1fr) 440px;gap:64px;align-items:center}
.pitch{display:flex;flex-direction:column;gap:16px}
dl{display:grid;grid-template-columns:80px minmax(0,1fr);gap:12px 16px;padding-top:16px}
dt{color:var(--muted);align-self:center}dd{overflow-wrap:anywhere}
.form{background:var(--bg);border:1px solid var(--border);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:16px}
.field{display:flex;flex-direction:column;gap:8px}
.field label{color:var(--text2)}
.form input,.form textarea{font-family:inherit;color:var(--text);background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;resize:vertical;outline:none;
  transition:border-color .3s var(--ease),background-color .3s var(--ease),box-shadow .3s var(--ease)}
.form input:hover,.form textarea:hover{border-color:#cfcfcf}
.form input:focus-visible,.form textarea:focus-visible{border-color:var(--text);background:var(--bg);box-shadow:0 0 0 4px rgba(0,0,0,.08);outline:none}
.form [aria-invalid="true"]{border-color:#b00020}
.field-err{color:#b00020;min-height:16px}.field-err:empty{display:none}
.form .btn{width:100%}
.hp{position:absolute;left:-9999px}
.status{color:var(--text2)}.status:empty{display:none}.status.ok{color:var(--text);font-weight:500}.status.err{color:#b00020}.status a{text-decoration:underline}

/* Footer */
.footer{margin-top:96px;padding-bottom:40px}
.footer hr{height:1px;border:0;background:var(--border);margin-bottom:32px}
.footer-row{display:flex;justify-content:space-between;align-items:center;gap:16px}
.footer-links{display:flex;flex-wrap:wrap;gap:24px;color:var(--text2)}

/* 404 */
.notfound{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:16px;max-width:744px}
.notfound .mark{width:48px;height:48px;margin-bottom:16px}
.notfound .btn{margin-top:16px}

/* Scroll reveals */
.js .reveal{opacity:0;transform:translateY(32px)}
.js .reveal.in{opacity:1;transform:none;transition:opacity .7s var(--ease),transform .7s var(--ease)}

@media (max-width:1100px){
  .hero,.about,.edu,.contact{grid-template-columns:minmax(0,1fr)}
  .grid4{grid-template-columns:repeat(2,minmax(0,1fr))}
  .contact{gap:48px}
}
@media (max-width:860px){
  .nav-links,.nav-cta{display:none}.menu-btn{display:block}
}
@media (max-width:700px){
  .wrap{padding-left:16px;padding-right:16px}
  main{padding-top:48px}.hero{padding-top:64px;padding-bottom:64px;gap:48px}
  .hero h1{font-size:36px;line-height:40px}
  .tagline-text{font-size:36px;line-height:40px;padding:64px 0}
  .heading-2{font-size:30px;line-height:36px}
  .lb{display:none}
  .stats,.grid2,.grid4{grid-template-columns:minmax(0,1fr)}
  .stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .stat .heading-2{font-size:36px;line-height:40px}
  .section{padding-top:80px}.tagline{padding-top:48px}
  .project .body{padding:24px}.cover{height:160px}.cover .idx,.cover .cover-title{left:24px}
  .contact{padding:24px}.timeline,.langs{padding:24px}
  .code pre{overflow-x:auto;white-space:pre;font-size:12px;line-height:16px}
  .part-head{flex-wrap:wrap}
  .footer-row{flex-direction:column;align-items:flex-start}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .js .reveal{transform:none}
  .js .reveal.in{transition:opacity .5s var(--ease)}
  .btn:hover,.project:hover,.btn:hover .ic{transform:none}
  .menu>a{transform:none}
  .btn.loading .btn-label{animation:none}
}
`;
