import { Router } from 'express';
// Importação dos controllers a serem utilizadas
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import authMidleware from './app/midlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Midleware de autenticação via JWT
routes.use(authMidleware);

// Todas as rotas abaixo precisam de autenticação
routes.put('/users', UserController.update);
routes.post('/users/:user_id/students', StudentController.store);
routes.put('/users/:user_id/:student_id/students', StudentController.update);

export default routes;
