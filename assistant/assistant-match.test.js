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
