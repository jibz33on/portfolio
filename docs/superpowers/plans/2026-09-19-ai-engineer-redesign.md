# AI Engineer Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended for Tasks 1-4) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Tasks 5-8 each open with a live one-question-at-a-time interview with the user — see Global Constraints before dispatching those as opaque subagent tasks.**

**Goal:** Redesign the single-page portfolio around Home → Experience → Projects → Certificates → Contact, add the Gistr LLM-evaluation experience and FraudSentinel project (both currently absent from the site), add a static keyword-matched AI assistant, and produce case-study pages for the 4 flagship projects (Gistr, Revenue Recovery Engine, FraudSentinel, MindGym).

**Architecture:** Same static HTML/CSS/vanilla-JS architecture as today — no framework, no build step, no new runtime dependencies. `index.html` is restructured (new nav, new Experience/Certificates/More-Work sections, hero rewrite). `styles.css` gains new component blocks and loses the removed Stack/About blocks. `case-study.css` is reused unchanged. A new `assistant/` directory holds the AI assistant's data and logic as plain UMD-style JS files (work identically via `<script>` tag and via `node --test`, so the assistant's matching logic gets real unit tests without adding a test framework or package.json).

**Tech Stack:** Plain HTML + CSS + vanilla JS (no new dependencies). Same fonts already loaded (Inter, Syne via Google Fonts). Node.js (already on the dev machine) runs the assistant's unit tests via the built-in `node:test`/`node:assert` modules — not part of the deployed site.

**Spec:** `docs/superpowers/specs/2026-09-19-ai-engineer-redesign-design.md`

## Global Constraints

- Voice: direct, technical, honest, specific. No buzzwords (innovative, cutting-edge, leveraged, results-driven, world-class, seamless, revolutionized, "robust solution"). Source: spec.
- No invented metrics, responsibilities, outcomes, or certificates anywhere. Source: spec / user instruction.
- No framework or build-step migration. Static HTML/CSS/JS + Cloudflare Pages only. Source: spec constraint #10.
- No contact form (mailto-only). No LLM-backed assistant (Option A, keyword-matched, only). Both confirmed decisions. Source: spec.
- Every case-study page must remain identifiable without its project name in the text. Source: prior case-study spec, carried forward.
- **Tasks 5-8 each require a live, adaptive, one-question-at-a-time interview with the user for Challenges, Results, and Lessons Learned before those sections can be drafted.** Do not pre-write this content. If executing via subagent-driven-development, the dispatching agent (not a stateless fresh subagent) conducts these interviews directly, then hands the answers to whichever process drafts the file.
- Source of truth for all content: `.claude/resume.md` and `.claude/PROJECTS/*.md`. Where both are silent, interview the user — never invent.

---

## Task 1: Global Navigation & Hero Foundation

**Files:**
- Modify: `index.html` (nav block, hero section, remove Stack section, remove About section, script block)
- Modify: `styles.css` (nav additions, hero additions, remove Stack/About rules, update responsive block)

**Interfaces:**
- Produces: nav structure with ids `#hero`, `#experience`, `#projects`, `#certificates`, `#contact` — Tasks 2-3 must create sections matching these ids exactly.
- Removes: `.stack-*` and `.about-*` CSS rules (except `.status-dot` and `@keyframes pulse`, which are reused by the new `.hero-status` and by `.prod-dot`).

- [ ] **Step 1: Add SEO meta tags to `<head>`**

In `index.html`, find:
```html
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Jibin Kunjumon | AI Engineer</title>
```
Replace with:
```html
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Jibin Kunjumon | AI Engineer — RAG, Agentic Systems &amp; LLM Evaluation</title>
<meta name="description" content="AI Engineer specializing in RAG, agentic systems, and LLM evaluation. Production GenAI systems shipped across healthcare, fintech, and e-commerce."/>
<meta property="og:title" content="Jibin Kunjumon | AI Engineer"/>
<meta property="og:description" content="AI Engineer specializing in RAG, agentic systems, and LLM evaluation. Production GenAI systems shipped across healthcare, fintech, and e-commerce."/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="https://jibink.com/"/>
```

- [ ] **Step 2: Replace the nav markup**

Find in `index.html`:
```html
<nav>
  <div class="nav-logo">Jibin<span>.</span></div>
  <ul class="nav-links">
    <li><a href="#projects">Projects</a></li>
    <li><a href="#stack">Stack</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</nav>
```
Replace with:
```html
<nav>
  <div class="nav-logo">Jibin<span>.</span></div>
  <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <ul class="nav-links">
    <li><a href="#hero">Home</a></li>
    <li><a href="#experience">Experience</a></li>
    <li><a href="#projects">Projects</a></li>
    <li><a href="#certificates">Certificates</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <a class="nav-cta btn-primary" href="#contact">Let's Talk</a>
</nav>
```

- [ ] **Step 3: Replace the hero markup**

Find the entire `<section class="hero" id="hero">...</section>` block and replace with:
```html
<section class="hero" id="hero">
  <div class="hero-status">
    <span class="status-dot"></span>
    <span>Available — Open to AI Engineer roles · Remote · India-based</span>
  </div>
  <p class="hero-eyebrow">AI Engineer · GenAI &amp; Agentic Systems · LLM Evaluation</p>
  <h1 class="hero-name">Jibin<br>Kunjumon</h1>

  <p class="hero-tagline">
    The model proposes.<br>
    My <em>code</em> decides.
  </p>

  <p class="hero-support">
    Five production systems shipped across healthcare, fintech, and e-commerce, plus hands-on LLM evaluation and observability work on a live agentic RAG product — each built so the model can reason and draft, but the decision that matters runs through deterministic, auditable code.
  </p>

  <div class="hero-ctas">
    <a class="btn-primary" href="#projects">View Projects</a>
    <a class="btn-ghost" href="#contact">Let's Talk</a>
  </div>

  <div class="hero-stats">
    <div class="hero-stat"><span class="hero-stat-num">5</span><span class="hero-stat-label">Systems Shipped</span></div>
    <div class="hero-stat"><span class="hero-stat-num">3</span><span class="hero-stat-label">Domains</span></div>
    <div class="hero-stat"><span class="hero-stat-num">250+</span><span class="hero-stat-label">Eval Cases Reviewed</span></div>
  </div>

  <p class="hero-meta">B.Tech · CUSAT &nbsp;·&nbsp; M.Acc · Deakin University, Australia</p>
</section>
```

- [ ] **Step 4: Delete the Stack section**

Delete the entire `<!-- STACK --> <section id="stack">...</section>` block from `index.html`.

- [ ] **Step 5: Delete the About section**

Delete the entire `<!-- ABOUT --> <section id="about">...</section>` block from `index.html`. (Its education detail is already covered by `.hero-meta`; its "Currently Tech Lead" line was stale per the resume update and is not carried forward anywhere.)

- [ ] **Step 6: Add nav toggle JS**

Find the closing `<script>` block at the bottom of `index.html` (the one with the `IntersectionObserver`) and add this before the final `</script>`:
```js
// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinksEl = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  const isOpen = navLinksEl.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});
```

- [ ] **Step 7: Add hero CSS**

In `styles.css`, after the existing `.hero-meta{...}` rule, add:
```css
.hero-status{
  display:flex;align-items:center;gap:.6rem;
  padding:.5rem .9rem;border:1px solid var(--border);border-radius:20px;
  background:var(--surface);width:fit-content;margin-bottom:1.5rem;
  font-size:.75rem;font-weight:500;color:var(--muted);
  opacity:0;animation:fadeUp .6s .1s forwards
}
.hero-status .status-dot{width:7px;height:7px}
.hero-stats{
  display:flex;flex-wrap:wrap;gap:2.5rem;margin-top:2.5rem;
  opacity:0;animation:fadeUp .6s .65s forwards
}
.hero-stat{display:flex;flex-direction:column;gap:.2rem}
.hero-stat-num{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:var(--blue);line-height:1}
.hero-stat-label{font-size:.68rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
```
Note: `.status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;flex-shrink:0}` already exists (currently under the `/* ABOUT */` comment) — in Step 9 it moves out of the deleted About block into a shared location; do not delete the rule itself, only its old comment grouping.

- [ ] **Step 8: Add nav CSS (logo/toggle/cta + mobile panel)**

In `styles.css`, after `.nav-links a:hover{color:var(--text)}`, add:
```css
.nav-cta{padding:.5rem 1.1rem;font-size:.75rem}
.nav-toggle{
  display:none;flex-direction:column;justify-content:center;gap:4px;
  width:32px;height:32px;background:none;border:none;cursor:pointer;padding:0
}
.nav-toggle span{width:100%;height:2px;background:var(--text-dim);border-radius:2px;transition:transform .2s,opacity .2s}
.nav-toggle[aria-expanded="true"] span:nth-child(1){transform:translateY(6px) rotate(45deg)}
.nav-toggle[aria-expanded="true"] span:nth-child(2){opacity:0}
.nav-toggle[aria-expanded="true"] span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
```

- [ ] **Step 9: Remove Stack/About CSS, keep `.status-dot` and `@keyframes pulse`**

In `styles.css`, delete these blocks entirely: `/* STACK */` through its last rule (`.stack-tag{...}`), and `/* ABOUT */` through `.edu-school{...}` — **except** pull the `.status-dot{...}` rule out of that deleted range first and re-place it just above the `/* CONTACT */` comment (as a standalone rule, no section comment needed — it's now shared between the hero and `prod-badge`/`prod-dot` styling). Leave `@keyframes pulse` where it is under `/* ANIMATIONS */` — it's still used by `.prod-dot` and `.status-dot`.

- [ ] **Step 10: Update the responsive block**

Find:
```css
@media(max-width:768px){
  .featured-grid,.small-grid{grid-template-columns:1fr}
  .stack-grid{grid-template-columns:1fr}
  .about-grid{grid-template-columns:1fr}
  nav .nav-links{display:none}
  section{padding:3.5rem 1.25rem}
  .hero{padding:6rem 1.25rem 4rem}
}
```
Replace with:
```css
@media(max-width:768px){
  .featured-grid,.small-grid{grid-template-columns:1fr}
  section{padding:3.5rem 1.25rem}
  .hero{padding:6rem 1.25rem 4rem}
  .nav-toggle{display:flex}
  .nav-cta{display:none}
  nav .nav-links{
    display:none;position:fixed;top:56px;left:0;right:0;
    flex-direction:column;gap:0;background:var(--bg);
    border-bottom:1px solid var(--border);padding:.5rem 0
  }
  nav .nav-links.open{display:flex}
  nav .nav-links li{width:100%}
  nav .nav-links a{display:block;padding:.9rem 1.25rem}
}
```

- [ ] **Step 11: Verify in browser**

Open `index.html` directly (`open index.html` on macOS). Confirm:
- Browser tab title reads the new SEO title; view page source and confirm the meta description and `og:*` tags are present.
- Hero shows the availability pill, new eyebrow, tagline, support text, 2 CTAs, 3-stat row, education meta line — no console errors.
- Stack and About sections are gone; page doesn't jump/break where they used to be.
- Nav shows Home/Experience/Projects/Certificates/Contact + a "Let's Talk" button at desktop width. Resize below 768px: links disappear, hamburger appears; clicking it opens a full-width dropdown panel; clicking a link closes it and scrolls to the anchor (Experience/Certificates will 404-scroll to nothing until Task 2/3 — expected at this point).
- No visual regression on the Projects/Contact sections (untouched this task).

- [ ] **Step 12: Commit**

```bash
git add index.html styles.css
git commit -m "feat: redesign nav and hero, remove stale Stack and About sections"
```

---

## Task 2: Selected Work + Experience Timeline + More Work

**Files:**
- Modify: `index.html` (replace the single `<section id="projects">` with three sections: `#projects` flagship-only, new `#experience`, new `#more-work`)
- Modify: `styles.css` (flagship grid → 2-column, new timeline component, new more-work heading reuse)

**Interfaces:**
- Consumes: `#hero`, `#contact` unchanged from Task 1.
- Produces: `#projects` (flagship, 4 cards), `#experience` (timeline, 3 entries), `#more-work` (secondary, 4 cards). Task 5-8 (case studies) depend on the exact flagship card markup/hrefs created here.

- [ ] **Step 1: Replace the Projects section**

Find the entire `<!-- PROJECTS --> <section id="projects">...</section>` block (everything from `<!-- PROJECTS -->` through the closing `</section>` after the `small-grid` div) and replace it with the three blocks below, **in this order**, in place of the old one:

```html
<!-- SELECTED WORK -->
<section id="projects">
  <div class="section-header reveal">
    <span class="section-num">01</span>
    <h2 class="section-title">Selected Work</h2>
    <div class="section-line"></div>
  </div>

  <div class="featured-grid reveal">
    <!-- Gistr -->
    <div class="project-featured">
      <div class="project-meta">
        <span class="project-domain">LLM Evaluation</span>
      </div>
      <span class="role-badge">AI Engineer (Contract)</span>
      <h3 class="project-name">Gistr — RAG Evaluation</h3>
      <p class="project-desc">
        LLM evaluation and answer-quality work for a live agentic RAG learning platform. Reviewed <strong>~250 cases by hand</strong>, redesigned an accuracy check that was measuring the wrong part of the pipeline, and traced a duplicate-content retrieval bug confirmed across <strong>8 production sessions</strong>.
      </p>
      <div class="tech-badges">
        <span class="badge">LangSmith</span>
        <span class="badge">PostHog</span>
        <span class="badge">LLM-as-judge</span>
        <span class="badge">LangGraph</span>
        <span class="badge">FastAPI</span>
      </div>
      <a class="project-link" href="#">Contract — Gistr</a>
    </div>

    <!-- RRE -->
    <div class="project-featured">
      <div class="project-meta">
        <span class="project-domain">E-commerce AI</span>
        <span class="prod-badge status-deployed"><span class="prod-dot"></span>Private — PM Accelerator</span>
      </div>
      <span class="role-badge">Tech Lead</span>
      <h3 class="project-name">Revenue Recovery Engine</h3>
      <p class="project-desc">
        Multi-agent pipeline — <strong>scrape → critique → prescribe</strong> — that audits product listings and returns specific description fixes. Scoring stays in code, not the LLM, and work is split into <strong>Inngest</strong> steps to beat a hard 10-second serverless timeout.
      </p>
      <div class="tech-badges">
        <span class="badge">TypeScript</span>
        <span class="badge">Next.js</span>
        <span class="badge">Supabase</span>
        <span class="badge">Inngest</span>
        <span class="badge">Google Gemini</span>
      </div>
      <a class="project-link" href="#">Private — PM Accelerator</a>
    </div>

    <!-- FraudSentinel -->
    <div class="project-featured">
      <div class="project-meta">
        <span class="project-domain">Fraud Detection AI</span>
      </div>
      <span class="role-badge">Solo Builder</span>
      <h3 class="project-name">FraudSentinel</h3>
      <p class="project-desc">
        Flags suspicious transactions and explains why in language a human reviewer can act on, instead of returning a black-box risk score. A <strong>three-agent LangGraph workflow</strong> — detection, investigation, decision — with risk scoring kept rule-based and separate from the LLM for deterministic, auditable verdicts.
      </p>
      <div class="tech-badges">
        <span class="badge">Python</span>
        <span class="badge">FastAPI</span>
        <span class="badge">LangGraph</span>
        <span class="badge">Llama 3.3 70B</span>
        <span class="badge">pgvector</span>
      </div>
      <a class="project-link" href="#">Private</a>
    </div>

    <!-- MindGym -->
    <div class="project-featured">
      <div class="project-meta">
        <span class="project-domain">Mental Health AI</span>
        <span class="prod-badge"><span class="prod-dot"></span>Live</span>
      </div>
      <span class="role-badge">Founding Engineer</span>
      <h3 class="project-name">MindGym</h3>
      <p class="project-desc">
        Voice-guided mental-performance companion that adapts its coaching tone to how the user is feeling. A single <strong>GPT-4o</strong> call — not a multi-agent chain — keeps every response under a hard <strong>10-second timeout</strong>, with a validation layer that rejects unsafe or off-tone output before it reaches the user.
      </p>
      <div class="tech-badges">
        <span class="badge">Python</span>
        <span class="badge">FastAPI</span>
        <span class="badge">GPT-4o</span>
        <span class="badge">ElevenLabs</span>
        <span class="badge">Next.js</span>
      </div>
      <a class="project-link" href="#">Private</a>
    </div>
  </div>
</section>

<!-- EXPERIENCE -->
<section id="experience">
  <div class="section-header reveal">
    <span class="section-num">02</span>
    <h2 class="section-title">Experience</h2>
    <div class="section-line"></div>
  </div>

  <div class="timeline reveal">
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-role">AI Engineer (Contract)</span>
          <span class="timeline-dates">Jun 2026 – Aug 2026</span>
        </div>
        <div class="timeline-company">Gistr · Remote</div>
        <p class="timeline-theme">LLM evaluation &amp; observability for a live agentic RAG product.</p>
        <ul class="timeline-bullets">
          <li>Built an isolated LLM evaluation system for answer accuracy, so testing could never affect live users.</li>
          <li>Reviewed ~250 cases by hand and found the existing accuracy check was measuring the wrong part of the pipeline — redesigned it to catch answers the AI invented or couldn't support with a source.</li>
          <li>Defined 12 agent tool-waste patterns and found two retrieval tools returning duplicate content, confirmed across 8 production sessions.</li>
          <li>Created a hand-labelled golden dataset and version-controlled evaluation prompts to validate automated scores against ground truth.</li>
        </ul>
        <div class="timeline-tags">
          <span class="badge">LangSmith</span>
          <span class="badge">PostHog</span>
          <span class="badge">LLM-as-judge</span>
          <span class="badge">agent-as-judge</span>
          <span class="badge">LangGraph</span>
          <span class="badge">FastAPI</span>
        </div>
      </div>
    </div>

    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-role">AI Engineer (Project-based) · Technical Lead</span>
          <span class="timeline-dates">Sep 2025 – Jun 2026</span>
        </div>
        <div class="timeline-company">PM Accelerator · Kochi, India (Remote)</div>
        <p class="timeline-theme">Backend and architecture lead across 3 concurrent production AI systems.</p>
        <ul class="timeline-bullets">
          <li>Led Python backend development across 3 concurrent production AI systems in healthcare, financial intelligence, and e-commerce.</li>
          <li>Acted as Technical Lead across 3 cross-functional teams, owning architecture decisions and reviewing code through structured pull requests.</li>
          <li>Worked with product managers, frontend engineers, and non-technical stakeholders to turn business requirements into deployed AI systems.</li>
        </ul>
        <div class="timeline-tags">
          <span class="badge">Python</span>
          <span class="badge">FastAPI</span>
          <span class="badge">LangGraph</span>
          <span class="badge">LangChain</span>
          <span class="badge">PostgreSQL</span>
          <span class="badge">GCP</span>
        </div>
      </div>
    </div>

    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-role">AI Engineer Intern</span>
          <span class="timeline-dates">Sep 2024 – Aug 2025</span>
        </div>
        <div class="timeline-company">GALTech Technologies · Kerala, India</div>
        <p class="timeline-theme">Conversational AI systems on production FastAPI backends.</p>
        <ul class="timeline-bullets">
          <li>Built conversational AI systems on FastAPI backends with session management, conversation flow, and API integrations for production chatbot deployments.</li>
        </ul>
        <div class="timeline-tags">
          <span class="badge">Python</span>
          <span class="badge">FastAPI</span>
          <span class="badge">Conversational AI</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- MORE WORK -->
<section id="more-work">
  <div class="section-header reveal">
    <span class="section-num">03</span>
    <h2 class="section-title">More Work</h2>
    <div class="section-line"></div>
  </div>

  <div class="small-grid reveal">
    <!-- RemiMinder -->
    <div class="project-small">
      <div class="project-meta">
        <span class="project-domain">Healthcare AI</span>
        <span class="prod-badge status-deployed"><span class="prod-dot"></span>Deployed</span>
      </div>
      <span class="role-badge">Founding Engineer</span>
      <h3 class="project-name">RemiMinder</h3>
      <p class="project-desc">HIPAA-compliant audio-to-record pipeline on GCP. MedGemma extracts structured clinical fields from consultation audio; Gemini summarizes. ~60-second turnaround on a 15-minute recording.</p>
      <div class="tech-badges">
        <span class="badge">Python</span>
        <span class="badge">FastAPI</span>
        <span class="badge">GCP</span>
        <span class="badge">MedGemma</span>
      </div>
      <a class="project-link" href="#">Private</a>
    </div>

    <!-- TickerPulse -->
    <div class="project-small">
      <div class="project-meta">
        <span class="project-domain">FinTech AI</span>
      </div>
      <span class="role-badge">Tech Lead</span>
      <h3 class="project-name">TickerPulse</h3>
      <p class="project-desc">6-stage financial ML pipeline: news ingestion → FinBERT sentiment → Z-score anomaly → GPT-4 alert summaries. JWT auth, watchlist API, React/TypeScript frontend.</p>
      <div class="tech-badges">
        <span class="badge">Python</span>
        <span class="badge">FastAPI</span>
        <span class="badge">FinBERT</span>
        <span class="badge">GPT-4</span>
        <span class="badge">PostgreSQL</span>
      </div>
      <a class="project-link" href="https://github.com/jibz33on" target="_blank">GitHub</a>
    </div>

    <!-- Autonomous Research Assistant -->
    <div class="project-small">
      <div class="project-meta">
        <span class="project-domain">Agentic AI</span>
      </div>
      <span class="role-badge">Solo · Hackathon — 13 days</span>
      <h3 class="project-name">Autonomous Research Assistant</h3>
      <p class="project-desc">6-layer agentic system — Planner / Executor / Synthesizer agents via LangGraph. ChromaDB RAG + Tavily web search. Built bottom-to-top in 13 days solo.</p>
      <div class="tech-badges">
        <span class="badge">LangGraph</span>
        <span class="badge">GPT-4o-mini</span>
        <span class="badge">ChromaDB</span>
        <span class="badge">Tavily</span>
        <span class="badge">Streamlit</span>
      </div>
      <a class="project-link" href="https://github.com/jibz33on" target="_blank">GitHub</a>
    </div>

    <!-- Discord RAG Bot -->
    <div class="project-small">
      <div class="project-meta">
        <span class="project-domain">RAG / NLP</span>
      </div>
      <span class="role-badge">Academic</span>
      <h3 class="project-name">Discord RAG Bot</h3>
      <p class="project-desc">Production-quality Q&amp;A bot with MongoDB Atlas vector storage, SentenceTransformers (384-dim), Azure OpenAI GPT-3.5 Turbo. 100% test accuracy, 69.2% avg token overlap.</p>
      <div class="tech-badges">
        <span class="badge">Azure OpenAI</span>
        <span class="badge">MongoDB Atlas</span>
        <span class="badge">SentenceTransformers</span>
        <span class="badge">Discord.py</span>
      </div>
      <a class="project-link" href="https://github.com/jibz33on" target="_blank">GitHub</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Renumber remaining section-nums**

The old Contact section has no `section-num`, so no change needed there. Confirm `Selected Work`=01, `Experience`=02, `More Work`=03 read correctly top-to-bottom (Certificates gets 04 in Task 3).

- [ ] **Step 3: Update `.featured-grid` to a 2-column layout**

In `styles.css`, find:
```css
.featured-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);margin-bottom:1px;
  border-radius:10px;overflow:hidden
}
```
Replace with:
```css
.featured-grid{
  display:grid;grid-template-columns:repeat(2,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);
  border-radius:10px;overflow:hidden
}
```
(`margin-bottom:1px` is dropped — the small-grid no longer sits flush underneath it, since More Work is now its own section with normal section spacing.)

- [ ] **Step 4: Detach `.small-grid` from the old joined-block styling**

Find:
```css
.small-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);border-top:none;
  border-radius:0 0 10px 10px;overflow:hidden
}
```
Replace with:
```css
.small-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);
  border-radius:10px;overflow:hidden
}
```

- [ ] **Step 5: Add the timeline component CSS**

In `styles.css`, after the `/* SMALL PROJECT GRID */` block (and its rules), add:
```css
/* EXPERIENCE TIMELINE */
.timeline{position:relative;max-width:760px;margin:0 auto}
.timeline::before{
  content:'';position:absolute;left:5px;top:6px;bottom:6px;width:1px;
  background:var(--border-subtle)
}
.timeline-item{position:relative;padding-left:2.5rem;margin-bottom:2.75rem}
.timeline-item:last-child{margin-bottom:0}
.timeline-dot{
  position:absolute;left:0;top:6px;width:11px;height:11px;border-radius:50%;
  background:var(--blue);border:2px solid var(--bg);box-shadow:0 0 0 1px var(--border-subtle)
}
.timeline-header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:.5rem;margin-bottom:.3rem}
.timeline-role{font-family:'Syne',sans-serif;font-size:1.05rem;font-weight:800;color:var(--text);letter-spacing:-.01em}
.timeline-dates{font-size:.72rem;font-weight:500;color:var(--muted);letter-spacing:.03em;white-space:nowrap}
.timeline-company{font-size:.8rem;font-weight:500;color:var(--blue);margin-bottom:.75rem}
.timeline-theme{font-size:.9rem;color:var(--text-dim);line-height:1.7;margin-bottom:.85rem}
.timeline-bullets{list-style:none;margin-bottom:1rem}
.timeline-bullets li{
  font-size:.85rem;color:var(--muted);line-height:1.75;padding-left:1rem;
  position:relative;margin-bottom:.4rem
}
.timeline-bullets li::before{content:'—';position:absolute;left:0;color:var(--border-subtle)}
.timeline-tags{display:flex;flex-wrap:wrap;gap:.35rem}
```

- [ ] **Step 6: Verify in browser**

Open `index.html`. Confirm:
- Selected Work shows 4 cards in a 2x2 grid (desktop) with Gistr/RRE/FraudSentinel/MindGym in that order; RRE shows the new "Private — PM Accelerator" badge in its top-right meta row.
- Experience shows the vertical timeline with 3 entries, most-recent (Gistr) first, dots aligned on a connecting line.
- More Work shows 4 compact cards in a row (desktop), wrapping to fewer columns on narrower widths per the existing `@media(max-width:768px){.featured-grid,.small-grid{grid-template-columns:1fr}}` rule.
- Nav's Experience link now scrolls correctly to the new section.
- No console errors.

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css
git commit -m "feat: restructure homepage into Selected Work, Experience timeline, and More Work"
```

---

## Task 3: Certificates Section

**Files:**
- Modify: `index.html` (insert `<section id="certificates">` between More Work and Contact)
- Modify: `styles.css` (new certificate card component)

**Interfaces:**
- Produces: `#certificates` section, class names `.certs-grid`, `.cert-card`, `.cert-issuer`, `.cert-title`, `.cert-date`, `.cert-view`. No consumer yet outside this task — certificate assets are provided later by the user.

- [ ] **Step 1: Insert the Certificates section**

In `index.html`, immediately before `<!-- CONTACT -->`, insert:
```html
<!-- CERTIFICATES -->
<section id="certificates">
  <div class="section-header reveal">
    <span class="section-num">04</span>
    <h2 class="section-title">Certificates</h2>
    <div class="section-line"></div>
  </div>

  <div class="certs-grid reveal">
    <div class="cert-card">
      <div class="cert-issuer">PM Accelerator</div>
      <h3 class="cert-title">Certified AI Engineer</h3>
      <p class="cert-meta">Issued by Dr. Nancy Li · Certificate No. 72a972f9</p>
      <span class="cert-view" aria-disabled="true">Certificate on request</span>
    </div>

    <div class="cert-card">
      <div class="cert-issuer">Anthropic</div>
      <h3 class="cert-title">Claude &amp; Agent Development</h3>
      <ul class="cert-sublist">
        <li>Claude with the Anthropic API</li>
        <li>Claude Code in Action</li>
        <li>Model Context Protocol (MCP)</li>
        <li>Agent Skills</li>
      </ul>
      <p class="cert-meta">2026</p>
      <span class="cert-view" aria-disabled="true">Certificate on request</span>
    </div>

    <div class="cert-card">
      <div class="cert-issuer">Educosys</div>
      <h3 class="cert-title">Hands-on Generative AI</h3>
      <p class="cert-meta">2025</p>
      <span class="cert-view" aria-disabled="true">Certificate on request</span>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add certificate card CSS**

In `styles.css`, after the timeline CSS block, add:
```css
/* CERTIFICATES */
.certs-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:var(--border);border:1px solid var(--border);
  border-radius:10px;overflow:hidden
}
.cert-card{background:var(--surface);padding:1.75rem;display:flex;flex-direction:column;gap:.5rem}
.cert-issuer{font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--blue)}
.cert-title{font-family:'Syne',sans-serif;font-size:1.05rem;font-weight:800;letter-spacing:-.01em;color:var(--text)}
.cert-sublist{list-style:none;margin:.25rem 0}
.cert-sublist li{font-size:.78rem;color:var(--text-dim);line-height:1.6;padding-left:.9rem;position:relative}
.cert-sublist li::before{content:'—';position:absolute;left:0;color:var(--border-subtle)}
.cert-meta{font-size:.72rem;color:var(--muted)}
.cert-view{
  margin-top:.5rem;font-size:.72rem;font-weight:500;color:var(--muted);
  padding:.4rem .7rem;border:1px dashed var(--border-subtle);border-radius:5px;
  width:fit-content;cursor:not-allowed
}
```

- [ ] **Step 3: Add the mobile grid rule**

In `styles.css`, in the `@media(max-width:768px){...}` block, add `.certs-grid{grid-template-columns:1fr}` next to the existing `.featured-grid,.small-grid{grid-template-columns:1fr}` line.

- [ ] **Step 4: Verify in browser**

Open `index.html`. Confirm 3 certificate cards render with issuer/title/meta and a visibly muted, non-clickable "Certificate on request" tag; Anthropic's card shows the 4-item sub-list. Nav's Certificates link scrolls correctly.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add certificates section"
```

---

## Task 4: AI Portfolio Assistant (Option A — static, keyword-matched)

**Files:**
- Create: `assistant/portfolio-data.js`
- Create: `assistant/assistant-match.js`
- Create: `assistant/assistant-match.test.js`
- Create: `assistant/assistant-widget.js`
- Modify: `index.html` (widget markup + script includes)
- Modify: `styles.css` (widget CSS)

**Interfaces:**
- Produces: `PORTFOLIO_DATA` (global in browser, `module.exports` in Node) — object with `specialties: string[]`, `projects: {id,name,domain,oneLiner,tags:string[]}[]`, `experience: {company,role,dates,summary}[]`.
- Produces: `matchQuestion(query, data)` (global `matchQuestion` in browser, `module.exports` in Node) — pure function, returns `{answer: string}`.
- Consumes (widget only): both of the above, loaded via `<script>` tags before `assistant-widget.js`.

- [ ] **Step 1: Create `assistant/portfolio-data.js`**

```js
(function(root, factory){
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.PORTFOLIO_DATA = factory(); }
})(typeof self !== 'undefined' ? self : this, function(){
  return {
    specialties: [
      "Retrieval-Augmented Generation (RAG)",
      "agentic and multi-agent systems (LangGraph)",
      "LLM integration and evaluation",
      "AI observability (LangSmith, PostHog)",
      "async production backends (FastAPI)"
    ],
    projects: [
      {
        id: "gistr", name: "Gistr — RAG Evaluation", domain: "LLM Evaluation",
        oneLiner: "LLM evaluation and answer-quality work for a live agentic RAG learning platform: reviewed ~250 cases by hand, redesigned the accuracy check, and traced a duplicate-content retrieval bug across 8 production sessions.",
        tags: ["rag", "evaluation", "observability", "llm-as-judge", "agentic"]
      },
      {
        id: "rre", name: "Revenue Recovery Engine", domain: "E-commerce AI",
        oneLiner: "A scrape → critique → prescribe multi-agent pipeline that audits product listings. Scoring stays in code, not the LLM; work is split into Inngest steps to beat a 10-second serverless timeout.",
        tags: ["agentic", "multi-agent", "rag"]
      },
      {
        id: "fraudsentinel", name: "FraudSentinel", domain: "Fraud Detection AI",
        oneLiner: "A three-agent LangGraph workflow (detection, investigation, decision) that flags suspicious transactions. Risk scoring is rule-based and separate from the LLM for deterministic, auditable verdicts.",
        tags: ["agentic", "multi-agent"]
      },
      {
        id: "mindgym", name: "MindGym", domain: "Mental Health AI",
        oneLiner: "A voice-guided mental-performance companion. A single GPT-4o call under a hard 10-second timeout, with a validation layer that rejects unsafe or off-tone output before it reaches the user.",
        tags: ["llm-application"]
      },
      {
        id: "remiminder", name: "RemiMinder", domain: "Healthcare AI",
        oneLiner: "A HIPAA-compliant audio-to-record pipeline on GCP. MedGemma extracts structured clinical fields from consultation audio; ~60-second turnaround on a 15-minute recording.",
        tags: ["llm-application"]
      },
      {
        id: "tickerpulse", name: "TickerPulse", domain: "FinTech AI",
        oneLiner: "A 6-stage financial pipeline: news ingestion → FinBERT sentiment → Z-score anomaly detection → GPT-4 alert summaries.",
        tags: ["llm-application"]
      },
      {
        id: "research-assistant", name: "Autonomous Research Assistant", domain: "Agentic AI",
        oneLiner: "A 6-layer agentic system with Planner/Executor/Synthesizer agents on LangGraph, ChromaDB RAG, and Tavily web search. Built solo in a 13-day hackathon.",
        tags: ["agentic", "rag"]
      },
      {
        id: "discord-bot", name: "Discord RAG Bot", domain: "RAG / NLP",
        oneLiner: "A production-quality Q&A bot on MongoDB Atlas vector storage and SentenceTransformers, with 100% test accuracy on its evaluation set.",
        tags: ["rag"]
      }
    ],
    experience: [
      {
        company: "Gistr", role: "AI Engineer (Contract)", dates: "Jun 2026 – Aug 2026",
        summary: "LLM evaluation and observability for a live agentic RAG product: isolated evaluation system, ~250 hand-reviewed cases, 12 agent tool-waste patterns identified, hand-labelled golden dataset."
      },
      {
        company: "PM Accelerator", role: "AI Engineer (Project-based) · Technical Lead", dates: "Sep 2025 – Jun 2026",
        summary: "Led Python backend development and architecture across 3 concurrent production AI systems in healthcare, financial intelligence, and e-commerce."
      },
      {
        company: "GALTech Technologies", role: "AI Engineer Intern", dates: "Sep 2024 – Aug 2025",
        summary: "Built conversational AI systems on FastAPI backends for production chatbot deployments."
      }
    ]
  };
});
```

- [ ] **Step 2: Write the failing test for `matchQuestion`**

Create `assistant/assistant-match.test.js`:
```js
const test = require('node:test');
const assert = require('node:assert');
const matchQuestion = require('./assistant-match.js');
const PORTFOLIO_DATA = require('./portfolio-data.js');

test('answers "what does Jibin specialize in"', () => {
  const result = matchQuestion('What does Jibin specialize in?', PORTFOLIO_DATA);
  assert.match(result.answer, /Retrieval-Augmented Generation/);
});

test('answers "what is FraudSentinel"', () => {
  const result = matchQuestion('What is FraudSentinel?', PORTFOLIO_DATA);
  assert.match(result.answer, /three-agent LangGraph workflow/);
});

test('answers "what was his role at Gistr"', () => {
  const result = matchQuestion('What was his role at Gistr?', PORTFOLIO_DATA);
  assert.match(result.answer, /AI Engineer \(Contract\)/);
});

test('answers "explain his RAG evaluation experience"', () => {
  const result = matchQuestion('Explain his RAG evaluation experience.', PORTFOLIO_DATA);
  assert.match(result.answer, /250/);
});

test('answers "which projects demonstrate agentic AI experience"', () => {
  const result = matchQuestion('What projects demonstrate agentic AI experience?', PORTFOLIO_DATA);
  assert.match(result.answer, /Revenue Recovery Engine/);
  assert.match(result.answer, /FraudSentinel/);
});

test('falls back honestly on an unanswerable question', () => {
  const result = matchQuestion('What is his favorite pizza topping?', PORTFOLIO_DATA);
  assert.match(result.answer, /don't have that in my portfolio data/);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test assistant/assistant-match.test.js`
Expected: FAIL — `Cannot find module './assistant-match.js'` (file doesn't exist yet).

- [ ] **Step 4: Implement `assistant/assistant-match.js`**

```js
(function(root, factory){
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.matchQuestion = factory(); }
})(typeof self !== 'undefined' ? self : this, function(){

  const FALLBACK = "I don't have that in my portfolio data — try reaching out directly by email or LinkedIn (see the Contact section) and Jibin can answer that himself.";

  function findProject(data, needle){
    const q = needle.toLowerCase();
    return data.projects.find(p => q.includes(p.id) || q.includes(p.name.toLowerCase()));
  }

  function findExperience(data, needle){
    const q = needle.toLowerCase();
    return data.experience.find(e => q.includes(e.company.toLowerCase()));
  }

  const INTENTS = [
    {
      test: q => /specializ|focus(ed)? on|what.*(does|do).*(jibin|he).*(do|build)/.test(q),
      answer: (q, data) => `Jibin specializes in: ${data.specialties.join('; ')}.`
    },
    {
      test: q => /(agentic|multi-?agent).*(project|experience|work)/.test(q),
      answer: (q, data) => {
        const matches = data.projects.filter(p => p.tags.includes('agentic'));
        return `Projects demonstrating agentic AI experience: ${matches.map(p => p.name).join(', ')}. ${matches.map(p => p.oneLiner).join(' ')}`;
      }
    },
    {
      test: q => /rag.*(evaluat|quality)|evaluat.*rag/.test(q),
      answer: (q, data) => {
        const gistr = data.projects.find(p => p.id === 'gistr');
        return gistr ? gistr.oneLiner : FALLBACK;
      }
    },
    {
      test: q => /(technolog|tech stack|tools).*(use|work with)/.test(q),
      answer: (q, data) => {
        const tags = new Set();
        data.projects.forEach(p => p.tags.forEach(t => tags.add(t)));
        return `Jibin's core stack spans ${data.specialties.join(', ')}. Individual project pages list the exact technologies used for each system.`;
      }
    },
    {
      test: q => /(ai|his) (project|work)/.test(q) && !/what is|explain/.test(q),
      answer: (q, data) => `Selected AI projects: ${data.projects.map(p => p.name).join(', ')}. Ask about any one of them by name for details.`
    },
    {
      test: q => /role.*(at|@)\s*\w+|what was his role/.test(q),
      answer: (q, data) => {
        const exp = findExperience(data, q);
        return exp ? `At ${exp.company}: ${exp.role} (${exp.dates}). ${exp.summary}` : FALLBACK;
      }
    },
    {
      test: q => /what is\s+\w+|tell me about\s+\w+/.test(q),
      answer: (q, data) => {
        const proj = findProject(data, q);
        return proj ? proj.oneLiner : FALLBACK;
      }
    }
  ];

  function matchQuestion(query, data){
    const q = (query || '').toLowerCase().trim();
    for (const intent of INTENTS) {
      if (intent.test(q)) {
        const answer = intent.answer(q, data);
        if (answer) return { answer };
      }
    }
    const proj = findProject(data, q);
    if (proj) return { answer: proj.oneLiner };
    return { answer: FALLBACK };
  }

  return matchQuestion;
});
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test assistant/assistant-match.test.js`
Expected: PASS, all 6 tests green.

- [ ] **Step 6: Create the widget UI script**

Create `assistant/assistant-widget.js`:
```js
(function(){
  const EXAMPLE_QUESTIONS = [
    "What does Jibin specialize in?",
    "What is FraudSentinel?",
    "Explain his RAG evaluation experience.",
    "What was his role at Gistr?"
  ];

  function renderMessage(container, text, who){
    const bubble = document.createElement('div');
    bubble.className = `assistant-msg assistant-msg-${who}`;
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function init(){
    const toggle = document.querySelector('.assistant-toggle');
    const panel = document.querySelector('.assistant-panel');
    const messages = document.querySelector('.assistant-messages');
    const form = document.querySelector('.assistant-form');
    const input = document.querySelector('.assistant-input');
    const chips = document.querySelector('.assistant-chips');

    EXAMPLE_QUESTIONS.forEach(q => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'assistant-chip';
      chip.textContent = q;
      chip.addEventListener('click', () => ask(q));
      chips.appendChild(chip);
    });

    function ask(question){
      renderMessage(messages, question, 'user');
      const result = matchQuestion(question, PORTFOLIO_DATA);
      renderMessage(messages, result.answer, 'bot');
    }

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      ask(value);
      input.value = '';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
```

- [ ] **Step 7: Add the widget markup**

In `index.html`, immediately before the closing `</body>`, before the existing `<script>` block, add:
```html
<!-- AI PORTFOLIO ASSISTANT -->
<div class="assistant">
  <button class="assistant-toggle" aria-label="Ask about Jibin's work" aria-expanded="false">Ask AI</button>
  <div class="assistant-panel">
    <div class="assistant-header">
      <span>Ask about Jibin's work</span>
    </div>
    <p class="assistant-note">Answers are drawn only from this portfolio's structured project and experience data.</p>
    <div class="assistant-chips"></div>
    <div class="assistant-messages"></div>
    <form class="assistant-form">
      <input class="assistant-input" type="text" placeholder="Ask a question…" autocomplete="off"/>
      <button class="btn-primary" type="submit">Send</button>
    </form>
  </div>
</div>

<script src="assistant/portfolio-data.js"></script>
<script src="assistant/assistant-match.js"></script>
<script src="assistant/assistant-widget.js"></script>
```

- [ ] **Step 8: Add widget CSS**

In `styles.css`, after the certificate CSS block, add:
```css
/* AI ASSISTANT */
.assistant{position:fixed;bottom:1.5rem;right:1.5rem;z-index:200}
.assistant-toggle{
  padding:.75rem 1.3rem;background:var(--blue);color:#0d1117;
  font-size:.8rem;font-weight:600;border:none;border-radius:24px;cursor:pointer;
  box-shadow:0 4px 20px rgba(0,0,0,.35);transition:transform .15s
}
.assistant-toggle:hover{transform:translateY(-1px)}
.assistant-panel{
  display:none;position:absolute;bottom:3.5rem;right:0;width:340px;max-height:480px;
  background:var(--surface);border:1px solid var(--border-subtle);border-radius:12px;
  box-shadow:0 8px 32px rgba(0,0,0,.45);padding:1.1rem;flex-direction:column;gap:.75rem
}
.assistant-panel.open{display:flex}
.assistant-header{font-family:'Syne',sans-serif;font-weight:800;font-size:.9rem;color:var(--text)}
.assistant-note{font-size:.7rem;color:var(--muted);line-height:1.5}
.assistant-chips{display:flex;flex-wrap:wrap;gap:.4rem}
.assistant-chip{
  font-size:.68rem;padding:.35rem .6rem;background:var(--surface2);color:var(--text-dim);
  border:1px solid var(--border-subtle);border-radius:5px;cursor:pointer;text-align:left
}
.assistant-chip:hover{border-color:var(--blue);color:var(--blue)}
.assistant-messages{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.5rem;max-height:220px}
.assistant-msg{font-size:.78rem;line-height:1.6;padding:.55rem .75rem;border-radius:8px;max-width:90%}
.assistant-msg-user{align-self:flex-end;background:var(--blue);color:#0d1117}
.assistant-msg-bot{align-self:flex-start;background:var(--surface2);color:var(--text-dim);border:1px solid var(--border)}
.assistant-form{display:flex;gap:.5rem}
.assistant-input{
  flex:1;padding:.55rem .7rem;background:var(--surface2);border:1px solid var(--border-subtle);
  border-radius:6px;color:var(--text);font-size:.78rem;font-family:'Inter',sans-serif
}
.assistant-form .btn-primary{padding:.55rem 1rem;font-size:.75rem}
@media(max-width:768px){
  .assistant-panel{width:calc(100vw - 3rem);right:-0.5rem}
}
```

- [ ] **Step 9: Verify in browser**

Open `index.html`. Confirm: "Ask AI" button floats bottom-right; clicking opens the panel with 4 example-question chips; clicking a chip renders both the question and a grounded answer; typing an out-of-scope question (e.g. "what's his favorite food") returns the honest fallback, not an invented answer. No console errors.

- [ ] **Step 10: Commit**

```bash
git add assistant/ index.html styles.css
git commit -m "feat: add static keyword-matched AI portfolio assistant"
```

---

## Task 5: Gistr — RAG Evaluation Case Study

**Files:**
- Create: `case-studies/gistr-rag-evaluation.html`
- Modify: `index.html` (Gistr card's `project-link`)

**Interfaces:**
- Consumes: `styles.css`, `case-study.css` (existing, reused unchanged).

**Source material already available (from `.claude/resume.md` and `.claude/PROJECTS/gistr-rag-evaluation.md`):**
> LLM evaluation and answer quality for an online learning platform built on agentic RAG. Built an isolated LLM evaluation system for answer accuracy, so testing could never affect live users. Reviewed ~250 cases by hand and found the existing accuracy check was measuring the wrong part of the pipeline; redesigned it to catch answers the AI invented or could not support with a source. Defined 12 agent tool-waste patterns and found two retrieval tools returning duplicate content, confirmed across 8 production sessions. Created a hand-labelled golden dataset and version-controlled evaluation prompts to validate automated scores against ground truth. Delivered findings and remediation recommendations directly to the engineering team.
> Role: AI Engineer (Contract), Jun–Aug 2026. Stack: Python, PostHog, LangSmith, LLM-as-judge, agent-as-judge, agentic RAG, AI agents, LangGraph, FastAPI, agent trace analysis.

**Not yet confirmed** — see the open questions logged in `.claude/PROJECTS/gistr-rag-evaluation.md`: exact retrieval architecture (candidate retrieval → reranker → final TOP_K — designed by the user or evaluated as existing infra?), what `evidence_found`/`evidence_recall`/`correctness`/`correct_given_evidence` each measured, any defensible before/after numbers, whether BAAI/bge-reranker-base was selected/tuned by the user.

- [ ] **Step 1: Interview the user for what's missing**

The source material above covers Overview, Problem, Approach, and most of Technical Decisions and Evaluation. It does **not** cover:
- **Architecture**: confirm the actual retrieval flow before diagramming it — is it candidate retrieval → reranking (BAAI/bge-reranker-base) → final TOP_K, as mentioned in chat but not yet detailed? Did the user design this, evaluate an existing one, or something else? Ask one question at a time; do not assume the chat-message list of terms (TOP_K, evidence_recall, etc.) maps onto a specific architecture until confirmed.
- **Evaluation metrics**: what did `evidence_found`, `evidence_recall`, `correctness`, `correct_given_evidence` each measure? Whose definitions were they?
- **Challenges & Trade-offs**: at least one concrete difficulty (e.g., getting reviewer agreement on the golden dataset, isolating the eval system from production safely, disagreements about what "correct" meant) and how it was actually handled.
- **Results**: any defensible before/after numbers, or — if none exist — what changed qualitatively as a result of the work (e.g., "the team fixed the duplicate-retrieval-tool bug" is fine without a number attached).
- **Lessons Learned**: what the user would do differently, or what this engagement taught them about evaluating production LLM systems.

Do not proceed to Step 2 until these are answered. Update `.claude/PROJECTS/gistr-rag-evaluation.md` with the confirmed answers once gathered, so future sessions don't re-ask.

- [ ] **Step 2: Draft `case-studies/gistr-rag-evaluation.html`**

Use this skeleton, filling `[[...]]` markers with the source material above and the Step 1 interview answers. Everything outside `[[...]]` is final:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Gistr — RAG Evaluation Case Study | Jibin Kunjumon</title>
<meta name="description" content="[[1-sentence description grounded in the confirmed content]]"/>
<meta property="og:title" content="Gistr — RAG Evaluation Case Study | Jibin Kunjumon"/>
<meta property="og:description" content="[[same 1-sentence description as the meta description above]]"/>
<meta property="og:type" content="article"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../styles.css"/>
<link rel="stylesheet" href="../case-study.css"/>
</head>
<body>

<nav>
  <div class="nav-logo"><a href="../index.html" style="color:inherit;text-decoration:none">Jibin<span>.</span></a></div>
  <ul class="nav-links">
    <li><a href="../index.html#hero">Home</a></li>
    <li><a href="../index.html#experience">Experience</a></li>
    <li><a href="../index.html#projects">Projects</a></li>
    <li><a href="../index.html#certificates">Certificates</a></li>
    <li><a href="../index.html#contact">Contact</a></li>
  </ul>
</nav>

<div class="case-study-breadcrumb">
  <a href="../index.html#projects">← Back to Projects</a>
</div>

<header class="case-study-header">
  <div class="case-study-meta">
    <span class="project-domain">LLM Evaluation</span>
    <span class="role-badge">AI Engineer (Contract)</span>
  </div>
  <h1 class="case-study-title">Gistr — RAG Evaluation</h1>
</header>

<article class="case-study-body">
  <h2>Overview</h2>
  <p>[[2-3 paragraphs from source material: what the engagement was, the platform's RAG architecture at a high level, why evaluation mattered here]]</p>

  <h2>The Problem</h2>
  <p>[[What was broken/unknown before this work — the existing accuracy check measuring the wrong part of the pipeline, tool-waste going undetected — from source material]]</p>

  <h2>Architecture</h2>
  <div class="arch-diagram">
    [[arch-box / arch-arrow elements reflecting the confirmed retrieval flow from Step 1]]
  </div>
  <p>[[1 short paragraph explaining the diagram, grounded in confirmed answers]]</p>

  <h2>Approach &amp; My Role</h2>
  <p>[[Isolated evaluation system design, golden dataset creation, version-controlled eval prompts — from source material]]</p>

  <h2>Technical Decisions</h2>
  <h3>Redesigning the accuracy check</h3>
  <p>[[Why the original check measured the wrong thing, what it caught instead after the redesign — from source material]]</p>
  <h3>Isolating evaluation from production</h3>
  <p>[[Why testing couldn't be allowed to affect live users, how isolation was achieved — from source material]]</p>

  <h2>Evaluation</h2>
  <p>[[Golden dataset, LLM-as-judge/agent-as-judge workflow, the 12 tool-waste patterns and the duplicate-content finding across 8 sessions, metric definitions from Step 1 — from source material + interview]]</p>

  <h2>Challenges</h2>
  <p>[[From Step 1 interview answer — real friction, not invented]]</p>

  <h2>Results</h2>
  <p>[[From Step 1 interview answer — grounded, no invented metrics]]</p>

  <h2>Lessons Learned</h2>
  <p>[[From Step 1 interview answer]]</p>

  <h2>Tech Stack</h2>
  <div class="tech-badges">
    <span class="badge">Python</span>
    <span class="badge">LangSmith</span>
    <span class="badge">PostHog</span>
    <span class="badge">LangGraph</span>
    <span class="badge">FastAPI</span>
    <span class="badge">LLM-as-judge</span>
    <span class="badge">agent-as-judge</span>
  </div>

  <h2>GitHub &amp; Demo</h2>
  <p>Private engagement — code and evaluation artifacts belong to Gistr and aren't publicly shareable. [[adjust wording per Step 1 answers if the user wants to add anything, e.g. a sanitized writeup link]]</p>
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

Open `case-studies/gistr-rag-evaluation.html` directly. Confirm nav/breadcrumb link correctly to `../index.html` and its anchors, all sections render in order, architecture diagram (if used) lays out correctly at desktop and mobile widths, no console errors.

- [ ] **Step 4: User review**

Walk the user through what was drafted for each section (not just "done"). Wait for explicit approval or requested changes before proceeding. Iterate Steps 2-3 until approved.

- [ ] **Step 5: Wire up the homepage link**

In `index.html`, find the Gistr card's link:
```html
<a class="project-link" href="#">Contract — Gistr</a>
```
Replace with:
```html
<a class="project-link" href="case-studies/gistr-rag-evaluation.html">Read Case Study</a>
```

- [ ] **Step 6: Verify and commit**

Click through from the homepage card to the case study and back via the breadcrumb. Then:
```bash
git add case-studies/gistr-rag-evaluation.html index.html
git commit -m "feat: add Gistr RAG evaluation case study"
```

---

## Task 6: FraudSentinel Case Study

**Files:**
- Create: `case-studies/fraudsentinel.html`
- Modify: `index.html` (FraudSentinel card's `project-link`)

**Interfaces:** Same pattern as Task 5.

**Source material already available (from `.claude/resume.md`):**
> Flags suspicious transactions and explains why in language a human reviewer can act on, instead of a black-box risk score. Built a three-agent detection, investigation, and decision workflow on LangGraph with shared state and checkpointing after every stage. Kept risk scoring rule-based and separate from the LLM for deterministic, auditable verdicts. Added async concurrent checks, idempotency, and retry logic.
> Stack: Python, FastAPI, LangGraph, Llama 3.3 70B, Supabase, pgvector, Next.js. Role: Solo Builder (confirmed by user). Status: Private.

- [ ] **Step 1: Interview the user for what's missing**

Missing from source material:
- **Architecture**: confirm the exact three-agent flow and where checkpointing/state live — resume implies `detection → investigation → decision` with shared state; confirm this order and any surrounding components (e.g., where does the transaction data enter, where does Supabase/pgvector sit) before diagramming it as fact.
- **Challenges**: a real difficulty — candidates suggested by the domain: tuning the DETECTOR to avoid false positives, keeping the INVESTIGATOR's LLM reasoning from leaking into the deterministic risk score, idempotency edge cases under concurrent load, or something else. Ask, don't assume.
- **Results**: any defensible outcome (even qualitative — e.g., "the system correctly flagged X pattern in testing") — no invented numbers.
- **Lessons Learned**: what the user would do differently; what building this solo taught them.

Do not proceed to Step 2 until these are answered.

- [ ] **Step 2: Draft `case-studies/fraudsentinel.html`**

Same skeleton structure as Task 5 Step 2, with these changes:
- `<title>FraudSentinel — Case Study | Jibin Kunjumon</title>`, matching `og:title`; `meta description` and `og:description` set to a 1-sentence summary grounded in the confirmed content (same pattern as Task 5).
- `case-study-meta`: `<span class="project-domain">Fraud Detection AI</span><span class="role-badge">Solo Builder</span>`
- `case-study-title`: `FraudSentinel`
- Section content: Overview/Problem/Approach/Technical Decisions drafted from the source material above (Technical Decisions should cover at minimum: (a) why risk scoring is rule-based and separate from the LLM, (b) why the workflow is split into 3 specialized agents with checkpointing rather than one large agent); Architecture/Challenges/Results/Lessons Learned from Step 1 interview answers.
- Tech Stack badges: `Python`, `FastAPI`, `LangGraph`, `Llama 3.3 70B`, `Supabase`, `pgvector`, `Next.js`.
- No dedicated Evaluation section content exists in source material — if the Step 1 interview surfaces real evaluation/testing detail (e.g., how verdicts were checked for accuracy), include an Evaluation section; otherwise omit it rather than inventing one (per spec: diagram/section-optional where nothing is documented).
- `GitHub & Demo` section (same heading/position as Task 5, after Tech Stack): "Private project — code isn't publicly shared. [[adjust per Step 1 answers if the user wants to add anything]]"

- [ ] **Step 3: Verify in browser**

Same checklist as Task 5 Step 3, applied to `case-studies/fraudsentinel.html`.

- [ ] **Step 4: User review**

Same as Task 5 Step 4.

- [ ] **Step 5: Wire up the homepage link**

In `index.html`, find:
```html
<a class="project-link" href="#">Private</a>
```
within the FraudSentinel card specifically, and replace with:
```html
<a class="project-link" href="case-studies/fraudsentinel.html">Read Case Study</a>
```

- [ ] **Step 6: Verify and commit**

```bash
git add case-studies/fraudsentinel.html index.html
git commit -m "feat: add FraudSentinel case study"
```

---

## Task 7: MindGym Case Study

**Files:**
- Create: `case-studies/mindgym.html`
- Modify: `index.html` (MindGym card's `project-link`)

**Interfaces:** Same pattern as Task 5.

**Source material already available (from `.claude/resume.md`):**
> A voice-guided coaching app that adapts its tone to how the user is feeling. The hard problem was safety: building it so the AI cannot produce an unsafe or off-tone response. Used a single LLM call instead of a multi-agent chain to stay under a hard 10-second timeout, with instant fallback responses on failure. Tone is controlled outside the model by a lookup table, so it does not drift across a 5-phase session. Owned the full stack and the streaming audio pipeline, including prefetch, text fallback, and a validation layer that blocks unsafe responses before they reach the user.
> Stack: Python, FastAPI, OpenAI GPT-4o, ElevenLabs, Supabase (PostgreSQL), Pydantic v2, Next.js, Railway. Role: Founding Engineer (carried forward from the live site, not resume-stated — confirmed non-contradicted per spec's Open Items). Status: Live.

- [ ] **Step 1: Interview the user for what's missing**

Missing from source material:
- **Architecture**: confirm the request flow — e.g. user speaks → (transcription, if any) → single GPT-4o call (static system prompt + dynamic user prompt + tone lookup) → validation layer → ElevenLabs streaming synthesis → playback. Confirm before diagramming as fact; resume doesn't state whether there's a speech-to-text step.
- **Challenges**: a real difficulty — candidates suggested by the domain: tuning the validation layer without over-blocking legitimate responses, ElevenLabs streaming/latency issues, iOS autoplay quirks. Ask, don't assume.
- **Results**: any defensible outcome (live status is already known; ask if there's anything further, e.g. usage, retention, specific validation-layer catch examples).
- **Lessons Learned**: what building MindGym solo/as founding engineer taught the user.

Do not proceed to Step 2 until these are answered.

- [ ] **Step 2: Draft `case-studies/mindgym.html`**

Same skeleton as Task 5 Step 2, with:
- `<title>MindGym — Case Study | Jibin Kunjumon</title>`, matching `og:title`; `meta description` and `og:description` set to a 1-sentence summary grounded in the confirmed content (same pattern as Task 5).
- `case-study-meta`: `<span class="project-domain">Mental Health AI</span><span class="role-badge">Founding Engineer</span>`
- `case-study-title`: `MindGym`
- Technical Decisions covers at minimum: (a) single LLM call vs. multi-agent chain and the 10-second timeout that drove it, (b) tone handled by a lookup table outside the model, (c) the validation layer rejecting unsafe/off-tone output.
- Tech Stack badges: `Python`, `FastAPI`, `GPT-4o`, `ElevenLabs`, `Supabase`, `Pydantic v2`, `Next.js`, `Railway`.
- `GitHub & Demo` section (same heading/position as Task 5, after Tech Stack): "Private project — no public repo or demo link available. [[adjust per Step 1 answers if the user wants to add anything]]"

- [ ] **Step 3: Verify in browser**

Same checklist as Task 5 Step 3, applied to `case-studies/mindgym.html`.

- [ ] **Step 4: User review**

Same as Task 5 Step 4.

- [ ] **Step 5: Wire up the homepage link**

In `index.html`, find the MindGym card's:
```html
<a class="project-link" href="#">Private</a>
```
Replace with:
```html
<a class="project-link" href="case-studies/mindgym.html">Read Case Study</a>
```

- [ ] **Step 6: Verify and commit**

```bash
git add case-studies/mindgym.html index.html
git commit -m "feat: add MindGym case study"
```

---

## Task 8: Revenue Recovery Engine Case Study

**Files:**
- Create: `case-studies/revenue-recovery-engine.html`
- Modify: `index.html` (RRE card's `project-link`)

**Interfaces:** Same pattern as Task 5.

**Source material already available (from `.claude/resume.md`):**
> Turns a slow, manual product-listing audit into a paste-a-URL workflow that gives a merchant specific description fixes to reduce returns. As Technical Lead, defined the boundary between LLM reasoning and deterministic logic, and set the step-based pipeline pattern the team built around. Built scrape, critique, and prescribe agents. Kept scoring in code rather than the LLM so results cannot be invented, and split work into steps to beat a hard 10-second serverless timeout.
> Stack: Python, Next.js, TypeScript, Inngest, Supabase, pgvector, Google Gemini, Zod, Vercel, Apify. Role: Technical Lead. Status: Private (PM Accelerator).

- [ ] **Step 1: Interview the user for what's missing**

Missing from source material:
- **Architecture**: confirm the scrape → critique → prescribe stage names and surrounding components — does scraping happen inside the "scrape" agent via Apify, or is there a separate ingestion step? Where do Supabase/pgvector and Gemini sit in the flow? Confirm before diagramming.
- **Challenges**: a real difficulty — candidates suggested by the domain: scraping reliability against changing page structures, the agent handoff design, Gemini output quality/consistency, or something else. Ask, don't assume.
- **Results**: any defensible outcome grounded in what shipped — no invented business metrics.
- **Lessons Learned**: what the user would do differently as Technical Lead; what this taught them about setting architecture patterns for a team.

Do not proceed to Step 2 until these are answered.

- [ ] **Step 2: Draft `case-studies/revenue-recovery-engine.html`**

Same skeleton as Task 5 Step 2, with:
- `<title>Revenue Recovery Engine — Case Study | Jibin Kunjumon</title>`, matching `og:title`; `meta description` and `og:description` set to a 1-sentence summary grounded in the confirmed content (same pattern as Task 5).
- `case-study-meta`: `<span class="project-domain">E-commerce AI</span><span class="role-badge">Tech Lead</span>`
- `case-study-title`: `Revenue Recovery Engine`
- Technical Decisions covers at minimum: (a) keeping scoring and yes/no decisions in code, not the LLM, (b) the Inngest step-boundary pattern used to beat Vercel's 10-second timeout, and the trade-off/rejected-alternative behind each, from Step 1.
- Tech Stack badges: `Python`, `Next.js`, `TypeScript`, `Inngest`, `Supabase`, `pgvector`, `Google Gemini`, `Zod`, `Vercel`, `Apify`.
- `GitHub & Demo` section (same heading/position as Task 5, after Tech Stack): "Private project — built for PM Accelerator, code isn't publicly shared. [[adjust per Step 1 answers if the user wants to add anything]]"

- [ ] **Step 3: Verify in browser**

Same checklist as Task 5 Step 3, applied to `case-studies/revenue-recovery-engine.html`.

- [ ] **Step 4: User review**

Same as Task 5 Step 4.

- [ ] **Step 5: Wire up the homepage link**

In `index.html`, find the RRE card's:
```html
<a class="project-link" href="#">Private — PM Accelerator</a>
```
Replace with:
```html
<a class="project-link" href="case-studies/revenue-recovery-engine.html">Read Case Study</a>
```
(The `prod-badge status-deployed` "Private — PM Accelerator" badge added in Task 2 stays — it's a separate element from this link, and continues to communicate status after the link text changes.)

- [ ] **Step 6: Verify and commit**

```bash
git add case-studies/revenue-recovery-engine.html index.html
git commit -m "feat: add Revenue Recovery Engine case study"
```

---

## Task 9: Final Integration Check

**Files:** None created/modified — verification only.

- [ ] **Step 1: Full click-through**

Open `index.html` fresh. Click all 4 flagship "Read Case Study" links in sequence; confirm each opens the right page. From each case-study page, click every nav link and the breadcrumb; confirm correct destinations back to `index.html` and its anchors (`#hero`, `#experience`, `#projects`, `#certificates`, `#contact`).

- [ ] **Step 2: Mobile check**

Resize the browser below 768px (or use DevTools device emulation). Confirm: hamburger menu opens/closes correctly and closes on link click; hero, Selected Work (stacks to 1 column), Experience timeline, More Work (stacks to 1 column), Certificates (stacks to 1 column), and the assistant panel (fits within viewport width) all render without horizontal overflow.

- [ ] **Step 3: Assistant sanity check**

Open the assistant on both `index.html` and one case-study page. Ask each of the 7 example questions from the spec (What does Jibin specialize in? / Tell me about his AI projects. / What is FraudSentinel? / Explain his RAG evaluation experience. / What technologies does he use? / What was his role at Gistr? / What projects demonstrate agentic AI experience?). Confirm every answer is grounded and non-empty. Ask one deliberately out-of-scope question and confirm the honest fallback appears, not an invented answer.

- [ ] **Step 4: Run the full assistant test suite**

Run: `node --test assistant/`
Expected: all tests pass.

- [ ] **Step 5: Confirm no orphaned references**

Run: `grep -rn "#stack\|#about" index.html case-studies/`
Expected: no matches (Stack/About sections and any lingering anchor links to them are fully removed).

- [ ] **Step 6: Confirm commit history**

Run: `git log --oneline -12`
Expected: 8 feature commits (nav/hero foundation, homepage restructure, certificates, assistant, and 4 case studies) on top of the spec commit — 9 commits total on the `redesign/ai-engineer-portfolio` branch.
