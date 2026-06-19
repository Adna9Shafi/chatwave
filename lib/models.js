import { connectDB } from '@/lib/db'

const models = {}

export async function getModel(name) {
  if (models[name]) return models[name]

  await connectDB()

  switch (name) {
    case 'User':
      models.User = (await import('@/models/User')).default
      break
    case 'Conversation':
      models.Conversation = (await import('@/models/Conversation')).default
      break
    case 'Message':
      models.Message = (await import('@/models/Message')).default
      break
    case 'Group':
      models.Group = (await import('@/models/Group')).default
      break
  }

  return models[name]
}

export { default as User } from '@/models/User'
export { default as Conversation } from '@/models/Conversation'
export { default as Message } from '@/models/Message'
export { default as Group } from '@/models/Group'
