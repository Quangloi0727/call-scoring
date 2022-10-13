const { Model, DataTypes, Op } = require("sequelize")

class ScoreTargets_ScoreScripts extends Model {
  static init(sequelize) {
    return super.init(
      {
        scoreScriptId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ScoreScripts",
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
        modelName: "ScoreTargets_ScoreScripts",
      }
    )
  }

  static associate(models) {
    models.ScoreTarget_ScoreScript.belongsTo(models.ScoreScript, {
      foreignKey: "scoreScriptId",
      as: "scoreScriptInfo",
    })

    models.ScoreTarget_ScoreScript.belongsTo(models.ScoreTarget, {
      foreignKey: "scoreTargetId",
      as: "ScoreTargets",
    })
  }
}

module.exports = ScoreTargets_ScoreScripts
