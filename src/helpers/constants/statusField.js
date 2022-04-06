const TYPE_ADS = {
    google: {
        number: 0,
        text: "Google",
    },
    local: {
        number: 1,
        text: "Ảnh từ hệ thống",
    }
};
const TYPE_NOTE = {
    header: {
        number: 0,
        text: "Header",
    },
    body: {
        number: 1,
        text: "Body list",
    }
};

const USER_ROLE = {
    agent: {
        n: 0,
        t: 'Điện thoại viên'
    },
    supervisor: {
        n: 1,
        t: 'Quản lý đội ngũ'
    },
    admin: {
        n: 2,
        t: 'Quản trị viên'
    },
    evaluator: {
        n: 3,
        t: 'Người đánh giá'
    },
    groupmanager: {
        n: 4,
        t: 'Quản lý nhóm'
    },
}

module.exports = {
    TYPE_ADS,
    TYPE_NOTE,
    USER_ROLE,
};
