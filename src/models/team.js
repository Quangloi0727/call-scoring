const { Model, DataTypes, Op } = require('sequelize');

class Team extends Model {
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
        modelName: 'Teams',
        hooks: {
          beforeValidate: handleBeforeValidate
        }
      },
    );
  }

  static associate(models) {
    models.Team.belongsTo(models.User, { foreignKey: 'created', as: 'userCreate' });

    models.Team.hasMany(models.AgentTeamMember, { foreignKey: 'teamId' });
  }
}

async function handleBeforeValidate(team, option) {
  const teamResult = await Team.findOne({
    where: { name: { [Op.eq]: team.name.toString() } }
  });

  if (teamResult) {
    throw new Error('Tên nhóm đã được sử dụng!');
  }
}

module.exports = Team;