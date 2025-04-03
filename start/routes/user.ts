import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UsersController = () => import('#controllers/users_controller')

router
  .group(() => {
    router.get('/users', [UsersController, 'index'])
    router.get('/users/:id/edit', [UsersController, 'edit'])
    router.post('/users/:id', [UsersController, 'update'])
    router.delete('/users/:id', [UsersController, 'destroy'])
  })
  .use(middleware.auth())
