import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifico se existe um token
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    // Caso exista um token, verifico se o mesmo é válido
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Pego o id do usuário que foi passado no token
    req.userId = decoded.id;

    // Todas as rotas podem ser executadas
    return next();
  } catch (err) {
    // Caso o token não seja válido, retorno erro
    return res.status(401).json({ error: 'Token invalid' });
  }
};
