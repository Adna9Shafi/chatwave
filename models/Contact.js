import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

contactSchema.index({ requester: 1, recipient: 1 }, { unique: true })
contactSchema.index({ recipient: 1, status: 1 })

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema)

export default Contact
