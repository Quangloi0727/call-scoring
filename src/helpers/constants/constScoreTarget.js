const CONST_RATING_BY = {
  supervisor: {
    n: 1,
    t: "Đội ngũ",
  },
  agent: {
    n: 0,
    t: "Điện thoại viên",
  },
  all: {
    n: 5,
    t: "Toàn hệ thống",
  }
}

const CONST_CALL_TYPE = {
  'Tất cả': 0,
  'Cuộc gọi bình thường': 1,
  'Cuộc gọi không bình thường': 2
}

const CONST_EFFECTIVE_TIME_TYPE = {
  EVERY_MONTH: {
    value: 1,
    text: "Mỗi tháng"
  },
  EVERY_WEEK: {
    value: 2,
    text: "Mỗi tuần"
  },
  EVERY_DAY: {
    value: 3,
    text: "Mỗi ngày"
  },
  ABOUT_DAY: {
    value: 4,
    text: "Khoảng ngày"
  }
}

const CONST_STATUS = {
  DRAFT: {
    value: 0,
    text: "Nháp"
  },
  ACTIVE: {
    value: 1,
    text: "Hoạt động"
  },
  UN_ACTIVE: {
    value: 2,
    text: "Ngừng hoạt động"
  }
}

const CONST_DATA = {
  caller: {
    value: 0,
    text: "Số gọi đi",
    disable: "false"
  },
  called: {
    value: 1,
    text: "Số gọi đến",
    disable: "false"
  },
  groupId: {
    value: 2,
    text: "Nhóm",
    disable: "true"
  },
  teamId: {
    value: 3,
    text: "Đội ngũ",
    disable: "true"
  },
  direction: {
    value: 4,
    text: "Hướng gọi",
    disable: "true"
  },
  agentId: {
    value: 5,
    text: "Tên điện thoại viên",
    disable: "true"
  },
  duration: {
    value: 6,
    text: "Thời lượng",
    disable: "false"
  }
}

const CONST_COND = {
  contains: {
    n: 'substring',
    t: "Chứa"
  },
  notContains: {
    n: 'notLike',
    t: "Không chứa"
  },
  strictEqual: {
    n: '===',
    t: "Chính xác là", /// bằng tuyệt đối
  },
  notNull: {
    n: 'not',
    t: "Không trống",
  },
  null: {
    n: 'is',
    t: "Trống",
  },
  greaterThan: {
    n: 'gt',
    t: "Lớn hơn",
    p: 'only number'
  },
  lessThan: {
    n: 'lt',
    t: "Nhỏ hơn",
    p: 'only number'
  },
  greaterThanOrEqual: {
    n: 'gte',
    t: "Lớn hơn hoặc bằng",
    p: 'only number'
  },
  lessThanOrEqual: {
    n: 'lte',
    t: "Nhỏ hơn hoặc bằng",
    p: 'only number'
  },
  abstractEqual: {
    n: 'eq',
    t: "Bằng",
    p: 'only number'
  }
}

const scoreTargetNotFound = 'Không tìm thấy mục tiêu chấm điểm vui lòng thử lại sau !'
const statusUpdateFail = 'Trạng thái chuyển không hợp lệ !'

module.exports = {
  scoreTargetNotFound,
  statusUpdateFail,
  CONST_RATING_BY,
  CONST_CALL_TYPE,
  CONST_EFFECTIVE_TIME_TYPE,
  CONST_STATUS,
  CONST_DATA,
  CONST_COND
}
