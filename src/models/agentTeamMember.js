const { Model, DataTypes } = require('sequelize');

class AgentTeamMember extends Model {
  static init(sequelize) {
    return super.init(
      {
        teamId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Teams',
            key: 'id'
          }
        },
        userId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        leader: {
          type: DataTypes.INTEGER,
        }
      },
      {
        sequelize,
        modelName: 'AgentTeamMembers'
      },
    );
  }

  static associate(models) {

  }
}

module.exports = AgentTeamMember;