"use strict";
const { Model, DataTypes } = require("sequelize");

class call_detail_records extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize) {
    return super.init(
      {
        id:  {
          allowNull: false,
          autoIncrement: false,
          primaryKey: true,
          type: 'UNIQUEIDENTIFIER'
        },
        callId: DataTypes.BIGINT,
        called: DataTypes.STRING(25, true),
        caller: DataTypes.STRING(25),
        connectTime: DataTypes.BIGINT,
        destLegId: DataTypes.BIGINT,
        direction: DataTypes.STRING(50),
        disconnectTime: DataTypes.BIGINT,
        duration: DataTypes.INTEGER,
        fileStatus: DataTypes.STRING(50),
        origCalledLoginUserId: DataTypes.STRING(50),
        origCallingLoginUserId: DataTypes.STRING(50),
        origLegId: DataTypes.BIGINT,
        origTime: DataTypes.BIGINT,
        teamId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Teams",
            key: "id",
          },
        },
        agentId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Users",
            key: "id",
          },
        },
        recordingFileName: DataTypes.STRING(100),
      },
      {
        sequelize,
        modelName: "call_detail_records",
      }
    );
  }

  static associate(models) {
    // define association here
    models.call_detail_records.belongsTo(models.User, {
      foreignKey: "agentId",
    });
    models.call_detail_records.belongsTo(models.Team, {
      foreignKey: "teamId",
    });
  }
}

module.exports = call_detail_records