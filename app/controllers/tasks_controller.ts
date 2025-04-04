import type { HttpContext } from '@adonisjs/core/http'
import Task from '#models/task'
import User from '#models/user'
import { taskValidator } from '#validators/task'

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

  public async store({ request, response, session }: HttpContext) {
    const payload = request.only([
      'title',
      'description',
      'start_date',
      'end_date',
      'assigned_to',
      'status',
    ])

    try {
      await taskValidator.validate({
        title: payload.title,
        description: payload.description,
        start_date: payload.start_date,
        end_date: payload.end_date,
      })
    } catch (errors) {
      session.flash('errors', errors)
      return response.redirect('back')
    }

    await Task.create({
      title: payload.title,
      description: payload.description,
      start_date: payload.start_date,
      end_date: payload.end_date,
      assigned_to: payload.assigned_to,
      status: payload.status ?? 'pending',
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

  public async update({ auth, params, request, response, session }: HttpContext) {
    const task = await Task.find(params.id)
    if (!task) return response.redirect('/dashboard')

    const isOwner = task.assigned_to === auth.user!.id
    const isAdmin = auth.user!.role === 'admin'

    if (!isOwner && !isAdmin) {
      return response.redirect('/dashboard')
    }

    const payload = request.only([
      'title',
      'description',
      'start_date',
      'end_date',
      'assigned_to',
      'status',
    ])

    try {
      await taskValidator.validate({
        title: payload.title,
        description: payload.description,
        start_date: payload.start_date,
        end_date: payload.end_date,
      })
    } catch (errors) {
      session.flash('errors', errors)
      return response.redirect('back')
    }

    task.title = payload.title
    task.description = payload.description
    task.start_date = payload.start_date
    task.end_date = payload.end_date
    task.status = payload.status

    if (auth.user!.role === 'admin') {
      task.assigned_to = payload.assigned_to
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
