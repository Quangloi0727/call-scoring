$(function () {
  const $formEditGroup = $('#form_edit_group');
  const $formDeleteGroup = $('#form_delete_group');
  const $inputName = $('#form_edit_group #name');
  const $inputLeader = $('#form_edit_group #leader');
  const $inputDescription = $('#form_edit_group #description');
  const $modelEditGroup = $('#modal_edit_group');
  const $loadingData = $('.page-loader');
  const $buttonAddUser = $('#add_user');
  const $inputMember = $('#members');
  const $containerUsers = $('#list_user');
  const $inputSearchMember = $('#search_member');
  const $buttonSearchMember = $('#btn_search_member');

  function getMember(name) {
    let data = {};

    data.teamId = team.id;

    if (name && name.trim() !== '') data.name = name;

    $loadingData.show();

    $.ajax({
      type: 'GET',
      url: '/groups/user-of-team?' + $.param(data),
      cache: 'false',
      success: function (result) {
        $loadingData.hide();

        if (!result) return;

        let userHtml = '';

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
          `;
        });

        return $containerUsers.html(userHtml);
      },
      error: function (error) {
        $loadingData.hide();

        let errorParse = JSON.parse(error.responseText);

        return toastr.error(errorParse.message);
      },
    });
  }

  $(document).on('click', '.remove-user', function () {
    let userId = $(this).attr('data-id');

    console.log('userId: ', userId);

    if (!userId || userId == '') return;

    $.confirm({
      title: 'Cảnh báo!',
      content: 'Bạn có muốn xóa người dùng ra khỏi nhóm?',
      buttons: {
        'Đồng ý': {
          btnClass: 'btn-red any-other-class',
          action: function () {
            let data = {};

            data.teamId = team.id;
            data.userId = userId;

            $loadingData.show();

            $.ajax({
              type: 'DELETE',
              url: '/groups/remove-user',
              data: data,
              dataType: "text",
              success: function () {
                $loadingData.hide();

                $(document).Toasts('create', {
                  title: 'Thành công',
                  class: 'bg-success',
                  position: 'bottomRight',
                  autohide: true,
                  delay: 4000,
                  body: 'Đã xóa user ra khỏi nhóm'
                })

                return getMember();
              },
              error: function (error) {
                $loadingData.hide();

                let errorParse = JSON.parse(error.responseText);

                return toastr.error(errorParse.message);
              },
            });
          }
        },
        'Hủy': function () { }
      }
    });

  });

  // validate form edit group
  const validatorFormEdit = $formEditGroup.validate({
    rules: {
      name: {
        required: true,
      },
      leader: {
        required: true,
      }
    },
    messages: {
      name: {
        required: "Tên nhóm không được để trống!",
      },
      leader: {
        required: 'Giám sát không được để trống',
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
    },
    submitHandler: function () {
      let filter = _.chain($('#form_edit_group .input')).reduce(function (memo, el) {
        let value = $(el).val();
        if (value != '' && value != null) memo[el.name] = value;
        return memo;
      }, {}).value();

      filter.id = team.id;

      $loadingData.show();

      $.ajax({
        type: 'PUT',
        url: '/groups',
        data: filter,
        dataType: "text",
        success: function () {
          $loadingData.hide();

          return location.reload();
        },
        error: function (error) {
          $loadingData.hide();

          return toastr.error(JSON.parse(error.responseText).message);
        },
      });
    }
  });

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
      error.addClass('invalid-feedback');
      element.closest('.form-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    },
    submitHandler: function () {
      let filter = _.chain($('#form_delete_group .input')).reduce(function (memo, el) {
        let value = $(el).val();
        if (value != '' && value != null) memo[el.name] = value;
        return memo;
      }, {}).value();

      filter.id = team.id;

      $loadingData.show();

      $.ajax({
        type: 'DELETE',
        url: '/groups',
        data: filter,
        dataType: "text",
        success: function () {
          $loadingData.hide();

          return window.location.replace('/groups');
        },
        error: function (error) {
          $loadingData.hide();

          let errorParse = JSON.parse(error.responseText);

          if (errorParse.type) {
            return validatorFormDelete.showErrors({
              'password': errorParse.message
            });
          }

          return toastr.error(errorParse.message);
        },
      });
    }
  });

  $inputName.bind('focusout', function (e) {
    e.preventDefault();
    const value = $(this).val();

    if (!value || value == '') return;

    $.ajax({
      type: 'GET',
      url: '/groups/search?name=' + value,
      cache: 'false',
      success: function () {
        return validatorFormEdit.showErrors({
          'name': 'Tên nhóm đã được sử dụng!'
        });
      },
    });
    console.log('aa: ', value);
  });

  $buttonAddUser.on('click', function () {
    const member = $inputMember.val();
    let data = {};

    if (!member || member == '') return;

    data.userId = member;
    data.teamId = team.id;

    $.ajax({
      type: 'POST',
      url: '/groups/add-user',
      data: data,
      dataType: "text",
      success: function () {
        $(document).Toasts('create', {
          title: 'Thành công',
          class: 'bg-success',
          position: 'bottomRight',
          autohide: true,
          delay: 4000,
          body: 'Đã thêm người dùng vào nhóm'
        });

        return getMember();
      },
      error: function (error) {
        $(document).Toasts('create', {
          title: 'Thêm người dùng thất bại',
          autohide: true,
          class: 'bg-danger',
          position: 'bottomRight',
          delay: 4000,
          body: JSON.parse(error.responseText).message,
        });
      },
    });
  });

  $buttonSearchMember.on('click', function () {
    let value = $inputSearchMember.val();

    return getMember(value.trim())
  });

  // event modal
  $modelEditGroup.on('hidden.bs.modal', function (e) {
    $formEditGroup.trigger('reset');
  })

  $modelEditGroup.on('shown.bs.modal', function (e) {
    $formEditGroup.trigger('reset');
    validatorFormEdit.resetForm();

    $inputName.val(team.name);
    $inputDescription.val(team.description);

    let leaderHtml = '';
    users.forEach(user => {
      leaderHtml += `
        <option value="${user.id}" ${user.leader == 1 ? 'selected' : ''}>
          ${user.fullName} (${user.userName})
        </option>
      `;
    });

    $inputLeader.html(leaderHtml);
    return $inputLeader.selectpicker('refresh');
  });

  getMember();

});