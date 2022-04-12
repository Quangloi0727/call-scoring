'use strict';

let { TYPE_ROLETYPE } = require('../../helpers/constants/statusField');

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let dataMapping = Object.keys(TYPE_ROLETYPE).map(i => {
      return {
        name: TYPE_ROLETYPE[i].t,
        type: TYPE_ROLETYPE[i].n
      };
    });

    // console.log(dataMapping);
    // return; // debug
    await queryInterface.bulkInsert('RuleTypes', dataMapping, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
