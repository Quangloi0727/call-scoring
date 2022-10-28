const { Model, DataTypes, Op } = require("sequelize")

class DataRetentionPolicyTeam extends Model {
  static init(sequelize) {
    return super.init(
      {
        teamId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Teams",
            key: "id",
          },
        },
        dataRetentionPolicyId: {
          type: DataTypes.INTEGER,
          references: {
            model: "DataRetentionPolicies",
            key: "id",
          }
        }
      },
      {
        sequelize,
        modelName: "DataRetentionPolicyTeams",
      }
    )
  }

  static associate(models) {
    models.DataRetentionPolicyTeam.belongsTo(models.Team, {
      foreignKey: "teamId",
      as: "TeamInfo",
    })

    models.DataRetentionPolicyTeam.belongsTo(models.DataRetentionPolicy, {
      foreignKey: "dataRetentionPolicyId",
      as: "DataRetentionPolicy",
    })
  }
}

module.exports = DataRetentionPolicyTeam
