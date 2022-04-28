$(function () {
  const $formEditGroup = $("#form_new_scoreSripts");
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
  // const $addCriteria = $(".add-criteria"); // nút thêm tiêu chí
  // const $addSelectionCriteria = $(".add-selection-criteria"); // nút thêm lựa chọn

  // const $rmCriteriaGroup = $(".rm-criteria-group"); // nút xóa nhóm tiêu chí
  // const $rmCriteria = $(".rm-criteria"); // nút xóa tiêu chí
  // const $rmSelectionCriteria = $(".rm-selection-criteria"); // nút xóa lựa chọn

  const $scoreScript = $("#scoreScript"); // wrapper danh sách nhóm tiêu chí

  // template wrapper
  const $tempCriteriaGroup = $("#tempCriteriaGroup"); // Template nhóm tiêu chí
  const $tempCriteria = $("#tempCriteriaGroup #tempCriteria"); // Template tiêu chí
  const $tempSelectionCriteria = $("#tempCriteriaGroup #tempSelectionCriteria"); // Template lựa chọn

  // template nút
  const $tempBtnAddCriteria = $("#tempBtnAddCriteria"); // Template nút thêm tiêu chí
  const $tempBtnAddSelectionCriteria = $("#tempBtnAddSelectionCriteria"); // Template nút thêm lựa chọn

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
        required: true,
        maxlength: 150,
      },
      scoreDisplayType: {
        required: true,
      },
      criteriaDisplayType: {
        required: true,
      },
      needImproveMax: {
        required: true,
        number: true,
        min: 1,
        max: 100,
      },
      standardMin: {
        // required: true,
      },
      standardMax: {
        gte: "#standardMin",
        max: 100,
        number: true,
        required: true,
      },
      passStandardMin: {
        // required: true,
        // gte: "#standardMax"
      },
    },
    messages: {
      standardMax: {
        gte: window.location.MESSAGE_ERROR["QA-008"],
      },
    },
    ignore: ":hidden",
    errorElement: "span",
    // debug: false,
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback");
      // element.closest(".form-group").append(error);
      console.log(1111, element, element.closest("div"));
      element.closest("div").append(error);
    },
    highlight: function (element, errorClass, validClass) {
      console.log(2222, { element, errorClass, validClass });
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass("is-invalid");
    },
    submitHandler: function () {
      console.log("click");
      let filter = _.chain($("#form_new_scoreSripts .input"))
        .reduce(function (memo, el) {
          let value = $(el).val();
          if (value != "" && value != null) memo[el.name] = value;
          return memo;
        }, {})
        .value();

      // filter.id = group.id;
        console.log({filter});
      $loadingData.show();

      // $.ajax({
      //   type: "PUT",
      //   url: "/groups",
      //   data: filter,
      //   dataType: "text",
      //   success: function () {
      $loadingData.hide();

      //     return location.reload();
      //   },
      //   error: function (error) {
      //     $loadingData.hide();

      //     return toastr.error(JSON.parse(error.responseText).message);
      //   },
      // });
    },
  });

  //   $.validator.addClassRules("name-criteria-group", {
  //     required: true,
  //     minlength: 2
  // });

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
      },
      error: function (error) {
        const errorParse = JSON.parse(error.responseText);

        return toastr.error(errorParse.message);
      },
    });
  });

  $addCriteriaGroup.on("click", function () {
    // let scoreScriptHTML = renderScipt("scoreScript", index);
    const totalCriteriaGroup = $scoreScript.find("> div.card").length;
    const indexTarget = totalCriteriaGroup + 1;

    console.log("index: ", totalCriteriaGroup);
    let newTempCriteriaGroup = $("<div></div>").append(
      $tempCriteriaGroup.html()
    );

    // button template
    let newTempBtnAddCriteria = $("<div></div>").append(
      $tempBtnAddCriteria.html()
    );
    let newTempBtnAddSelectionCriteria = $("<div></div>").append(
      $tempBtnAddSelectionCriteria.html()
    );

    newTempCriteriaGroup.find("> div.card").attr("data-id", indexTarget);

    newTempCriteriaGroup
      .find(".wp-add-criteria")
      .html(newTempBtnAddCriteria.html());

    newTempCriteriaGroup
      .find(".custom-switch input")
      .attr("id", `customSwitches-${indexTarget}`);
    newTempCriteriaGroup
      .find(".custom-switch label")
      .attr("for", `customSwitches-${indexTarget}`);
    // .html(renderSwitchCustom(indexTarget))

    newTempCriteriaGroup
      .find("#nameCriteriaGroup")
      .attr("id", `nameCriteriaGroup-${indexTarget}`)
      .attr("name", `nameCriteriaGroup-${indexTarget}`);

    newTempCriteriaGroup
      .find("#nameCriteria")
      .attr("id", `nameCriteria-${indexTarget}`)
      .attr("name", `nameCriteria-${indexTarget}`);

    newTempCriteriaGroup
      .find("#scoreMax")
      .attr("id", `scoreMax-${indexTarget}`)
      .attr("name", `scoreMax-${indexTarget}`);

    newTempCriteriaGroup
      .find("#nameSelectionCriteria")
      .attr("id", `nameSelectionCriteria-${indexTarget}`)
      .attr("name", `nameSelectionCriteria-${indexTarget}`);

    newTempCriteriaGroup
      .find("#score")
      .attr("id", `score-${indexTarget}`)
      .attr("name", `score-${indexTarget}`);

    newTempCriteriaGroup
      .find(".wp-add-selection-criteria")
      .html(newTempBtnAddSelectionCriteria.html());

    $scoreScript.append(newTempCriteriaGroup.html());
    const newCard = $scoreScript.find(">div.card:last-child");

    scrollToElement(newCard);

    // update rule vào form vì có phần tử được append vào
    // http://jsfiddle.net/rq5ra/1/

    //   $(this).rules('add', {
    //     required: true,
    //     number: true,
    //     messages: {
    //         required:  "your custom required message",
    //         number:  "your custom number message"
    //     }
    // });

    updateValidationForm(newCard, indexTarget);
  });
  function updateValidationForm(element, indexTarget) {
    if (element.find(".name-criteria-group").length > 0)
      element.find(".name-criteria-group").rules("add", {
        required: true,
        // number: true,
        // messages: {
        //     required:  "your custom required message",
        //     number:  "your custom number message"
        // }
      });
    if (element.find(".name-criteria").length > 0)
      element.find(".name-criteria").rules("add", {
        required: true,
        // number: true,
        // messages: {
        //     required:  "your custom required message",
        //     number:  "your custom number message"
        // }
      });
    if (element.find(".score-max").length > 0)
      element.find(".score-max").rules("add", {
        required: true,
        min: 0,
        max: 99999,
        // number: true,
        // messages: {
        //     required:  "your custom required message",
        //     number:  "your custom number message"
        // }
      });

    if (
      element.find(".item-selection-criteria .name-selection-criteria").length >
      0
    )
      element
        .find(".item-selection-criteria .name-selection-criteria")
        .rules("add", {
          required: true,
          // number: true,
          // messages: {
          //     required:  "your custom required message",
          //     number:  "your custom number message"
          // }
        });
    if (element.find(".item-selection-criteria .score").length > 0)
      element.find(".item-selection-criteria .score").rules("add", {
        required: true,
        min: 0,
        le: `#scoreMax-${indexTarget}`,
        // number: true,
        // messages: {
        //     required:  "your custom required message",
        //     number:  "your custom number message"
        // }
      });
  }

  // như này thì html render sau mới nhận event click
  $(document).on("click", ".add-criteria", function (e) {
    let newTempCriteria = $("<div></div>").append($tempCriteria.html());

    let wrapperList = $(e.currentTarget)
      .parent()
      .parent()
      .find(".wp-list-criteria");

    const totalCriteria = wrapperList.find("> div.card").length;
    const indexCriteriaGroup = $(e.currentTarget)
      .parent()
      .parent()
      .attr("data-id");
    const indexTarget = `${indexCriteriaGroup}-${totalCriteria + 1}`;

    console.log("index: ", totalCriteria);

    let newTempBtnAddSelectionCriteria = $("<div></div>").append(
      $tempBtnAddSelectionCriteria.html()
    );
    newTempCriteria
      .find(".custom-switch")
      .html(renderSwitchCustom(indexTarget));

    newTempCriteria
      .find(".wp-add-selection-criteria")
      .html(newTempBtnAddSelectionCriteria.html());

    newTempCriteria
      .find("#nameCriteria")
      .attr("id", `nameCriteria-${indexTarget}`)
      .attr("name", `nameCriteria-${indexTarget}`);

    newTempCriteria
      .find("#scoreMax")
      .attr("id", `scoreMax-${indexTarget}`)
      .attr("name", `scoreMax-${indexTarget}`);

    newTempCriteria
      .find("#nameSelectionCriteria")
      .attr("id", `nameSelectionCriteria-${indexTarget}`)
      .attr("name", `nameSelectionCriteria-${indexTarget}`);

    newTempCriteria
      .find("#score")
      .attr("id", `score-${indexTarget}`)
      .attr("name", `score-${indexTarget}`);

    wrapperList.append(newTempCriteria.html());
    const newCard = wrapperList.find(">div.card:last-child");

    scrollToElement(newCard, 500);
    console.log("click add-criteria");
    updateValidationForm(newCard, indexTarget);
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
    removeElementWithAnimation(
      $(e.currentTarget).closest(".item-selection-criteria")
    );
    // $(e.currentTarget).closest(".item-selection-criteria").remove();
  });

  // $("#tablist .nav-link").on("click", function (e) {
  //   e.preventDefault();
  //   if ($formEditGroup.valid()) {
  //     // console.log(object);
  //     return true; // next
  //   } else {
  //     return false; // stop
  //   }
  // });

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

  function renderSwitchCustom(id) {
    return `<input type="checkbox" class="custom-control-input" id="customSwitches-${id}" checked>
        <label class="custom-control-label" for="customSwitches-${id}" data-toggle="tooltip"
        data-placement="right" title="Tiêu chí có sử dụng tính điểm không?"
        role="button"></label>`;
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

  // event_change

  $(document).on("change", "#criteriaDisplayType", function (e) {
    let target = $(e.currentTarget);
    let value = target.val();
    console.log("criteriaDisplayType", value, OP_UNIT_DISPLAY.phanTram.n);
    const needImproveMax = Number($("#needImproveMax").val());

    if (value == OP_UNIT_DISPLAY.phanTram.n) {
      $("#needImproveMax").rules("add", {
        max: 100,
      });
      $("#standardMax").rules("add", {
        max: 100,
      });
      if (needImproveMax < 100) {
        console.log("co vao dayyyy");
        updateInputAuto(needImproveMax, 99);
        updateInputPassStandardAuto(Number($("#standardMax").val()), 99);
      }      
      
      $formEditGroup.valid();
    } else {
      $("#needImproveMax").rules("add", {
        max: 99999,
      });
      $("#standardMax").rules("add", {
        max: 99999,
      });
      if (needImproveMax < 99999) {
        updateInputAuto(needImproveMax, 99999);
        updateInputPassStandardAuto(Number($("#standardMax").val()), 99999);
      }
      $formEditGroup.valid();
    }
  });

  $(document).on("change", "#needImproveMax", function (e) {
    let target = $(e.currentTarget);
    let criteriaDisplayType = $("#criteriaDisplayType").val();

    let value = Number(target.val());

    console.log(
      "scoreDisplayType",
      criteriaDisplayType,
      OP_UNIT_DISPLAY.phanTram.n
    );
    if (criteriaDisplayType == OP_UNIT_DISPLAY.phanTram.n) {
      updateInputAuto(value, 99);
      updateInputPassStandardAuto($('#standardMax'), 99);
    } else {
      updateInputAuto(value, 99999);
      updateInputPassStandardAuto($('#standardMax'), 99999);
    }
  });

  $(document).on("change", "#standardMax", function (e) {
    let target = $(e.currentTarget);
    let criteriaDisplayType = $("#criteriaDisplayType").val();

    let value = Number(target.val());
    console.log('change #standardMax', value);

    if (criteriaDisplayType == OP_UNIT_DISPLAY.phanTram.n) {
      updateInputPassStandardAuto(value, 99);
    } else {
      updateInputPassStandardAuto(value, 99999);
    }
  });

  function updateInputPassStandardAuto(value, max) {
    if (value && value <= max + 1) {
      if (value == max + 1) $("#passStandardMin").val("");
      else $("#passStandardMin").val(value + 1);
    } else {
      $("#passStandardMin").val("");
    }
    $formEditGroup.valid();
  }

  function updateInputAuto(value, max) {
    if (value < max + 1) {
      $("#standardMin").val(value + 1);
      $("#standardMax").prop("disabled", false);

      if (value == max) {
        $("#standardMax").rules("remove", "required");
        $("#standardMax").prop("disabled", true);
        $("#standardMax").removeClass("is-invalid");
        $("#standardMax,#passStandardMin").val("");
      } else {
        $("#standardMax").rules("add", "required");
        console.log( Number($("#standardMax").val()) , max);
        if (Number($("#standardMax").val()) > 0) {
          $("#passStandardMin").val(Number($("#standardMax").val())+1);
        }
      }
    } else {
      $("#standardMax").rules("remove", "required");
      $("#standardMax").removeClass("is-invalid");
      $("#standardMax").prop("disabled", true);
      $("#standardMax,#passStandardMin").val("");
    }
    $formEditGroup.valid();
  }
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
