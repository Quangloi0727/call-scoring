const RATING_PERCENT_REPORT_TXT = 'Tỷ lệ loại đánh giá'
const CALL_PERCENT_REPORT_TXT = 'Tỷ lệ loại cuộc gọi'
const GRADING_COMPLETION_PERCENT_TXT = 'Tỷ lệ hoàn thành chấm điểm'
const GRADING_ASSIGNED_PERCENT_TXT = 'Tỷ lệ hoàn thành chấm điểm được phân công'
const CALL_ASSIGNED_TXT = 'Cuộc gọi đã được phân công'
const CALL_UN_ASSIGNED_TXT = 'Cuộc gọi chưa được phân công'
const CALL_REVIEWED_TXT = 'Cuộc gọi đã chấm điểm'
const CALL_UN_REVIEWED_TXT = 'Cuộc gọi chưa chấm điểm'
const CALL_SELECTION_CRITERIA_TXT = 'Nội dung chấm điểm'

const nameItemStorage = 'Advanced_Search_Report_Call_Rating'
const nameItemStorage_tapScoreScript = 'Advanced_Search_Report_Call_Rating_tapScoreScript'
const colorHighChartRandom = ['#00FF80', '#FFFF00', '#99FFFF', '#6666FF', '#FFFFCC', '#FF33FF', '#CCCCFF']

$(function () {
  eventDateRangePicker('origDate')
  eventDateRangePicker('gradingDate')
  eventDateRangePicker('origDate_tapScoreScript')
  eventDateRangePicker('gradingDate_tapScoreScript')

  bindClick()
  const itemStorage = JSON.parse(localStorage.getItem(nameItemStorage))
  if (itemStorage) {
    for (const [key, value] of Object.entries(itemStorage)) {
      $(`#${key}`).val(value)
    }
    $('.selectpicker').selectpicker('refresh')
  }
  queryData()
  // move div
  $(".card-body").sortable({
    items: ".cardBodyItem"
  })

})

function bindClick() {
  $(document).on('click', '#btn_advanced_search', function (event) {
    let formData = getFormData('form_advanced_search')
    localStorage.setItem(nameItemStorage, JSON.stringify(formData))
    $('#modal_search').modal('hide')
    return queryData()
  })

  $(document).on('click', '#btn_show_modal_search', function (event) {
    const itemStorage = JSON.parse(localStorage.getItem(nameItemStorage))
    if (itemStorage) {
      for (const [key, value] of Object.entries(itemStorage)) {
        $(`#${key}`).val(value)
      }
      $('.selectpicker').selectpicker('refresh')
    }
  })

  $(document).on('click', '#btn_hide_modal_search', function (event) {
    $('#form_advanced_search').trigger('reset')
    $('.selectpicker').selectpicker('refresh')
    return $('#modal_search').modal('hide')
  })

  $(document).on('click', '#btn_clear_local_storage', function (event) {
    $('#form_advanced_search').trigger('reset')
    $('.selectpicker').selectpicker('refresh')
    localStorage.removeItem(nameItemStorage)
    $('#modal_search').modal('hide')
    eventDateRangePicker('origDate')
    eventDateRangePicker('gradingDate')
    return queryData()
  })

  $(document).on('click', '#btn_advanced_search_tapScoreScript', function (event) {
    let formData = getFormData('form_advanced_search_tapScoreScript')
    localStorage.setItem(nameItemStorage_tapScoreScript, JSON.stringify(formData))
    $('#modal_search_tapScoreScript').modal('hide')
    return queryDataByScoreScript()
  })

  $(document).on('click', '#btn_show_modal_search_tapScoreScript', function (event) {
    const itemStorage = JSON.parse(localStorage.getItem(nameItemStorage_tapScoreScript))
    if (itemStorage) {
      for (const [key, value] of Object.entries(itemStorage)) {
        $(`#${key}_tapScoreScript`).val(value)
      }
      $('.selectpicker').selectpicker('refresh')
    }
  })

  $(document).on('click', '#btn_hide_modal_search_tapScoreScript', function (event) {
    $('#form_advanced_search_tapScoreScript').trigger('reset')
    $('.selectpicker').selectpicker('refresh')
    $('#modal_search_tapScoreScript').modal('hide')
    return queryDataByScoreScript()
  })

  $(document).on('click', '#btn_clear_local_storage_tapScoreScript', function (event) {
    $('#form_advanced_search_tapScoreScript').trigger('reset')
    $('.selectpicker').selectpicker('refresh')
    localStorage.removeItem(nameItemStorage_tapScoreScript)
    eventDateRangePicker('origDate_tapScoreScript')
    eventDateRangePicker('gradingDate_tapScoreScript')
    $('#modal_search_tapScoreScript').modal('hide')
    return queryDataByScoreScript()
  })

  $(document).on('change', '#paging_table .sl-limit-page', function () {
    return queryData(1)
  })

  $(document).on('click', '#paging_table .zpaging', function () {
    let page = $(this).attr('data-link')
    return queryData(page)
  })

  $(document).on('click', '#btn_refresh', function () {
    return location.reload()
  })

  $(document).on('change', '#idScoreScript_tapScoreScript', function () {
    queryDataByScoreScript()
    _hightChart(
      'pieChartSelectionCriteria',
      CALL_SELECTION_CRITERIA_TXT,
      []
    )
    getCriteriaGroup($(this).val())
  })

  $(document).on('change', '#criteriaGroupId', function () {
    if ($(this).val().length == 0) {
      $('#idCriteria').html('')
      $('#idCriteria').prop("disabled", true)
      $('.selectpicker').selectpicker('refresh')
      return toastr.error('Chưa chọn nhóm tiêu chí')
    }
    _AjaxGetData(`/reportCallRating/getCriteria?criteriaGroupId=${$(this).val()}`, 'GET', function (resp) {
      if (resp.code != 200) {
        return toastr.error(resp.error)
      }
      if (resp.criteria) {
        let html = ''
        resp.criteria.map((el) => {
          html += `<option value="${el.id}">${el.name}</option>`
        })
        $('#idCriteria').html(html)
        $('#idCriteria').prop("disabled", false)
        $('.selectpicker').selectpicker('refresh')
      }
    })
  })

  $(document).on('change', '#idCriteria', function () {
    getPercentSelectionCriteria()
  })

  $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
    e.target // newly activated tab
    e.relatedTarget // previous active tab
    if (e.currentTarget.hash == '#tapScoreScript') {
      if ($('#idScoreScript_tapScoreScript').val().length > 0) getCriteriaGroup($('#idScoreScript_tapScoreScript').val())
      _hightChart(
        'pieChartSelectionCriteria',
        CALL_SELECTION_CRITERIA_TXT,
        []
      )
      return queryDataByScoreScript()
    }
  })

  $(document).on('click', '#export_excel', function () {
    let formData = getFormData('form_advanced_search')
    _AjaxGetData('/reportCallRating/exportExcelData?' + $.param(formData), 'GET', function (resp) {
      if (resp.code != 200) return toastr.error(resp.message)
      return downloadFromUrl(resp.linkFile)
    })
  })

  $(document).on('click', '#export_excel_tapScoreScript', function () {
    const formData = getFormData('form_advanced_search_tapScoreScript')
    formData.idScoreScript = $('#idScoreScript_tapScoreScript').val()

    _AjaxGetData('/reportCallRating/exportExcelDataByScoreScript?' + $.param(formData), 'GET', function (resp) {
      if (resp.code != 200) return toastr.error(resp.message)
      return downloadFromUrl(resp.linkFile)
    })
  })

  $(document).on('change', '#paging_table_tapScoreScript .sl-limit-page', function () {
    return queryDataByScoreScript(1)
  })

  $(document).on('click', '#paging_table_tapScoreScript .zpaging', function () {
    let page = $(this).attr('data-link')
    return queryDataByScoreScript(page)
  })

  $(document).on('click', '#btn_refresh_tapScoreScript', function () {
    let queryData = {}
    if ($('#criteriaGroupId').val()) {
      queryData.idScoreScript = $('#idScoreScript_tapScoreScript').val()
      queryData.idCriteria = $('#idCriteria').val()
      queryData.criteriaGroupId = $('#criteriaGroupId').val()
      _AjaxGetData(`/reportCallRating/getPercentSelectionCriteria?` + $.param(queryData), 'GET', function (resp) {
        if (resp.code != 200) {
          return toastr.error(resp.error)
        }
        console.log(resp.percentSelectionCriteria)
        return _hightChart(
          'pieChartSelectionCriteria',
          CALL_SELECTION_CRITERIA_TXT,
          resp.percentSelectionCriteria,
          colorHighChartRandom
        )
      })
    }
    return queryDataByScoreScript()
  })

}

/**
 * * Hàm xử lí event daterangepicker theo tên ô input
 * @param {*} idInput  id  ô input
 * @returns
 */

function getPercentSelectionCriteria() {
  let queryData = getFormData('form_advanced_search_tapScoreScript')
  queryData.idScoreScript = $('#idScoreScript_tapScoreScript').val()
  queryData.idCriteria = $('#idCriteria').val()
  queryData.criteriaGroupId = $('#criteriaGroupId').val()
  _AjaxGetData(`/reportCallRating/getPercentSelectionCriteria?` + $.param(queryData), 'GET', function (resp) {
    if (resp.code != 200) return toastr.error(resp.error)
    console.log("getPercentSelectionCriteria", resp.percentSelectionCriteria)
    return _hightChart(
      'pieChartSelectionCriteria',
      CALL_SELECTION_CRITERIA_TXT,
      resp.percentSelectionCriteria,
      colorHighChartRandom
    )
  })
}

function eventDateRangePicker(idInput) {
  // set giá trị mặc định cho các input date
  $(`input[id="${idInput}"]`).daterangepicker({
    autoUpdateInput: false,
    locale: {
      cancelLabel: 'Clear'
    }
  })
  // xử lí sự kiện khi chọn khoảng "Ngày chấm điểm"
  $(`input:text[id="${idInput}"]`).on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'))
  })

  $(`input:text[id="${idInput}"]`).on('cancel.daterangepicker', function (ev, picker) {
    $(this).val('')
    picker.setStartDate({})
    picker.setEndDate({})
  })
}

function getCriteriaGroup(idScoreScript) {
  return _AjaxGetData(`/reportCallRating/getCriteriaGroup?scoreScriptId=${idScoreScript}`, 'GET', function (resp) {
    if (resp.code != 200) {
      $('#idCriteria').html('')
      $('#idCriteria').prop("disabled", true)
      return toastr.error(resp.error)
    }
    if (resp.criteriaGroup) {
      let html = ''
      resp.criteriaGroup.map((el) => {
        html += `<option value="${el.id}">${el.name}</option>`
      })
      $('#criteriaGroupId').html(html)
      $('#idCriteria').html('')
      $('#idCriteria').prop("disabled", true)
      $('.selectpicker').selectpicker('refresh')
    }
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

function queryData(page) {
  let formData = getFormData('form_advanced_search')
  formData.page = page || 1
  formData.limit = $('#paging_table .sl-limit-page').val() || 10
  _AjaxGetData('/reportCallRating/queryReport?' + $.param(formData), 'GET', function (resp) {
    if (resp.code != 200) return toastr.error(resp.error)
    renderData(resp)
    renderTable(resp.callShareDetail, resp.constTypeResultCallRating)
    return $('#paging_table').html(window.location.CreatePaging(resp.paginator))
  })
}

function downloadFromUrl(url) {
  let link = document.createElement('a')

  link.download = ''
  link.href = url

  return link.click()
}


function queryDataByScoreScript(page) {
  const formData = getFormData('form_advanced_search_tapScoreScript')
  formData.idScoreScript = $('#idScoreScript_tapScoreScript').val()
  formData.page = page || 1
  formData.limit = $('#paging_table_tapScoreScript .sl-limit-page').val() || 10
  _AjaxGetData('/reportCallRating/queryReportByScoreScript?' + $.param(formData), 'GET', function (resp) {
    console.log("data kịch bản chấm điểm", resp)
    if (resp.code != 200) return toastr.error(resp.error)
    renderDataTapScoreScript(resp)
    getPercentSelectionCriteria()
    return $('#paging_table_tapScoreScript').html(window.location.CreatePaging(resp.paginator))
  })
}

function renderData(resp) {
  $('#txtCountCallReviewed').text(resp.countCallReviewed)
  $('#txtCountCallShare').text(resp.countCallShare)
  $('#txtCountCallRatingHistory').text(resp.callRatingReScore)
  $('#txtPercentCallRatingHistory').text(_convertPercentNumber(resp.callRatingReScore, resp.countCallReviewed) + '%')

  renderHightChartTypeResultCallRating(resp.constTypeResultCallRating, resp.percentTypeCallRating, 'pieChartTypeResultCallRating')

  //Tỷ lệ loại cuộc gọi
  _hightChart(
    'pieChartCallShare',
    CALL_PERCENT_REPORT_TXT,
    [
      {
        name: CALL_ASSIGNED_TXT,
        y: resp.totalCallShared
      },
      {
        name: CALL_UN_ASSIGNED_TXT,
        y: resp.totalCallNotShared
      }
    ],
    ['#96C1FF', '#FF9696']
  )

  //Tỷ lệ hoàn thành chấm điểm
  _hightChart(
    'pieChartCallReviewed',
    GRADING_COMPLETION_PERCENT_TXT,
    [
      {
        name: CALL_REVIEWED_TXT,
        y: resp.totalCallReviewed
      },
      {
        name: CALL_UN_REVIEWED_TXT,
        y: resp.totalCallNotReviewed

      }
    ],
    ['#96C1FF', '#FF9696']
  )

  //Tỷ lệ hoàn thành chấm điểm được phân công
  _hightChart(
    'pieChartGradingAssign',
    GRADING_ASSIGNED_PERCENT_TXT,
    [{
      name: CALL_REVIEWED_TXT,
      y: resp.countCallReviewedAssign
    },
    {
      name: CALL_UN_REVIEWED_TXT,
      y: resp.countCallShare - resp.countCallReviewedAssign

    }],
    ['#96C1FF', '#FF9696']
  )

  return
}

function renderTable(data, constTypeResultCallRating) {
  let html = ''
  data.map((el) => {
    const nameAgent = el.callInfo.agent ? el.callInfo.agent.fullName + `(${el.callInfo.agent.userName})` : ''

    let pointResultCallRating = '-'
    if (el.scoreScriptInfo && el.scoreScriptInfo.scoreDisplayType == OP_UNIT_DISPLAY.phanTram.n) {
      pointResultCallRating = _convertPercentNumber(el.pointResultCallRating, el.scoreMax) + `%`
    } else {
      pointResultCallRating = `${el.pointResultCallRating} / ${el.scoreMax}` || 0
    }

    const reviewedAt = el.updateReviewedAt ? moment(el.updateReviewedAt).format('DD/MM/YYYY HH:mm:ss') : ''
    html += `<tr>
        <td class = "text-center">${el.callInfo.id}</td>
        <td class = "text-center">${el.callInfo.direction}</td>
        <td class = "text-center">${nameAgent}</td>
        <td class = "text-center">${el.callInfo.team ? el.callInfo.team.name : ''}</td>
        <td class="text-center">${genGroupOfAgent(el.callInfo['groupName'])}</td>
        <td class = "text-center">${el.scoreTargetInfo ? el.scoreTargetInfo.name : ''}</td>
        <td class = "text-center"></td>
        <td class = "text-center">${el.scoreScriptInfo ? el.scoreScriptInfo.name : ''}</td>
        <td class = "text-center">${pointResultCallRating ? pointResultCallRating : ''}</td>
        <td class = "text-center">${el.typeResultCallRating ? constTypeResultCallRating[`point${el.typeResultCallRating}`].txt : ''}</td>
        <td class = "text-center">${el.userReview ? el.userReview.fullName + ' ' + `(${el.userReview.userName})` : ''}</td>
        <td class = "text-center">${reviewedAt}</td>
    </tr>`
  })

  $('#tableBody').html(html)
}

function renderDataTapScoreScript(resp) {
  $('#txtPercentUnScoreScript').text(_convertPercentNumber(resp.unScoreScript, resp.countCallReviewed) + '%')
  $('#txtPercentUnScoreCriteriaGroup').text(_convertPercentNumber(resp.unScoreCriteriaGroup, resp.countCallReviewed) + '%')
  // điểm trung bình
  $('#txtAvgScoreScript').text(resp.avgPointByCall + '/' + resp.sumScoreMax)
  $('#txtCountCallReviewedTapScoreScript').text(resp.countCallReviewed)
  renderHightChartTypeResultCallRating(resp.constTypeResultCallRating, resp.percentTypeCallRating, 'pieChartTypeResultCallRatingTapScoreScript')
  renderTableTapScoreScript(resp.detailScoreScript.CriteriaGroup, resp.callShareDetail, resp.constTypeResultCallRating)
}

function renderTableTapScoreScript(criteriaGroups, callShareDetail, constTypeResultCallRating) {
  // hiển thị các tiêu chí, nhóm tiêu chí trên table theo kịch bản
  renderHeaderTableTapScoreScript(criteriaGroups)
  let html = ''
  callShareDetail.map((el) => {
    let rowCriteriaGroup = ''
    if (criteriaGroups) {
      criteriaGroups.map((criteriaGroup) => {
        let resultScoreCriteriaGroup = 0
        let scoreMax = 0
        let rowCriteria = ''
        let checkIsUnScoreCriteriaGroup = false
        criteriaGroup.Criteria.map((Criteria) => {
          scoreMax += Criteria.scoreMax
          const found = el.callRatingInfo.find(element => element.idCriteria == Criteria.id)
          if (found && found.selectionCriteriaInfo) {
            if (found?.selectionCriteriaInfo?.unScoreCriteriaGroup) checkIsUnScoreCriteriaGroup = true
            resultScoreCriteriaGroup += found?.selectionCriteriaInfo?.score || 0
          }
          rowCriteria += `<td class = "text-center">
                              <span class="d-inline-block text-truncate">
                                ${found?.selectionCriteriaInfo?.score || 0} - ${(((found?.selectionCriteriaInfo?.score || 0) / Criteria.scoreMax) * 100).toFixed(0) + '%'}
                              </span>
                            </td>
                            <td class = "text-center">
                              <span class="d-inline-block text-truncate" title="${found?.selectionCriteriaInfo?.name || ''}">
                                ${found?.selectionCriteriaInfo?.name || 'Không đủ thông tin để chấm'}
                              </span>
                            </td>`
        })

        if (checkIsUnScoreCriteriaGroup) resultScoreCriteriaGroup = 0

        rowCriteriaGroup += `<td class = "text-center">
                              <span class="d-inline-block text-truncate">
                                ${resultScoreCriteriaGroup} - ${((resultScoreCriteriaGroup / scoreMax) * 100).toFixed(0) + '%'}
                              </span>
                            </td>`
        rowCriteriaGroup += rowCriteria
      })
    }

    const reviewedAt = el.updateReviewedAt ? moment(el.updateReviewedAt).format('DD/MM/YYYY HH:mm:ss') : ''
    const scoreTargetInfoName = el.scoreTargetInfo ? el.scoreTargetInfo.name : ''
    let pointResultCallRating = '-'

    if (el.scoreScriptInfo.scoreDisplayType == OP_UNIT_DISPLAY.phanTram.n) {
      pointResultCallRating = ((el.pointResultCallRating / el.scoreMax) * 100).toFixed(0) + `%`
    } else {
      pointResultCallRating = `${el.pointResultCallRating}/${el.scoreMax}` || 0
    }

    const nameAgent = el.callInfo.agent ? el.callInfo.agent.fullName + `(${el.callInfo.agent.userName})` : ''
    html += `<tr>
        <td class="text-center">
          <span class="d-inline-block text-truncate" title="${el.callInfo.id}">${el.callInfo.id}</span>
        </td>
        <td class="text-center">${el.callInfo.direction}</td>
        <td class="text-center">${nameAgent}</td>
        <td class="text-center">${el.callInfo.team ? el.callInfo.team.name : ''}</td>
        <td class="text-center">${genGroupOfAgent(el.callInfo['groupName'])}</td>
        <td class="text-center">
          <span class="d-inline-block text-truncate" title="${scoreTargetInfoName}">${scoreTargetInfoName}</span>
        </td>
        <td class="text-center">
          <span class="d-inline-block text-truncate"></span>
        </td>
        <td class="text-center">
          <span class="d-inline-block text-truncate" title="${el.scoreScriptInfo ? el.scoreScriptInfo.name : ''}">${el.scoreScriptInfo ? el.scoreScriptInfo.name : ''}</span>
        </td>
        <td class="text-center"> ${pointResultCallRating} </td>
        <td class="text-center">${el.typeResultCallRating ? constTypeResultCallRating[`point${el.typeResultCallRating}`].txt : ''}</td>

        ${rowCriteriaGroup}

        <td class = "text-center">${el.userReview ? el.userReview.fullName + ' ' + `(${el.userReview.userName})` : ''}</td>
        <td class = "text-center">
          <span class="d-inline-block text-truncate" title="${reviewedAt}">${reviewedAt}</span>
        </td>
    </tr>`
  })

  return $('#tableBodyTapScoreScript').html(html)
}

function genGroupOfAgent(groupName) {
  if (!groupName || !groupName.length) return ''
  if (groupName.length == 1) return groupName[0]
  return `
            <div class="dropdown">
                <a class="dropdown-custom dropdown-toggle" role="button" id="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${groupName.length} nhóm
                </a>
                <div class="dropdown-menu" aria-labelledby="dropdown">
                    ${genEachGroup(groupName)}
                </div>
            </div>
    `
}

function genEachGroup(groupName) {
  let html = ''
  groupName.forEach(el => {
    html += `<a class="dropdown-item" type="button">${el}</a>`
  })
  return html
}

function renderHightChartTypeResultCallRating(constTypeResultCallRating, percentTypeCallRating, idChart) {
  let newPercentTypeCallRating = []
  for (const pro in constTypeResultCallRating) {
    newPercentTypeCallRating.push({ name: constTypeResultCallRating[pro]['txt'], code: constTypeResultCallRating[pro]['code'] })
  }
  newPercentTypeCallRating.map(el => {
    if (el.code == "NeedImprove") el.sort = 1
    if (el.code == "Standard") el.sort = 2
    if (el.code == "PassStandard") el.sort = 3
    const findCount = percentTypeCallRating.find(o => o.name == el.code)
    if (findCount) {
      el.y = findCount.y
    } else {
      el.y = 0
    }
    return el
  })
  newPercentTypeCallRating = _.sortBy(newPercentTypeCallRating, "sort")
  _hightChart(idChart, RATING_PERCENT_REPORT_TXT, newPercentTypeCallRating.sort(), ['#FF9696', '#BCFFC2', '#96C1FF'])
}

function renderHeaderTableTapScoreScript(criteriaGroups) {
  let tableHeadTapScoreScript = `
                                  <th class="text-center">Mã cuộc gọi</th>
                                  <th class="text-center">Hướng gọi</th>
                                  <th class="text-center">Điện thoại viên</th>
                                  <th class="text-center">Đội ngũ</th>
                                  <th class="text-center">Nhóm</th>
                                  <th class="text-center">Mục tiêu chấm điểm</th>
                                  <th class="text-center">Điểm đánh giá tự động</th>
                                  <th class="text-center">Kịch bản chấm điểm</th>
                                  <th class="text-center">Điểm đánh giá thủ công</th>
                                  <th class="text-center">Kết quả đánh giá</th>
                                `

  if (criteriaGroups) {
    criteriaGroups.map((criteriaGroup) => {
      tableHeadTapScoreScript += `<th class ="text-center">${criteriaGroup.name}</th>`
      if (criteriaGroup.Criteria) {
        criteriaGroup.Criteria.map((criteria) => {
          tableHeadTapScoreScript += `<th class="text-center">${criteria.name}</th>
                                      <th class="text-center" >Lựa chọn của tiêu chí</th>`
        })
      }
    })
  }
  tableHeadTapScoreScript += `<th class="text-center">Người chấm</th>
                              <th class="text-center">Ngày chấm</th>`
  $('#tableHeadTapScoreScript').html(tableHeadTapScoreScript)
}