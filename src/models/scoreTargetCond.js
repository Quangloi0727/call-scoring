const { Model, DataTypes } = require("sequelize")
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
        modelName: "ScoreTargetCond"
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
