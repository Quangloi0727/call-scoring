const { Model, DataTypes } = require('sequelize');

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
        modelName: 'Teams'
      },
    );
  }

  static associate(models) {
    models.Team.belongsTo(models.User, { foreignKey: 'created', as: 'userCreate' });
    
    models.Team.hasMany(models.AgentTeamMember, { foreignKey: 'teamId' });
  }
}

module.exports = Team;