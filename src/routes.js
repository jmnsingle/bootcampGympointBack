import { Router } from 'express';
// Importação dos controllers a serem utilizadas
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import SessionStudentController from './app/controllers/SessionStudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import HelpOrderAdmController from './app/controllers/HelpOrderAdmController';
import authMidleware from './app/midlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/sessionStudents', SessionStudentController.store);

routes.post('/checkins/:id', CheckinController.store);
routes.get('/checkins/:id', CheckinController.show);
routes.get('/checkins/:id/profile', CheckinController.index);
// routes.get('/checkins/:id', CheckinController.index);

routes.post('/help_orders/:id/question', HelpOrderController.store);
routes.get('/help_orders/:id/answer', HelpOrderController.index);

// Midleware de autenticação via JWT
routes.use(authMidleware);

// Todas as rotas abaixo precisam de autenticação
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.post('/students', StudentController.store);
routes.get('/students', StudentController.show);
routes.get('/students/:id', StudentController.index);
routes.put('/students/:id', StudentController.update);
routes.delete('/students/:id', StudentController.delete);

routes.post('/plans', PlanController.store);
routes.get('/plans', PlanController.show);
routes.get('/plans/:id', PlanController.index);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.post('/enrollments/:plan_id/:student_id', EnrollmentController.store);
routes.get('/enrollments', EnrollmentController.show);
routes.get('/enrollments/:id', EnrollmentController.index);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.delete('/enrollments/:id', EnrollmentController.delete);

routes.get('/admin/:id/help_orders', HelpOrderAdmController.index);
routes.get('/admin/help_orders', HelpOrderAdmController.show);
routes.put('/help-orders/:id/answer', HelpOrderAdmController.update);

export default routes;
