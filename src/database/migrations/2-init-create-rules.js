'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
      },
      code: {
        type: Sequelize.STRING(100),
      },
      ruleTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "RuleTypes",
          key: "id",
        },
      },
      created: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      createdAt: { type: Sequelize.DATE, defaultValue: new Date() },
      updatedAt: { type: Sequelize.DATE, defaultValue: new Date() }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rules');
  }
};