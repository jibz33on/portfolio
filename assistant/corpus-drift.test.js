import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { CORPUS } from './corpus.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// The site stores entity names HTML-escaped (e.g. "Claude &amp; Agent
// Development"). The corpus is plain text, so decode before comparing or the
// comparison fails on punctuation rather than on real drift.
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractAll(regex) {
  return [...html.matchAll(regex)].map(m => decodeEntities(m[1]).trim());
}

// Strip trailing location, e.g. "Gistr · Remote" -> "Gistr"
const companyName = s => s.split('·')[0].trim();

const projects = extractAll(/<h3 class="project-name">([^<]+)<\/h3>/g);
const companies = extractAll(/<div class="timeline-company">([^<]+)<\/div>/g).map(companyName);
const certs = extractAll(/<h3 class="cert-title">([^<]+)<\/h3>/g);
const caseStudies = readdirSync(new URL('../case-studies/', import.meta.url))
  .filter(f => f.endsWith('.html'));

// Guard against vacuous passes: if the markup changes, extraction silently
// yields zero entities and every "each extracted X is present" assertion
// passes while checking nothing.
test('extractors find a plausible number of entities', () => {
  assert.ok(projects.length >= 8, `extractor found ${projects.length} projects — has the markup changed?`);
  assert.ok(companies.length >= 3, `extractor found ${companies.length} companies — has the markup changed?`);
  assert.ok(certs.length >= 3, `extractor found ${certs.length} certificates — has the markup changed?`);
  assert.ok(caseStudies.length >= 4, `found ${caseStudies.length} case studies — has the directory changed?`);
});

test('every project on the site appears in the corpus', () => {
  for (const name of projects) {
    assert.ok(CORPUS.includes(name), `Project "${name}" is on the site but missing from assistant/corpus.js — add it.`);
  }
});

test('every experience company on the site appears in the corpus', () => {
  for (const name of companies) {
    assert.ok(CORPUS.includes(name), `Company "${name}" is on the site but missing from assistant/corpus.js — add it.`);
  }
});

test('every certificate on the site appears in the corpus', () => {
  for (const name of certs) {
    assert.ok(CORPUS.includes(name), `Certificate "${name}" is on the site but missing from assistant/corpus.js — add it.`);
  }
});

test('corpus names no project that has been removed from the site', () => {
  // Reverse direction: catches stale entries after a project is deleted.
  const headings = [...CORPUS.matchAll(/^### (.+)$/gm)].map(m => m[1].trim());
  const known = new Set([...projects, ...companies, ...certs]);
  for (const h of headings) {
    assert.ok(known.has(h), `Corpus has a "### ${h}" entry not found on the site — remove it or restore the site entry.`);
  }
});
