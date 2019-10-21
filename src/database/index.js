import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import User from '../app/models/User';
import Student from '../app/models/Student';

// Array que recebe todos os meus models
const models = [User, Student];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    // Map para todos os models receberem o método init passando a conexão
    models.map(model => model.init(this.connection));

    // Map para todos os models receberem o método associate passando a conexão
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
