const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
app.use('/widget', express.static(path.join(__dirname, '../widget')));

const JWT_SECRET = process.env.JWT_SECRET;

// MySQL connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false },
  connectTimeout: 30000,
  waitForConnections: true,
  connectionLimit: 10
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- AUTH ---

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if email already exists FIRST
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashed]
    );
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email, plan: 'free' });

  } catch (err) {
    console.error('Register error:', err.message); // shows real error in terminal
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: rows[0].id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email, plan: rows[0].plan });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// --- MIDDLEWARE ---

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- BOTS ---

app.get('/api/bots', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM bots WHERE user_id = ?', [req.user.id]
  );
  res.json(rows);
});

app.post('/api/bots', authMiddleware, async (req, res) => {
  const { name, system_prompt, brand_color } = req.body;
  const [result] = await db.query(
    'INSERT INTO bots (user_id, name, system_prompt, brand_color) VALUES (?, ?, ?, ?)',
    [req.user.id, name, system_prompt, brand_color || '#185FA5']
  );
  res.json({ id: result.insertId, name, system_prompt, brand_color });
});

app.delete('/api/bots/:id', authMiddleware, async (req, res) => {
  await db.query(
    'DELETE FROM bots WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  res.json({ success: true });
});

// --- CHAT ---

app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM bots WHERE id = ?', [botId]);
    const bot = rows[0];
    const systemPrompt = bot?.system_prompt || 'You are a helpful assistant.';

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // ✅ fixed model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    const reply = response.choices[0].message.content;

    if (botId) {
      await db.query(
        'INSERT INTO messages (bot_id, user_message, bot_reply) VALUES (?, ?, ?)',
        [botId, message, reply]
      );
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
// Get embed code for a bot
app.get('/api/bots/:id/embed', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM bots WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Bot not found' });
  res.json({ botId: rows[0].id, name: rows[0].name, embedCode: `<script src="https://botpilot-a4is.onrender.com/widget/widget.js" data-bot-id="${rows[0].id}" data-bot-name="${rows[0].name}" data-color="#185FA5"></script>` });
});
// Analytics — message counts per bot
app.get('/api/analytics', authMiddleware, async (req, res) => {
  const [bots] = await db.query(
    'SELECT id, name, emoji FROM bots WHERE user_id = ?',
    [req.user.id]
  );

  const botStats = await Promise.all(bots.map(async (bot) => {
    const [total] = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE bot_id = ?',
      [bot.id]
    );
    const [today] = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE bot_id = ? AND DATE(created_at) = CURDATE()',
      [bot.id]
    );
    const [week] = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE bot_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
      [bot.id]
    );
    const [daily] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM messages WHERE bot_id = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [bot.id]
    );
    return {
      ...bot,
      total: total[0].count,
      today: today[0].count,
      week: week[0].count,
      daily
    };
  }));

  const [totalMsgs] = await db.query(
    `SELECT COUNT(*) as count FROM messages m
     JOIN bots b ON m.bot_id = b.id WHERE b.user_id = ?`,
    [req.user.id]
  );
  const [todayMsgs] = await db.query(
    `SELECT COUNT(*) as count FROM messages m
     JOIN bots b ON m.bot_id = b.id 
     WHERE b.user_id = ? AND DATE(m.created_at) = CURDATE()`,
    [req.user.id]
  );

  res.json({ bots: botStats, totalMsgs: totalMsgs[0].count, todayMsgs: todayMsgs[0].count });
});

// Get user settings
app.get('/api/settings', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, email, plan, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(rows[0]);
});

// Update password
app.put('/api/settings/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const match = await bcrypt.compare(currentPassword, rows[0].password);
  if (!match) return res.status(400).json({ error: 'Current password is wrong' });
  const hashed = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
  res.json({ success: true });
});

// Delete account
app.delete('/api/settings/account', authMiddleware, async (req, res) => {
  await db.query('DELETE FROM messages WHERE bot_id IN (SELECT id FROM bots WHERE user_id = ?)', [req.user.id]);
  await db.query('DELETE FROM bots WHERE user_id = ?', [req.user.id]);
  await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
  res.json({ success: true });
});
// Edit bot
app.put('/api/bots/:id', authMiddleware, async (req, res) => {
  const { name, system_prompt, emoji } = req.body;
  await db.query(
    'UPDATE bots SET name = ?, system_prompt = ?, emoji = ? WHERE id = ? AND user_id = ?',
    [name, system_prompt, emoji, req.params.id, req.user.id]
  );
  res.json({ success: true });
});

app.listen(5000, () => console.log('✅ Server running on https://botpilot-a4is.onrender.com'));