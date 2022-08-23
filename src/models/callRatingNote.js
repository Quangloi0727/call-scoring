const { Model, DataTypes } = require("sequelize")

class CallRatingNote extends Model {
  static init(sequelize) {
    return super.init(
      {
        callId: {
          type: 'UNIQUEIDENTIFIER',
          allowNull: false
        },
        idScoreScript: {
          type: DataTypes.INTEGER
        },
        idCriteriaGroup: {
          type: DataTypes.INTEGER
        },
        idCriteria: {
          type: DataTypes.INTEGER
        },
        description: {
          type: DataTypes.STRING
        },
        timeNoteMinutes: {
          type: DataTypes.INTEGER
        },
        timeNoteSecond: {
          type: DataTypes.INTEGER
        },
        created: {
          type: DataTypes.INTEGER,
          allowNull: false,
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
        }
      },
      {
        sequelize,
        modelName: "CallRatingNotes",
      }
    )
  }


  static associate(models) {
    models.CallRatingNote.belongsTo(models.CallDetailRecords, {
      foreignKey: "callId",
      as: "rateNotes",
    })
    models.CallRatingNote.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    })

    models.CallRatingNote.belongsTo(models.User, {
      foreignKey: "updated",
      as: "userUpdate",
    })
  }

}

module.exports = CallRatingNote
