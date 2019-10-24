import Sequelize, { Model } from 'sequelize';

class Checkin extends Model {
  static init(sequelize) {
    super.init(
      {
        checkin: Sequelize.BOOLEAN,
        dt_checkin: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student',
    });
  }
}

export default Checkin;
