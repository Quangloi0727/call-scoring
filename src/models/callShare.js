const moment = require("moment")
const { Model, DataTypes } = require("sequelize")
class CallShare extends Model {
    static init(sequelize) {
        return super.init(
            {
                callId: {
                    type: 'UNIQUEIDENTIFIER',
                    references: {
                        model: "call_detail_records",
                        key: "id"
                    },
                    allowNull: false // id cuộc gọi
                },
                assignFor: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: "Users",
                        key: "id"
                    }
                },
                scoreTargetId: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: "ScoreTargets",
                        key: "id"
                    }
                },
                teamIdOfCall: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: "Teams",
                        key: "id",
                    }
                },
                agentIdOfCall: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: "Users",
                        key: "id",
                    }
                },
                pointResultCallRating: {
                    type: DataTypes.INTEGER,
                },
                typeResultCallRating: {
                    type: DataTypes.STRING,
                },
                idScoreScript: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: "ScoreScripts",
                        key: "id"
                    }
                },
                idUserReview: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: "Users",
                        key: "id"
                    }
                },
                reviewedAt: {
                    type: DataTypes.DATE
                },
                updateReviewedAt: {
                    type: DataTypes.DATE
                },
                isMark: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false
                },
                createdAt: {
                    type: DataTypes.DATE,
                    get() {
                        return moment(this.getDataValue("createdAt")).format("HH:mm:ss DD/MM/YYYY")
                    }
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    get() {
                        return moment(this.getDataValue("updatedAt")).format("HH:mm:ss DD/MM/YYYY")
                    }
                }
            },
            {
                sequelize,
                modelName: "callShares",
                indexes: [
                    {
                        unique: true,
                        fields: ['callId']
                    },
                    {
                        unique: false,
                        fields: ['assignFor']
                    },
                    {
                        unique: false,
                        fields: ['scoreTargetId']
                    },
                    {
                        unique: false,
                        fields: ['isMark']
                    }
                ]
            }
        )
    }

    static associate(models) {

        models.CallShare.belongsTo(models.User, {
            foreignKey: "assignFor",
            as: "assignForInfo",
        })

        models.CallShare.belongsTo(models.CallDetailRecords, {
            foreignKey: "callId",
            as: "callInfo",
        })

        models.CallShare.belongsTo(models.ScoreTarget, {
            foreignKey: "scoreTargetId",
            as: "scoreTargetInfo",
        })

        models.CallShare.belongsTo(models.ScoreScript, {
            foreignKey: "idScoreScript",
            as: "scoreScriptInfo",
        })

        models.CallShare.belongsTo(models.User, {
            foreignKey: "idUserReview",
            as: "userReview",
        })

        models.CallShare.hasMany(models.CallRating, {
            sourceKey: 'callId',
            foreignKey: "callId",
            as: "callRatingInfo",
        })

    }
}

module.exports = CallShare