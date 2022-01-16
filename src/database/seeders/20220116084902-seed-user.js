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
          extension: 0,
          password: '123',
          role: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ], {})
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {})
  }
};
