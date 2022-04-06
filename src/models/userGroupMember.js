const { Model, DataTypes } = require('sequelize');

class UserGroupMember extends Model {
  static init(sequelize) {
    return super.init(
      {
        groupId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Groups',
            key: 'id'
          }
        },
        userId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        role: {
          type: DataTypes.INTEGER,
        }
      },
      {
        sequelize,
        modelName: 'UserGroupMembers'
      },
    );
  }

  static associate(models) {
    models.UserGroupMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    
    models.UserGroupMember.belongsTo(models.Group, { foreignKey: 'groupId' });
  }
}

module.exports = UserGroupMember;