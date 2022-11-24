const RATING_PERCENT_REPORT_TXT = 'Tỷ lệ loại đánh giá'
const CALL_PERCENT_REPORT_TXT = 'Tỷ lệ loại cuộc gọi'
const GRADING_COMPLETION_PERCENT_TXT = 'Tỷ lệ hoàn thành chấm điểm'
const GRADING_ASSIGNED_PERCENT_TXT = 'Tỷ lệ hoàn thành chấm điểm được phân công'
const CALL_ASSIGNED_TXT = 'Cuộc gọi đã được phân công'
const CALL_UN_ASSIGNED_TXT = 'Cuộc gọi chưa được phân công'
const CALL_REVIEWED_TXT = 'Cuộc gọi đã chấm điểm'
const CALL_UN_REVIEWED_TXT = 'Cuộc gọi chưa chấm điểm'

const nameItemStorage = 'Advanced_Search_Report_Call_Rating'


const ORIG_DATE = 'origDate'
const GRADING_DATE = 'gradingDate'

$(function () {

  eventDateRangePicker(ORIG_DATE)
  eventDateRangePicker(GRADING_DATE)
  queryData()
  bindClick()
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

function queryData() {
  $('#modal_search').modal('hide')
  const formData = JSON.parse(localStorage.getItem(nameItemStorage))
  _AjaxGetData('/reportCallRating/queryReport?' + $.param(formData), 'GET', function (resp) {
    if (resp.code != 200) {
      return toastr.error(resp.error)
    }
    console.log(resp);
    renderHightChart(resp);

    renderTable(resp.callShareDetail, resp.constTypeResultCallRating);
    return $('#paging_table').html(window.location.CreatePaging(resp.paginator))
  })
}

function renderHightChart(resp) {
  $('#txtCountCallReviewed').text(resp.countCallReviewed[0].CallReviewed);
  $('#txtCountCallShare').text(resp.countCallShare[0].CallShares);

  if (resp.callRatingHistory.length > 0) {
    var countCallRatingHistory = _.filter(resp.callRatingHistory, function (callRatingHistory) { return callRatingHistory.re_scored == 1 }).length;
    $('#txtCountCallRatingHistory').text(countCallRatingHistory);
    $('#txtPercentCallRatingHistory').text(((countCallRatingHistory / resp.countCallReviewed[0].CallReviewed) * 100).toFixed(0) + '%');
  }

  const constTypeResultCallRating = resp.constTypeResultCallRating
  const percentTypeCallRating = resp.percentTypeCallRating

  let keyObj = []
  percentTypeCallRating.map((el) => {
    keyObj.push(`point${el.name}`);
    el.name = constTypeResultCallRating[`point${el.name}`].txt

  })
  if (keyObj.length > 0) {
    const keyNullValue = _.difference(Object.keys(constTypeResultCallRating), keyObj)
    if (keyNullValue.length > 0) {
      keyNullValue.map((el) => {
        percentTypeCallRating.push({
          name: constTypeResultCallRating[el].txt,
          y: 0
        })
      })
    }
  }
  _hightChart('pieChartTypeResultCallRating', RATING_PERCENT_REPORT_TXT, percentTypeCallRating)

  const percentCallShare = []
  percentCallShare.push(
    {
      name: CALL_ASSIGNED_TXT,
      y: resp.countCallShare[0].CallShares
    },
    {
      name: CALL_UN_ASSIGNED_TXT,
      y: resp.callDetailRecords[0].CallDetailRecords - resp.countCallShare[0].CallShares

    })
  _hightChart('pieChartCallShare', CALL_PERCENT_REPORT_TXT, percentCallShare)


  const percentGradingCompletion = []
  percentGradingCompletion.push(
    {
      name: CALL_REVIEWED_TXT,
      y: resp.countCallReviewed[0].CallReviewed
    },
    {
      name: CALL_UN_REVIEWED_TXT,
      y: resp.countCallShare[0].CallShares - resp.countCallReviewed[0].CallReviewed

    })
  _hightChart('pieChartCallReviewed', GRADING_COMPLETION_PERCENT_TXT, percentGradingCompletion)


  const percentGradingAssign = []
  percentGradingAssign.push(
    {
      name: CALL_REVIEWED_TXT,
      y: resp.countCallReviewed[0].CallReviewed
    },
    {
      name: CALL_UN_REVIEWED_TXT,
      y: resp.callDetailRecords[0].CallDetailRecords - resp.countCallReviewed[0].CallReviewed

    })
  _hightChart('pieChartGradingAssign', GRADING_ASSIGNED_PERCENT_TXT, percentGradingAssign)

  return;
}

function renderTable(data, constTypeResultCallRating) {
  let html = ''
  data.map((el) => {
    html += `<tr>
        <td class = "text-center">${el.callInfo.id}</td>
        <td class = "text-center">${el.callInfo.direction}</td>
        <td class = "text-center">${el.callInfo.agent ? el.callInfo.agent.name : ''}</td>
        <td class = "text-center">${el.callInfo.team ? el.callInfo.team.name : ''}</td>
        <td class = "text-center"></td>
        <td class = "text-center">${el.scoreTargetInfo.name}</td>
        <td class = "text-center"></td>
        <td class = "text-center">${el.scoreScriptInfo ? el.scoreScriptInfo.name : ''}</td>
        <td class = "text-center">${el.pointResultCallRating ? el.pointResultCallRating : ''}</td>
        <td class = "text-center">${el.typeResultCallRating ? constTypeResultCallRating[`point${el.typeResultCallRating}`].txt : ''}</td>
        <td class = "text-center">${el.UserReview ? el.UserReview.name : ''}</td>
        <td class = "text-center">${(el.updatedAt != el.createdAt) && el.pointResultCallRating ? moment(el.updatedAt, "HH:mm:ss DD/MM/YYYY").format('DD/MM/YYYY HH:mm:ss') : ''}</td>
    </tr>`
  })

  $('#tableBody').html(html)
}

