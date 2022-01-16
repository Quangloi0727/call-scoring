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
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          firstName: 'Phạm Xuân',
          lastName: 'Tình',
          userName: 'tinh1',
          fullName: 'Phạm Xuân Tình',
          extension: 0,
          password: 'Pxt@4321',
          created: 1,
          role: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          firstName: 'Phạm Minh',
          lastName: 'Tuân',
          userName: 'tuan1',
          fullName: 'Phạm Minh Tuân',
          extension: 0,
          password: 'Pxt@4321',
          created: 1,
          role: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ], {})
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {})
  }
};
