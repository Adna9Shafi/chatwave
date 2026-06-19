<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Socket.io-4.8-white?logo=socket.io" alt="Socket.io">
  <img src="https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/Zustand-5-orange" alt="Zustand">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

<h1 align="center">💬 ChatWave</h1>
<h3 align="center">Real-time chat for modern teams</h3>

<p align="center">
  Next.js 16 · MongoDB · Socket.io · Tailwind CSS 4 · Zustand · NextAuth v5
</p>

---

## ✨ Features

### 💬 Messaging
Real-time DMs · Message reactions (emoji) · Reply threads · Edit & delete · Read receipts (✓✓✓) · Typing indicators · Image/file sharing (Cloudinary) · Emoji picker · In-chat message search · Infinite scroll (cursor pagination)

### 👥 Groups
Up to 256 members · Admin/Moderator/Member roles · Invite links · Public/Private groups · Admin-only messaging · Member management · System messages (join/leave/create)

### 🔐 Auth & Security
Email/password (bcrypt) · Google OAuth · NextAuth v5 (JWT) · User blocking · Password change · Account deletion

### 🟢 Presence
Online/offline · Away / DND / Invisible · Last seen · Browser push notifications · Unread badges

---

## 🖥️ Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Framework | Next.js 16 | App Router, server actions |
| UI | React 19, Tailwind CSS 4 | Components, dark theme |
| State | Zustand 5 | Global state (chats, notifications) |
| Real-time | Socket.io 4.8 | WebSocket messaging |
| DB | MongoDB 7, Mongoose 9 | Data persistence |
| Auth | NextAuth v5 | JWT sessions, Google OAuth |
| Uploads | Cloudinary | Image/file hosting |
| Icons | react-icons (Feather) | UI icons |
| Emoji | emoji-picker-react 4 | Emoji selector |
| Dates | date-fns 4 | Timestamp formatting |
| Forms | react-hook-form + Zod | Validation |
| Toast | react-hot-toast | Notifications |
| Dropdown | Radix UI | Accessible menus |

---

## 🚀 Quick Start

```bash
git clone https://github.com/Adna9Shafi/chatwave.git
cd chatwave
npm install
cp .env.local.example .env.local   # edit with your credentials
node lib/seed.js                    # demo users
npm run dev:all                     # Next.js (:3000) + Socket.io (:3001)
```

**Demo logins** (after seed): `adam@chatwave.app` / `sarah@chatwave.app` / `john@chatwave.app` — password: `demo1234`

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/change-password` | ✅ | Change password |
| | | |
| GET | `/api/conversations` | ✅ | List DMs |
| POST | `/api/conversations` | ✅ | Create/get DM |
| GET | `/api/conversations/:id/messages?cursor=` | ✅ | Paginated messages |
| | | |
| GET/POST | `/api/groups` | ✅ | List / Create groups |
| GET/PUT/DELETE | `/api/groups/:id` | ✅ | Group details / Update / Delete |
| POST/PUT/DELETE | `/api/groups/:id/members` | ✅ | Member management |
| GET | `/api/groups/join/:code` | ✅ | Invite lookup |
| | | |
| GET | `/api/users?q=` | ✅ | Search users |
| POST | `/api/users` | ❌ | Register |
| GET/PUT/DELETE | `/api/users/:id` | ✅ | Profile / Update / Delete |
| | | |
| GET/POST | `/api/contacts` | ✅ | List / Send contact request |
| PUT/DELETE | `/api/contacts/:id` | ✅ | Accept / Remove contact |
| | | |
| GET | `/api/notifications` | ✅ | List notifications |
| PUT | `/api/notifications` | ✅ | Mark all read |
| PUT/DELETE | `/api/notifications/:id` | ✅ | Mark read / Delete |
| | | |
| POST | `/api/upload` | ✅ | File upload (multipart) |

---

## 🔌 Socket.io Events

**Client → Server:** `join`, `join-conversation`, `join-group`, `send-message`, `send-group-msg`, `typing-start`, `typing-stop`, `message-read`, `react-message`, `user-away`, `user-back`, `send-notification`, `user-disconnect`

**Server → Client:** `online-users`, `user-online`, `user-offline`, `user-away`, `user-back`, `receive-message`, `receive-group-msg`, `user-typing`, `user-stop-typing`, `message-seen`, `reaction-update`, `notification`

---

## 🌐 Deployment

### Railway (single deploy — custom server)
```bash
# Procfile
web: node server.js
```
Set all env vars, connect GitHub repo, Railway auto-detects the custom server.

### Vercel + Render (frontend + socket server)
```json
// vercel.json
{ "rewrites": [
    { "source": "/socket.io/(.*)", "destination": "https://your-render-url.onrender.com/socket.io/$1" },
    { "source": "/(.*)", "destination": "/" }
] }
```

---

## 📁 Structure

```
app/                    Next.js routes (auth, main, 18 API endpoints)
components/chat/        10 chat components (ChatWindow, MessageBubble, MessageInput, etc.)
components/layout/      NavRail, Sidebar, NotificationPanel
components/providers/   Auth, Socket, Toast providers
components/ui/          9 reusable UI primitives (Avatar, Button, Modal, etc.)
hooks/                  3 custom hooks
lib/                    auth.js, db.js, socket.js, cloudinary.js, seed.js, utils.js
models/                 6 Mongoose models (User, Message, Conversation, Group, Contact, Notification)
store/                  3 Zustand stores (chat, notifications, socket)
server.js               Socket.io server (port 3001)
```

---

## 📄 License

MIT

---

<p align="center">Built with ❤️ — <a href="https://github.com/Adna9Shafi/chatwave">github.com/Adna9Shafi/chatwave</a></p>
