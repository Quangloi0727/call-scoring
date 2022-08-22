'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('configurationColums', 'nameTable', {
          type: Sequelize.DataTypes.STRING
        }, { transaction: t })
      ])
    })
  }
}