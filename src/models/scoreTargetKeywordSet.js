
const { Model, DataTypes, Op } = require("sequelize")
const { MESSAGE_ERROR } = require("../helpers/constants")

class ScoreTargetKeywordSet extends Model {
  static init(sequelize) {
    return super.init(
      {
        targetAutoId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ScoreTargetAutos",
            key: "id",
          },
          allowNull: false
        },
        keyword: {
          type: DataTypes.STRING,
        }
      },
      {
        sequelize,
        modelName: "ScoreTargetKeywordSet",
        // hooks: {
        //   beforeCreate: handleBeforeCreate,
        // },
        // If don't want updatedAt
        updatedAt: false,
      }
    )
  }

  static associate(models) {
    models.ScoreTargetKeywordSet.belongsTo(models.ScoreTargetAuto, {
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

module.exports = ScoreTargetKeywordSet
