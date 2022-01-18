'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          firstName: 'admin',
          lastName: 'admin',
          userName: 'admin',
          fullName: 'admin',
          extension: 0,
          password: '123',
          created: 1,
          role: 1,
          isActive: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ], {})
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {})
  }
};
