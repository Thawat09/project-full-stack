import type { HttpContext } from '@adonisjs/core/http'
import Task from '#models/task'
import User from '#models/user'

export default class TasksController {
  public async index({ auth, view, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.redirect('/login')
    }

    const tasks = await Task.query()
      .if(user.role !== 'admin', (query) => {
        query.where('assigned_to', user.id)
      })
      .preload('user')

    const formattedTasks = tasks.map((task) => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        start_date: task.start_date.toISODate(),
        end_date: task.end_date.plus({ days: 1 }).toISODate(),
        status: task.status,
        user: {
          username: task.user?.username ?? 'Unknown',
        },
      }
    })

    return view.render('tasks/index', { tasks: formattedTasks })
  }

  public async create({ auth, view }: HttpContext) {
    const users = await User.query().select('id', 'username')
    return view.render('tasks/create', { users, authUser: auth.user! })
  }

  public async store({ request, response }: HttpContext) {
    const {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      assigned_to: assignedTo,
      status,
    } = request.only(['title', 'description', 'start_date', 'end_date', 'assigned_to', 'status'])

    await Task.create({
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      assigned_to: assignedTo,
      status: status ?? 'pending',
    })

    return response.redirect('/dashboard')
  }

  public async updateDate({ request, response }: HttpContext) {
    const { id, newDate } = request.only(['id', 'newDate'])
    const task = await Task.findOrFail(id)
    task.start_date = newDate
    await task.save()
    return response.json({ success: true })
  }

  public async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const task = await Task.findOrFail(params.id)

    if (user.role !== 'admin') {
      return response.redirect('/tasks/table')
    }

    await task.delete()

    return response.redirect('/tasks/table')
  }

  public async edit({ auth, params, view, response }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    if (auth.user!.role !== 'admin' && task.assigned_to !== auth.user!.id) {
      return response.redirect('/dashboard')
    }

    const users = await User.query().select('id', 'username')
    return view.render('tasks/edit', { task, users, authUser: auth.user! })
  }

  public async update({ auth, params, request, response }: HttpContext) {
    const task = await Task.find(params.id)
    if (!task) return response.redirect('/dashboard')

    const isOwner = task.assigned_to === auth.user!.id
    const isAdmin = auth.user!.role === 'admin'

    if (!isOwner && !isAdmin) {
      return response.redirect('/dashboard')
    }

    const {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      assigned_to: assignedTo,
      status,
    } = request.only(['title', 'description', 'start_date', 'end_date', 'assigned_to', 'status'])

    task.title = title
    task.description = description
    task.start_date = startDate
    task.end_date = endDate
    task.status = status

    if (auth.user!.role === 'admin') {
      task.assigned_to = assignedTo
    }

    await task.save()

    return response.redirect('/tasks/table')
  }

  public async list({ auth, view }: HttpContext) {
    const user = auth.user!
    const tasks =
      user.role === 'admin'
        ? await Task.query().preload('user').orderBy('start_date', 'desc')
        : await Task.query()
            .where('assigned_to', user.id)
            .preload('user')
            .orderBy('start_date', 'desc')

    return view.render('tasks/list', { tasks, authUser: user })
  }
}
