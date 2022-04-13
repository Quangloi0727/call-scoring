const { Model, DataTypes, Op } = require('sequelize');
const { MESSAGE_ERROR } = require("../helpers/constants");

class RuleType extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
        },
        type: {
          type: DataTypes.INTEGER,
          allowNull: false
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
        modelName: 'RuleTypes',
        // hooks: {
        //   beforeCreate: handleBeforeCreate
        // }
      },
    );
  }

  static associate(models) {

    models.RuleType.hasMany(models.Rule, { foreignKey: 'ruleTypeId', as: 'Rule' });

  }
}

async function handleBeforeCreate(data, option) {
  const result = await RuleType.findOne({
    where: { name: { [Op.eq]: data.name.toString() } }
  });

  if (result) {
    throw new Error(MESSAGE_ERROR["QA-002"]);
  }
}

module.exports = RuleType;