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
        numberOfCall: {
          type: DataTypes.INTEGER,  // số lượng cuộc gọi mỗi đối tượng obj
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
    })

  }
}

async function handleBeforeCreate(team, option) {
  const teamResult = await ScoreScript.findOne({
    where: { name: { [Op.eq]: team.name.toString() } },
  })

  if (teamResult) {
    throw new Error(MESSAGE_ERROR["QA-002"])
  }
}

module.exports = ScoreTargetAuto
