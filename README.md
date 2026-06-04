# 🤖 BotPilot — AI SaaS Chatbot Builder

A full-stack SaaS platform that allows businesses to create 
AI-powered chatbots and embed them on any website with one line of code.

## 🌐 Live Demo
[https://botpilot-git-main-ravikiran-s-projects2.vercel.app](https://botpilot-git-main-ravikiran-s-projects2.vercel.app)

## ✨ Features
- 🔐 User authentication with JWT
- 🤖 Create unlimited AI chatbots
- 🎭 Custom bot personalities via system prompts
- 📊 Analytics dashboard with message tracking
- 🧩 Embeddable JavaScript widget for any website
- 🎨 Brand color customization
- 📱 Responsive dashboard UI
- 🗄️ MySQL database with multi-tenant isolation

- ## ■ What I Learned
- Node.js + Express REST API development
- JWT Authentication with bcryptjs
- Groq API integration (LLaMA 3 8B model)
- Real-time AI chat with custom system prompts
- Embeddable JavaScript widget development
- Multi-tenant database architecture

## ■■ Tech Stack
Frontend → React.js + CSS3 + Axios
Backend → Node.js + Express.js + REST API
Database → MySQL (mysql2)
Auth → JWT + bcryptjs
AI → Groq API + LLaMA 3 (8B model)
| Hosting | Vercel + Render |

## 🏗️ Architecture
React Frontend (Vercel)
↓
Node.js REST API (Render)
↓
MySQL Database (filess.io)
↓
Groq AI API (LLaMA 3)
## 🚀 How It Works
1. Business owner signs up and creates a bot
2. Sets bot personality using a system prompt
3. Copies one line embed code
4. Pastes on their website
5. Visitors chat with AI instantly

## 📦 Embed Code
```html
<script
  src="https://botpilot-backend.onrender.com/widget/widget.js"
  data-bot-id="your_bot_id"
  data-bot-name="Your Bot Name"
  data-color="#185FA5">
</script>
```

## 🔧 Local Setup

### Backend
```bash
cd backend
npm install
# Create .env file with your credentials
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```
## ■■ Setup
git clone https://github.com/kiranmailar3111-RRR/botpilot
cd botpilot
npm install
cp .env.example .env
# Add your GROQ_API_KEY in .env
node server.js
---
## ■■■ Developer
Ravikiran G Mailar
■ linkedin.com/in/ravi-kiran-1a7010247
