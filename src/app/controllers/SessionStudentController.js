import Student from '../models/Student';
import Enrollment from '../models/Enrollment';

class SessionStudentController {
  async store(req, res) {
    const student_id = req.body.id;

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

    return res.json({ id: student_id });
  }
}

export default new SessionStudentController();
