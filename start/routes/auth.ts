import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import User from '#models/user'

const AuthController = () => import('#controllers/auth_controller')

router.get('/', ({ response }) => response.redirect('/login'))
router.get('/login', [AuthController, 'showLogin'])
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout'])

router
  .group(() => {
    router.get('/register', [AuthController, 'showRegister'])
    router.post('/register', [AuthController, 'register'])
  })
  .use([middleware.auth(), middleware.roleCheck()])

router.get('/create_user', async ({ view }) => {
  const user = await User.create({
    username: 'admin',
    email: 'admin@email.com',
    password: 'admin',
    role: 'admin',
  })

  return view.render('auth/create_user_success', { user })
})
