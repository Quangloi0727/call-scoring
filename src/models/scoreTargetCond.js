
const { Model, DataTypes, Op } = require("sequelize")
const { MESSAGE_ERROR } = require("../helpers/constants")

class ScoreTargetCond extends Model {
  static init(sequelize) {
    return super.init(
      {
        scoreTargetId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ScoreTargets",
            key: "id",
          },
          allowNull: false
        },
        data: {
          type: DataTypes.INTEGER,   // đối tượng được đánh giá  0:Điện thoại viên 1:Đội ngũ       5:Toàn hệ thống
        },
        cond: {
          type: DataTypes.INTEGER,   //Điểm liệt của chấm điểm tự động
        },
        value: {
          type: DataTypes.INTEGER,  // số lượng cuộc gọi mỗi đối tượng obj
        }
      },
      {
        sequelize,
        modelName: "ScoreTargetCond",
        // hooks: {
        //   beforeCreate: handleBeforeCreate,
        // },
        // If don't want updatedAt
      }
    )
  }

  static associate(models) {
    models.ScoreTargetCond.belongsTo(models.ScoreTarget, {
      foreignKey: "scoreTargetId",
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

module.exports = ScoreTargetCond
