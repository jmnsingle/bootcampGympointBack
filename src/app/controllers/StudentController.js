import * as Yup from 'yup';

import Student from '../models/Student';
import User from '../models/User';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      birth_date: Yup.string().required(),
      weight: Yup.number()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
    });

    // Verifico se os campos estão válidos, se não estiverem, retorno um erro
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const user_id = req.userId;

    const { name, email, birth_date, weight, height } = req.body;

    const user = await User.findByPk(user_id);

    // Verifico se existe um administrador para cadastrar o estudante
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const studentExist = await Student.findOne({ where: { email } });

    // Verifico se o estudante já não foi cadastrado
    if (studentExist) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const student = await Student.create({
      name,
      email,
      birth_date,
      weight,
      height,
      user_id,
    });

    return res.json(student);
  }

  async index(req, res) {
    const user = await User.findByPk(req.userId);

    // Verifico se existe um administrador para buscar os estudantes
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const students = await Student.findAll();

    return res.json(students);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      birth_date: Yup.string().required(),
      weight: Yup.number()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
    });

    // Verifico se os campos estão válidos, se não estiverem, retorno um erro
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { user_id, student_id } = req.params;

    const { name, email, birth_date, weight, height } = req.body;

    const user = await User.findByPk(user_id);

    // Verifico se existe um administrador para atualizar o estudante
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const studentExist = await Student.findByPk(student_id);

    // Verifico se existe um studante para atualizar
    if (!studentExist) {
      return res.status(400).json({ error: 'Student not found' });
    }

    // Se houver alteração do email, verifico se o mesmo já existe

    if (email !== studentExist.email) {
      const studentExistEmail = await Student.findOne({
        where: { email },
      });

      if (studentExistEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const student = await Student.update(req.body, {
      where: { id: student_id },
    });

    return res.json({
      user_id,
      student,
      name,
      email,
      birth_date,
      weight,
      height,
    });
  }
}

export default new StudentController();
