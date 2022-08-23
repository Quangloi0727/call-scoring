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
  }

}

module.exports = CallRatingNote
