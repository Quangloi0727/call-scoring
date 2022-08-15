
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
        conditionSearch: {
          type: DataTypes.STRING,   //
        },
        data: {
          type: DataTypes.STRING,   //
        },
        cond: {
          type: DataTypes.STRING,   //
        },
        value: {
          type: DataTypes.STRING,  // 
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

module.exports = ScoreTargetCond
