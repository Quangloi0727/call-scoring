$(function () {
  const $formChangePassword = $('#form_change_password');
  const $buttonCancelChangePassword = $('#cancelChangePassword');
  const $loadingData = $('.page-loader');

  $.validator.addMethod('pwcheck', function (value) {
    return /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{8,}$/.test(value);
  });

  $.validator.setDefaults({
    submitHandler: function () {
      let filter = _.chain($('#form_change_password .input')).reduce(function (memo, el) {
        let value = $(el).val();
        if (value != '' && value != null) memo[el.name] = value;
        return memo;
      }, {}).value();

      $loadingData.show();

      $.ajax({
        type: 'POST',
        url: '/users/changePassword',
        data: filter,
        dataType: 'text',
        success: function () {
          $loadingData.hide();

          $.confirm({
            title: 'Thông báo!',
            content: 'Thay đổi mật khẩu thành công, vui lòng đăng nhập lại!',
            buttons: {
              'Đồng ý': {
                action: function () {
                  return window.location.replace('/logout');
                }
              }
            }
          });
        },
        error: function (error) {
          $loadingData.hide();

          return toastr.error(JSON.parse(error.responseText).message);
        },
      });
    }
  });

  // validate form 
  const validator = $formChangePassword.validate({
    rules: {
      newPassword: {
        required: true,
        pwcheck: true
      },
      oldPassword: {
        required: true,
      },
      repeatOldPassword: {
        required: true,
        equalTo: "#oldPassword"
      }
    },
    messages: {
      newPassword: {
        required: "Vui lòng nhập mật khẩu mới",
        pwcheck: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ HOA, chữ thường và số"
      },
      oldPassword: {
        required: "Vui lòng nhập mật khẩu cũ",
      },
      repeatOldPassword: {
        required: "Vui lòng nhập lại mật khẩu cũ",
        equalTo: "Mật khẩu không khớp"
      }
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.form-group').append(error);
    },
    highlight: function (element) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element) {
      $(element).removeClass('is-invalid');
    }
  });

  $buttonCancelChangePassword.on('click', function () {
    return window.history.back();
  });
});