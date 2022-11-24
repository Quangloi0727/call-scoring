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
                    name: SYSTEM_RULE.CAU_HINH_MUC_TIEU_CHAM_DIEM.name,
                    code: SYSTEM_RULE.CAU_HINH_MUC_TIEU_CHAM_DIEM.code,
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
                return {
                    role: USER_ROLE_NOT_ADMIN[i].n,
                    ruleId: ruleIdFound,
                    unLimited: false
                }
            })

            await queryInterface.bulkInsert('RuleDetails', dataMapping, {})

        }
    }
}
