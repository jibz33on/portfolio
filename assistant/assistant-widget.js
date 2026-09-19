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
