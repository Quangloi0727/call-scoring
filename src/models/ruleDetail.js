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
        expiresType: {
          type: DataTypes.INTEGER, // loại: ngày: 0, tháng: 1, năm: 2
        },
        unLimited: {
          type: DataTypes.INTEGER, // xem giới hạn: 0, xem không giới hạn: 1
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

module.exports = RuleDetail;
