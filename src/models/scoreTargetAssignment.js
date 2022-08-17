const { Model, DataTypes } = require("sequelize")

class ScoreTargetAssignments extends Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Users",
            key: "id",
          },
        },
        scoreTargetId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ScoreTargets",
            key: "id",
          }
        }
      },
      {
        sequelize,
        modelName: "ScoreTargetAssignments",
      }
    )
  }

  static associate(models) {

    models.ScoreTargetAssignment.belongsTo(models.ScoreTarget, {
      foreignKey: "scoreTargetId",
      as: "ScoreTargets",
    })

    models.ScoreTargetAssignment.belongsTo(models.User, {
      foreignKey: "userId",
      as: "users",
    })
  }
}

module.exports = ScoreTargetAssignments
