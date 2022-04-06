const { Model, DataTypes, Op } = require('sequelize');

class Group extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
        },
        description: {
          type: DataTypes.STRING
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
        modelName: 'Groups',
        hooks: {
          beforeCreate: handleBeforeCreate
        }
      },
    );
  }

  static associate(models) {
    models.Group.belongsTo(models.User, { foreignKey: 'created', as: 'userCreate' });

    models.Group.hasMany(models.UserGroupMember, { foreignKey: 'groupId', as: 'UserGroupMember' });
    models.Group.hasMany(models.TeamGroup, { foreignKey: 'groupId', as: 'TeamGroup' });
  }
}

async function handleBeforeCreate(team, option) {
  const teamResult = await Group.findOne({
    where: { name: { [Op.eq]: team.name.toString() } }
  });

  if (teamResult) {
    throw new Error('Tên nhóm đã được sử dụng!');
  }
}

module.exports = Group;