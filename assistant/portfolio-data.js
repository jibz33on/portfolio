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
