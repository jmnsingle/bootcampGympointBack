import * as Yup from 'yup';
import { isBefore, parseISO, addMonths, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Sequelize from 'sequelize';
import configDataBase from '../../config/database';

import Enrollment from '../models/Enrollment';
import User from '../models/User';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

const sequelize = new Sequelize(configDataBase);
class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    // Verifico se os campos estão válidos, se não estiverem, retorno um erro
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id } = req.params;

    const estudentExist = await Student.findByPk(student_id);

    // Verifico se existe um estudante para realizar a matrícula
    if (!estudentExist) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const planExist = await Plan.findByPk(plan_id);

    // Verifico se existe um plano para realizar a matrícula
    if (!planExist) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const enrollmentExist = await Enrollment.findOne({ where: { student_id } });

    // Verifico se o estudante já está matriculado
    if (enrollmentExist) {
      return res.status(400).json({ error: 'Student already is registered' });
    }

    const { start_date } = req.body;

    const dateStart = parseISO(start_date);

    const dateEnd = addMonths(dateStart, planExist.duration);
    // Verifico se a data inicial é menor que a data atual
    if (isBefore(dateStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // Cálculo do preço da matrícula
    const price = planExist.duration * parseFloat(planExist.price);

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: dateStart,
      end_date: dateEnd,
      price,
    });

    await Mail.sendMail({
      to: `${estudentExist.name} <${estudentExist.email}>`,
      sucject: 'Matrícula feita com sucesso',
      // text: 'Você acaba de realizar sua matrícula na Gympoint',
      template: 'welcome',
      context: {
        id: estudentExist.id,
        student: estudentExist.name,
        plan: planExist.title,
        mensal: planExist.price,
        start_date: format(dateStart, "dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
        end_date: format(dateEnd, "dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
      },
    });

    return res.json(enrollment);
  }

  async show(req, res) {
    const { page } = req.query;
    const enrollments = await Enrollment.findAll({
      limit: 10,
      offset: (page - 1) * 10,
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async index(req, res) {
    /* const enrollments = await Enrollment.findByPk(req.params.id, {
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    }); */

    const enrollment = await sequelize.query(
      `select a.id, a.start_date, a.end_date, a.price, b.id as student_id,
      b.name, c.id as plan_id, c.title, c.duration from enrollments a
      left join students b on a.student_id = b.id
      left join plans c on a.plan_id = c.id where a.id = ${req.params.id}`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    return res.json(enrollment[0]);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      plan_id: Yup.number()
        .integer()
        .required(),
    });

    // Verifico se os campos estão válidos, se não estiverem, retorno um erro
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para atualizar a matrícula
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
    }

    const { id } = req.params;

    const enrollmentExist = await Enrollment.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email', 'id'],
        },
      ],
    });

    // Verifico se o estudante já está matriculado
    if (!enrollmentExist) {
      return res.status(400).json({ error: 'Enrollment does not exists' });
    }

    const { start_date, plan_id } = req.body;

    const plan = await Plan.findOne({ where: { id: plan_id } });
    // Verifico se o plano existe
    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    const dateStart = parseISO(start_date);

    const dateEnd = addMonths(dateStart, plan.duration);

    // Verifico se a data inicial é menor que a data atual
    if (isBefore(dateStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // Cálculo do preço da matrícula
    const price = plan.duration * parseFloat(plan.price);

    const enrollment = await Enrollment.update(
      {
        plan_id,
        start_date: dateStart,
        end_date: dateEnd,
        price,
      },
      { where: { id } }
    );

    await Mail.sendMail({
      to: `${enrollmentExist.student.name} <${enrollmentExist.student.email}>`,
      sucject: 'Matrícula atualizada com sucesso',
      // text: 'Você acaba de realizar sua matrícula na Gympoint',
      template: 'update_enrollment',
      context: {
        id: enrollmentExist.student.id,
        student: enrollmentExist.student.name,
        plan: plan.title,
        mensal: plan.price,
        start_date: format(dateStart, "dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
        end_date: format(dateEnd, "dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
      },
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para realizar a matrícula
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
    }

    const enrollmentExist = await Enrollment.findByPk(req.params.id);

    // Verifico se existe matrícula para ser excluída
    if (!enrollmentExist) {
      return res.status(400).json({ error: 'Enrollment does not exist' });
    }

    await Enrollment.destroy({ where: { id: req.params.id } });

    return res.json();
  }
}

export default new EnrollmentController();
