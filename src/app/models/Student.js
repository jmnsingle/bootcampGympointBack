import Sequelize, { Model } from 'sequelize';

class Student extends Model {
  // sequelize(conexão) é o parâmetro passado pelo método init das configurações da Database
  static init(sequelize) {
    super.init(
      {
        // "Abstração" dos campos da tabela Students
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        birth_date: Sequelize.STRING,
        weight: Sequelize.FLOAT,
        height: Sequelize.FLOAT,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Student;
