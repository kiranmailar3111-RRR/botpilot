import { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`https://botpilot-a4is.onrender.com/api/${mode}`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{...styles.logo, display:'flex', alignItems:'center', justifyContent:'center', gap:10}}>
  <svg width="36" height="36" viewBox="0 0 34 34" fill="none">
    <rect width="34" height="34" rx="10" fill="#185FA5"/>
    <rect x="7" y="10" width="20" height="14" rx="4" fill="white" opacity="0.95"/>
    <polygon points="10,24 7,29 17,24" fill="white" opacity="0.95"/>
    <circle cx="12" cy="17" r="2" fill="#185FA5"/>
    <circle cx="17" cy="17" r="2" fill="#185FA5"/>
    <circle cx="22" cy="17" r="2" fill="#185FA5"/>
  </svg>
  <span>Bot<span style={{color:'#185FA5'}}>Pilot</span></span>
</div>
        <div style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</div>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />

        <button style={styles.btn} onClick={submit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>

        <div style={styles.toggle}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={styles.link}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f5f5f5' },
  card: { background:'#fff', padding:'40px', borderRadius:'16px', width:'360px', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', gap:'14px' },
  logo: { fontSize:'22px', fontWeight:'700', color:'#185FA5', textAlign:'center' },
  title: { fontSize:'18px', fontWeight:'600', color:'#333', textAlign:'center', marginBottom:'4px' },
  input: { padding:'11px 14px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', outline:'none' },
  btn: { padding:'12px', background:'#185FA5', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'500', cursor:'pointer' },
  error: { background:'#fff0f0', color:'#c0392b', padding:'10px 14px', borderRadius:'8px', fontSize:'13px' },
  toggle: { textAlign:'center', fontSize:'13px', color:'#666' },
  link: { color:'#185FA5', cursor:'pointer', fontWeight:'500' }
};