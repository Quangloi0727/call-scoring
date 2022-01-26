const $buttonSearch = $('#search');
const $buttonExportExcel = $('#export_excel')
const $formSearch = $('#form_search');
const $tableData = $('#table_data');
const $containerPaging = $('#paging_table');
const $buttonAdvancedSearch = $('#btn_advanced_search');
const $formAdvancedSearch = $('#form_advanced_search');
const $modalSearch = $('#modal_search');
const $buttonCancelModal = $('#btn_cancel');
const $buttonClearFilter = $('#clear_local_storage');
const $buttonExportExcelAdvanced = $('#export_excel_advanced');

const DEFAULT_SEARCH = 'default_search';
const ADVANCED_SEARCH = 'advance_search';

let searchType = DEFAULT_SEARCH;

function bindClick() {
  $buttonSearch.on('click', function (e) {
    let page = 1;
    let formData = getFormData('form_search');

    console.log('formData: ', formData)

    searchType = DEFAULT_SEARCH;

    return findData(page, null, formData);
  });

  $buttonAdvancedSearch.on('click', function () {
    let page = 1;
    let formData = getFormData('form_advanced_search');

    searchType = ADVANCED_SEARCH;

    console.log('formData: ', formData)

    localStorage.setItem('modalData', JSON.stringify(formData));

    return findData(page, null, formData);
  });

  $buttonExportExcel.on('click', function () {
    let formData = {};

    if (searchType === DEFAULT_SEARCH) {
      formData = getFormData('form_search');
    } else if (searchType === ADVANCED_SEARCH) {
      formData = getFormData('form_advanced_search');
    }

    return findData(null, true, formData);
  });

  $(document).on('click', '.zpaging', function () {
    let page = $(this).attr('data-link');
    let formData = {};

    if (searchType === DEFAULT_SEARCH) {
      formData = getFormData('form_search');
    } else if (searchType === ADVANCED_SEARCH) {
      formData = getFormData('form_advanced_search');
    }

    return findData(page, null, formData);
  });

  $buttonCancelModal.on('click', () => {
    return $modalSearch.modal('hide');
  });

  $buttonClearFilter.on('click', () => {
    localStorage.setItem('modalData', '');

    $formAdvancedSearch.trigger("reset");
    $('#val_callDirection').selectpicker('refresh');
    $('#val_teams').selectpicker('refresh');

    return;
  });
}

function getFormData(formId) {
  let filter = {};

  filter = _.chain($(`#${formId} .input`)).reduce(function (memo, el) {
    let value = $(el).val();
    if (value != '' && value != null) memo[el.name] = value;
    return memo;
  }, {}).value();

  return filter;
}

function findData(page, exportExcel, queryData) {
  if (page) queryData.page = page;

  if (exportExcel) queryData.exportExcel = 1;

  $('.page-loader').show();

  $.ajax({
    type: 'GET',
    url: '/recording/list?' + $.param(queryData),
    cache: 'false',
    success: function (result) {
      console.log('result: ', result);
      $('.page-loader').hide();

      $modalSearch.modal('hide');

      if (exportExcel) {
        return downloadFromUrl(result.linkFile);
      }

      createTable(result.data);
      return createPaging(result.paging);
    },
    error: function (error) {
      $('.page-loader').hide();

      return toastr.error(error.responseJSON.message);
    },
  });
}

function createTable(data) {
  let html = '';

  data.forEach((item) => {
    let audioHtml = '';
    let agentName = item.fullName && `${item.fullName} (${item.userName})` || '';

    if (item.recordingFileName && item.recordingFileName !== '') {
      audioHtml = `
        <audio controls preload="none">
          <source  src="${item.recordingFileName}" type="audio/wav">
          Your user agent does not support the HTML5 Audio element.'
        </audio>
      `;
    }

    html += `
      <tr>
        <td class="text-center">${item.direction || ''}</td>
        <td class="text-center">${agentName}</td>
        <td class="text-center">${item.teamName || ''}</td>
        <td class="text-center">${item.caller}</td>
        <td class="text-center">${item.called}</td>
        <td class="text-center">${item.origTime}</td>
        <td class="text-center">${item.duration}</td>
        <td class="text-center">${audioHtml}</td>
      </tr>
    `;
  });

  return $tableData.html(html);
}

function createPaging(paging) {
  if (!paging) return '';

  let firstPage = '';
  let prePage = '';
  let pageNum = '';
  let pageNext = '';
  let pageLast = '';

  if (paging.first) firstPage = `
    <li class="paginate_button page-item">
      <a role="button" data-link="${paging.first}" class="page-link zpaging">&laquo;</a>
    </li>
  `;

  if (paging.previous) prePage = `
    <li class="paginate_button page-item">
      <a role="button" data-link="${paging.previous}" class="page-link zpaging">&lsaquo;</a>
    </li>
  `;

  paging.range.forEach((page) => {
    if (page == paging.current) {
      pageNum += `
        <li class="paginate_button page-item active">
          <a role="button" class="page-link">${page}</a>
        </li>
      `;
    } else {
      pageNum += `
        <li class="paginate_button page-item">
          <a role="button" data-link="${page}" class="page-link zpaging">${page}</a>
        </li>
      `;
    }
  });

  if (paging.next) pageNext = `
    <li class="paginate_button page-item">
      <a role="button" data-link="${paging.next}" class="page-link zpaging">&rsaquo;</a>
    </li>
  `;
  if (paging.last) pageLast = `
    <li class="paginate_button page-item">
      <a role="button" data-link="${paging.last}" class="page-link zpaging">&raquo;</a>
    </li>
  `;

  let pagingHtml = `
    <div class="dataTables_paginate paging_simple_numbers">
      <b> 
        <span class="TXT_TOTAL">Total</span>:
        <span class="bold c-red" id="ticket-total">${paging.totalResult}</span>
      </b>
      <ul class="pagination mt-2">
        ${firstPage}
        ${prePage}
        ${pageNum}
        ${pageNext}
        ${pageLast}
      </ul>
    </div>
  `;

  return $containerPaging.html(pagingHtml);
};

function downloadFromUrl(url) {
  let link = document.createElement('a');

  link.download = '';
  link.href = url;

  return link.click();
}

$(function () {
  $('#startTime').datetimepicker({
    format: 'DD/MM/YYYY',
    defaultDate: new Date(),
    icons: { time: 'far fa-clock' }
  });

  $('#endTime').datetimepicker({
    format: 'DD/MM/YYYY',
    defaultDate: new Date(),
    icons: { time: 'far fa-clock' }
  });

  $('#popup_startTime').datetimepicker({
    format: 'DD/MM/YYYY',
    icons: { time: 'far fa-clock' }
  });

  $('#popup_endTime').datetimepicker({
    format: 'DD/MM/YYYY',
    icons: { time: 'far fa-clock' }
  });

  bindClick();

  if (localStorage.getItem('modalData')) {
    let page = 1;
    let modalData = JSON.parse(localStorage.getItem('modalData'));

    searchType = ADVANCED_SEARCH;

    Object.keys(modalData).forEach(function (key) {
      console.log('key: ', modalData[key])
      $(`#val_${key}`).val(modalData[key]);
    });

    $('#val_callDirection').selectpicker('refresh');
    $('#val_teams').selectpicker('refresh');

    findData(page, null, modalData);
  } else {
    let page = 1;
    let formData = getFormData('form_search');

    searchType = DEFAULT_SEARCH;

    findData(page, null, formData);
  }
});

$(window).on('beforeunload', function () {
  $buttonSearch.off('click');
  $buttonAdvancedSearch.off('click');
  $buttonExportExcel.off('click');
  $buttonCancelModal.off('click');
  $buttonClearFilter.off('click');
  $(document).off('click', '.zpaging');
});