import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  public async index({ auth, view }: HttpContext) {
    const user = auth.user!

    const users =
      user.role === 'admin' ? await User.query().select('id', 'username', 'email', 'role') : [user]

    return view.render('users/index', { users, authUser: user })
  }

  public async edit({ auth, params, response, view, session }: HttpContext) {
    const user = await User.find(params.id)

    if (!user) {
      session.flash('error', 'User not found')
      return response.redirect('/users')
    }

    if (auth.user!.role !== 'admin' && auth.user!.id !== user.id) {
      session.flash('error', 'Permission denied')
      return response.redirect('/users')
    }

    return view.render('users/edit', { user })
  }

  public async update({ auth, request, params, response, session }: HttpContext) {
    const user = await User.find(params.id)

    if (!user) {
      session.flash('error', 'User not found')
      return response.redirect('/users')
    }

    const isOwner = auth.user!.id === user.id
    const isAdmin = auth.user!.role === 'admin'

    if (!isOwner && !isAdmin) {
      session.flash('error', 'Permission denied')
      return response.redirect('/users')
    }

    const { username, email, role, password } = request.only([
      'username',
      'email',
      'role',
      'password',
    ])

    user.username = username
    user.email = email

    if (isAdmin) {
      user.role = role
    }

    if (isOwner && password && password.trim() !== '') {
      user.password = password
    }

    await user.save()

    session.flash('success', 'User updated successfully')
    return response.redirect('/users')
  }

  public async destroy({ auth, params, response, session }: HttpContext) {
    const authUser = auth.user!

    if (authUser.role !== 'admin') {
      session.flash('error', 'Permission denied')
      return response.redirect('/users')
    }

    if (Number(params.id) === authUser.id) {
      session.flash('error', 'You cannot delete yourself')
      return response.redirect('/users')
    }

    const userToDelete = await User.find(params.id)

    if (!userToDelete) {
      session.flash('error', 'User not found')
      return response.redirect('/users')
    }

    await userToDelete.delete()
    session.flash('success', 'User deleted successfully')
    return response.redirect('/users')
  }
}
