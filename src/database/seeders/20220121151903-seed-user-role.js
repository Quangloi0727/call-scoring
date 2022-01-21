'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      'UserRoles',
      [
        {
          userId: 1,
          role: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ], {})
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('UserRoles', null, {})
  }
};
