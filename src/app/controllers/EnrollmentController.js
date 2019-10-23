import * as Yup from 'yup';
import { isBefore, parseISO, addMonths, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Enrollment from '../models/Enrollment';
import User from '../models/User';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    // Verifico se os campos estão válidos, se não estiverem, retorno um erro
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExist = await User.findByPk(req.userId);

    // Verifico se existe um administrador para realizar a matrícula
    if (!userExist) {
      return res.status(400).json({ error: 'User not found' });
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
}

export default new EnrollmentController();
