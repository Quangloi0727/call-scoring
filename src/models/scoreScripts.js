const moment = require("moment")
const { Model, DataTypes, Op } = require("sequelize")

const { MESSAGE_ERROR } = require("../helpers/constants")
const { getLengthField } = require("../helpers/functions")
class ScoreScript extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(getLengthField('name')),
          allowNull: false
        },
        description: {
          type: DataTypes.STRING(getLengthField('description')),
          allowNull: false
        },
        scoreDisplayType: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        criteriaDisplayType: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        needImproveMin: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        needImproveMax: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        standardMin: {
          type: DataTypes.INTEGER
        },
        standardMax: {
          type: DataTypes.INTEGER,
        },
        passStandardMin: {
          type: DataTypes.INTEGER,
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false
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
        },
        createdAt: {
          type: DataTypes.DATE,
          //note here this is the guy that you are looking for
          get() {
            return moment(this.getDataValue("createdAt")).format(
              "HH:mm:ss DD/MM/YYYY"
            )
          },
        },
        updatedAt: {
          type: DataTypes.DATE,
          get() {
            return moment(this.getDataValue("updatedAt")).format(
              "HH:mm:ss DD/MM/YYYY"
            )
          },
        },
      },
      {
        sequelize,
        modelName: "ScoreScripts",
        hooks: {
          beforeCreate: handleBeforeCreate,
        },
        // If don't want updatedAt
        updatedAt: false,
      }
    )
  }

  static associate(models) {
    models.ScoreScript.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    })

    models.ScoreScript.belongsTo(models.User, {
      foreignKey: "updated",
      as: "userUpdate",
    })

    models.ScoreScript.hasMany(models.CriteriaGroup, {
      foreignKey: "scoreScriptId",
      as: "CriteriaGroup",
    })

    models.ScoreScript.hasMany(models.ScoreTarget, {
      foreignKey: "scoreScriptId",
      as: "scoreScript",
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

module.exports = ScoreScript
