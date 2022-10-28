const DATA_RETENTION_POLICY_ACTIVE_TXT = 'Chính sách lưu dữ liệu sẽ được kích hoạt'
const DATA_RETENTION_POLICY_UN_ACTIVE_TXT = 'Chính sách lưu dữ liệu sẽ bị ngừng hoạt động'


$(function () {

  $(document).on('click', '#btnSearch', function () {
    const nameDataRetentionPolicy = $('#nameDataRetentionPolicy').val()
    return getDataRetentionPolicy(1, nameDataRetentionPolicy)
  })

  $(document).on('change', '.sl-limit-page', function () {
    console.log('change sl-limit-page');
    const nameDataRetentionPolicy = $('#nameDataRetentionPolicy').val()
    return getDataRetentionPolicy(1, nameDataRetentionPolicy);
  })

  $(document).on('click', '.zpaging', function () {
    let page = $(this).attr('data-link')
    const nameDataRetentionPolicy = $('#nameDataRetentionPolicy').val()
    return getDataRetentionPolicy(page, nameDataRetentionPolicy);
  })

  $(document).on('click', '.btn-modal-status', function () {
    const idDataRetentionPolicy = $(this).attr('data-id')
    const status = $(this).attr('data-status')
    $('#btn-change-status').attr('data-id', idDataRetentionPolicy)
    $('#btn-change-status').attr('data-status', status)

    if (status == STATUS.UN_ACTIVE.value) {
      $('#btn-change-status').removeClass('btn-danger')
      $('#btn-change-status').addClass('btn-primary')
      $('.modal-body-text').text(DATA_RETENTION_POLICY_ACTIVE_TXT)
    } else {
      $('.modal-body-text').text(DATA_RETENTION_POLICY_UN_ACTIVE_TXT)
      $('#btn-change-status').removeClass('btn-primary')
      $('#btn-change-status').addClass('btn-danger')
    }

    $('#modal-change-status').modal('show');
  })

  $(document).on('click', '#btn-change-status', function () {
    const idDataRetentionPolicy = $(this).attr('data-id')
    const dataUpdate = {
      id: idDataRetentionPolicy,
      status: ($(this).attr('data-status') == STATUS.ACTIVE.value ? STATUS.UN_ACTIVE.value : STATUS.ACTIVE.value)
    }
    _AjaxData('/dataRetentionPolicy/updateStatus', 'PUT', JSON.stringify(dataUpdate), { contentType: "application/json" }, function (resp) {
      if (resp.code != 200) return toastr.error(resp.message)

      toastr.success(resp.message)
      $('#modal-change-status').modal('hide');
      return refreshPage()
    })
  })

  $(document).on('click', '.btn-modal-delete', function () {
    $('#btn-delete-doc').attr('data-id', $(this).attr('data-id'))
    $('#modal-delete-doc').modal('show');
  })

  $(document).on('click', '#btn-delete-doc', function () {
    const idDataRetentionPolicy = $(this).attr('data-id')

    _AjaxData(`/dataRetentionPolicy/${idDataRetentionPolicy}`, 'DELETE', null, null, function (resp) {
      if (resp.code != 200) return toastr.error(resp.message)

      toastr.success(resp.message)
      $('#modal-delete-doc').modal('hide');
      return refreshPage()
    })
  })

  getDataRetentionPolicy(1, null)
})

$(window).on('beforeunload', function () {
  $(document).off('click', '#btnSearch')
  $(document).off('change', '.sl-limit-page')
  $(document).off('click', '.btn-change-status')
})

function getDataRetentionPolicy(page, nameDataRetentionPolicy) {

  let queryData = {}
  if (nameDataRetentionPolicy) {
    queryData.nameDataRetentionPolicy = nameDataRetentionPolicy
  }
  queryData.page = page || 1
  queryData.limit = $('.sl-limit-page').val() || 10

  const url = '/dataRetentionPolicy/getDataRetentionPolicies?' + $.param(queryData)
  _AjaxGetData(url, 'GET', function (resp) {
    if (resp.code != 200) {
      return toastr.error(resp.message)
    }

    if (resp.data && resp.data.length > 0) {

      createTable(resp.data)
      return $('#paging_table').html(window.location.CreatePaging(resp.paginator))
    }
  })
}

function createTable(data) {
  let html = ''
  data.forEach((item) => {

    let teamDropDownItemHTML = '';
    let teamHTML = '';

    item.DataRetentionPolicy_Team.forEach((team) => {
      teamDropDownItemHTML += `
        <a class="dropdown-item">
          ${team.TeamInfo.name}
        </a>
      `;
    });

    if (item.DataRetentionPolicy_Team.length > 2) {
      teamHTML = `<div class="dropdown show ${item.DataRetentionPolicy_Team.length > 0 ? '' : 'd-none'}">
        <a class="dropdown-custom dropdown-toggle text-dark role="button" id="dropdown" 
          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          ${item.DataRetentionPolicy_Team.length} đội ngũ
        </a>
        <div class="dropdown-menu" aria-labelledby="dropdown">
          ${teamDropDownItemHTML}
        </div>
      </div>`;
    } else if (item.DataRetentionPolicy_Team.length == 1) {
      teamHTML = `<div class="dropdown show">
        ${item.DataRetentionPolicy_Team[0].TeamInfo.name}
      </div>`;
    } else teamHTML = `<div class="dropdown show">Tất cả</div>`;

    let itemBtn = `
    <span class="p-1 btn-modal-status" title="${item.status == STATUS.UN_ACTIVE.value ? 'Kích hoạt' : 'Ngừng hoạt động'}" 
      data-id="${item.id}" data-status="${item.status}">
      <i class="${item.status == STATUS.UN_ACTIVE.value ? 'fas fa-lock' : 'fas fa-lock-open'} text-primary"></i>
    </span>
    <a class="p-1 btn-duplicate" href="/dataRetentionPolicy/replication/${item.id}" title="Nhân bản chính sách" data-id="${item.id}">
      <i class="far fa-copy text-primary"></i>
    </a>
    <span class="p-1 btn-modal-delete" title="Xóa chính sách" data-id="${item.id}">
      <i class="fa fa-times text-primary" aria-hidden="true"></i>
     </span>
    `

    html += `
      <tr>
        <td class="text-center">
          <a href="/dataRetentionPolicy/detail/${item.id}">${item.nameDataRetentionPolicy}</a>
        </td>
        <td class="text-center">${itemBtn}</td>
        <td class="text-center">${teamHTML}</td>
        <td class="text-center">${renStatus(item.status)}</td>
        <td class="text-center">${item.createdAt || ''}</td>
        <td class="text-center">${item.userCreate.userName || ''}</td>
        <td class="text-center">${item.updatedAt || ''}</td>
        <td class="text-center">${item.userUpdate.userName || ''}</td>
      </tr>
    `
  })

  return $('#tableBody').html(html)
}

function renStatus(status) {
  let result
  for (const [key, value] of Object.entries(STATUS)) {
    if (status == value.value) {
      result = value.text
    }
  }
  return result
}

function refreshPage(idForm) {
  setTimeout(() => {
    getDataRetentionPolicy(1, $('#nameDataRetentionPolicy').val())
  }, 2500)
}