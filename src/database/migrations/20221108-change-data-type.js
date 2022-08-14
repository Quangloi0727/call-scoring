const { getLengthField } = require("../../helpers/functions")
'use strict'
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('CriteriaGroups', 'name', {
            type: Sequelize.STRING(500)
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('CriteriaGroups')
    },
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Criterias', 'name', {
            type: Sequelize.STRING(500)
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Criterias')
    },
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('SelectionCriterias', 'name', {
            type: Sequelize.STRING(500)
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('SelectionCriterias')
    }
}