$(function () {
  const $formCreateUser = $('#form_input_user');
  const $modalCreateUser = $('#modalUser');
  const $loadingData = $('.page-loader');
  const $buttonSearchUser = $('#searchUser');
  const $formSearchUser = $('#form_search_user');

  $.validator.addMethod("pwcheck", function (value) {
    return /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{8,}$/.test(value);
  });

  $.validator.setDefaults({
    submitHandler: function () {
      let filter = _.chain($('#form_input_user .input')).reduce(function (memo, el) {
        let value = $(el).val();
        if (value != '' && value != null) memo[el.name] = value;
        return memo;
      }, {}).value();

      $loadingData.show();

      $.ajax({
        type: 'POST',
        url: '/users/insert',
        data: filter,
        dataType: "text",
        success: function () {
          $loadingData.hide();

          return location.reload();
        },
        error: function (error) {
          $loadingData.hide();

          return toastr.error(JSON.parse(error.responseText).message);
        },
      });
    }
  });

  // validate form 
  const validator = $formCreateUser.validate({
    rules: {
      firstName: {
        required: true,
        maxlength: 30
      },
      lastName: {
        required: true,
        maxlength: 30
      },
      userName: {
        required: true,
        maxlength: 30
      },
      extension: {
        required: true,
        number: true
      },
      password: {
        required: true,
        pwcheck: true
      },
      repeat_password: {
        required: true,
        equalTo: "#password"
      }
    },
    messages: {
      firstName: {
        required: "Không được để trống Họ và Tên đệm",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      lastName: {
        required: "Không được để trống Tên",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      userName: {
        required: "Không được để trống Tên đăng nhập",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      extension: {
        required: "Không được để trống extension",
        number: "chỉ nhập số"
      },
      password: {
        required: "Không được để trống password",
        pwcheck: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ HOA, chữ thường và số"
      },
      repeat_password: {
        required: "Không được để trống",
        equalTo: "Mật khẩu không khớp"
      }
    },
    ignore: ":hidden",
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
  $modalCreateUser.on('hidden.bs.modal', function (e) {
    $formCreateUser.trigger("reset");
    validator.resetForm();

    $('#first_name_length').html('0/30');
    $('#first_name_length').removeClass('text-danger').addClass('text-muted');

    $('#last_name_length').html('0/30');
    $('#last_name_length').removeClass('text-danger').addClass('text-muted');

    $('#user_name_length').html('0/30');
    $('#user_name_length').removeClass('text-danger').addClass('text-muted');
  });

  $modalCreateUser.on('shown.bs.modal', function (e) {
    $formCreateUser.trigger("reset");
    validator.resetForm();
  });

  //event tìm kiếm
  $buttonSearchUser.on('click', function () {
    const pageNumber = 1;
    return findData(pageNumber);
  });

  function findData(page) {
    let queryData = {};
    let inputValue = $formSearchUser.serializeArray();

    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value;
      }
    });

    queryData.page = page

    $loadingData.show();

    $.ajax({
      type: 'GET',
      url: '/users/getUsers?' + $.param(queryData),
      cache: 'false',
      success: function (result) {
        $loadingData.hide();

        createTable(result.data);
        return createPaging(result.paginator);
      },
      error: function (error) {
        $loadingData.hide();

        return toastr.error(error.message);
      },
    });
  }

  // function 
  function createTable(data) {
    let html = '';

    console.log(`------- data ------- `);
    console.log(data);
    console.log(`------- data ------- `);

    data.forEach((item) => {
      let teamHtml = '';
      item.ofTeams.forEach(element => {
        teamHtml += `
          <a href="/groups/detail/${element.teamId}">
            <u>${element.teamName}</u>
            &nbsp;
          </a>
        `;
      });

      html += `
        <tr>
          <td class="text-center">${item.fullName}</td>
          <td class="text-center">${item.userName}</td>
          <td class="text-center">${item.extension}</td>
          <td class="text-center">${teamHtml}</td>
          <td class="text-center">${moment(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}</td>
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

  $('#form_input_user #firstname').on('input', function () {
    let value = $(this).val();

    $('#first_name_length').html(`${value.length}/30`);

    if (value.length > 30) {
      $('#first_name_length').removeClass('text-muted').addClass('text-danger');
      return validator.showErrors({
        'firstName': 'Độ dài không quá 30 kí tự!'
      });
    } else {
      $('#first_name_length').removeClass('text-danger').addClass('text-muted');
    }
  });

  $('#form_input_user #lastname').on('input', function () {
    let value = $(this).val();

    $('#last_name_length').html(`${value.length}/30`);

    if (value.length > 30) {
      $('#last_name_length').removeClass('text-muted').addClass('text-danger');
      return validator.showErrors({
        'lastName': 'Độ dài không quá 30 kí tự!'
      });
    } else {
      $('#last_name_length').removeClass('text-danger').addClass('text-muted');
    }
  });

  $('#form_input_user #username').on('input', function () {
    let value = $(this).val();

    console.log('usrname: ', value)

    $('#user_name_length').html(`${value.length}/30`);

    if (value.length > 30) {
      $('#user_name_length').removeClass('text-muted').addClass('text-danger');
      return validator.showErrors({
        'userName': 'Độ dài không quá 30 kí tự!'
      });
    } else {
      $('#user_name_length').removeClass('text-danger').addClass('text-muted');
    }
  });

  findData(1);
});