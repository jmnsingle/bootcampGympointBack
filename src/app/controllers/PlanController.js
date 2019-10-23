import * as Yup from 'yup';

import User from '../models/User';
import Plan from '../models/Plan';

class PlanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para cadastrar o plano
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
    }

    const plan = await Plan.create(req.body);

    return res.json(plan);
  }

  async index(req, res) {
    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para buscar os planos
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
    }

    const plan = await Plan.findAll();

    return res.json(plan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    // Verifico se os campos estão válidos, se não estiverem, retorno um erro
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para atualizar o plano
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
    }

    const { title } = req.body;
    const { plan_id } = req.params;

    const planExist = await Plan.findByPk(plan_id);

    // Verifico se o plano existe
    if (!planExist) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    const titleExist = await Plan.findOne({ where: { title } });

    // Verifico se o título já existe
    if (titleExist) {
      return res.status(400).json({ error: 'Title already exist' });
    }

    const plan = await Plan.update(req.body, { where: { id: plan_id } });

    return res.json(plan);
  }

  async delete(req, res) {
    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para deletar o plano
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
    }

    const { plan_id } = req.params;

    const planExist = await Plan.findByPk(plan_id);

    // Verifico se o plano existe
    if (!planExist) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    const plan = await Plan.destroy({ where: { id: plan_id } });

    return res.json(plan);
  }
}

export default new PlanController();
