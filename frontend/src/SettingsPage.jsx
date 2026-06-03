import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SettingsPage({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('profile');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    axios.get('https://botpilot-a4is.onrender.com/api/settings', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => setProfile(res.data));
  }, []);

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwMsg({ text: 'Please fill all fields', type: 'error' }); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ text: 'New passwords do not match', type: 'error' }); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ text: 'Password must be at least 6 characters', type: 'error' }); return;
    }
    setPwLoading(true);
    try {
      await axios.put('https://botpilot-a4is.onrender.com/api/settings/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setPwMsg({ text: '✅ Password changed successfully!', type: 'success' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.error || 'Failed to change password', type: 'error' });
    }
    setPwLoading(false);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== user.email) {
      setDeleteMsg('Email does not match'); return;
    }
    try {
      await axios.delete('https://botpilot-a4is.onrender.com/api/settings/account', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onLogout();
    } catch {
      setDeleteMsg('Failed to delete account');
    }
  };

  const plans = [
    { name: 'Free', price: '$0', features: ['1 bot', '100 msgs/day', 'Basic widget'], color: '#888' },
    { name: 'Starter', price: '$9', features: ['3 bots', '1,000 msgs/day', 'Remove branding', 'Analytics'], color: '#185FA5', popular: true },
    { name: 'Pro', price: '$29', features: ['Unlimited bots', 'Unlimited msgs', 'Custom domain', 'Priority support'], color: '#534AB7' },
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

        {/* ── Tabs ── */}
        <div style={{ display:'flex', gap:4, marginBottom:20, background:'#f1f1f1', padding:4, borderRadius:12, width:'fit-content' }}>
          {['profile','password','plans','danger'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding:'8px 18px', borderRadius:9, border:'none',
                cursor:'pointer', fontSize:13, fontWeight:600,
                fontFamily:'inherit', transition:'.15s',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#0f0f1a' : '#888',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {t === 'profile' && '👤 Profile'}
              {t === 'password' && '🔒 Password'}
              {t === 'plans' && '⭐ Plans'}
              {t === 'danger' && '⚠️ Danger zone'}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'profile' && profile && (
          <div style={{ maxWidth:500 }}>
            <div className="embed-card">
              <div className="embed-card-title"><i className="ti ti-user" /> Your profile</div>

              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, padding:'16px', background:'#f8f9fc', borderRadius:12 }}>
                <div style={{
                  width:56, height:56, borderRadius:'50%',
                  background:'#185FA5', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  fontSize:22, fontWeight:700, color:'#fff'
                }}>
                  {user.email[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:'#0f0f1a' }}>{user.email}</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:3 }}>
                    Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month:'long', year:'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={{ background:'#f8f9fc', borderRadius:10, padding:'12px 16px' }}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Email</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0f0f1a' }}>{profile.email}</div>
                </div>
                <div style={{ background:'#f8f9fc', borderRadius:10, padding:'12px 16px' }}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Current plan</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#185FA5', textTransform:'capitalize' }}>{profile.plan}</div>
                </div>
                <div style={{ background:'#f8f9fc', borderRadius:10, padding:'12px 16px' }}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>User ID</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0f0f1a' }}>#{profile.id}</div>
                </div>
                <div style={{ background:'#f8f9fc', borderRadius:10, padding:'12px 16px' }}>
                  <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>Status</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#3B6D11' }}>Active ✅</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Password Tab ── */}
        {tab === 'password' && (
          <div style={{ maxWidth:440 }}>
            <div className="embed-card">
              <div className="embed-card-title"><i className="ti ti-lock" /> Change password</div>

              {pwMsg.text && (
                <div style={{
                  padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14,
                  background: pwMsg.type === 'success' ? '#EAF3DE' : '#fff0f0',
                  color: pwMsg.type === 'success' ? '#3B6D11' : '#c0392b'
                }}>
                  {pwMsg.text}
                </div>
              )}

              <div className="form-row">
                <label className="form-label">Current password</label>
                <input
                  className="form-input" type="password"
                  placeholder="Enter current password"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})}
                />
              </div>
              <div className="form-row">
                <label className="form-label">New password</label>
                <input
                  className="form-input" type="password"
                  placeholder="Min 6 characters"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({...pwForm, newPassword: e.target.value})}
                />
              </div>
              <div className="form-row">
                <label className="form-label">Confirm new password</label>
                <input
                  className="form-input" type="password"
                  placeholder="Repeat new password"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})}
                />
              </div>

              <button
                className="tbtn primary"
                style={{ width:'100%', justifyContent:'center', marginTop:6 }}
                onClick={changePassword}
                disabled={pwLoading}
              >
                {pwLoading ? 'Saving...' : '🔒 Change password'}
              </button>
            </div>
          </div>
        )}

        {/* ── Plans Tab ── */}
        {tab === 'plans' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, maxWidth:760 }}>
              {plans.map(plan => (
                <div
                  key={plan.name}
                  className="embed-card"
                  style={{
                    border: plan.popular ? `2px solid ${plan.color}` : '1px solid #eee',
                    position:'relative'
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
                      background:'#185FA5', color:'#fff', fontSize:11, fontWeight:700,
                      padding:'3px 12px', borderRadius:20, whiteSpace:'nowrap'
                    }}>
                      Most popular
                    </div>
                  )}
                  <div style={{ fontSize:16, fontWeight:700, color:'#0f0f1a', marginBottom:4 }}>{plan.name}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:plan.color, marginBottom:16 }}>
                    {plan.price}<span style={{ fontSize:13, color:'#888', fontWeight:400 }}>/mo</span>
                  </div>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#555', marginBottom:8 }}>
                      <i className="ti ti-check" style={{ color:'#3B6D11', fontSize:15 }} /> {f}
                    </div>
                  ))}
                  <button
                    className={`tbtn ${plan.name === 'Free' ? 'outline' : 'primary'}`}
                    style={{ width:'100%', justifyContent:'center', marginTop:16, background: plan.name !== 'Free' ? plan.color : '', borderColor: plan.name !== 'Free' ? plan.color : '' }}
                  >
                    {plan.name === 'Free' ? 'Current plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Danger Zone Tab ── */}
        {tab === 'danger' && (
          <div style={{ maxWidth:480 }}>
            <div className="embed-card" style={{ border:'1px solid #ffcdd2' }}>
              <div className="embed-card-title" style={{ color:'#c0392b' }}>
                <i className="ti ti-alert-triangle" /> Danger zone
              </div>
              <div style={{ fontSize:13, color:'#888', marginBottom:16, lineHeight:1.6 }}>
                Deleting your account will permanently remove all your bots, messages, and data. This cannot be undone.
              </div>
              {deleteMsg && (
                <div style={{ padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14, background:'#fff0f0', color:'#c0392b' }}>
                  {deleteMsg}
                </div>
              )}
              <div className="form-row">
                <label className="form-label">
                  Type your email <strong>{user.email}</strong> to confirm
                </label>
                <input
                  className="form-input"
                  placeholder={user.email}
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  style={{ borderColor: deleteConfirm && deleteConfirm !== user.email ? '#ffcdd2' : '' }}
                />
              </div>
              <button
                onClick={deleteAccount}
                disabled={deleteConfirm !== user.email}
                style={{
                  width:'100%', padding:'10px', border:'none', borderRadius:10,
                  background: deleteConfirm === user.email ? '#c0392b' : '#f5f5f5',
                  color: deleteConfirm === user.email ? '#fff' : '#aaa',
                  fontSize:13, fontWeight:700, cursor: deleteConfirm === user.email ? 'pointer' : 'not-allowed',
                  fontFamily:'inherit', transition:'.15s'
                }}
              >
                🗑️ Delete my account permanently
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}