import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    coverImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [160, 'Bio cannot exceed 160 characters'],
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    settings: {
      notifications: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
  },
  { timestamps: true }
)

userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ name: 'text', email: 'text', username: 'text' })

userSchema.pre('save', function (next) {
  if (!this.username) {
    const randomSuffix = Math.floor(Math.random() * 10000)
    this.username = `${this.name?.toLowerCase().replace(/\s+/g, '')}${randomSuffix}`
  }
  next()
})

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
