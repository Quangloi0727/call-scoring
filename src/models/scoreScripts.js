const moment = require("moment");
const { Model, DataTypes, Op } = require("sequelize");

const { MESSAGE_ERROR } = require("../helpers/constants");
class ScoreScipt extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(100),
        },
        description: {
          type: DataTypes.STRING(500),
        },
        scoreType: {
          type: DataTypes.INTEGER,
        },
        criteriaType: {
          type: DataTypes.INTEGER,
        },
        needImproveMin: {
          type: DataTypes.INTEGER,
        },
        needImproveMax: {
          type: DataTypes.INTEGER,
        },
        standardMin: {
          type: DataTypes.INTEGER,
        },
        standardMax: {
          type: DataTypes.INTEGER,
        },
        passStandardMin: {
          type: DataTypes.INTEGER,
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
        modelName: "ScoreScipts",
        hooks: {
          beforeCreate: handleBeforeCreate,
        },
      }
    );
  }

  static associate(models) {
    models.ScoreScipt.belongsTo(models.User, {
      foreignKey: "created",
      as: "userCreate",
    });

    models.ScoreScipt.hasMany(models.UserScoreSciptMember, {
      foreignKey: "groupId",
      as: "UserScoreSciptMember",
    });
    models.ScoreScipt.hasMany(models.TeamScoreScipt, {
      foreignKey: "groupId",
      as: "TeamScoreScipt",
    });
  }
}

async function handleBeforeCreate(team, option) {
  const teamResult = await ScoreScipt.findOne({
    where: { name: { [Op.eq]: team.name.toString() } },
  });

  if (teamResult) {
    throw new Error(MESSAGE_ERROR["QA-002"]);
  }
}

module.exports = ScoreScipt;
