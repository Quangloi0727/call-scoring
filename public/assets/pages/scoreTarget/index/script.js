const $formSearch = $('#form_search')
const $buttonSearch = $('#search_group')
const $loadingData = $('.page-loader')

function findData(page, formQuery) {

  let queryData = {}
  if (formQuery) {
    queryData = formQuery
  }

  queryData.page = page
  queryData.limit = $('.sl-limit-page').val() || 10
  $loadingData.show()

  _AjaxGetData('scoreTarget/gets?' + $.param(queryData), 'GET', function (resp) {
    if (resp.code != 200) {
      return toastr.error(resp.message)
    }

    createTable(resp.data)
    return $('#paging_table').html(window.location.CreatePaging(resp.paginator))
  })
}

// function 
function createTable(data) {
  let html = ''
  data.forEach((item) => {
    console.log(111, item)
    html += `
      <tr>
        <td class="text-center">
          <a href=/scoreTarget/detail/${item.id}>${item.name}</a>
        </td>
        <td class="text-center">${genUserAssign(item.ScoreTargetAssignmentInfo || [])}</td>
        <td class="text-center">${renStatus(item.status)}</td>
        <td class="text-center">${item.description || ''}</td>
        <td class="text-center">${moment(item.createdAt).format('HH:mm:ss DD/MM/YYYY') || ''}</td>
        <td class="text-center">${item.userCreate.userName || ''}</td>
        <td class="text-center">${moment(item.updatedAt).format('HH:mm:ss DD/MM/YYYY') || ''}</td>
        <td class="text-center">${item?.userUpdate?.userName || ''}</td>
      </tr>
    `
  })

  return $('#tableBody').html(html)
}

function genUserAssign(ScoreTargetAssignmentInfo) {
  if (!ScoreTargetAssignmentInfo || !ScoreTargetAssignmentInfo.length) return ''
  if (ScoreTargetAssignmentInfo.length == 1) return ScoreTargetAssignmentInfo[0].users.fullName
  return `
            <div class="dropdown">
                <a class="dropdown-custom dropdown-toggle" role="button" id="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${ScoreTargetAssignmentInfo.length} người đánh giá
                </a>
                <div class="dropdown-menu" aria-labelledby="dropdown">
                    ${genEachAssign(ScoreTargetAssignmentInfo)}
                </div>
            </div>
    `
}

function genEachAssign(ScoreTargetAssignmentInfo) {
  let html = ''
  ScoreTargetAssignmentInfo.forEach(el => {
    html += `<a class="dropdown-item" type="button">${el.users.fullName}</a>`
  })
  return html
}

function renStatus(status) {
  let result
  for (const [key, value] of Object.entries(CONST_STATUS)) {
    if (status == value.value) {
      result = value.text
    }
  }
  return result
}

$(function () {
  //event phân trang 
  $(document).on('click', '.zpaging', function () {
    let page = $(this).attr('data-link')
    let formQuery = _.chain($(`#form_search .input`)).reduce(function (memo, el) {
      let value = $(el).val()
      if (value != '' && value != null) memo[el.name] = value
      return memo
    }, {}).value()
    return findData(page, formQuery)
  })

  //event tìm kiếm
  $buttonSearch.on('click', function () {
    const pageNumber = 1
    let formQuery = _.chain($(`#form_search .input`)).reduce(function (memo, el) {
      let value = $(el).val()
      if (value != '' && value != null) memo[el.name] = value
      return memo
    }, {}).value()
    return findData(pageNumber, formQuery)
  })


  $('#input_search').keypress(function (e) {
    let key = e.which

    if (key != 13) return

    const pageNumber = 1

    let formQuery = _.chain($(`#form_search .input`)).reduce(function (memo, el) {
      let value = $(el).val()
      if (value != '' && value != null) memo[el.name] = value
      return memo
    }, {}).value()
    return findData(pageNumber, formQuery)
  })

  $(document).on('change', '.sl-limit-page', function () {
    findData(1)
  })

  findData(1)
})