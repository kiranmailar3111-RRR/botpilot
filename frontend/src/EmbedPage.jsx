import { useState } from 'react';

export default function EmbedPage({ bots, user }) {
  const [selectedBot, setSelectedBot] = useState(bots[0] || null);
  const [color, setColor] = useState('#185FA5');
  const [position, setPosition] = useState('bottom-right');
  const [copied, setCopied] = useState(false);

  const embedCode = selectedBot
    ? `<script\n  src="https://botpilot-a4is.onrender.com/widget/widget.js"\n  data-bot-id="${selectedBot.id}"\n  data-bot-name="${selectedBot.name}"\n  data-color="${color}"\n  data-position="${position}">\n</script>`
    : '';

  const copy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
    <div className="topbar">
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Embed Code</div>
          <div className="topbar-sub">Paste one line on any website</div>
        </div>
      </div>

      <div className="content" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {bots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <div>Create a bot first to get embed code</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* ── Left — Config ── */}
            <div>
              <div className="embed-card">
                <div className="embed-card-title">
                  <i className="ti ti-robot" /> Select bot
                </div>
                <div className="bot-select-list">
                  {bots.map(bot => (
                    <div
                      key={bot.id}
                      className={`bot-select-item ${selectedBot?.id === bot.id ? 'active' : ''}`}
                      onClick={() => setSelectedBot(bot)}
                    >
                      <span style={{ fontSize: 20 }}>{bot.emoji || '🤖'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f0f1a' }}>{bot.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>ID: {bot.id}</div>
                      </div>
                      {selectedBot?.id === bot.id && (
                        <i className="ti ti-check" style={{ color: '#185FA5', fontSize: 16 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="embed-card" style={{ marginTop: 14 }}>
                <div className="embed-card-title">
                  <i className="ti ti-palette" /> Customize
                </div>

                <div className="form-row">
                  <label className="form-label">Brand color</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['#185FA5','#3B6D11','#993556','#BA7517','#534AB7','#993C1D'].map(c => (
                      <div
                        key={c}
                        onClick={() => setColor(c)}
                        style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: c, cursor: 'pointer',
                          border: color === c ? '3px solid #0f0f1a' : '3px solid transparent',
                          transition: '.15s'
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0 }}
                      title="Custom color"
                    />
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: 14 }}>
                  <label className="form-label">Widget position</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['bottom-right', 'bottom-left'].map(p => (
                      <div
                        key={p}
                        onClick={() => setPosition(p)}
                        style={{
                          flex: 1, padding: '8px 12px', borderRadius: 10,
                          border: position === p ? '2px solid #185FA5' : '1px solid #e0e0e0',
                          background: position === p ? '#e8f0fb' : '#fafafa',
                          cursor: 'pointer', fontSize: 12,
                          color: position === p ? '#185FA5' : '#888',
                          fontWeight: position === p ? 600 : 400,
                          textAlign: 'center', transition: '.15s'
                        }}
                      >
                        {p === 'bottom-right' ? '↘ Bottom right' : '↙ Bottom left'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right — Code + Preview ── */}
            <div>
              <div className="embed-card">
                <div className="embed-card-title">
                  <i className="ti ti-code" /> Your embed code
                </div>
                <div className="embed-code-box">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {embedCode}
                  </pre>
                </div>
                <button
                  className={`tbtn ${copied ? 'outline' : 'primary'}`}
                  style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                  onClick={copy}
                >
                  {copied
                    ? <><i className="ti ti-check" /> Copied!</>
                    : <><i className="ti ti-copy" /> Copy embed code</>
                  }
                </button>
              </div>

              <div className="embed-card" style={{ marginTop: 14 }}>
                <div className="embed-card-title">
                  <i className="ti ti-device-desktop" /> How to use
                </div>
                <div className="steps-list">
                  <div className="step-item">
                    <div className="step-num">1</div>
                    <div className="step-text">Copy the embed code above</div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">2</div>
                    <div className="step-text">Open your website HTML file</div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">3</div>
                    <div className="step-text">Paste just before the closing <code style={{background:'#f0f0f0',padding:'1px 5px',borderRadius:4}}>&lt;/body&gt;</code> tag</div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">4</div>
                    <div className="step-text">Save and open your website — the chat button appears! 💬</div>
                  </div>
                </div>
              </div>

              {/* Live preview of widget button */}
              <div className="embed-card" style={{ marginTop: 14 }}>
                <div className="embed-card-title">
                  <i className="ti ti-eye" /> Widget preview
                </div>
                <div style={{
                  background: '#f8f9fc', borderRadius: 12, height: 120,
                  position: 'relative', overflow: 'hidden',
                  border: '1px dashed #e0e0e0'
                }}>
                  <div style={{ padding: 12, color: '#ccc', fontSize: 12 }}>Your website content here...</div>
                  <div style={{
                    position: 'absolute',
                    bottom: 14,
                    right: position === 'bottom-right' ? 14 : 'auto',
                    left: position === 'bottom-left' ? 14 : 'auto',
                    width: 48, height: 48, borderRadius: '50%',
                    background: color, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'all .3s'
                  }}>
                    💬
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}