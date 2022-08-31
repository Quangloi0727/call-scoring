const { Model, DataTypes } = require('sequelize')

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
        role: {
          type: DataTypes.INTEGER,
        }
      },
      {
        sequelize,
        modelName: 'AgentTeamMembers'
      },
    )
  }

  static associate(models) {
    models.AgentTeamMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })
    models.AgentTeamMember.belongsTo(models.Team, { foreignKey: 'teamId', as: 'teams' })
  }
}

module.exports = AgentTeamMember