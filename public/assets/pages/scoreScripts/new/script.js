$(function () {
  const $formEditGroup = $("#form_edit_group");
  const $formDeleteGroup = $("#form_delete_group");
  const $inputName = $("#form_edit_group #name");
  const $inputLeader = $("#form_edit_group #leader");
  const $inputDescription = $("#form_edit_group #description");
  const $modelEditGroup = $("#modal_edit_group");
  const $loadingData = $(".page-loader");
  const $buttonAddUser = $("#add_user");
  const $inputMember = $("#members");
  const $containerUsers = $("#list_user");
  const $inputSearchMember = $("#search_member");
  const $buttonSearchMember = $("#btn_search_member");

  const $addCriteriaGroup = $(".add-criteria-group"); // nút thêm nhóm tiêu chí
  const $addCriteria = $(".add-criteria"); // nút thêm tiêu chí
  const $addSelectionCriteria = $(".add-selection-criteria"); // nút thêm lựa chọn

  const $rmCriteriaGroup = $(".rm-criteria-group"); // nút xóa nhóm tiêu chí
  const $rmCriteria = $(".rm-criteria"); // nút xóa tiêu chí
  const $rmSelectionCriteria = $(".rm-selection-criteria"); // nút xóa lựa chọn

  const $scoreScript = $("#scoreScript"); // wrapper danh sách nhóm tiêu chí

  // template wrapper
  const $tempCriteriaGroup = $("#tempCriteriaGroup"); // Template nhóm tiêu chí
  const $tempCriteria = $("#tempCriteriaGroup #tempCriteria"); // Template tiêu chí
  const $tempSelectionCriteria = $("#tempCriteriaGroup #tempSelectionCriteria"); // Template lựa chọn

  // template nút
  const $tempBtnAddCriteria = $("#tempBtnAddCriteria"); // Template nút thêm tiêu chí
  const $tempBtnAddSelectionCriteria = $("#tempBtnAddSelectionCriteria"); // Template nút thêm lựa chọn

  function getMember(name) {
    let data = {};
    data.groupId = group.id;

    if (name && name.trim() !== "") data.name = name;

    $loadingData.show();

    $.ajax({
      type: "GET",
      url: "/groups/team-of-group?" + $.param(data),
      cache: "false",
      success: function (result) {
        $loadingData.hide();

        if (!result) return;

        let itemCard = "";

        result.data.forEach((item) => {
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
      type: "GET",
      url:
        "/groups/get-team-available?" +
        $.param({ id: group.id, teamIds: _.pluck(group.TeamGroup, "teamId") }),
      cache: "false",
      success: function (result) {
        if (!result) return;

        let itemOptions = "";
        console.log("result.data", result.data);

        itemOptions = result.data
          .map((item) => {
            return `
            <option value="${item.id}"> ${item.name} </option>
          `;
          })
          .join("");

        $inputMember.html(itemOptions);

        return $inputMember.selectpicker("refresh");
      },
      error: function (error) {
        let errorParse = JSON.parse(error.responseText);

        return toastr.error(errorParse.message);
      },
    });
  }

  $(document).on("click", ".remove-user", function () {
    let userId = $(this).attr("data-id");

    console.log("userId: ", userId);

    if (!userId || userId == "") return;

    let data = {};

    data.groupId = group.id;
    data.teamId = userId;

    $loadingData.show();
    $.ajax({
      type: "DELETE",
      url: "/groups/remove-team",
      data: data,
      dataType: "text",
      success: function () {
        $loadingData.hide();

        // toastr.success('Đã xóa đội ngũ ra khỏi nhóm!');
        // xoa cache vi ko reload lai trang
        group.TeamGroup = group.TeamGroup.filter(
          (i, index) => i.teamId != userId
        );

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
        maxlength: 50,
      },
      leader: {
        required: true,
      },
      description: {
        maxlength: 500,
      },
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
      },
    },
    ignore: ":hidden",
    errorElement: "span",
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback");
      element.closest(".form-group").append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass("is-invalid");
    },
    submitHandler: function () {
      let filter = _.chain($("#form_edit_group .input"))
        .reduce(function (memo, el) {
          let value = $(el).val();
          if (value != "" && value != null) memo[el.name] = value;
          return memo;
        }, {})
        .value();

      filter.id = group.id;

      $loadingData.show();

      $.ajax({
        type: "PUT",
        url: "/groups",
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
    },
  });

  // validate form delete group
  const validatorFormDelete = $formDeleteGroup.validate({
    // rules: {
    //   password: {
    //     required: true,
    //   },
    // },
    // messages: {
    //   password: {
    //     required: "Mật khẩu không được để trống!",
    //   },
    // },
    ignore: ":hidden",
    errorElement: "span",
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback");
      element.closest(".form-group").append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass("is-invalid");
    },
    submitHandler: function () {
      let filter = _.chain($("#form_delete_group .input"))
        .reduce(function (memo, el) {
          let value = $(el).val();
          if (value != "" && value != null) memo[el.name] = value;
          return memo;
        }, {})
        .value();

      filter.id = group.id;

      $loadingData.show();
      // return console.log(filter)
      $.ajax({
        type: "DELETE",
        url: "/groups",
        data: filter,
        dataType: "text",
        success: function () {
          $loadingData.hide();

          return window.location.replace("/groups");
        },
        error: function (error) {
          $loadingData.hide();

          let errorParse = JSON.parse(error.responseText);

          // if (errorParse.type) {
          //   return validatorFormDelete.showErrors({
          //     'password': errorParse.message
          //   });
          // }

          return toastr.error(errorParse.message);
        },
      });
    },
  });

  $inputName.bind("focusout", function (e) {
    e.preventDefault();
    const value = $(this).val();

    if (!value || value == "") return;

    $.ajax({
      type: "GET",
      url: "/groups/search?name=" + value,
      cache: "false",
      success: function () {
        return validatorFormEdit.showErrors({
          name: window.location.MESSAGE_ERROR["QA-002"],
        });
      },
    });
    console.log("aa: ", value);
  });

  $buttonAddUser.on("click", function () {
    const member = $inputMember.val();
    let data = {};

    if (!member || member == "") return;

    data.teamIds = member;
    data.groupId = group.id;
    // return console.log(data, group);
    $.ajax({
      type: "POST",
      url: "/groups/add-team",
      data: data,
      dataType: "text",
      success: function () {
        toastr.success("Đã thêm người dùng vào nhóm");
        // cache new element vi ko reload lai trang
        // group.TeamGroup.push();
        const cacheTeamGroup = member.map((i, index) => {
          return {
            id:
              group.TeamGroup.length > 0
                ? group.TeamGroup[group.TeamGroup.length - 1].id + 1 + index
                : 1 + index,
            teamId: i,
            groupId: group.id,
          };
        });

        group.TeamGroup = [...group.TeamGroup, ...cacheTeamGroup];
        getUserAvailable();
        return getMember();
      },
      error: function (error) {
        const errorParse = JSON.parse(error.responseText);

        return toastr.error(errorParse.message);
      },
    });
  });

  $buttonSearchMember.on("click", function () {
    let value = $inputSearchMember.val();

    return getMember(value.trim());
  });

  // let index = 0;
  $addCriteriaGroup.on("click", function () {
    // let scoreScriptHTML = renderScipt("scoreScript", index);
    let newTempCriteriaGroup = $("<div></div>").append(
      $tempCriteriaGroup.html()
    );

    let getTempCriteria = $tempCriteria.html();

    // button template
    let newTempBtnAddCriteria = $("<div></div>").append(
      $tempBtnAddCriteria.html()
    );
    let newTempBtnAddSelectionCriteria = $("<div></div>").append(
      $tempBtnAddSelectionCriteria.html()
    );

    newTempCriteriaGroup
      .find(".wp-add-criteria")
      .html(newTempBtnAddCriteria.html());
    newTempCriteriaGroup
      .find(".wp-add-selection-criteria")
      .html(newTempBtnAddSelectionCriteria.html());

    $scoreScript.append(newTempCriteriaGroup.html());
    scrollToElement($scoreScript.find(">div.card:last-child"));
    // index++;
  });

  // như này thì html render sau mới nhận event click
  $(document).on("click", ".add-criteria", function (e) {
    let newTempCriteria = $("<div></div>").append($tempCriteria.html());
    let wrapperList = $(e.currentTarget)
      .parent()
      .parent()
      .find(".wp-list-criteria");

    let newTempBtnAddSelectionCriteria = $("<div></div>").append(
      $tempBtnAddSelectionCriteria.html()
    );

    newTempCriteria
      .find(".wp-add-selection-criteria")
      .html(newTempBtnAddSelectionCriteria.html());

    wrapperList.append(newTempCriteria.html());
    scrollToElement(wrapperList.find(">div.card:last-child"), 500);
    console.log("click add-criteria");
  });
  // như này thì html render sau mới nhận event click
  $(document).on("click", ".add-selection-criteria", function (e) {
    let newTempSelectionCriteria = $("<div></div>").append(
      $tempSelectionCriteria.html()
    );
    let wrapperList = $(e.currentTarget)
      .parent()
      .parent()
      .find(".wp-list-selection-criteria");

    wrapperList.append(newTempSelectionCriteria.html());
    // index++;
    console.log("click add-selection-criteria");
  });

  $(document).on("click", ".rm-criteria-group", function (e) {
    console.log("rmCriteriaGroup");
    // $(e.currentTarget).closest('.card').remove();
    removeElementWithAnimation($(e.currentTarget).closest(".card"));
  });
  $(document).on("click", ".rm-criteria", function (e) {
    console.log("rmCriteria");
    // $(e.currentTarget).closest(".card").remove();
    removeElementWithAnimation($(e.currentTarget).closest(".card"));
  });

  $(document).on("click", ".rm-selection-criteria", function (e) {
    console.log("rmSelectionCriteria");
    removeElementWithAnimation($(e.currentTarget).closest(".item-selection-criteria"));
    // $(e.currentTarget).closest(".item-selection-criteria").remove();
  });

  function removeElementWithAnimation(element, timeout = 500) {
    element.addClass("removed-item");
    setTimeout(() => {
      element.remove();
    }, timeout);
  }

  function scrollToElement(element, topAppend = 0) {
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: element.offset().top - topAppend,
        },
        800,
        "swing"
      );
  }

  // event modal
  $modelEditGroup.on("hidden.bs.modal", function (e) {
    $formEditGroup.trigger("reset");
    validatorFormEdit.resetForm();

    $("#name_length").html("0/50");
    $("#name_length").removeClass("text-danger").addClass("text-muted");

    $("#description_length").html("0/500");
    $("#description_length").removeClass("text-danger").addClass("text-muted");
  });

  $modelEditGroup.on("shown.bs.modal", function (e) {
    $formEditGroup.trigger("reset");
    validatorFormEdit.resetForm();
    console.log(group);
    $inputName.val(group.name);
    $inputDescription.val(group.description);

    const leaderIds = _.pluck(group.UserGroupMember, "userId");
    console.log(leaderIds);
    $inputLeader.selectpicker("val", leaderIds);
    return $inputLeader.selectpicker("refresh");
  });

  $("#form_edit_group #name").on("input", function () {
    let value = $(this).val();

    console.log("usrname: ", value);

    $("#name_length").html(`${value.length}/50`);

    // if (value.length > 50) {
    //   $('#name_length').removeClass('text-muted').addClass('text-danger');
    //   return validator.showErrors({
    //     'name': 'Độ dài không quá 50 kí tự!'
    //   });
    // } else {
    //   $('#name_length').removeClass('text-danger').addClass('text-muted');
    // }
  });

  $("#form_edit_group #description").on("input", function () {
    let value = $(this).val();

    $("#description_length").html(`${value.length}/500`);

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
  let leaderHtml = "";
  users.forEach((user) => {
    leaderHtml += `
        <option value="${user.id}">
          ${user.fullName} (${user.userName})
        </option>
      `;
  });
  $inputLeader.html(leaderHtml);
  $inputLeader.selectpicker("refresh");

  getUserAvailable();

  getMember();
});

function renderScipt(idParent, index, cardType = "default") {
  return `<div class="card card-${cardType}">
  <div class="card-header">
    <h4 class="card-title w-100">
    <div class="form-group row">
    <label for="description" class="col-sm-2 col-form-label">Nhóm kịch bản ${
      index + 1
    } <span class="text-danger">*</span> </label>
    <div class="col-sm-10">
      <input type="email" class="form-control" id="description" name="description" placeholder="Mô tả">
    </div>
  </div>
    </h4>
  </div>
  <div id="collapse-${index}" class="collapse show" data-parent="#${idParent}">
    <div class="card-body">
      
    </div>
  </div>
</div>`;
}

{
  /* <div class="card card-primary">
                      <div class="card-header">
                        <h4 class="card-title w-100">
                          <a class="d-block w-100" data-toggle="collapse" href="#collapseOne">
                            Collapsible Group Item #1
                          </a>
                        </h4>
                      </div>
                      <div id="collapseOne" class="collapse show" data-parent="#accordion">
                        <div class="card-body">
                          
                          <div class="card card-success">
                            <div class="card-header">
                              <h4 class="card-title w-100">
                                <a class="d-block w-100" data-toggle="collapse" href="#collapse5">
                                  Collapsible Group Danger
                                </a>
                              </h4>
                            </div>
                            <div id="collapse5" class="collapse" data-parent="#collapseOne">
                              <div class="card-body">
                                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid.
                                3
                                wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt
                                laborum
                                eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee
                                nulla
                                assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred
                                nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                                beer
                                farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus
                                labore sustainable VHS.
                              </div>
                            </div>
                          </div>
                          <div class="card card-success">
                            <div class="card-header">
                              <h4 class="card-title w-100">
                                <a class="d-block w-100" data-toggle="collapse" href="#collapse6">
                                  Collapsible Group Success
                                </a>
                              </h4>
                            </div>
                            <div id="collapse6" class="collapse" data-parent="#collapseOne">
                              <div class="card-body">
                                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid.
                                3
                                wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt
                                laborum
                                eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee
                                nulla
                                assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred
                                nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                                beer
                                farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus
                                labore sustainable VHS.
                              </div>
                            </div>
                          </div>

                          
                        </div>
                      </div>
                    </div> */
}
