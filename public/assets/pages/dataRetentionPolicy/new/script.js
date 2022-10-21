$(function () {

  $(document).on('change', '#unlimitedSaveForCallGotPoint', function () {

    let checked = $('#unlimitedSaveForCallGotPoint').is(':checked');
    if (!checked) {
      return $('#valueSaveForCallGotPoint').prop("disabled", false);
    }

    $('#valueSaveForCallGotPoint').val('')
    return $('#valueSaveForCallGotPoint').prop("disabled", true);
  })


  // kiểm tra ô check box có tích chọn thì disable ô input nhập trong khoảng
  $(document).on('change', '#unlimitedSaveForCallNoPoint', function () {

    let checked = $('#unlimitedSaveForCallNoPoint').is(':checked');
    if (!checked) {
      return $('#valueSaveForCallNoPoint').prop("disabled", false);
    }

    $('#valueSaveForCallNoPoint').val('')
    return $('#valueSaveForCallNoPoint').prop("disabled", true);
  })

  // validate form 
  const validator = $('#frmDataRetentionPolicy').validate({
    rules: {
      valueSaveForCallGotPoint: {
        number: true,
        min: 0,
        max: 999
      },
      valueSaveForCallNoPoint: {
        number: true,
        min: 0,
        max: 999
      }
    },
    messages: {
      valueSaveForCallGotPoint: {
        required: "Tên nhóm không được để trống!",
        maxlength: 'Độ dài không quá 50 kí tự'
      },
      valueSaveForCallNoPoint: {
        required: "Giám sát không được để trống!",
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

})