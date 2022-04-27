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

const {
    admin,
    ...USER_ROLE_NOT_ADMIN
} = USER_ROLE;

const MESSAGE_ERROR = {
    "QA-001":	"Không được bỏ trống",
    "QA-002":	"Thông tin đã tồn tại",
    "QA-003":	"Tên đăng nhập hoặc mật khẩu không chính xác",
    "QA-004":	"Lỗi hệ thống!",
    "QA-005":	"Thời gian bắt đầu phải khác thời gian kết thúc"
}

const TYPE_ROLETYPE = {
    hasExpires: {
        t: 'Giới hạn thời gian',
        n: 0,
    },
    onlyTick: {
        t: 'Chỉ tích chọn',
        n: 1
    }
}

const SYSTEM_RULE = {
    XEM_DU_LIEU: {
        name: 'Xem dữ liệu',
        code: 'XEM_DU_LIEU'
    },
    XUAT_EXCEL: {
        name: 'Xuất Excel',
        code: 'XUAT_EXCEL'
    }
}

const OP_TIME_DEFINE = {
    ngay: {
        t: 'Ngày',
        n: 0,
        day: 1,
    },
    thang: {
        t: 'Tháng',
        n: 1,
        day: 30,
    },
    nam: {
        t: 'Năm',
        n: 2,
        day: 365,
    }
}

const OP_UNIT_DISPLAY = {
    phanTram: {
        t: 'Phần trăm',
        n: 0,
    },
    diem: {
        t: 'Điểm',
        n: 1,
    },
}

module.exports = {
    TYPE_ADS,
    TYPE_NOTE,
    USER_ROLE,
    MESSAGE_ERROR,
    TYPE_ROLETYPE,
    USER_ROLE_NOT_ADMIN,
    SYSTEM_RULE,
    OP_TIME_DEFINE,
    OP_UNIT_DISPLAY
};
