const moment = require("moment")
const { Model, DataTypes, Op } = require("sequelize")

const { MESSAGE_ERROR } = require("../helpers/constants")
const { getLengthField } = require("../helpers/functions")

class ScoreTargetAuto extends Model {
  static init(sequelize) {
    return super.init(
      {
        scoreTargetId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ScoreTargets",
            key: "id",
          }
        },
        point: {
          type: DataTypes.INTEGER,
        },
        falsePoint: {
          type: DataTypes.BOOLEAN,
          defaultValue: false  //Điểm liệt của chấm điểm tự động
        },
        nameTargetAuto: {
          type: DataTypes.STRING,  // 
        }
      },
      {
        sequelize,
        modelName: "ScoreTargetAuto",
      }
    )
  }

  static associate(models) {
    models.ScoreTargetAuto.belongsTo(models.ScoreTarget, {
      foreignKey: "scoreTargetId",
    })

    models.ScoreTargetAuto.hasMany(models.ScoreTargetKeywordSet, {
      foreignKey: "targetAutoId",
      as: "KeywordSet",
    })

  }
}

module.exports = ScoreTargetAuto
