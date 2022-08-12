const moment = require("moment")
const { Model, DataTypes, Op } = require("sequelize")

const { MESSAGE_ERROR } = require("../helpers/constants")
const { getLengthField } = require("../helpers/functions")
class SelectionCriteria extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(65535),
          allowNull: false
        },
        score: {
          type: DataTypes.INTEGER,
        },
        unScoreCriteriaGroup: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        unScoreScript: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        criteriaId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Criterias",
            key: "id",
          },
          allowNull: false
        },
        created: {
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
        modelName: "SelectionCriterias",
        hooks: {
        },
      }
    )
  }

  static associate(models) {
    models.SelectionCriteria.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    })

    models.SelectionCriteria.belongsTo(models.Criteria, {
      foreignKey: "criteriaId",
      as: "Criteria",
    })

  }
}


module.exports = SelectionCriteria
