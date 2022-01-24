$(function () {
  const $btnSearch = $('#search');
  const $btnExportExcel = $('#export_excel')
  const $frmSearch = $('#form_search_recording');
  const $tblSearch = $('#tableBody');
  const $ctnPaging = $('#paging_table');
  const $popupSearch = $('#btn_popup_search');
  const $frmPopupSearch = $('#popup_input_search');
  const $modalSearch = $('#modalSearch')
  const $btn_cancel = $('#btn_cancel')
  const $clear_local_storage = $('#clear_local_storage')

  //Date picker
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

  if (localStorage.getItem('modalData')) {
    let page = 1;
    let modalData = JSON.parse(localStorage.getItem('modalData'))
    loadDataByLS(modalData)
    findData(page, null, modalData);
  }

  // button event
  $btnSearch.on('click', function (e) {
    let page = 1;
    let inputValue = $frmSearch.serializeArray();
    let queryData = {};

    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value;
      }
    });
    return findData(page, null, queryData);
  });

  $btnExportExcel.on('click', function () {
    let inputValue = $frmSearch.serializeArray();
    let queryData = {};

    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value;
      }
    });

    return findData(null, true, queryData);
  });

  $popupSearch.on('click', function () {
    let page = 1;
    let inputValue = $frmPopupSearch.serializeArray();
    let queryData = {};
    console.log(inputValue);
    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value;
      }
    });
    console.log(JSON.stringify(queryData));
    queryData.searchForm = true;
    localStorage.setItem('modalData', JSON.stringify(queryData));
    return findData(page, null, queryData);
  });

  $btn_cancel.on('click', () => {
    $modalSearch.modal('hide')
  })

  $clear_local_storage.on('click', () => {
    localStorage.setItem('modalData', '')
    $frmPopupSearch.trigger("reset");
  })

  $(document).on('click', '.zpaging', function () {
    let page = $(this).attr('data-link');
    return findData(page);
  });

  /// function
  function findData(page, exportExcel, queryData) {
    if (page) {
      queryData.page = page
    }

    if (exportExcel) {
      queryData.exportExcel = 1;
    }

    $('.page-loader').show();

    $.ajax({
      type: 'GET',
      url: '/recording/list?' + $.param(queryData),
      cache: 'false',
      success: function (result) {
        console.log('result: ', result);
        $('.page-loader').hide();

        if (exportExcel) {
          if (!result || !result.linkFile || result.linkFile == '') return;
          return downloadFromUrl(result.linkFile);
        }
        if (queryData.searchForm) {
          $modalSearch.modal('hide')
        }
        createTable(result.data);
        return createPaging(result.paging);
      },
      error: function (error) {
        $('.page-loader').hide();
        toastr.error(error.responseJSON.message);
      },
    });
  }

  function loadDataByLS(modalData) {
    Object.keys(modalData).forEach(function (key) {
      console.log(key, modalData[key]);
      $(`#val_${key}`).val(modalData[key])
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
          <td class="text-center">${item.direction}</td>
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

    return $tblSearch.html(html);
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

    return $ctnPaging.html(pagingHtml);
  };

  function downloadFromUrl(url) {
    var link = document.createElement("a");
    link.download = '';
    link.href = url;
    link.click();
  }
});