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

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, CSS3, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| AI | Groq API, LLaMA 3 |
| Auth | JWT, bcryptjs |
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

### Environment Variables
## 👨‍💻 Author
Built by Ravikiran — Full Stack Developer