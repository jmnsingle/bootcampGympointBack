import { subWeeks, subHours } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async store(req, res) {
    const student_id = req.params.id;

    const studentExist = await Student.findByPk(student_id);

    if (!studentExist) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const enrollmentExist = await Enrollment.findOne({
      where: { student_id },
    });

    if (!enrollmentExist) {
      return res.status(400).json({ error: 'Student not registered' });
    }

    const dateValid = subWeeks(new Date(), 1);

    const checkinValid = await Checkin.findAndCountAll({
      where: {
        student_id,
        dt_checkin: {
          [Op.between]: [dateValid, new Date()],
        },
      },
    });

    if (checkinValid.dt_checkin == null) {
      checkinValid.dt_checkin = new Date();
    }

    if (checkinValid.count > 4) {
      return res
        .status(400)
        .json({ error: 'You have reached your weekly check-in limit' });
    }

    const checkin = await Checkin.create({
      student_id,
      dt_checkin: new Date(),
      checkin: true,
    });

    return res.json(checkin);
  }

  async index(req, res) {
    const student_id = req.params.id;

    const studentExist = await Student.findByPk(student_id);

    if (!studentExist) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const fullUser = await Enrollment.findOne({
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email', 'birth_date', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title'],
        },
      ],
    });
    return res.json(fullUser);
  }

  async show(req, res) {
    const student_id = req.params.id;

    const studentExist = await Student.findByPk(student_id);

    if (!studentExist) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const enrollmentExist = await Enrollment.findOne({
      where: { student_id },
    });

    if (!enrollmentExist) {
      return res.status(400).json({ error: 'Student not registered' });
    }

    const checkins = await Checkin.findAll({ where: { student_id } });

    return res.json({ checkins });
  }

  /* async index(req, res) {
    const student_id = req.params.id;

    const studentExist = await Student.findByPk(student_id);

    if (!studentExist) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const enrollmentExist = await Enrollment.findOne({
      where: { student_id },
    });

    if (!enrollmentExist) {
      return res.status(400).json({ error: 'Student not registered' });
    }

    return res.json(enrollmentExist);
  } */
}

export default new CheckinController();
