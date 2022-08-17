
const $form_target_general = $('#form_target_general')

function bindClick() {

  $(document).on("click", "#btn_cancel_scoreTarget", function (e) {
    window.location.href = "/scoreTarget"
  })

  $(document).on("click", "#btn_assignment_scoreTarget", function (e) {
    $('#modal_assignment_scoreTarget').modal({ show: true })
    $('#listBoxAssignment').bootstrapDualListbox({
      moveOnSelect: false,
    })
    CustomizeDuallistbox('listBoxAssignment')
  })

  $(document).on("change", "#status", function (e) {
    const val = $(this).val()
    if (val == 1) {
      $('#activeScoreTarget').modal({ show: true })
      $('#confirmActiveScoreTarget').attr('data-val', val)
    }
    if (val == 2) {
      $('#unActiveScoreTarget').modal({ show: true })
      $('#confirmUnActiveScoreTarget').attr('data-val', val)
    }
  })

  $(document).on("click", "#confirmActiveScoreTarget", function (e) {
    const id = $(this).attr('data-id')
    const val = $(this).attr('data-val')
    _AjaxData('/scoreTarget/' + id + '/updateStatus', 'PUT', JSON.stringify({ status: val }), { contentType: "application/json" }, function (resp) {
      if (resp.code != 200) {
        $('#activeScoreTarget').modal('hide')
        toastr.error(resp.message)
        return setTimeout(() => {
          location.reload()
        }, 2500)
      }

      $('#activeScoreTarget').modal('hide')
      toastr.success('Lưu thành công !')
      return setTimeout(() => {
        location.reload()
      }, 2500)
    })
  })

  $(document).on("click", "#confirmUnActiveScoreTarget", function (e) {
    const id = $(this).attr('data-id')
    const val = $(this).attr('data-val')
    _AjaxData('/scoreTarget/' + id + '/updateStatus', 'PUT', JSON.stringify({ status: val }), { contentType: "application/json" }, function (resp) {
      if (resp.code != 200) {
        $('#unActiveScoreTarget').modal('hide')
        toastr.error(resp.message)
        return setTimeout(() => {
          location.reload()
        }, 2500)
      }

      $('#unActiveScoreTarget').modal('hide')
      toastr.success('Lưu thành công !')
      return setTimeout(() => {
        location.reload()
      }, 2500)
    })
  })

  // xử lí sự kiện khi clich để chọn thời gian áp dụng cho cuộc gọi
  $('input[name="callTime"]').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'))
  })

  $('input[name="callTime"]').on('cancel.daterangepicker', function (ev, picker) {
    $(this).val('')
  })

  // xử lí sự kiện khi chọn khoảng thời gian hiệu lực
  $('input:text[name="effectiveTime"]').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'))
  })

  $('input:text[name="effectiveTime"]').on('cancel.daterangepicker', function (ev, picker) {
    $(this).val('')
  })

  // chọn loại thời gian hiệu lực, show các input tương ứng
  $(document).on('change', '#effectiveTimeType', function () {
    let data = $(this).val()
    if (data == 4) {
      $('.effectiveTimeRange').removeClass('d-none')
      $('.effectiveTimeStart').addClass('d-none')
      return
    }
    $('.effectiveTimeRange').addClass('d-none')
    $('.effectiveTimeStart').removeClass('d-none')
    return
  })

  //btn thêm điều kiện ở tap chung
  $(document).on('click', '#btn-add-conditions', function () {
    let dataDefault = {}
    dataDefault.data = 'caller'
    dataDefault.cond = 'contains'
    return renOption(dataDefault)
  })

  // remove nội dung của row
  $(document).on('click', '.btn-remove-row', function () {
    $(this).parent().parent().remove()
  })

  // validate ô input "Dữ liệu"
  $(document).on('change', '.conditionsData', function (e) {
    e.stopImmediatePropagation()

    // check giá trị của field "Đánh giá theo đối tượng" để show thông báo
    let ratingBy = $('#ratingBy').val()
    checkConditionData($(this), ratingBy)

    let conditionsData = $(this).val()

    let check = Object.keys(CONST_DATA).find(key => key == conditionsData)
    let uuidv4 = e.target.id.split("conditionsData-")

    if (check && CONST_DATA[$(this).val()].disable == 'true') {

      // disabled ô chọn điều kiện
      $(`#conditionsLogic-${uuidv4[1]}`).prop('disabled', true)
      $(`#conditionsLogic-${uuidv4[1]}`).val("")

      // render o input "Giá trị" (value) cho phù hợp với ô input "Dữ liệu"
      let option = optionConditionValue(conditionsData)
      $(`#select-conditionsValue-${uuidv4[1]}`).html(option)
      $(`#select-conditionsValue-${uuidv4[1]}`).selectpicker('show')
      $(`#conditionsValue-${uuidv4[1]}`).addClass('d-none')
      return $('.selectpicker').selectpicker('refresh')

    }
    $(`#select-conditionsValue-${uuidv4[1]}`).selectpicker('hide')
    $(`#conditionsValue-${uuidv4[1]}`).val("")
    $(`#conditionsValue-${uuidv4[1]}`).removeClass('d-none')

    $(`#conditionsLogic-${uuidv4[1]}`).prop('disabled', false)
    return $('.selectpicker').selectpicker('refresh')
  })

  $(document).on('change', '.conditionsLogic', function (e) {
    e.stopImmediatePropagation()
    console.log($(this).val())
    return
  })
  $(document).on('change', '.select-conditionsValue', function (e) {
    e.stopImmediatePropagation()
    let uuidv4 = e.target.id.split("select-")
    return $(`#${uuidv4[1]}`).val($(this).val())
  })

  $(document).on('click', '#btn-add-keyword-set', function (e) {
    return renKeywordSet()
  })
  $(document).on('click', '.nav-link', function (e) {
    if ($(this).attr('id') == 'tab-score-target-auto-tab') {
      $('.btn-add-row-target-auto').removeClass('d-none')
    } else $('.btn-add-row-target-auto').addClass('d-none')
  })

}

function CustomizeDuallistbox(listboxID) {
  var customSettings = $('#' + listboxID).bootstrapDualListbox('getContainer')
  var buttons = customSettings.find('.btn.moveall, .btn.move, .btn.remove, .btn.removeall')

  if (customSettings.find('.customButtonBox').length == 0) {
    customSettings.find('.box1, .box2').removeClass('col-md-6').addClass('col-md-5')
    customSettings.find('.box1').after('<div class="customButtonBox col-md-2 text-center"></div>')
    customSettings.find('.customButtonBox').append(buttons)
  }

  customSettings.find('.btn-group.buttons').remove()
}

function resetAssignTime() {
  $("#assignStart").val("00:00:00")
  $("#assignEnd").val("23:59:59")
}

function saveData(formData, method) {
  $.ajax({
    type: `${method}`,
    url: '/scoreTarget',
    data: formData,
    cache: 'false',
    success: function (result) {
      toastr.success('Lưu thành công !')
      return setTimeout(() => {
        window.location.href = "/scoreTarget"
      }, 2500)
    },
    error: function (error) {
      if (error.responseJSON.message == window.location.MESSAGE_ERROR["QA-002"]) return $(".duplicateNameScoreTarget").removeClass('d-none')
      return toastr.error(error.responseJSON.message)
    },
  })
}

//hàm lấy dữ liệu theo ID form
function getFormData(formId) {
  let data = {}

  data = _.chain($(`#${formId} .input`)).reduce(function (memo, el) {
    let value = $(el).val()
    if (value != '' && value != null) memo[el.name] = value
    return memo
  }, {}).value()

  return data
}

// hàm lấy dữ liệu Điều kiện ở tap chung
function getArrCond(conditionSearch) {

  let conditionsLogic = []
  $("select[name='conditionsLogic']").each(function (i) {
    conditionsLogic.push($(this).val())
  })

  let conditionsData = []
  $("select[name='conditionsData']").each(function () {
    conditionsData.push($(this).val())
  })

  let conditionsValue = []
  $("input[name='conditionsValue']").each(function () {
    conditionsValue.push($(this).val())
  })
  // map các dữ liệu thành mảng
  let arr = []
  conditionsLogic.map((el, i) => {
    arr.push({
      conditionSearch: conditionSearch,
      data: conditionsData[i],
      cond: el,
      value: conditionsValue[i]
    })
  })
  return arr
}

// hàm lấy dữ liệu ở tap tự độngs
function getTargetAutoData() {
  // handle dữ liệu cho tap mục tiêu tự động
  let nameTargetAuto = []
  let uuidv4 = []
  $("input[name='nameTargetAuto']").each(function () {
    nameTargetAuto.push($(this).val())
    uuidv4.push($(this).attr('uuidv4'))
  })

  let point = []
  $("input[name='point']").each(function () {
    point.push($(this).val())
  })

  let falsePoint = []
  $("input[name='falsePoint']").each(function () {
    falsePoint.push($(this).is(":checked"))
  })
  //map các arr thành bản ghi để dễ dàng khi lưu
  let arr = []
  nameTargetAuto.map((el, i) => {
    let keyword = []
    $(`input[uuidv4='${uuidv4[i]}'][name="keyword"]`).each(function () {
      keyword.push({ keyword: $(this).val() })
    })
    arr.push({
      nameTargetAuto: el,
      point: point[i],
      falsePoint: falsePoint[i],
      keyword: keyword
    })
  })
  return arr
}

// render các option ở tap chung
function renOption(data) {
  let dataOption = ``
  let logicOption = ``
  for (const [key, value] of Object.entries(CONST_DATA)) {
    dataOption += `<option value="${key}" ${(data && key == data.data) ? 'selected' : ''}>${value.t}</option>`
  }

  for (const [key, value] of Object.entries(CONST_COND)) {
    logicOption += `<option value="${key}" ${(data && key == data.cond) ? 'selected' : ''}>${value.t}</option>`
  }

  const indexTarget = window.location.uuidv4()
  let valueOption = ``
  if (data) {
    valueOption = optionConditionValue(data.data, indexTarget)
  }
  let html = `
  <div class="form-group row">
    <div class="col-sm-3">
        <select class="form-control input selectpicker conditionsData" title="Chọn" id="conditionsData-${indexTarget}" 
        name="conditionsData" data-live-search="true">
          ${dataOption}
        </select>
    </div>
    <div class="col-sm-3 column">
        <select class="form-control input selectpicker conditionsLogic" title="Chọn" id="conditionsLogic-${indexTarget}" 
            name="conditionsLogic" data-live-search="true">
            ${logicOption}
        </select>
    </div>
    <div class="col-sm-3">
        <select class="form-control selectpicker select-conditionsValue" title="Chọn" id="select-conditionsValue-${indexTarget}" 
          name="conditionsValue" data-live-search="true">
          ${valueOption}
        </select>
        <input class="form-control conditionsValue input ${valueOption ? 'd-none' : ''}" id="conditionsValue-${indexTarget}" 
        value="${(data && data.value) ? data.value : ''}" name="conditionsValue">
    </div>
    <div class="col-sm-3">
      <a type="button" class="btn-remove-row text-danger">
        <i class="fas fa-times mt-2" style="font-size: 1.5rem;"></i>
      </a>
    </div>
  </div>`

  $('.row-conditions').append(html)
  $('.selectpicker').selectpicker('refresh')

  // check xem select "Giá trị" có render option hay ko nếu có thì ẩn ô input giá trị đi
  // và ngược lại
  if (!valueOption) {
    $(`#select-conditionsValue-${indexTarget}`).selectpicker('hide')
  }
  if (data && data.value && valueOption) {
    // disabled ô chọn điều kiện
    $(`#conditionsLogic-${indexTarget}`).prop('disabled', true)
    $(`#conditionsLogic-${indexTarget}`).val("")
    $(`#select-conditionsValue-${indexTarget}`).val(data.value)
  }
  $('.selectpicker').selectpicker('refresh')
  return html
}

function optionConditionValue(conditionsData, uuidv4) {
  let option = ``
  if (conditionsData == 'agent') {
    _users.map((el) => {
      option += `
        <option value="${el.id}">${el.firstName + '' + el.lastName}</option>
      `
    })
  } else if (conditionsData == 'team') {
    _teams.map((el) => {
      option += `
        <option value="${el.id}">${el.name}</option>
      `
    })
  } else if (conditionsData == 'direction') {
    option += `
      <option value="inbound">inbound</option>
      <option value="outbound">outbound</option>
    `
  } else if (conditionsData == 'group') {
    _groups.map((el) => {
      option += `
        <option value="${el.id}">${el.name}</option>
      `
    })
  }
  return option
}

function checkConditionData(element, ratingBy) {
  if (element.val() == 'agent' && ratingBy == '1') {
    element.val("caller")
    toastr.error(`Không được chọn dữ liệu là "Điện thoại viên" vì Đối tượng xét là "Đội ngũ"`)
  }
  if (element.val() == 'team' && ratingBy == '0') {
    element.val("caller")
    toastr.error(`Không được chọn dữ liệu là "Đội ngũ" vì Đối tượng xét là "Điện thoại viên"`)
  }
  return $('.selectpicker').selectpicker('refresh')
}

const form_target_general = $form_target_general.validate({

  rules: {
    description: {
      maxlength: 500
    },
    name: {
      required: true,
      maxlength: 100
    },
    numberOfCall: {
      digits: true
    },
    nameTargetAuto: {
      required: true,
      maxlength: 500
    },
    point: {
      required: true,
      maxlength: 5,
      digits: true
    },
    keyword: {
      required: true,
      maxlength: 1000,
    }
  },
  messages: {
    description: {
      maxlength: 'Độ dài không quá 500 kí tự'
    },
    name: {
      required: "Không được bỏ trống",
      maxlength: "Độ dài không được quá 100 kí tự"
    },
    numberOfCall: {
      digits: "Chỉ nhận giá trị số nguyên (>= 0)"
    },
    nameTargetAuto: {
      required: "Không được bỏ trống",
      maxlength: "Độ dài không được quá 500 kí tự"
    },
    point: {
      required: "Không được bỏ trống",
      maxlength: "Giá trị tối đa là 99999",
      digits: "Chỉ nhận giá trị số nguyên (>= 0)"
    },
    keyword: {
      required: "Không được bỏ trống",
      maxlength: "Độ dài không được quá 1000 kí tự",
    },
  },
  ignore: ":hidden",
  errorElement: 'span',
  errorPlacement: function (error, element) {
    error.addClass('invalid-feedback')
    element.closest('.form-group').append(error)
  },
  highlight: function (element, errorClass, validClass) {
    $(element).addClass('is-invalid')
  },
  unhighlight: function (element, errorClass, validClass) {
    $(element).removeClass('is-invalid')
  },
  submitHandler: function (form) {

    // lấy giá trị cho tap chung
    let formData = getFormData('form_target_general')

    // lấy dữ liệu Điều kiện ở tap chung
    let arrCond = getArrCond(formData.conditionSearch)
    formData.arrCond = arrCond

    let arrTargetAuto = getTargetAutoData()
    formData.arrTargetAuto = arrTargetAuto

    console.log(formData)
    if ($('#btn_save_scoreTarget').attr('data-id')) {
      formData['edit-id'] = $('#btn_save_scoreTarget').attr('data-id')
      saveData(formData, 'PUT')
      return console.log($('#btn_save_scoreTarget').attr('data-id'))
    }
    return saveData(formData, 'POST')
  }

})

$(function () {
  // set giá trị mặc định cho các input date
  $('input[name="callTime"]').daterangepicker({
    autoUpdateInput: false,
    locale: {
      cancelLabel: 'Clear'
    }
  })

  $('input[name="timeFor"]').daterangepicker({
    autoUpdateInput: false,
    locale: {
      cancelLabel: 'Clear'
    }
  })

  $('input:text[name="effectiveTime"]').daterangepicker({
    autoUpdateInput: false,
    locale: {
      cancelLabel: 'Clear'
    }
  })


  // render data khi ấn xem detail của từng tiêu chí
  // render của tap chung 
  if (ScoreTarget) {
    console.log(ScoreTarget)
    for (const [key, value] of Object.entries(ScoreTarget)) {
      $(`#${key}`).val(value)
      if (ScoreTarget.effectiveTimeStart && ScoreTarget.effectiveTimeType != 4) {
        $(`#effectiveTimeStart`).val(moment(ScoreTarget.effectiveTimeStart).format('YYYY-MM-DD'))
      } else if (ScoreTarget.effectiveTimeType == 4) {
        $('.effectiveTimeRange').removeClass('d-none')
        $('.effectiveTimeStart').addClass('d-none')
        $('#effectiveTime').daterangepicker({ startDate: moment(ScoreTarget.effectiveTimeStart).format('MM/DD/YYYY'), endDate: moment(ScoreTarget.effectiveTimeEnd).format('MM/DD/YYYY') })
      }
      if (ScoreTarget.callEndTime && ScoreTarget.callStartTime) {
        $('#callTime').daterangepicker({ startDate: moment(ScoreTarget.callStartTime).format('MM/DD/YYYY'), endDate: moment(ScoreTarget.callEndTime).format('MM/DD/YYYY') })
      }
    }

    //
    if (ScoreTarget_ScoreScript && ScoreTarget_ScoreScript.length > 0) {
      console.log(ScoreTarget_ScoreScript)
      let arr = []
      ScoreTarget_ScoreScript.map((el) => {
        arr.push(el.scoreScriptId)
      })
      $('#scoreScriptId').val(arr)
    }

    //render data của phần "Điều kiện"
    if (ScoreTargetCond && ScoreTargetCond.length > 0) {
      ScoreTargetCond.map((el) => {
        renOption(el)
      })
    }
  }

  bindClick()
  // $form_target_general.valid()
  resetAssignTime()
})

$(window).on('beforeunload', function () {

  $(document).off('click', 'input[name="timeFor"]')
  $(document).off('click', 'input:text[name="effectiveTime"]')
  $(document).off('change', '#effectiveTimeType')
  $(document).off('click', '#btn-add-conditions')
  $(document).off('click', '.btn-remove-row')
  $(document).off('change', '.conditionsData')
  $(document).off('change', '.conditionsLogic')
  $(document).off('click', '.conditionsData .dropdown-toggle')
  $(document).off('click', '#btn-add-keyword-set')
  $(document).off('click', '#btn_cancel_scoreTarget')
  $(document).off('change', '#status')
  $(document).off('click', '#confirmActiveScoreTarget')
  $(document).off('click', '#confirmUnActiveScoreTarget')
})