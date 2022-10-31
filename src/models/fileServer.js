const moment = require("moment")
const { Model, DataTypes } = require("sequelize")
class FileServer extends Model {
  static init(sequelize) {
    return super.init(
      {
        ipServer: {
          type: DataTypes.STRING(50)
        },
        path: {
          type: DataTypes.STRING(100)
        },
        username: {
          type: DataTypes.STRING(50),
        },
        password: {
          type: DataTypes.STRING(50)
        },
        port: {
          type: DataTypes.INTEGER
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
        modelName: "FileServer",
      }
    )
  }

  static associate(models) {
    models.FileServer.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    })

    models.FileServer.belongsTo(models.User, {
      foreignKey: "updated",
      as: "userUpdate",
    })
  }
}

module.exports = FileServer