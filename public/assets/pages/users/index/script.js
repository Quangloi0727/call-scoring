$(function () {

  $.validator.addMethod("pwcheck", function (value) {
    return /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{8,}$/.test(value) // consists of only these
    // && /[a-z]/.test(value) // has a lowercase letter
    // && /\d/.test(value) // has a digit
  });
  if (dataUser) {
    console.log("dataUser", paginator);
    createTable(dataUser);
    createPaging(paginator);
  }

  $.validator.setDefaults({
    submitHandler: function () {

      let inputValue = $('#form_input_user').serializeArray();
      let bodyData = {};
      inputValue.forEach((el) => {
        if (el.value && el.value !== '') {
          bodyData[el.name] = el.value;
        }
      });
      console.log("bodyData", bodyData)
      $('.page-loader').show();
      $.ajax({
        type: 'POST',
        url: '/users/insert',
        data: bodyData,
        dataType: "text",
        success: function (result) {
          $('#myModal').modal('hide')
          toastr.success('Tạo mới người dùng thành công')
          location.reload();
        },
        error: function (error) {
          console.log(error);
          $('.page-loader').hide();
          toastr.error(error.responseText);
        },
      });
    }
  });

  // validate form 
  var validator = $('#form_input_user').validate({
    rules: {
      firstname: {
        required: true,
        maxlength: 30,
      },
      lastname: {
        required: true,
        maxlength: 30,
      },
      userame: {
        required: true,
        maxlength: 30,
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
      firstname: {
        required: "Không được để trống Họ và Tên đệm",
        maxlength: "Số kí tự đối đa là 30/30"
      },
      lastname: {
        required: "Không được để trống Tên",
        maxlength: "Số kí tự đối đa là 30/30"
      },
      userame: {
        required: "Không được để trống Tên đăng nhập",
        maxlength: "Số kí tự đối đa là 30/30"
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
    console.log(page);
    return findData(page);
  });
  // event modal
  $('#modalUser').on('hidden.bs.modal', function (e) {
    console.log("aaaaaaaaaaaa");
    $('#form_input_user').trigger("reset");
  })
  $('#modalUser').on('shown.bs.modal', function (e) {
    $('#form_input_user').trigger("reset");
    validator.resetForm();
  })
  //event tìm kiếm
  $('#searchUser').on('click', function () {
    console.log("aaaaaaaaaa");
    return findData();
  });


  function findData(page) {
    let queryData = {};
    let inputValue = $('#form_search_user').serializeArray();

    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value;
      }
    });
    if (page) {
      queryData.page = page
    }
    $.ajax({
      type: 'GET',
      url: '/users/getUsers?' + $.param(queryData),
      cache: 'false',
      success: function (result) {
        console.log(result);
        createTable(result.data);
        createPaging(result.paginator);
        $('.page-loader').hide();
      },
      error: function (error) {
        console.log(error);
        $('.page-loader').hide();
        toastr.error(error.responseText);
      },
    });
  }
  // function 
  function createTable(data) {
    let html = '';

    data.forEach((item) => {
      html += `
            <tr>
              <td class="text-center">${item.fullname}</td>
              <td class="text-center">${item.username}</td>
              <td class="text-center">${item.extension}</td>
              <td class="text-center">${item.group ? item.group : ''}</td>
              <td class="text-center">${moment(item.createAt).format('DD/MM/YYYY HH:mm:ss')}</td>
              <td class="text-center">${item.createBy}</td>
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
});