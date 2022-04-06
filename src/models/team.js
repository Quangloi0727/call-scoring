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
          beforeCreate: handleBeforeCreate
        }
      },
    );
  }

  static associate(models) {
    models.Team.belongsTo(models.User, { foreignKey: 'created', as: 'userCreate' });
    models.Team.hasMany(models.TeamGroup, { foreignKey: 'teamId', as: 'TeamGroup' });

    models.Team.hasMany(models.AgentTeamMember, { foreignKey: 'teamId', as: 'AgentTeamMember'  });
    // models.Team.hasMany(models.TeamGroup, { foreignKey: 'teamId' });
  }
}

async function handleBeforeCreate(team, option) {
  const teamResult = await Team.findOne({
    where: { name: { [Op.eq]: team.name.toString() } }
  });

  if (teamResult) {
    throw new Error('Tên nhóm đã được sử dụng!');
  }
}

module.exports = Team;