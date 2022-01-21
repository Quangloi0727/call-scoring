const { Model, DataTypes } = require('sequelize');

class UserRole extends Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        role: {
          type: DataTypes.INTEGER
        },
      },
      {
        sequelize,
        modelName: 'UserRoles'
      }
    );
  }

  static associate(models) {
    models.UserRole.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

module.exports = UserRole;