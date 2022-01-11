$(function () {
  var $inputPageID = $('#inputPageID');
  var $inputChatID = $('#inputChatID');
  var $inputAccessToken = $('#inputAccessToken');
  var $inputPageName = $('#inputPageName');
  var $inputTernalURL = $('#inputTernalURL');
  var $inputTernalToken = $('#inputTernalToken');
  var $inputMessageWelcome = $('#inputMessageWelcome');
  var $inputMessageGoodbye = $('#inputMessageGoodbye');
  var $cancelButton = $('#cancelBtn');

  var $modalVariable = $('#modal-variable');
  var $btnSaveMessage = $('#btn_save_message');
  var $inputMessage = $('#message');

  var fieldName = '';

  $(document).on('click', '.input-message', function () {
    fieldName = $(this).data('target');
    var message = $(this).val();
    $inputMessage.val(message);
    $modalVariable.modal('show');
  });

  $(document).on('click', '.add-variable', function () {
    var targetValue = $(this).data('target');
    var cursorPos = $inputMessage.prop('selectionStart');
    var value = $inputMessage.val();
    var textBefore = value.substring(0, cursorPos);
    var textAfter = value.substring(cursorPos, value.length);
    $inputMessage.val(textBefore + targetValue + textAfter);
  });

  $btnSaveMessage.click(function () {
    var message = $inputMessage.val()
    if (fieldName == 'message-welcome') {
      $inputMessageWelcome.val(message);
    } else {
      $inputMessageGoodbye.val(message);
    }
    return $modalVariable.modal('hide');
  });

  var url = window.location.href;
  var string = url.substring(url.lastIndexOf('/') + 1).split('?');
  var id = string[0];
  $.validator.setDefaults({
    submitHandler: function () {
      var data = {};

      data = {
        pageID: $inputPageID.val(),
        pageName: $inputPageName.val(),
        chatEntryPointId: $inputChatID.val(),
        access_token: $inputAccessToken.val(),
        ternalURL: $inputTernalURL.val(),
        ternalToken: $inputTernalToken.val(),
        welcome: $inputMessageWelcome.val(),
        goodbye: $inputMessageGoodbye.val(),
        active: $('#checkboxActive:checked').val() ? true : false,
      }

      $.ajax({
        type: 'PUT',
        url: '/manage-pages/edit/' + id,
        cache: 'false',
        data: { data, _id: id },
        success: function (result) {
          toastr.success(result.message);
        },
        error: function (error) {
          toastr.error(error.responseJSON.message);
        },
      });
    }
  });
  $('#quickForm').validate({
    rules: {
      inputPageID: {
        required: true,
      },
      inputChatID: {
        required: true,
      },
      inputAccessToken: {
        required: true,
      },
      inputPageName: {
        required: true,
      },
      inputTernalURL: {
        required: true,
      },
      inputTernalToken: {
        required: true,
      },
      inputMessageWelcome: {
        required: true,
      },
      inputMessageGoodbye: {
        required: true,
      },
    },
    messages: {
      inputPageID: "Trường này không được để trống",
      inputChatID: "Trường này không được để trống",
      inputAccessToken: "Trường này không được để trống",
      inputPageName: "Trường này không được để trống",
      inputTernalURL: "Trường này không được để trống",
      inputTernalToken: "Trường này không được để trống",
      inputMessageWelcome: "Trường này không được để trống",
      inputMessageGoodbye: "Trường này không được để trống",
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

  $cancelButton.click(function () {
    window.history.back();
  });
});