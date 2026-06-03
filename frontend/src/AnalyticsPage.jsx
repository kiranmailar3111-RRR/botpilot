import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnalyticsPage({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://botpilot-a4is.onrender.com/api/analytics', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Analytics</div>
      </div>
      <div className="content">
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div>Loading analytics...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Analytics</div>
          <div className="topbar-sub">Your chatbot performance</div>
        </div>
      </div>

      <div className="content" style={{ flex:1, overflowY:'auto', minHeight:0 }}>

        {/* ── Top stats ── */}
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="scard">
            <div className="scard-label"><i className="ti ti-message" /> Total messages</div>
            <div className="scard-val">{data.totalMsgs}</div>
            <div className="scard-trend neutral">All time</div>
          </div>
          <div className="scard">
            <div className="scard-label"><i className="ti ti-calendar" /> Today</div>
            <div className="scard-val">{data.todayMsgs}</div>
            <div className="scard-trend up">Messages today</div>
          </div>
          <div className="scard">
            <div className="scard-label"><i className="ti ti-robot" /> Active bots</div>
            <div className="scard-val">{data.bots.length}</div>
            <div className="scard-trend neutral">Total bots</div>
          </div>
          <div className="scard">
            <div className="scard-label"><i className="ti ti-chart-bar" /> This week</div>
            <div className="scard-val">
              {data.bots.reduce((sum, b) => sum + b.week, 0)}
            </div>
            <div className="scard-trend up">Last 7 days</div>
          </div>
        </div>

        {/* ── Per bot stats ── */}
        <div className="section-hdr">
          <span className="section-title">Per bot breakdown</span>
        </div>

        {data.bots.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 200 }}>
            <div className="empty-icon">📊</div>
            <div>No data yet — start chatting with your bots!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.bots.map(bot => (
              <div className="embed-card" key={bot.id}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{
                    width:42, height:42, borderRadius:12,
                    background:'#e8f0fb', display:'flex',
                    alignItems:'center', justifyContent:'center', fontSize:22
                  }}>
                    {bot.emoji || '🤖'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:'#0f0f1a' }}>{bot.name}</div>
                    <div style={{ fontSize:12, color:'#888' }}>Bot ID: {bot.id}</div>
                  </div>
                  <div style={{ display:'flex', gap:16 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:'#0f0f1a' }}>{bot.total}</div>
                      <div style={{ fontSize:11, color:'#888' }}>Total</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:'#185FA5' }}>{bot.today}</div>
                      <div style={{ fontSize:11, color:'#888' }}>Today</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:'#3B6D11' }}>{bot.week}</div>
                      <div style={{ fontSize:11, color:'#888' }}>This week</div>
                    </div>
                  </div>
                </div>

                {/* ── Mini bar chart ── */}
                <div style={{ marginTop:8 }}>
                  <div style={{ fontSize:11, color:'#aaa', marginBottom:8 }}>
                    Last 7 days
                  </div>
                  <MiniChart daily={bot.daily} color={bot.brand_color || '#185FA5'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniChart({ daily, color }) {
  // Build last 7 days array
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const found = daily.find(r => r.date?.toString().startsWith(dateStr));
    days.push({ label, count: found ? found.count : 0 });
  }

  const max = Math.max(...days.map(d => d.count), 1);

  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:60 }}>
      {days.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ fontSize:10, color:'#aaa' }}>{d.count > 0 ? d.count : ''}</div>
          <div style={{
            width:'100%',
            height: Math.max((d.count / max) * 44, d.count > 0 ? 4 : 2),
            background: d.count > 0 ? color : '#eee',
            borderRadius:'4px 4px 0 0',
            transition:'.3s'
          }} />
          <div style={{ fontSize:10, color:'#aaa' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}