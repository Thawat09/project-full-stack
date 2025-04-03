import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
  title: vine.string().maxLength(255),
  description: vine.string(),
  start_date: vine.date(),
  end_date: vine.date(),
})

vine.messagesProvider = new SimpleMessagesProvider({
  'title.required': 'Title is required',
  'title.maxLength': 'Title must be less than 255 characters',
  'start_date.required': 'Start date is required',
  'start_date.date': 'Invalid date format for start date',
  'end_date.date': 'Invalid date format for end date',
})

export const loginValidator = vine.compile(schema)
