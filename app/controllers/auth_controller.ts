import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  public async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  public async login({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password.trim())
      await auth.use('web').login(user)
      session.flash('success', 'Flash works!')
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
    const { username, email, password, role } = request.only([
      'username',
      'email',
      'password',
      'role',
    ])

    const roleSafe = role === 'admin' ? 'admin' : 'user'

    await User.create({
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      role: roleSafe,
    })

    session.flash('success', 'Flash works!')
    return response.redirect('/dashboard')
  }
}
