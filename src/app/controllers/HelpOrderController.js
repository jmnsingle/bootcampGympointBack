import * as Yup from 'yup';

import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { question } = req.body;

    const { student_id } = req.params;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Studend not found' });
    }

    const questions = await HelpOrder.create({
      student_id,
      question,
    });

    return res.json(questions);
  }

  async index(req, res) {
    const { student_id } = req.params;

    const studentExist = await Student.findByPk(student_id);

    if (!studentExist) {
      return res.status(400).json({ error: 'Student nt found' });
    }

    const helps = await HelpOrder.findAll({ where: { student_id } });

    return res.json(helps);
  }
}

export default new HelpOrderController();
