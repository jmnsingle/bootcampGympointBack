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
  }

  // Médoto para fazer um relacionamento de 1-N com a tabela Users, pegando as tabelas por parâmetro
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default Student;
