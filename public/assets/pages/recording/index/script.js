$(function () {
  const $btnSearch = $('#search');
  const $frmSearch = $('#form_search_recording');
  const $tblSearch = $('#tableBody');

  $btnSearch.on('click', function (e) {
    let inputValue = $frmSearch.serializeArray();
    let queryData = {};

    inputValue.forEach((el) => {
      if(el.value && el.value !== '') {
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

        let html = '';

        result.data.forEach((item) => {
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
      },
      error: function (error) {
        toastr.error(error.responseJSON.message);
      },
    });
  }

  //Date picker
  $('#startTime').datetimepicker({ format: 'L' });
  $('#endTime').datetimepicker({ format: 'L' });

  //Date and time picker
  $('#startTime').datetimepicker({ icons: { time: 'far fa-clock' } });
  $('#endTime').datetimepicker({ icons: { time: 'far fa-clock' } });
});