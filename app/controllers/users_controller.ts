import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { userValidator } from '#validators/user'

export default class UsersController {
  public async index({ auth, view }: HttpContext) {
    const user = auth.user!

    const users =
      user.role === 'admin' ? await User.query().select('id', 'username', 'email', 'role') : [user]

    return view.render('users/index', { users, authUser: user })
  }

  public async edit({ auth, params, response, view }: HttpContext) {
    const user = await User.find(params.id)

    if (!user) {
      return response.redirect('/users')
    }

    if (auth.user!.role !== 'admin' && auth.user!.id !== user.id) {
      return response.redirect('/users')
    }

    return view.render('users/edit', { user })
  }

  public async update({ auth, request, params, response, session }: HttpContext) {
    const user = await User.find(params.id)

    if (!user) {
      return response.redirect('/users')
    }

    const isOwner = auth.user!.id === user.id
    const isAdmin = auth.user!.role === 'admin'

    if (!isOwner && !isAdmin) {
      return response.redirect('/users')
    }

    const payload = request.only(['username', 'email', 'role', 'password'])

    try {
      await userValidator.validate(payload)
    } catch (errors) {
      session.flash('errors', errors)
      return response.redirect('back')
    }

    user.username = payload.username
    user.email = payload.email

    if (isAdmin) {
      user.role = payload.role
    }

    if (isOwner && payload.password && payload.password.trim() !== '') {
      user.password = payload.password
    }

    await user.save()

    return response.redirect('/users')
  }

  public async destroy({ auth, params, response }: HttpContext) {
    const authUser = auth.user!

    if (authUser.role !== 'admin') {
      return response.redirect('/users')
    }

    if (Number(params.id) === authUser.id) {
      return response.redirect('/users')
    }

    const userToDelete = await User.find(params.id)

    if (!userToDelete) {
      return response.redirect('/users')
    }

    await userToDelete.delete()

    return response.redirect('/users')
  }
}
