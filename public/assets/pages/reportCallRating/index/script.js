const RATING_PERCENT_REPORT_TXT = 'Tỷ lệ loại đánh giá'
const CALL_PERCENT_REPORT_TXT = 'Tỷ lệ loại cuộc gọi'
const GRADING_COMPLETION_PERCENT_TXT = 'Tỷ lệ hoàn thành chấm điểm'

const ORIG_DATE = 'origDate'
const GRADING_DATE = 'gradingDate'

$(function () {

  eventDateRangePicker(ORIG_DATE)
  eventDateRangePicker(GRADING_DATE)


  _hightChart('pieChartReport', RATING_PERCENT_REPORT_TXT)
})

function clickfunc() {

}

/**
 * * Hàm xử lí event daterangepicker theo tên ô input
 * @param {*} nameInput tên ô input
 * @returns
 */
function eventDateRangePicker(nameInput) {
  // set giá trị mặc định cho các input date
  $(`input[name="${nameInput}"]`).daterangepicker({
    autoUpdateInput: false,
    locale: {
      cancelLabel: 'Clear'
    }
  })
  // xử lí sự kiện khi chọn khoảng "Ngày chấm điểm"
  $(`input:text[name="${nameInput}"]`).on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'))
  })

  $(`input:text[name="${nameInput}"]`).on('cancel.daterangepicker', function (ev, picker) {
    $(this).val('')
  })
}
