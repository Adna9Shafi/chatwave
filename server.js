const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3001', 10)
const nextPort = parseInt(process.env.NEXT_PORT || '3000', 10)

const app = next({ dev, hostname, port: nextPort })
const handle = app.getRequestHandler()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatwave'

const onlineUsers = new Map()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  const io = new Server(server, {
    cors: {
      origin: `http://localhost:${nextPort}`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('Socket server: MongoDB connected'))
    .catch((err) => console.error('Socket server: MongoDB connection error:', err))

  const User = mongoose.model('User', require('./models/User').default?.schema || mongoose.Schema({}))
  const Message = mongoose.model('Message', require('./models/Message').default?.schema || mongoose.Schema({}))
  const Conversation = mongoose.model('Conversation', require('./models/Conversation').default?.schema || mongoose.Schema({}))
  const Group = mongoose.model('Group', require('./models/Group').default?.schema || mongoose.Schema({}))

  // Define schemas dynamically to avoid import issues in CommonJS
  const userSchema = new mongoose.Schema({
    name: String, email: String, password: String, username: String,
    avatar: String, coverImage: String, bio: String,
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    settings: {
      notifications: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
  }, { timestamps: true })

  const messageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'image', 'file', 'audio', 'emoji', 'system', 'reply', 'gif'], default: 'text' },
    content: { type: String, default: '' },
    fileUrl: String, fileName: String, fileSize: Number,
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    reactions: [{ emoji: String, users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    editedAt: Date,
  }, { timestamps: true })

  const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCount: { type: Map, of: Number, default: {} },
    isArchived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPinned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }, { timestamps: true })

  const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    avatar: String,
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date, default: Date.now },
      role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
      nickname: String,
    }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: false },
    inviteCode: { type: String, unique: true },
    maxMembers: { type: Number, default: 256 },
    settings: {
      onlyAdminsCanMessage: { type: Boolean, default: false },
      onlyAdminsCanAddMembers: { type: Boolean, default: false },
    },
  }, { timestamps: true })

  const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'mention', 'contact_request', 'group_invite', 'group_event', 'read_receipt'], required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referenceId: { type: String, default: '' },
    referenceType: { type: String, enum: ['conversation', 'group', 'contact'], default: 'conversation' },
    read: { type: Boolean, default: false },
  }, { timestamps: true })

  const UserModel = mongoose.models.User || mongoose.model('User', userSchema)
  const MessageModel = mongoose.models.Message || mongoose.model('Message', messageSchema)
  const ConversationModel = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema)
  const GroupModel = mongoose.models.Group || mongoose.model('Group', groupSchema)
  const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)

  io.on('connection', (socket) => {
    console.log('New connection:', socket.id)

    socket.on('join', async ({ userId }) => {
      if (!userId) return
      onlineUsers.set(userId.toString(), socket.id)
      socket.userId = userId.toString()

      try {
        await UserModel.findByIdAndUpdate(userId, { isOnline: true })
      } catch (err) {
        console.error('Error updating user online status:', err)
      }

      io.emit('online-users', Array.from(onlineUsers.keys()))
      io.emit('user-online', { userId: userId.toString() })
    })

    socket.on('join-conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`)
      }
    })

    socket.on('join-group', ({ groupId }) => {
      if (groupId) {
        socket.join(`group:${groupId}`)
      }
    })

    socket.on('send-message', async ({ message, conversationId }) => {
      try {
        const newMessage = await MessageModel.create({
          ...message,
          conversation: conversationId,
        })

        const populatedMessage = await MessageModel.findById(newMessage._id)
          .populate('sender', 'name email avatar username')
          .lean()

        await ConversationModel.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
          lastMessageAt: new Date(),
        })

        io.to(`conversation:${conversationId}`).emit('receive-message', populatedMessage)
      } catch (err) {
        console.error('Error sending message:', err)
      }
    })

    socket.on('send-group-msg', async ({ message, groupId }) => {
      try {
        const newMessage = await MessageModel.create({
          ...message,
          group: groupId,
        })

        const populatedMessage = await MessageModel.findById(newMessage._id)
          .populate('sender', 'name email avatar username')
          .lean()

        await GroupModel.findByIdAndUpdate(groupId, {
          lastMessage: newMessage._id,
          lastMessageAt: new Date(),
        })

        io.to(`group:${groupId}`).emit('receive-group-msg', populatedMessage)
      } catch (err) {
        console.error('Error sending group message:', err)
      }
    })

    socket.on('typing-start', ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit('user-typing', { userId, conversationId })
    })

    socket.on('typing-stop', ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit('user-stop-typing', { userId, conversationId })
    })

    socket.on('message-read', async ({ messageId, conversationId }) => {
      try {
        const userId = socket.userId
        await MessageModel.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: userId },
        })

        io.to(`conversation:${conversationId}`).emit('message-seen', {
          messageId,
          userId,
        })
      } catch (err) {
        console.error('Error marking message as read:', err)
      }
    })

    socket.on('react-message', async ({ messageId, emoji, userId }) => {
      try {
        const message = await MessageModel.findById(messageId)
        if (!message) return

        const existingReaction = message.reactions.find((r) => r.emoji === emoji)

        if (existingReaction) {
          const userIndex = existingReaction.users.indexOf(userId)
          if (userIndex > -1) {
            existingReaction.users.splice(userIndex, 1)
            if (existingReaction.users.length === 0) {
              message.reactions.pull({ _id: existingReaction._id })
            }
          } else {
            existingReaction.users.push(userId)
          }
        } else {
          message.reactions.push({ emoji, users: [userId] })
        }

        await message.save()

        const convoId = message.conversation?.toString()
        if (convoId) {
          io.to(`conversation:${convoId}`).emit('reaction-update', {
            messageId,
            reactions: message.reactions,
          })
        }
      } catch (err) {
        console.error('Error updating reaction:', err)
      }
    })

    socket.on('user-away', async ({ userId }) => {
      io.emit('user-away', { userId })
    })

    socket.on('user-back', async ({ userId }) => {
      io.emit('user-back', { userId })
    })

    socket.on('send-notification', async ({ userIds, notification }) => {
      try {
        const docs = userIds.map((uid) => ({
          user: uid,
          type: notification.type || 'message',
          title: notification.title || '',
          body: notification.body || '',
          sender: notification.sender || socket.userId,
          referenceId: notification.referenceId || '',
          referenceType: notification.referenceType || 'conversation',
        }))
        if (docs.length > 0) {
          await NotificationModel.insertMany(docs)
        }
      } catch (err) {
        console.error('Error saving notifications:', err)
      }

      userIds.forEach((uid) => {
        const sockId = onlineUsers.get(uid.toString())
        if (sockId) {
          io.to(sockId).emit('notification', notification)
        }
      })
    })

    socket.on('user-disconnect', async ({ userId }) => {
      handleUserDisconnect(userId)
    })

    socket.on('disconnect', async () => {
      const userId = socket.userId
      if (userId) {
        handleUserDisconnect(userId)
      }
    })

    async function handleUserDisconnect(userId) {
      onlineUsers.delete(userId)
      try {
        await UserModel.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        })
      } catch (err) {
        console.error('Error updating user offline status:', err)
      }
      io.emit('online-users', Array.from(onlineUsers.keys()))
      io.emit('user-offline', { userId, lastSeen: new Date() })
    }
  })

  server.listen(port, () => {
    console.log(`> Socket.io server ready on http://localhost:${port}`)
  })
})
