const { Model, DataTypes } = require("sequelize")
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
        unTick: {
          type: DataTypes.INTEGER,
          defaultValue: 1 // 1 là được phép bỏ chọn , 0 là không được phép bỏ chọn
        },
        isActive: {
          type: DataTypes.INTEGER,
          defaultValue: 1 // 1 true, 0 là false
        }
      },
      {
        sequelize,
        modelName: "RuleDetails",
        indexes: [
          {
            unique: true,
            fields: ['ruleId', 'role']
          }
        ]
      }
    )
  }

  static associate(models) {
    models.RuleDetail.belongsTo(models.Rule, {
      foreignKey: "ruleId",
      as: "Rule",
    })

  }
}

module.exports = RuleDetail
