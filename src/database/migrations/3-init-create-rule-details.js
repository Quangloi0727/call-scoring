'use strict'
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
      },
      unTick: {
        type: Sequelize.INTEGER,
        defaultValue: 1 // 1 là được phép bỏ chọn , 0 là không được phép bỏ chọn
      },
      isActive: {
        type: Sequelize.INTEGER,
        defaultValue: 1 // 1 là true , 0 là false
      },
      createdAt: { type: Sequelize.DATE, defaultValue: new Date() },
      updatedAt: { type: Sequelize.DATE, defaultValue: new Date() }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RuleDetails')
  }
}