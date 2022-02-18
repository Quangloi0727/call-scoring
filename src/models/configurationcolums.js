'use strict';
const {
  Model, DataTypes
} = require('sequelize');
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
          type: DataTypes.STRING
        },
      },
      {
        sequelize,
        modelName: 'configurationColums'
      },
    );
  }

  static associate(models) {
    models.ConfigurationColums.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

  }
}

module.exports = configurationColums;

