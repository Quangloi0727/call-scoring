const moment = require("moment");
const { Model, DataTypes, Op } = require("sequelize");

const { MESSAGE_ERROR, USER_ROLE } = require("../helpers/constants");
class Rule extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
        },
        ruleTypeId: {
          type: DataTypes.INTEGER,
          references: {
            model: "RuleTypes",
            key: "id",
          },
        },
        role: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        created: {
          type: DataTypes.INTEGER,
          references: {
            model: "Users",
            key: "id",
          },
        },        
        expires: {
          type: DataTypes.INTEGER, // số ngày
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
        modelName: "Rules",
        hooks: {
          beforeCreate: handleBeforeCreate,
        },
      }
    );
  }

  static associate(models) {
    models.Rule.belongsTo(models.RuleType, {
      foreignKey: "ruleTypeId",
      as: "RuleType",
    });

  }
}

async function handleBeforeCreate(data, option) {
  const result = await Rule.findOne({
    where: { name: { [Op.eq]: data.name.toString() } },
  });

  if (result) {
    throw new Error(MESSAGE_ERROR["QA-002"]);
  }
}

module.exports = Rule;
