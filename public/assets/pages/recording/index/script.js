// https://codepen.io/scottjehl/pen/abJrPOP

const $buttonSearch = $('#search')
const $buttonExportExcel = $('#export_excel')
const $formSearch = $('#form_search')
const $tableData = $('#table_data')
// const $containerPaging = $('#paging_table');
const $buttonAdvancedSearch = $('#btn_advanced_search')
const $formAdvancedSearch = $('#form_advanced_search')
const $modalSearch = $('#modal_search')
const $buttonCancelModal = $('#btn_cancel')
const $buttonClearFilter = $('#clear_local_storage')
const $buttonExportExcelAdvanced = $('#export_excel_advanced')

const DEFAULT_SEARCH = 'default_search'
const ADVANCED_SEARCH = 'advance_search'

const $modal_customs_table = $("#modal_customs_table")
const $checkInput = $("#sortable input:checkbox")
const $tableRecording = $("#tableRecording")
const $selectAll = $("#select-all")
const $btn_save_customs = $("#btn_save_customs")
const $resetColumnCustom = $("#resetColumnCustom")
let searchType = DEFAULT_SEARCH

// WARNING
// CACHE
let CACHE_CONFIG_COLUMN = null

//init wavesurfer
var wavesurfer = null

function bindClick() {
  $buttonSearch.on('click', function (e) {
    let formData = getFormData('form_search')
    let formDataAdvanced = getFormData('form_advanced_search')

    console.log('formData: ', formData)
    console.log('formDataAdvanced: ', formDataAdvanced)

    if (_.isEmpty(formDataAdvanced)) {
      if (formData.startTime) {
        $('[name="startTime"]').val(formData.startTime)
      }

      if (formData.endTime) {
        $('[name="endTime"]').val(formData.endTime)
      }
      searchType = DEFAULT_SEARCH

      console.log("data search", formData)
      return findData(1, null, formData)

    } else {
      formDataAdvanced.caller = formData.caller
      formDataAdvanced.called = formData.called
      formData = formDataAdvanced
      searchType = DEFAULT_SEARCH

      console.log("data search", formData)
      return findData(1, null, formData)
    }

  })

  // enter
  $('#form_search input[name="caller"],#form_search input[name="called"]').keypress('enter', function (e) {
    if (e.which == 13) {
      let page = 1
      let formData = getFormData('form_search')
      searchType = DEFAULT_SEARCH
      findData(page, null, formData)
    }

  })

  $buttonAdvancedSearch.on('click', function () {
    let page = 1
    let formData = getFormData('form_advanced_search')
    searchType = ADVANCED_SEARCH
    localStorage.setItem('modalData', JSON.stringify(formData))

    if (formData.startTime) {
      $('[name="startTime"]').val(formData.startTime)
    }

    if (formData.endTime) {
      $('[name="endTime"]').val(formData.endTime)
    }

    return findData(page, null, formData)
  })

  $buttonExportExcel.on('click', function () {
    let formData = {}

    if (searchType === DEFAULT_SEARCH) {
      formData = getFormData('form_search')
    } else if (searchType === ADVANCED_SEARCH) {
      formData = getFormData('form_advanced_search')
    }
    const sortDescActive = $('.sorting_desc')
    const sortAscActive = $('.sorting_asc')
    if (sortDescActive.length > 0) {
      formData.sort = { sort_by: $(sortDescActive[0]).attr('id-sort'), sort_type: 'DESC' }
    } else if (sortAscActive.length > 0) {
      formData.sort = { sort_by: $(sortAscActive[0]).attr('id-sort'), sort_type: 'ASC' }
    }// TH con lai: ko sort

    return findData(null, true, formData)
  })

  $(document).on('click', '.zpaging', function () {
    let page = $(this).attr('data-link')
    let formData = {}

    if (searchType === DEFAULT_SEARCH) {
      formData = getFormData('form_search')
    } else if (searchType === ADVANCED_SEARCH) {
      formData = getFormData('form_advanced_search')
    }

    return findData(page, null, formData)
  })

  $buttonCancelModal.on('click', () => {
    return $modalSearch.modal('hide')
  })

  $buttonClearFilter.on('click', () => {
    localStorage.removeItem('modalData', '')
    $formAdvancedSearch.trigger("reset")
    $('.selectpickerAdvanced').selectpicker('refresh')
    const formData = getFormData('form_search')
    return findData(1, null, formData)
  })

  $resetColumnCustom.on('click', async () => {
    // xóa data column
    await deleteSaveColumn()
    // reset tick
    renderPopupCustomColumn(headerDefault, true)
    // xóa cache
    CACHE_CONFIG_COLUMN = null

    // reload data theo cache
    let formData = {}

    if (searchType === DEFAULT_SEARCH) {
      formData = getFormData('form_search')
    } else if (searchType === ADVANCED_SEARCH) {
      formData = getFormData('form_advanced_search')
    }
    // ve lai header
    renderHeaderTable(headerDefault, formData, true)
    return findData(1, null, formData)
  })

  // event popup custom table
  $("#sortable").sortable({
    items: "li:not(.unsortable)"
  })

  $btn_save_customs.click(function () {
    $checkInput.each(function (index) {
      // đoạn này e check và cho ẩn hiện luôn ko có save data nguyenvc
      var colToHide = $tableRecording.find("." + $(this).attr("name"))

      if ($(this).is(":checked") == false) {
        $(colToHide).toggle(false)
      } else {
        $(colToHide).toggle(true)
      }

    })

    let obj = {}
    $("#sortable input:checkbox").each(function () {
      let key = $(this).attr("name")
      let value = $(this).is(":checked")
      obj[key] = value
    })
    SaveConfigurationColums(obj)
  })

  $selectAll.click(function (event) {
    if (this.checked) {
      // Iterate each checkbox
      $(':checkbox').each(function () {
        this.checked = true
      })
    } else {
      $(':checkbox').each(function () {
        if ($(this).attr('name') == 'callId') return
        this.checked = false
      })
    }
  })

  $(document).on('click', '.sorting', function (event) {
    // debugger
    const target = $(event.currentTarget)
    // let hasDesc = $(event).hasClass('sorting_desc');
    let formData = {}

    if (searchType === DEFAULT_SEARCH) {
      formData = getFormData('form_search')
    } else if (searchType === ADVANCED_SEARCH) {
      formData = getFormData('form_advanced_search')
    }

    if (target.hasClass('sorting_desc')) {
      target.removeClass('sorting_desc').addClass('sorting_asc')
      formData.sort = { sort_by: target.attr('id-sort'), sort_type: 'ASC' }
    } else if (target.hasClass('sorting_asc')) {
      target.removeClass('sorting_asc').addClass('sorting_desc')
      formData.sort = { sort_by: target.attr('id-sort'), sort_type: 'DESC' }
    } else {
      target.removeClass('sorting_desc').addClass('sorting_asc')
      formData.sort = { sort_by: target.attr('id-sort'), sort_type: 'ASC' }
    }

    // debugger
    return findData(1, null, formData)
  })

  $(document).on('change', '.sl-limit-page', function () {
    console.log('change sl-limit-page')
    let formData = {}

    if (searchType === DEFAULT_SEARCH) {
      formData = getFormData('form_search')
    } else if (searchType === ADVANCED_SEARCH) {
      formData = getFormData('form_advanced_search')
    }

    return findData(1, null, formData)
  })

  $modal_customs_table.on('show.bs.modal', function (event) {
    // debugger
    console.log('show.bs.modal')
    if (CACHE_CONFIG_COLUMN) {
      renderPopupCustomColumn(CACHE_CONFIG_COLUMN)
    } else {
      renderPopupCustomColumn(headerDefault, true)
    }
  })

  $('.dropdown-item').on('click', function () {
    var val = $(this).attr("data-val")
    console.log("value play speed", val)
    wavesurfer.setPlaybackRate(val)
    $(".defaultPlaySpeed").text(val == 1 ? "Chuẩn" : val)
  })

  $(document).on('click', '.fa-play-circle', function () {
    const urlRecord = $(this).attr('url-record')
    const callId = $(this).attr('data-callId')
    $(".callId").text(callId)
    $("#formDetailRecord").html('')
    $('#showDetailRecord').modal('show')
    //$("#downloadFile").attr("url-record", "https://qa.metechvn.com/static/call.metechvn.com/archive/2022/Aug/17/d6a4f7a2-1dce-11ed-b31a-95f7e31f94c6.wav")
    $("#downloadFile").attr("url-record", urlRecord)
    _AjaxGetData('/scoreMission/' + callId + '/getCallRatingNotes', 'GET', function (resp) {
      if (resp.code == 200) {
        wavesurfer = _configWaveSurfer(resp.result, urlRecord, null)
      } else {
        console.log("get list note callId " + callId + " error")
        wavesurfer = _configWaveSurfer([], urlRecord, null)
      }
    })
  })

  $(document).on('click', '.commentCallScore', function () {
    const urlRecord = $(this).attr('url-record')
    const callId = $(this).attr('data-callId')
    $('#btn-add-comment').attr('data-callId', callId)
    $("#downloadFile-popupComment").attr("url-record", urlRecord)
    $(".callId").text(callId)
    _AjaxGetData('/scoreMission/' + callId + '/checkScored', 'GET', function (resp) {
      if (resp.code == 401) return toastr.error(resp.message)
      $('#popupComment').modal('show')
      if (resp.code == 200) {
        $("#idCriteriaGroupComment").attr("disabled", true)
        $("#idCriteriaComment").attr("disabled", true)
        $('.selectpicker').selectpicker('refresh')
      } else {
        $("#idCriteriaGroupComment").attr("disabled", false)
        $("#idCriteriaComment").attr("disabled", false)
        $('.selectpicker').selectpicker('refresh')
        _AjaxGetData('/scoreMission/' + callId + '/getCriteriaGroupByCallRatingId', 'GET', function (resp) {
          renderCriteriaGroup(resp.result.CriteriaGroup)
          $('.selectpicker').selectpicker('refresh')
        })
      }
      _AjaxGetData('/scoreMission/' + callId + '/getCallRatingNotes', 'GET', function (resp) {
        if (resp.code == 200) {
          wavesurfer = _configWaveSurfer(resp.result, urlRecord, "#recordComment")
        } else {
          console.log("get list note callId " + callId + " error")
          wavesurfer = _configWaveSurfer([], urlRecord, "#recordComment")
        }
      })
    })

  })

  $(document).on('click', '#btn-add-comment', function () {
    let data = {}
    let callId = $(this).attr('data-callId')
    data.note = getFormData('formCallComment')
    data.note.callId = callId
    data.note.idCriteria = data.note.idCriteriaComment
    data.note.idCriteriaGroup = data.note.idCriteriaGroupComment
    data.note.createdByForm = CreatedByForm.COMMENT
    _AjaxData('/scoreMission/saveCallRating', 'POST', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
      if (resp.code != 200) {
        return toastr.error(resp.message)
      }
      toastr.success('Lưu thành công !')
      return setTimeout(() => {
        window.location.href = "/recording"
      }, 2500)
    })
  })

  // xử lí chọn option ghi chú của mục tiêu
  $(document).on('change', '#idCriteriaGroupComment', function () {
    renderCriteria($(this).val(), '#idCriteriaComment')
  })

  $(`.controls .btn`).on('click', function () {
    var action = $(this).data('action')
    console.log("action", action)
    switch (action) {
      case 'play':
        wavesurfer.playPause()
        break
      case 'back':
        wavesurfer.skipBackward(10)
        _updateTimer(wavesurfer)
        break
      case 'forward':
        wavesurfer.skipForward(10)
        _updateTimer(wavesurfer)
        break
    }
  })

  $(document).on('click', '#downloadFile', function () {
    let src_file = $(this).attr("url-record")
    window.location = src_file
  })

  $(document).on('click', '.showCallScore', function () {
    if ($(this).attr('data-isMark') == 'false') return toastr.error("Cuộc gọi chưa được chấm điểm !")
    let callId = $(this).attr('data-callId')
    $(".callId").text(callId)
    let idScoreScript = $(this).attr('data-id')
    let url = $(this).attr('url-record')
    return getDetailScoreScript(idScoreScript, callId, url)
  })

  $("#showDetailRecord").on("hidden.bs.modal", function () {
    wavesurfer.destroy()
  })

  $("#popupCallScore").on("hidden.bs.modal", function () {
    wavesurfer.destroy()
    $('#recordCallScore').html('')
    $(".countValueLength").text("0/500")
  })

  $("#popupHistory").on("hidden.bs.modal", function () {
    $("#callScore .card-body").html('')
    $("#comment .card-body").html('')
  })

  $("#popupComment").on("hidden.bs.modal", function () {
    wavesurfer ? wavesurfer.destroy() : ''
    $('#formCallComment')[0] ? $('#formCallComment')[0].reset() : ''
    $("#idCriteriaComment").html('')
    $(".countValueLength").text("0/500")
  })

  $(document).on('click', '#btn-save-modal', function () {
    let data = {}
    let callId = $(this).attr('data-callId')
    let idScoreScript = $(this).attr('data-idScoreScript')
    let arr = []
    let checkSelectNull = false
    $(".error-non-select").remove()
    $(".selectpicker.criteria").each(function () {
      if ($(this).val() == '') {
        checkSelectNull = true
        $(this).closest('.form-group').append(`<span class="error-non-select mr-1">${window.location.MESSAGE_ERROR["QA-001"]}</span>`)
      }
      arr.push({
        idSelectionCriteria: $(this).val() == 'not_enough_infor' ? null : $(this).val(),
        idCriteria: $(this).attr('data-criteriaId'),
        callId: callId,
        idScoreScript: idScoreScript
      })
    })

    if (checkSelectNull) return toastr.error("Không được để trống tiêu chí")

    data.note = getFormData('formCallScore')
    data.note.callId = callId
    data.note.idScoreScript = idScoreScript
    data.note.createdByForm = CreatedByForm.ADD
    data.resultCriteria = arr


    if (data.note.description && (!data.note.timeNoteMinutes && !data.note.timeNoteSecond)) {
      $('.error-input-timeNote').removeClass('d-none')
      $('.error-input-timeNote').text(window.location.MESSAGE_ERROR["QA-001"])
      return toastr.error('Thời gian ghi chú không được bỏ trống !')
    }

    if (data.note.timeNoteMinutes || data.note.timeNoteSecond) {
      let timeNoteMinutes = data.note.timeNoteMinutes ? data.note.timeNoteMinutes : 0
      let timeNoteSecond = data.note.timeNoteSecond ? data.note.timeNoteSecond : 0
      let totalSeconds = _convertTime(timeNoteMinutes, timeNoteSecond)
      if (totalSeconds > wavesurfer.getDuration()) {
        $('.error-input-timeNote').removeClass('d-none')
        $('.error-input-timeNote').text("Thời gian ghi chú không hợp lệ")
        return toastr.error("Thời gian ghi chú không hợp lệ")
      }
    }

    if (!data.note.description && (data.note.timeNoteMinutes || data.note.timeNoteSecond)) {
      $('.error-textarea-description').removeClass('d-none')
      $('.error-textarea-description').text('Nội dung ghi chú không được bỏ trống !')
      return toastr.error(window.location.MESSAGE_ERROR["QA-001"])
    }

    if (!data.note.timeNoteMinutes && !data.note.timeNoteSecond) delete data.note // case này là case KH k nhập chấm điểm

    const action = $(this).attr('method')

    if (action == 'edit') {
      delete data.note
      data.type = 'edit'
    } else {
      data.type = 'add'
    }

    data.dataEditOrigin = dataEditOrigin

    _AjaxData('/scoreMission/saveCallRating', 'POST', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
      if (resp.code != 200) {
        return toastr.error(resp.message)
      }
      toastr.success('Lưu thành công !')
      return setTimeout(() => {
        window.location.href = "/recording"
      }, 2500)
    })
  })

  $(document).on('click', '.historyCallScore', function () {
    $('#popupHistory').modal('show')
    const callId = $(this).attr('data-callId')
    _AjaxGetData('/scoreMission/' + callId + '/getCallRatingNotes', 'GET', function (resp) {
      if (resp.code == 200) {
        if (resp.result && resp.result.length == 0) return
        let html = ``
        resp.result.forEach(el => {
          html += `
                    <p class="font-weight-bold">[${el.userCreate && el.userCreate.fullName ? el.userCreate.fullName : ''}] đã thêm một ghi chú lúc ${(moment(el.createdAt).format("DD/MM/YYYY HH:mm:ss"))}</p>
                    <p>Ghi chú cho :${_genNoteFor(el.criteria, el.criteriaGroup)}</p>
                    <p>Hiển thị trên file ghi âm tại :${_secondsToTimestamp(_convertTime(el.timeNoteMinutes || 0, el.timeNoteSecond || 0))}</p>
                    <p>${el.description}</p>
                    <hr></hr>
                  `
        })
        $("#comment .card-body").html(html)
      } else {
        console.log("get call rating note form history fail", resp)
      }
    })
    _AjaxGetData('/scoreMission/' + callId + '/getCallRatingHistory', 'GET', function (resp) {
      console.log("data edit history", resp)
      if (resp.code == 200) {
        if (resp.resultEdit && resp.resultEdit.length == 0 && resp.resultAdd && resp.resultAdd.length == 0) return
        let html = ``
        const grouped = _.groupBy(resp.resultEdit, el => el.createdAt)
        for (let index in grouped) {
          const data = grouped[index]
          html += `<p class="font-weight-bold">[${data[0].userCreate && data[0].userCreate.fullName ? data[0].userCreate.fullName : ''}] đã sửa chấm điểm lúc ${(moment(data[0].createdAt).format("DD/MM/YYYY HH:mm:ss"))}</p>`
          data.forEach(el => {
            html += `
                      <div class = "row">
                          <div class="col-6">
                              <i class='fas fa-edit'></i>
                              ${el.criteria && el.criteria.name ? el.criteria.name : ''} :
                          </div>
                          <div class="col-6">
                              ${el.selectionCriteriaOld && el.selectionCriteriaOld.name ? el.selectionCriteriaOld.name : ''} <i class="fas fa-angle-double-right"></i>
                              ${el.selectionCriteriaNew && el.selectionCriteriaNew.name ? el.selectionCriteriaNew.name : ''}
                          </div>
                      </div>
                    `
          })
          html += `<hr></hr>`
        }

        if (resp.resultAdd && !_.isEmpty(resp.resultAdd)) {
          const { userCreate, createdAt } = resp.resultAdd || {}
          html += `<p class="font-weight-bold">[${userCreate.fullName}] đã chấm điểm lúc ${(moment(createdAt).format("DD/MM/YYYY HH:mm:ss"))}</p>`
        }

        $("#callScore .card-body").html(html)
      } else {
        console.log("get call rating note form history fail", resp)
      }
    })
  })

  // xử lí chọn option ghi chú của mục tiêu
  $(document).on('change', '#idCriteriaGroup', function () {
    renderCriteria($(this).val(), '#idCriteria')
  })


}

function deleteSaveColumn() {
  return new Promise((resolve, reject) => {
    $('.page-loader').show()

    $.ajax({
      type: 'DELETE',
      url: '/recording/SaveConfigurationColums',
      cache: 'false',
      success: function (result) {
        $('.page-loader').hide()
        resolve('success')
      },
      error: function (error) {
        $('.page-loader').hide()
        reject(error.responseJSON.message)
      },
    })
  })
}

function SaveConfigurationColums(data) {

  $.ajax({
    type: 'POST',
    url: '/recording/SaveConfigurationColums',
    data: data,
    dataType: "text",
    success: function () {
      let formData = {}
      $modal_customs_table.modal('hide')
      if (searchType === DEFAULT_SEARCH) {
        formData = getFormData('form_search')
      } else if (searchType === ADVANCED_SEARCH) {
        formData = getFormData('form_advanced_search')
      }

      return findData(1, null, formData)
    },
    error: function (error) {
      $modal_customs_table.modal('hide')
      return toastr.error(JSON.parse(error.responseText).message)
    },
  })
}

function renderCriteriaGroup(data) {
  let html = `<option value="0" selected>Toàn bộ kịch bản</option>`
  data.forEach(el => {
    html += `<option value="${el.id}">${el.name}</option>`
  })
  $('#idCriteriaGroupComment').html(html)
  $('.selectpicker').selectpicker('refresh')
}

function renderCriteria(idCriteriaGroup, idAddCriteria) {
  let html = ``
  _AjaxGetData('/scoreMission/' + idCriteriaGroup + '/getCriteriaByCriteriaGroup', 'GET', function (resp) {
    if (resp.code == 200) {
      resp.result.forEach((el, index) => {
        html += `<option value="${el.id}" ${index == 0 ? 'selected' : ''}>${el.name}</option>`
      })
      $(`${idAddCriteria}`).html(html)
      $('.selectpicker').selectpicker('refresh')
      $(`${idAddCriteria}`).prop("disabled", html ? false : true)
      $('.selectpicker').selectpicker('refresh')
    }
  })
}

// lấy thông tin chi tiết của kịch bản chấm điểm
function getDetailScoreScript(idScoreScript, callId, url) {
  let queryData = {}
  queryData.idScoreScript = idScoreScript
  queryData.callId = callId
  _AjaxGetData('scoreMission/getScoreScript?' + $.param(queryData), 'GET', function (resp) {
    console.log("data kịch bản chấm điểm", resp)
    $('.nameScoreScript').text(resp.scoreScriptInfo.name)
    // data tiêu chí vào biến chugng để xử lí cho các element khác -- các tiêu chí có trong có trong kịch bản ko có giá trị để tính điểm
    _criteriaGroups = resp.scoreScriptInfo.CriteriaGroup

    $("#downloadFile-popupCallScore").attr("url-record", url)
    wavesurfer = _configWaveSurfer(resp.resultCallRatingNote ? resp.resultCallRatingNote : [], url, '#recordCallScore')

    $('#btn-save-modal').attr('data-callId', callId)
    $('#btn-save-modal').attr('data-idScoreScript', idScoreScript)
    //render dữ liệu ra popup
    dataEditOrigin = resp.resultCallRating
    popupScore(resp.scoreScriptInfo.CriteriaGroup, resp.resultCallRatingNote, resp.resultCallRating)
    return $('#popupCallScore').modal('show')
  })
}

// xử lí dữ liệu ra popup
function popupScore(criteriaGroups, resultCallRatingNote, resultCallRating) {
  let navHTML = ``
  $('#formCallScore')[0].reset()
  $('.tab-content').html('')
  let optionIdCriteriaGroup = `<option value="0">Toàn bộ kịch bản</option>`
  let totalPoint = 0
  criteriaGroups.map((criteriaGroup, index) => {
    let uuidv4 = window.location.uuidv4()
    let pointCriteria = 0
    let navTabContent
    if (criteriaGroup.Criteria && criteriaGroup.Criteria.length > 0) {
      let criteriaHtml = ``
      criteriaGroup.Criteria.map((criteria) => {
        let _uuidv4 = window.location.uuidv4()
        let htmlSelectionCriteria = ``
        if (criteria.SelectionCriteria.length > 0) {
          criteria.SelectionCriteria.map((el) => {
            htmlSelectionCriteria += `<option data-point="${el.score}" value="${el.id}">${el.name + ': ' + (el.score)}</option>`
          })
        }
        htmlSelectionCriteria += `<option data-point="0" value="not_enough_infor">Không đủ thông tin để chấm</option>`
        criteriaHtml += `
                <div class="form-group">
                    <label class="col-sm-10 form-check-label mt-4">${criteria.name}<span class="text-danger">(*)</span></label>
                    <select class="form-control selectpicker pl-2 criteria criteriaGroup-${criteriaGroup.id}"
                        required name="criteriaGroup-${_uuidv4}" title="Chọn" data-criteriaId="${criteria.id}">
                        ${htmlSelectionCriteria}
                    </select>
                </div>`
        pointCriteria += parseInt(criteria.scoreMax)
        totalPoint += parseInt(criteria.scoreMax)
      })
      // giao diện từng tiêu chí của mỗi Nhóm tiêu chí
      navTabContent = `<div class="tab-pane fade mb-4 ${index == 0 ? "show active" : ""}" id="tab-criteria-group-${uuidv4}" role="tabpanel" aria-labelledby="custom-tabs-three-home-tab">
                                ${criteriaHtml}
                            </div>`
    }
    // tạo thanh nav cho Nhóm tiêu chí
    navHTML += `<li class="nav-item border-bottom">
                        <a class="nav-link nav-criteria-group group-${criteriaGroup.id} ${index == 0 ? "active" : ""}" data-toggle="pill" href="#tab-criteria-group-${uuidv4}" role="tab" 
                        aria-controls="tab-score-script-script" data-point="${pointCriteria}" aria-selected="false">${criteriaGroup.name}</a>
                    </li>`
    optionIdCriteriaGroup += `<option value="${criteriaGroup.id}">${criteriaGroup.name}</option>`
    $('.tab-content').append(navTabContent)

  })

  $('#idCriteriaGroup').html(optionIdCriteriaGroup)
  console.log('resultCallRating', resultCallRating)
  console.log('resultCallRatingNote', resultCallRatingNote)

  // xử lí dữ liệu cho phần ghi chú chấm điểm
  if (resultCallRating && resultCallRating.length > 0) {
    //ưu tiên hiển thị ở màn tạo mới 
    let dataPriority
    dataPriority = resultCallRatingNote.find(el => el.createdByForm == CreatedByForm.ADD)
    if (!dataPriority) dataPriority = resultCallRatingNote[0]

    const { idCriteriaGroup, description, timeNoteMinutes, timeNoteSecond } = dataPriority || {}

    $('.titlePopupCallSource').text('Sửa chấm điểm cuộc gọi:')
    $('#idCriteriaGroup').val(idCriteriaGroup == null ? 0 : idCriteriaGroup)
    $('#idCriteria').html(`<option>${dataPriority && dataPriority.criteria && dataPriority.criteria.name ? dataPriority.criteria.name : ''}</option>`)
    $('#description').val(description)
    $('#timeNoteMinutes').val(timeNoteMinutes)
    $('#timeNoteSecond').val(timeNoteSecond)

    showDisableElement(true)
    $("#btn-save-modal").attr('method', 'edit')
    $(".countValueLength").text(description && description.length + "/500")
  } else {
    $('.titlePopupCallSource').text('Tạo chấm điểm cuộc gọi:')
    $('#idCriteria').val("")
    $('#idCriteriaGroup').val('0')

    $('#progress-scoreCriteria').html('')
    $('.nameCriteriaGroup').text('')
    $('.scoreCriteria').text('')

    showDisableElement(false)
    $("#btn-save-modal").attr('method', 'add')
    $('#idCriteria').prop("disabled", true)
    $('.scoreScript').text(`Tổng điểm: 0/${totalPoint} - 0%`)
  }

  // xử lí dữ liệu cho phần kịch bản và tính tổng điểm
  $('.selectpicker').selectpicker('refresh')
  $('.nav-scoreScript').html(navHTML)
  $('#progress-scoreScript').html('')
  let resultPointCriteria = 0
  if (resultCallRating) {
    resultCallRating.map((el) => {
      // tìm các mục tiêu có id tương ứng và cộng điểm
      resultPointCriteria += parseInt($(`.selectpicker.criteria option[value="${el.idSelectionCriteria}"]`).attr('data-point'))
      //gán giá trị cho ô select
      $(`select[data-criteriaId='${el.idCriteria}']`).val(el.idSelectionCriteria)
    })

    criteriaGroups.map((criteriaGroup) => {
      let resultPointCriteriaGroup = 0
      resultCallRating.map((el) => {
        let point = $(`.selectpicker.criteriaGroup-${criteriaGroup.id} option[value="${el.idSelectionCriteria}"]`).attr('data-point')
        resultPointCriteriaGroup += point ? parseInt(point) : 0
      })
      $(`.nav-link.nav-criteria-group.group-${criteriaGroup.id}`).attr('resultPointCriteriaGroup', resultPointCriteriaGroup)
    })

    // phần trăm điểm
    var perc = ((resultPointCriteria / totalPoint) * 100).toFixed(0)
    // gán phần trăm điểm
    let html = `
        <div class="progress-bar" role="progressbar" style="width: ${perc}%;" aria-valuenow="${perc}" aria-valuemin="0"
        aria-valuemax="100">Hoàn thành ${perc}%</div>`
    $('#progress-scoreScript').html(html)
    $('.scoreScript').text(`Tổng điểm: ${resultPointCriteria}/${totalPoint} - ${perc}%`)
  }
  // hiển thị điểm của mục tiêu đầu tiên
  let $firstElm = $(`.nav-link.nav-criteria-group.group-${criteriaGroups[0].id}`)
  $('.nameCriteriaGroup').text($firstElm.text())
  if ($firstElm.attr('resultPointCriteriaGroup') || $firstElm.attr('resultPointCriteriaGroup') == 0) {
    let point = $firstElm.attr('resultPointCriteriaGroup')

    let total = $firstElm.attr('data-point')
    var perc = ((point / total) * 100).toFixed(0)
    let html = `<div class="progress-bar" role="progressbar" style="width: ${perc}%;" aria-valuenow="${perc}" aria-valuemin="0" aria-valuemax="100">Hoàn thành ${perc}%</div>`
    $('#progress-scoreCriteria').html(html)
    $('.scoreCriteria').text(`Tổng điểm: ${point}/${total} - ${perc}%`)

  } else {
    $('#progress-scoreCriteria').html('')
    $('.scoreCriteria').text(`Tổng điểm: 0/${$firstElm.attr('data-point')} - 0%`)
  }

  $('.selectpicker').selectpicker('refresh')
}

function showDisableElement(check) {
  $('#idCriteriaGroup').prop('disabled', check)
  $('#idCriteria').prop('disabled', check)
  $('#timeNoteMinutes').prop('disabled', check)
  $('#timeNoteSecond').prop('disabled', check)
  $('#description').prop('disabled', check)
  return
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

function findData(page, exportExcel, queryData) {
  if (page) queryData.page = page
  queryData.limit = $('.sl-limit-page').val() || 10

  if (exportExcel) queryData.exportExcel = 1

  $('.page-loader').show()

  $.ajax({
    type: 'GET',
    url: '/recording/list?' + $.param(queryData),
    cache: 'false',
    success: function (result) {
      console.log('result: ', result)

      $('.page-loader').hide()

      $modalSearch.modal('hide')

      if (exportExcel) {
        return downloadFromUrl(result.linkFile)
      }
      CACHE_CONFIG_COLUMN = result.ConfigurationColums
      // debugger
      createTable(result.data, result.ConfigurationColums, queryData)
      return $('#paging_table').html(window.location.CreatePaging(result.paginator))

    },
    error: function (error) {
      $('.page-loader').hide()
      console.log(error)
      return toastr.error(error.responseJSON.message)
    },
  })
}

function itemColumn(key, title, value) {
  // debugger;
  return `<li class="mb-3 border-bottom ${key == 'callId' ? "unsortable" : ""}">
            <input class="form-check-input" type="checkbox" name="${key}" ${key == 'callId' ? 'disabled' : ''} ${key == 'callId' || value == 'true' ? 'checked' : ''}/>
            ${title}
            <span style="float: right;">
              <i class="fas fa-arrows-alt" title="Giữ kéo/thả để sắp xếp"></i>
            </span>
          </li>`
}
/**
 *  
 * @param {*} ConfigurationColums 
 * @param {*} init nếu là true: lần khởi tạo đầu tiên nếu không có column
 */
function renderPopupCustomColumn(ConfigurationColums, init = false) {
  let popupHtml = ''
  for (const [key, value] of Object.entries(ConfigurationColums)) {
    popupHtml += itemColumn(key, headerDefault[key], (init == true && key != "sourceName") ? 'true' : value)
  }
  let columnNotTick = _.difference(Object.keys(headerDefault), Object.keys(ConfigurationColums))
  columnNotTick.forEach(i => {
    popupHtml += itemColumn(i, headerDefault[i], false)
  })

  $('#sortable').html(popupHtml)

}

function renderHeaderTable(ConfigurationColums, queryData, init = false) {
  let headerTable = ''
  // debugger
  for (const [key, value] of Object.entries(ConfigurationColums)) {
    let sorting = (key == 'duration' ? 'sorting' : '')
    if (queryData.sort && queryData.sort.sort_by == key) {
      sorting += ` sorting_${queryData.sort.sort_type.toLowerCase()}`
    }
    headerTable += `<th class="text-center sortHeader ${key != "callId" ? key : ""} ${(value == 'true' || (init == true && key != "sourceName")) ? '' : 'd-none'} 
                      ${key == "callId" || key == "action" ? "tableFixColumn" : ""} 
                      ${key == "callId" ? "first-col" : ""} 
                      ${key == "action" ? "second-col" : ""} 
                      ${sorting}" id-sort="${key}">
                        ${headerDefault[key]}
                    </th>`
  }
  $('#tableRecording thead tr').html(headerTable)

}

function createTable(data, ConfigurationColums, queryData) {
  let html = ''

  if (ConfigurationColums) {
    let objColums = { ...ConfigurationColums }
    renderPopupCustomColumn(ConfigurationColums)
    renderHeaderTable(ConfigurationColums, queryData)

    // body data
    data.forEach((item, element) => {
      let audioHtml = ''
      let agentName = item.fullName && `${item.fullName} (${item.userName})` || ''
      let uuidv4 = window.location.uuidv4()

      if (item.recordingFileName && item.recordingFileName !== '') {
        audioHtml = `
        <td class="text-center audioHtml">
          <audio controls preload="none" class="audio-element">
            <source  src="${item.recordingFileName}" type="audio/wav">
            Your user agent does not support the HTML5 Audio element.'
          </audio>
        </td>
        `
      }
      let tdTable = ''
      for (const [key, value] of Object.entries(objColums)) {
        if (key == 'audioHtml' && value == 'true') {
          tdTable += audioHtml
        } else if (key == 'agentName' && value == 'true') {
          tdTable += ` <td class="text-center agentName">${agentName}</td>`
        } else if (key == 'callId' && (item[key] || item['xmlCdrId'])) {
          tdTable += ` <th class="text-center tableFixColumn first-col"> <div>${item[key] || item['xmlCdrId']}</div> </th>`
        } else if (key == 'action') {
          tdTable += ` <th class="text-center ${key} tableFixColumn second-col">
                            <i class="fas fa-play-circle mr-2" title="Xem chi tiết ghi âm" url-record="${item.recordingFileName}" data-callid="${item.callId}"></i>

                            <div class="btn-group">
                              <i class="fas fa-check mr-2" title="Chấm điểm" id="dropdownMenuAdvanced-${uuidv4}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
                                <div class="dropdown-menu menuDropDownAdvancedCss1" aria-labelledby="dropdownMenuAdvanced-${uuidv4}">
                                    ${genDropDownList(item.callId, item.recordingFileName, item.ScoreTarget_ScoreScript, item.isMark)}
                                </div>
                            </div>
                            
                            <div class="btn-group">
                              <i class="fas fa-ellipsis-v" id="dropdownMenuAdvanced-${uuidv4}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
                                <div class="dropdown-menu menuDropDownAdvancedCss2" aria-labelledby="dropdownMenuAdvanced-${uuidv4}">
                                  <a class="dropdown-item showCallScore" data-isMark = ${item.isMark ? item.isMark : false} data-id = ${item.idScoreScript} url-record="${item.recordingFileName}" data-callid="${item.callId}">Sửa chấm điểm</a>
                                  <a class="dropdown-item commentCallScore" url-record="${item.recordingFileName}" data-callid="${item.callId}">Ghi chú chấm điểm</a>
                                  <a class="dropdown-item historyCallScore" data-callid="${item.callId}">Xem lịch sử chấm điểm</a>
                                </div>
                            </div>
                       </th>`
        } else if (key == 'groupName') {
          tdTable += ` <td class="text-center"> <div>${genGroupOfAgent(item['groupName'])}</div> </td>`
        } else {
          tdTable += ` <td class="text-center ${key} ${value == 'true' ? '' : 'd-none'}">${item[key] || ''}</td>`
        }
      }
      html += `
      <tr data-ele="${element}">
        ${tdTable}
      </tr>
      `
    })
    $tableData.html(html)
    return
  } else {
    data.forEach((item, element) => {
      let audioHtml = ''
      let agentName = item.fullName && `${item.fullName} (${item.userName})` || ''
      let uuidv4 = window.location.uuidv4()

      if (item.recordingFileName && item.recordingFileName !== '') {
        audioHtml = `
          <audio controls preload="none" class="audio-element">
            <source  src="${item.recordingFileName}" type="audio/wav">
            Your user agent does not support the HTML5 Audio element.'
          </audio>
        `
      }

      let tdTable = ''
      Object.keys(headerDefault).forEach((key) => {
        if (key != "sourceName") {
          if (key == 'audioHtml') {
            tdTable += `<td class="text-center audioHtml">${audioHtml}</td>`
          } else if (key == 'agentName') {
            tdTable += ` <td class="text-center agentName">${agentName}</td>`
          } else if (key == 'callId' && (item[key] || item['xmlCdrId'])) {
            tdTable += ` <th class="text-center tableFixColumn first-col"> <div>${item[key] || item['xmlCdrId']}</div> </th>`
          } else if (key == 'action') {
            tdTable += ` <th class="text-center ${key} tableFixColumn second-col">
                            <i class="fas fa-play-circle mr-2" title="Xem chi tiết ghi âm" url-record="${item.recordingFileName}" data-callid="${item.callId}"></i>

                            <div class="btn-group">
                              <i class="fas fa-check mr-2" title="Chấm điểm" id="dropdownMenuAdvanced-${uuidv4}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
                                <div class="dropdown-menu menuDropDownAdvancedCss1" aria-labelledby="dropdownMenuAdvanced-${uuidv4}">
                                    ${genDropDownList(item.callId, item.recordingFileName, item.ScoreTarget_ScoreScript, item.isMark)}
                                </div>
                            </div>
                            
                            <div class="btn-group">
                              <i class="fas fa-ellipsis-v" id="dropdownMenuAdvanced-${uuidv4}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
                                <div class="dropdown-menu menuDropDownAdvancedCss2" aria-labelledby="dropdownMenuAdvanced-${uuidv4}">
                                  <a class="dropdown-item showCallScore" data-isMark = ${item.isMark ? item.isMark : false} data-id = ${item.idScoreScript} url-record="${item.recordingFileName}" data-callid="${item.callId}">Sửa chấm điểm</a>
                                  <a class="dropdown-item commentCallScore" url-record="${item.recordingFileName}" data-callid="${item.callId}">Ghi chú chấm điểm</a>
                                  <a class="dropdown-item historyCallScore" data-callid="${item.callId}">Xem lịch sử chấm điểm</a>
                                </div>
                            </div>
                       </th>`
          } else if (key == 'groupName') {
            tdTable += ` <td class="text-center"> <div>${genGroupOfAgent(item['groupName'])}</div> </td>`
          } else {
            tdTable += ` <td class="text-center ${key}">${item[key] || ''}</td>`
          }
        }
      })

      html += `
      <tr data-ele="${element}">
        ${tdTable}
      </tr>`
    })

    $tableData.html(html)
    return
  }
}

function genDropDownList(callId, recordingFileName, ScoreTarget_ScoreScript, isMark) {
  let dropdown = ''
  if (isMark == true) {
    dropdown += `<a class="dropdown-item" >Cuộc gọi đã được chấm điểm !</a>`
  } else {
    ScoreTarget_ScoreScript.map((el) => {
      if (el.scoreScriptInfo) {
        dropdown += `<a class="dropdown-item showCallScore" data-callId="${callId}" 
                    url-record="${recordingFileName}" data-id="${el.scoreScriptId}">${el.scoreScriptInfo && el.scoreScriptInfo.name ? el.scoreScriptInfo.name : ''}
                </a>`
      } else {
        dropdown += `<a class="dropdown-item showCallScore" data-callId="${callId}" 
                    url-record="${recordingFileName}" data-id="${el.id}">${el.name ? el.name : ''}
                </a>`
      }
    })
  }

  return dropdown
}

function downloadFromUrl(url) {
  let link = document.createElement('a')

  link.download = ''
  link.href = url

  return link.click()
}

function genGroupOfAgent(groupName) {
  groupName ? groupName = groupName.split(',') : []

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

$(function () {

  $('#popup_startTime').datetimepicker({
    format: 'DD/MM/YYYY',
    icons: { time: 'far fa-clock' }
  })

  $('#popup_endTime').datetimepicker({
    format: 'DD/MM/YYYY',
    icons: { time: 'far fa-clock' }
  })

  $(".defaultPlaySpeed").text("Chuẩn")

  bindClick()

  if (localStorage.getItem('modalData')) {
    let page = 1
    let modalData = JSON.parse(localStorage.getItem('modalData'))

    searchType = ADVANCED_SEARCH

    Object.keys(modalData).forEach(function (key) {
      console.log(`key: ${key}`, modalData[key])
      $(`#val_${key}`).val(modalData[key])
      if ($(`#${key}`).length > 0) {
        console.log(moment(modalData[key], 'DD/MM/YYYY')._d)

        $(`#${key}`).datetimepicker({
          format: 'DD/MM/YYYY',
          defaultDate: moment(modalData[key], 'DD/MM/YYYY')._d,
          icons: { time: 'far fa-clock' }
        })
      }
    })

    $('.selectpickerAdvanced').selectpicker('refresh')

    findData(page, null, modalData)
  } else {
    $('#startTime').datetimepicker({
      format: 'DD/MM/YYYY',
      defaultDate: new Date(),
      icons: { time: 'far fa-clock' }
    })

    $('#endTime').datetimepicker({
      format: 'DD/MM/YYYY',
      defaultDate: new Date(),
      icons: { time: 'far fa-clock' }
    })

    let page = 1
    let formData = getFormData('form_search')

    searchType = DEFAULT_SEARCH

    findData(page, null, formData)
  }
})

$(window).on('beforeunload', function () {
  $buttonSearch.off('click')
  $buttonAdvancedSearch.off('click')
  $buttonExportExcel.off('click')
  $buttonCancelModal.off('click')
  $buttonClearFilter.off('click')
  $resetColumnCustom.off('click')
  $(document).off('click', '.sorting')
  $(document).off('click', '.zpaging')
  $(document).off('click', '.fa-play-circle')
  $(document).off('click', '.controls .btn')
  $(document).off('click', '#downloadFile')
  $(document).off('change', '.sl-limit-page')
  $(document).off('change', '#idCriteriaGroupComment')
  $(document).off('click', '.commentCallScore')
  $(document).off('click', '#btn-add-comment')
  $(document).off('click', '.showCallScore')
  $(document).off('click', '#btn-save-modal')
  $(document).off('click', '.historyCallScore')
  $(document).off('change', '#idCriteriaGroup')
  $(document).off('click', '.dropdown-item')

})