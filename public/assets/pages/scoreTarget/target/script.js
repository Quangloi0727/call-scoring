
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
    renOption()
    return
  })

  // remove nội dung của row
  $(document).on('click', '.btn-remove-row', function () {
    $(this).parent().parent().remove()
  })

  $(document).on('change', '.conditionsData', function (e) {
    e.stopImmediatePropagation()

    // check giá trị của field Đánh giá theo đối tượng để show thông báo
    let ratingBy = $('#ratingBy').val()
    checkConditionData($(this), ratingBy)


    let check = Object.keys(CONST_DATA).find(key => key == $(this).val())
    let uuidv4 = e.target.id.split("conditionsData-")

    if (check && CONST_DATA[$(this).val()].disable == 'true') {
      console.log($(`#conditionsLogic-${uuidv4[1]}`).val())
      $(`#conditionsLogic-${uuidv4[1]}`).prop('disabled', true)
      $(`#conditionsLogic-${uuidv4[1]}`).val("")
      return $('.selectpicker').selectpicker('refresh')
    }

    $(`#conditionsLogic-${uuidv4[1]}`).prop('disabled', false)
    return $('.selectpicker').selectpicker('refresh')
  })

  $(document).on('change', '.conditionsLogic', function (e) {
    e.stopImmediatePropagation()
    console.log($(this).val())
    return
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

function renOption(isSelected) {
  let dataOption = ``
  let option2 = ``

  for (const [key, value] of Object.entries(CONST_DATA)) {
    dataOption += `<option value="${key}" ${(isSelected && isSelected == isSelected.data) ? 'selected' : ''}>${value.t}</option>`
  }

  for (const [key, value] of Object.entries(CONST_COND)) {
    option2 += `<option value="${key}" ${(isSelected && isSelected == isSelected.cond) ? 'selected' : ''}>${value.t}</option>`
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
        <input class="form-control conditionsValue input" id="conditionsValue-${indexTarget}" 
        value="${(isSelected && isSelected.value) ? isSelected.value : ''}" name="conditionsValue">
    </div>
    <div class="col-sm-3">
      <a type="button" class="btn-remove-row text-danger">
        <i class="fas fa-times mt-2" style="font-size: 1.5rem;"></i>
      </a>
    </div>
  </div>`

  $('.row-conditions').append(html)
  $('.selectpicker').selectpicker('refresh')
  return html
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
  console.log(ScoreTarget)
  // if (ScoreTarget) {
  //   _.chain($(`#form_target_general .input`)).reduce(function (memo, el) {
  //     $(`#form_target_general .input name['${el.name}']`).val(ScoreTarget[`${el.name}`])

  //     // console.log(ScoreTarget[`${memo[el.name]}`])
  //   })
  // }
  for (const [key, value] of Object.entries(ScoreTarget[0])) {
    $(`#${key}`).val(value)

  }
  ScoreTarget.map((el) => {
    renOption(el.ScoreTargetCond)
  })

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

})