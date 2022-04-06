const { Model, DataTypes, Op } = require('sequelize');

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
          type: DataTypes.STRING,
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
          defaultValue: 1,
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
        modelName: 'Users',
        hooks: {
          beforeCreate: handleBeforeCreate
        }
      }
    );
  }

  static associate(models) {
    models.User.hasMany(models.Team, { foreignKey: 'created' });

    models.User.hasMany(models.UserRole, { foreignKey: 'userId', as: 'roles' });

    models.User.hasMany(models.User, { foreignKey: 'created' });
    models.User.belongsTo(models.User, { as: 'userCreate', foreignKey: 'created' });

    models.User.hasMany(models.AgentTeamMember, { foreignKey: 'userId', as: 'team' });
    // models.User.hasMany(models.UserGroupMember, { foreignKey: 'userId', as: 'UserGroupMember' });
  }
}

async function handleBeforeCreate(user, option) {
  const userNameFound = await User.findOne({
    where: { userName: { [Op.eq]: user.userName.toString() } }
  });

  if (userNameFound) {
    throw new Error('Tên đăng nhập đã được sử dụng!');
  }

  const extensionFound = await User.findOne({
    where: {
      [Op.and]: [
        { extension: { [Op.eq]: Number(user.extension) } },
        { isActive: { [Op.eq]: 1 } }
      ]
    }
  });

  if (extensionFound) {
    throw new Error('Extension đã được sử dụng!')
  }
}

module.exports = User;