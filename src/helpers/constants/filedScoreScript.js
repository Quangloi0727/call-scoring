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

module.exports = {
    scoreScriptNotNull,
    criteriaNameNull,
    criteriaOptionNull,
    criteriaGroupNameNull,
    criteriaGroupCriteriaNull,
    scoreScriptNotFound,
    statusUpdateFail,
    constTypeResultCallRating
}