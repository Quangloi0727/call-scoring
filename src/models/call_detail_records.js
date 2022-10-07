"use strict"
const { Model, DataTypes } = require("sequelize")

class CallDetailRecords extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize) {
    return super.init(
      {
        id: {
          allowNull: false,
          autoIncrement: false,
          primaryKey: true,
          type: 'UNIQUEIDENTIFIER'
        },
        callId: {
          type: DataTypes.BIGINT,
          references: {
            model: "Users",
            key: "id",
          },
        },
        called: DataTypes.STRING(25),
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
        sourceName: DataTypes.STRING(50),
        xmlCdrId: DataTypes.STRING(36),
        node: DataTypes.STRING(20),
        lastUpdateTime: DataTypes.BIGINT,
        share: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
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
        timestamps: false,
        modelName: "call_detail_records",
      }
    )
  }

  static associate(models) {
    // define association here
    models.CallDetailRecords.belongsTo(models.User, {
      foreignKey: "agentId",
      as: "agent",
    })
    models.CallDetailRecords.belongsTo(models.Team, {
      foreignKey: "teamId",
      as: "team"
    })

    models.CallDetailRecords.hasMany(models.CallRating, {
      foreignKey: "callId",
      as: "callRating",
    })

    models.CallDetailRecords.hasMany(models.CallRatingNote, {
      foreignKey: "callId",
      as: "callRatingNote",
    })
  }
}

module.exports = CallDetailRecords