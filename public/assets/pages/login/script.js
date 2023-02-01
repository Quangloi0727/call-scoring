$(function () {
  const $formNormal = $("#form_login")
  // validate form normal
  const validatorFormDelete = $formNormal.validate({
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
      let msgAlert = $(form).find(".alert-server")
      $.ajax({
        type: "POST",
        url: '/login',
        data: `userName=${$("#userName").val()}&password=${window.btoa($("#password").val())}`,
        success: (result) => {
          msgAlert
            .removeClass("d-none alert-danger")
            .addClass("alert-success")
            .find(".alert-content")
            .html("Thành công !")
          localStorage.removeItem('modalData', '')
          localStorage.removeItem('Advanced_Search_Report_Call_Rating', '')
          localStorage.removeItem('Advanced_Search_Report_Call_Rating_tapScoreScript', '')
          window.location.reload()
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
        }
      })
    }
  })
})
