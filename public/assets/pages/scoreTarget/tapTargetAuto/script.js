
let indexKeyWordset


if (ScoreTargetAuto && ScoreTargetAuto.length > 0) {
  ScoreTargetAuto.forEach((el, i) => {
    let uuidv4_parent = window.location.uuidv4()
    let html = renHTMLScoreTargetAuto(uuidv4_parent, el)
    $('#tab-score-target-auto').append(html)
    addRulesPoint(uuidv4_parent)
    // addRulesNameTargetAuto(uuidv4_parent)
    if (el.KeywordSet && el.KeywordSet.length > 0) {
      el.KeywordSet.forEach((elm) => {
        let uuidv4_child = window.location.uuidv4()
        let html = renKeywordSet(uuidv4_child, elm, uuidv4_parent)
        $(`#${uuidv4_parent}`).append(html)
        addRulesKeyword(uuidv4_child)
        return renderIndexKeyword(uuidv4_parent)
      })
    }
  })
}
$(document).on('click', '.btn-add-keyword-set', function (e) {
  let uuidv4_parent = $(this).attr('data-id')
  let uuidv4_child = window.location.uuidv4()
  let html = renKeywordSet(uuidv4_child, null, uuidv4_parent)
  $(`#${uuidv4_parent}`).append(html)
  addRulesKeyword(uuidv4_child)
  return renderIndexKeyword(uuidv4_parent)
})

$(document).on('click', '.btn-add-row-target-auto', function (e) {
  let uuidv4 = window.location.uuidv4()
  let html = renHTMLScoreTargetAuto(uuidv4)
  console.log(uuidv4)
  $('#tab-score-target-auto').append(html)
  addRulesPoint(uuidv4)
  addRulesNameTargetAuto(uuidv4)
})

$(document).on('click', '.btn-remove-row-set-keyWord', function () {
  let parent_uuidv4 = $(this).attr('data-id')
  $(this).parent().parent().remove()
  renderIndexKeyword(parent_uuidv4)
})

function renderIndexKeyword(parent_uuidv4) {
  $(`span[class='indexKeyWord-${parent_uuidv4}']`).each(function (index) {
    $(this).text(index + 1)
  })
}

function addRulesKeyword(uuidv4_child) {

  $('#form_target_general').validate({
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
    }
  })
  return $(`#form_target_general input[name="keyword-${uuidv4_child}"]`).rules("add", {
    required: true,
    maxlength: 1000,
    messages: {
      required: "Không được bỏ trống !",
      maxlength: "Giá trị tối đa là 1000 kí tự !",
    }
  })
}

function addRulesNameTargetAuto(uuidv4) {

  $('#form_target_general').validate({
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
    }
  })
  return $(`#form_target_general input[name="nameTargetAuto-${uuidv4}"]`).rules("add", {
    required: true,
    maxlength: 500,
    messages: {
      required: "Không được bỏ trống !",
      maxlength: "Giá trị tối đa là 500 kí tự !",
    }
  })
}

function addRulesPoint(uuidv4) {
  $('#form_target_general').validate({
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
    }
  })
  return $(`#form_target_general input[name="point-${uuidv4}"]`).rules("add", {
    required: true,
    maxlength: 5,
    messages: {
      required: "Không được bỏ trống !",
      maxlength: "Giá trị tối đa là 99999 !",
    }
  })
}

function renKeywordSet(uuidv4, data, parent_uuidv4) {
  let input = `
  <div class="row">
    <div class="col-11 form-group">
      <label style=" font-weight: normal;"> Bộ từ khóa  <span class="indexKeyWord-${parent_uuidv4}"></span>
        <i class="fal fa-question-circle" title="Nhập từ khóa mà bản ghi âm cần có, các từ khóa cách nhau bằng dấu phẩy"></i>
        <span class="text-danger">(*)</span>
      </label>
      <input type="text" value="${data ? data.keyword : ''}" uuidv4="${parent_uuidv4}" class="form-control input keyword" true_name="keyword" name="keyword-${uuidv4}">
    </div>
    <div class="col-sm-1">
      <a type="button" data-id="${parent_uuidv4}" class="btn-remove-row-set-keyWord text-danger">
        <i class="fas fa-times mt-2" style="font-size: 1.5rem;"></i>
      </a>
    </div>
  </div>  
  `
  return input
}

function renHTMLScoreTargetAuto(uuidv4, data) {
  let html = `
  <div class="row">
    <div class="border-content mt-3 p-3 col-sm-11">
      <div class="row">
        <div class="col-6 form-group">
          <label style=" font-weight: normal;"> Tiêu chí chấm
            <span class="text-danger">(*)</span>
          </label>
          <input type="text" class="form-control input nameTargetAuto" value="${data ? data.nameTargetAuto : ''}" true_name="nameTargetAuto" uuidv4="${uuidv4}" name="nameTargetAuto-${uuidv4}">
          <span class="d-none duplicateNameTarget">Tên tiêu chí chấm đã được sử dụng</span>
        </div>
        <div class="col-6 form-group">
          <label style=" font-weight: normal;"> Điểm của tiêu chí
            <span class="text-danger">(*)</span>
          </label>
          <input type="number" value="${data ? data.point : ''}" class="form-control input" true_name="point" name="point-${uuidv4}">
        </div>
      </div>

      <div class="pt-2 pb-2 row-keyword-set" id="${uuidv4}">
      </div>
      <a class="mt-3 btn-add-keyword-set" data-id="${uuidv4}" type="button"><i class="fas fa-plus"
      style="font-size: 1.3em;color: #007bff;"></i>
      </a>
      <div class="form-group clearfix mt-1">
        <div class="icheck-primary d-inline">
          <input type="checkbox" id="falsePoint-${uuidv4}" name="falsePoint"${data && data.falsePoint ? 'checked' : ''}>
          <label for="falsePoint-${uuidv4}" style=" font-weight: normal;">
            Điểm liệt của kịch bản chấm tự động
          </label>
        </div>
      </div>
    </div>
    <div class="col-sm-1 mt-1">
      <a type="button" class="btn-remove-row text-danger">
        <i class="fas fa-times mt-2" style="font-size: 1.5rem;"></i>
      </a>
    </div>
  </div>
`
  return html
}