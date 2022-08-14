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
    console.log(resp)
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
    html += `
      <tr>
        <td class="text-center">
          <a href=/scoreTarget/detail/${item.id}>${item.name}</a>
        </td>
        <td class="text-center"></td>
        <td class="text-center">${renStatus(item.status)}</td>
        <td class="text-center">${item.description || ''}</td>
        <td class="text-center">${moment(item.createdAt).format('HH:mm:ss DD/MM/YYYY') || ''}</td>
        <td class="text-center">${item.userCreate.userName || ''}</td>
        <td class="text-center">${item.updated || ''}</td>
        <td class="text-center">${item.userUpdate.userName || ''}</td>
      </tr>
    `
  })

  return $('#tableBody').html(html)
}

function renStatus(status) {
  let result
  for (const [key, value] of Object.entries(CONST_STATUS)) {
    if (status == value) {
      result = key
    }
  }
  return result
}

$(function () {
  //event phân trang 
  console.log(CONST_STATUS)
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