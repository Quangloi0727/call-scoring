const scoreScriptNotNull = 'Vui lòng thêm các nhóm tiêu chí trong nhóm kịch bản !'
const criteriaNameNull = 'Tiêu chí có tên rỗng !'
const criteriaOptionNull = 'Tiêu chí có lựa chọn rỗng !'
const criteriaGroupNameNull = 'Nhóm tiêu chí có tên rỗng !'
const criteriaGroupCriteriaNull = 'Nhóm tiêu chí có tiêu chí rỗng !'
const scoreScriptNotFound = 'Không tìm thấy kịch bản chấm điểm vui lòng thử lại sau !'
const statusUpdateFail = 'Trạng thái chuyển không hợp lệ !'


const constTypeResultCallRating = {
    pointNeedImprove: {
        txt: 'Cần cải thiện',
        code: 'NeedImprove'
    },
    pointStandard: {
        txt: 'Tiêu chuẩn',
        code: 'Standard'
    },
    pointPassStandard: {
        txt: 'Vượt tiêu chuẩn',
        code: 'PassStandard'
    },
}
const statusSelectionCriteria = {
    unScoreCriteriaGroup: {
        text: "Điểm liệt của nhóm",
        isUnScore: 1,
        notUnScore: 0
    },
    unScoreScript: {
        text: "Điểm liệt của kịch bản",
        isUnScore: 1,
        notUnScore: 0
    },
}
module.exports = {
    scoreScriptNotNull,
    criteriaNameNull,
    criteriaOptionNull,
    criteriaGroupNameNull,
    criteriaGroupCriteriaNull,
    scoreScriptNotFound,
    statusUpdateFail,
    constTypeResultCallRating,
    statusSelectionCriteria
}