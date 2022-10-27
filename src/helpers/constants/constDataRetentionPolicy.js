const TypeDateSaveForCall = {
  year: {
    value: 365,
    text: "Năm",
  },
  month: {
    value: 30,
    text: "Tháng",
  },
  day: {
    value: 1,
    text: "Ngày",
  }
}

const STATUS = {
  ACTIVE: {
    value: 1,
    text: "Đang Hoạt động"
  },
  UN_ACTIVE: {
    value: 2,
    text: "Không hoạt động"
  }
}

const UnlimitedSaveForCall = {
  UnlimitedSave: {
    value: 1,
    t: "Có lưu không giới hạn",
  },
  UnlimitedNotSave: {
    value: 2,
    t: "Không lưu không giới hạn",
  }
}
const DataRetentionPolicyNotFound = 'Không tìm thấy chính sách dữ liệu vui lòng thử lại sau !'
const statusUpdateFail = 'Đội ngũ trong Chính sách đang thuộc Chính sách khác đang hoạt động !'
const statusUpdateSuccess = 'Thay đổi trạng thái Chính sách thành công !'
const deleteSuccess = 'Xóa Chính sách thành công !'

module.exports = {
  TypeDateSaveForCall,
  UnlimitedSaveForCall,
  STATUS,
  DataRetentionPolicyNotFound,
  statusUpdateFail,
  statusUpdateSuccess,
  deleteSuccess
}
