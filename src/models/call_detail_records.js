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
          type: DataTypes.BIGINT
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
          }
        },
        agentId: {
          type: DataTypes.INTEGER,
          references: {
            model: "Users",
            key: "id",
          }
        },
        recordingFileName: DataTypes.STRING(100),
        var1: DataTypes.STRING(30),
        var2: DataTypes.STRING(30),
        var3: DataTypes.STRING(30),
        var4: DataTypes.STRING(30),
        var5: DataTypes.STRING(30),
        var6: DataTypes.STRING(30),
        var7: DataTypes.STRING(30),
        var8: DataTypes.STRING(30),
        var9: DataTypes.STRING(30),
        var10: DataTypes.STRING(30)
      },
      {
        sequelize,
        timestamps: false,
        modelName: "call_detail_records",
        indexes: [
          {
            unique: false,
            fields: ['callId']
          },
          {
            unique: false,
            fields: ['called']
          },
          {
            unique: false,
            fields: ['caller']
          },
          {
            unique: false,
            fields: ['share']
          },
          {
            unique: false,
            fields: ['agentId']
          }
        ]
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

    models.CallDetailRecords.hasOne(models.CallShare, {
      foreignKey: 'callId',
      as: "CallShare",
    })
  }
}

module.exports = CallDetailRecords