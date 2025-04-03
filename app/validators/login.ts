import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
  email: vine.string(),
  password: vine.string(),
})

vine.messagesProvider = new SimpleMessagesProvider({
  'email.required': 'Email is required',
  'email.email': 'Please provide a valid email address',
  'password.required': 'Password is required',
})

export const loginValidator = vine.compile(schema)
