'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RuleDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ruleId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Rules",
          key: "id",
        },
      },      
      role: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      expires: {
        type: Sequelize.INTEGER, // số ngày
      },
      expiresType: {
        type: Sequelize.INTEGER, // loại: ngày: 0, tháng: 1, năm: 2
      },
      unLimited: {
        type: Sequelize.INTEGER, // xem giới hạn: 0, xem không giới hạn: 1
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RuleDetails');
  }
};