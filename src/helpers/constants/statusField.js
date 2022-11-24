const TYPE_ADS = {
  google: {
    number: 0,
    text: "Google",
  },
  local: {
    number: 1,
    text: "Ảnh từ hệ thống",
  },
}
const TYPE_NOTE = {
  header: {
    number: 0,
    text: "Header",
  },
  body: {
    number: 1,
    text: "Body list",
  },
}

const USER_ROLE = {
  agent: {
    n: 0,
    t: "Điện thoại viên",
  },
  supervisor: {
    n: 1,
    t: "Quản lý đội ngũ",
  },
  admin: {
    n: 2,
    t: "Quản trị viên",
  },
  evaluator: {
    n: 3,
    t: "Người đánh giá",
  },
  groupmanager: {
    n: 4,
    t: "Quản lý nhóm",
  },
}

const { admin, ...USER_ROLE_NOT_ADMIN } = USER_ROLE

const MESSAGE_ERROR = {
  "QA-001": "Không được bỏ trống",
  "QA-002": "Thông tin đã tồn tại !",
  "QA-003": "Tên đăng nhập hoặc mật khẩu không chính xác",
  "QA-004": "Lỗi hệ thống!",
  "QA-005": "Thời gian bắt đầu phải khác thời gian kết thúc",
  "QA-006": "Lưu thành công!",
  "QA-007": "Thông tin cấu hình lỗi!",
  "QA-008": "Giá trị từ phải nhỏ hơn giá trị đến",
  "QA-009": "Khoảng đạt chỉ tiêu cần lớn hơn và nằm ngoài khoảng cần cải thiện",
  "QA-010": "Khoảng vượt chỉ tiêu cần lớn hơn và nằm ngoài khoảng đạt chỉ tiêu",
  "QA-011": "Điểm lựa chọn phải nhỏ hơn hoặc bằng điểm tối đa",
  "QA-012": "Đã tồn tại ghi chú tại thời điểm này",
}

const TYPE_ROLETYPE = {
  hasExpires: {
    t: "Giới hạn thời gian",
    n: 0,
  },
  onlyTick: {
    t: "Chỉ tích chọn",
    n: 1,
  },
}

const SYSTEM_RULE = {
  XEM_DU_LIEU: {
    name: "Xem dữ liệu",
    code: "XEM_DU_LIEU",
  },
  XUAT_EXCEL: {
    name: "Xuất Excel",
    code: "XUAT_EXCEL",
  },
  CHAM_DIEM_CUOC_GOI: {
    name: "Chấm điểm cuộc gọi",
    code: "CHAM_DIEM_CUOC_GOI",
  },
  CAU_HINH_MUC_TIEU_CHAM_DIEM: {
    name: "Cấu hình mục tiêu chấm điểm",
    code: "CAU_HINH_MUC_TIEU_CHAM_DIEM",
  },
  CAU_HINH_KICH_BAN_CHAM_DIEM: {
    name: "Cấu hình kịch bản chấm điểm",
    code: "CAU_HINH_KICH_BAN_CHAM_DIEM",
  },
  GHI_CHU_CUOC_GOI: {
    name: "Ghi chú cuộc gọi",
    code: "GHI_CHU_CUOC_GOI",
  }
}

const OP_TIME_DEFINE = {
  ngay: {
    t: "Ngày",
    n: 0,
    day: 1,
  },
  thang: {
    t: "Tháng",
    n: 1,
    day: 30,
  },
  nam: {
    t: "Năm",
    n: 2,
    day: 365,
  },
}

const OP_UNIT_DISPLAY = {
  phanTram: {
    t: "Phần trăm",
    n: 0,
  },
  diem: {
    t: "Điểm",
    n: 1,
  },
}

const STATUS_SCORE_SCRIPT = {
  nhap: {
    t: "Nháp",
    n: 0,
  },
  hoatDong: {
    t: "Hoạt động",
    n: 1,
    default: 'disabled'
  },
  ngungHoatDong: {
    t: "Ngừng hoạt động",
    n: 2,
    default: 'disabled'
  },
}

const FIELD_CONFIG = {
  name: {
    default: 500
  },
  description: {
    default: 500
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
  OP_UNIT_DISPLAY,
  STATUS_SCORE_SCRIPT,
  FIELD_CONFIG
}
