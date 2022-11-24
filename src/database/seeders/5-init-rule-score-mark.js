"use strict"

let {
    USER_ROLE_NOT_ADMIN,
    TYPE_ROLETYPE,
    SYSTEM_RULE
} = require("../../helpers/constants")

module.exports = {
    async up(queryInterface, Sequelize) {

        let typeFound = await queryInterface.rawSelect(
            "RuleTypes",
            {
                where: {
                    name: TYPE_ROLETYPE.onlyTick.t,
                },
            },
            ["id"]
        )
        if (!typeFound) throw new Error(`Không tìm thấy Loại Quyền: ${TYPE_ROLETYPE.onlyTick.t}`)
        else {
            const ruleData = [
                {
                    name: SYSTEM_RULE.CHAM_DIEM_CUOC_GOI.name,
                    code: SYSTEM_RULE.CHAM_DIEM_CUOC_GOI.code,
                    ruleTypeId: typeFound,
                }
            ]

            await queryInterface.bulkInsert('Rules', ruleData, {})

            let ruleIdFound = await queryInterface.rawSelect(
                "Rules",
                {
                    where: {
                        name: ruleData[0].name,
                    },
                },
                ["id"]
            )

            // insert ruleDetails
            console.log(`ruleIdFound`, ruleIdFound)

            let dataMapping = Object.keys(USER_ROLE_NOT_ADMIN).map(i => {
                if (i == "evaluator") {
                    return {
                        role: USER_ROLE_NOT_ADMIN[i].n,
                        ruleId: ruleIdFound,
                        unLimited: true,
                        unTick: false
                    }
                } else {
                    return {
                        role: USER_ROLE_NOT_ADMIN[i].n,
                        ruleId: ruleIdFound,
                        unLimited: false,
                        unTick: true
                    }
                }
            })

            await queryInterface.bulkInsert('RuleDetails', dataMapping, {})

        }
    }
}
