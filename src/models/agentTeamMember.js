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
        modelName: 'Teams'
      },
    );
  }

  static associate(models) {

  }
}

(async () => {
  await AgentTeamMember.sync({ force: true })
});

module.exports = AgentTeamMember;