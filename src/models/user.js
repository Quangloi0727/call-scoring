const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        firstName: {
          type: DataTypes.STRING
        },
        lastName: {
          type: DataTypes.STRING
        },
        userName: {
          type: DataTypes.STRING,
        },
        fullName: {
          type: DataTypes.STRING,
        },
        extension: {
          type: DataTypes.INTEGER
        },
        password: {
          type: DataTypes.STRING
        },
        isAvailable: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        isActive: {
          type: DataTypes.INTEGER,
        },
        created: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          }
        }
      },
      {
        sequelize,
        modelName: 'Users'
      }
    );
  }

  static associate(models) {
    models.User.hasMany(models.Team, { foreignKey: 'created' });

    models.User.hasMany(models.UserRole, { foreignKey: 'userId', as: 'roles' });

    models.User.hasMany(models.User, { foreignKey: 'created' });
    models.User.belongsTo(models.User, { as: 'userCreate', foreignKey: 'created' });

    models.User.hasMany(models.AgentTeamMember, { foreignKey: 'userId', as: 'team' });
  }
}

module.exports = User;