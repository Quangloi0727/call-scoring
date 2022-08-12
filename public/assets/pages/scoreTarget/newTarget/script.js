
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
    let option1 = ``
    let option2 = ``
    console.log(CONST_DATA, CONST_COND)
    for (const [key, value] of Object.entries(CONST_DATA)) {
      option1 += `<option value="${key}">${value.t}</option>`
    }

    for (const [key, value] of Object.entries(CONST_COND)) {
      option2 += `<option value="${key}">${value.t}</option>`
    }

    let html = `
      <div class="form-group row">
        <div class="col-sm-3">
            <select class="form-control input selectpicker conditionsData" name="conditionsData"
            data-live-search="true">
              ${option1}
            </select>
        </div>
        <div class="col-sm-3">
            <select class="form-control input selectpicker conditionsLogic" name="conditionsLogic"
                data-live-search="true">
                ${option2}
            </select>
        </div>
        <div class="col-sm-3">
            <input class="form-control  input" name="conditionsValue">
        </div>
        <div class="col-sm-3">
          <a type="button" class="btn-remove-row text-danger">
            <i class="fas fa-times mt-2" style="font-size: 1.5rem;"></i>
          </a>
        </div>
      </div>`
    $('.row-conditions').append(html)
    $('.selectpicker').selectpicker('refresh')
    return
  })

  // remove nội dung của row
  $(document).on('click', '.btn-remove-row', function () {
    $(this).parent().parent().remove()
  })


}

function resetAssignTime() {
  $("#assignStart").val("00:00:00")
  $("#assignEnd").val("23:59:59")
}

function saveData(formData) {
  $.ajax({
    type: 'POST',
    url: '/scoreTarget',
    data: formData,
    cache: 'false',
    success: function (result) {
      console.log('result: ', result)
      return toastr.success("oke")
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
    saveData(formData)
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
  let filter = _.chain($("#form_target_general .input"))
    .reduce(function (memo, el) {
      let value = $(el).val()
      if (value != "" && value != null) memo[el.name] = value
      return memo
    }, {})
    .value()


  console.log(filter)
  bindClick()
  // $form_target_general.valid()
  resetAssignTime()
})

$(window).on('beforeunload', function () {

  $(document).off('click', '.sorting')
  $(document).off('click', '.zpaging')
})