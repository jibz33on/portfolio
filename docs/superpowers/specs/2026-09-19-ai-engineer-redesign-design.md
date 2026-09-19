# AI Engineer Portfolio Redesign — Design Spec

Date: 2026-09-19
Status: Approved (pending user's written-spec review)
Supersedes: `docs/superpowers/specs/2026-07-16-case-study-pages-design.md` (case-study page structure is extended, not replaced — CSS foundation from that spec is reused)

## Goal

Reposition the portfolio from a general AI-engineer showcase to a portfolio that leads with production engineering judgment, RAG/agentic systems, and — newly — LLM evaluation and observability experience (Gistr). Redesign is deliberate and substantial (explicitly authorized, overriding `CLAUDE.md`'s default "prefer small improvements" guidance), not cosmetic.

A separately reviewed reference portfolio informed information architecture, visual hierarchy, interaction patterns, and the AI-assistant concept only. No identity, wording, projects, achievements, images, or metrics were taken from it — all content below is sourced from `.claude/resume.md` (updated 2026-09-19) and `.claude/PROJECTS/gistr-rag-evaluation.md`.

## Audience & Voice

Unchanged from the existing case-study spec: AI engineering hiring managers, CTOs, founders, recruiters. Direct, technical, honest, specific. No buzzwords, no invented metrics, no invented responsibilities. Source of truth is `.claude/resume.md` and `.claude/PROJECTS/`; where those are silent, the section either isn't written yet or is drafted through a live interview with the user (same rule as the prior case-study spec).

## Current State (confirmed via repository audit, 2026-09-19)

- Static site, no framework, no build step. `index.html` + `styles.css` + `case-study.css`, deployed via Cloudflare Pages auto-deploy on push to `main`.
- No certificate assets exist in the repo.
- Prior case-study spec/plan exists for RRE/RemiMinder/MindGym (Tasks 1-2 done: `styles.css` extraction, `case-study.css`). Task 3 (RRE draft) was discarded by the user before this redesign began.
- Resume conflict resolved: old resume (referenced by the live site's "Currently Tech Lead at PM Accelerator" copy) is stale. Current resume shows PM Accelerator ended June 2026, Gistr (Jun–Aug 2026) also ended. User confirmed actual status: **available, no current role.**
- FraudSentinel is a real resume project with zero presence on the current site.

## Information Architecture

Single-page site (no router, no framework — constraint: do not migrate off static HTML/CSS/JS/Cloudflare Pages without a concrete engineering reason; none exists here).

`Home → Experience → Projects → Certificates → Contact`, plus a floating AI assistant available on every page (homepage and case-study pages).

"Stack" is removed as a nav destination/section (decision: confirmed). Technology stays visible via a compact strip on Home and the existing badge component on every project card and case-study page — never a standalone checklist section.

## Navigation

Fixed top nav, same visual treatment as today (blurred sticky bar): `Jibin.` logo | Home / Experience / Projects / Certificates / Contact | **Let's Talk** (primary-button style, links to `#contact`).

**New: mobile navigation.** Current site has no mobile menu — nav links simply `display:none` below 768px with no replacement. Add a hamburger toggle that opens a slide-in/dropdown panel with the same links, vanilla JS (`classList.toggle`), no dependencies. This closes an existing accessibility/usability gap, not a cosmetic addition.

## Homepage Layout

1. **Hero** — availability status ("Available — open to full-time AI Engineer roles · Remote · India-based"; no present-tense employer claim), a concise positioning line naming RAG, agentic systems, LLM evaluation/observability, and production engineering (grounded in resume summary + Gistr work — not "student" framing), primary CTA (View Projects), secondary CTA (Let's Talk or GitHub), a small metrics strip (see Stats below), education line kept as today (B.Tech CUSAT · M.Acc Deakin).
2. **Selected Work** — the 4 flagship project cards (see Featured Projects below), each linking to its case-study page.
3. **Experience** — vertical timeline (see below).
4. **More Work** — secondary tier: RemiMinder, TickerPulse, Autonomous Research Assistant, Discord RAG Bot as compact cards (GitHub link only, no case study).
5. **Certificates** — certificate cards (see below).
6. **Contact** — mailto + GitHub + LinkedIn + Let's Talk CTA. No contact form (decision: confirmed, mailto-only, zero new infrastructure).
7. **Footer** — unchanged.

**Stats strip** (replaces the current "3 AI Systems Built / 1yr / 3 Domains / 6+ Production Deploys" box, which doesn't map cleanly to the updated resume and conflates built-systems with evaluation work): recount honestly, e.g. "5 systems shipped" (MindGym, FraudSentinel, RRE, TickerPulse, RemiMinder — Gistr excluded from this count since it's evaluation work on an existing product, not a system authored end-to-end) + a separate callout for LLM evaluation experience (Gistr) rather than folding it into the same number. Exact wording drafted during implementation, grounded only in resume content.

## Experience Section

Vertical timeline, most-recent-first:

1. **Gistr** — AI Engineer (Contract), Jun–Aug 2026. Theme: LLM evaluation & observability for a live agentic RAG product. Bullets drawn verbatim-grounded from `.claude/resume.md`: isolated eval system, ~250 hand-reviewed cases redesigning the accuracy check, 12 agent tool-waste patterns / duplicate-content bug found across 8 production sessions, hand-labelled golden dataset + version-controlled eval prompts, findings delivered to engineering. Tags: LangSmith, PostHog, LLM-as-judge, agent-as-judge, LangGraph, FastAPI.
2. **PM Accelerator** — AI Engineer (Project-based) / Technical Lead, Sep 2025–Jun 2026. Theme: backend + architecture lead across 3 concurrent production AI systems.
3. **GALTech Technologies** — AI Engineer Intern, Sep 2024–Aug 2025. Theme: conversational AI on FastAPI.

Each entry: role/company/dates, theme line, 3-4 bullets, tech tags. No metrics beyond what's in `.claude/resume.md` or the confirmed portion of `.claude/PROJECTS/gistr-rag-evaluation.md`.

## Project Hierarchy & Featured Selection

**Flagship (4, full case-study pages), in this order:**

1. **Gistr — RAG Evaluation & Observability** (new case study; no public repo — presented as an engineering case study of evaluation work, same page structure as project case studies minus a GitHub/demo link)
2. **Revenue Recovery Engine** (Technical Lead)
3. **FraudSentinel** (new to the site — currently absent despite being a full resume project)
4. **MindGym**

**Secondary tier (compact cards, GitHub link, no case study):** RemiMinder, TickerPulse AI, Autonomous Research Assistant, Discord RAG Bot.

## Case-Study Page Structure

Extends the existing approved case-study CSS foundation (`case-study.css`: breadcrumb, header, body typography, `.arch-diagram`/`.arch-box`/`.arch-arrow` — all reused as-is, no rebuild).

Section order (supersedes the 10-section order in the 2026-07-16 spec):

`Overview → Problem → Architecture → Approach & My Role → Technical Decisions → Evaluation → Challenges → Results → Lessons Learned → Tech Stack → GitHub/Demo`

- **Architecture**: diagram-optional per project (reuse `.arch-diagram` where a linear/branching flow applies; rely on prose otherwise — same rule as before).
- **Evaluation** (new section): for Gistr this is the core of the page (golden datasets, LLM-as-judge, trace analysis, tool-waste patterns). For RRE/FraudSentinel/MindGym it covers how correctness/safety was actually verified — only what's documented; if nothing is documented for a given project, the section is omitted rather than invented.
- **Technical Decisions**: same treatment as the prior spec's "Key Engineering Decisions" — each decision as an `<h3>` sub-heading, explaining the decision, trade-off, and rejected alternative where known. This remains the most important section.
- Same interview-before-drafting rule as the prior spec for anything not covered by `.claude/resume.md` or `.claude/PROJECTS/` (primarily Challenges and Lessons Learned for each project, and most of Gistr's page pending the open questions in `gistr-rag-evaluation.md`).
- Every case study must remain identifiable without its project name in the text (uniqueness rule, unchanged).

## Certificates Section

Cards for: **PM Accelerator** "Certified AI Engineer" (Cert #72a972f9), **Anthropic** (one card covering the 4 credentials: Claude with the Anthropic API, Claude Code in Action, MCP, Agent Skills — sub-list, not 4 separate cards), **Educosys** "Hands-on Generative AI" (2025).

Each card ships now with issuer/title/date. The "view certificate" affordance is visibly disabled/muted (e.g. "Certificate on request") until real assets exist — **no placeholder or fabricated certificate images.** Once the user provides assets (`.claude/PROJECTS/` or a new `assets/certificates/` — user's choice at upload time), wire up a lightweight click-to-enlarge (plain JS lightbox, no library) per card.

## AI Portfolio Assistant

**Scope for this redesign (decision: confirmed): Option A only.**

- Floating widget (button → panel), available on every page.
- Answers drawn from a single structured `portfolio-data.json` (or `.js` module) — the same file the project cards and experience timeline are ideally sourced from, so there is one place facts live, not two (avoids drift between what the page shows and what the assistant says).
- Matching is keyword/rule-based in vanilla JS — no LLM call, no API key, no backend. This is not a lesser version of "the real thing"; it is the correct architecture for the stated constraint ("answer ONLY using structured portfolio data," "never invent") — a keyword-matched lookup is structurally incapable of inventing an answer, where an LLM-backed version would require prompt-injection defenses to guarantee the same property.
- Unanswerable questions get an honest fallback ("I don't have that in my portfolio data — try [email/LinkedIn]"), never a guess.
- **Explicitly out of scope for this redesign:** Option B (a real LLM call via a Cloudflare Pages Function, grounded/RAG'd over the same JSON). Documented here as the future phase; requires a separate, explicit decision from the user before implementation (API key provisioning, secret storage, cost, rate-limiting, prompt-injection review).

## Files & Components

**New:**
- Experience timeline markup + CSS (in `styles.css`, new `/* EXPERIENCE */` block)
- Certificates section markup + CSS
- Mobile nav: hamburger toggle + panel, CSS + small inline/external JS
- Assistant widget: HTML/CSS/JS + `portfolio-data.json`
- Case-study pages: `case-studies/gistr-rag-evaluation.html`, `case-studies/fraudsentinel.html`, `case-studies/mindgym.html`, `case-studies/revenue-recovery-engine.html` (restarted clean)
- Secondary-tier compact cards for RemiMinder/TickerPulse/Research Assistant/Discord bot (RemiMinder moves out of the flagship grid it's never occupied — currently all 3 flagship slots are RRE/RemiMinder/MindGym, so this also changes which projects sit in which grid)

**Modified:**
- `index.html` — hero copy, nav markup (+ hamburger), Stack section removed, About section folded into Home bio + Experience (its "Currently Tech Lead" line was stale regardless of this redesign), Projects section restructured into flagship + secondary tiers, Certificates section added, stats strip recounted.
- `styles.css` — new component styles (experience timeline, certificates, mobile nav, assistant widget).
- `case-study.css` — extended for the Evaluation section (likely reuses existing `.case-study-body h2/h3/p` — confirm no new classes needed during implementation).

**Preserved as-is:** color tokens/dark theme, Inter + Syne fonts, scroll-reveal (`fadeUp`/`pulse`/`.reveal`) animation system, card/badge visual language, footer, static Cloudflare Pages deployment (no build step introduced anywhere in this spec).

## Content Rules (unchanged from prior spec, reaffirmed)

- No invented metrics, responsibilities, outcomes, or certificates.
- Voice: direct, technical, honest, specific — no buzzwords.
- Source of truth: `.claude/resume.md`, `.claude/PROJECTS/*.md`. Where both are silent, interview the user one question at a time before drafting — do not draft ahead of confirmed information.
- Assistant answers are constrained to the same structured data — never freeform generation.

## Open Items (non-blocking, confirm during implementation)

- Whether to link the resume PDF (`docs/Resume/Jibin_Kunjumon_2026.pdf`) for download from the hero/Contact. No decision recorded — default to **not linking** until user confirms (the file lives outside `.claude/`, in a git-tracked location, so linking it would publish the PDF as-is; confirm the PDF itself is meant to be public before wiring it up).
- "Founding Engineer" role labels on MindGym/RemiMinder are on the live site today but not stated in `.claude/resume.md`. Not contradicted, just not resume-sourced — carry forward as-is (pre-existing, unchanged by this redesign) unless the user flags them as wrong.
- Gistr deeper technical detail (TOP_K, evidence_recall, reranker design, etc.) remains in `.claude/PROJECTS/gistr-rag-evaluation.md` as open questions — the Gistr case study can ship with confirmed resume-sourced content alone if the user doesn't expand on it before implementation reaches that page.
- Whether a profile photo is wanted in the hero — none exists today; default to **no photo** (matches current site) unless requested.
- Featured-card grid currently supports 3 columns (`.featured-grid{grid-template-columns:repeat(3,1fr)}`); moving to 4 flagship projects requires a layout change (e.g. 2x2 grid or a 4-column row that wraps on smaller screens) — implementation detail, not a design change, but noted so it isn't missed.

## Out of Scope

- Option B of the AI assistant (real LLM backend) — documented above as a future phase only.
- Any framework/build-step migration (Next.js or otherwise).
- A working contact form (mailto-only, confirmed).
- Certificate image assets (user provides later).
- RemiMinder full case-study page (moved to secondary tier; can be promoted later if the user changes their mind).
