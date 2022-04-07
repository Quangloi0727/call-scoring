const moment = require("moment");
const { Model, DataTypes, Op } = require("sequelize");

const { MESSAGE_ERROR } = require("../helpers/constants");
class Group extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
        },
        description: {
          type: DataTypes.STRING,
        },
        created: {
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
            );
          },
        },
        updatedAt: {
          type: DataTypes.DATE,
          get() {
            return moment(this.getDataValue("updatedAt")).format(
              "HH:mm:ss DD/MM/YYYY"
            );
          },
        },
      },
      {
        sequelize,
        modelName: "Groups",
        hooks: {
          beforeCreate: handleBeforeCreate,
        },
      }
    );
  }

  static associate(models) {
    models.Group.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    });

    models.Group.hasMany(models.UserGroupMember, {
      foreignKey: "groupId",
      as: "UserGroupMember",
    });
    models.Group.hasMany(models.TeamGroup, {
      foreignKey: "groupId",
      as: "TeamGroup",
    });
  }
}

async function handleBeforeCreate(team, option) {
  const teamResult = await Group.findOne({
    where: { name: { [Op.eq]: team.name.toString() } },
  });

  if (teamResult) {
    throw new Error(MESSAGE_ERROR["QA-002"]);
  }
}

module.exports = Group;
