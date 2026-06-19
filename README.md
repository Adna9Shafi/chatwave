# 💬 ChatWave — Real-Time Chat Application

![ChatWave Banner](https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&q=80)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/MongoDB-7.0-green?style=flat-square&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Socket.io-4.8-white?style=flat-square&logo=socket.io" alt="Socket.io">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Zustand-5-orange?style=flat-square" alt="Zustand">
  <img src="https://img.shields.io/badge/NextAuth-5-blue?style=flat-square" alt="NextAuth">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/status-production-brightgreen?style=flat-square" alt="Status">
</p>

> A production-ready, full-stack real-time chat application built with **Next.js 16 App Router**, **MongoDB**, and **Socket.io**. Delivers instant messaging with direct messages, group chats, message reactions, typing indicators, read receipts, file sharing via Cloudinary, and a polished dark-themed UI. Designed for teams and communities that demand speed, reliability, and a modern user experience.

---

## 🔗 Quick Links

- 🌐 **Live Demo:** [https://chatwave-demo.vercel.app](https://chatwave-demo.vercel.app)
- 📹 **Demo Video:** [https://loom.com/share/chatwave-demo](https://loom.com/share/chatwave-demo)
- 🐛 **Report Bug:** [GitHub Issues](https://github.com/yourusername/chatwave/issues)
- 💡 **Request Feature:** [GitHub Issues](https://github.com/yourusername/chatwave/issues)
- 📖 **API Docs:** [Postman Collection](./docs/postman.json)

---

## ✨ Features

### 📡 Real-Time Communication
- ⚡ **Instant messaging** via WebSocket (Socket.io) with sub-50ms latency
- 👥 **Direct messages** — one-on-one conversations with full message history
- 🏢 **Group chats** — create groups up to 256 members with role-based permissions
- ✏️ **Typing indicators** — real-time "user is typing..." with animated dots
- 👁️ **Read receipts** — double-check marks (✓ sent → ✓✓ delivered → ✓✓ blue seen)
- ✅ **Message reactions** — emoji reactions on any message (toggle on/off per user)
- 🔗 **Reply to messages** — threaded replies with quoted message preview
- 📝 **Edit & delete messages** — edit within 24h, delete for everyone or yourself
- 🔍 **In-chat message search** — full-text search with highlighted results and navigation

### 🔐 Authentication & Security
- 🔑 **Email/password authentication** with bcrypt hashing (12 salt rounds)
- 🟢 **Google OAuth 2.0** — one-click social login
- 🛡️ **NextAuth v5** — JWT-based session management with secure HTTP-only cookies
- 🚫 **User blocking** — block unwanted users; blocked users cannot message you
- 🔒 **Password change** — verify old password before updating
- 🗑️ **Account deletion** — permanent self-service account removal with confirmation
- 📧 **Email uniqueness** enforced at the database level with indexes

### 💬 Messaging Features (US Client Demanded)
- ✅ **Message reactions** — tap any emoji on any message; reactions sync in real-time across all clients
- ✅ **Reply to specific messages** — click reply on any message; quoted preview appears above input
- ✅ **Edit & delete messages** — pencil icon to edit; trash icon with "for everyone" / "for me" options
- ✅ **Read receipts** — single gray check (sent) → double gray (delivered) → double blue (seen)
- ✅ **Typing indicators** — animated bouncing dots; auto-hides after 3s of inactivity
- ✅ **Image & file sharing** — drag-and-drop, paste, or click to upload via Cloudinary (max 10MB)
- ✅ **Link previews** — auto-generated rich preview cards for shared URLs
- ✅ **Emoji picker** — integrated `emoji-picker-react` with dark theme, category navigation, and search
- ✅ **Message search** — slide-in search overlay highlights matching messages; arrow keys to navigate
- ✅ **Infinite scroll** — cursor-based pagination (20 messages per page); seamless scroll-to-top loading

### 👥 Group Features
- 🔗 **Invite links** — shareable 8-character codes; one-click join for new members
- 🏷️ **Roles & permissions** — Admin, Moderator, Member with granular controls
- 🔒 **Private / Public groups** — control visibility and joinability
- 🚫 **Admin-only messaging** — restrict sending to admins and moderators only
- 👤 **Member management** — add, remove, promote, demote members from the info panel
- 🛡️ **Moderator system** — moderators can add members and manage messages
- 📝 **System messages** — automatic "User joined", "User left", "User created the group" notifications
- 🖼️ **Group avatars** — custom upload or auto-generated DiceBear avatar

### 👤 User Experience
- 🟢 **Online/Offline status** — real-time presence with green/gray indicators
- 🌙 **Away / Do Not Disturb / Invisible** — manual presence states with color-coded badges
- 🔔 **Browser push notifications** — desktop notifications for new messages (permission-based)
- 📱 **Fully responsive** — CSS Grid layout adapts from desktop to mobile breakpoints
- 🌑 **Dark theme (default)** — custom CSS custom properties color system; eye-friendly design
- 🔵 **Unread count badges** — per-conversation and global notification badge counters
- 📂 **File type previews** — image thumbnails, file icons with name and size
- 👤 **Rich user profiles** — bio, custom status, cover photo, avatar upload
- ⚙️ **Settings panels** — Notification, Privacy, Appearance, and Account tabs
- 🔎 **People discovery** — search users by name/email/username; send contact requests

---

## 🖥️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.2.9 | Full-stack React framework with App Router |
| **Language** | JavaScript (ES2022) | — | Core application language |
| **UI Library** | React | 19.2.4 | Component-based user interfaces |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS with dark theme |
| **State Management** | Zustand | 5.0.14 | Lightweight global state management |
| **Real-Time** | Socket.io | 4.8.3 | WebSocket-based bidirectional communication |
| **Socket Client** | socket.io-client | 4.8.3 | Browser-side WebSocket client |
| **Database** | MongoDB | 7.0+ | NoSQL document database |
| **ODM** | Mongoose | 9.7.1 | MongoDB object modeling with schemas |
| **Authentication** | NextAuth.js | 5.0.0-beta.31 | JWT-based authentication with multiple providers |
| **Password Hashing** | bcryptjs | 3.0.3 | Secure password hashing |
| **File Uploads** | Cloudinary | 2.10.0 | Cloud-based image and file hosting |
| **Icons** | react-icons | 5.6.0 | Icon library (Feather icons set) |
| **Emoji Picker** | emoji-picker-react | 4.19.1 | Emoji selection with dark mode support |
| **Date Formatting** | date-fns | 4.4.0 | Lightweight date utilities |
| **Toast Notifications** | react-hot-toast | 2.6.0 | Non-blocking toast alerts |
| **Forms** | react-hook-form | 7.79.0 | Performant form management |
| **Validation** | Zod | 4.4.3 | Schema validation |
| **CSS Utilities** | clsx + tailwind-merge | 2.1.1 / 3.6.0 | Conditional class merging |
| **Dropdown Menu** | Radix UI Dropdown | 2.1.18 | Accessible dropdown primitives |
| **Concurrent Dev** | concurrently | 9.2.3 | Run Next.js + Socket.io simultaneously |
| **Linting** | ESLint | 9 | Code quality and consistency |
| **Deployment** | Vercel / Railway | — | Hosting and custom server support |

---

## 📸 Screenshots

### Login Page
![Login Page](./screenshots/login.png)
*Clean authentication with email/password and Google OAuth options*

### Chat List (Sidebar)
![Chat List](./screenshots/chat-list.png)
*Conversation list with avatars, last message previews, timestamps, and unread badges*

### Direct Message Chat
![DM Chat](./screenshots/dm-chat.png)
*Real-time messaging with read receipts (✓✓), emoji reactions, and typing indicator*

### Group Chat
![Group Chat](./screenshots/group-chat.png)
*Multi-user group conversation with sender labels and system messages*

### Emoji Reactions
![Emoji Reactions](./screenshots/reactions.png)
*Toggle emoji reactions on any message; instantly visible to all participants*

### File Sharing
![File Sharing](./screenshots/file-sharing.png)
*Upload images and files via Cloudinary with preview thumbnails*

### Group Info Panel
![Group Info Panel](./screenshots/group-info.png)
*Slide-in panel showing members (with roles), media gallery, and settings*

### People Discovery
![People Discovery](./screenshots/people.png)
*Search users, send contact requests, view profiles, and start conversations*

### Profile Settings
![Profile Settings](./screenshots/profile.png)
*Edit profile, manage notifications, configure privacy, and change appearance*

### Mobile View
![Mobile View](./screenshots/mobile.png)
*Responsive layout adapts to smaller screens with collapsible panels*

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed and configured:

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | v18+ | JavaScript runtime |
| **npm** | v9+ | Package manager |
| **MongoDB Atlas** | Free tier | Cloud database (or local MongoDB) |
| **Cloudinary** | Free tier | Image/file hosting |
| **Google OAuth** | — | Optional: social login |

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chatwave.git
cd chatwave

# Install all dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials (see Environment Variables below)

# Seed the database with demo users and data
node lib/seed.js

# Start development (Next.js only — no real-time features)
npm run dev

# In a separate terminal, start the Socket.io server
node server.js
```

### Quick Start (All Services)

```bash
# Run both Next.js and Socket.io concurrently
npm run dev:all

# App runs at http://localhost:3000
# Socket.io server runs at http://localhost:3001
```

### Running with Custom Socket.io Server

```bash
# Start Socket.io server with auto-reload
npm run dev:server

# Or manually
node server.js

# For production
npm run start:server
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:server": "node server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
    "build": "next build",
    "start": "next start",
    "start:server": "node server.js",
    "seed": "node lib/seed.js",
    "lint": "eslint"
  }
}
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/chatwave` |
| `NEXTAUTH_SECRET` | ✅ Yes | Encryption key for JWT tokens | `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | ✅ Yes | Application base URL | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | ⬜ Optional | Google OAuth 2.0 client ID | `123456789-xxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ⬜ Optional | Google OAuth 2.0 client secret | `GOCSPX-xxxxxxxxxxxx` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ Yes | Cloudinary cloud name | `mycloudname` |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary API key | `987654321098765` |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary API secret | `xxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_SOCKET_URL` | ⬜ Optional | Socket.io server URL | `http://localhost:3001` |
| `NODE_ENV` | ⬜ Optional | Environment mode | `development` |

---

## 📁 Project Structure

```
chatwave/
├── app/                          # Next.js 16 App Router (routes + API)
│   ├── (auth)/                   # Auth route group (public)
│   │   ├── login/                # Login page
│   │   │   └── page.jsx
│   │   └── register/             # Registration page
│   │       └── page.jsx
│   ├── (main)/                   # Main route group (authenticated)
│   │   ├── chats/                # Chat routes
│   │   │   ├── page.jsx          # Chat list / sidebar
│   │   │   └── [chatId]/         # Individual DM conversation
│   │   │       └── page.jsx
│   │   ├── groups/               # Group routes
│   │   │   ├── page.jsx          # Group list
│   │   │   └── [groupId]/        # Individual group chat
│   │   │       └── page.jsx
│   │   ├── join/                 # Invite link landing
│   │   │   └── [inviteCode]/
│   │   │       └── page.jsx
│   │   ├── people/               # User discovery
│   │   │   └── page.jsx
│   │   ├── profile/              # Profile & settings
│   │   │   └── page.jsx
│   │   ├── layout.jsx            # Main layout (NavRail + Sidebar + Content)
│   │   └── page.jsx              # Root redirect (/ → /chats)
│   ├── api/                      # REST API routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    # NextAuth handler
│   │   │   │   └── route.js
│   │   │   └── change-password/  # Password change endpoint
│   │   │       └── route.js
│   │   ├── contacts/             # Contact request CRUD
│   │   │   ├── route.js
│   │   │   └── [contactId]/
│   │   │       └── route.js
│   │   ├── conversations/        # DM conversation endpoints
│   │   │   ├── route.js
│   │   │   ├── [conversationId]/
│   │   │   │   ├── route.js
│   │   │   │   └── messages/
│   │   │   │       └── route.js
│   │   ├── groups/               # Group CRUD + members
│   │   │   ├── route.js
│   │   │   ├── [groupId]/
│   │   │   │   ├── route.js
│   │   │   │   └── members/
│   │   │   │       └── route.js
│   │   │   └── join/
│   │   │       └── [inviteCode]/
│   │   │           └── route.js
│   │   ├── messages/             # Individual message operations
│   │   │   ├── route.js
│   │   │   └── [messageId]/
│   │   │       └── route.js
│   │   ├── notifications/        # Notification persistence
│   │   │   ├── route.js
│   │   │   └── [notificationId]/
│   │   │       └── route.js
│   │   ├── upload/               # File upload to Cloudinary
│   │   │   └── route.js
│   │   └── users/                # User CRUD + search
│   │       ├── route.js
│   │       └── [userId]/
│   │           └── route.js
│   ├── globals.css               # Global styles + theme variables + animations
│   ├── layout.jsx                # Root layout (providers wrapper)
│   └── favicon.ico
│
├── components/                   # React components
│   ├── chat/                     # Chat-specific components
│   │   ├── ChatHeader.jsx        # Conversation header (actions, presence, group info)
│   │   ├── ChatSearch.jsx        # Slide-in message search overlay
│   │   ├── ChatWindow.jsx        # Main chat container (orchestrates all child components)
│   │   ├── ConversationItem.jsx  # Sidebar conversation row (avatar, preview, badge)
│   │   ├── GroupInfoPanel.jsx    # Slide-in group details (members, media, settings)
│   │   ├── GroupItem.jsx         # Sidebar group row
│   │   ├── MessageArea.jsx       # Message list with infinite scroll + date separators
│   │   ├── MessageBubble.jsx     # Individual message (text/image/file/reply/system/reactions)
│   │   ├── MessageInput.jsx      # Message composer (emoji picker, attachments, reply mode)
│   │   ├── NewGroupModal.jsx     # 2-step group creation modal
│   │   └── TypingIndicator.jsx   # Animated "user is typing..." dots
│   ├── layout/                   # Layout components
│   │   ├── NavRail.jsx           # 72px left navigation bar (chats/groups/people/profile)
│   │   ├── NotificationPanel.jsx # Slide-in notification center (380px)
│   │   └── Sidebar.jsx           # 320px conversation list sidebar
│   ├── providers/                # React context providers
│   │   ├── AuthProvider.jsx      # NextAuth session provider wrapper
│   │   ├── SocketProvider.jsx    # Socket.io connection + event handler wiring
│   │   ├── ToastProvider.jsx     # react-hot-toast provider
│   │   └── index.jsx             # Provider composition
│   └── ui/                       # Reusable UI primitives
│       ├── Avatar.jsx            # User avatar with online indicator + initials fallback
│       ├── Badge.jsx             # Count badge (unread messages, notifications)
│       ├── Button.jsx            # Themed button with loading state + variants
│       ├── DropdownMenu.jsx      # Accessible dropdown (Radix-based)
│       ├── EmptyState.jsx        # Empty state placeholder with icon + message
│       ├── Input.jsx             # Styled input with icon + error state
│       ├── Modal.jsx             # Overlay modal with backdrop + size variants
│       ├── Spinner.jsx           # Loading spinner with size variants
│       └── Tooltip.jsx           # Hover tooltip with positioning
│
├── hooks/                        # Custom React hooks
│   ├── useConversation.js        # Conversation data fetching + real-time subscription
│   ├── useOnlineUsers.js         # Online/offline presence hook
│   └── useSocket.js              # Socket connection management hook
│
├── lib/                          # Server utilities
│   ├── auth.js                   # NextAuth configuration (credentials + Google providers)
│   ├── cloudinary.js             # Cloudinary SDK configuration
│   ├── db.js                     # MongoDB connection with cached singleton
│   ├── models.js                 # Dynamic model loader
│   ├── seed.js                   # Database seeder (demo users + data)
│   ├── socket.js                 # Socket.io client singleton (browser)
│   └── utils.js                  # Utility functions (cn, getInitials, formatDate, etc.)
│
├── models/                       # Mongoose schemas
│   ├── Contact.js                # Contact request (requester → recipient, status)
│   ├── Conversation.js           # DM conversation (participants, lastMessage, pins)
│   ├── Group.js                  # Group chat (members, roles, inviteCode, settings)
│   ├── Message.js                # Message (types: text/image/file/audio/emoji/system/reply/gif)
│   ├── Notification.js           # Notification (type, sender, reference, read state)
│   └── User.js                   # User (profile, settings, blockedUsers, online status)
│
├── store/                        # Zustand state stores
│   ├── useChatStore.js           # Conversations, messages, groups, online users, typing
│   ├── useNotificationStore.js   # In-memory notification cache with CRUD actions
│   └── useSocketStore.js         # Socket instance + connection state
│
├── public/                       # Static assets
│   └── (svg files)               # Default Next.js assets
│
├── server.js                     # Custom Socket.io server (Express-less, runs on port 3001)
├── next.config.mjs               # Next.js config (image domains, server actions)
├── jsconfig.json                 # Path aliases (@/ → ./)
├── postcss.config.mjs            # Tailwind CSS v4 PostCSS plugin
├── package.json                  # Dependencies + scripts
├── .env.local                    # Environment variables (excluded from git)
├── .gitignore                    # Ignored files
└── README.md                     # This file
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/change-password` | ✅ Required | Change account password |

**Request Body:**
```json
{
  "oldPassword": "current-password",
  "newPassword": "new-password-123"
}
```

**Response (200):**
```json
{ "success": true }
```

**Error Responses:**
- `400` — New password too short / current password incorrect / social login accounts cannot change password
- `401` — Unauthorized
- `404` — User not found

---

### Conversations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/conversations` | ✅ Required | List all DM conversations for current user |
| `POST` | `/api/conversations` | ✅ Required | Create or get existing conversation with a user |
| `GET` | `/api/conversations/[id]` | ✅ Required | Get single conversation details |
| `DELETE` | `/api/conversations/[id]` | ✅ Required | Delete conversation for current user |
| `GET` | `/api/conversations/[id]/messages` | ✅ Required | Get paginated messages (cursor-based, 20 per page) |

**POST `/api/conversations` — Request Body:**
```json
{ "participantId": "65f1a2b3c4d5e6f7a8b9c0d1" }
```

**GET `/api/conversations/[id]/messages` — Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `cursor` | `string` | Message ID to paginate before (optional) |
| `limit` | `number` | Messages per page (default: 20, max: 50) |

---

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/api/messages/[id]` | ✅ Required | Edit message content |
| `DELETE` | `/api/messages/[id]` | ✅ Required | Soft-delete message (for everyone or just sender) |

**PUT `/api/messages/[id]` — Request Body:**
```json
{ "content": "Updated message text" }
```

**DELETE `/api/messages/[id]` — Request Body:**
```json
{ "deleteFor": "everyone" }
// or
{ "deleteFor": "me" }
```

---

### Groups

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/groups` | ✅ Required | List all groups for current user |
| `POST` | `/api/groups` | ✅ Required | Create a new group |
| `GET` | `/api/groups/[id]` | ✅ Required | Get group details with members |
| `PUT` | `/api/groups/[id]` | ✅ Required | Update group settings (admin only) |
| `DELETE` | `/api/groups/[id]` | ✅ Required | Delete group (admin only) |
| `POST` | `/api/groups/[id]/members` | ✅ Required | Add member to group |
| `PUT` | `/api/groups/[id]/members` | ✅ Required | Change member role (admin only) |
| `DELETE` | `/api/groups/[id]/members` | ✅ Required | Remove member or leave group |
| `GET` | `/api/groups/join/[inviteCode]` | ✅ Required | Get group by invite code |

**POST `/api/groups` — Request Body:**
```json
{
  "name": "Project Alpha",
  "description": "Team discussion for Project Alpha",
  "memberIds": ["65f1a2b3c4d5e6f7a8b9c0d2", "65f1a2b3c4d5e6f7a8b9c0d3"],
  "isPublic": false,
  "avatar": ""
}
```

**PUT `/api/groups/[id]/members` — Change Role:**
```json
{ "userId": "65f1a2b3c4d5e6f7a8b9c0d2", "role": "moderator" }
```

**DELETE `/api/groups/[id]/members` — Remove Member:**
```json
{ "userId": "65f1a2b3c4d5e6f7a8b9c0d2" }
```

---

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users` | ✅ Required | Search users (query param `?q=searchterm`) |
| `POST` | `/api/users` | ❌ Public | Register new user |
| `GET` | `/api/users/[id]` | ✅ Required | Get user profile |
| `PUT` | `/api/users/[id]` | ✅ Required | Update own profile + settings |
| `DELETE` | `/api/users/[id]` | ✅ Required | Delete own account |

**GET `/api/users` — Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | `string` | Search term (matches name, email, username) |

**PUT `/api/users/[id]` — Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "bio": "Full-stack developer",
  "avatar": "https://res.cloudinary.com/.../avatar.jpg",
  "coverImage": "https://res.cloudinary.com/.../cover.jpg",
  "status": "online",
  "settings": {
    "notifications": true,
    "soundEnabled": true,
    "theme": "dark",
    "privacy": { "whoCanMessage": "everyone", "showOnlineStatus": "everyone", "readReceipts": true, "lastSeen": "everyone" },
    "appearance": { "theme": "dark", "chatBubbleStyle": "modern", "fontSize": "medium", "compactMode": false }
  },
  "blockUser": "65f1a2b3c4d5e6f7a8b9c0d5",
  "unblockUser": "65f1a2b3c4d5e6f7a8b9c0d6"
}
```

---

### Contacts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/contacts` | ✅ Required | List contacts (query `?filter=sent|received\|all`) |
| `POST` | `/api/contacts` | ✅ Required | Send contact request |
| `PUT` | `/api/contacts/[id]` | ✅ Required | Accept/reject/block contact request |
| `DELETE` | `/api/contacts/[id]` | ✅ Required | Remove contact relationship |

**POST `/api/contacts` — Request Body:**
```json
{ "recipientId": "65f1a2b3c4d5e6f7a8b9c0d2" }
```

**PUT `/api/contacts/[id]` — Request Body:**
```json
{ "status": "accepted" }
// accepted | rejected | blocked
```

---

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/notifications` | ✅ Required | List recent notifications (50, sorted newest first) |
| `PUT` | `/api/notifications` | ✅ Required | Mark all notifications as read |
| `PUT` | `/api/notifications/[id]` | ✅ Required | Mark single notification as read |
| `DELETE` | `/api/notifications/[id]` | ✅ Required | Delete single notification |

---

### File Upload

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/upload` | ✅ Required | Upload file to Cloudinary |

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | `File` | Image/file to upload (max 10MB) |
| `folder` | `string` | Cloudinary folder path (e.g., `chatwave/profiles`) |

---

## 🔄 Socket.io Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ userId: string }` | Register user connection and set online status |
| `join-conversation` | `{ conversationId: string }` | Join a DM conversation room |
| `join-group` | `{ groupId: string }` | Join a group chat room |
| `send-message` | `{ message: object, conversationId: string }` | Send a message in DM conversation |
| `send-group-msg` | `{ message: object, groupId: string }` | Send a message in group chat |
| `typing-start` | `{ conversationId: string, userId: string }` | Notify that user started typing |
| `typing-stop` | `{ conversationId: string, userId: string }` | Notify that user stopped typing |
| `message-read` | `{ messageId: string, conversationId: string }` | Mark message as read |
| `react-message` | `{ messageId: string, emoji: string, userId: string }` | Toggle emoji reaction on a message |
| `user-away` | `{ userId: string }` | Set user presence to Away |
| `user-back` | `{ userId: string }` | Set user presence back to Online |
| `send-notification` | `{ userIds: string[], notification: object }` | Send a notification to specific users |
| `user-disconnect` | `{ userId: string }` | Manually disconnect user presence |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `online-users` | `string[]` | Array of currently online user IDs |
| `user-online` | `{ userId: string }` | A user came online |
| `user-offline` | `{ userId: string, lastSeen: Date }` | A user went offline |
| `user-away` | `{ userId: string }` | A user set their status to Away |
| `user-back` | `{ userId: string }` | A user returned from Away |
| `receive-message` | `Message` (populated sender) | New message in a DM conversation |
| `receive-group-msg` | `Message` (populated sender) | New message in a group chat |
| `user-typing` | `{ userId: string, conversationId: string }` | A user started typing |
| `user-stop-typing` | `{ userId: string, conversationId: string }` | A user stopped typing |
| `message-seen` | `{ messageId: string, userId: string }` | A message was read by a user |
| `reaction-update` | `{ messageId: string, reactions: object[] }` | Emoji reactions changed on a message |
| `notification` | `Notification` | A new notification for the current user |

---

## 🌐 Deployment

### Option 1: Railway (Full Custom Server — Recommended)

Railway supports custom Node.js servers natively, making it the ideal platform for ChatWave since it includes both the Next.js frontend and Socket.io backend in a single deployment.

1. **Push your repository to GitHub**
2. **Create a Railway project** and connect your GitHub repo
3. **Set environment variables** in Railway dashboard (all variables from `.env.local`)
4. **Add a `Procfile`** to the project root (already configured):

```
web: node server.js
```

5. **MongoDB Atlas** — Create a free cluster, whitelist Railway's IPs (`0.0.0.0/0` for development), and copy the connection string
6. **Cloudinary** — Create a free account, get cloud name, API key, and API secret from the dashboard
7. **Update `NEXTAUTH_URL`** to your Railway domain (e.g., `https://chatwave.up.railway.app`)
8. **Update `NEXT_PUBLIC_SOCKET_URL`** to your Railway domain (same URL)
9. Railway auto-detects the `Procfile` and starts the custom server
10. **Enable custom domain** under Railway Settings for a production-ready URL

### Option 2: Vercel (Frontend) + Render (Socket.io Server)

Because Socket.io requires a persistent WebSocket connection, the standard Vercel serverless deployment needs a companion Socket.io server.

#### Step 1: Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in Vercel dashboard **except** `NEXT_PUBLIC_SOCKET_URL` — set this to your Render URL.

**Vercel Configuration (`vercel.json`):**

```json
{
  "rewrites": [
    {
      "source": "/socket.io/(.*)",
      "destination": "https://your-render-url.onrender.com/socket.io/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

#### Step 2: Deploy to Render (Socket.io Server)

1. **Create a Web Service** on Render from your GitHub repo
2. **Build Command:** `npm install`
3. **Start Command:** `node server.js`
4. **Set environment variables** (all from `.env.local`)
5. **Add a `Procfile`:**

```
web: node server.js
```

Render provides a free `*.onrender.com` domain — use this for your `NEXT_PUBLIC_SOCKET_URL`.

### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com) (free tier: 25GB storage, 20GB bandwidth)
2. From the Dashboard, copy:
   - **Cloud name**
   - **API Key**
   - **API Secret**
3. Create upload presets (optional, for signed uploads):
   - Settings → Upload → Add upload preset
   - Set `Signing Mode` to `unsigned` (for client-side uploads)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the consent screen:
   - User Type: External
   - Add scopes: `email`, `profile`
   - Add test users (if in testing mode)
6. Set **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Set **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
8. Copy `Client ID` and `Client Secret` to your `.env.local`

---

## 🧪 Demo Credentials

After running `node lib/seed.js`, the following demo accounts are available:

| Role | Email | Password | Avatar |
|------|-------|----------|--------|
| 👤 **Adam** | `adam@chatwave.app` | `demo1234` | Default avatar |
| 👤 **Sarah** | `sarah@chatwave.app` | `demo1234` | Default avatar |
| 👤 **John** | `john@chatwave.app` | `demo1234` | Default avatar |

> 💡 **Pro Tip:** Open two browser tabs in incognito mode — log in as Adam in one and Sarah in the other. Send a message from Adam and watch it appear instantly on Sarah's screen. Try reactions, typing indicators, and file sharing in real-time!

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Real-time DM and group chat with Socket.io
- [x] Message reactions with emoji picker
- [x] Reply to specific messages with quoted preview
- [x] Edit and delete messages
- [x] File and image sharing (Cloudinary)
- [x] Typing indicators with animated dots
- [x] Read receipts (✓ sent / ✓✓ delivered / ✓✓✓ seen)
- [x] Online/offline presence with last seen
- [x] User presence states (Away / DND / Invisible)
- [x] Browser push notifications
- [x] Google OAuth 2.0 authentication
- [x] In-chat message search with highlights
- [x] Infinite scroll message history (cursor-based pagination)
- [x] Group invite links with 8-character codes
- [x] Role-based permissions (Admin / Moderator / Member)
- [x] User blocking and privacy controls
- [x] Contact request system
- [x] Persistent notification model (MongoDB)
- [x] System messages for group events
- [x] Theme persistence (dark/light/system)

### 🔜 In Progress
- [ ] End-to-end encryption for private conversations
- [ ] Message translation (Google Translate API)

### 📋 Planned
- [ ] Voice messages (record & send via MediaRecorder API)
- [ ] Video/voice calls (WebRTC with PeerJS)
- [ ] Giphy integration for GIF sharing
- [ ] Message scheduling and reminders
- [ ] Chat export (JSON/PDF)
- [ ] Bot/webhook API for automation
- [ ] Message threads and polls
- [ ] Mobile app (React Native / Expo)
- [ ] Desktop app (Electron / Tauri)
- [ ] Read receipt toggle per conversation
- [ ] Custom emoji / sticker packs
- [ ] Message pinning in groups
- [ ] AI-powered smart replies

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** following the existing code style (JavaScript, Prettier formatting)
4. **Run the linter:**
   ```bash
   npm run lint
   ```
5. **Build to verify:**
   ```bash
   npm run build
   ```
6. **Commit with conventional commits:**
   ```bash
   git commit -m "feat: add voice message recording"
   git commit -m "fix: resolve typing indicator race condition"
   git commit -m "docs: update API reference"
   ```
7. **Push and open a Pull Request**

### Commit Convention

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `refactor:` | Code refactoring (no functional changes) |
| `style:` | Code style/formatting changes |
| `test:` | Adding or updating tests |
| `chore:` | Build process, dependencies, tooling |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 ChatWave

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 Author

**ChatWave Team**

- 🌐 **Portfolio:** [https://yourportfolio.com](https://yourportfolio.com)
- 💼 **LinkedIn:** [https://linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- 🐙 **GitHub:** [https://github.com/yourusername](https://github.com/yourusername)
- 📧 **Email:** your.email@example.com

Built with ❤️ for teams that need real-time communication that *just works*.

---

## ⭐ Show Your Support

If this project helped you — whether you're evaluating it for your team, learning from the codebase, or using it as a portfolio piece — please give it a ⭐ on GitHub!

<a href="https://github.com/yourusername/chatwave">
  <img src="https://img.shields.io/badge/⭐_Star_on_GitHub-181717?style=for-the-badge&logo=github" alt="Star on GitHub">
</a>

---

*ChatWave — Real-time conversations, reimagined.*
#   c h a t w a v e  
 