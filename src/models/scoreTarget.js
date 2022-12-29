const moment = require("moment")
const { Model, DataTypes, Op } = require("sequelize")

const { MESSAGE_ERROR } = require("../helpers/constants")
class ScoreTarget extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(),
        },
        ratingBy: {
          type: DataTypes.INTEGER,   // đối tượng được đánh giá  0:Điện thoại viên 1:Đội ngũ       5:Toàn hệ thống
        },
        callType: {
          type: DataTypes.INTEGER,   //Loại cuộc gọi 1:cuộc gọi bất thường     2:cuộc gọi bình thường
        },
        numberOfCall: {
          type: DataTypes.INTEGER,  // số lượng cuộc gọi mỗi đối tượng obj
        },
        callStartTime: {
          type: DataTypes.DATE,     //Áp dụng cho cuộc gọi trong
        },
        callEndTime: {
          type: DataTypes.DATE,     //Áp dụng cho cuộc gọi trong
        },
        effectiveTimeType: {
          type: DataTypes.INTEGER     // thời gian hiệu lực theo tháng tuần , ngày, 
        },
        effectiveTimeStart: {
          type: DataTypes.DATE // thời gian hiệu lực theo tháng tuần , ngày, 
        },
        effectiveTimeEnd: {
          type: DataTypes.DATE // thời gian hiệu lực theo tháng tuần , ngày, 
        },
        assignStart: {
          type: DataTypes.STRING
        },
        assignEnd: {
          type: DataTypes.STRING
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        description: {
          type: DataTypes.STRING
        },
        created: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
            key: "id",
          },
        },
        updated: {
          type: DataTypes.INTEGER,
          references: {
            model: "Users",
            key: "id",
          },
        }
      },
      {
        sequelize,
        modelName: "ScoreTarget",
        hooks: {
          beforeCreate: handleBeforeCreate,
        },
        // If don't want updatedAt
        // updatedAt: false,
      }
    )
  }

  static associate(models) {
    models.ScoreTarget.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    })

    models.ScoreTarget.belongsTo(models.User, {
      foreignKey: "updated",
      as: "userUpdate",
    })

    models.ScoreTarget.hasMany(models.ScoreTargetAuto, {
      foreignKey: "scoreTargetId",
      as: 'ScoreTargetAuto'
    })

    models.ScoreTarget.hasMany(models.ScoreTargetCond, {
      foreignKey: "scoreTargetId",
      as: 'ScoreTargetCond'
    })

    models.ScoreTarget.hasMany(models.ScoreTarget_ScoreScript, {
      foreignKey: "scoreTargetId",
      as: 'ScoreTarget_ScoreScript'
    })

    models.ScoreTarget.hasMany(models.ScoreTargetAssignment, {
      foreignKey: "scoreTargetId",
      as: 'ScoreTargetAssignmentInfo'
    })

  }
}

async function handleBeforeCreate(data) {
  const foundScoreTarget = await ScoreTarget.findOne({
    where: { name: { [Op.eq]: data.name.toString() } },
  })

  if (foundScoreTarget) {
    throw new Error(MESSAGE_ERROR["QA-002"])
  }
}

module.exports = ScoreTarget
