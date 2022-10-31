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

        models.CallShare.hasMany(models.CallRating, {
            sourceKey: 'callId',
            foreignKey: "callId",
            as: "callRatingInfo",
        })

    }
}

module.exports = CallShare