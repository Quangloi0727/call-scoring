$(function () {
  const $formCreateGroup = $('#form_input_group');
  const $formSearchGroup = $('#form_search_groups');
  const $buttonSearchGroup = $('#search_group');
  const $btnAddScoreScript = $('#btnAddScoreScript');
  const $modalGroup = $('#modal_group');
  const $loadingData = $('.page-loader');
  const $inputLeader = $('#form_input_group #leader');
  const $inputName = $('#form_input_group #name');

  //

  //event phân trang 
  $(document).on('click', '.zpaging', function () {
    let page = $(this).attr('data-link');
    return findData(page);
  });

  //event tìm kiếm
  $buttonSearchGroup.on('click', function () {
    const pageNumber = 1;
    return findData(pageNumber);
  });
  $btnAddScoreScript.on('click', function () {
    window.location.replace('/scoreScripts/new')
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
      url: '/groups/search?name=' + value,
      cache: 'false',
      success: function (error) {
        return validator.showErrors({
          'name': window.location.MESSAGE_ERROR["QA-002"]
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
      url: '/scoreScripts/gets?' + $.param(queryData),
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
      console.log({item});

      html += `
        <tr>
          <td class="text-center">
            <a href=/scorescripts/detail/${item.id}>${item.name}</a>
          </td>
          <td class="text-center">${item.status || ''}</td>
          <td class="text-center">${item.createdAt || ''}</td>
          <td class="text-center">${item.created || ''}</td>
          <td class="text-center">${item.updatedAt || ''}</td>
          <td class="text-center">${item.updated || ''}</td>
        </tr>
      `;
    });

    return $('#tableBody').html(html);
  }

  $('#form_input_group #name').on('input', function () {
    let value = $(this).val();

    console.log('usrname: ', value)

    $('#name_length').html(`${value.length}/50`);

    // if (value.length > 50) {
    //   $('#name_length').removeClass('text-muted').addClass('text-danger');
    //   return validator.showErrors({
    //     'name': 'Độ dài không quá 50 kí tự!'
    //   });
    // } else {
    //   $('#name_length').removeClass('text-danger').addClass('text-muted');
    // }
  });

  $('#form_input_group #description').on('input', function () {
    let value = $(this).val();

    $('#description_length').html(`${value.length}/500`);

    // if (value.length > 500) {
    //   $('#description_length').removeClass('text-muted').addClass('text-danger');
    //   return validator.showErrors({
    //     'description': 'Độ dài không quá 500 kí tự!'
    //   });
    // } else {
    //   $('#description_length').removeClass('text-danger').addClass('text-muted');
    // }
  });

  $(document).on('change', '.sl-limit-page', function () {
    console.log('change sl-limit-page');
    findData(1);
  })

  findData(1)
});