import * as Yup from 'yup';

import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';
import User from '../models/User';

import Mail from '../../lib/Mail';

class HelpOrderAdmController {
  async index(req, res) {
    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para dar a resposta
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
    }

    const { id } = req.params;

    const studentExist = await Student.findByPk(id);

    if (!studentExist) {
      return res.status(400).json({ error: 'User not found' });
    }

    const questions = await HelpOrder.findAll({ where: { student_id: id } });

    return res.json(questions);
  }

  async show(req, res) {
    const { page } = req.query;
    const helps = await HelpOrder.findAll({
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(helps);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para dar a resposta
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
    }
    const { id } = req.params;
    const { answer } = req.body;

    const question = await HelpOrder.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!question) {
      return res.status(400).json({ error: 'Question not found' });
    }

    if (question.answer != null) {
      return res.status(400).json({ error: 'Question already answered' });
    }

    const answers = await HelpOrder.update(
      {
        answer,
        answer_at: new Date(),
      },
      { where: { id } }
    );

    await Mail.sendMail({
      to: `${question.student.name} <${question.student.email}>`,
      subject: 'Pergunta respondida',
      template: 'answer',
      context: {
        student: question.student.name,
        question: question.question,
        answer,
      },
    });

    return res.json(answers);
  }
}

export default new HelpOrderAdmController();
