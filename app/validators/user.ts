import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
  username: vine.string(),
  email: vine.string(),
  role: vine.string(),
  password: vine.string().minLength(6),
})

vine.messagesProvider = new SimpleMessagesProvider({
  'username.required': 'Username is required',
  'email.required': 'Email is required',
  'email.email': 'Please provide a valid email address',
  'role.required': 'Role is required',
  'password.minLength': 'Password must be at least 6 characters',
})

export const userValidator = vine.compile(schema)
