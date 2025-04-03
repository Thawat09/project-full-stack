import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import User from '#models/user'

const AuthController = () => import('#controllers/auth_controller')
const TasksController = () => import('#controllers/tasks_controller')
const UsersController = () => import('#controllers/users_controller')

router.get('/', ({ response }) => response.redirect('/login'))
router.get('/login', [AuthController, 'showLogin'])
router.post('/login', [AuthController, 'login'])
router
  .group(() => {
    router.get('/register', [AuthController, 'showRegister'])
    router.post('/register', [AuthController, 'register'])
  })
  .use([middleware.auth(), middleware.roleCheck()])

router
  .group(() => {
    router.get('/users', [UsersController, 'index'])
    router.get('/users/:id/edit', [UsersController, 'edit'])
    router.post('/users/:id', [UsersController, 'update'])
    router.delete('/users/:id', [UsersController, 'destroy'])
  })
  .use(middleware.auth())

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
