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
    data.groupId = group.id;

    if (name && name.trim() !== '') data.name = name;

    $loadingData.show();

    $.ajax({
      type: 'GET',
      url: '/groups/team-of-group?' + $.param(data),
      cache: 'false',
      success: function (result) {
        $loadingData.hide();

        if (!result) return;

        let itemCard = '';

        result.data.forEach(item => {
          itemCard += `
            <div class="col-sm-2 col-md-3 col-lg-4">
              <div class="border rounded border-primary info-box shadow-none">
                <span class="info-box-icon">
                  <img class="img-circle img-bordered-sm" src="/dist/img/user.png" alt="user image">
                </span>
                <div class="info-box-content">
                  <span class="info-box-text font-weight-bold">
                    ${item.Team.name}
                  </span>
                </div>
                <span class="remove-user" data-id="${item.teamId}">
                  <i class="fas fa-times"></i>
                </span>
              </div>
            </div>
          `;
        });

        return $containerUsers.html(itemCard);
      },
      error: function (error) {
        $loadingData.hide();

        let errorParse = JSON.parse(error.responseText);

        return toastr.error(errorParse.message);
      },
    });
  }

  function getUserAvailable() {
    // console.log( group );
    $.ajax({
      type: 'GET',
      url: '/groups/get-team-available?' + $.param({id: group.id, teamIds: _.pluck(group.TeamGroup, 'teamId')}),
      cache: 'false',
      success: function (result) {
        if (!result) return;

        let itemOptions = '';
        console.log( "result.data", result.data );

        itemOptions = result.data.map(item => {
          return `
            <option value="${item.id}"> ${item.name} </option>
          `;
        }).join('');

        $inputMember.html(itemOptions);

        return $inputMember.selectpicker('refresh');
      },
      error: function (error) {
        let errorParse = JSON.parse(error.responseText);

        return toastr.error(errorParse.message);
      },
    });
  }

  $(document).on('click', '.remove-user', function () {
    let userId = $(this).attr('data-id');

    console.log('userId: ', userId);

    if (!userId || userId == '') return;

    let data = {};

    data.groupId = group.id;
    data.teamId = userId;

    $loadingData.show();
    $.ajax({
      type: 'DELETE',
      url: '/groups/remove-team',
      data: data,
      dataType: "text",
      success: function () {
        $loadingData.hide();

        // toastr.success('Đã xóa đội ngũ ra khỏi nhóm!');
        // xoa cache vi ko reload lai trang
        group.TeamGroup = group.TeamGroup.filter((i, index) => i.teamId != userId);

        getUserAvailable();
        return getMember();
      },
      error: function (error) {
        $loadingData.hide();

        let errorParse = JSON.parse(error.responseText);

        return toastr.error(errorParse.message);
      },
    });

  });

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
        // required: "Tên nhóm không được để trống!",
        // maxlength: 'Độ dài không quá 50 kí tự'
      },
      leader: {
        // required: 'Giám sát không được để trống',
      },
      description: {
        // maxlength: 'Độ dài không quá 500 kí tự'
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

      filter.id = group.id;

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

      filter.id = group.id;

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
          'name': window.location.MESSAGE_ERROR["QA-002"]
        });
      },
    });
    console.log('aa: ', value);
  });

  $buttonAddUser.on('click', function () {
    const member = $inputMember.val();
    let data = {};

    if (!member || member == '') return;

    data.teamIds = member;
    data.groupId = group.id;
    // return console.log(data, group);
    $.ajax({
      type: 'POST',
      url: '/groups/add-team',
      data: data,
      dataType: "text",
      success: function () {
        toastr.success('Đã thêm người dùng vào nhóm');
        // cache new element vi ko reload lai trang
        // group.TeamGroup.push();
        const cacheTeamGroup = member.map((i, index) => {
          return {
            id: group.TeamGroup.length > 0 ? group.TeamGroup[group.TeamGroup.length -1].id + 1 + index : 1 + index,
            teamId: i,
            groupId: group.id
          }
        });

        group.TeamGroup = [
          ...group.TeamGroup,
          ...cacheTeamGroup
        ]
        getUserAvailable();
        return getMember();
      },
      error: function (error) {
        const errorParse = JSON.parse(error.responseText);

        return toastr.error(errorParse.message);
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
    validatorFormEdit.resetForm();

    $('#name_length').html('0/50');
    $('#name_length').removeClass('text-danger').addClass('text-muted');

    $('#description_length').html('0/500');
    $('#description_length').removeClass('text-danger').addClass('text-muted');
  })

  $modelEditGroup.on('shown.bs.modal', function (e) {
    $formEditGroup.trigger('reset');
    validatorFormEdit.resetForm();
    console.log(group);
    $inputName.val(group.name);
    $inputDescription.val(group.description);

    const leaderIds = _.pluck(group.UserGroupMember, 'userId');
    console.log(leaderIds);
    $inputLeader.selectpicker('val', leaderIds);
    return $inputLeader.selectpicker('refresh');
  });

  $('#form_edit_group #name').on('input', function () {
    let value = $(this).val();

    console.log('usrname: ', value)

    $('#name_length').html(`${value.length}/50`);

    // if (value.length > 50) {
    //   $('#name_length').removeClass('text-muted').addClass('text-danger');
    //   return validator.showErrors({
    //     'name': 'Độ dài không quá 50 kí tự!'
    //   });
    // } else {
    //   $('#name_length').removeClass('text-danger').addClass('text-muted');
    // }
  });

  $('#form_edit_group #description').on('input', function () {
    let value = $(this).val();

    $('#description_length').html(`${value.length}/500`);

    // if (value.length > 500) {
    //   $('#description_length').removeClass('text-muted').addClass('text-danger');
    //   return validator.showErrors({
    //     'description': 'Độ dài không quá 500 kí tự!'
    //   });
    // } else {
    //   $('#description_length').removeClass('text-danger').addClass('text-muted');
    // }
  });

  // set value leader
  let leaderHtml = '';
  users.forEach(user => {
    leaderHtml += `
        <option value="${user.id}">
          ${user.fullName} (${user.userName})
        </option>
      `;
  });
  $inputLeader.html(leaderHtml);
  $inputLeader.selectpicker('refresh');

  getUserAvailable();

  getMember();

});