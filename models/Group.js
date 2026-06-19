import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ['admin', 'moderator', 'member'],
          default: 'member',
        },
        nickname: {
          type: String,
          default: '',
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    inviteCode: {
      type: String,
      unique: true,
    },
    maxMembers: {
      type: Number,
      default: 256,
    },
    settings: {
      onlyAdminsCanMessage: { type: Boolean, default: false },
      onlyAdminsCanAddMembers: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

groupSchema.index({ 'members.user': 1 })
groupSchema.index({ inviteCode: 1 })

groupSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    this.inviteCode = code
  }
  next()
})

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema)

export default Group
