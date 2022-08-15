
let indexKeyWordset = 0

if (ScoreTargetAuto && ScoreTargetAuto.length > 0) {
  ScoreTargetAuto.forEach((el, i) => {
    let uuidv4 = window.location.uuidv4()
    let html = renHTMLScoreTargetAuto(uuidv4, el)
    $('#tab-score-target-auto').prepend(html)

    if (el.KeywordSet && el.KeywordSet.length > 0) {
      el.KeywordSet.forEach((elm) => {
        let html = renKeywordSet(uuidv4, elm)
        return $(`#${uuidv4}`).prepend(html)
      })
    }
  })
}
$(document).on('click', '.btn-add-keyword-set', function (e) {
  let uuidv4 = $(this).attr('data-id')
  let html = renKeywordSet(uuidv4)
  return $(this).parent().prepend(html)

})

$(document).on('click', '.btn-add-row-target-auto', function (e) {
  let uuidv4 = window.location.uuidv4()
  let html = renHTMLScoreTargetAuto(uuidv4)
  $('#tab-score-target-auto').prepend(html)
})

$(document).on('click', '.btn-remove-row-set-keyWord', function () {
  $(this).parent().parent().remove()
})

function renKeywordSet(uuidv4, data) {
  indexKeyWordset += 1
  let input = `
  <div class="row">
    <div class="col-11 form-group">
      <label style=" font-weight: normal;"> Bộ từ khóa ${indexKeyWordset}
        <span class="text-danger">(*)</span>
      </label>
      <input type="text" value="${data ? data.keyword : ''}" class="form-control input" uuidv4="${uuidv4}" name="keyword">
    </div>
    <div class="col-sm-1">
      <a type="button" class="btn-remove-row-set-keyWord text-danger">
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
          <input type="text" class="form-control input" value="${data ? data.nameTargetAuto : ''}" uuidv4="${uuidv4}" name="nameTargetAuto">
        </div>
        <div class="col-6 form-group">
          <label style=" font-weight: normal;"> Điểm của tiêu chí
            <span class="text-danger">(*)</span>
          </label>
          <input type="number" value="${data ? data.point : ''}" class="form-control input" name="point">
        </div>
      </div>

      <div class="pt-2 pb-2 row-keyword-set" id="${uuidv4}">
        <a class="mt-3 btn-add-keyword-set" data-id="${uuidv4}" type="button"><i class="fas fa-plus"
            style="font-size: 1.3em;color: #007bff;"></i>
        </a>
        <div class="form-group clearfix mt-1">
          <div class="icheck-primary d-inline">
            <input type="checkbox" id="falsePoint" name="falsePoint"${data && data.falsePoint ? 'checked' : ''}>
            <label for="falsePoint" style=" font-weight: normal;">
              Điểm liệt của kịch bản chấm tự động
            </label>
          </div>
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