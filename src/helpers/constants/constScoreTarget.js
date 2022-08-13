const CONST_RATING_BY = {
  supervisor: {
    n: 1,
    t: "Quản lý đội ngũ",
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
  'Mỗi tháng': 1,
  'Mỗi tuần': 2,
  'Mỗi ngày': 3,
  'Khoảng ngày': 4,
}

const CONST_STATUS = {
  "Nháp": 0,
  "Hoạt động": 1,
  "Ngừng hoạt động": 2

}

const CONST_DATA = {
  caller: {
    n: 0,
    t: "Số gọi đi",
    disable: "false"
  },
  called: {
    n: 1,
    t: "Số gọi đến",
    disable: "false"
  },
  group: {
    n: 2,
    t: "Nhóm",
    disable: "true"
  },
  team: {
    n: 3,
    t: "Đội ngũ",
    disable: "true"
  },
  direction: {
    n: 4,
    t: "Hướng gọi",
    disable: "true"
  },
  agent: {
    n: 5,
    t: "Tên điện thoại viên",
    disable: "true"
  }
}

const CONST_COND = {
  contains: {
    n: 'contains',
    t: "Chứa"
  },
  'notContains': {
    n: 'not contains',
    t: "Không chứa"
  },
  'strictEqual': {
    n: '===',
    t: "Chính xác là", /// bằng tuyệt đối
  },
  'notNull': {
    n: '!null',
    t: "Không trống",
  },
  'null': {
    n: 'null',
    t: "Trống",
  },
  'greaterThan': {
    n: '<',
    t: "Lớn hơn",
    p: 'only number'
  },
  'lessThan': {
    n: '<',
    t: "Nhỏ hơn",
    p: 'only number'
  },
  'greaterThanOrEqual': {
    n: '>=',
    t: "Lớn hơn hoặc bằng",
    p: 'only number'
  },
  'lessThanOrEqual': {
    n: '<=',
    t: "Nhỏ hơn hoặc bằng",
    p: 'only number'
  },
  'abstractEqual': {
    n: '==',
    t: "Bằng",
    p: 'only number'
  }
}


module.exports = {
  CONST_RATING_BY,
  CONST_CALL_TYPE,
  CONST_EFFECTIVE_TIME_TYPE,
  CONST_STATUS,
  CONST_DATA,
  CONST_COND
}
