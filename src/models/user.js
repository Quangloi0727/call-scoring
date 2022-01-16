// 'use strict';
// const {
//   Model,
//   DataTypes
// } = require('sequelize');
// module.exports = async (sequelize) => {
//   class User extends Model {}

//   User.init({
//     firstName: {
//       type: DataTypes.STRING
//     },
//     lastName: {
//       type: DataTypes.STRING
//     },
//     userName: {
//       type: DataTypes.STRING,
//     },
//     extension: {
//       type: DataTypes.INTEGER
//     },
//     password: {
//       type: DataTypes.INTEGER
//     },
//     role: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0
//     }
//   }, {
//     sequelize,
//     modelName: 'User',
//   });

//   await User.sync({ force: true });

//   return User;
// };

const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        firstName: {
          type: DataTypes.STRING
        },
        lastName: {
          type: DataTypes.STRING
        },
        userName: {
          type: DataTypes.STRING,
        },
        extension: {
          type: DataTypes.INTEGER
        },
        password: {
          type: DataTypes.INTEGER
        },
        role: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        }
      },
      {
        sequelize,
        modelName: 'Users'
      }
    );
  }
}

(async () => {
  await User.sync({ force: true })
});

module.exports = User;