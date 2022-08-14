const moment = require("moment")
const { Model, DataTypes } = require("sequelize")
const { getLengthField } = require("../helpers/functions");
class Criteria extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(getLengthField('name')),
          allowNull: false
        },
        scoreMax: {
          type: DataTypes.INTEGER
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        criteriaGroupId: {
          type: DataTypes.INTEGER,
          references: {
            model: "CriteriaGroups",
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
        modelName: "Criterias",
        hooks: {
        },
      }
    )
  }

  static associate(models) {
    models.Criteria.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    })

    models.Criteria.hasMany(models.SelectionCriteria, {
      foreignKey: "criteriaId",
      as: "SelectionCriteria",
    })

    models.Criteria.belongsTo(models.CriteriaGroup, {
      foreignKey: "criteriaGroupId",
      as: "CriteriaGroup",
    })

  }
}

module.exports = Criteria
