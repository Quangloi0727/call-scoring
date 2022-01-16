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
const GroupModel = require('./group');

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
        fullName: {
          type: DataTypes.STRING,
        },
        extension: {
          type: DataTypes.INTEGER
        },
        password: {
          type: DataTypes.STRING
        },
        role: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        created: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          }
        }
      },
      {
        sequelize,
        modelName: 'Users'
      }
    );
  }

  static associate(models) {
    models.User.hasMany(models.Group, { foreignKey: 'created' });
    models.User.hasMany(models.User, { foreignKey: 'created' });
    models.User.belongsTo(models.User, { as: 'userCreate', foreignKey: 'created' });
  }
}

(async () => {
  await User.sync({ force: true })
});

module.exports = User;