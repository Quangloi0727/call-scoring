const { Model, DataTypes } = require("sequelize")
const { CreatedByForm } = require("../helpers/constants/fieldScoreMission")

class CallRatingHistory extends Model {
    static init(sequelize) {
        return super.init(
            {
                callId: {
                    type: 'UNIQUEIDENTIFIER',
                    allowNull: false
                },
                type: {
                    type: DataTypes.ENUM(CreatedByForm.ADD, CreatedByForm.EDIT),
                    defaultValue: CreatedByForm.EDIT
                },
                idScoreScript: {
                    type: DataTypes.INTEGER
                },
                idCriteria: {
                    type: DataTypes.INTEGER,
                },
                idSelectionCriteriaOld: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: "SelectionCriterias",
                        key: "id",
                    },
                },
                idSelectionCriteriaNew: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: "SelectionCriterias",
                        key: "id",
                    },
                },
                created: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Users",
                        key: "id",
                    },
                }
            },
            {
                sequelize,
                modelName: "CallRatingHistorys"
            }
        )
    }

    static associate(models) {
        models.CallRatingHistory.belongsTo(models.User, {
            foreignKey: "created",
            as: "userCreate",
        })

        models.CallRatingHistory.belongsTo(models.CallDetailRecords, {
            foreignKey: "callId",
            as: "rateNotes",
        })

        models.CallRatingHistory.belongsTo(models.Criteria, {
            foreignKey: "idCriteria",
            as: "criteria",
        })

        models.CallRatingHistory.belongsTo(models.SelectionCriteria, {
            foreignKey: "idSelectionCriteriaOld",
            as: "selectionCriteriaOld",
        })

        models.CallRatingHistory.belongsTo(models.SelectionCriteria, {
            foreignKey: "idSelectionCriteriaNew",
            as: "selectionCriteriaNew",
        })
    }
}

module.exports = CallRatingHistory
