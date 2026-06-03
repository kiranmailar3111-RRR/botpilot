(function () {
  const botId = document.currentScript.getAttribute('data-bot-id');
  const botName = document.currentScript.getAttribute('data-bot-name') || 'Assistant';
  const brandColor = document.currentScript.getAttribute('data-color') || '#185FA5';
  const apiUrl = 'http://localhost:5000/api/chat';

  // ── Styles ──────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #bf-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${brandColor}; color: #fff;
      border: none; font-size: 26px; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 99999; transition: transform .2s;
    }
    #bf-btn:hover { transform: scale(1.1); }
    #bf-window {
      position: fixed; bottom: 90px; right: 24px;
      width: 360px; height: 500px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: none; flex-direction: column;
      overflow: hidden; z-index: 99998;
      font-family: sans-serif;
    }
    #bf-window.open { display: flex; }
    #bf-header {
      background: ${brandColor}; color: #fff;
      padding: 14px 18px; font-size: 15px; font-weight: 600;
      display: flex; justify-content: space-between; align-items: center;
    }
    #bf-close {
      background: transparent; border: none;
      color: #fff; font-size: 20px; cursor: pointer; line-height: 1;
    }
    #bf-messages {
      flex: 1; padding: 14px;
      overflow-y: auto; display: flex;
      flex-direction: column; gap: 10px;
    }
    .bf-bubble {
      max-width: 78%; padding: 10px 13px;
      border-radius: 12px; font-size: 13px; line-height: 1.5;
      white-space: pre-wrap; word-break: break-word;
    }
    .bf-bot { background: #f1f1f1; color: #333; align-self: flex-start; }
    .bf-user { background: ${brandColor}; color: #fff; align-self: flex-end; }
    #bf-input-row {
      display: flex; padding: 10px;
      border-top: 1px solid #eee; gap: 8px;
    }
    #bf-input {
      flex: 1; padding: 9px 12px;
      border: 1px solid #ddd; border-radius: 8px;
      font-size: 13px; outline: none;
    }
    #bf-send {
      padding: 9px 16px; background: ${brandColor};
      color: #fff; border: none; border-radius: 8px;
      font-size: 13px; cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="bf-btn">💬</button>
    <div id="bf-window">
      <div id="bf-header">
        <span>💬 ${botName}</span>
        <button id="bf-close">✕</button>
      </div>
      <div id="bf-messages">
        <div class="bf-bubble bf-bot">👋 Hi! I am ${botName}. How can I help you?</div>
      </div>
      <div id="bf-input-row">
        <input id="bf-input" placeholder="Type a message..." />
        <button id="bf-send">Send</button>
      </div>
    </div>
  `);

  // ── Logic ─────────────────────────────────────────────
  const btn = document.getElementById('bf-btn');
  const win = document.getElementById('bf-window');
  const closeBtn = document.getElementById('bf-close');
  const input = document.getElementById('bf-input');
  const sendBtn = document.getElementById('bf-send');
  const messages = document.getElementById('bf-messages');

  btn.onclick = () => win.classList.toggle('open');
  closeBtn.onclick = () => win.classList.remove('open');

  function addMsg(text, role) {
    const div = document.createElement('div');
    div.className = `bf-bubble bf-${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    sendBtn.disabled = true;
    addMsg('Typing...', 'bot');

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, botId })
      });
      const data = await res.json();
      messages.lastChild.textContent = data.reply;
    } catch {
      messages.lastChild.textContent = '❌ Error. Try again.';
    }
    sendBtn.disabled = false;
  }

  sendBtn.onclick = send;
  input.addEventListener('keydown', e => e.key === 'Enter' && send());
})();