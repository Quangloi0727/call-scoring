const { Model, DataTypes } = require("sequelize")

class CallRating extends Model {
  static init(sequelize) {
    return super.init(
      {
        callId: {
          type: 'UNIQUEIDENTIFIER',
          allowNull: false
        },
        idSelectionCriteria: {
          type: DataTypes.INTEGER
        },
        idCriteria: {
          type: DataTypes.INTEGER,
        }
      },
      {
        sequelize,
        modelName: "CallRatings",
        hooks: {
        },
      }
    )
  }

  static associate(models) {
    models.CallRating.belongsTo(models.CallDetailRecords, {
      foreignKey: "callId",
      as: "rates",
    })
  }

}

module.exports = CallRating
