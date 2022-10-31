const moment = require("moment")
const { Model, DataTypes } = require("sequelize")
const { ENABLED } = require("../helpers/constants/manageSourceRecord")
class ManageSource extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: DataTypes.STRING(36),
                    allowNull: false,
                    primaryKey: true
                },
                sourceId: {
                    type: DataTypes.STRING(36)
                },
                dbHost: {
                    type: DataTypes.STRING(100)
                },
                dbPassword: {
                    type: DataTypes.STRING(100)
                },
                dbPort: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                dbServerName: {
                    type: DataTypes.STRING(100)
                },
                dbUser: {
                    type: DataTypes.STRING(100)
                },
                enabled: {
                    type: DataTypes.ENUM(ENABLED.ON, ENABLED.OFF),
                    defaultValue: ENABLED.ON
                },
                lastUpdateTime: {
                    type: DataTypes.BIGINT
                },
                sourceName: {
                    type: DataTypes.STRING(100)
                },
                sourceType: {
                    type: DataTypes.STRING(100)
                },
                tableExclude: {
                    type: DataTypes.STRING(50)
                },
                tableInclude: {
                    type: DataTypes.STRING(255)
                },
                dbName: {
                    type: DataTypes.STRING(50)
                },
                dbServerId: {
                    type: DataTypes.STRING(10)
                },
                created: {
                    type: DataTypes.INTEGER,
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
                },
                createdAt: {
                    type: DataTypes.DATE,
                    //note here this is the guy that you are looking for
                    get() {
                        return moment(this.getDataValue("createdAt")).format(
                            "HH:mm:ss DD/MM/YYYY"
                        )
                    },
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    get() {
                        return moment(this.getDataValue("updatedAt")).format(
                            "HH:mm:ss DD/MM/YYYY"
                        )
                    },
                },
            },
            {
                sequelize,
                modelName: "ManageSource",
            }
        )
    }

    static associate(models) {
        models.ManageSource.belongsTo(models.User, {
            foreignKey: "created",
            as: "userCreate",
        })

        models.ManageSource.belongsTo(models.User, {
            foreignKey: "updated",
            as: "userUpdate",
        })
    }
}

module.exports = ManageSource
