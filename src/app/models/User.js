import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  // sequelize(conexão) é o parâmetro passado pelo método init das configurações da Database
  static init(sequelize) {
    super.init(
      {
        // "Abstração" dos campos da tabela Students
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    // addHook é o método criado para ser executado antes de qualquer tipo de Save
    this.addHook('beforeSave', async user => {
      // Se existir uma senha, gero um hash e gravo no BD
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  // Médoto para verificar se as senhas coincidem
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
