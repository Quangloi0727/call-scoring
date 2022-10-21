const { Model, DataTypes, Op } = require("sequelize")

class DataRetentionPolicy_Team extends Model {
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
        modelName: "DataRetentionPolicy_Teams",
      }
    )
  }

  static associate(models) {
    models.DataRetentionPolicy_Team.belongsTo(models.Team, {
      foreignKey: "teamId",
      as: "TeamInfo",
    })

    models.DataRetentionPolicy_Team.belongsTo(models.DataRetentionPolicy, {
      foreignKey: "dataRetentionPolicyId",
      as: "DataRetentionPolicy",
    })
  }
}

module.exports = DataRetentionPolicy_Team
