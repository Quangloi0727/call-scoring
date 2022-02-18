$(function () {
  const $btnHandleFile = $('#btn_handle_file');
  const $btnImportData = $('#btn_import_data');
  const $btnCancel = $('#btn_cancel');
  const $btnDone = $('#btn_done');
  const $loadingData = $('.page-loader');
  const $containerInput = $('#container_input');
  const $containerNotification = $('#container_notification');
  const $lblTotalData = $('total_data');
  const $lblTotalSuccess = $('total_success');
  const $lblTotalMiss = $('total_miss');

  let fileTypes = ['xlsx', 'xls'];
  let maxSize = 10000000;
  let formatExcel = [
    'Extension',
    'HoVaTenDem',
    'MatKhau',
    'Quyen',
    'Ten',
    'TenDangNhap',
  ];
  let validateUserResult = [];
  let rawUserDatas = [];
  let uniqueUsernameResult = [];
  let uniqueExtensionResult = [];
  let filesData = {};
  let finalData = [];

  let previewNode = document.querySelector('#template');
  previewNode.id = '';
  let previewTemplate = previewNode.parentNode.innerHTML;
  previewNode.parentNode.removeChild(previewNode);

  let myDropzone = new Dropzone(document.body, {
    url: '/target-url',
    thumbnailWidth: 80,
    thumbnailHeight: 80,
    parallelUploads: 20,
    previewTemplate: previewTemplate,
    autoQueue: false,
    previewsContainer: '#previews',
    clickable: '.fileinput-button'
  });

  myDropzone.on('addedfile', function (file) {
    if (!file) return;

    console.log('file: ', file);

    let name = file.name;
    let size = file.size;
    let typeFile = name.split('.').pop();

    if (!fileTypes.includes(typeFile)) {
      myDropzone.removeFile(file);
      return toastr.error('Vui lòng nhập file Excel!');
    }

    if (size > maxSize) {
      myDropzone.removeFile(file);
      return toastr.error('Dung lượng file vượt quá 10MB!');
    }

    let fileReader = new FileReader();

    fileReader.readAsBinaryString(file);

    fileReader.onload = function (event) {
      let data = event.target.result;

      let rows = readExcel(data);

      if (!rows || rows.length <= 0) {
        myDropzone.removeFile(file);
        return toastr.error('Excel trống, vui lòng nhập dữ liệu!');
      }

      const firstRow = rows[0];

      Object.keys(firstRow).forEach((key) => {
        if (!formatExcel.includes(key.toString().trim())) {
          myDropzone.removeFile(file);
          return toastr.error('File sai format. Xin vui lòng kiểm tra lại format!');
        }
      });

      let fileId = file.upload.uuid;
      filesData[fileId] = rows;
    };
  });

  myDropzone.on('removedfile', function (file) {
    if (!file || file == '') return;

    let fileId = file.upload.uuid;

    if (!filesData[fileId]) return;

    return delete filesData[fileId];
  });

  function readExcel(data) {
    let workbook = XLSX.read(data, { type: 'binary' });
    let firstSheet = workbook.SheetNames[0];

    excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    return excelRows;
  }

  $btnHandleFile.on('click', function () {
    if (!myDropzone || !myDropzone.files || myDropzone.files.length <= 0) return;

    rawUserDatas = [];
    uniqueUsernameResult = [];
    uniqueExtensionResult = [];
    validateUserResult = [];
    finalData = [];

    $loadingData.show();

    console.log('filesData: ', filesData);

    // Nhóm dữ liệu file thành một mảng duy nhất
    Object.keys(filesData).forEach(function (key) {
      rawUserDatas = [...rawUserDatas, ...filesData[key]];
    });

    console.log('rawUserDatas: ', rawUserDatas);

    // Check trùng tên đăng nhập
    uniqueUsernameResult = _.uniq(rawUserDatas, function (user) {
      return user.TenDangNhap;
    });

    console.log('uniqueUsernameResult: ', uniqueUsernameResult);

    // Check trùng extension
    uniqueExtensionResult = _.uniq(uniqueUsernameResult, function (user) {
      return user.Extension;
    });

    console.log('uniqueExtensionResult: ', uniqueExtensionResult);

    // Validate danh sách user
    uniqueExtensionResult.forEach(function (user) {
      let validateResult = validateUser(user);

      if (validateResult && validateResult != null) {
        validateUserResult.push(validateResult);
      }
    });

    console.log('validateUserResult: ', validateUserResult);

    // Kiểm tra trùng lặp dữ liệu với database
    let names = _.pluck(validateUserResult, 'TenDangNhap');
    let extensions = _.pluck(validateUserResult, 'Extension');

    $.ajax({
      type: 'POST',
      url: '/users/checkDataUser',
      data: {
        names: names,
        extensions: extensions,
      },
      dataType: "text",
      success: function (data) {
        $loadingData.hide();

        const userExist = JSON.parse(data).data;

        console.log('userExist: ', userExist);

        validateUserResult.forEach((user) => {
          const isFound = userExist.find(function (item) {
            return item.userName == user.TenDangNhap || item.extension == user.Extension;
          });

          if (!isFound) {
            finalData.push(user);
          }
        });

        console.log('finalData: ', finalData);

        console.log('Số bản ghi cần nhập vào hệ thống: ', rawUserDatas.length);
        console.log('Số bản ghi hợp lệ: ', finalData.length);
        console.log('Số bản ghi hợp lệ: ', rawUserDatas.length - finalData.length);
      },
      error: function (error) {
        $loadingData.hide();

        console.log(`------- error ------- check data user`);
        console.log(error);
        console.log(`------- error ------- check data user`);

        return toastr.error(JSON.parse(error.responseText).message);
      },
    });
  });

  $btnImportData.on('click', function () {
    $loadingData.show();

    $.ajax({
      type: 'POST',
      url: '/users/importUser',
      data: { users: finalData },
      dataType: "text",
      success: function (data) {
        $loadingData.hide();

        const dataParse = JSON.parse(data);

        console.log('dataParse: ', dataParse);
      },
      error: function (error) {
        $loadingData.hide();

        console.log(`------- error ------- import user`);
        console.log(error);
        console.log(`------- error ------- import user`);

        return toastr.error('Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu import và thử lại!');
      },
    });
  });

  function validateUser(user) {
    let validateEmpty = [];
    let validateResult = [];

    // Kiểm tra field có bin trống hay không!
    formatExcel.forEach(function (key) {
      if (!user[key]) {
        validateEmpty.push(false);
      } else {
        validateEmpty.push(true);
      }
    });

    if (validateEmpty.includes(false)) {
      return null;
    }

    // Validate dữ liệu user
    Object.keys(user).forEach((key) => {
      if (key == 'HoVaTenDem') {
        validateResult.push(checkName(user[key]));
      }

      if (key == 'Ten') {
        validateResult.push(checkName(user[key]));
      }

      if (key == 'TenDangNhap') {
        validateResult.push(checkName(user[key]));
      }

      if (key == 'Extension') {
        validateResult.push(isEmpty(user[key]));
        validateResult.push(isNumber(user[key]));
      }

      if (key == 'Quyen') {
        validateResult.push(isEmpty(user[key]));
        validateResult.push(isNumber(user[key]));
      }

      if (key == 'MatKhau') {
        validateResult.push(checkPassword(user[key]));
      }
    });

    if (validateResult.includes(false)) {
      return null;
    }

    return user;
  }

  function isEmpty(value) {
    if (!value || value === '') return false;

    return true;
  }

  function isNumber(value) {
    if (isNaN(value)) return false;

    return true;
  }

  function checkName(value) {
    if (!isEmpty(value)) return false;
    if (value.length > 30) return false;

    return true;
  }

  function checkPassword(value) {
    let regex = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{8,}$/

    if (!isEmpty(value)) return false;
    if (!regex.test(value.toString().trim())) return false;

    return true;
  }
});