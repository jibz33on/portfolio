/**
 * PORTFOLIO CORPUS — the assistant's only source of truth.
 *
 * MAINTENANCE CONTRACT
 * --------------------
 * The public portfolio is the source of truth. This file MIRRORS it, by hand.
 *
 * When you add, change, or remove a project, role, or certificate on the site,
 * you MUST update this file in the same change. `npm test` fails loudly if you
 * forget — see assistant/corpus-drift.test.js.
 *
 * Headings matter: `### ` entries must match site entity names exactly
 * (project names, company names, certificate titles). The drift test checks
 * both directions, so an invented `### ` heading fails the suite.
 *
 * DISCLOSURE RULES — these carry over to anything added later.
 * Publish: the problem, the role, high-level architecture, key engineering
 * decisions, challenges, outcomes.
 * Do NOT publish: internal implementation detail, private metrics, exact model
 * names or parameter values withheld from the public case studies, or anything
 * not already appropriate for the public site.
 * This file is publicly readable. Never put anything here that is not already
 * on the site.
 *
 * Never add content from .claude/resume.md — it is private and gitignored.
 */
export const CORPUS = `
## Profile

Jibin Kunjumon is an AI Engineer working in GenAI, agentic systems, and LLM
evaluation. His positioning: "The model proposes. My code decides."

Five production systems shipped across healthcare, fintech, and e-commerce,
plus hands-on LLM evaluation and observability work on a live agentic RAG
product. Each was built so the model can reason and draft, but the decision
that matters runs through deterministic, auditable code.

Headline figures shown on the site: 5 systems shipped, 3 domains, 250+
evaluation cases reviewed.

Specialties: Retrieval-Augmented Generation (RAG); agentic and multi-agent
systems (LangGraph); LLM integration and evaluation; AI observability
(LangSmith, PostHog); async production backends (FastAPI).

Education: B.Tech, CUSAT. M.Acc, Deakin University, Australia.

Availability: open to full-time AI Engineer roles and interesting
collaborations. Do not characterise his current employment status beyond this —
the engagement dates under Experience are the only other established facts.

## Experience

### Gistr
AI Engineer (Contract). Jun 2026 – Aug 2026. Remote.
LLM evaluation and observability for a live agentic RAG product.
- Built an isolated LLM evaluation system for answer accuracy, so testing could
  never affect live users.
- Reviewed ~250 cases by hand and found the existing accuracy check was
  measuring the wrong part of the pipeline — redesigned it to catch answers the
  AI invented or couldn't support with a source.
- Defined 12 agent tool-waste patterns and found two retrieval tools returning
  duplicate content, confirmed across 8 production sessions.
- Created a hand-labelled golden dataset and version-controlled evaluation
  prompts to validate automated scores against ground truth.
Technologies: LangSmith, PostHog, LLM-as-judge, agent-as-judge, LangGraph,
FastAPI.

### PM Accelerator
AI Engineer (Project-based) · Technical Lead. Sep 2025 – Jun 2026. Kochi, India
(Remote).
Backend and architecture lead across 3 concurrent production AI systems.
- Led Python backend development across 3 concurrent production AI systems in
  healthcare, financial intelligence, and e-commerce.
- Acted as Technical Lead across 3 cross-functional teams, owning architecture
  decisions and reviewing code through structured pull requests.
- Worked with product managers, frontend engineers, and non-technical
  stakeholders to turn business requirements into deployed AI systems.
Technologies: Python, FastAPI, LangGraph, LangChain, PostgreSQL, GCP.

### GALTech Technologies
AI Engineer Intern. Sep 2024 – Aug 2025. Kerala, India.
Conversational AI systems on production FastAPI backends.
- Built conversational AI systems on FastAPI backends with session management,
  conversation flow, and API integrations for production chatbot deployments.
Technologies: Python, FastAPI, Conversational AI.

## Projects

Eight projects in total. The first four have full case studies on the site and
are described in depth here. The remaining four are supporting work.

### Gistr — RAG Evaluation
Domain: LLM Evaluation. Role: AI Engineer (Contract). Private engagement.

Gistr is an online learning platform built on agentic Retrieval-Augmented
Generation. Over a three-month contract Jibin worked on LLM evaluation and
answer quality. This was not a system he built from scratch — it was evaluation
and diagnostic work on an existing, live production RAG pipeline.

Problem: the product's existing accuracy check was measuring the wrong part of
the pipeline. It could pass an answer that sounded right without verifying it
was actually grounded in retrieved evidence, so genuine failure modes — the AI
inventing an answer, or asserting something the evidence didn't support — could
slip through undetected.

Architecture of the pipeline he evaluated: query, candidate retrieval,
reranking, final top-ranked evidence selection, answer generation. His
evaluation measured quality at each stage independently rather than treating
the end answer as a single pass/fail outcome.

His role: built an isolated LLM evaluation system, designed so evaluation runs
could never affect live users or production data. Reviewed real cases by hand
to understand actual failure patterns, designed evaluation criteria that
separated retrieval quality from answer correctness, and built a hand-labelled
golden dataset with version-controlled evaluation prompts so automated scores
could be validated against real ground truth. He also investigated how the
system's tools were used during multi-step agent runs, looking for wasted or
redundant calls.

Key decisions: separating evidence quality from answer correctness, so a poor
result traces to the retrieval side or the generation side specifically rather
than collapsing several failure modes into one number; and isolating evaluation
from production so iteration could happen safely and often.

Challenge: ambiguous evaluation cases. Some answers were correct but backed by
weak evidence, some had strong evidence the model failed to use, and some
couldn't be supported by the available evidence at all. Making those
distinctions consistently enough to diagnose the system — rather than just
produce a score — was the hard part.

Results: reviewing roughly 250 cases by hand surfaced that the existing
accuracy check was measuring the wrong part of the pipeline; he redesigned it
to catch answers the AI invented or couldn't support with a source. The same
review identified 12 distinct patterns of wasted or redundant agent tool use,
including two retrieval tools returning duplicate content, confirmed across 8
separate production sessions. Findings and remediation recommendations went
directly to the engineering team.

Lessons: retrieval quality, evidence quality, and answer correctness need to be
measured separately. Evaluation datasets need to represent real production
failure modes — a benchmark can make a system look healthy while missing
problems that only appear in real traffic.

Technologies: Python, LangSmith, PostHog, LangGraph, FastAPI, LLM-as-judge,
agent-as-judge.

### Revenue Recovery Engine
Domain: E-commerce AI. Role: Tech Lead. Private — built at PM Accelerator.

Turns a slow, manual product-listing audit into a paste-a-URL workflow that
gives a merchant specific description fixes to reduce returns.

Problem: auditing a listing for the gaps that lead to returns — missing
details, ambiguous sizing, unclear specifications — is slow and inconsistent
done manually. Generic AI feedback isn't useful either; what helps is specific,
actionable description fixes tied to real evidence from the listing.

Architecture: listing URL, scrape, critique, prescribe, description fixes.
Scraping via Apify, Gemini for LLM reasoning, Supabase/pgvector and Zod schemas
for the data and validation layer. Because the full multi-agent workflow risked
exceeding the serverless platform's execution-time limit, the pipeline runs as
a series of durable Inngest steps rather than one long-running request.

His role as Technical Lead: defined the boundary between LLM reasoning and
deterministic logic, set the step-based pipeline pattern the team built around,
and coordinated implementation so everyone understood the stage boundaries,
inputs and outputs.

Key decisions: scoring and pass/fail decisions run in code rather than the LLM,
so results can't be invented — the model contributes reasoning and drafting,
but the decision that has to be right stays deterministic and auditable. And
splitting the workflow into durable Inngest steps: the harder part wasn't
adopting Inngest, it was deciding where the step boundaries should go so the
workflow stayed understandable without turning every operation into its own
step.

Challenge: designing the multi-agent workflow around a hard execution-time
constraint, then communicating those stage boundaries across a team building
different parts of the pipeline.

Results: structured as an end-to-end multi-stage system rather than a single
long-running request. The outcome worth pointing at is the workflow structure
itself — a workable agentic architecture with clear stage boundaries,
coordinated across a team. No quantitative business-impact figures are claimed.

Technologies: Python, Next.js 15, TypeScript, Inngest, Supabase, pgvector,
Google Gemini, Zod, Vercel, Apify.

### FraudSentinel
Domain: Fraud Detection AI. Role: Solo Builder. Private.

A three-agent fraud investigation workflow built solo on LangGraph. It flags
suspicious transactions and produces a verdict a human reviewer can act on —
why something was flagged, not just a black-box risk score.

Problem: fraud systems tend to fail in one of two directions — an opaque score
a reviewer can't interrogate, or an LLM given unrestricted authority to call a
transaction fraudulent, which makes the decision hard to reproduce or audit.
Neither is good enough for a decision with real financial consequences.

Architecture: transaction, Detector, Investigator, Decision, deterministic risk
scoring and verdict. The Detector screens for suspicious signals and has no
authority to declare a verdict. If flagged, the Investigator gathers broader
context via Supabase/pgvector. The Decision stage receives everything
accumulated and produces the final verdict — but the risk score itself is
calculated by deterministic, rule-based logic kept separate from the LLM. The
three stages share state through LangGraph with checkpointing.

Key decisions: keeping risk scoring deterministic and separate from the LLM, so
a fraud verdict is explainable and reproducible; splitting into three narrower,
testable stages rather than one large agent, with the Detector explicitly
denied final authority; and designing for concurrency, idempotency, and retries
from the start rather than bolting reliability on later.

Challenge: maintaining a clean boundary between LLM-based investigation and
deterministic risk scoring. It would have been easy to let the LLM's
interpretation influence the final score, but that would make the decision
harder to reproduce and audit.

Results: demonstrated the intended end-to-end workflow combining agent-based
investigation with deterministic risk scoring. The result worth emphasising is
the separation itself — agents analyse and gather context while the final risk
assessment stays deterministic and traceable to its evidence. No accuracy,
precision, recall, or fraud-detection-rate figures are claimed; none are
documented.

Lessons: adding more agents doesn't automatically make a system better — each
needs a clear responsibility and a reason to exist. Agentic architecture should
be justified by the problem, not used simply because multiple agents are
possible.

Technologies: Python, FastAPI, LangGraph, Llama 3.3 70B, Supabase, pgvector,
Next.js.

### MindGym
Domain: Mental Health AI. Role: Founding Engineer. Live in production.

A voice-guided mental-performance coaching app, built by a small team. It
generates a personalised five-phase coaching session that adapts its tone to
how the user is feeling, then delivers it as spoken audio.

Important: Jibin worked as an AI Engineer as part of a team. He was primarily
responsible for the AI systems — the session-generation pipeline, the
validation layer around model output, and related implementation and code
review — while collaborating with the rest of the team on the surrounding
product. He was not a solo builder and did not personally build every part of
the product.

Problem: the hard problem wasn't generating a session, it was safety and
reliability. The AI had to be built so it couldn't produce an unsafe or
off-tone response, tone couldn't drift across a multi-phase session, every
response had to complete inside a hard latency budget, and the experience had
to hold up when audio playback failed on a real device.

Architecture: structured session input, FastAPI, a single streamed GPT-4o call
generating five coaching phases (Breathe, Ground, Rehearse, Anchor, Close), a
validation layer, then per-phase ElevenLabs text-to-speech with the next
phase's audio prefetched while the current one plays. If audio generation or
playback fails, the session text remains available as a fallback.

Key decisions: a single LLM call instead of a multi-agent chain, because a hard
10-second timeout made a chain too much latency risk for too little benefit;
tone controlled outside the model by a lookup table mapping user state to a
per-phase tone arc, so tone can't drift; and a validation layer that can reject
the model's own output before it reaches the user.

Challenge: making voice output reliable across browsers, especially on iOS,
where autoplay and user-interaction restrictions could make playback fail even
though the audio had generated successfully. The challenge wasn't generating
audio, it was designing playback so an audio failure never broke the coaching
experience.

Results: reached a live, usable production state with the complete flow working
end to end. The result worth emphasising is resilience — the experience doesn't
depend on every AI or audio component succeeding. No production usage
statistics or performance figures are claimed.

Technologies: Python, FastAPI, GPT-4o, ElevenLabs, Supabase, Pydantic v2,
Next.js, Railway.

### RemiMinder
Domain: Healthcare AI. Role: Founding Engineer. Deployed. Private.
HIPAA-compliant audio-to-record pipeline on GCP. MedGemma extracts structured
clinical fields from consultation audio; Gemini summarises. Roughly 60-second
turnaround on a 15-minute recording.
Technologies: Python, FastAPI, GCP, MedGemma.

### TickerPulse
Domain: FinTech AI. Role: Tech Lead. Code on GitHub.
A 6-stage financial ML pipeline: news ingestion, FinBERT sentiment, Z-score
anomaly detection, GPT-4 alert summaries. JWT auth, watchlist API, and a
React/TypeScript frontend.
Technologies: Python, FastAPI, FinBERT, GPT-4, PostgreSQL.

### Autonomous Research Assistant
Domain: Agentic AI. Role: Solo, hackathon — 13 days. Code on GitHub.
A 6-layer agentic system with Planner, Executor, and Synthesizer agents via
LangGraph, ChromaDB RAG, and Tavily web search. Built bottom-to-top in 13 days
solo.
Technologies: LangGraph, GPT-4o-mini, ChromaDB, Tavily, Streamlit.

### Discord RAG Bot
Domain: RAG / NLP. Academic project. Code on GitHub.
A production-quality Q&A bot using MongoDB Atlas vector storage,
SentenceTransformers (384-dim embeddings), and Azure OpenAI GPT-3.5 Turbo. 100%
test accuracy on its evaluation set, 69.2% average token overlap.
Technologies: Azure OpenAI, MongoDB Atlas, SentenceTransformers, Discord.py.

## Certificates

### Certified AI Engineer
Issued by PM Accelerator, by Dr. Nancy Li. Certificate No. 72a972f9.

### Claude & Agent Development
Issued by Anthropic, 2026. Covers Claude with the Anthropic API, Claude Code in
Action, Model Context Protocol (MCP), and Agent Skills.

### Hands-on Generative AI
Issued by Educosys, 2025.

## Contact

Email: jibz33on@gmail.com
LinkedIn: linkedin.com/in/jibin-kunjumon
GitHub: github.com/jibz33on

For anything not covered here — deeper technical detail, private project
internals, availability, or compensation — the right answer is to contact him
directly by email or LinkedIn.
`;
