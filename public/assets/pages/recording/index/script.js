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
    let page = 1
    let formData = getFormData('form_search')

    console.log('formData: ', formData)
    if (formData.startTime) {
      $('[name="startTime"]').val(formData.startTime)
    }

    if (formData.endTime) {
      $('[name="endTime"]').val(formData.endTime)
    }
    searchType = DEFAULT_SEARCH

    return findData(page, null, formData)
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

    return
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
    headerTable += `<th class="text-center sortHeader ${key} ${(value == 'true' || (init == true && key != "sourceName")) ? '' : 'd-none'} 
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
          tdTable += ` <th class="text-center callId tableFixColumn first-col"> <div>${item[key] || item['xmlCdrId']}</div> </th>`
        } else if (key == 'action') {
          tdTable += ` <th class="text-center ${key} tableFixColumn second-col">
                            <i class="fas fa-play-circle mr-2" title="Xem chi tiết ghi âm" url-record="${item.recordingFileName}" data-callid="${item.callId}"></i>
                            <i class="fas fa-check mr-2" title="Chấm điểm"></i>
                            <i class="fas fa-ellipsis-v" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="menuDropDownAdvanced">
                                  <a class="dropdown-item" href="#">Sửa chấm điểm</a>
                                  <a class="dropdown-item" href="#">Ghi chú chấm điểm</a>
                                  <a class="dropdown-item" href="#">Xem lịch sửa chấm điểm</a>
                                </div>
                            </i>
                       </th>`
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
  }
  else {
    data.forEach((item, element) => {
      let audioHtml = ''
      let agentName = item.fullName && `${item.fullName} (${item.userName})` || ''

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
                            <i class="fas fa-play-circle mr-2" title="Xem chi tiết ghi âm"></i>
                            <i class="fas fa-check mr-2" title="Chấm điểm"></i>
                            <i class="fas fa-ellipsis-v" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="menuDropDownAdvanced">
                                  <a class="dropdown-item" href="#">Sửa chấm điểm</a>
                                  <a class="dropdown-item" href="#">Ghi chú chấm điểm</a>
                                  <a class="dropdown-item" href="#">Xem lịch sửa chấm điểm</a>
                                </div>
                            </i>
                         </th>`
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

function downloadFromUrl(url) {
  let link = document.createElement('a')

  link.download = ''
  link.href = url

  return link.click()
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
})