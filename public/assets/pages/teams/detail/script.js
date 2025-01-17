$(function () {
  const $formEditGroup = $('#form_edit_group')
  const $formDeleteGroup = $('#form_delete_group')
  const $inputName = $('#form_edit_group #name')
  const $inputLeader = $('#form_edit_group #leader')
  const $inputDescription = $('#form_edit_group #description')
  const $modelEditGroup = $('#modal_edit_group')
  const $loadingData = $('.page-loader')
  const $buttonAddUser = $('#add_user')
  const $inputMember = $('#members')
  const $containerUsers = $('#list_user')
  const $inputSearchMember = $('#search_member')
  const $buttonSearchMember = $('#btn_search_member')

  function getMember(name) {
    let data = {}

    data.teamId = team.id

    if (name && name.trim() !== '') data.name = name

    $loadingData.show()

    $.ajax({
      type: 'GET',
      url: '/teams/user-of-team?' + $.param(data),
      cache: 'false',
      success: function (result) {
        $loadingData.hide()

        if (!result) return

        let userHtml = ''

        result.data.forEach(user => {
          userHtml += `
            <div class="col-sm-2 col-md-3 col-lg-4">
              <div class="border rounded border-primary info-box shadow-none">
                <span class="info-box-icon">
                  <img class="img-circle img-bordered-sm" src="/dist/img/user.png" alt="user image">
                </span>
                <div class="info-box-content">
                  <span class="info-box-text font-weight-bold">
                    ${user.fullName} (${user.userName})
                  </span>
                </div>
                <span class="remove-user" data-id="${user.userId}">
                  <i class="fas fa-times"></i>
                </span>
              </div>
            </div>
          `
        })

        return $containerUsers.html(userHtml)
      },
      error: function (error) {
        $loadingData.hide()

        let errorParse = JSON.parse(error.responseText)

        return toastr.error(errorParse.message)
      },
    })
  }

  function getUserAvailable() {
    $.ajax({
      type: 'GET',
      url: '/teams/get-user-available',
      cache: 'false',
      success: function (result) {
        if (!result) return

        let userHtml = ''

        result.data.forEach(user => {
          userHtml += `
            <option value="${user.id}">
              ${user.fullName} (${user.userName})
            </option>
          `
        })

        $inputMember.html(userHtml)

        return $inputMember.selectpicker('refresh')
      },
      error: function (error) {
        let errorParse = JSON.parse(error.responseText)

        return toastr.error(errorParse.message)
      },
    })
  }

  $(document).on('click', '.remove-user', function () {
    let userId = $(this).attr('data-id')

    console.log('userId: ', userId)

    if (!userId || userId == '') return

    $.confirm({
      title: 'Cảnh báo!',
      content: 'Bạn có muốn xóa người dùng ra khỏi nhóm?',
      buttons: {
        'Đồng ý': {
          btnClass: 'btn-red any-other-class',
          action: function () {
            let data = {}

            data.teamId = team.id
            data.userId = userId

            $loadingData.show()

            $.ajax({
              type: 'DELETE',
              url: '/teams/remove-user',
              data: data,
              dataType: "text",
              success: function () {
                $loadingData.hide()

                toastr.success('Đã xóa user ra khỏi nhóm!')

                getUserAvailable()
                return getMember()
              },
              error: function (error) {
                $loadingData.hide()

                let errorParse = JSON.parse(error.responseText)

                return toastr.error(errorParse.message)
              },
            })
          }
        },
        'Hủy': function () { }
      }
    })

  })

  // validate form edit group
  const validatorFormEdit = $formEditGroup.validate({
    rules: {
      name: {
        required: true,
        maxlength: 50
      },
      leader: {
        required: true,
      },
      description: {
        maxlength: 500
      }
    },
    messages: {
      name: {
        required: "Tên nhóm không được để trống!",
        maxlength: 'Độ dài không quá 50 kí tự'
      },
      leader: {
        required: 'Giám sát không được để trống',
      },
      description: {
        maxlength: 'Độ dài không quá 500 kí tự'
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
    },
    submitHandler: function () {
      let filter = _.chain($('#form_edit_group .input')).reduce(function (memo, el) {
        let value = $(el).val()
        if (value != '' && value != null) memo[el.name] = value
        return memo
      }, {}).value()

      filter.id = team.id

      $loadingData.show()

      $.ajax({
        type: 'PUT',
        url: '/teams',
        data: filter,
        dataType: "text",
        success: function () {
          $loadingData.hide()

          return location.reload()
        },
        error: function (error) {
          $loadingData.hide()

          return toastr.error(JSON.parse(error.responseText).message)
        },
      })
    }
  })

  // validate form delete group
  const validatorFormDelete = $formDeleteGroup.validate({
    rules: {
      password: {
        required: true,
      },
    },
    messages: {
      password: {
        required: "Mật khẩu không được để trống!",
      },
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
    },
    submitHandler: function () {
      let filter = _.chain($('#form_delete_group .input')).reduce(function (memo, el) {
        let value = $(el).val()
        if (value != '' && value != null) memo[el.name] = value
        return memo
      }, {}).value()

      filter.id = team.id

      $loadingData.show()

      $.ajax({
        type: 'DELETE',
        url: '/teams',
        data: filter,
        dataType: "text",
        success: function () {
          $loadingData.hide()

          return window.location.replace('/teams')
        },
        error: function (error) {
          $loadingData.hide()

          let errorParse = JSON.parse(error.responseText)

          if (errorParse.type) {
            return validatorFormDelete.showErrors({
              'password': errorParse.message
            })
          }

          return toastr.error(errorParse.message)
        },
      })
    }
  })

  $inputName.bind('focusout', function (e) {
    e.preventDefault()
    const value = $(this).val()

    if (!value || value == '') return

    $.ajax({
      type: 'GET',
      url: '/teams/search?name=' + value,
      cache: 'false',
      success: function () {
        return validatorFormEdit.showErrors({
          'name': 'Tên nhóm đã được sử dụng!'
        })
      },
    })
    console.log('aa: ', value)
  })

  $buttonAddUser.on('click', function () {
    const member = $inputMember.val()
    let data = {}

    if (!member || member == '') return

    data.userId = member
    data.teamId = team.id

    $.ajax({
      type: 'POST',
      url: '/teams/add-user',
      data: data,
      dataType: "text",
      success: function () {
        toastr.success('Đã thêm người dùng vào nhóm')

        getUserAvailable()
        return getMember()
      },
      error: function (error) {
        const errorParse = JSON.parse(error.responseText)

        return toastr.error(errorParse.message)
      },
    })
  })

  $buttonSearchMember.on('click', function () {
    let value = $inputSearchMember.val()

    return getMember(value.trim())
  })

  // event modal
  $modelEditGroup.on('hidden.bs.modal', function (e) {
    $formEditGroup.trigger('reset')
    validatorFormEdit.resetForm()

    $('#name_length').html('0/50')
    $('#name_length').removeClass('text-danger').addClass('text-muted')

    $('#description_length').html('0/500')
    $('#description_length').removeClass('text-danger').addClass('text-muted')
  })

  $modelEditGroup.on('shown.bs.modal', function (e) {
    $formEditGroup.trigger('reset')
    validatorFormEdit.resetForm()

    $inputName.val(team.name)
    $inputDescription.val(team.description)

    const leaders = _.filter(users, function (user) { return user.leader == 1 })
    const leaderIds = _.pluck(leaders, 'userId')

    $inputLeader.selectpicker('val', leaderIds)
    return $inputLeader.selectpicker('refresh')
  })

  $('#form_edit_group #name').on('input', function () {
    let value = $(this).val()

    console.log('usrname: ', value)

    $('#name_length').html(`${value.length}/50`)

    if (value.length > 50) {
      $('#name_length').removeClass('text-muted').addClass('text-danger')
      return validator.showErrors({
        'name': 'Độ dài không quá 50 kí tự!'
      })
    } else {
      $('#name_length').removeClass('text-danger').addClass('text-muted')
    }
  })

  $('#form_edit_group #description').on('input', function () {
    let value = $(this).val()

    $('#description_length').html(`${value.length}/500`)

    if (value.length > 500) {
      $('#description_length').removeClass('text-muted').addClass('text-danger')
      return validator.showErrors({
        'description': 'Độ dài không quá 500 kí tự!'
      })
    } else {
      $('#description_length').removeClass('text-danger').addClass('text-muted')
    }
  })

  // set value leader
  let leaderHtml = ''
  users.forEach(user => {
    leaderHtml += `
        <option value="${user.userId}">
          ${user.fullName} (${user.userName})
        </option>
      `
  })
  $inputLeader.html(leaderHtml)
  $inputLeader.selectpicker('refresh')

  getUserAvailable()

  getMember()

  $(document).on("click", "#confirmLockTeam", function (e) {
    const id = $(this).attr('data-id')
    _AjaxData('/teams/' + id + '/updateStatus', 'PUT', JSON.stringify({ type: 'lockTeam' }), { contentType: "application/json" }, function (resp) {
      if (resp.code != 200) {
        $('#modal_lock_group').modal('hide')
        toastr.error(resp.message)
        return setTimeout(() => {
          location.reload()
        }, 2500)
      }

      $('#modal_lock_group').modal('hide')
      toastr.success('Lưu thành công !')
      return setTimeout(() => {
        location.reload()
      }, 2500)
    })
  })

  $(document).on("click", "#confirmUnLockTeam", function (e) {
    const id = $(this).attr('data-id')
    _AjaxData('/teams/' + id + '/updateStatus', 'PUT', JSON.stringify({ type: 'unLockTeam' }), { contentType: "application/json" }, function (resp) {
      if (resp.code != 200) {
        $('#modal_unlock_group').modal('hide')
        toastr.error(resp.message)
        return setTimeout(() => {
          location.reload()
        }, 2500)
      }

      $('#modal_unlock_group').modal('hide')
      toastr.success('Lưu thành công !')
      return setTimeout(() => {
        location.reload()
      }, 2500)
    })
  })

});