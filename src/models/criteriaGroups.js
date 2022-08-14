const moment = require("moment");
const { Model, DataTypes } = require("sequelize");
const { getLengthField } = require("../helpers/functions");
class CriteriaGroup extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(getLengthField('name')),
          allowNull: false
        },
        scoreScriptId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ScoreScripts",
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
            );
          },
        },
        updatedAt: {
          type: DataTypes.DATE,
          get() {
            return moment(this.getDataValue("updatedAt")).format(
              "HH:mm:ss DD/MM/YYYY"
            );
          },
        },
      },
      {
        sequelize,
        modelName: "CriteriaGroups",
        hooks: {
        },
      }
    );
  }

  static associate(models) {
    models.CriteriaGroup.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    });

    models.CriteriaGroup.belongsTo(models.ScoreScript, {
      foreignKey: "scoreScriptId",
      as: "ScoreScript",
    });

    models.CriteriaGroup.hasMany(models.Criteria, {
      foreignKey: "criteriaGroupId",
      as: "Criteria",
    });

  }
}

module.exports = CriteriaGroup;
