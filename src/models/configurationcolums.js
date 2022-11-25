'use strict'
const {
  Model, DataTypes
} = require('sequelize')
class configurationColums extends Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        configurationColums: {
          type: DataTypes.TEXT
        },
        nameTable: {
          type: DataTypes.STRING   // trường này để phân biệt giữa config của các table
        },
        generalSetting: {
          type: DataTypes.INTEGER   // dùng cho màn thiết lập chung nhiệm vụ chấm điểm
        }
      },
      {
        sequelize,
        modelName: 'configurationColums'
      },
    )
  }

  static associate(models) {
    models.ConfigurationColums.belongsTo(models.User, { foreignKey: 'userId', as: 'user' })

  }
}

module.exports = configurationColums;

