const moment = require("moment")
const { Model, DataTypes } = require("sequelize")
class DataRetentionPolicy extends Model {
  static init(sequelize) {
    return super.init(
      {
        nameDataRetentionPolicy: {
          type: DataTypes.STRING(250),
          allowNull: false
        },
        valueSaveForCallGotPoint: {
          type: DataTypes.INTEGER
          // giá trị được lưu lại trong với cuộc gọi đã chấm điểm
        },
        typeDateSaveForCallGotPoint: {
          type: DataTypes.STRING
          // lưu lại trong xxx ngày / tháng / năm
        },
        unlimitedSaveForCallGotPoint: {
          type: DataTypes.INTEGER,
          allowNull: false
          // lưu không giới hạn với cuộc gọi đã chấm điểm
        },
        valueSaveForCallNoPoint: {
          type: DataTypes.INTEGER
          // giá trị được lưu lại trong với cuộc gọi CHƯA chấm điểm
        },
        typeDateSaveForCallNoPoint: {
          type: DataTypes.STRING
          // lưu lại trong xxx ngày / tháng / năm với cuộc gọi CHƯA chấm điểm
        },
        unlimitedSaveForCallNoPoint: {
          type: DataTypes.INTEGER,
          allowNull: false
          // lưu không giới hạn với cuộc gọi CHƯA chấm điểm
        },
        status: {
          type: DataTypes.INTEGER
        },
        created: {
          type: DataTypes.INTEGER,
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
        modelName: "DataRetentionPolicy",
        hooks: {
        },
      }
    )
  }

  static associate(models) {
    models.DataRetentionPolicy.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    })

    models.DataRetentionPolicy.belongsTo(models.User, {
      foreignKey: "updated",
      as: "userUpdate",
    })

    models.DataRetentionPolicy.hasMany(models.DataRetentionPolicyTeam, {
      foreignKey: "dataRetentionPolicyId",
      as: 'DataRetentionPolicyTeam'
    })
  }
}

module.exports = DataRetentionPolicy
