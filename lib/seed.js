const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatwave'

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  username: { type: String, unique: true }, avatar: String, coverImage: String, bio: String,
  isOnline: { type: Boolean, default: false }, lastSeen: { type: Date, default: Date.now },
  provider: { type: String, default: 'credentials' },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  settings: {
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    theme: { type: String, default: 'system' },
  },
}, { timestamps: true })

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date, default: Date.now },
  unreadCount: { type: Map, of: Number, default: {} },
  isArchived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPinned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, default: 'text' },
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

const groupSchema = new mongoose.Schema({
  name: String, description: String, avatar: String,
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, default: 'member' },
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

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema)
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)
const Group = mongoose.models.Group || mongoose.model('Group', groupSchema)

const demoUsers = [
  { name: 'Admin User', email: 'admin@chatwave.app', password: 'demo1234', bio: 'Platform administrator', provider: 'credentials' },
  { name: 'Sarah Johnson', email: 'sarah@chatwave.app', password: 'demo1234', bio: 'UX Designer & coffee enthusiast', provider: 'credentials' },
  { name: 'Michael Chen', email: 'michael@chatwave.app', password: 'demo1234', bio: 'Full-stack developer', provider: 'credentials' },
  { name: 'Emily Davis', email: 'emily@chatwave.app', password: 'demo1234', bio: 'Product manager', provider: 'credentials' },
  { name: 'James Wilson', email: 'james@chatwave.app', password: 'demo1234', bio: 'DevOps engineer', provider: 'credentials' },
  { name: 'Lisa Anderson', email: 'lisa@chatwave.app', password: 'demo1234', bio: 'Data scientist', provider: 'credentials' },
  { name: 'David Thompson', email: 'david@chatwave.app', password: 'demo1234', bio: 'Frontend developer', provider: 'credentials' },
  { name: 'Anna Martinez', email: 'anna@chatwave.app', password: 'demo1234', bio: 'Mobile developer', provider: 'credentials' },
  { name: 'Robert Taylor', email: 'robert@chatwave.app', password: 'demo1234', bio: 'Backend developer', provider: 'credentials' },
  { name: 'Jessica Brown', email: 'jessica@chatwave.app', password: 'demo1234', bio: 'UI/UX designer', provider: 'credentials' },
]

const conversationPairs = [
  [0, 1], [0, 2], [1, 2], [1, 3], [2, 4],
]

const sampleMessages = [
  'Hey! How are you?',
  'I\'m doing great, thanks! How about you?',
  'Just working on the new project',
  'That sounds interesting!',
  'Can you review the latest PR?',
  'Sure, I\'ll take a look right now',
  'The design looks amazing!',
  'Thanks! I spent a lot of time on it',
  'When is the deadline for this?',
  'End of this week, I think',
  'Let me check the calendar',
  'It\'s actually next Monday',
  'Perfect, that gives us more time',
  'Should we have a meeting about it?',
  'Good idea. Let me set one up',
  'What about tomorrow at 2 PM?',
  'Works for me!',
  'Great, I\'ll send the invite',
  'Did you see the latest update?',
  'Yes, there are some great new features!',
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    await User.deleteMany({})
    await Conversation.deleteMany({})
    await Message.deleteMany({})
    await Group.deleteMany({})
    console.log('Cleared existing data')

    const hashedPassword = await bcrypt.hash('demo1234', 12)
    const createdUsers = []

    for (let i = 0; i < demoUsers.length; i++) {
      const user = await User.create({
        ...demoUsers[i],
        password: hashedPassword,
        avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
        username: demoUsers[i].name.toLowerCase().replace(/\s+/g, '') + (i + 1),
      })
      createdUsers.push(user)
      console.log(`Created user: ${user.name} (${user.email})`)
    }

    for (const [a, b] of conversationPairs) {
      const conversation = await Conversation.create({
        participants: [createdUsers[a]._id, createdUsers[b]._id],
      })

      const msgCount = 3 + Math.floor(Math.random() * 5)
      for (let i = 0; i < msgCount; i++) {
        const senderIdx = i % 2 === 0 ? a : b
        const msg = await Message.create({
          conversation: conversation._id,
          sender: createdUsers[senderIdx]._id,
          content: sampleMessages[(a * 4 + b * 3 + i) % sampleMessages.length],
          type: 'text',
          createdAt: new Date(Date.now() - (msgCount - i) * 3600000),
        })

        if (i === msgCount - 1) {
          conversation.lastMessage = msg._id
          conversation.lastMessageAt = msg.createdAt
        }
      }

      await conversation.save()
      console.log(`Created conversation between ${demoUsers[a].name} and ${demoUsers[b].name}`)
    }

    const generalGroup = await Group.create({
      name: 'General',
      description: 'General discussion for everyone',
      admin: createdUsers[0]._id,
      moderators: [createdUsers[0]._id, createdUsers[1]._id],
      members: createdUsers.map((u, i) => ({
        user: u._id,
        role: i === 0 ? 'admin' : i <= 2 ? 'member' : 'member',
        joinedAt: new Date(),
      })),
      isPublic: true,
    })

    const msg = await Message.create({
      group: generalGroup._id,
      sender: createdUsers[0]._id,
      content: 'Welcome to the General group! Feel free to chat about anything.',
      type: 'text',
    })

    generalGroup.lastMessage = msg._id
    await generalGroup.save()
    console.log(`Created group: ${generalGroup.name}`)

    const devGroup = await Group.create({
      name: 'Developers',
      description: 'Technical discussions and code reviews',
      admin: createdUsers[0]._id,
      moderators: [createdUsers[0]._id, createdUsers[2]._id],
      members: [createdUsers[0], createdUsers[2], createdUsers[4], createdUsers[6], createdUsers[8]].map((u) => ({
        user: u._id,
        role: u._id.equals(createdUsers[0]._id) ? 'admin' : 'member',
        joinedAt: new Date(),
      })),
      isPublic: false,
    })

    const devMsg = await Message.create({
      group: devGroup._id,
      sender: createdUsers[2]._id,
      content: 'Hey team, let\'s discuss the new architecture proposal',
      type: 'text',
    })

    devGroup.lastMessage = devMsg._id
    await devGroup.save()
    console.log(`Created group: ${devGroup.name}`)

    console.log('\n✅ Seed completed successfully!')
    console.log('\nDemo credentials:')
    console.log('  admin@chatwave.app / demo1234')
    console.log('  sarah@chatwave.app / demo1234')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()
