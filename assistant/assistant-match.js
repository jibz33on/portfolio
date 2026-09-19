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
