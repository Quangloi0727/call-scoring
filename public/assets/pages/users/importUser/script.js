$(function () {
  const $btnHandleFile = $('#btn_handle_file');

  let fileTypes = ['xlsx', 'xls'];
  let maxSize = 10000000;

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

    console.log('addedfile');
    console.log('file: ', file);

    let name = file.name;
    let size = file.size;
    let typeFile = name.split('.').pop();

    console.log('name: ', name)
    console.log('typeFile: ', typeFile)

    if (!fileTypes.includes(typeFile)) {
      myDropzone.removeFile(file);
      return toastr.error('Vui lòng nhập file Excel!');
    }

    if (size > maxSize) {
      myDropzone.removeFile(file);
      return toastr.error('Dung lượng file vượt quá 10MB!');
    }

    let fileReader = new FileReader();

    fileReader.readAsBinaryString(file)

    fileReader.onload = function (event) {
      var data = event.target.result;

      console.log('data: ', data);
      // var cfb = XLS.CFB.read(data, { type: 'binary' });
      // var wb = XLS.parse_xlscfb(cfb);
      // // Loop Over Each Sheet
      // wb.SheetNames.forEach(function (sheetName) {
      //   // Obtain The Current Row As CSV
      //   var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);
      //   var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);

      //   $("#my_file_output").html(sCSV);
      //   console.log(oJS)
      // });
    };

    // // Hookup the start button
    // file.previewElement.querySelector('.start').onclick = function () {
    //   myDropzone.enqueueFile(file);
    // };
  });

  // Update the total progress bar
  myDropzone.on('totaluploadprogress', function (progress) {
    console.log('totaluploadprogress');
  });

  myDropzone.on('sending', function (file) {
    console.log('sending');
    // And disable the start button
    file.previewElement.querySelector('.start').setAttribute('disabled', 'disabled');
  });

  // Hide the total progress bar when nothing's uploading anymore
  myDropzone.on('queuecomplete', function (progress) {
    console.log('queuecomplete');
  });

  $('#actions .cancel').on('click', function () {
    console.log('action cancel')
    myDropzone.removeAllFiles(true);
  });

  $btnHandleFile.on('click', function () {
    console.log('myDropzone: ', myDropzone.files);
  });
});