$(function () {
  const $formEditGroup = $("#form_new_scoreSripts")
  const $formDeleteGroup = $("#form_delete_group")
  const $inputName = $("#form_edit_group #name")
  const $inputLeader = $("#form_edit_group #leader")
  const $inputDescription = $("#form_edit_group #description")
  const $modelEditGroup = $("#modal_edit_group")
  const $loadingData = $(".page-loader")
  const $buttonAddUser = $("#add_user")
  const $inputMember = $("#members")
  const $containerUsers = $("#list_user")
  const $inputSearchMember = $("#search_member")
  const $buttonSearchMember = $("#btn_search_member")

  const $addCriteriaGroup = $(".add-criteria-group") // nút thêm nhóm tiêu chí
  // const $addCriteria = $(".add-criteria"); // nút thêm tiêu chí
  // const $addSelectionCriteria = $(".add-selection-criteria"); // nút thêm lựa chọn

  // const $rmCriteriaGroup = $(".rm-criteria-group"); // nút xóa nhóm tiêu chí
  // const $rmCriteria = $(".rm-criteria"); // nút xóa tiêu chí
  // const $rmSelectionCriteria = $(".rm-selection-criteria"); // nút xóa lựa chọn

  const $scoreScript = $("#scoreScript") // wrapper danh sách nhóm tiêu chí

  // template wrapper
  const $tempCriteriaGroup = $("#tempCriteriaGroup") // Template nhóm tiêu chí
  const $tempCriteria = $("#tempCriteriaGroup #tempCriteria") // Template tiêu chí
  const $tempSelectionCriteria = $("#tempCriteriaGroup #tempSelectionCriteria") // Template lựa chọn

  // template nút
  const $tempBtnAddCriteria = $("#tempBtnAddCriteria") // Template nút thêm tiêu chí
  const $tempBtnAddSelectionCriteria = $("#tempBtnAddSelectionCriteria") // Template nút thêm lựa chọn

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
      standardMax: {
        gte: "#standardMin",
        max: 100,
        number: true,
        required: true,
      }
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
      error.addClass("invalid-feedback")
      element.closest("div").append(error)
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass("is-invalid")
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass("is-invalid")
    },
    submitHandler: function () {
      let filter = _.chain($("#form_new_scoreSripts .input"))
        .reduce(function (memo, el) {
          let value = $(el).val()
          if (value != "" && value != null) memo[el.name] = value
          return memo
        }, {})
        .value()

      filter = getDataSubmit(filter)
      $loadingData.show()

      $.ajax({
        type: "POST",
        url: "/scoreScripts",
        data: filter,
        success: function () {
          $loadingData.hide()
          toastr.success('Lưu thành công !')
          return setTimeout(() => {
            window.location.href = "/scoreScripts"
          }, 2500)
        },
        error: function (error) {
          $loadingData.hide()
          return toastr.error(JSON.parse(error.responseText).message)
        },
      })
    }
  })

  $buttonAddUser.on("click", function () {
    const member = $inputMember.val()
    let data = {}

    if (!member || member == "") return

    data.teamIds = member
    data.groupId = group.id

    $.ajax({
      type: "POST",
      url: "/groups/add-team",
      data: data,
      dataType: "text",
      success: function () {
        toastr.success("Đã thêm người dùng vào nhóm")
        // cache new element vi ko reload lai trang
        const cacheTeamGroup = member.map((i, index) => {
          return {
            id:
              group.TeamGroup.length > 0
                ? group.TeamGroup[group.TeamGroup.length - 1].id + 1 + index
                : 1 + index,
            teamId: i,
            groupId: group.id,
          }
        })

        group.TeamGroup = [...group.TeamGroup, ...cacheTeamGroup]
      },
      error: function (error) {
        const errorParse = JSON.parse(error.responseText)

        return toastr.error(errorParse.message)
      },
    })
  })

  $addCriteriaGroup.on("click", function () {
    const indexTarget = window.location.uuidv4()

    let newTempCriteriaGroup = $("<div></div>").append(
      $tempCriteriaGroup.html()
    )

    // button template
    let newTempBtnAddCriteria = $("<div></div>").append(
      $tempBtnAddCriteria.html()
    )
    let newTempBtnAddSelectionCriteria = $("<div></div>").append(
      $tempBtnAddSelectionCriteria.html()
    )

    newTempCriteriaGroup.find("> div.card").attr("data-id", indexTarget)

    newTempCriteriaGroup
      .find(".wp-add-criteria")
      .html(newTempBtnAddCriteria.html())

    newTempCriteriaGroup
      .find(".custom-switch input")
      .attr("id", `customSwitches-${indexTarget}`)
    newTempCriteriaGroup
      .find(".custom-switch label")
      .attr("for", `customSwitches-${indexTarget}`)

    newTempCriteriaGroup
      .find("#nameCriteriaGroup")
      .attr("id", `nameCriteriaGroup-${indexTarget}`)
      .attr("name", `nameCriteriaGroup-${indexTarget}`)

    newTempCriteriaGroup
      .find("#nameCriteria")
      .attr("id", `nameCriteria-${indexTarget}`)
      .attr("name", `nameCriteria-${indexTarget}`)

    newTempCriteriaGroup
      .find("#scoreMax")
      .attr("id", `scoreMax-${indexTarget}`)
      .attr("name", `scoreMax-${indexTarget}`)

    newTempCriteriaGroup
      .find("#nameSelectionCriteria")
      .attr("id", `nameSelectionCriteria-${indexTarget}`)
      .attr("name", `nameSelectionCriteria-${indexTarget}`)

    newTempCriteriaGroup
      .find("#score")
      .attr("id", `score-${indexTarget}`)
      .attr("name", `score-${indexTarget}`)

    newTempCriteriaGroup
      .find(".wp-add-selection-criteria")
      .html(newTempBtnAddSelectionCriteria.html())

    $scoreScript.append(newTempCriteriaGroup.html())
    const newCard = $scoreScript.find(">div.card:last-child")

    scrollToElement(newCard)
    updateValidationForm(newCard, indexTarget)

  })
  function updateValidationForm(element, indexTarget) {
    if (element.find(".add-selection-criteria").length > 0)
      element
        .find(".add-selection-criteria")
        .attr("data-id", `${indexTarget}`)
    if (element.find(".name-criteria-group").length > 0)
      element
        .find(".name-criteria-group")
        .rules("add", { required: true, maxlength: 500 })
    if (element.find(".name-criteria").length > 0)
      element
        .find(".name-criteria")
        .rules("add", { required: true, maxlength: 150 })
    if (element.find(".score-max").length > 0)
      element
        .find(".score-max")
        .rules("add", { required: true, min: 0, max: 99999 })
    if (element.find(".item-selection-criteria .name-selection-criteria").length > 0)
      element
        .find(".item-selection-criteria .name-selection-criteria")
        .rules("add", { required: true, maxlength: 150 })
    if (element.find(".item-selection-criteria .score").length > 0)
      element
        .find(".item-selection-criteria .score")
        .rules("add", { required: true, le: `#scoreMax-${indexTarget}` })
  }

  // như này thì html render sau mới nhận event click
  $(document).on("click", ".add-criteria", function (e) {
    let newTempCriteria = $("<div></div>").append($tempCriteria.html())

    let wrapperList = $(e.currentTarget)
      .parent()
      .parent()
      .find(".wp-list-criteria")

    const indexTarget = window.location.uuidv4()

    let newTempBtnAddSelectionCriteria = $("<div></div>").append(
      $tempBtnAddSelectionCriteria.html()
    )
    newTempCriteria
      .find(".custom-switch")
      .html(renderSwitchCustom(indexTarget))

    newTempCriteria
      .find(".wp-add-selection-criteria")
      .html(newTempBtnAddSelectionCriteria.html())

    newTempCriteria
      .find("#nameCriteria")
      .attr("id", `nameCriteria-${indexTarget}`)
      .attr("name", `nameCriteria-${indexTarget}`)

    newTempCriteria
      .find("#scoreMax")
      .attr("id", `scoreMax-${indexTarget}`)
      .attr("name", `scoreMax-${indexTarget}`)

    newTempCriteria
      .find("#nameSelectionCriteria")
      .attr("id", `nameSelectionCriteria-${indexTarget}`)
      .attr("name", `nameSelectionCriteria-${indexTarget}`)

    newTempCriteria
      .find("#score")
      .attr("id", `score-${indexTarget}`)
      .attr("name", `score-${indexTarget}`)

    wrapperList.append(newTempCriteria.html())
    const newCard = wrapperList.find(">div.card:last-child")

    scrollToElement(newCard, 500)
    updateValidationForm(newCard, indexTarget)
  })
  // như này thì html render sau mới nhận event click
  $(document).on("click", ".add-selection-criteria", function (e) {
    let newTempSelectionCriteria = $("<div></div>").append(
      $tempSelectionCriteria.html()
    )
    let wrapperList = $(e.currentTarget)
      .parent()
      .parent()
      .find(".wp-list-selection-criteria")
    const indexTarget = window.location.uuidv4()
    const scoreMax = $(this).attr('data-id')

    newTempSelectionCriteria
      .find("#nameSelectionCriteria")
      .attr("id", `nameSelectionCriteria-${indexTarget}`)
      .attr("name", `nameSelectionCriteria-${indexTarget}`)

    newTempSelectionCriteria
      .find("#score")
      .attr("id", `score-${indexTarget}`)
      .attr("name", `score-${indexTarget}`)

    wrapperList.append(newTempSelectionCriteria.html())
    const newCard = wrapperList.find(">div.item-selection-criteria:last-child")
    newCard
      .find(".name-selection-criteria")
      .rules("add", { required: true })
    newCard
      .find(".score")
      .rules("add", { required: true, le: `#scoreMax-${scoreMax}` })
  })

  $(document).on("click", ".rm-criteria-group", function (e) {
    removeElementWithAnimation($(e.currentTarget).closest(".card"))
  })
  $(document).on("click", ".rm-criteria", function (e) {
    removeElementWithAnimation($(e.currentTarget).closest(".card"))
  })

  $(document).on("click", ".rm-selection-criteria", function (e) {
    removeElementWithAnimation(
      $(e.currentTarget).closest(".item-selection-criteria")
    )
  })

  $(document).on("click", "#btn_cancel_scoreSripts", function (e) {
    window.location.href = "/scoreScripts"
  })

  $("#tablist .nav-link").on("click", function (e) {
    e.preventDefault()
    let target = $(e.currentTarget)

    if ($formEditGroup.valid()) {
      if (target.attr("href").includes("preview")) {
        renderDataPreview()
      }

      return true // next
    } else {
      return false // stop
    }
  })

  function removeElementWithAnimation(element, timeout = 500) {
    element.addClass("removed-item")
    setTimeout(() => {
      element.remove()
    }, timeout)
  }

  function scrollToElement(element, topAppend = 0) {
    $("html, body")
      .stop()
      .animate({ scrollTop: element.offset().top - topAppend }, 800, "swing")
  }

  function renderSwitchCustom(id) {
    return `<input type="checkbox" class="custom-control-input cb-is-active" id="customSwitches-${id}" checked>
        <label class="custom-control-label" for="customSwitches-${id}" data-toggle="tooltip" data-placement="right" title="Tiêu chí có sử dụng tính điểm không?" role="button">
        </label>`
  }

  // event modal
  $modelEditGroup.on("hidden.bs.modal", function (e) {
    $formEditGroup.trigger("reset")
    validatorFormEdit.resetForm()

    $("#name_length").html("0/50")
    $("#name_length").removeClass("text-danger").addClass("text-muted")

    $("#description_length").html("0/500")
    $("#description_length").removeClass("text-danger").addClass("text-muted")
  })

  $modelEditGroup.on("shown.bs.modal", function (e) {
    $formEditGroup.trigger("reset")
    validatorFormEdit.resetForm()
    $inputName.val(group.name)
    $inputDescription.val(group.description)

    const leaderIds = _.pluck(group.UserGroupMember, "userId")
    $inputLeader.selectpicker("val", leaderIds)
    return $inputLeader.selectpicker("refresh")
  })

  $("#form_edit_group #name").on("input", function () {
    let value = $(this).val()
    $("#name_length").html(`${value.length}/50`)
  })

  $("#form_edit_group #description").on("input", function () {
    let value = $(this).val()

    $("#description_length").html(`${value.length}/500`)

  })

  // event_change

  $(document).on("change", "#criteriaDisplayType", function (e) {
    let target = $(e.currentTarget)
    let value = target.val()
    const needImproveMax = Number($("#needImproveMax").val())

    if (value == OP_UNIT_DISPLAY.phanTram.n) {
      $("#needImproveMax").rules("add", { max: 100 })
      $("#standardMax").rules("add", { max: 100 })
      if (needImproveMax < 100) {
        updateInputAuto(needImproveMax, 99)
        updateInputPassStandardAuto(Number($("#standardMax").val()), 99)
      }

      $formEditGroup.valid()
    } else {
      $("#needImproveMax").rules("add", { max: 99999 })
      $("#standardMax").rules("add", { max: 99999 })
      if (needImproveMax < 99999) {
        updateInputAuto(needImproveMax, 99999)
        updateInputPassStandardAuto(Number($("#standardMax").val()), 99999)
      }
      $formEditGroup.valid()
    }
  })

  $(document).on("change", "#needImproveMax", function (e) {
    let target = $(e.currentTarget)
    let criteriaDisplayType = $("#criteriaDisplayType").val()

    let value = Number(target.val())

    if (criteriaDisplayType == OP_UNIT_DISPLAY.phanTram.n) {
      updateInputAuto(value, 99)
      updateInputPassStandardAuto($("#standardMax"), 99)
    } else {
      updateInputAuto(value, 99999)
      updateInputPassStandardAuto($("#standardMax"), 99999)
    }
  })

  $(document).on("change", "#standardMax", function (e) {
    let target = $(e.currentTarget)
    let criteriaDisplayType = $("#criteriaDisplayType").val()

    let value = Number(target.val())

    if (criteriaDisplayType == OP_UNIT_DISPLAY.phanTram.n) {
      updateInputPassStandardAuto(value, 99)
    } else {
      updateInputPassStandardAuto(value, 99999)
    }
  })

  $(document).on("change", ".cb-is-active", function (e) {

    let target = $(e.currentTarget)
    let card = target.closest(".card")

    let isActive = target.is(":checked")
    if (isActive) {
      card.find(".score-max").prop("disabled", false)
      card.find(".score").prop("disabled", false)

    } else {
      card.find(".score-max").removeClass('is-invalid').prop("disabled", true)
      card.find(".score").removeClass('is-invalid').prop("disabled", true)
    }
  })

  function updateInputPassStandardAuto(value, max) {
    if (value && value <= max + 1) {
      if (value == max + 1) $("#passStandardMin").val("")
      else $("#passStandardMin").val(value + 1)
    } else {
      $("#passStandardMin").val("")
    }
    $formEditGroup.valid()
  }

  function updateInputAuto(value, max) {
    if (value < max + 1) {
      $("#standardMin").val(value + 1)
      $("#standardMax").prop("disabled", false)

      if (value == max) {
        $("#standardMax").rules("remove", "required")
        $("#standardMax").prop("disabled", true)
        $("#standardMax").removeClass("is-invalid")
        $("#standardMax,#passStandardMin").val("")
      } else {
        $("#standardMax").rules("add", "required")
        if (Number($("#standardMax").val()) > 0) {
          $("#passStandardMin").val(Number($("#standardMax").val()) + 1)
        }
      }
    } else {
      $("#standardMax").rules("remove", "required")
      $("#standardMax").removeClass("is-invalid")
      $("#standardMax").prop("disabled", true)
      $("#standardMax,#passStandardMin").val("")
    }
    $formEditGroup.valid()
  }

  function getDataSubmit(dataForm) {
    return {
      ...dataForm,
      scoreScripts: getDataScoreScript()
    }
  }

  function getDataScoreScript() {
    let data = []

    $scoreScript.find(">div.card").each((i, item) => {
      let card = $(item)
      let itemCriteriaGroup = {
        nameCriteriaGroup: card.find(".name-criteria-group").val(),
        criterias: [],
        totalScore: 0,
      }

      // danh sách tiêu chí thuộc nhóm tiêu chí
      card.find(".wp-list-criteria > .card").each((i2, item2) => {
        let cardCriteria = $(item2)
        let itemCriteria = {
          nameCriteria: cardCriteria.find(".name-criteria").val(),
          scoreMax: Number(cardCriteria.find(".score-max").val()),
          isActive: cardCriteria.find(".cb-is-active").is(":checked"),
          selectionCriterias: [],
        }

        cardCriteria.find(".item-selection-criteria").each((i3, item3) => {
          let selections = $(item3)
          let name = selections.find(".name-selection-criteria").val()
          let score = selections.find(".score").val()
          let unScoreCriteriaGroup = selections
            .find(".cb-unScoreCriteriaGroup")
            .is(":checked")
          let unScoreScript = selections
            .find(".cb-unScoreScript")
            .is(":checked")
          itemCriteria.selectionCriterias.push({
            name,
            score,
            unScoreCriteriaGroup,
            unScoreScript,
          })
        })

        if (itemCriteria.isActive == true)
          itemCriteriaGroup.totalScore += itemCriteria.scoreMax

        itemCriteriaGroup.criterias.push(itemCriteria)
      })

      data.push(itemCriteriaGroup)
    })
    return data
  }

  function renderDataPreview() {
    let _html
    let data = getDataScoreScript()
    const totalScore = data.reduce((s, f) => s + f.totalScore, 0)

    _html = data
      .map((item) => {
        return htmlItemCriteriaGroup(item, totalScore)
      }).join("")

    _html = `<h3>Tổng điểm: ${totalScore}</h3> ${_html}`
    $("#data_preview").html(_html)
  }

  function htmlItemCriteriaGroup(item, totalScore) {
    const percent = (item.totalScore / totalScore) * 100
    let htmlTotalScore = `(${item.totalScore} - ${[0, 100].includes(percent) ? percent : percent.toFixed(2)} %)`

    return `<div class="col-12">
              <h4>${item.nameCriteriaGroup} ${htmlTotalScore}</h4>
              <div class="row">
                ${item.criterias.map((i) => {
                  const htmlScoreCtiteria = i.isActive == true ? `(${i.scoreMax})` : ""
                return `<div class="col-12">
                          <div class="form-group">
                            <label> ${i.nameCriteria} ${htmlScoreCtiteria}</label>
                            <select class="form-control">
                              ${i.selectionCriterias.map((j) => {
                                return `<option>${j.name}</option>`
                              }).join("")}
                            </select>
                          </div>
                        </div>`
                }).join("")}
                </div>
            </div>`
  }
})
