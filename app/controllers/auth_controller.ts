import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/login'
import { registerValidator } from '#validators/register'

export default class AuthController {
  public async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  public async login({ request, auth, response, session }: HttpContext) {
    let payload
    try {
      payload = await request.validateUsing(loginValidator)
    } catch (errors) {
      session.flash('errors', errors)
      return response.redirect('back')
    }

    try {
      const user = await User.verifyCredentials(payload.email, payload.password.trim())
      await auth.use('web').login(user)
      return response.redirect('/dashboard')
    } catch {
      session.flash('error', 'Invalid credentials')
      return response.redirect('/login')
    }
  }

  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }

  public async showRegister({ view }: HttpContext) {
    return view.render('auth/register')
  }

  public async register({ request, response, session }: HttpContext) {
    let payload
    try {
      payload = await request.validateUsing(registerValidator)
    } catch (errors) {
      session.flash('errors', errors)
      return response.redirect('back')
    }

    const roleSafe = payload.role === 'admin' ? 'admin' : 'user'
    await User.create({
      username: payload.username.trim(),
      email: payload.email.trim(),
      password: payload.password.trim(),
      role: roleSafe,
    })

    return response.redirect('/dashboard')
  }
}
