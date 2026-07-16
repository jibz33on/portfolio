# Case Study Pages — Design Spec

Date: 2026-07-16
Status: Approved

## Goal

Add dedicated case-study pages for the 3 flagship projects (Revenue Recovery Engine, RemiMinder, MindGym) linked from the existing homepage project cards. This is **not** a redesign — the single-scroll homepage stays as-is except for one link per featured card.

## Audience & Voice

AI engineering hiring managers, senior engineers, technical founders, recruiters. They care about engineering decisions and trade-offs, not marketing copy.

Voice: direct, technical, honest, practical, specific. No buzzwords (innovative, cutting-edge, leveraged, results-driven, world-class, seamless, revolutionized, "robust solution"). No invented metrics or responsibilities.

## File Structure

```
portfolio/
├── index.html                          (inline <style> → <link href="styles.css">)
├── styles.css                          (NEW — extracted shared styles)
├── case-study.css                      (NEW — shared case-study-page-only styles)
└── case-studies/
    ├── revenue-recovery-engine.html
    ├── remiminder.html
    └── mindgym.html
```

- `styles.css`: everything currently in `index.html`'s `<style>` block (CSS variables, nav, buttons, section layout, badges, reveal animation, etc.), extracted verbatim so the homepage renders identically.
- `case-study.css`: shared rules used only by case-study pages (article layout, section spacing, decision sub-headings, architecture diagram boxes). Loaded in addition to `styles.css`. No page gets its own inline `<style>` block — any new styling need goes into this shared file so all 3 pages stay visually identical and future case studies (roadmap item) can reuse it without duplication.

## Homepage Change (the only change to index.html content)

On each of the 3 featured cards, replace:
```html
<a class="project-link" href="#">Private — PM Accelerator</a>
```
(and the two `Private` variants) with:
```html
<a class="project-link" href="case-studies/<slug>.html">Read Case Study</a>
```
The existing top-right status badge (`prod-badge` / `status-deployed`) still communicates Deployed/Live for RemiMinder and MindGym — no information is lost there. RRE has no such badge today (its "Private — PM Accelerator" status lives only in the link text), so RRE's card gets a new `<span class="prod-badge status-deployed">Private — PM Accelerator</span>` added to its `project-meta` row — reusing the existing muted, no-animation badge style — before its link is swapped, so the status isn't silently dropped. Nothing else on the homepage changes.

## Case-Study Page Template

**Nav**: identical to homepage (logo → `../index.html`, Projects/Stack/About/Contact → `../index.html#section`), plus a `← Back to Projects` breadcrumb above the title.

**Title area**: project name (Syne display font, smaller scale than the homepage hero), domain + role badges reused from the card component.

**Body copy**: reuses `.about-text p` styling for prose sections.

**Tech Stack section**: reuses `.tech-badges` / `.badge` exactly as on the project cards.

**Footer**: same site footer as homepage, unchanged.

### Section order (per user's required structure)

1. Overview
2. The Problem
3. My Role
4. Technical Approach
5. **Architecture** (new — added after Technical Approach)
6. Key Engineering Decisions
7. Challenges & Trade-offs
8. Outcome
9. Tech Stack
10. Reflection

**Architecture section**: a simple architecture / request-flow diagram where applicable, built as plain HTML + CSS (flexbox boxes connected by arrow characters), styled to match existing components (e.g. reusing the bordered-box look of `.stack-item`/`.badge`). No diagram library (mermaid, etc.) — stays dependency-free and consistent with "lightweight JS, no unnecessary libraries." If a project's architecture doesn't lend itself to a simple linear/branching diagram, this section can be diagram-optional and rely on the prose description instead — never force a diagram that misrepresents the system.

**Key Engineering Decisions**: each decision as an `<h3>` sub-heading (short, specific, e.g. "Why Inngest step boundaries") followed by a paragraph explaining the decision, the trade-off, and the rejected alternative where known. This is the section the user explicitly called "most important" — must read as engineering reasoning, not a tech list.

Every other section (Overview, Problem, My Role, Challenges, Outcome, Reflection) is prose paragraphs, no special components needed.

## Content Rules

- Every case study must be unique — if the project name were removed, a reader should still be able to tell which project it is.
- No invented metrics, responsibilities, or outcomes.
- Prioritize decisions, trade-offs, debugging, architecture, evaluation, and learning over feature lists.
- Where information is missing (mainly **Challenges & Trade-offs** and **Reflection**, which resume.md doesn't cover), interview the user one question at a time before drafting. Do not draft a section until there's enough real information to write it accurately.

## Build Order

1. Infra first: extract `styles.css`, create empty `case-study.css`, switch `index.html` to link both, verify homepage is pixel-identical in browser.
2. Revenue Recovery Engine — interview → draft → user review → approve.
3. RemiMinder — interview → draft → user review → approve.
4. MindGym — interview → draft → user review → approve.
5. Update the 3 homepage card links once each corresponding page exists (can be done incrementally, one link per approved case study, rather than all 3 at once).

## Out of Scope

- No homepage redesign.
- No case studies for the 3 non-flagship projects (TickerPulse, Research Assistant, Discord bot) — not requested, not "flagship."
- No Bio or CTA blocks repeated on case-study pages (not part of the required structure).
- No Voice Card / Before-After sections (superseded by the structure in this spec).
