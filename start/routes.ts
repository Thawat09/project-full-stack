/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import User from '#models/user'

const AuthController = () => import('#controllers/auth_controller')
const TasksController = () => import('#controllers/tasks_controller')

router.get('/', ({ response }) => response.redirect('/login'))
router.get('/login', [AuthController, 'showLogin'])
router.post('/login', [AuthController, 'login'])
router
  .group(() => {
    router.get('/register', [AuthController, 'showRegister'])
    router.post('/register', [AuthController, 'register'])
  })
  .use([middleware.auth(), middleware.roleCheck()])

router.post('/logout', [AuthController, 'logout'])
router.get('/create_user', async ({ view }) => {
  const user = await User.create({
    username: 'admin',
    email: 'admin@email.com',
    password: 'admin',
    role: 'admin',
  })

  return view.render('auth/create_user_success', { user })
})

router
  .group(() => {
    router.get('/dashboard', [TasksController, 'index'])
    router.get('/tasks/create', [TasksController, 'create'])
    router.post('/tasks', [TasksController, 'store'])
    router.post('/tasks/update-date', [TasksController, 'updateDate'])
    router.delete('/tasks/:id', [TasksController, 'destroy'])
  })
  .use(middleware.auth())
