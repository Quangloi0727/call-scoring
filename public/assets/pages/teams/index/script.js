$(function () {
  const $formCreateGroup = $('#form_input_group');
  const $formSearchGroup = $('#form_search_teams');
  const $buttonSearchGroup = $('#search_group');
  const $modalGroup = $('#modal_group');
  const $loadingData = $('.page-loader');
  const $inputLeader = $('#form_input_group #leader');
  const $inputName = $('#form_input_group #name');

  $.validator.setDefaults({
    submitHandler: function () {
      let filter = _.chain($('#form_input_group .input')).reduce(function (memo, el) {
        let value = $(el).val();
        if (value != '' && value != null) memo[el.name] = value;
        return memo;
      }, {}).value();

      $loadingData.show();

      $.ajax({
        type: 'POST',
        url: '/teams/insert',
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
  const validator = $formCreateGroup.validate({
    rules: {
      name: {
        required: true,
        maxlength: 50
      },
      leader: {
        required: true,
      },
      description: {
        maxlength: 500
      }
    },
    messages: {
      name: {
        required: "Tên nhóm không được để trống!",
        maxlength: 'Độ dài không quá 50 kí tự'
      },
      leader: {
        required: "Giám sát không được để trống!",
      },
      description: {
        maxlength: 'Độ dài không quá 500 kí tự'
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
  $modalGroup.on('hidden.bs.modal', function (e) {
    $formCreateGroup.trigger("reset");
    validator.resetForm();

    $('#name_length').html('0/50');
    $('#name_length').removeClass('text-danger').addClass('text-muted');

    $('#description_length').html('0/500');
    $('#description_length').removeClass('text-danger').addClass('text-muted');
  })

  $modalGroup.on('shown.bs.modal', function (e) {
    $formCreateGroup.trigger("reset");
    validator.resetForm();

    let leaderHtml = '';
    users.forEach(user => {
      leaderHtml += `
        <option value="${user.id}">
          ${user.fullName} (${user.userName})
        </option>
      `;
    });

    $inputLeader.html(leaderHtml);
    return $inputLeader.selectpicker('refresh');
  })

  //event tìm kiếm
  $buttonSearchGroup.on('click', function () {
    const pageNumber = 1;
    return findData(pageNumber);
  });

  $('#input_search_group').keypress(function (e) {
    let key = e.which;

    if (key != 13) return;

    const pageNumber = 1;
    return findData(pageNumber);
  });

  $inputName.bind('focusout', function (e) {
    e.preventDefault();
    const value = $(this).val();

    if (!value || value == '') return;

    $.ajax({
      type: 'GET',
      url: '/teams/search?name=' + value,
      cache: 'false',
      success: function () {
        return validator.showErrors({
          'name': 'Tên nhóm đã được sử dụng!'
        });
      },
    });
    console.log('aa: ', value);
  });

  function findData(page) {
    let queryData = {};
    let inputValue = $formSearchGroup.serializeArray();

    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value;
      }
    });

    queryData.page = page;
    queryData.limit = $('.sl-limit-page').val() || 10;

    $loadingData.show();

    $.ajax({
      type: 'GET',
      url: '/teams/getTeams?' + $.param(queryData),
      cache: 'false',
      success: function (result) {
        $loadingData.hide();

        createTable(result.data);
        return $('#paging_table').html(window.location.CreatePaging(result.paginator));
      },
      error: function (error) {
        $loadingData.hide();

        return toastr.error(JSON.parse(error.responseText).message);
      },
    });
  }

  // function 
  function createTable(data) {
    let html = '';
    data.forEach((item) => {
      let leaderHtml = '';
      let totalMember = item.member.filter((user) => user.role == 0);
      let leaders = item.member.filter((user) => user.role == 1);
      let htmlLeader = '';

      console.log('leaders: ', leaders)

      leaders.forEach((user) => {
        leaderHtml += `
          <a class="dropdown-item" type="button">
            ${user.fullName} (${user.userName})
          </a>
        `;
      });

      if(leaders.length > 1){
        htmlLeader = `<div class="dropdown show ${leaders.length > 0 ? '' : 'd-none'}">
          <a class="dropdown-custom dropdown-toggle" role="button" id="dropdown" 
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            ${leaders.length} quản lý
          </a>
          <div class="dropdown-menu" aria-labelledby="dropdown">
            ${leaderHtml}
          </div>
        </div>`;
      }else if(leaders.length > 0) {
        htmlLeader = `<div class="dropdown show">
          ${leaders[0].fullName} (${leaders[0].userName})
        </div>`;

      }
      html += `
        <tr>
          <td class="text-center">
            <a href=/teams/detail/${item.teamId}>${item.teamName != 'Default' ? item.teamName : 'Đội ngũ mặc định'}</a>
          </td>
          <td class="text-center">
            ${htmlLeader}            
          </td>
          <td class="text-center">${totalMember.length}</td>
          <td class="text-center">${item.description || ''}</td>
          <td class="text-center">${item.createdAt}</td>
          <td class="text-center">${item.createdName}</td>
        </tr>
      `;
    });

    return $('#tableBody').html(html);
  }

  $('#form_input_group #name').on('input', function () {
    let value = $(this).val();

    console.log('usrname: ', value)

    $('#name_length').html(`${value.length}/50`);

    if (value.length > 50) {
      $('#name_length').removeClass('text-muted').addClass('text-danger');
      return validator.showErrors({
        'name': 'Độ dài không quá 50 kí tự!'
      });
    } else {
      $('#name_length').removeClass('text-danger').addClass('text-muted');
    }
  });

  $('#form_input_group #description').on('input', function () {
    let value = $(this).val();

    $('#description_length').html(`${value.length}/500`);

    if (value.length > 500) {
      $('#description_length').removeClass('text-muted').addClass('text-danger');
      return validator.showErrors({
        'description': 'Độ dài không quá 500 kí tự!'
      });
    } else {
      $('#description_length').removeClass('text-danger').addClass('text-muted');
    }
  });

  $(document).on('change', '.sl-limit-page', function () {
    console.log('change sl-limit-page');
    findData(1);
  })

  findData(1)
});