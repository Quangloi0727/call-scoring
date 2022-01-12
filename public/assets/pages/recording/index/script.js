$(function () {
  const $btnSearch = $('#search');
  const $frmSearch = $('#form_search_recording');
  const $tblSearch = $('#tableBody');
  const $ctnPaging = $('#paging_table');

  $btnSearch.on('click', function (e) {
    let inputValue = $frmSearch.serializeArray();
    let queryData = {};

    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value;
      }
    });

    console.log('aaaa: ', inputValue);
    console.log('bbbb: ', queryData);
    console.log('cccc: ', $.param(queryData));

    return findData(queryData);
  });

  function findData(data, page) {
    $.ajax({
      type: 'GET',
      url: '/recording/list?' + $.param(data),
      cache: 'false',
      success: function (result) {
        console.log('result: ', result);

        createTable(result.data);
        return createPaging(result.paging);
      },
      error: function (error) {
        toastr.error(error.responseJSON.message);
      },
    });
  }

  function createTable(data) {
    let html = '';

    data.forEach((item) => {
      html += `
        <tr>
          <td class="text-center">${item.caller}</td>
          <td class="text-center">${item.caller}</td>
          <td class="text-center">${item.called}</td>
          <td class="text-center">${item.origTime}</td>
          <td class="text-center">${item.duration}</td>
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
            <a role="button" class="page-link zpaging">${page}</a>
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
        <ul class="pagination">
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

  //Date picker
  $('#startTime').datetimepicker({ format: 'L' });
  $('#endTime').datetimepicker({ format: 'L' });

  //Date and time picker
  $('#startTime').datetimepicker({ icons: { time: 'far fa-clock' } });
  $('#endTime').datetimepicker({ icons: { time: 'far fa-clock' } });
});