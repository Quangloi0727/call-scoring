const { Model, DataTypes } = require("sequelize")

class CallRatingHistory extends Model {
  static init(sequelize) {
    return super.init(
      {
        callId: {
          type: 'UNIQUEIDENTIFIER',
          allowNull: false
        },
        idSelectionCriteria: {
          type: DataTypes.INTEGER,
          references: {
            model: "SelectionCriterias",
            key: "id",
          },
        },
        idCriteria: {
          type: DataTypes.INTEGER,
        },
        idScoreScript: {
          type: DataTypes.INTEGER
        },
      },
      {
        sequelize,
        modelName: "CallRatingHistorys"
      }
    )
  }

//   static associate(models) {
//     models.CallRating.belongsTo(models.CallDetailRecords, {
//       foreignKey: "callId",
//       as: "rates",
//     })

//     models.CallRating.belongsTo(models.SelectionCriteria, {
//       foreignKey: "idSelectionCriteria",
//       as: "SelectionCriteria",
//     })
//   }


}

module.exports = CallRatingHistory
