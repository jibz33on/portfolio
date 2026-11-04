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
  const UNAVAILABLE = "Elsa is temporarily unavailable. You can reach Jibin directly at jibz33on@gmail.com or on LinkedIn.";
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
    let mode = 'text';
    let frame = null;
    let changing = false;
    let requestAbort = null;
    let epoch = 0;
    const voiceUrl = new URL(document.documentElement.dataset.elsaVoiceUrl || 'https://voice.handballai.tech/jibin');
    // Only the fixed approved service, or an explicit localhost preview, may host voice.
    if(!['https://voice.handballai.tech','https://voice-ai-receptionist-staging.handballai-au.workers.dev'].includes(voiceUrl.origin) && !(location.hostname==='localhost' || location.hostname==='127.0.0.1')) return;
    toggle.textContent = 'Ask Elsa';
    document.querySelector('.assistant-header span').textContent = 'Elsa · Ask about Jibin';
    document.querySelector('.assistant-note').textContent = 'Type or talk about Jibin’s work. Switching starts a new conversation. Voice enquiries can be saved and emailed to Jibin; full voice transcripts are not stored.';
    input.setAttribute('aria-label','Your question for Elsa');
    messages.setAttribute('role','log');
    messages.setAttribute('aria-live','polite');
    const modes=document.createElement('div');modes.className='assistant-modes';
    modes.setAttribute('aria-label','Conversation mode');
    const buttons={};
    for(const [value,label] of [['text','Type'],['voice','Talk']]){
      const button=document.createElement('button');button.type='button';button.className='assistant-mode';button.textContent=label;
      button.setAttribute('aria-pressed',String(value===mode));button.addEventListener('click',()=>{void changeMode(value);});
      modes.appendChild(button);buttons[value]=button;
    }
    document.querySelector('.assistant-header').after(modes);
    const voice=document.createElement('div');voice.className='assistant-voice';voice.hidden=true;
    panel.appendChild(voice);
    const dialog=document.createElement('dialog');dialog.className='assistant-switch-dialog';
    const heading=document.createElement('h2');heading.id='assistant-switch-title';heading.textContent='Start a new conversation?';
    const explanation=document.createElement('p');explanation.textContent='Switching between text and voice starts a new conversation. Your previous messages won’t carry over.';
    dialog.setAttribute('aria-labelledby',heading.id);
    const choices=document.createElement('form');choices.method='dialog';
    for(const [value,label] of [['stay','Stay here'],['switch','Switch']]){
      const button=document.createElement('button');button.value=value;button.textContent=label;choices.appendChild(button);
    }
    dialog.append(heading,explanation,choices);document.body.appendChild(dialog);

    function confirmSwitch(){
      return new Promise(resolve=>{dialog.returnValue='stay';dialog.addEventListener('close',()=>resolve(dialog.returnValue==='switch'),{once:true});dialog.showModal();choices.querySelector('button').focus();});
    }
    async function stopVoice(){
      const current=frame;if(!current)return;
      // Detach at once so a quick reopen gets a fresh frame while this one saves and closes.
      frame=null;current.hidden=true;
      await new Promise(resolve=>{
        let timeout;
        const done=()=>{clearTimeout(timeout);window.removeEventListener('message',receive);resolve();};
        const receive=event=>{if(event.source===current.contentWindow && event.origin===voiceUrl.origin && event.data?.type==='elsa:stopped')done();};
        window.addEventListener('message',receive);timeout=setTimeout(done,1500);
        current.contentWindow?.postMessage({type:'elsa:stop'},voiceUrl.origin);
      });
      current.remove();
    }
    function showVoice(){
      if(frame)return;
      frame=document.createElement('iframe');frame.title='Talk to Elsa about Jibin';frame.src=voiceUrl.href;
      frame.allow='microphone; autoplay';frame.referrerPolicy='strict-origin-when-cross-origin';voice.appendChild(frame);
    }
    function resetText(){requestAbort?.abort();requestAbort=null;epoch++;history.length=0;userTurns=0;messages.replaceChildren();input.value='';chips.hidden=false;setBusy(false);}
    async function changeMode(next){
      if(changing || mode===next)return;
      changing=true;
      try{
        if((history.length || busy || frame) && !await confirmSwitch())return;
        if(mode==='voice')await stopVoice();
        resetText();mode=next;
        messages.hidden=form.hidden=chips.hidden=mode==='voice';voice.hidden=mode!=='voice';
        for(const value of ['text','voice'])buttons[value].setAttribute('aria-pressed',String(value===mode));
        if(mode==='voice')showVoice();else input.focus();
      }finally{changing=false;}
    }
    window.addEventListener('message',event=>{
      if(event.source!==frame?.contentWindow || event.origin!==voiceUrl.origin || event.data?.type!=='elsa:close')return;
      void stopVoice();panel.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();
    });
    window.addEventListener('pagehide',()=>{frame?.remove();frame=null;requestAbort?.abort();});

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
      if (busy || mode!=='text' || changing) return;
      if (userTurns >= MAX_USER_TURNS){
        renderMessage(messages, LIMIT_REACHED, 'bot');
        return;
      }

      // The example questions are onboarding. Once a conversation is under way
      // they are just chrome, and the ~124px they occupy is worth more to the
      // transcript than to a prompt the visitor has already acted on.
      chips.hidden = true;

      renderMessage(messages, question, 'user');
      history.push({ role: 'user', content: question });
      userTurns++;
      setBusy(true);

      const pending = renderMessage(messages, '…', 'bot');
      const generation=epoch;
      const controller=new AbortController();requestAbort=controller;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        if (!res.ok) throw new Error('request failed');
        const data = await res.json();
        if (typeof data.reply !== 'string') throw new Error('bad response');

        if(generation!==epoch)return;
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
        if(generation!==epoch)return;
        pending.textContent = UNAVAILABLE;
        // Roll back so a failed turn does not poison later context.
        history.pop();
        userTurns--;
      } finally {
        if(generation===epoch){
        requestAbort=null;setBusy(false);
        if (userTurns >= MAX_USER_TURNS) input.disabled = true;
        }
      }
    }

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if(!isOpen){void stopVoice();}else if(mode==='voice')showVoice();else input.focus();
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
