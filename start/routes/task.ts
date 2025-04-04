import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const TasksController = () => import('#controllers/tasks_controller')

router
  .group(() => {
    router.get('/dashboard', [TasksController, 'index'])
    router.get('/tasks/create', [TasksController, 'create'])
    router.post('/tasks', [TasksController, 'store'])
    router.post('/tasks/update-date', [TasksController, 'updateDate'])
    router.get('/tasks/:id/edit', [TasksController, 'edit'])
    router.post('/tasks/:id', [TasksController, 'update'])
    router.post('/tasks/:id/delete', [TasksController, 'destroy'])
    router.get('/tasks/table', [TasksController, 'list'])
  })
  .use(middleware.auth())
