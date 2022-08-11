/*!
 * WebAdmin v1.0.0-rc (https://webadmin.io)
 * Copyright 2014-2020 Colorlib <https://colorlib.com>
 * Licensed under MIT (https://github.com/ColorlibHQ/AdminLTE/blob/master/LICENSE)
 */
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports, require("jquery"))
    : typeof define === "function" && define.amd
      ? define(["exports", "jquery"], factory)
      : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
        factory((global.adminlte = {}), global.jQuery))
})(this, function (exports, $) {
  "use strict"
  const limitPage = [10, 25, 50, 100]
  const MESSAGE_ERROR = {
    "QA-001": "Không được bỏ trống",
    "QA-002": "Thông tin đã tồn tại !",
    "QA-003": "Tên đăng nhập hoặc mật khẩu không chính xác",
    "QA-004": "Lỗi hệ thống!",
    "QA-005": "Thời gian bắt đầu phải khác thời gian kết thúc",
    "QA-006": "Lưu thành công!",
    "QA-007": "Thông tin cấu hình lỗi!",
    "QA-008": "Giá trị đến phải lớn hơn giá trị từ",
    "QA-009":
      "Khoảng đạt chỉ tiêu cần lớn hơn và nằm ngoài khoảng cần cải thiện",
    "QA-010":
      "Khoảng vượt chỉ tiêu cần lớn hơn và nằm ngoài khoảng đạt chỉ tiêu",
    "QA-011": "Điểm lựa chọn phải nhỏ hơn hoặc bằng điểm tối đa",
    "QA-012": "Đã tồn tại ghi chú tại thời điểm này",
  }

  function CreatePaging(paging, classPaging = "zpaging") {
    if (!paging) return ""
    let firstPage = paging.first
      ? '<li class="page-item"><a class="page-link ' +
      classPaging +
      '" data-link="' +
      paging.first +
      '">&laquo;</a></li>'
      : ""
    let prePage = paging.previous
      ? '<li class="page-item"><a class="page-link ' +
      classPaging +
      '" data-link="' +
      paging.previous +
      '">&lsaquo;</a></li>'
      : ""
    let pageNum = ""
    for (let i = 0; i < paging.range.length; i++) {
      if (paging.range[i] == paging.current) {
        pageNum +=
          '<li class="page-item active"><span class="page-link" >' +
          paging.range[i] +
          "</span></li>"
      } else {
        pageNum +=
          '<li class="page-item"><a class="page-link ' +
          classPaging +
          '" data-link="' +
          paging.range[i] +
          '">' +
          paging.range[i] +
          "</a></li>"
      }
    }
    let pageNext = paging.next
      ? '<li class="page-item"><a class="page-link ' +
      classPaging +
      '" data-link="' +
      paging.next +
      '">&rsaquo;</a></li>'
      : ""
    let pageLast = paging.last
      ? '<li class="page-item"><a class="page-link ' +
      classPaging +
      '" data-link="' +
      paging.last +
      '">&raquo;</a></li>'
      : ""
    let total = ""

    if (paging.totalResult)
      total = `<span class=""> <strong>Tổng:</strong> <span class="badge bg-danger"> ${paging.totalResult} </span>  </span>`
    return (
      '<div class="paginate text-center">' +
      '<ul class="pagination m-0">' +
      firstPage +
      prePage +
      pageNum +
      pageNext +
      pageLast +
      `
      <select class="form-control sl-limit-page ml-3">
            ${limitPage
        .map((ele) => {
          let selected = ""
          if (ele == paging.rowsPerPage) selected = "selected"

          return `<option value=${ele} ${selected}>${ele}</option>`
        })
        .join("")}
          </select>

      </ul> ${total} </div>`
    )
  }

  /**
   * chuyển mảng các giá trị của form sang json
   * @param {*} _arr
   */
  function convertArrayToObject(_arr) {
    var json = {}
    for (let index = 0; index < _arr.length; index++) {
      const element = _arr[index]
      const name = element.name //.replace("new", "");
      const nameIsNumber = [
        "sectionIndex",
        "type",
        "status",
        "index",
        "weight",
        "age",
        "categoryType",
        "categoryNew",
        "dienTich",
      ]
      const nameIsCash = ["gia"] // giá tiền --> auto chuyển về number
      // giftIds là select multi trong form
      // có thể áp dụng cho các form có select multi...
      if (name == "giftIds") {
        if (!json[name]) json[name] = [element.value]
        else json[name].push(element.value)
      }
      if (nameIsCash.includes(name)) {
        json[name] = Number(getOnlyNumber(element.value))
      } else
        json[name] = nameIsNumber.includes(name)
          ? Number(element.value)
          : element.value
    }

    return json
  }

  /**
   * Mục đích để xử lý khi nhập input text chỉ cho nhập số để thu được kết quả là: số.
   * khi dùng event keyup số tiền, ...
   * @param {string} text dữ liệu cần chuyển đổi
   */
  function getOnlyNumber(text) {
    if (!text) return ""
    return text.replace(/[^0-9]/g, "")
  }

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    )
  }

  // Để check form validate nếu thay đổi giá trị
  // $("select.form-control").on("change", (e) => {
  //   let target = $(e.currentTarget);
  //   target.trigger("blur");
  // });

  /**
   *
   */

  // variables
  window.location.limitPage = limitPage
  window.location.MESSAGE_ERROR = MESSAGE_ERROR

  // function
  window.location.CreatePaging = CreatePaging
  window.location.convertArrayToObject = convertArrayToObject
  window.location.getOnlyNumber = getOnlyNumber
  window.location.uuidv4 = uuidv4

  $.validator.messages.required = MESSAGE_ERROR["QA-001"]
  $.validator.messages.maxlength = $.validator.format("Độ dài không quá {0} kí tự")
  $.validator.messages.max = $.validator.format("Hãy nhập từ {0} trở xuống.")
  $.validator.messages.min = $.validator.format("Hãy nhập từ {0} trở lên.")

  $.validator.addMethod(
    "le",
    function (value, element, param) {
      return this.optional(element) || Number(value) <= Number($(param).val())
    },
    MESSAGE_ERROR["QA-011"]
  )
  $.validator.addMethod(
    "ge",
    function (value, element, param) {
      return this.optional(element) || Number(value) >= Number($(param).val())
    },
    "ge Invalid value"
  )
  $.validator.addMethod(
    "gte",
    function (value, element, param) {
      return this.optional(element) || Number(value) > Number($(param).val())
    },
    "gte Invalid value"
  )
  $.validator.addMethod("unique-criteria-group", function (value, element) {
    var parentForm = $(element).closest('form')
    var timeRepeated = 0
    if (value != '') {
      $(parentForm.find('.unique-criteria-group')).each(function () {
        if ($(this).val() === value) {
          timeRepeated++
        }
      })
    }
    return timeRepeated === 1 || timeRepeated === 0
  }, "Tên nhóm tiêu chí đã tồn tại !")

  $.validator.addMethod("name-criteria", function (value, element) {
    var parentForm = $(element).closest('div>.card-body.wp-list-criteria')
    var timeRepeated = 0
    if (value != '') {
      $(parentForm.find('.name-criteria')).each(function () {
        if ($(this).val() === value) {
          timeRepeated++
        }
      })
    }
    return timeRepeated === 1 || timeRepeated === 0
  }, "Tên tiêu chí đã tồn tại !")


  $.validator.addMethod("name-selection-criteria", function (value, element) {
    var parentForm = $(element).closest('div>.row.wp-list-selection-criteria')
    var timeRepeated = 0
    if (value != '') {
      $(parentForm.find('.name-selection-criteria')).each(function () {
        if ($(this).val() === value) {
          timeRepeated++
        }
      })
    }
    return timeRepeated === 1 || timeRepeated === 0
  }, "Tên lựa chọn đã tồn tại !")

})
