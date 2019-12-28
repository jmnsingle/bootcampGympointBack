import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      birth_date: Yup.date().required(),
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

    const { name, email, birth_date, weight, height } = req.body;

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
    });

    return res.json(student);
  }

  async show(req, res) {
    const { page } = req.query;
    let students;
    if (page) {
      students = await Student.findAll({
        limit: 10,
        offset: (page - 1) * 10,
      });
    } else {
      students = await Student.findAll();
    }

    return res.json(students);
  }

  async index(req, res) {
    const students = await Student.findByPk(req.params.id);

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

    const { id } = req.params;

    const { name, email, birth_date, weight, height } = req.body;

    const studentExist = await Student.findByPk(id);

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
      where: { id },
    });

    return res.json({
      student,
      name,
      email,
      birth_date,
      weight,
      height,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const studentExist = await Student.findByPk(id);

    // Verifico se existe um studante para atualizar
    if (!studentExist) {
      return res.status(400).json({ error: 'Student not found' });
    }

    Student.destroy({ where: { id } });

    return res.json();
  }
}

export default new StudentController();
