// cấu hình bảng mặc định
const headerDefault = {
    manualReviewScore: {
        name: "Điểm đánh giá thủ công",
        status: 1
    },
    autoReviewScore: {
        name: "Điểm đánh giá tự động",
        status: 1
    },
    resultReviewScore: {
        name: "Kết quả đánh giá",
        status: 1
    },
    direction: {
        name: "Hướng gọi",
        status: 1
    },
    agentName: {
        name: "Điện thoại viên",
        status: 1
    },
    teamName: {
        name: "Đội ngũ",
        status: 1
    },
    groupName: {
        name: "Nhóm",
        status: 1
    },
    caller: {
        name: "Số gọi đi",
        status: 0
    },
    called: {
        name: "Số gọi đến",
        status: 0
    },
    origTime: {
        name: "Ngày giờ gọi",
        status: 0
    },
    duration: {
        name: "Thời lượng",
        status: 0
    }
}

module.exports = {
    headerDefault,
}