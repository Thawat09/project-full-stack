import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
  username: vine.string(),
  email: vine.string(),
  password: vine.string().minLength(6),
  role: vine.string(),
})

vine.messagesProvider = new SimpleMessagesProvider({
  'username.required': 'Username is required',
  'email.required': 'Email is required',
  'email.email': 'Invalid email format',
  'email.unique': 'This email is already taken',
  'password.required': 'Password is required',
  'password.minLength': 'Password must be at least 6 characters',
  'role.required': 'Role is required',
})

export const registerValidator = vine.compile(schema)
