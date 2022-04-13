const moment = require("moment");
const { Model, DataTypes, Op } = require("sequelize");

const { MESSAGE_ERROR, USER_ROLE } = require("../helpers/constants");
class RuleDetail extends Model {
  static init(sequelize) {
    return super.init(
      {
        ruleId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Rules",
            key: "id",
          },
        },      
        role: {
          type: DataTypes.INTEGER,
          allowNull: false
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
        modelName: "RuleDetails",
        hooks: {
          beforeCreate: handleBeforeCreate,
        },
        indexes:[
          {
            unique: true,
            fields:['ruleId', 'role']
          }
         ]
      }
    );
  }

  static associate(models) {
    models.RuleDetail.belongsTo(models.Rule, {
      foreignKey: "ruleId",
      as: "Rule",
    });

  }
}

async function handleBeforeCreate(data, option) {
  const result = await RuleDetail.findOne({
    where: { name: { [Op.eq]: data.name.toString() } },
  });

  if (result) {
    throw new Error(MESSAGE_ERROR["QA-002"]);
  }
}

module.exports = RuleDetail;
