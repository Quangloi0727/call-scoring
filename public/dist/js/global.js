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
      factory((global.adminlte = {}), global.jQuery));
})(this, function (exports, $) {
  "use strict";
  const limitPage = [10, 25, 50, 100];
  const MESSAGE_ERROR = {
    "QA-001":	"Không được bỏ trống",
    "QA-002":	"Thông tin đã tồn tại",
    "QA-003":	"Tên đăng nhập hoặc mật khẩu không chính xác",
    "QA-004":	"Lỗi hệ thống!",
    "QA-005":	"Thời gian bắt đầu phải khác thời gian kết thúc"
  }

  function CreatePaging(paging, classPaging = "zpaging") {
    if (!paging) return "";
    let firstPage = paging.first
      ? '<li class="page-item"><a class="page-link ' +
        classPaging +
        '" data-link="' +
        paging.first +
        '">&laquo;</a></li>'
      : "";
    let prePage = paging.previous
      ? '<li class="page-item"><a class="page-link ' +
        classPaging +
        '" data-link="' +
        paging.previous +
        '">&lsaquo;</a></li>'
      : "";
    let pageNum = "";
    for (let i = 0; i < paging.range.length; i++) {
      if (paging.range[i] == paging.current) {
        pageNum +=
          '<li class="page-item active"><span class="page-link" >' +
          paging.range[i] +
          "</span></li>";
      } else {
        pageNum +=
          '<li class="page-item"><a class="page-link ' +
          classPaging +
          '" data-link="' +
          paging.range[i] +
          '">' +
          paging.range[i] +
          "</a></li>";
      }
    }
    let pageNext = paging.next
      ? '<li class="page-item"><a class="page-link ' +
        classPaging +
        '" data-link="' +
        paging.next +
        '">&rsaquo;</a></li>'
      : "";
    let pageLast = paging.last
      ? '<li class="page-item"><a class="page-link ' +
        classPaging +
        '" data-link="' +
        paging.last +
        '">&raquo;</a></li>'
      : "";
    let total = "";

    if (paging.totalResult)
      total = `<span class=""> <strong>Tổng:</strong> <span class="badge bg-danger"> ${paging.totalResult} </span>  </span>`;
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
            ${limitPage.map(ele => {
              let selected = '';
              if(ele == paging.rowsPerPage) selected = 'selected';

              return `<option value=${ele} ${selected}>${ele}</option>`
            }).join('')}
          </select>

      </ul> ${total} </div>`
    );
  }

  /**
   * chuyển mảng các giá trị của form sang json
   * @param {*} _arr
   */
  function convertArrayToObject(_arr) {
    var json = {};
    for (let index = 0; index < _arr.length; index++) {
      const element = _arr[index];
      const name = element.name; //.replace("new", "");
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
      ];
      const nameIsCash = ["gia"]; // giá tiền --> auto chuyển về number
      // giftIds là select multi trong form
      // có thể áp dụng cho các form có select multi...
      if (name == "giftIds") {
        if (!json[name]) json[name] = [element.value];
        else json[name].push(element.value);
      }
      if (nameIsCash.includes(name)) {
        json[name] = Number(getOnlyNumber(element.value));
      } else
        json[name] = nameIsNumber.includes(name)
          ? Number(element.value)
          : element.value;
    }

    return json;
  }

  /**
   * Mục đích để xử lý khi nhập input text chỉ cho nhập số để thu được kết quả là: số.
   * khi dùng event keyup số tiền, ...
   * @param {string} text dữ liệu cần chuyển đổi
   */
  function getOnlyNumber(text) {
    if (!text) return "";
    return text.replace(/[^0-9]/g, "");
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
  window.location.limitPage = limitPage;
  window.location.MESSAGE_ERROR = MESSAGE_ERROR;
  
   // function
  window.location.CreatePaging = CreatePaging;
  window.location.convertArrayToObject = convertArrayToObject;
  window.location.getOnlyNumber = getOnlyNumber;

  $.validator.messages.required = MESSAGE_ERROR["QA-001"];
  $.validator.messages.maxlength = $.validator.format( "Độ dài không quá {0} kí tự" );
});
//# sourceMappingURL=adminlte.js.map