// Turns the business layer's PortfolioOverview into the HTML page from the Figma design.
import type { Experience, PortfolioOverview, Project, Skill } from "../models/index.js";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const CATEGORY_ORDER = ["Languages", "Frontend & Mobile", "Backend & Data", "Cloud & Tools"];
const CATEGORY_ICON: Record<string, string> = { Languages: "{ }", "Frontend & Mobile": "◧", "Backend & Data": "⛁", "Cloud & Tools": "⚙" };

function projectCard(p: Project, i: number): string {
  const cover = p.title.split(/\s[—:-]\s|:/)[0];
  const category = p.tags.map((t) => t.toUpperCase()).join(" · ");
  const links = [
    p.liveUrl ? `<a href="${esc(p.liveUrl)}" target="_blank" rel="noopener">Live demo ↗</a>` : `<a href="#contact">Ask me about it →</a>`,
    p.repoUrl ? `<a class="muted" href="${esc(p.repoUrl)}" target="_blank" rel="noopener">Source ↗</a>` : `<span class="muted">Private repo</span>`,
  ];
  return `<article class="card project">
    <div class="cover"><span class="idx">${String(i + 1).padStart(2, "0")}</span><span class="cover-title">${esc(cover)}</span></div>
    <div class="body">
      <p class="eyebrow">${esc(category)}</p>
      <h3>${esc(p.title)}</h3>
      <p class="sub">${esc(p.summary)}</p>
      <div class="tags">${p.techStack.slice(0, 5).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="links">${links.join("")}</div>
    </div>
  </article>`;
}

function skillGroup(name: string, skills: Skill[]): string {
  return `<div class="card skill-group">
    <div class="sg-head"><span class="icon">${esc(CATEGORY_ICON[name] ?? "•")}</span><strong>${esc(name)}</strong></div>
    <div class="tags">${skills.map((s) => `<span class="tag" title="${esc(s.level)}">${esc(s.name)}</span>`).join("")}</div>
  </div>`;
}

function eduEntry(e: Experience, current: boolean): string {
  const years = e.endDate ? `Until ${e.endDate.getFullYear()}` : `${e.startDate.getFullYear()} — Present`;
  return `<div class="entry"><span class="marker${current ? " on" : ""}"></span><div>
    <p class="mono">${esc(years)}</p><h3>${esc(e.organization)}</h3>
    <p class="sub">${esc(e.role)}</p><p class="muted">${esc(e.description)}${e.location ? " · " + esc(e.location) : ""}</p>
  </div></div>`;
}

export function renderPage(o: PortfolioOverview, allProjects: Project[]): string {
  const p = o.profile;
  const link = (platform: string) => p.socialLinks.find((l) => l.platform === platform)?.url ?? "#";
  const cats = Object.keys(o.skillsByCategory).sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99),
  );
  const education = o.timeline.filter((e) => e.type === "education");
  const firstName = p.fullName.split(" ")[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(p.fullName)} · ${esc(p.headline)}</title>
<meta name="description" content="${esc(p.bio)}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
<header class="nav wrap">
  <a class="logo" href="#top"><span class="mark">${esc(p.fullName.split(" ").map((w) => w[0]).slice(0, 2).join(""))}</span>${esc(firstName.toLowerCase())}.dev</a>
  <nav><a href="#about">About</a><a href="#work">Work</a><a href="#skills">Skills</a><a href="#education">Education</a><a href="#contact">Contact</a></nav>
  <a class="btn secondary" href="#contact">Let's talk <span>→</span></a>
</header>

<main id="top">
<section class="hero wrap">
  <div class="intro">
    ${p.availableForWork ? `<span class="badge"><i></i>Open to internships &amp; freelance · ${esc(p.location ?? "")}</span>` : ""}
    <p class="hello">Hi, I'm ${esc(p.fullName)} 👋</p>
    <h1>I build web &amp; mobile products that people <u>actually use.</u></h1>
    <p class="lead">${esc(p.bio)}</p>
    <div class="ctas"><a class="btn primary" href="#work">See my work <span>→</span></a>${p.resumeUrl ? `<a class="btn secondary" href="${esc(p.resumeUrl)}">Download CV <span>→</span></a>` : `<a class="btn secondary" href="#contact">Get in touch <span>→</span></a>`}</div>
    <div class="socials"><a href="${esc(link("github"))}" target="_blank" rel="noopener">GitHub ↗</a><a href="${esc(link("linkedin"))}" target="_blank" rel="noopener">LinkedIn ↗</a><a href="mailto:${esc(p.email)}">Email ↗</a></div>
  </div>
  <div class="code">
    <div class="bar"><i></i><i></i><i></i><span>about-me.ts</span></div>
<pre><span class="k">const</span> <span class="w">${esc(firstName.toLowerCase())}</span> = {
  <span class="g">role:</span> <span class="w">"${esc(p.headline)}"</span>,
  <span class="g">based:</span> <span class="w">"${esc(p.location ?? "")}"</span>,
  <span class="g">studying:</span> <span class="w">"BSc Software Dev @ IAU"</span>,
  <span class="g">stack:</span> <span class="w">["Node", "Flutter", "React"]</span>,
  <span class="g">shipped:</span> <span class="n">${o.stats.publishedProjects}</span>,
  <span class="g">languages:</span> <span class="w">[${(p.languages ?? []).map((l) => `"${esc(l.name)}"`).join(", ")}]</span>,
  <span class="g">openToWork:</span> <span class="n">${p.availableForWork}</span>,
};</pre>
  </div>
</section>

<section class="stats wrap">
  ${(p.highlights ?? []).map((h) => `<div class="card stat"><strong>${esc(h.value)}</strong><span>${esc(h.label)}</span></div>`).join("")}
</section>

<section id="about" class="wrap section about">
  <div><p class="eyebrow">01 — ABOUT</p><h2>Turning real problems into clean, working software.</h2></div>
  <div>
    <p class="lead">I'm a third-year Software Development student at Istanbul Aydın University and a hands-on builder. I like owning a product from the database to the last pixel: designing the data model, writing the business logic, and shipping an interface people enjoy using.</p>
    <p class="lead">I work across web, mobile and desktop, and I'm comfortable in multicultural teams, working fluently in Arabic and English.</p>
    <div class="tags pills">${["Clean architecture", "Double-entry accounting", "Real-time apps", "Bilingual RTL / LTR UIs", "Figma → code"].map((t) => `<span class="tag">${t}</span>`).join("")}</div>
  </div>
</section>

<section id="work" class="wrap section">
  <p class="eyebrow">02 — SELECTED WORK</p>
  <h2>Things I've designed, built and shipped.</h2>
  <p class="lead narrow">${allProjects.length} products across web, mobile and AI, each built end to end: data model, business logic, API and interface.</p>
  <div class="grid2">${allProjects.map(projectCard).join("")}</div>
</section>

<section id="skills" class="wrap section">
  <p class="eyebrow">03 — SKILLS &amp; TOOLS</p>
  <h2>My toolbox.</h2>
  <p class="lead narrow">Strong foundations in OOP, database design and problem solving, applied with a modern, practical stack.</p>
  <div class="grid4">${cats.map((c) => skillGroup(c, o.skillsByCategory[c])).join("")}</div>
  <div class="card strengths"><span class="mono muted">Core strengths</span>${["Full-stack web apps", "Cross-platform mobile", "OOP &amp; clean design", "Database design", "Problem solving", "UI / UX awareness"].map((s) => `<span><i></i>${s}</span>`).join("")}</div>
</section>

<section id="education" class="wrap section">
  <p class="eyebrow">04 — EDUCATION &amp; LANGUAGES</p>
  <h2>Always learning.</h2>
  <div class="edu">
    <div class="card timeline">${education.map((e, i) => eduEntry(e, i === 0)).join("")}</div>
    <div class="card langs"><h3>Languages</h3>${(p.languages ?? []).map((l) => `<div class="lang"><div><strong>${esc(l.name)}</strong><span class="mono muted">${esc(l.level)}</span></div><div class="track"><b style="width:${Math.max(0, Math.min(100, l.percent))}%"></b></div></div>`).join("")}</div>
  </div>
</section>

<section id="contact" class="wrap section">
  <div class="card contact">
    <div class="pitch">
      <p class="eyebrow">05 — CONTACT</p>
      <h2>Have a project or a role in mind? Let's talk.</h2>
      <p class="lead">I'm open to internships, freelance projects and junior roles. I usually reply within a day.</p>
      <dl>
        <dt>EMAIL</dt><dd><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></dd>
        <dt>GITHUB</dt><dd><a href="${esc(link("github"))}" target="_blank" rel="noopener">${esc(link("github").replace("https://", ""))}</a></dd>
        <dt>LINKEDIN</dt><dd><a href="${esc(link("linkedin"))}" target="_blank" rel="noopener">${esc(link("linkedin").replace(/^https:\/\/(www\.)?linkedin\.com\//, ""))}</a></dd>
        <dt>BASED IN</dt><dd>${esc(p.location ?? "")}</dd>
      </dl>
    </div>
    <form id="contact-form" class="form" novalidate>
      <label>Name<input name="name" placeholder="Your name" required maxlength="100" /></label>
      <label>Email<input name="email" type="email" placeholder="you@company.com" required /></label>
      <label>Message<textarea name="message" rows="5" placeholder="Tell me about your project…" required></textarea></label>
      <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <button class="btn primary" type="submit">Send message <span>→</span></button>
      <p id="form-status" class="status" role="status"></p>
    </form>
  </div>
</section>
</main>

<footer class="wrap footer">
  <span>© ${new Date().getFullYear()} ${esc(p.fullName)} · Designed in Figma, built with care.</span>
  <span><a href="${esc(link("github"))}">GitHub</a><a href="${esc(link("linkedin"))}">LinkedIn</a><a href="mailto:${esc(p.email)}">Email</a><a href="#top">Back to top ↑</a></span>
</footer>
<script>${SCRIPT.replace("__EMAIL__", esc(p.email))}</script>
</body>
</html>`;
}

const SCRIPT = `
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const btn = form.querySelector("button");
  btn.disabled = true; status.className = "status"; status.textContent = "Sending…";
  try {
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const body = await res.json().catch(() => null);
    if (!body) throw new Error("no backend");
    if (res.ok) { form.reset(); status.className = "status ok"; status.textContent = "Thanks! Your message was sent. I'll get back to you soon."; }
    else { status.className = "status err"; status.textContent = (body.issues || [body.error || "Something went wrong"]).join(" · "); }
  } catch {
    status.className = "status err";
    status.innerHTML = 'The contact form is offline right now. Please email me at <a href="mailto:__EMAIL__">__EMAIL__</a>.';
  } finally { btn.disabled = false; }
});`;

const CSS = `
:root{--bg:#fff;--surface:#f6f6f6;--elev:#ececec;--border:#e3e3e3;--text:#0a0a0a;--text2:#454545;--muted:#8c8c8c;--r-md:14px;--r-lg:24px;
--sans:"Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font:16px/1.55 var(--sans);-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:3px}
.wrap{max-width:1440px;margin:0 auto;padding-left:120px;padding-right:120px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg)}
.eyebrow{font:500 13px/1.4 var(--mono);letter-spacing:.08em;color:var(--text);margin-bottom:16px}
.mono{font:400 12px/1.4 var(--mono)}.muted{color:var(--muted)}.sub{color:var(--text2)}
h1{font-size:84px;line-height:1;letter-spacing:-.04em;font-weight:700}
h1 u{text-decoration-thickness:6px;text-underline-offset:10px}
h2{font-size:48px;line-height:1.1;letter-spacing:-.03em;font-weight:600}
h3{font-size:24px;line-height:1.25;letter-spacing:-.01em;font-weight:600}
.lead{font-size:20px;line-height:1.55;color:var(--text2)}.narrow{max-width:720px;margin-top:16px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 22px;border-radius:999px;font:500 15px/1.4 var(--sans);border:1px solid transparent;cursor:pointer;transition:transform .15s,opacity .15s}
.btn:hover{text-decoration:none;transform:translateY(-1px)}.btn:disabled{opacity:.6;cursor:wait}
.btn.primary{background:var(--text);color:#fff}.btn.secondary{background:var(--surface);border-color:var(--border);color:var(--text)}
.nav{display:flex;align-items:center;justify-content:space-between;padding-top:28px;padding-bottom:28px;position:sticky;top:0;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);z-index:10}
.logo{display:flex;align-items:center;gap:10px;font-weight:500;font-size:15px}
.mark{width:36px;height:36px;border-radius:var(--r-md);background:var(--text);color:#fff;display:grid;place-items:center;font:500 15px var(--mono)}
.nav nav{display:flex;gap:36px;font-weight:500;font-size:15px;color:var(--text2)}
.hero{display:grid;grid-template-columns:660px 1fr;gap:64px;align-items:center;padding-top:96px;padding-bottom:96px}
.intro{display:flex;flex-direction:column;gap:28px}
.badge{align-self:flex-start;display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border:1px solid var(--border);background:var(--surface);border-radius:999px;font:400 12px var(--mono);color:var(--text2)}
.badge i{width:8px;height:8px;border-radius:50%;background:var(--text);box-shadow:0 0 0 4px rgba(0,0,0,.08)}
.hello{font-size:24px;font-weight:600;color:var(--text2)}.ctas{display:flex;gap:12px}
.socials{display:flex;gap:24px;font:400 12px var(--mono);color:var(--muted);padding-top:8px}
.code{background:#0a0a0a;border-radius:var(--r-lg);overflow:hidden;box-shadow:0 40px 80px -20px rgba(0,0,0,.25)}
.code .bar{display:flex;align-items:center;gap:8px;padding:16px 20px;background:#1a1a1a;font:400 12px var(--mono);color:#6b6b6b}
.code .bar i{width:11px;height:11px;border-radius:50%;background:#5a5a5a}.code .bar i:nth-child(2){background:#7a7a7a}.code .bar i:nth-child(3){background:#9a9a9a}
.code pre{padding:24px 28px 28px;font:400 15px/1.9 var(--mono);color:#6b6b6b;white-space:pre-wrap}
.code .k{color:#bdbdbd}.code .w{color:#fff}.code .g{color:#9a9a9a}.code .n{color:#bdbdbd}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.stat{padding:24px 28px;display:flex;flex-direction:column;gap:6px;border-radius:var(--r-md)}.stat strong{font-size:48px;font-weight:600;letter-spacing:-.03em;line-height:1.1}.stat span{color:var(--muted)}
.section{padding-top:120px}
.about{display:grid;grid-template-columns:1fr 1fr;gap:80px}.about>div:last-child{display:flex;flex-direction:column;gap:20px}
.tags{display:flex;flex-wrap:wrap;gap:8px}.tag{padding:5px 10px;border-radius:999px;background:var(--elev);border:1px solid var(--border);font:400 12px var(--mono);color:var(--text2)}
.pills .tag{padding:8px 14px;background:var(--surface)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px}
.project{overflow:hidden;box-shadow:0 24px 48px -12px rgba(0,0,0,.08);transition:transform .2s,box-shadow .2s}
.project:hover{transform:translateY(-4px);box-shadow:0 32px 60px -16px rgba(0,0,0,.14)}
.cover{height:220px;position:relative;background:linear-gradient(150deg,rgba(0,0,0,.10),rgba(0,0,0,0)) ,#f2f2f2}
.cover .idx{position:absolute;left:32px;top:28px;font:500 13px var(--mono);letter-spacing:.08em;color:var(--muted)}
.cover .cover-title{position:absolute;left:32px;bottom:22px;font-size:40px;font-weight:600;letter-spacing:-.02em}
.project .body{padding:28px 32px 32px;display:flex;flex-direction:column;gap:14px}.project .body .eyebrow{margin:0}
.links{display:flex;gap:20px;padding-top:6px;font-weight:500;font-size:15px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}
.skill-group{padding:24px;display:flex;flex-direction:column;gap:16px}.sg-head{display:flex;align-items:center;gap:10px;font-size:15px}
.icon{width:36px;height:36px;border-radius:var(--r-md);background:var(--elev);display:grid;place-items:center;font:400 12px var(--mono)}
.strengths{margin-top:16px;padding:28px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px 20px;color:var(--text2)}
.strengths i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--text);margin-right:8px;vertical-align:middle}
.edu{display:grid;grid-template-columns:1fr 440px;gap:16px;margin-top:48px;align-items:start}
.timeline{padding:32px;display:flex;flex-direction:column;gap:28px}.entry{display:flex;gap:20px}.entry>div{display:flex;flex-direction:column;gap:6px}
.marker{flex:none;width:12px;height:12px;border-radius:50%;background:var(--muted);margin-top:6px}.marker.on{background:var(--text)}
.langs{padding:32px;display:flex;flex-direction:column;gap:22px}.lang{display:flex;flex-direction:column;gap:10px}.lang>div:first-child{display:flex;justify-content:space-between;font-size:15px}
.track{height:6px;border-radius:3px;background:var(--elev)}.track b{display:block;height:100%;border-radius:3px;background:var(--text)}
.contact{padding:64px;display:grid;grid-template-columns:1fr 460px;gap:64px;align-items:center}
.pitch{display:flex;flex-direction:column;gap:20px}.pitch .eyebrow{margin:0}
dl{display:grid;grid-template-columns:80px 1fr;gap:12px 16px;padding-top:8px}dt{font:400 12px var(--mono);color:var(--muted);align-self:center}dd{font-weight:500;font-size:15px}
.form{background:var(--bg);border:1px solid var(--border);border-radius:var(--r-lg);padding:28px;display:flex;flex-direction:column;gap:14px}
.form label{display:flex;flex-direction:column;gap:8px;font:400 12px var(--mono);color:var(--muted)}
.form input,.form textarea{font:16px var(--sans);color:var(--text);background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:13px 14px;resize:vertical;outline:none}
.form input:focus,.form textarea:focus{border-color:var(--text)}
.form .btn{justify-content:center}.hp{position:absolute;left:-9999px}
.status{font-size:14px;min-height:20px;color:var(--text2)}.status.ok{color:#0a0a0a;font-weight:500}.status.err{color:#b00020}
.footer{display:flex;justify-content:space-between;padding-top:32px;padding-bottom:40px;margin-top:120px;border-top:1px solid var(--border);font:400 12px var(--mono);color:var(--muted)}
.footer span:last-child{display:flex;gap:24px;color:var(--text2)}
@media (max-width:1100px){.wrap{padding-left:32px;padding-right:32px}.hero,.about,.edu,.contact{grid-template-columns:1fr}.grid4{grid-template-columns:1fr 1fr}.nav nav{display:none}h1{font-size:60px}}
@media (max-width:700px){.hero>*,.about>*,.edu>*,.contact>*{min-width:0}.ctas{flex-wrap:wrap}.code pre{overflow-x:auto;white-space:pre}.nav .btn{padding:10px 14px}dl{grid-template-columns:70px 1fr}dd{overflow-wrap:anywhere}.footer span:last-child{flex-wrap:wrap}.wrap{padding-left:20px;padding-right:20px}.grid2,.grid4,.stats{grid-template-columns:1fr}h1{font-size:44px}h2{font-size:34px}.hero{padding-top:48px}.contact{padding:28px}.footer{flex-direction:column;gap:16px}.code pre{font-size:13px}}
`;
