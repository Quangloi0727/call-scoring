const RATING_PERCENT_REPORT_TXT = 'Tỷ lệ loại đánh giá'
const CALL_PERCENT_REPORT_TXT = 'Tỷ lệ loại cuộc gọi'
const GRADING_COMPLETION_PERCENT_TXT = 'Tỷ lệ hoàn thành chấm điểm'
const nameItemStorage = 'Advanced_Search_Report_Call_Rating'

const ORIG_DATE = 'origDate'
const GRADING_DATE = 'gradingDate'

$(function () {

  eventDateRangePicker(ORIG_DATE)
  eventDateRangePicker(GRADING_DATE)
  queryData()
  bindClick()
  _hightChart('pieChartReport', RATING_PERCENT_REPORT_TXT)
})

function bindClick() {
  $(document).on('click', '#btn_advanced_search', function (event) {
    let formData = getFormData('form_advanced_search')
    console.log(formData);

    localStorage.setItem(nameItemStorage, JSON.stringify(formData))
    return queryData(formData)

  })

  $(document).on('click', '#btn_show_modal_search', function (event) {
    const itemStorage = JSON.parse(localStorage.getItem(nameItemStorage))
    if (itemStorage) {
      for (const [key, value] of Object.entries(itemStorage)) {
        $(`#${key}`).val(value)
      }
      $('.selectpicker').selectpicker('refresh');
    }
  })

  $(document).on('click', '#btn_hide_modal_search', function (event) {
    $('#form_advanced_search').trigger('reset');
    $('.selectpicker').selectpicker('refresh')
    return $('#modal_search').modal('hide')
  })

  $(document).on('click', '#btn_clear_local_storage', function (event) {
    $('#form_advanced_search').trigger('reset');
    $('.selectpicker').selectpicker('refresh');
    localStorage.removeItem(nameItemStorage);
    return $('#modal_search').modal('hide')
  })

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


function getFormData(formId) {
  let filter = {}

  filter = _.chain($(`#${formId} .input`)).reduce(function (memo, el) {
    let value = $(el).val()
    if (value != '' && value != null) memo[el.name] = value
    return memo
  }, {}).value()

  return filter
}

function queryData(formData) {
  $('#modal_search').modal('hide')
  _AjaxGetData('/reportCallRating/queryReport', 'GET', function (resp) {
    console.log(resp);
  })

  console.log(formData);
}

