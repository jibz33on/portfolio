# Case Study Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended for Tasks 1-2) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Tasks 3-5 each open with a live one-question-at-a-time interview with the user — see the note in Global Constraints before dispatching those as opaque subagent tasks.**

**Goal:** Add dedicated case-study pages for the 3 flagship projects (Revenue Recovery Engine, RemiMinder, MindGym), linked from the existing homepage cards, without changing the homepage's look.

**Architecture:** Extract the homepage's inline CSS into a shared `styles.css` so case-study pages can reuse it byte-for-byte. Add a second shared `case-study.css` for the handful of rules unique to the long-form article layout (breadcrumb, prose spacing, architecture-diagram boxes). Each case-study page is a static HTML file under `case-studies/`, following a fixed 10-section structure, linking both CSS files. No JS framework, no build step — matches the rest of the repo.

**Tech Stack:** Plain HTML + CSS (no new dependencies). Same fonts already loaded (Inter, Syne via Google Fonts).

## Global Constraints

- Voice: direct, technical, honest, specific. No buzzwords (innovative, cutting-edge, leveraged, results-driven, world-class, seamless, revolutionized, "robust solution"). Source: design spec.
- No invented metrics, responsibilities, or outcomes anywhere in case-study content. Source: design spec / user instruction.
- Homepage (`index.html`) changes are limited to (a) inline `<style>` → `<link href="styles.css">`, and (b) one `<a class="project-link">` text/href swap per flagship card. Nothing else on the homepage may change. Source: design spec.
- No diagram library (mermaid, etc.) — architecture diagrams are plain HTML/CSS. Source: design spec.
- **Tasks 3, 4, 5 each require a live, adaptive, one-question-at-a-time interview with the user for the Challenges & Trade-offs and Reflection sections before those sections can be drafted.** This plan intentionally does not pre-write that content — it cannot be, per explicit user instruction ("don't draft any section until you have enough information from me"). If executing via subagent-driven-development, the dispatching agent (not a stateless fresh subagent) should conduct these interviews directly with the user, then hand the gathered answers to whichever process drafts the file.
- Every case study must be unique enough that removing the project name wouldn't leave it ambiguous which project it describes. Source: design spec.

---

## Task 1: Extract shared styles.css and switch index.html to link it

**Files:**
- Create: `styles.css`
- Modify: `index.html:8-244` (replace inline `<style>...</style>` with a `<link>`)

**Interfaces:**
- Produces: `styles.css`, containing every CSS rule and custom property (`--bg`, `--surface`, `--surface2`, `--border`, `--border-subtle`, `--blue`, `--green`, `--muted`, `--text`, `--text-dim`) currently inline in `index.html`. Tasks 2-5 depend on these custom properties being available via this file.

- [ ] **Step 1: Create `styles.css` with the extracted content**

Copy the full contents currently between `<style>` and `</style>` in `index.html` (lines 9-243) verbatim into a new file `styles.css`:

```css
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d1117;
  --surface:#161b22;
  --surface2:#21262d;
  --border:#21262d;
  --border-subtle:#30363d;
  --blue:#58a6ff;
  --green:#3fb950;
  --muted:#8b949e;
  --text:#e6edf3;
  --text-dim:#c9d1d9;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.6;overflow-x:hidden}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border-subtle);border-radius:2px}

/* NAV */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 2.5rem;height:56px;
  background:rgba(13,17,23,.85);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border)
}
.nav-logo{font-family:'Syne',sans-serif;font-size:.95rem;font-weight:700;color:var(--text);letter-spacing:-.01em}
.nav-logo span{color:var(--blue)}
.nav-links{display:flex;gap:2.5rem;list-style:none}
.nav-links a{font-size:.8rem;font-weight:500;color:var(--muted);text-decoration:none;transition:color .2s;letter-spacing:.01em}
.nav-links a:hover{color:var(--text)}

/* HERO */
.hero{
  min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding:7rem 2.5rem 5rem;max-width:900px;margin:0 auto
}
.hero-eyebrow{
  font-size:.8rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;
  color:var(--blue);margin-bottom:1.75rem;
  opacity:0;animation:fadeUp .6s .2s forwards
}
.hero-name{
  font-family:'Syne',sans-serif;
  font-size:clamp(3rem,8vw,6rem);font-weight:800;line-height:1;
  letter-spacing:-.04em;margin-bottom:1.25rem;
  opacity:0;animation:fadeUp .6s .3s forwards
}
.hero-name span{color:var(--blue)}
.hero-tagline{
  font-size:1.5rem;font-weight:400;color:var(--text-dim);
  max-width:560px;margin-bottom:1.5rem;line-height:1.5;
  opacity:0;animation:fadeUp .6s .4s forwards
}
.hero-tagline em{color:var(--blue);font-style:normal;font-weight:500}
.hero-support{
  font-size:.95rem;font-weight:400;color:var(--muted);
  max-width:540px;margin-bottom:2.75rem;line-height:1.7;
  opacity:0;animation:fadeUp .6s .5s forwards
}
.hero-ctas{
  display:flex;flex-wrap:wrap;gap:.75rem;
  opacity:0;animation:fadeUp .6s .6s forwards
}
.btn-primary{
  padding:.7rem 1.6rem;background:var(--blue);color:#0d1117;
  font-size:.8rem;font-weight:600;letter-spacing:.01em;
  text-decoration:none;border:none;cursor:pointer;border-radius:6px;
  transition:background .2s,transform .15s
}
.btn-primary:hover{background:#79b8ff;transform:translateY(-1px)}
.btn-ghost{
  padding:.7rem 1.6rem;background:transparent;color:var(--text-dim);
  font-size:.8rem;font-weight:500;letter-spacing:.01em;
  text-decoration:none;border:1px solid var(--border-subtle);cursor:pointer;border-radius:6px;
  transition:border-color .2s,color .2s
}
.btn-ghost:hover{border-color:var(--blue);color:var(--blue)}
.hero-meta{
  margin-top:3.5rem;font-size:.75rem;font-weight:400;color:var(--muted);
  opacity:0;animation:fadeUp .6s .7s forwards
}

/* SECTION LAYOUT */
section{max-width:1100px;margin:0 auto;padding:5.5rem 2.5rem}
.section-header{display:flex;align-items:center;gap:1.25rem;margin-bottom:3.5rem}
.section-num{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);font-family:'Inter',sans-serif}
.section-title{font-family:'Syne',sans-serif;font-size:1.85rem;font-weight:800;letter-spacing:-.02em}
.section-line{flex:1;height:1px;background:var(--border)}

/* FEATURED PROJECTS */
.featured-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);margin-bottom:1px;
  border-radius:10px;overflow:hidden
}
.project-featured{
  background:var(--surface);padding:2rem;
  display:flex;flex-direction:column;gap:1rem;
  transition:background .2s;position:relative;overflow:hidden
}
.project-featured::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--blue);transform:scaleX(0);transform-origin:left;transition:transform .35s
}
.project-featured:hover{background:var(--surface2)}
.project-featured:hover::before{transform:scaleX(1)}
.project-meta{display:flex;justify-content:space-between;align-items:center}
.project-domain{font-size:.7rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.prod-badge{display:flex;align-items:center;gap:.4rem;font-size:.65rem;font-weight:600;color:var(--green);letter-spacing:.06em;text-transform:uppercase}
.prod-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
.prod-badge.status-deployed{color:var(--muted)}
.prod-badge.status-deployed .prod-dot{background:var(--muted);animation:none}
.role-badge{font-size:.7rem;font-weight:500;color:var(--blue);letter-spacing:.02em}
.project-name{font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;letter-spacing:-.01em;color:var(--text)}
.project-desc{font-size:.875rem;color:var(--muted);line-height:1.7;flex:1}
.project-desc strong{color:var(--text-dim);font-weight:500}
.tech-badges{display:flex;flex-wrap:wrap;gap:.35rem}
.badge{font-family:'Inter',sans-serif;font-size:.65rem;font-weight:500;padding:.2rem .55rem;background:var(--surface2);color:var(--muted);border:1px solid var(--border-subtle);border-radius:4px}
.project-featured:hover .badge{border-color:rgba(88,166,255,.25);color:var(--text-dim)}
.project-link{
  font-size:.75rem;font-weight:500;color:var(--muted);text-decoration:none;
  display:flex;align-items:center;gap:.3rem;margin-top:.5rem;transition:color .2s
}
.project-link:hover{color:var(--blue)}
.project-link::after{content:'↗';font-size:.7rem}

/* SMALL PROJECT GRID */
.small-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);border-top:none;
  border-radius:0 0 10px 10px;overflow:hidden
}
.project-small{
  background:var(--surface);padding:1.75rem;
  display:flex;flex-direction:column;gap:.75rem;
  transition:background .2s;position:relative;overflow:hidden
}
.project-small::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--blue);transform:scaleX(0);transform-origin:left;transition:transform .35s
}
.project-small:hover{background:var(--surface2)}
.project-small:hover::before{transform:scaleX(1)}
.project-small .project-name{font-size:1.05rem}
.project-small .project-desc{font-size:.8rem}
.project-small .badge{font-size:.6rem}

/* STACK */
.stack-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);
  border-radius:10px;overflow:hidden
}
.stack-col{background:var(--surface);padding:2rem}
.stack-col-header{display:flex;align-items:center;gap:.75rem;margin-bottom:1.75rem}
.stack-col-icon{font-size:1rem}
.stack-col-title{font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--blue)}
.stack-item{
  display:flex;align-items:center;justify-content:space-between;
  padding:.65rem 0;border-bottom:1px solid var(--border);cursor:default
}
.stack-item:last-child{border-bottom:none}
.stack-item:hover .stack-tag{opacity:1}
.stack-name{font-size:.85rem;font-weight:400;color:var(--text-dim)}
.stack-tag{font-size:.65rem;font-weight:500;letter-spacing:.06em;color:var(--muted);opacity:0;transition:opacity .2s;text-transform:uppercase}

/* ABOUT */
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:3.5rem;align-items:start}
.about-text p{font-size:.975rem;color:var(--text-dim);line-height:1.85;margin-bottom:1.1rem}
.about-text strong{color:var(--text);font-weight:500}
.about-status{
  margin-top:2rem;display:flex;align-items:center;gap:.85rem;
  padding:1rem 1.25rem;border:1px solid var(--border);border-radius:8px;
  background:var(--surface)
}
.status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;flex-shrink:0}
.status-text{font-size:.8rem;font-weight:400;color:var(--muted)}
.status-text strong{color:var(--green);font-weight:600}
.about-stats{
  display:grid;grid-template-columns:1fr 1fr;gap:1px;
  background:var(--border);border:1px solid var(--border);
  border-radius:10px 10px 0 0;overflow:hidden
}
.stat-box{background:var(--surface);padding:1.75rem;text-align:center}
.stat-num{font-family:'Syne',sans-serif;font-size:2.25rem;font-weight:800;color:var(--blue);line-height:1}
.stat-label{font-size:.68rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:.4rem}
.edu-block{
  background:var(--surface);border:1px solid var(--border);border-top:none;
  padding:1.5rem;border-radius:0 0 10px 10px
}
.edu-item{display:flex;gap:.85rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)}
.edu-item:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none}
.edu-dot{width:6px;height:6px;border-radius:50%;background:var(--blue);margin-top:.45rem;flex-shrink:0}
.edu-degree{font-size:.8rem;font-weight:500;color:var(--text-dim)}
.edu-school{font-size:.72rem;color:var(--muted);margin-top:.2rem}

/* CONTACT */
.contact-inner{
  border:1px solid var(--border);background:var(--surface);
  padding:4rem 3rem;text-align:center;border-radius:12px
}
.contact-title{font-family:'Syne',sans-serif;font-size:2.5rem;font-weight:800;letter-spacing:-.03em;margin-bottom:.75rem}
.contact-sub{font-size:.85rem;font-weight:400;color:var(--muted);margin-bottom:2.5rem;letter-spacing:.01em}
.contact-links{display:flex;flex-wrap:wrap;justify-content:center;gap:.75rem}

/* FOOTER */
footer{
  border-top:1px solid var(--border);padding:1.75rem 2.5rem;
  display:flex;justify-content:space-between;align-items:center;
  max-width:1100px;margin:0 auto
}
.footer-text{font-size:.72rem;color:var(--muted);font-weight:400}
.footer-links{display:flex;gap:1.75rem}
.footer-links a{font-size:.72rem;color:var(--muted);text-decoration:none;font-weight:400;transition:color .2s}
.footer-links a:hover{color:var(--blue)}

/* SCROLL REVEAL */
.reveal{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease}
.reveal.visible{opacity:1;transform:none}

/* ANIMATIONS */
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

/* RESPONSIVE */
@media(max-width:768px){
  .featured-grid,.small-grid{grid-template-columns:1fr}
  .stack-grid{grid-template-columns:1fr}
  .about-grid{grid-template-columns:1fr}
  nav .nav-links{display:none}
  section{padding:3.5rem 1.25rem}
  .hero{padding:6rem 1.25rem 4rem}
}
```

- [ ] **Step 2: Replace the inline `<style>` block in `index.html` with a link tag**

In `index.html`, replace everything from `<style>` (line 8) through `</style>` (line 244) with:

```html
<link rel="stylesheet" href="styles.css"/>
```

- [ ] **Step 3: Verify the homepage renders identically**

Open `index.html` directly in a browser (or via a local static server, e.g. `python3 -m http.server` from the repo root). Confirm:
- Hero, project cards, stack grid, about section, and contact section look pixel-identical to before.
- No console errors about missing/failed CSS load.
- Scroll-reveal animations still trigger on scroll.

Run: `open index.html` (macOS) then visually inspect, and check DevTools console for errors.
Expected: No visual difference from before the change; no console errors.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "refactor: extract homepage styles into styles.css"
```

---

## Task 2: Create shared case-study.css

**Files:**
- Create: `case-study.css`

**Interfaces:**
- Consumes: CSS custom properties from `styles.css` (`--bg`, `--surface`, `--surface2`, `--border`, `--border-subtle`, `--blue`, `--green`, `--muted`, `--text`, `--text-dim`) — `case-study.css` must always be loaded after `styles.css`.
- Produces: classes `.case-study-breadcrumb`, `.case-study-header`, `.case-study-meta`, `.case-study-title`, `.case-study-body`, `.arch-diagram`, `.arch-box`, `.arch-arrow`. Tasks 3-5 depend on these exact class names.

- [ ] **Step 1: Write `case-study.css`**

```css
/* CASE STUDY BREADCRUMB */
.case-study-breadcrumb{
  max-width:760px;margin:0 auto;padding:6rem 2.5rem 0
}
.case-study-breadcrumb a{
  font-size:.8rem;font-weight:500;color:var(--muted);text-decoration:none;
  display:inline-flex;align-items:center;gap:.4rem;transition:color .2s
}
.case-study-breadcrumb a:hover{color:var(--blue)}

/* CASE STUDY HEADER */
.case-study-header{
  max-width:760px;margin:0 auto;padding:1.5rem 2.5rem 3rem;
  border-bottom:1px solid var(--border)
}
.case-study-meta{display:flex;align-items:center;gap:1rem;margin-bottom:1rem}
.case-study-title{
  font-family:'Syne',sans-serif;font-size:clamp(2rem,5vw,3rem);
  font-weight:800;letter-spacing:-.03em;line-height:1.1
}

/* CASE STUDY BODY */
.case-study-body{max-width:760px;margin:0 auto;padding:3.5rem 2.5rem}
.case-study-body h2{
  font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:800;
  letter-spacing:-.02em;margin:3rem 0 1.25rem
}
.case-study-body h2:first-child{margin-top:0}
.case-study-body h3{
  font-size:1.05rem;font-weight:600;color:var(--text);
  margin:1.75rem 0 .6rem;letter-spacing:-.01em
}
.case-study-body p{font-size:.975rem;color:var(--text-dim);line-height:1.85;margin-bottom:1.1rem}
.case-study-body strong{color:var(--text);font-weight:500}

/* ARCHITECTURE DIAGRAM */
.arch-diagram{
  display:flex;flex-wrap:wrap;align-items:center;gap:.75rem;
  margin:1.5rem 0 2rem;padding:1.5rem;
  background:var(--surface);border:1px solid var(--border);border-radius:10px
}
.arch-box{
  padding:.75rem 1.1rem;background:var(--surface2);border:1px solid var(--border-subtle);
  border-radius:6px;font-size:.8rem;font-weight:500;color:var(--text-dim);
  text-align:center
}
.arch-arrow{color:var(--muted);font-size:.9rem;flex-shrink:0}

/* RESPONSIVE */
@media(max-width:768px){
  .case-study-breadcrumb,.case-study-header,.case-study-body{padding-left:1.25rem;padding-right:1.25rem}
  .arch-diagram{flex-direction:column;align-items:stretch}
  .arch-arrow{transform:rotate(90deg);text-align:center}
}
```

- [ ] **Step 2: Verify it loads without errors**

This file has no consumer yet, so verification happens in Task 3 when the first case-study page links it. No action needed here beyond confirming the file was saved.

- [ ] **Step 3: Commit**

```bash
git add case-study.css
git commit -m "feat: add shared case-study page stylesheet"
```

---

## Task 3: Revenue Recovery Engine case-study page

**Files:**
- Create: `case-studies/revenue-recovery-engine.html`
- Modify: `index.html` (RRE card's `project-link`)

**Interfaces:**
- Consumes: `styles.css`, `case-study.css` (Tasks 1-2).

**Source material already available (from `resume.md` and `index.html` — use this, do not invent beyond it):**
> Turns a slow, manual product-listing audit into a paste-a-URL workflow that hands a merchant concrete description fixes to cut down on returns.
> As Tech Lead, set where the LLM reasoning ended and deterministic logic took over, and defined the Inngest step-boundary pattern the team built the pipeline around.
> SCOUT → CRITIC → PRESCRIBER pipeline scrapes a listing and its reviews, then returns specific description fixes. Scoring and yes/no decisions run in code, not the LLM, so there's no hallucination risk.
> Beat Vercel's 10-second serverless timeout by splitting scraping, inference, and DB writes into separate Inngest steps, each with its own retry logic.
> Stack: Python, Next.js 15, TypeScript, Inngest, Supabase + pgvector, Google Gemini, Zod, Vercel, Apify. Role: Tech Lead. Status: Private (PM Accelerator).

- [ ] **Step 1: Interview the user for what's missing**

This source material covers Overview, The Problem, My Role, Technical Approach, Key Engineering Decisions, and Tech Stack. It does **not** cover:
- **Challenges & Trade-offs**: at least one concrete difficulty encountered (e.g. something about scraping reliability, the SCOUT/CRITIC/PRESCRIBER handoff, Inngest step design, Gemini output quality) and how it was actually handled. Ask one question at a time; don't accept a vague answer — push for the specific failure mode.
- **Reflection**: what the user would do differently today, and what building RRE taught them / how it changed how they engineer.
- **Architecture diagram content**: confirm the SCOUT → CRITIC → PRESCRIBER stage names and any surrounding components (e.g. does scraping happen inside SCOUT, or is there a separate ingestion step before it? Where do Supabase/pgvector and Gemini sit in the flow?) are correct before diagramming — resume.md implies but doesn't fully spell out the request flow.

Do not proceed to Step 2 until these are answered.

- [ ] **Step 2: Draft `case-studies/revenue-recovery-engine.html`**

Use this skeleton, filling `[[...]]` markers with the source material above and the Step 1 interview answers. Everything outside `[[...]]` is final:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Revenue Recovery Engine — Case Study | Jibin Kunjumon</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../styles.css"/>
<link rel="stylesheet" href="../case-study.css"/>
</head>
<body>

<nav>
  <div class="nav-logo"><a href="../index.html" style="color:inherit;text-decoration:none">Jibin<span>.</span></a></div>
  <ul class="nav-links">
    <li><a href="../index.html#projects">Projects</a></li>
    <li><a href="../index.html#stack">Stack</a></li>
    <li><a href="../index.html#about">About</a></li>
    <li><a href="../index.html#contact">Contact</a></li>
  </ul>
</nav>

<div class="case-study-breadcrumb">
  <a href="../index.html#projects">← Back to Projects</a>
</div>

<header class="case-study-header">
  <div class="case-study-meta">
    <span class="project-domain">E-commerce AI</span>
    <span class="role-badge">Tech Lead</span>
  </div>
  <h1 class="case-study-title">Revenue Recovery Engine</h1>
</header>

<article class="case-study-body">
  <h2>Overview</h2>
  <p>[[2-3 paragraphs: what RRE is, who it serves (merchants), why it exists — built from the source material above]]</p>

  <h2>The Problem</h2>
  <p>[[What made manual product-listing audits slow/costly, what constraints existed, why it mattered — from source material]]</p>

  <h2>My Role</h2>
  <p>[[First-person, explicit: as Tech Lead, set the LLM/deterministic boundary, defined the Inngest step-boundary pattern — from source material]]</p>

  <h2>Technical Approach</h2>
  <p>[[SCOUT → CRITIC → PRESCRIBER pipeline described at architecture level, Next.js/Inngest/Supabase/Gemini roles — from source material]]</p>

  <h2>Architecture</h2>
  <div class="arch-diagram">
    [[arch-box / arch-arrow elements reflecting the confirmed request flow from Step 1, e.g.:]]
    <div class="arch-box">SCOUT</div>
    <span class="arch-arrow">→</span>
    <div class="arch-box">CRITIC</div>
    <span class="arch-arrow">→</span>
    <div class="arch-box">PRESCRIBER</div>
  </div>
  <p>[[1 short paragraph explaining the diagram, if the diagram alone isn't self-explanatory]]</p>

  <h2>Key Engineering Decisions</h2>
  <h3>Keeping scoring and yes/no decisions in code, not the LLM</h3>
  <p>[[Expand on why — hallucination risk in a step that has to be right — from source material]]</p>
  <h3>Inngest step boundaries to beat Vercel's 10-second timeout</h3>
  <p>[[Expand on splitting scraping/inference/DB writes into separate steps with independent retry logic — from source material]]</p>

  <h2>Challenges &amp; Trade-offs</h2>
  <p>[[From Step 1 interview answer — real friction, not invented]]</p>

  <h2>Outcome</h2>
  <p>[[What shipped / what changed — grounded in source material, no invented metrics]]</p>

  <h2>Tech Stack</h2>
  <div class="tech-badges">
    <span class="badge">Python</span>
    <span class="badge">Next.js 15</span>
    <span class="badge">TypeScript</span>
    <span class="badge">Inngest</span>
    <span class="badge">Supabase</span>
    <span class="badge">pgvector</span>
    <span class="badge">Google Gemini</span>
    <span class="badge">Zod</span>
    <span class="badge">Vercel</span>
    <span class="badge">Apify</span>
  </div>

  <h2>Reflection</h2>
  <p>[[From Step 1 interview answer]]</p>
</article>

<footer>
  <span class="footer-text">Built by Jibin Kunjumon · 2026</span>
  <div class="footer-links">
    <a href="https://github.com/jibz33on" target="_blank">GitHub</a>
    <a href="https://linkedin.com/in/jibin-kunjumon" target="_blank">LinkedIn</a>
    <a href="mailto:jibz33on@gmail.com">Email</a>
  </div>
</footer>

</body>
</html>
```

- [ ] **Step 3: Verify in browser**

Open `case-studies/revenue-recovery-engine.html` directly. Confirm:
- Nav bar matches homepage styling; logo and section links navigate to `index.html` and its anchors correctly.
- Breadcrumb link returns to `index.html#projects`.
- All 10 sections render in order with correct headings.
- Architecture diagram boxes/arrows lay out correctly at desktop width and stack vertically (arrow rotated) below 768px — resize the browser window to check.
- Tech stack badges match the styling of the homepage project cards.
- No console errors.

- [ ] **Step 4: User review**

Share the drafted content with the user (not just "done" — walk through what was written for each section) and wait for explicit approval or requested changes before proceeding. Iterate Steps 2-3 until approved.

- [ ] **Step 5: Wire up the homepage link, preserving the "Private" signal**

Unlike RemiMinder and MindGym, the RRE card has no top-right status badge — `"Private — PM Accelerator"` currently lives only in the link text, so swapping that text loses it. Add a status badge in the same slot RemiMinder/MindGym use, then swap the link.

In `index.html`, find the RRE card's `project-meta` block:
```html
<div class="project-meta">
  <span class="project-domain">E-commerce AI</span>
</div>
```
Replace with:
```html
<div class="project-meta">
  <span class="project-domain">E-commerce AI</span>
  <span class="prod-badge status-deployed">Private — PM Accelerator</span>
</div>
```
(Reuses the existing `.prod-badge.status-deployed` class — same muted, no-animation styling already used for RemiMinder's "Deployed" badge. No CSS changes needed.)

Then find the RRE card's link:
```html
<a class="project-link" href="#">Private — PM Accelerator</a>
```
Replace with:
```html
<a class="project-link" href="case-studies/revenue-recovery-engine.html">Read Case Study</a>
```

- [ ] **Step 6: Verify the homepage link**

Open `index.html`, click "Read Case Study" on the RRE card, confirm it navigates to the new page. Click the breadcrumb, confirm it returns to `index.html#projects`. Confirm the new "Private — PM Accelerator" badge renders in the top-right of the card, matching the visual weight of RemiMinder's "Deployed" badge.

- [ ] **Step 7: Commit**

```bash
git add case-studies/revenue-recovery-engine.html index.html
git commit -m "feat: add Revenue Recovery Engine case study page"
```

---

## Task 4: RemiMinder case-study page

**Files:**
- Create: `case-studies/remiminder.html`
- Modify: `index.html` (RemiMinder card's `project-link`)

**Interfaces:**
- Consumes: `styles.css`, `case-study.css` (Tasks 1-2). Same skeleton pattern as Task 3.

**Source material already available (from `resume.md` and `index.html`):**
> Turns a recorded consultation into a structured clinical record on its own, so clinicians spend less time writing notes after each visit.
> ~60-second turnaround on a 15-minute recording, on an async worker setup with job queues, retries, and idempotency checks.
> Full audio-to-record pipeline: ingestion → transcription → structured JSON extraction → LLM summarisation. Each stage is validated before the next one runs.
> MedGemma pulls structured fields out of messy medical audio, with schema validation before handoff to Gemini for summarisation.
> HIPAA-compliant, GCP (Vertex AI, Firebase, Cloud SQL, GCS), FastAPI backend on Cloud Run with IAM hardening.
> Stack: Python, FastAPI, GCP (Vertex AI, Firebase, Cloud SQL, GCS), MedGemma, Gemini, pgvector, Docker. Role: Founding Engineer. Status: Private.

- [ ] **Step 1: Interview the user for what's missing**

Missing from source material:
- **Challenges & Trade-offs**: a real difficulty — candidates suggested by the domain: getting reliable structured extraction from messy/accented medical audio, handling HIPAA/IAM constraints, async worker reliability (job queue failures, idempotency edge cases), or something else entirely. Ask, don't assume.
- **Reflection**: what they'd do differently today; what RemiMinder taught them.
- **Architecture diagram content**: confirm the exact stage order and where validation gates sit — resume.md says "ingestion → transcription → structured JSON extraction → LLM summarisation" with "each stage validated before the next runs" and separately that "MedGemma pulls structured fields... with schema validation before handoff to Gemini." Confirm whether MedGemma performs the transcription+extraction stages and Gemini performs summarisation (that's the implication) before diagramming it as fact.

Do not proceed to Step 2 until these are answered.

- [ ] **Step 2: Draft `case-studies/remiminder.html`**

Same skeleton as Task 3 Step 2, with these changes:
- `<title>RemiMinder — Case Study | Jibin Kunjumon</title>`
- Breadcrumb, nav, footer: identical markup to Task 3.
- `case-study-meta`: `<span class="project-domain">Healthcare AI</span><span class="role-badge">Founding Engineer</span>`
- `case-study-title`: `RemiMinder`
- Section content: Overview/Problem/My Role/Technical Approach/Key Engineering Decisions/Outcome drafted from the source material above; Challenges & Trade-offs and Reflection from Step 1 interview answers; Architecture diagram reflecting the confirmed stage order.
- Tech Stack badges: `Python`, `FastAPI`, `GCP`, `Vertex AI`, `Firebase`, `Cloud SQL`, `GCS`, `MedGemma`, `Gemini`, `pgvector`, `Docker`.

Key Engineering Decisions should cover at minimum: (a) why each pipeline stage is validated before the next runs (failure isolation — a bad transcription shouldn't silently produce a bad clinical record), (b) why MedGemma for structured field extraction specifically vs. handing raw audio straight to a general LLM.

- [ ] **Step 3: Verify in browser**

Same checklist as Task 3 Step 3, applied to `case-studies/remiminder.html`.

- [ ] **Step 4: User review**

Same as Task 3 Step 4 — wait for explicit approval before proceeding.

- [ ] **Step 5: Wire up the homepage link**

In `index.html`, find the RemiMinder card's link:
```html
<a class="project-link" href="#">Private</a>
```
Replace with:
```html
<a class="project-link" href="case-studies/remiminder.html">Read Case Study</a>
```

- [ ] **Step 6: Verify the homepage link**

Same checklist as Task 3 Step 6, applied to the RemiMinder card.

- [ ] **Step 7: Commit**

```bash
git add case-studies/remiminder.html index.html
git commit -m "feat: add RemiMinder case study page"
```

---

## Task 5: MindGym case-study page

**Files:**
- Create: `case-studies/mindgym.html`
- Modify: `index.html` (MindGym card's `project-link`)

**Interfaces:**
- Consumes: `styles.css`, `case-study.css` (Tasks 1-2). Same skeleton pattern as Task 3.

**Source material already available (from `resume.md` and `index.html`):**
> A voice-guided mental-performance companion that adapts its coaching tone to how the user is feeling. The hard part was safety: it's built so the AI can't produce an unsafe or off-tone response, because here reliability matters more than cleverness.
> Used a single LLM call instead of a multi-agent chain to stay under a hard 10-second timeout, with fallback templates served instantly if anything fails. Tone is handled outside the model: a lookup table maps user state to a per-phase tone arc, so tone doesn't drift across a 5-phase session.
> Owned the full stack, including the entire Next.js frontend. Built the streaming audio pipeline on ElevenLabs with one-phase lookahead prefetch, iOS autoplay handling, and a typewriter text fallback when audio fails, so playback stays smooth and never dead-ends.
> Separated the static system prompt from the dynamic user prompt so prompts stay auditable and versionable. A validation layer rejects unsafe responses before they reach the user: one guard strips motivational language for high-anxiety users, another checks the required context is present word for word.
> Stack: Python, FastAPI, OpenAI GPT-4o, ElevenLabs TTS, Supabase (PostgreSQL), Pydantic v2, Next.js, Railway. Role: Founding Engineer. Status: Live.

- [ ] **Step 1: Interview the user for what's missing**

Missing from source material:
- **Challenges & Trade-offs**: a real difficulty — candidates suggested by the domain: tuning the validation layer without over-blocking legitimate responses, ElevenLabs streaming/latency issues, iOS autoplay quirks mentioned in the resume (what specifically broke and how it was fixed), or something else. Ask, don't assume.
- **Reflection**: what they'd do differently today; what MindGym taught them, particularly around building a full-stack product solo/as founding engineer.
- **Architecture diagram content**: confirm the request flow — e.g. user speaks → transcription (if any) → single GPT-4o call (with static system prompt + dynamic user prompt + tone lookup) → validation layer → ElevenLabs streaming synthesis → playback. Confirm this is accurate before diagramming it as fact; resume.md doesn't state whether there's a speech-to-text step.

Do not proceed to Step 2 until these are answered.

- [ ] **Step 2: Draft `case-studies/mindgym.html`**

Same skeleton as Task 3 Step 2, with these changes:
- `<title>MindGym — Case Study | Jibin Kunjumon</title>`
- Breadcrumb, nav, footer: identical markup to Task 3.
- `case-study-meta`: `<span class="project-domain">Mental Health AI</span><span class="role-badge">Founding Engineer</span>`
- `case-study-title`: `MindGym`
- Section content: Overview/Problem/My Role/Technical Approach/Key Engineering Decisions/Outcome drafted from the source material above; Challenges & Trade-offs and Reflection from Step 1 interview answers; Architecture diagram reflecting the confirmed request flow.
- Tech Stack badges: `Python`, `FastAPI`, `GPT-4o`, `ElevenLabs`, `Supabase`, `Pydantic v2`, `Next.js`, `Railway`.

Key Engineering Decisions should cover at minimum: (a) single LLM call vs. multi-agent chain, and the 10-second timeout constraint that drove it, (b) tone handled by a lookup table outside the model rather than left to the LLM, (c) the validation layer rejecting unsafe/off-tone output before it reaches the user.

- [ ] **Step 3: Verify in browser**

Same checklist as Task 3 Step 3, applied to `case-studies/mindgym.html`.

- [ ] **Step 4: User review**

Same as Task 3 Step 4 — wait for explicit approval before proceeding.

- [ ] **Step 5: Wire up the homepage link**

In `index.html`, find the MindGym card's link:
```html
<a class="project-link" href="#">Private</a>
```
Replace with:
```html
<a class="project-link" href="case-studies/mindgym.html">Read Case Study</a>
```

- [ ] **Step 6: Verify the homepage link**

Same checklist as Task 3 Step 6, applied to the MindGym card. Also confirm the "Live" status badge (green, pulsing dot) at the top of the card is unaffected.

- [ ] **Step 7: Commit**

```bash
git add case-studies/mindgym.html index.html
git commit -m "feat: add MindGym case study page"
```

---

## Final check (after Task 5)

- [ ] Open `index.html` fresh, click all 3 "Read Case Study" links in sequence, confirm each opens the right page.
- [ ] From each case-study page, click every nav link and the breadcrumb, confirm correct destinations.
- [ ] Confirm no project outside the 3 flagship cards (TickerPulse, Autonomous Research Assistant, Discord RAG Bot) was touched.
- [ ] `git log --oneline -8` to confirm 5 commits landed (CSS extraction, case-study.css, 3 case-study pages) on top of the earlier spec commit.
