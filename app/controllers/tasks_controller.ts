import type { HttpContext } from '@adonisjs/core/http'
import Task from '#models/task'

export default class TasksController {
  public async index({ auth, view, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.redirect('/login')
    }

    const tasks =
      user.role === 'admin'
        ? await Task.query().preload('user')
        : await Task.query().where('assigned_to', user.id).preload('user')

    const formattedTasks = tasks.map((task) => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        start_date: task.start_date.toISODate(),
        end_date: task.end_date.plus({ days: 1 }).toISODate(),
        user: {
          username: task.user?.username ?? 'Unknown',
        },
      }
    })

    return view.render('tasks/index', { tasks: formattedTasks })
  }

  public async create({ view }: HttpContext) {
    return view.render('tasks/create')
  }

  public async store({ request, auth, response }: HttpContext) {
    const rawData = request.only(['title', 'description', 'start_date', 'end_date'])

    const data = {
      ...rawData,
      assigned_to: auth.user!.id,
    }

    await Task.create(data)

    return response.redirect('/dashboard')
  }

  public async updateDate({ request, response }: HttpContext) {
    const { id, newDate } = request.only(['id', 'newDate'])
    const task = await Task.findOrFail(id)
    task.start_date = newDate
    await task.save()
    return response.json({ success: true })
  }

  public async destroy({ params, auth, response }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    if (auth.user!.role === 'admin' || task.assigned_to === auth.user!.id) {
      await task.delete()
    }
    return response.redirect('/dashboard')
  }
}
