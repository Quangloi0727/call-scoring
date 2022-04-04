const $buttonSearch = $('#search');
const $buttonExportExcel = $('#export_excel')
const $formSearch = $('#form_search');
const $tableData = $('#table_data');
// const $containerPaging = $('#paging_table');
const $buttonAdvancedSearch = $('#btn_advanced_search');
const $formAdvancedSearch = $('#form_advanced_search');
const $modalSearch = $('#modal_search');
const $buttonCancelModal = $('#btn_cancel');
const $buttonClearFilter = $('#clear_local_storage');
const $buttonExportExcelAdvanced = $('#export_excel_advanced');

const DEFAULT_SEARCH = 'default_search';
const ADVANCED_SEARCH = 'advance_search';

const $modal_customs_table = $("#modal_customs_table");
const $checkInput = $("#sortable input:checkbox");
const $tableRecording = $("#tableRecording");
const $selectAll = $("#select-all");
const $btn_save_customs = $("#btn_save_customs")
let searchType = DEFAULT_SEARCH;

function bindClick() {
  $buttonSearch.on('click', function (e) {
    let page = 1;
    let formData = getFormData('form_search');

    console.log('formData: ', formData)
    if(formData.startTime){
      $('[name="startTime"]').val(formData.startTime);
    }

    if(formData.endTime){
      $('[name="endTime"]').val(formData.endTime);
    }
    searchType = DEFAULT_SEARCH;

    return findData(page, null, formData);
  });

  // enter
  $('#form_search input[name="caller"],#form_search input[name="called"]').keypress('enter', function (e) {
    if (e.which == 13) {
      let page = 1;
      let formData = getFormData('form_search');

      console.log('formData: ', formData)

      searchType = DEFAULT_SEARCH;

      findData(page, null, formData);
    }else {
      // console.log('khong tim kiem');
    }
    // return false;
    
  });

  $buttonAdvancedSearch.on('click', function () {
    let page = 1;
    let formData = getFormData('form_advanced_search');

    searchType = ADVANCED_SEARCH;

    console.log('formData: ', formData)

    localStorage.setItem('modalData', JSON.stringify(formData));
    if(formData.startTime){
      $('[name="startTime"]').val(formData.startTime);
    }

    if(formData.endTime){
      $('[name="endTime"]').val(formData.endTime);
    }

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
    localStorage.removeItem('modalData', '');

    $formAdvancedSearch.trigger("reset");
    $('.selectpickerAdvanced').selectpicker('refresh');

    return;
  });



  // event popup custom table
  $("#sortable").sortable();

  // $checkInput.prop('checked', true);

  // $chk.click(function () {
  //   var colToHide = $tableRecording.find("." + $(this).attr("name"));
  //   console.log($(this).is(":checked"));
  //   $(colToHide).toggle();
  // });
  $btn_save_customs.click(function (event) {
    let listCheck = [];
    $checkInput.each(function (index) {
      // đoạn này e check và cho ẩn hiện luôn ko có save data nguyenvc
      var colToHide = $tableRecording.find("." + $(this).attr("name"));
      if ($(this).is(":checked") == false) {

        $(colToHide).toggle(false);

      } else {
        $(colToHide).toggle(true);
      }
      return $modal_customs_table.modal('hide');
    });
    let obj = {}
    $("#sortable input:checkbox").each(function () {
      let key = $(this).attr("name")
      let value = $(this).is(":checked")
      obj[key] = value

    });
    SaveConfigurationColums(obj);
  });

  $selectAll.click(function (event) {
    if (this.checked) {
      // Iterate each checkbox
      $(':checkbox').each(function () {
        this.checked = true;
      });
    } else {
      $(':checkbox').each(function () {
        this.checked = false;
      });
    }
  });

  $(document).on('change', '.sl-limit-page', function () {
    console.log('change sl-limit-page');
    let formData = {};

    if (searchType === DEFAULT_SEARCH) {
      formData = getFormData('form_search');
    } else if (searchType === ADVANCED_SEARCH) {
      formData = getFormData('form_advanced_search');
    }

    return findData(1, null, formData);
  })

}

function SaveConfigurationColums(data) {

  $.ajax({
    type: 'POST',
    url: '/recording/SaveConfigurationColums',
    data: data,
    dataType: "text",
    success: function () {
      return location.reload();
    },
    error: function (error) {

      return toastr.error(JSON.parse(error.responseText).message);
    },
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
  queryData.limit = $('.sl-limit-page').val() || 10;

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

      createTable(result.data, result.ConfigurationColums);
      return $('#paging_table').html(window.location.CreatePaging(result.paginator));

    },
    error: function (error) {
      $('.page-loader').hide();
      console.log(error)
      return toastr.error(error.responseJSON.message);
    },
  });
}

function handleAudio() {
  setTimeout(() => {
    $(".audio-element").on({
      play:function(){ // the audio is playing!
        // $(".audio-element").pause();
        // _.each($('.audio-element'), function (el) {
        //   var __audio = $(el)[0];
        //   __audio.pause();
        //   // if (__audio != audio && !__audio.paused) {
                
        //         // $(el).closest('td').find('.zmdi-play').show();
        //         // $(el).closest('td').find('.zmdi-pause').hide();
        //     // }
        // });

        // let _audio = $(this)[0];
        // _audio.play();

        console.log('play', )
      },
      pause:function(){ // the audio is paused!
        console.log('páue', this)
      },
    })
  }, 50);
}
function createTable(data, ConfigurationColums) {
  let html = '';
  let headerDefault = {
    direction: "Hướng gọi",
    agentName: "Điện thoại viên",
    teamName: "Nhóm",
    caller: "Số gọi đi",
    called: "Số gọi đến",
    origTime: "Ngày giờ gọi",
    duration: "Thời lượng",
    audioHtml: "Ghi âm"
  }
  console.log(data);
  if (ConfigurationColums) {
    let objColums = JSON.parse(ConfigurationColums);
    //header table
    let headerTable = '';
    let popupHtml = ''
    for (const [key, value] of Object.entries(objColums)) {
      headerTable += `<th class="text-center sortHeader ${key} ${value == 'true' ? '' : 'd-none'}">${headerDefault[key]}</th>`;
      popupHtml += `<li class="mb-3 border-bottom">
        <input class="form-check-input" type="checkbox" name="${key}" ${value == 'true' ? '' : 'checked'}/>
        ${headerDefault[key]} <i class="fas fa-arrows"></i>
        <span style="float: right;">
        <i class="fas fa-arrows-alt" title="Giữ kéo/thả để sắp xếp"></i>
        </span>
      </li>`
    }
    console.log(popupHtml);
    $('#tableRecording tr').html(headerTable);
    $('#sortable').html(popupHtml)

    // body data
    data.forEach((item, element) => {
      let audioHtml = '';
      let agentName = item.fullName && `${item.fullName} (${item.userName})` || '';

      if (item.recordingFileName && item.recordingFileName !== '') {
        audioHtml = `
        <td class="text-center audioHtml">
          <audio controls preload="none" class="audio-element">
            <source  src="${item.recordingFileName}" type="audio/wav">
            Your user agent does not support the HTML5 Audio element.'
          </audio>
        </td>
        `;
      }
      let tdTable = ''
      for (const [key, value] of Object.entries(objColums)) {
        if (key == 'audioHtml' && value == 'true') { tdTable += audioHtml }
        else if (key == 'agentName' && value == 'true') { tdTable += ` <td class="text-center agentName">${agentName}</td>` }
        else { tdTable += ` <td class="text-center ${key} ${value == 'true' ? '' : 'd-none'}">${item[key] || ''}</td>` }
      }
      html += `
      <tr data-ele="${element}">
        ${tdTable}
      </tr>
      `
    });
    $tableData.html(html);
    // handleAudio();
    return ;
  }
  else {
    data.forEach((item, element) => {
      let audioHtml = '';
      let agentName = item.fullName && `${item.fullName} (${item.userName})` || '';

      if (item.recordingFileName && item.recordingFileName !== '') {
        audioHtml = `
          <audio controls preload="none" class="audio-element">
            <source  src="${item.recordingFileName}" type="audio/wav">
            Your user agent does not support the HTML5 Audio element.'
          </audio>
        `;
      }

      html += `
        <tr data-ele="${element}">
          <td class="text-center direction">${item.direction || ''}</td>
          <td class="text-center agentName">${agentName}</td>
          <td class="text-center teamName">${item.teamName || ''}</td>
          <td class="text-center caller">${item.caller}</td>
          <td class="text-center called">${item.called}</td>
          <td class="text-center origTime">${item.origTime}</td>
          <td class="text-center duration">${item.duration}</td>
          <td class="text-center audioHtml">${audioHtml}</td>
        </tr>
      `;
    });

    $tableData.html(html);
    // handleAudio();
    return ;
  }
}

function downloadFromUrl(url) {
  let link = document.createElement('a');

  link.download = '';
  link.href = url;

  return link.click();
}

$(function () {
  

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
      console.log(`key: ${key}`, modalData[key])
      $(`#val_${key}`).val(modalData[key]);
      if($(`#${key}`).length > 0) {
        console.log(moment(modalData[key], 'DD/MM/YYYY')._d);
        
        $(`#${key}`).datetimepicker({
          format: 'DD/MM/YYYY',
          defaultDate: moment(modalData[key], 'DD/MM/YYYY')._d,
          icons: { time: 'far fa-clock' }
        });
      }
    });

    $('.selectpickerAdvanced').selectpicker('refresh');

    findData(page, null, modalData);
  } else {
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