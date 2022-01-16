// 'use strict';
// const {
//   Model,
//   DataTypes
// } = require('sequelize');
// module.exports = async (sequelize) => {
//   class Group extends Model {

//     static associate(models) {
//       this.belongsTo(models.User, {foreignKey: 'created', as: 'User'})
//     }
//   }

//   Group.init({
//     name: {
//       type: DataTypes.STRING,
//     },
//     description: {
//       type: DataTypes.STRING
//     },
//     created: {
//       type: DataTypes.INTEGER
//     }
//   }, {
//     sequelize,
//     modelName: 'Group',
//   });

//   await Group.sync({ force: true });

//   return Group;
// };

const { Model, DataTypes } = require('sequelize');

class Group extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
        },
        description: {
          type: DataTypes.STRING
        },
        created: {
          type: DataTypes.INTEGER
        }
      },
      {
        sequelize,
        modelName: 'Groups'
      }
    );
  }
}

(async () => {
  await Group.sync({ force: true })
});

module.exports = Group;