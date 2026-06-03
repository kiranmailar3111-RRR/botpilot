/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Auth from './Auth';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [view, setView] = useState('dashboard');
  const [allMessages, setAllMessages] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newBot, setNewBot] = useState({ name: '', system_prompt: '', emoji: '🤖' });
  const [editBot, setEditBot] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', system_prompt: '', emoji: '🤖' });
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');
  const messagesEnd = useRef(null);

  const emojis = ['🤖','🛒','🏥','🎓','🏠','🍕','✈️','💼','🎮','💬','🌟','⚡'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) {
      const userData = { token, email };
      setUser(userData);
      loadBots(userData);
    }
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const loadBots = async (currentUser) => {
    const u = currentUser || user;
    if (!u?.token) return;
    try {
      const res = await axios.get('https://botpilot-a4is.onrender.com/api/bots', {
        headers: { Authorization: `Bearer ${u.token}` }
      });
      setBots(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        setUser(null);
      }
    }
  };

  const openBot = (bot) => {
    setSelectedBot(bot);
    setView('chat');
    if (!allMessages[bot.id]) {
      setAllMessages(prev => ({
        ...prev,
        [bot.id]: [{ role: 'bot', text: `👋 Hi! I am ${bot.name}. How can I help you?` }]
      }));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedBot) return;
    const userMsg = { role: 'user', text: input };
    setAllMessages(prev => ({
      ...prev,
      [selectedBot.id]: [...(prev[selectedBot.id] || []), userMsg]
    }));
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('https://botpilot-a4is.onrender.com/api/chat', {
        message: input, botId: selectedBot.id
      });
      setAllMessages(prev => ({
        ...prev,
        [selectedBot.id]: [...(prev[selectedBot.id] || []), { role: 'bot', text: res.data.reply }]
      }));
    } catch {
      setAllMessages(prev => ({
        ...prev,
        [selectedBot.id]: [...(prev[selectedBot.id] || []), { role: 'bot', text: '❌ Error. Check backend.' }]
      }));
    }
    setLoading(false);
  };

  const createBot = async () => {
    if (!newBot.name.trim()) { setError('Bot name is required'); return; }
    if (!newBot.system_prompt.trim()) { setError('Personality is required'); return; }
    try {
      await axios.post('https://botpilot-a4is.onrender.com/api/bots', newBot, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowModal(false);
      setNewBot({ name: '', system_prompt: '', emoji: '🤖' });
      setError('');
      loadBots();
    } catch { setError('Failed to create bot'); }
  };

  const openEdit = (bot, e) => {
    e.stopPropagation();
    setEditBot(bot);
    setEditForm({ name: bot.name, system_prompt: bot.system_prompt, emoji: bot.emoji || '🤖' });
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) { setEditError('Bot name is required'); return; }
    if (!editForm.system_prompt.trim()) { setEditError('Personality is required'); return; }
    try {
      await axios.put(`https://botpilot-a4is.onrender.com/api/bots/${editBot.id}`, editForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (selectedBot?.id === editBot.id) setSelectedBot({ ...selectedBot, ...editForm });
      setEditBot(null);
      setEditError('');
      loadBots();
    } catch { setEditError('Failed to save changes'); }
  };

  const deleteBot = async (botId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this bot? This cannot be undone.')) return;
    await axios.delete(`https://botpilot-a4is.onrender.com/api/bots/${botId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (selectedBot?.id === botId) { setSelectedBot(null); setView('dashboard'); }
    loadBots();
  };

  const logout = () => {
    localStorage.clear();
    setUser(null); setBots([]);
    setSelectedBot(null); setAllMessages({});
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (!user) return <Auth onLogin={(data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    setUser(data);
    loadBots(data);
  }} />;

  return (
    <div className="app">

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <div className="sidebar">

       <div className="logo-area">
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <rect width="34" height="34" rx="10" fill="#185FA5"/>
    <rect x="7" y="10" width="20" height="14" rx="4" fill="white" opacity="0.95"/>
    <polygon points="10,24 7,29 17,24" fill="white" opacity="0.95"/>
    <circle cx="12" cy="17" r="2" fill="#185FA5"/>
    <circle cx="17" cy="17" r="2" fill="#185FA5"/>
    <circle cx="22" cy="17" r="2" fill="#185FA5"/>
  </svg>
  <span className="logo-text">Bot<span style={{color:'#3b82f6'}}>Pilot</span></span>
  <span className="logo-badge">Free</span>
</div>

        <div className="user-card">
          <div className="user-avatar">{user.email[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-email">{user.email}</div>
            <div className="user-plan">Free Plan</div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Menu</div>
          <div className={`nav-item ${view==='dashboard'?'active':''}`} onClick={() => setView('dashboard')}>
            <i className="ti ti-layout-dashboard" /> Dashboard
          </div>
          <div className={`nav-item ${view==='analytics'?'active':''}`} onClick={() => setView('analytics')}>
            <i className="ti ti-chart-bar" /> Analytics
          </div>
          <div className={`nav-item ${view==='embed'?'active':''}`} onClick={() => setView('embed')}>
            <i className="ti ti-code" /> Embed code
          </div>
          <div className={`nav-item ${view==='settings'?'active':''}`} onClick={() => setView('settings')}>
            <i className="ti ti-settings" /> Settings
          </div>
        </div>

        <div className="bots-section-label">Your bots</div>

        <div className="bots-section">
          {bots.length === 0 && (
            <div style={{ color:'#2e2e45', fontSize:12, padding:'6px 10px', fontStyle:'italic' }}>
              No bots yet — create one!
            </div>
          )}
          {bots.map(bot => (
            <div
              key={bot.id}
              className={`bot-row ${selectedBot?.id===bot.id && view==='chat' ? 'active' : ''}`}
              onClick={() => openBot(bot)}
            >
              <div className="bot-row-emoji">{bot.emoji || '🤖'}</div>
              <div className="bot-dot on" />
              <span className="bot-row-name">{bot.name}</span>
              <div className="bot-row-actions">
                <button className="sb-action" title="Edit" onClick={(e) => openEdit(bot, e)}>
                  <i className="ti ti-edit" />
                </button>
                <button className="sb-action del" title="Delete" onClick={(e) => deleteBot(bot.id, e)}>
                  <i className="ti ti-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="logout-btn" onClick={logout}>
            <i className="ti ti-logout" /> Logout
          </div>
        </div>
      </div>

      {/* ══════════════════ MAIN ══════════════════ */}
      <div className="main">

        {/* ── DASHBOARD ── */}
        {view === 'dashboard' && (
          <>
            <div className="topbar">
              <div style={{ flex:1 }}>
                <div className="topbar-title">Dashboard</div>
                <div className="topbar-sub">{today}</div>
              </div>
              <div className="topbar-actions">
                <button className="tbtn primary" onClick={() => setShowModal(true)}>
                  <i className="ti ti-plus" /> New bot
                </button>
              </div>
            </div>

            <div className="content">
              <div className="stats-row">
                <div className="scard">
                  <div className="scard-icon" style={{ background:'#eff6ff' }}>
                    <i className="ti ti-robot" style={{ color:'#185FA5' }} />
                  </div>
                  <div className="scard-val">{bots.length}</div>
                  <div className="scard-label">Total bots</div>
                  <div className="scard-trend up">
                    <i className="ti ti-arrow-up" style={{ fontSize:10 }} /> {bots.length} active
                  </div>
                </div>
                <div className="scard">
                  <div className="scard-icon" style={{ background:'#f0fdf4' }}>
                    <i className="ti ti-message" style={{ color:'#16a34a' }} />
                  </div>
                  <div className="scard-val">0</div>
                  <div className="scard-label">Messages today</div>
                  <div className="scard-trend neutral">All time total</div>
                </div>
                <div className="scard">
                  <div className="scard-icon" style={{ background:'#faf5ff' }}>
                    <i className="ti ti-users" style={{ color:'#7c3aed' }} />
                  </div>
                  <div className="scard-val">1</div>
                  <div className="scard-label">Total users</div>
                  <div className="scard-trend neutral">Just you for now</div>
                </div>
                <div className="scard">
                  <div className="scard-icon" style={{ background:'#fffbeb' }}>
                    <i className="ti ti-star" style={{ color:'#d97706' }} />
                  </div>
                  <div className="scard-val" style={{ fontSize:18, paddingTop:3 }}>Free</div>
                  <div className="scard-label">Current plan</div>
                  <div className="scard-trend neutral">Upgrade anytime</div>
                </div>
              </div>

              <div className="section-hdr">
                <span className="section-title">Your bots</span>
                <span style={{ fontSize:12, color:'#9ca3af', fontWeight:500 }}>{bots.length} bot{bots.length!==1?'s':''}</span>
              </div>

              <div className="bots-grid">
                {bots.map(bot => (
                  <div className="bcard" key={bot.id} onClick={() => openBot(bot)}>
                    <div className="bcard-top">
                      <div className="bcard-icon" style={{ background:'#eff6ff' }}>
                        {bot.emoji || '🤖'}
                      </div>
                      <div className="bcard-status on">
                        <div className="bcard-status-dot" /> Active
                      </div>
                    </div>
                    <div className="bcard-name">{bot.name}</div>
                    <div className="bcard-desc">
                      {bot.system_prompt?.slice(0,80)}{bot.system_prompt?.length > 80 ? '...' : ''}
                    </div>
                    <div className="bcard-footer">
                      <div className="bcard-meta">
                        <i className="ti ti-message" /> Click to chat
                      </div>
                      <div className="bcard-actions" onClick={e => e.stopPropagation()}>
                        <button className="icon-btn" title="Edit bot" onClick={(e) => openEdit(bot, e)}>
                          <i className="ti ti-edit" />
                        </button>
                        <button className="icon-btn danger" title="Delete bot" onClick={(e) => deleteBot(bot.id, e)}>
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="add-card" onClick={() => setShowModal(true)}>
                  <div className="add-card-icon"><i className="ti ti-plus" /></div>
                  <div className="add-card-text">Create new bot</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── CHAT ── */}
        {view === 'chat' && selectedBot && (
          <>
            <div className="topbar">
              <button className="tbtn outline" onClick={() => setView('dashboard')}>
                <i className="ti ti-arrow-left" /> Back
              </button>
              <div style={{ flex:1, marginLeft:8 }}>
                <div className="topbar-title">{selectedBot.emoji || '🤖'} {selectedBot.name}</div>
                <div className="topbar-sub">AI powered by Groq — LLaMA 3</div>
              </div>
              <div className="topbar-actions">
                <button className="tbtn outline" style={{ fontSize:12 }} onClick={(e) => openEdit(selectedBot, e)}>
                  <i className="ti ti-edit" /> Edit bot
                </button>
                <button className="tbtn danger" style={{ fontSize:12 }} onClick={() => {
                  setAllMessages(prev => ({
                    ...prev,
                    [selectedBot.id]: [{ role:'bot', text:`👋 Hi! I am ${selectedBot.name}. How can I help you?` }]
                  }));
                }}>
                  <i className="ti ti-trash" /> Clear
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {(allMessages[selectedBot.id] || []).map((msg, i) => (
                <div key={i} className={`bubble ${msg.role}`}>{msg.text}</div>
              ))}
              {loading && <div className="bubble typing"><i className="ti ti-dots" /> Typing...</div>}
              <div ref={messagesEnd} />
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={`Message ${selectedBot.name}...`}
              />
              <button className="send-btn" onClick={sendMessage}>
                <i className="ti ti-send" /> Send
              </button>
            </div>
          </>
        )}

        {/* ── OTHER PAGES ── */}
        {view === 'embed' && (
          <div className="page-wrapper">
            {/* EmbedPage renders here */}
            <EmbedInline bots={bots} />
          </div>
        )}

        {view === 'analytics' && (
          <div className="page-wrapper">
            <AnalyticsInline user={user} />
          </div>
        )}

        {view === 'settings' && (
          <div className="page-wrapper">
            <SettingsInline user={user} onLogout={logout} />
          </div>
        )}

      </div>

      {/* ══════════════════ CREATE BOT MODAL ══════════════════ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create new bot</div>
              <button className="modal-close" onClick={() => { setShowModal(false); setError(''); }}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-sub">Give your bot a name and personality</div>

            {error && <div className="error-msg"><i className="ti ti-alert-circle" /> {error}</div>}

            <div className="form-row">
              <label className="form-label">Choose an emoji</label>
              <div className="emoji-grid">
                {emojis.map(em => (
                  <div key={em} className={`emoji-item ${newBot.emoji===em?'selected':''}`}
                    onClick={() => setNewBot({...newBot, emoji: em})}>
                    {em}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Bot name</label>
              <input className="form-input" placeholder="e.g. ShopBot, ClinicBot..."
                value={newBot.name} onChange={e => setNewBot({...newBot, name: e.target.value})} />
            </div>
            <div className="form-row">
              <label className="form-label">Personality (system prompt)</label>
              <textarea className="form-textarea"
                placeholder="e.g. You are ShopBot, a friendly e-commerce assistant. Help customers with products, orders and returns. Be short and helpful."
                value={newBot.system_prompt}
                onChange={e => setNewBot({...newBot, system_prompt: e.target.value})} />
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:5 }}>
                💡 Include business name, location, services, hours and prices for best results
              </div>
            </div>
            <div className="modal-actions">
              <button className="tbtn outline" onClick={() => { setShowModal(false); setError(''); }}>Cancel</button>
              <button className="tbtn primary" onClick={createBot}><i className="ti ti-check" /> Create bot</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ EDIT BOT MODAL ══════════════════ */}
      {editBot && (
        <div className="modal-overlay" onClick={() => setEditBot(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit bot</div>
              <button className="modal-close" onClick={() => setEditBot(null)}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-sub">Update your bot's name and personality</div>

            {editError && <div className="error-msg"><i className="ti ti-alert-circle" /> {editError}</div>}

            <div className="form-row">
              <label className="form-label">Choose an emoji</label>
              <div className="emoji-grid">
                {emojis.map(em => (
                  <div key={em} className={`emoji-item ${editForm.emoji===em?'selected':''}`}
                    onClick={() => setEditForm({...editForm, emoji: em})}>
                    {em}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Bot name</label>
              <input className="form-input" placeholder="e.g. ShopBot, ClinicBot..."
                value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div className="form-row">
              <label className="form-label">Personality (system prompt)</label>
              <textarea className="form-textarea" style={{ minHeight:130 }}
                value={editForm.system_prompt}
                onChange={e => setEditForm({...editForm, system_prompt: e.target.value})} />
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:5 }}>
                💡 Include business name, location, services, hours and prices for best results
              </div>
            </div>
            <div className="modal-actions">
              <button className="tbtn outline" onClick={() => setEditBot(null)}>Cancel</button>
              <button className="tbtn primary" onClick={saveEdit}><i className="ti ti-device-floppy" /> Save changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ══════════════════════════════════════
   INLINE COMPONENTS (no separate files)
══════════════════════════════════════ */

function EmbedInline({ bots }) {
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

  const colors = ['#185FA5','#16a34a','#7c3aed','#d97706','#dc2626','#0891b2'];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div className="topbar">
        <div style={{ flex:1 }}>
          <div className="topbar-title">Embed code</div>
          <div className="topbar-sub">Paste one line on any website</div>
        </div>
      </div>
      <div className="content" style={{ flex:1, overflowY:'auto', minHeight:0 }}>
        {bots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <div>Create a bot first to get embed code</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div>
              <div className="embed-card">
                <div className="embed-card-title"><i className="ti ti-robot" /> Select bot</div>
                <div className="bot-select-list">
                  {bots.map(bot => (
                    <div key={bot.id}
                      className={`bot-select-item ${selectedBot?.id===bot.id?'active':''}`}
                      onClick={() => setSelectedBot(bot)}>
                      <span style={{ fontSize:22 }}>{bot.emoji||'🤖'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#0d0d1a' }}>{bot.name}</div>
                        <div style={{ fontSize:11, color:'#9ca3af' }}>ID: {bot.id}</div>
                      </div>
                      {selectedBot?.id===bot.id && <i className="ti ti-check" style={{ color:'#185FA5', fontSize:18 }} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="embed-card" style={{ marginTop:14 }}>
                <div className="embed-card-title"><i className="ti ti-palette" /> Customize widget</div>
                <div className="form-row">
                  <label className="form-label">Brand color</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                    {colors.map(c => (
                      <div key={c} onClick={() => setColor(c)} style={{
                        width:32, height:32, borderRadius:'50%', background:c, cursor:'pointer',
                        border: color===c ? '3px solid #0d0d1a' : '3px solid transparent', transition:'.15s'
                      }} />
                    ))}
                    <input type="color" value={color} onChange={e => setColor(e.target.value)}
                      style={{ width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer', padding:0 }} />
                  </div>
                </div>
                <div className="form-row" style={{ marginTop:14 }}>
                  <label className="form-label">Position</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {['bottom-right','bottom-left'].map(p => (
                      <div key={p} onClick={() => setPosition(p)} style={{
                        flex:1, padding:'9px 12px', borderRadius:10, cursor:'pointer', textAlign:'center',
                        border: position===p ? `2px solid ${color}` : '1.5px solid #e5e7eb',
                        background: position===p ? '#f0f7ff' : '#f9fafb',
                        color: position===p ? '#185FA5' : '#6b7280',
                        fontSize:12, fontWeight:600, transition:'.15s'
                      }}>{p==='bottom-right' ? '↘ Bottom right' : '↙ Bottom left'}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="embed-card">
                <div className="embed-card-title"><i className="ti ti-code" /> Your embed code</div>
                <div className="embed-code-box"><pre style={{ margin:0, whiteSpace:'pre-wrap', wordBreak:'break-all' }}>{embedCode}</pre></div>
                <button className={`tbtn ${copied?'outline':'primary'}`}
                  style={{ width:'100%', marginTop:12, justifyContent:'center' }} onClick={copy}>
                  {copied ? <><i className="ti ti-check" /> Copied!</> : <><i className="ti ti-copy" /> Copy embed code</>}
                </button>
              </div>

              <div className="embed-card" style={{ marginTop:14 }}>
                <div className="embed-card-title"><i className="ti ti-list-numbers" /> How to use</div>
                <div className="steps-list">
                  {['Copy the embed code above','Open your website HTML file',
                    'Paste before the closing </body> tag','Save — chat button appears! 💬'].map((s,i) => (
                    <div key={i} className="step-item">
                      <div className="step-num">{i+1}</div>
                      <div className="step-text">{s}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="embed-card" style={{ marginTop:14 }}>
                <div className="embed-card-title"><i className="ti ti-eye" /> Live preview</div>
                <div style={{ background:'#f0f2f5', borderRadius:12, height:110, position:'relative', border:'1.5px dashed #e5e7eb' }}>
                  <div style={{ padding:10, color:'#d1d5db', fontSize:12 }}>Your website content here...</div>
                  <div style={{
                    position:'absolute',
                    bottom:14,
                    right: position==='bottom-right' ? 14 : 'auto',
                    left: position==='bottom-left' ? 14 : 'auto',
                    width:48, height:48, borderRadius:'50%',
                    background:color, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:22, boxShadow:`0 4px 14px ${color}66`, transition:'all .3s', cursor:'pointer'
                  }}>💬</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsInline({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('https://botpilot-a4is.onrender.com/api/analytics', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="topbar"><div className="topbar-title">Analytics</div></div>
      <div className="empty-state"><div className="empty-icon">⏳</div><div>Loading...</div></div>
    </div>
  );

  const days = (daily) => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const lbl = d.toLocaleDateString('en-US', { weekday:'short' });
      const found = daily.find(r => r.date?.toString().startsWith(ds));
      arr.push({ label:lbl, count: found ? found.count : 0 });
    }
    return arr;
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div className="topbar">
        <div style={{ flex:1 }}>
          <div className="topbar-title">Analytics</div>
          <div className="topbar-sub">Your chatbot performance</div>
        </div>
      </div>
      <div className="content" style={{ flex:1, overflowY:'auto', minHeight:0 }}>
        <div className="stats-row">
          {[
            { icon:'ti-message', color:'#eff6ff', ic:'#185FA5', val:data.totalMsgs, lbl:'Total messages', trend:'All time' },
            { icon:'ti-calendar', color:'#f0fdf4', ic:'#16a34a', val:data.todayMsgs, lbl:'Today', trend:'Messages today' },
            { icon:'ti-robot', color:'#faf5ff', ic:'#7c3aed', val:data.bots.length, lbl:'Active bots', trend:'Total bots' },
            { icon:'ti-chart-bar', color:'#fffbeb', ic:'#d97706', val:data.bots.reduce((s,b)=>s+b.week,0), lbl:'This week', trend:'Last 7 days' }
          ].map((s,i) => (
            <div className="scard" key={i}>
              <div className="scard-icon" style={{ background:s.color }}>
                <i className={`ti ${s.icon}`} style={{ color:s.ic }} />
              </div>
              <div className="scard-val">{s.val}</div>
              <div className="scard-label">{s.lbl}</div>
              <div className="scard-trend neutral">{s.trend}</div>
            </div>
          ))}
        </div>

        {data.bots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div>Chat with your bots to see analytics</div>
          </div>
        ) : data.bots.map(bot => {
          const d = days(bot.daily);
          const mx = Math.max(...d.map(x=>x.count), 1);
          return (
            <div className="chart-wrap" key={bot.id} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
                <div style={{ width:42,height:42,borderRadius:12,background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>
                  {bot.emoji||'🤖'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:'#0d0d1a' }}>{bot.name}</div>
                  <div style={{ fontSize:12, color:'#9ca3af' }}>Bot ID: {bot.id}</div>
                </div>
                {[{v:bot.total,l:'Total'},{v:bot.today,l:'Today',c:'#185FA5'},{v:bot.week,l:'This week',c:'#16a34a'}].map((s,i)=>(
                  <div key={i} style={{ textAlign:'center', padding:'8px 16px', background:i>0?s.c+'11':'#f9fafb', borderRadius:10 }}>
                    <div style={{ fontSize:20,fontWeight:700,color:s.c||'#0d0d1a' }}>{s.v}</div>
                    <div style={{ fontSize:11,color:'#9ca3af',marginTop:2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:12, color:'#9ca3af', marginBottom:8, fontWeight:500 }}>Last 7 days</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:70 }}>
                {d.map((day,i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ fontSize:10, color:'#9ca3af' }}>{day.count>0?day.count:''}</div>
                    <div style={{
                      width:'100%', borderRadius:'5px 5px 0 0',
                      height: Math.max((day.count/mx)*52, day.count>0?6:3),
                      background: day.count>0 ? '#185FA5' : '#e5e7eb',
                      transition:'.3s'
                    }} />
                    <div style={{ fontSize:10, color:'#9ca3af', fontWeight:500 }}>{day.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsInline({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('profile');
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [pwMsg, setPwMsg] = useState({ text:'', type:'' });
  const [pwLoading, setPwLoading] = useState(false);
  const [delConfirm, setDelConfirm] = useState('');
  const [delMsg, setDelMsg] = useState('');

  useEffect(() => {
    axios.get('https://botpilot-a4is.onrender.com/api/settings', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => setProfile(res.data)).catch(() => {});
  }, []);

  const changePw = async () => {
    if (!pw.currentPassword||!pw.newPassword) { setPwMsg({text:'Fill all fields',type:'error'}); return; }
    if (pw.newPassword !== pw.confirmPassword) { setPwMsg({text:'Passwords do not match',type:'error'}); return; }
    if (pw.newPassword.length < 6) { setPwMsg({text:'Min 6 characters',type:'error'}); return; }
    setPwLoading(true);
    try {
      await axios.put('https://botpilot-a4is.onrender.com/api/settings/password',
        { currentPassword: pw.currentPassword, newPassword: pw.newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPwMsg({ text:'✅ Password changed!', type:'success' });
      setPw({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch(err) { setPwMsg({ text: err.response?.data?.error||'Failed', type:'error' }); }
    setPwLoading(false);
  };

  const deleteAccount = async () => {
    if (delConfirm !== user.email) { setDelMsg('Email does not match'); return; }
    try {
      await axios.delete('https://botpilot-a4is.onrender.com/api/settings/account', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onLogout();
    } catch { setDelMsg('Failed to delete account'); }
  };

  const plans = [
    { name:'Free', price:'$0', features:['1 bot','100 msgs/day','Basic widget'], color:'#6b7280' },
    { name:'Starter', price:'$9', features:['3 bots','1,000 msgs/day','Remove branding','Analytics'], color:'#185FA5', popular:true },
    { name:'Pro', price:'$29', features:['Unlimited bots','Unlimited msgs','Custom domain','Priority support'], color:'#7c3aed' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', width:'100%' }}>
      <div className="topbar">
        <div style={{ flex:1 }}>
          <div className="topbar-title">Settings</div>
          <div className="topbar-sub">Manage your account</div>
        </div>
      </div>
      <div className="content" style={{ flex:1, overflowY:'auto', minHeight:0 }}>
        <div className="tab-bar">
          {[['profile','ti-user','Profile'],['password','ti-lock','Password'],['plans','ti-star','Plans'],['danger','ti-alert-triangle','Danger zone']].map(([t,ic,lb]) => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              <i className={`ti ${ic}`} style={{ fontSize:14, marginRight:5 }} />{lb}
            </button>
          ))}
        </div>

        {tab==='profile' && profile && (
          <div style={{ maxWidth:520 }}>
            <div className="embed-card">
              <div className="embed-card-title"><i className="ti ti-user" /> Your profile</div>
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, padding:16, background:'#f9fafb', borderRadius:12 }}>
                <div style={{ width:56,height:56,borderRadius:'50%',background:'#185FA5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:'#fff' }}>
                  {user.email[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:16, color:'#0d0d1a' }}>{user.email}</div>
                  <div style={{ fontSize:12, color:'#9ca3af', marginTop:3 }}>
                    Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US',{month:'long',year:'numeric'}) : 'N/A'}
                  </div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  ['Email',profile.email,'ti-mail'],
                  ['Plan',profile.plan,'ti-star'],
                  ['User ID',`#${profile.id}`,'ti-fingerprint'],
                  ['Status','Active ✅','ti-circle-check']
                ].map(([l,v,ic]) => (
                  <div key={l} style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px' }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4, display:'flex', alignItems:'center', gap:5 }}>
                      <i className={`ti ${ic}`} style={{ fontSize:13 }} /> {l}
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0d0d1a', textTransform:'capitalize' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='password' && (
          <div style={{ maxWidth:460 }}>
            <div className="embed-card">
              <div className="embed-card-title"><i className="ti ti-lock" /> Change password</div>
              {pwMsg.text && (
                <div style={{ padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:16,
                  background: pwMsg.type==='success'?'#f0fdf4':'#fef2f2',
                  color: pwMsg.type==='success'?'#16a34a':'#dc2626',
                  border: `1px solid ${pwMsg.type==='success'?'#bbf7d0':'#fecaca'}`
                }}>{pwMsg.text}</div>
              )}
              {[['Current password','currentPassword'],['New password','newPassword'],['Confirm new password','confirmPassword']].map(([l,k]) => (
                <div className="form-row" key={k}>
                  <label className="form-label">{l}</label>
                  <input className="form-input" type="password" placeholder={l}
                    value={pw[k]} onChange={e => setPw({...pw,[k]:e.target.value})} />
                </div>
              ))}
              <button className="tbtn primary" style={{ width:'100%',justifyContent:'center',marginTop:6 }}
                onClick={changePw} disabled={pwLoading}>
                <i className="ti ti-lock" /> {pwLoading?'Saving...':'Change password'}
              </button>
            </div>
          </div>
        )}

        {tab==='plans' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, maxWidth:780 }}>
            {plans.map(plan => (
              <div key={plan.name} className="embed-card" style={{ position:'relative', border: plan.popular?`2px solid ${plan.color}`:'1px solid #e8eaed' }}>
                {plan.popular && (
                  <div style={{ position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',
                    background:'#185FA5',color:'#fff',fontSize:11,fontWeight:700,
                    padding:'4px 14px',borderRadius:20,whiteSpace:'nowrap',boxShadow:'0 2px 8px rgba(24,95,165,0.3)' }}>
                    Most popular
                  </div>
                )}
                <div style={{ fontSize:15,fontWeight:700,color:'#0d0d1a',marginBottom:6 }}>{plan.name}</div>
                <div style={{ fontSize:30,fontWeight:700,color:plan.color,marginBottom:16 }}>
                  {plan.price}<span style={{ fontSize:13,color:'#9ca3af',fontWeight:400 }}>/mo</span>
                </div>
                {plan.features.map(f => (
                  <div key={f} style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#4b5563',marginBottom:9 }}>
                    <i className="ti ti-check" style={{ color:'#16a34a',fontSize:15 }} /> {f}
                  </div>
                ))}
                <button className="tbtn primary" style={{ width:'100%',justifyContent:'center',marginTop:16,background:plan.name==='Free'?'#f9fafb':'',color:plan.name==='Free'?'#9ca3af':'',border:plan.name==='Free'?'1px solid #e5e7eb':'',boxShadow:plan.name!=='Free'?`0 2px 8px ${plan.color}44`:'none' }}>
                  {plan.name==='Free'?'Current plan':`Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab==='danger' && (
          <div style={{ maxWidth:500 }}>
            <div className="embed-card" style={{ border:'1px solid #fecaca' }}>
              <div className="embed-card-title" style={{ color:'#dc2626' }}>
                <i className="ti ti-alert-triangle" /> Danger zone
              </div>
              <div style={{ fontSize:13,color:'#6b7280',marginBottom:16,lineHeight:1.7 }}>
                Deleting your account will permanently remove all your bots, messages, and data. This <strong>cannot be undone</strong>.
              </div>
              {delMsg && <div className="error-msg"><i className="ti ti-alert-circle" /> {delMsg}</div>}
              <div className="form-row">
                <label className="form-label">Type <strong>{user.email}</strong> to confirm</label>
                <input className="form-input" placeholder={user.email}
                  value={delConfirm} onChange={e => setDelConfirm(e.target.value)}
                  style={{ borderColor: delConfirm&&delConfirm!==user.email?'#fca5a5':'' }} />
              </div>
              <button onClick={deleteAccount} disabled={delConfirm!==user.email} style={{
                width:'100%',padding:'11px',border:'none',borderRadius:10,fontFamily:'inherit',
                fontSize:13,fontWeight:700,cursor:delConfirm===user.email?'pointer':'not-allowed',transition:'.15s',
                background:delConfirm===user.email?'#dc2626':'#f9fafb',
                color:delConfirm===user.email?'#fff':'#d1d5db'
              }}>
                <i className="ti ti-trash" style={{ marginRight:6 }} />Delete my account permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}