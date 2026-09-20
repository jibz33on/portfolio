(function(){
  const EXAMPLE_QUESTIONS = [
    "What does Jibin specialize in?",
    "What is FraudSentinel?",
    "Explain his RAG evaluation experience.",
    "What was his role at Gistr?"
  ];

  const MAX_USER_TURNS = 10;
  // Mirrors MAX_ASSISTANT_CONTENT_CHARS in chat-core.js. This widget is a plain
  // script on five pages, so it cannot import the constant. History must only
  // ever hold messages the endpoint will accept back, otherwise one long reply
  // wedges every later turn in the session.
  const MAX_REPLY_HISTORY_CHARS = 2000;
  const UNAVAILABLE = "Ask AI is temporarily unavailable. You can reach Jibin directly at jibz33on@gmail.com or on LinkedIn.";
  const LIMIT_REACHED = "That's the end of this conversation. For more, reach Jibin directly at jibz33on@gmail.com or on LinkedIn.";

  function renderMessage(container, text, who){
    const bubble = document.createElement('div');
    bubble.className = `assistant-msg assistant-msg-${who}`;
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }

  function init(){
    const toggle = document.querySelector('.assistant-toggle');
    const panel = document.querySelector('.assistant-panel');
    const messages = document.querySelector('.assistant-messages');
    const form = document.querySelector('.assistant-form');
    const input = document.querySelector('.assistant-input');
    const chips = document.querySelector('.assistant-chips');

    // Session-only. Deliberately not persisted anywhere.
    const history = [];
    let userTurns = 0;
    let busy = false;

    EXAMPLE_QUESTIONS.forEach(q => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'assistant-chip';
      chip.textContent = q;
      chip.addEventListener('click', () => ask(q));
      chips.appendChild(chip);
    });

    function setBusy(state){
      busy = state;
      input.disabled = state;
    }

    async function ask(question){
      if (busy) return;
      if (userTurns >= MAX_USER_TURNS){
        renderMessage(messages, LIMIT_REACHED, 'bot');
        return;
      }

      renderMessage(messages, question, 'user');
      history.push({ role: 'user', content: question });
      userTurns++;
      setBusy(true);

      const pending = renderMessage(messages, '…', 'bot');

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        if (!res.ok) throw new Error('request failed');
        const data = await res.json();
        if (typeof data.reply !== 'string') throw new Error('bad response');

        pending.textContent = data.reply;
        // Store a reply only if it is whole and replayable. A reply the server
        // rejects would wedge the conversation; one cut off at max_tokens would
        // become half-a-sentence of "established context" for every later turn.
        const isStorable =
          data.reply.length <= MAX_REPLY_HISTORY_CHARS && data.truncated !== true;
        if (isStorable) {
          history.push({ role: 'assistant', content: data.reply });
        } else {
          // Answered on screen, but not remembered. Drop the question it
          // answered so history stays an alternation the endpoint accepts.
          history.pop();
        }
      } catch {
        pending.textContent = UNAVAILABLE;
        // Roll back so a failed turn does not poison later context.
        history.pop();
        userTurns--;
      } finally {
        setBusy(false);
        if (userTurns >= MAX_USER_TURNS) input.disabled = true;
      }
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
