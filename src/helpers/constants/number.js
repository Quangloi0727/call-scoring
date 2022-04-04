const DATE_TIME = {
    ONEDAY: 86400,
    ONEHOUR: 3600,
    ONEMINUTE: 60,
}

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
    evalua: {
        n: 3,
        t: 'Người đánh giá'
    },
    groupmanager: {
        n: 4,
        t: 'Quản lý nhóm'
    },
}

module.exports = {
    DATE_TIME,
    USER_ROLE
}