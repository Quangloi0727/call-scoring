const TypeDateSaveForCall = {
  YEAR: {
    value: 'YEAR',
    text: "Năm",
  },
  MONTH: {
    value: 'MONTH',
    text: "Tháng",
  },
  DAY: {
    value: 'DAY',
    text: "Ngày",
  }
}

const STATUS = {
  ACTIVE: {
    value: 1,
    text: "Đang hoạt động"
  },
  UN_ACTIVE: {
    value: 2,
    text: "Không hoạt động"
  }
}

const UnlimitedSaveForCall = {
  UnlimitedSave: {
    value: 1,
    text: "Có lưu không giới hạn",
  },
  UnlimitedNotSave: {
    value: 2,
    text: "Không lưu không giới hạn",
  }
}
const dataRetentionPolicyNotFound = 'Không tìm thấy chính sách dữ liệu vui lòng thử lại sau !'
const statusUpdateFail = 'Trạng thái update không hợp lệ !'
const statusUpdateSuccess = 'Thay đổi trạng thái chính sách thành công !'
const deleteSuccess = 'Xóa chính sách thành công !'

module.exports = {
  TypeDateSaveForCall,
  UnlimitedSaveForCall,
  STATUS,
  dataRetentionPolicyNotFound,
  statusUpdateFail,
  statusUpdateSuccess,
  deleteSuccess
}
