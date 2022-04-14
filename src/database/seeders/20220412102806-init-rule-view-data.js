"use strict";

let {
  USER_ROLE_NOT_ADMIN,
  TYPE_ROLETYPE,
  SYSTEM_RULE
} = require("../../helpers/constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    let typeFound = await queryInterface.rawSelect(
      "RuleTypes",
      {
        where: {
          name: TYPE_ROLETYPE.hasExpires.t,
        },
      },
      ["id"]
    );

    // let typeOnlyTick = await queryInterface.rawSelect(
    //   "RuleTypes",
    //   {
    //     where: {
    //       name: TYPE_ROLETYPE.onlyTick.t,
    //     },
    //   },
    //   ["id"]
    // );
    if(!typeFound) throw new Error(`Không tìm thấy Loại Quyền: ${TYPE_ROLETYPE.hasExpires.t}`);
    else {

  
      // console.log(dataMapping);
      // return; // debug
      // insert rules
      const ruleData = [
        {
          name: SYSTEM_RULE.XEM_DU_LIEU.name,
          code: SYSTEM_RULE.XEM_DU_LIEU.code,
          ruleTypeId: typeFound,
        }
      ]
      console.log(ruleData, typeFound);
      await queryInterface.bulkInsert('Rules', ruleData, {});

      let ruleIdFound = await queryInterface.rawSelect(
        "Rules",
        {
          where: {
            name: ruleData[0].name,
          },
        },
        ["id"]
      );

      // insert ruleDetails
      console.log(`ruleIdFound`, ruleIdFound);

      let dataMapping = Object.keys(USER_ROLE_NOT_ADMIN).map(i => {
        return {
          role: USER_ROLE_NOT_ADMIN[i].n,
          ruleId: ruleIdFound
        };
      });

      await queryInterface.bulkInsert('RuleDetails', dataMapping, {});

    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
