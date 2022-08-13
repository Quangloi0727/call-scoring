
const $form_target_general = $('#form_target_general')

function bindClick() {
  // xử lí sự kiện khi clich để chọn thời gian áp dụng cho cuộc gọi
  $('input[name="timeFor"]').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'))
  })

  $('input[name="timeFor"]').on('cancel.daterangepicker', function (ev, picker) {
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
    console.log(data)
    if (data == 4) {
      console.log("aaaaaaaaa")
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
    return renOption()
  })

  // remove nội dung của row
  $(document).on('click', '.btn-remove-row', function () {
    $(this).parent().parent().remove()
  })

  // validate ô input Dữ liệu của bộ  điều kiện lọc
  $(document).on('change', '.conditionsData', function (e) {
    e.stopImmediatePropagation()

    // check giá trị của field Đánh giá theo đối tượng để show thông báo
    let ratingBy = $('#ratingBy').val()
    checkConditionData($(this), ratingBy)


    let check = Object.keys(CONST_DATA).find(key => key == $(this).val())
    let uuidv4 = e.target.id.split("conditionsData-")

    if (check && CONST_DATA[$(this).val()].disable == 'true') {
      console.log($(`#conditionsLogic-${uuidv4[1]}`).val())
      // disabled ô chọn điều kiện
      $(`#conditionsLogic-${uuidv4[1]}`).prop('disabled', true)
      $(`#conditionsLogic-${uuidv4[1]}`).val("")

      // render o input nhập giá trị (value) cho phù hợp với kiểu dữ liệu
      let conditionsData = $(this).val()
      renderConditionValue(conditionsData, uuidv4[1])
      return
    }
    $(`#select-conditionsValue-${uuidv4[1]}`).selectpicker('hide')
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

      console.log(error)
      return toastr.error(error.responseJSON.message)
    },
  })
}

function getFormData(formId) {
  let data = {}

  data = _.chain($(`#${formId} .input`)).reduce(function (memo, el) {
    let value = $(el).val()
    if (value != '' && value != null) memo[el.name] = value
    return memo
  }, {}).value()

  return data
}

function renOption(data) {
  let dataOption = ``
  let option2 = ``
  console.log(data)
  for (const [key, value] of Object.entries(CONST_DATA)) {
    dataOption += `<option value="${key}" ${(data && data == data.data) ? 'selected' : ''}>${value.t}</option>`
  }

  for (const [key, value] of Object.entries(CONST_COND)) {
    option2 += `<option value="${key}" ${(data && data == data.cond) ? 'selected' : ''}>${value.t}</option>`
  }

  const indexTarget = window.location.uuidv4()
  let html = `
  <div class="form-group row">
    <div class="col-sm-3">
        <select class="form-control input selectpicker conditionsData" id="conditionsData-${indexTarget}" 
        name="conditionsData" data-live-search="true">
          ${dataOption}
        </select>
    </div>
    <div class="col-sm-3 column">
        <select class="form-control input selectpicker conditionsLogic" id="conditionsLogic-${indexTarget}" 
            name="conditionsLogic" data-live-search="true">
            ${option2}
        </select>
    </div>
    <div class="col-sm-3">
        <select class="form-control selectpicker select-conditionsValue" id="select-conditionsValue-${indexTarget}" 
          name="conditionsValue" data-live-search="true">
          ${option2}
        </select>
        <input class="form-control conditionsValue input" id="conditionsValue-${indexTarget}" 
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
  $(`#select-conditionsValue-${indexTarget}`).selectpicker('hide')
  return html
}

function renKeywordSet() {
  let input = ` <div class="col-12">
    <label style=" font-weight: normal;"> Bộ từ khóa
      <span class="text-danger">(*)</span>
    </label>
    <input type="text" class="form-control input" id="nameTargetAuto" name="nameTargetAuto">
  </div>`

  $('.row-keyword-set').append(input)
  return input
}

function renderConditionValue(conditionsData, uuidv4) {
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
    option = `
      <option value="inbound" ${data == 'outbound' ? '' : 'selected'}>inbound</option>
      <option value="outbound" ${data == 'outbound' ? 'selected' : ''}>outbound</option>
    `
  } else if (conditionsData == 'group') {
    _groups.map((el) => {
      option += `
        <option value="${el.id}">${el.name}</option>
      `
    })
  }

  $(`#select-conditionsValue-${uuidv4}`).html(option)
  $('.selectpicker').selectpicker('refresh')
  $(`#select-conditionsValue-${uuidv4}`).selectpicker('show')
  $(`#conditionsValue-${uuidv4}`).addClass('d-none')
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
    name: {
      required: true,
      maxlength: 100
    },
    description: {
      maxlength: 500
    }
  },
  messages: {
    description: {
      maxlength: 'Độ dài không quá 500 kí tự'
    },
    name: {
      required: "Không được bỏ trống",
      maxlength: "Độ dài không được quá 100 kí tự"
    }
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
    let formData = getFormData('form_target_general')

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
    let arr = []
    conditionsLogic.map((el, i) => {
      arr.push({
        conditionSearch: formData.conditionSearch,
        data: conditionsData[i],
        cond: el,
        value: conditionsValue[i]
      })
    })
    console.log(arr)
    formData.arrCond = arr
    console.log($('#btn_save_scoreTarget').attr('data-id'))
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


  if (ScoreTarget && ScoreTarget.length > 0) {
    for (const [key, value] of Object.entries(ScoreTarget[0])) {
      $(`#${key}`).val(value)

    }
    ScoreTarget.map((el) => {
      renOption(el.ScoreTargetCond)
    })
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

})