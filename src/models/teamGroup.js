const { Model, DataTypes } = require('sequelize');

class TeamGroup extends Model {
  static init(sequelize) {
    return super.init(
      {
        groupId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Groups',
            key: 'id'
          }
        },
        teamId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Teams',
            key: 'id'
          }
        }
      },
      {
        sequelize,
        modelName: 'TeamGroups'
      },
    );
  }

  static associate(models) {
    // models.TeamGroup.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    
    models.TeamGroup.belongsTo(models.Team, { foreignKey: 'teamId', as: 'Team' });
    models.TeamGroup.belongsTo(models.Group, { foreignKey: 'groupId', as: 'Group'  });
  }
}

module.exports = TeamGroup;