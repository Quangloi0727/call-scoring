const TypeDateSaveForCall = {
  YEAR: {
    value: 365,
    text: "Năm",
  },
  MONTH: {
    value: 30,
    text: "Tháng",
  },
  DAY: {
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
const khongTimThayChinhSachDuLieu = 'Không tìm thấy chính sách dữ liệu vui lòng thử lại sau !'
const doiNguTrongChinhSachDaTonTai = 'Đội ngũ trong Chính sách đang thuộc Chính sách khác đang hoạt động !'
const thayDoiTrangThaiThanhCong = 'Thay đổi trạng thái Chính sách thành công !'
const xoaChinhSachThanhCong = 'Xóa Chính sách thành công !'

module.exports = {
  TypeDateSaveForCall,
  UnlimitedSaveForCall,
  STATUS,
  khongTimThayChinhSachDuLieu,
  doiNguTrongChinhSachDaTonTai,
  thayDoiTrangThaiThanhCong,
  xoaChinhSachThanhCong
}
