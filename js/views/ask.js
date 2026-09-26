import { card, esc, section } from '../components.js';
import { answer, suggestedQuestions } from '../ask.js';

export function render(state) {
  const chips = suggestedQuestions()
    .map((q) => `<button class="btn ask__chip" data-q="${esc(q)}">${esc(q)}</button>`)
    .join('');
  return `
  <div class="page-head">
    <div class="eyebrow">Plain questions</div>
    <h1>Ask the desk</h1>
    <p class="page-head__lead">Answers come only from records stored in this tool. There is no model here, so a figure cannot be invented: if a question is not recognised, the answer is "not recorded" and the records behind every answer are listed.</p>
  </div>
  ${section({
    title: 'Ask',
    body: card({ body: `
      <form id="ask-form" class="toolbar" style="margin-bottom:4px">
        <input id="ask-input" type="text" placeholder="e.g. how many orders are there?" style="flex:1;min-width:220px" autocomplete="off" />
        <button class="btn--primary" type="submit">Answer</button>
      </form>
      <div class="ask__chips">${chips}</div>
      <div id="ask-answer" class="stack"></div>
    ` }),
  })}
  `;
}

function answerHtml(result) {
  const tone = result.matched ? '' : ' callout--risk';
  const source = result.source && result.source.length
    ? `Read from: ${result.source.map(esc).join(', ')}`
    : 'No records were read for this answer.';
  return `<div class="answer${result.matched ? '' : ' answer--unmatched'}">
    <div class="answer__q">${esc(result.title || 'Answer')}</div>
    <div class="answer__body" style="white-space:pre-wrap">${esc(result.body)}</div>
    <div class="answer__source">${source}</div>
  </div>`;
}

export function mount(state, params, root) {
  const form = root.querySelector('#ask-form');
  const input = root.querySelector('#ask-input');
  const out = root.querySelector('#ask-answer');
  if (!form || !out) return;

  const askRun = (q) => {
    const result = answer(state, q);
    out.innerHTML = answerHtml(result);
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    askRun(input.value);
  });
  root.querySelectorAll('[data-q]').forEach((btn) => {
    btn.addEventListener('click', () => { input.value = btn.getAttribute('data-q'); askRun(input.value); });
  });
}
