$(function () {
  const $formNormal = $("#form_login")
  // validate form normal
  const validatorFormDelete = $formNormal.validate({
    rules: {
      // password: {
      //   required: true,
      // },
    },
    messages: {
      // password: {
      //   required: "Mật khẩu không được để trống!",
      // },
    },
    ignore: ":hidden",
    errorElement: "span",
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback")
      element.closest(".form-group").append(error)
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass("is-invalid")
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass("is-invalid")
    },
    submitHandler: function (form) {
      var dataString = $(form).serialize()
      let msgAlert = $(form).find(".alert-server")
      $.ajax({
        type: "POST",
        url: '/login',
        data: dataString,
        success: (result) => {
          console.log(result)
          msgAlert
            .removeClass("d-none alert-danger")
            .addClass("alert-success")
            .find(".alert-content")
            .html("Thành công")
          window.location.reload()

          //   setTimeout(() => {
          //     msgAlert.addClass("d-none");
          //     // trỏ sang trang thông báo tạo tài khoản thành công, cần vào mail để active
          //   }, 1500);
        },
        error: (err) => {
          console.log(err)
          let { errors, message } = err.responseJSON
          let msgFound

          if (errors) {
            msgFound = errors[0].msg

          } else {
            msgFound = message
          }
          msgAlert
            .removeClass("d-none alert-success")
            .addClass("alert-danger")
            .find(".alert-content")
            .html(`${msgFound}`)
        },
        // done: (result) => {
        //   console.log({ result });
        // },
      })
    },
  })
})
