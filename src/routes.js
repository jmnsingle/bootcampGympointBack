import { Router } from 'express';
// Importação dos controllers a serem utilizadas
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import HelpOrderAdmController from './app/controllers/HelpOrderAdmController';
import authMidleware from './app/midlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.post('/students/:student_id/checkins', CheckinController.store);
routes.get('/students/:student_id/checkins', CheckinController.index);
routes.get('/students/:student_id', CheckinController.show);

routes.post(
  '/students/:student_id/help_orders/question',
  HelpOrderController.store
);
routes.get(
  '/students/:student_id/help_orders/answer',
  HelpOrderController.index
);

// Midleware de autenticação via JWT
routes.use(authMidleware);

// Todas as rotas abaixo precisam de autenticação
routes.put('/users', UserController.update);
routes.post('/users/:user_id/students', StudentController.store);
routes.put('/users/:student_id/students', StudentController.update);
routes.get('/students', StudentController.index);

routes.post('/plans', PlanController.store);
routes.get('/plans', PlanController.index);
routes.put('/plans/:plan_id', PlanController.update);
routes.delete('/plans/:plan_id', PlanController.delete);

routes.post('/enrollments/:plan_id/:student_id', EnrollmentController.store);
routes.get('/enrollments', EnrollmentController.index);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.delete('/enrollments/:id', EnrollmentController.delete);

routes.get('/students/:id/help_orders', HelpOrderAdmController.index);
routes.put('/help-orders/:id/answer', HelpOrderAdmController.update);

export default routes;
