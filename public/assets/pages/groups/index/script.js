$(function () {
  const $formCreateGroup = $('#form_input_group');
  const $formSearchGroup = $('#form_search_groups');
  const $buttonSearchGroup = $('#search_group');
  const $modalGroup = $('#modal_group');
  const $loadingData = $('.page-loader');

  $.validator.setDefaults({
    submitHandler: function () {
      let inputValue = $formCreateGroup.serializeArray();
      let bodyData = {};

      inputValue.forEach((el) => {
        if (el.value && el.value !== '') {
          bodyData[el.name] = el.value;
        }
      });

      $loadingData.show();

      $.ajax({
        type: 'POST',
        url: '/groups/insert',
        data: bodyData,
        dataType: "text",
        success: function () {
          $loadingData.hide();

          return location.reload();
        },
        error: function (error) {
          $loadingData.hide();

          return toastr.error(error.responseText.message);
        },
      });
    }
  });

  // validate form 
  const validator = $formCreateGroup.validate({
    rules: {
      name: {
        required: true,
      },
    },
    messages: {
      name: {
        required: "Tên nhóm không được để trống!",
      },
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.form-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    }
  });

  //event phân trang 
  $(document).on('click', '.zpaging', function () {
    let page = $(this).attr('data-link');
    return findData(page);
  });

  // event modal
  $modalGroup.on('hidden.bs.modal', function (e) {
    $formCreateGroup.trigger("reset");
  })

  $modalGroup.on('shown.bs.modal', function (e) {
    $formCreateGroup.trigger("reset");
    validator.resetForm();
  })

  //event tìm kiếm
  $buttonSearchGroup.on('click', function () {
    const pageNumber = 1;
    return findData(pageNumber);
  });

  function findData(page) {
    let queryData = {};
    let inputValue = $formSearchGroup.serializeArray();

    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value;
      }
    });

    queryData.page = page

    $loadingData.show();

    $.ajax({
      type: 'GET',
      url: '/groups/getGroups?' + $.param(queryData),
      cache: 'false',
      success: function (result) {
        $loadingData.hide();

        createTable(result.data);
        return createPaging(result.paginator);
      },
      error: function (error) {
        $loadingData.hide();

        return toastr.error(error.responseText.message);
      },
    });
  }

  // function 
  function createTable(data) {
    let html = '';
    data.forEach((item) => {
      html += `
        <tr>
          <td class="text-center">${item.name}</td>
          <td class="text-center"></td>
          <td class="text-center"></td>
          <td class="text-center">${item.description || ''}</td>
          <td class="text-center">${moment(item.createAt).format('HH:mm:ss DD/MM/YYYY')}</td>
          <td class="text-center">${item.userCreate.fullName}</td>
        </tr>
      `;
    });

    return $('#tableBody').html(html);
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

    return $('#paging_table').html(pagingHtml);
  };

  findData(1)
});