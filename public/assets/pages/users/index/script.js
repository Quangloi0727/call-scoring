$(function () {
  const $formCreateUser = $('#form_input_user')
  const $formEditUser = $('#form_edit_user')
  const $formBlockUser = $('#formBlockUser')
  const $modalCreateUser = $('#modalUser')
  const $loadingData = $('.page-loader')
  const $buttonSearchUser = $('#searchUser')
  const $formSearchUser = $('#form_search_user')
  const $modalEditUser = $('#modalEditUser')
  const $modalResetPassword = $('#modalResetPassword')
  const $modalBlockUser = $('#modalBlockUser')

  $.validator.addMethod("pwcheck", function (value) {
    return /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{8,}$/.test(value)
  })

  $(document).on('click', '#submitUser', function () {
    let filter = _.chain($('#form_input_user .input')).reduce(function (memo, el) {
      let value = $(el).val()
      if (value != '' && value != null) memo[el.name] = value
      return memo
    }, {}).value()

    _AjaxData('/users/insert', 'POST', JSON.stringify(filter), { contentType: "application/json" }, function (resp) {
      if (resp.code == 500) return toastr.error(resp.message)

      toastr.success(resp.message)
      
      return setTimeout(() => {
        location.reload()
      }, 2500)
    })
  })


  $(document).on('click', '#btn-save-edit-user', function () {
    let filter = _.chain($('#form_edit_user .input')).reduce(function (memo, el) {
      let value = $(el).val()
      if (value != '' && value != null) memo[el.name] = value
      return memo
    }, {}).value()
    $loadingData.show()
    formEditUser_validator.form()
    $.ajax({
      type: 'POST',
      url: '/users/updateUser',
      data: filter,
      dataType: "text",
      success: function () {
        $loadingData.hide()
        toastr.success('Cập nhật thành công')
        toastr.options = {
          closeButton: true,
          onCloseClick: () => {
            location.reload()
          }
        }

        $modalEditUser.modal('hide')
        return setTimeout(() => {
          location.reload()
        }, 2500)
      },
      error: function (error) {
        $loadingData.hide()
        return toastr.error(JSON.parse(error.responseText).message)
      },
    })
  })
  // validate form 
  const validator = $formCreateUser.validate({
    rules: {
      firstName: {
        required: true,
        maxlength: 30
      },
      lastName: {
        required: true,
        maxlength: 30
      },
      userName: {
        required: true,
        maxlength: 30
      },
      extension: {
        required: true,
        number: true
      },
      password: {
        required: true,
        pwcheck: true
      },
      repeat_password: {
        required: true,
        equalTo: "#password"
      }
    },
    messages: {
      firstName: {
        required: "Không được để trống Họ và Tên đệm",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      lastName: {
        required: "Không được để trống Tên",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      userName: {
        required: "Không được để trống Tên đăng nhập",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      extension: {
        required: "Không được để trống extension",
        number: "chỉ nhập số"
      },
      password: {
        required: "Không được để trống password",
        pwcheck: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ HOA, chữ thường và số"
      },
      repeat_password: {
        required: "Không được để trống",
        equalTo: "Mật khẩu không khớp"
      }
    },
    ignore: ":hidden",
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback')
      element.closest('.form-group').append(error)
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid')
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid')
    }
  })
  const formEditUser_validator = $formEditUser.validate({
    rules: {
      'edit-userName': {
        required: true,
        maxlength: 30
      },
      'edit-lastName': {
        required: true,
        maxlength: 30
      },
      'edit-firstName': {
        required: true,
        maxlength: 30
      },
      'edit-extension': {
        required: true,
        number: true
      }
    },
    messages: {
      'edit-userName': {
        required: "Không được để trống Tên đăng nhập",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      'edit-lastName': {
        required: "Không được để trống Tên",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      'edit-firstName': {
        required: " Không được để trống Họ và Tên đệm",
        maxlength: 'Độ dài không quá 30 kí tự'
      },
      'edit-extension': {
        required: "Không được để trống extension",
        number: "chỉ nhập số"
      }
    },
    ignore: ":hidden",
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback')
      element.closest('.form-group').append(error)
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid')
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid')
    }
  })

  const formBlockUser_validator = $formBlockUser.validate({
    rules: {
      'blockUser_extension_input': {
        required: true,
        number: true
      }
    },
    messages: {
      'blockUser_extension_input': {
        required: "Không được để trống extension",
        number: "Chỉ nhập số"
      }
    },
    ignore: ":hidden",
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback')
      element.closest('.form-group').append(error)
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid')
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid')
    }
  })


  //event phân trang 
  $(document).on('click', '.zpaging', function () {
    let page = $(this).attr('data-link')
    return findData(page)
  })

  // event modal create user
  $modalCreateUser.on('hidden.bs.modal', function (e) {
    $formCreateUser.trigger("reset")
    $('#form_input_user .selectpicker').selectpicker('refresh')
    validator.resetForm()

    $('#first_name_length').html('0/30')
    $('#first_name_length').removeClass('text-danger').addClass('text-muted')

    $('#last_name_length').html('0/30')
    $('#last_name_length').removeClass('text-danger').addClass('text-muted')

    $('#user_name_length').html('0/30')
    $('#user_name_length').removeClass('text-danger').addClass('text-muted')
  })

  $modalCreateUser.on('shown.bs.modal', function (e) {
    $formCreateUser.trigger("reset")
    validator.resetForm()
  })


  // event modal edit user
  $modalEditUser.on('hidden.bs.modal', function (e) {
    $('#form_edit_user .selectpicker').selectpicker('refresh')
    formEditUser_validator.resetForm()

    $('#edit_first_name_length').html('0/30')
    $('#edit_first_name_length').removeClass('text-danger').addClass('text-muted')

    $('#edit_last_name_length').html('0/30')
    $('#edit_last_name_length').removeClass('text-danger').addClass('text-muted')

    $('#edit_user_name_length').html('0/30')
    $('#edit_user_name_length').removeClass('text-danger').addClass('text-muted')
  })

  $modalEditUser.on('shown.bs.modal', function (e) {
    formEditUser_validator.resetForm()
  })
  //event tìm kiếm
  $buttonSearchUser.on('click', function () {
    const pageNumber = 1
    return findData(pageNumber)
  })

  function findData(page) {
    let queryData = {}
    let inputValue = $formSearchUser.serializeArray()

    inputValue.forEach((el) => {
      if (el.value && el.value !== '') {
        queryData[el.name] = el.value
      }
    })

    queryData.page = page
    queryData.limit = $('.sl-limit-page').val() || 10

    $loadingData.show()

    $.ajax({
      type: 'GET',
      url: '/users/getUsers?' + $.param(queryData),
      cache: 'false',
      success: function (result) {
        $loadingData.hide()
        createTable(result.data, result.currentUser)
        return $('#paging_table').html(window.location.CreatePaging(result.paginator))
      },
      error: function (error) {
        $loadingData.hide()

        return toastr.error(error.message)
      },
    })
  }

  // function 
  function createTable(data, currentUser) {
    let contentTableLeft = ''
    let contentTableRight = ''
    let found
    console.log(USER_ROLE)
    console.log(`Data table của user:`)
    console.log(data)

    if (currentUser) {
      found = currentUser.roles.find(element => element.role == 2)
      if (found) {
        $(".admin-account").html(currentUser.fullName)
      }
    }
    data.forEach((item) => {
      let teamHtml = ''
      let statusHtml = `<span class="badge ${item.isActive == 1 ? 'badge-success' : 'badge-danger'}">${item.isActive == 1 ? 'Đang hoạt động' : 'Đã khóa'}</span>`
      let updatedAtHtml = '-'
      let lockButton = `
        <span class="p-1 btn-action btn-modal-block-user" title="Mở khóa người dùng"
        data-extension="${item.extension}" data-userName="${item.userName}" data-id="${item.id}"
        data-isActive="${item.isActive}">
          <i class="fas ${item.isActive == 1 ? 'fa-lock' : 'fa-unlock'}"></i>
        </span>
      `

      item.ofTeams.forEach(element => {
        teamHtml += `
          <a href="/teams/detail/${element.teamId}">
            <u>${element.teamName}</u>
            &nbsp;
          </a>
        `
      })

      if (item.createdAt != item.updatedAt) {
        updatedAtHtml = moment(item.updatedAt).format('DD/MM/YYYY HH:mm:ss')
      }

      let rolesHtml = ``
      Object.keys(USER_ROLE).forEach((ele) => {
        if (item.roles.length > 0) {
          let found = item.roles.find(element => element.role === USER_ROLE[ele].n)
          if (found) {
            rolesHtml += (`${USER_ROLE[ele].t}` + ',')
          }
        }
      })
      contentTableLeft += `
        <tr class="text-center">
          <td>${item.fullName}</td>
          <td>${item.userName}</td>
          <td>
            <span class="p-1 btn-action btn-edit-user" title="Chỉnh sửa thông tin người dùng"
              data-id="${item.id}">
              <i class="fas fa-pencil"></i>
            </span>
            ${lockButton}
            <span class="p-1 btn-action ${found ? "btn-modal-reset-password" : ""}" title="${found ? "Reset lại mật khẩu" : "Bạn không có quyền sử dụng chức năng này"}" 
              data-id="${item.id}" data-userName="${item.userName}" ><i class="fas fa-sync"></i>
            </span>
          </td>
        </tr>
      `

      contentTableRight += `
        <tr class="text-center">
          <td title="${rolesHtml}"><div class="text-truncate" style="width: 200px;">${rolesHtml}</div></td>
          <td>${item.extension}</td>
          <td>${teamHtml}</td>
          <td>${statusHtml}</td>
          <td>${moment(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}</td>
          <td>${item.userCreate.fullName}</td>
          <td>${updatedAtHtml}</td>
        </tr>
      `
    })

    $('.content-table-left').html(contentTableLeft)
    return $('.content-table-right').html(contentTableRight)
  }

  $(document).on('click', '.btn-edit-user', function () {
    let userId = $(this).attr('data-id')

    if (!userId || userId == '') return

    $.ajax({
      type: 'GET',
      url: 'users/search?id=' + userId,
      cache: 'false',
      success: function (data) {
        console.log('data: ', data)
        if (!data) return

        const user = data.data
        let inputs = $('#form_edit_user [name]')

        $.each(inputs, function (i, input) {
          var split = $(input).attr('name').split('-')[1]
          $(input).val(user[split])
        })

        if (user.roles.length > 0) {
          let arr = []
          user.roles.map((el) => {
            arr.push(el.role)
          })
          $('select[name=edit_roles]').val(arr)
          $('.selectpicker').selectpicker('refresh')
        }

        $modalEditUser.modal('show')
      },
      error: function (error) {
        return toastr.error(JSON.parse(error.responseText).message)
      }
    })
  })

  $(document).on('click', '.btn-modal-reset-password', function () {

    let _generatePassword = generatePassword()
    let userName = $(this).attr('data-userName')
    let userId = $(this).attr("data-id")

    $('input[name=reset-password]').val(_generatePassword)
    $('#btn-reset-password').attr("data-id", userId)
    $('#name_user_reset_password').text(userName)

    $modalResetPassword.modal('show')
  })

  $(document).on('click', '#copy-to-clipboard', function () {
    copyToClipboard()
  })

  $(document).on('click', '#btn-reset-password', function () {

    let filter = {}
    filter.newPassword = $('#reset-password').val()
    filter.idUser = $(this).attr("data-id")
    filter.adminPassword = $('#admin-password').val()

    $.ajax({
      type: 'POST',
      url: '/users/resetPassWord',
      data: filter,
      dataType: 'text',
      success: function () {
        $loadingData.hide()
        toastr.success('Reset password thành công!')
      },
      error: function (error) {

        console.log(error)
        return toastr.error(JSON.parse(error.responseText).message)
      },
    })
  })

  $(document).on('click', '.btn-modal-block-user', function () {

    let userId = $(this).attr('data-id')
    let extension = $(this).attr('data-extension')
    let userName = $(this).attr('data-userName')
    let isActive = $(this).attr('data-isActive')

    let title = `Khóa tài khoản người dùng`
    let html = `
    Tài khoản <strong>${userName}</strong> sẽ bị khóa
    <br>
    Người dùng sẽ không thể đăng nhập được vào hệ thống
    <br>
    Số máy lẻ <strong>${extension}</strong> của người dùng có thẻ được tái sử dụng
    <br>
    `
    if (isActive != 1) {
      html = `Tài khoản <strong>${userName}</strong> sẽ được mở khóa`
      title = `Mở khóa tài khoản người dùng`

      // check xem extension đã của user bị block đã được sử dụng hay chua
      let queryData = {}
      queryData.extension = extension
      queryData.isActive = 1
      $.ajax({
        type: 'GET',
        url: '/users/getUsers?' + $.param(queryData),
        cache: 'false',
        success: function (result) {
          if (result.data.length >= 1) {
            $('#blockUser_extension').removeClass('d-none')
            $("#blockUser_extension_input").val("")
            $("#old_extension_User").text(extension)
          } else {
            $('#blockUser_extension_input').val(extension)
          }

        },
        error: function (error) { console.log("tìm kiếm user theo extension lỗi", error) },
      })
    } else {
      console.log("aaaaaaaaaaaa")
      $('#blockUser_extension_input').val(extension)
      $('#blockUser_extension').addClass("d-none")
    }
    // render nội dung lên modal
    console.log(title)
    $('#body-noti-block').html(html)
    $('#btn-block-user').html(isActive == 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản')
    if (!userId || userId == '') return
    $('#btn-block-user').attr("data-id", userId)
    $('#btn-block-user').attr("data-blockUser", isActive)
    $('#modalBlockUser h4.modal-title').text(title)

    $modalBlockUser.modal('show')
    formBlockUser_validator.resetForm()
  })

  $(document).on('click', '#btn-block-user', function () {
    let isActive = $(this).attr("data-blockUser")
    let body = {}
    body.blockUser = (isActive == '1' ? '0' : '1')
    body.idUser = $(this).attr("data-id")
    body.adminPassword = $('#admin_password').val()
    body.extension = $('#blockUser_extension_input').val()
    formBlockUser_validator.form()
    $.ajax({
      type: 'POST',
      url: '/users/blockUser',
      data: body,
      dataType: 'text',
      success: function () {
        $loadingData.hide()

        toastr.success(isActive == '1' ? 'Đã khóa người dùng thành công' : 'Đã mở khóa người dùng thành công')
        return setTimeout(() => {
          location.reload()
        }, 1500)
      },
      error: function (error) {
        return toastr.error(JSON.parse(error.responseText).message)
      },
    })
  })

  $(document).on('change', '.sl-limit-page', function () {
    console.log('change sl-limit-page')
    findData(1)
  })

  $(document).on('change', 'select[name=edit_roles]', function () {

    let html = `<span id="edit_roles_error" class="error" 
    style="width: 100%;margin-top: 0.25rem;font-size: 80%;color: #dc3545;">
    Hệ thống sẽ gỡ người dùng ra khỏi tất cả các nhóm/đội ngũ nếu có</span>`
    if ($(this).val().length == 0) {
      $('.edit-roles').append(html)
    } else $('span[id="edit_roles_error"]').remove()

  })
  /// random password
  function generatePassword() {

    var length = 8,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = ""
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n))
    }

    return retVal
  }
  // copyToClipboard
  function copyToClipboard(element) {

    var copyText = document.getElementById("reset-password")

    /* Select the text field */
    copyText.select()
    copyText.setSelectionRange(0, 99999) /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value)

    /* Alert the copied text */
    toastr.success("Copied the text: " + copyText.value)

  }

  function warningLengthInput(formId, inputId, warningClass) {

    $(`#${formId} #${inputId}`).on('input', function () {
      let value = $(this).val()

      $(`#${warningClass}`).html(`${value.length}/30`)

      if (value.length > 30) {
        $(`#${warningClass}`).removeClass('text-muted').addClass('text-danger')
        return validator.showErrors({
          'firstName': 'Độ dài không quá 30 kí tự!'
        })
      } else {
        return $(`#${warningClass}`).removeClass('text-danger').addClass('text-muted')
      }
    })

  }

  warningLengthInput('form_input_user', 'firstname', 'first_name_length')
  warningLengthInput('form_input_user', 'lastname', 'last_name_length')
  warningLengthInput('form_input_user', 'username', 'user_name_length')
  warningLengthInput('form_edit_user', 'edit-firstname', 'edit_first_name_length')
  warningLengthInput('form_edit_user', 'edit-lastname', 'edit_last_name_length')
  warningLengthInput('form_edit_user', 'edit-username', 'edit_user_name_length')

  findData(1)
})