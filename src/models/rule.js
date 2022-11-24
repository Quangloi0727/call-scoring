const { Model, DataTypes, Op } = require("sequelize")

const { MESSAGE_ERROR, USER_ROLE } = require("../helpers/constants")
class Rule extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(100),
        },
        code: {
          type: DataTypes.STRING(100),
        },
        ruleTypeId: {
          type: DataTypes.INTEGER,
          references: {
            model: "RuleTypes",
            key: "id",
          },
        },
        created: {
          type: DataTypes.INTEGER,
          references: {
            model: "Users",
            key: "id",
          },
        }
      },
      {
        sequelize,
        modelName: "Rules",
        hooks: {
          beforeCreate: handleBeforeCreate,
        },
        indexes: [
          {
            unique: true,
            fields: ["name", "ruleTypeId"],
          },
        ],
      }
    )
  }

  static associate(models) {
    models.Rule.hasMany(models.RuleDetail, {
      foreignKey: "ruleId",
      as: "RuleDetail",
    })

    models.Rule.belongsTo(models.RuleType, {
      foreignKey: "ruleTypeId",
      as: "RuleType",
    })
  }
}

async function handleBeforeCreate(data, option) {
  const result = await Rule.findOne({
    where: { name: { [Op.eq]: data.name.toString() } },
  })

  if (result) {
    throw new Error(MESSAGE_ERROR["QA-002"])
  }
}

module.exports = Rule
