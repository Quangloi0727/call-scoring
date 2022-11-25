$(function () {
  const $loadingData = $(".page-loader")
  const $inputExpires = $(".expires")
  const $inputCbUnLimited = $(".cb-unLimited")
  const $inputCbIsActive = $(".cb-isActive")
  const $inputSlExpiresType = $(".expires-type")

  $inputExpires.bind("change", function (e) {
    e.preventDefault()
    const expires = $(this).val()
    const itemId = $(this).closest("div.rule-detail-item").attr("item-id")

    const valueExpiresType = $(this).closest("div.rule-detail-item").find('.expires-type').val()
    const ruleId = $(this).closest("div.rule-detail-item").attr("item-rule-id")
    const role = $(this).closest("div.rule-detail-item").attr("item-role")
    const data = {
      expires: expires,
      expiresType: valueExpiresType,
      ruleId,
      role,
      unLimited: false
    }
    // return console.log(data);
    if (!expires || expires == "") return
    $loadingData.show()

    if (!itemId) {
      // create
      console.log("create")
      createRuleDetail(data)
    } else {
      console.log("update")
      updateRuleDetail(itemId, data)
    }

  })

  $inputSlExpiresType.bind("change", function (e) {
    e.preventDefault()
    const expires = $(this).closest("div.rule-detail-item").find('.expires').val()
    const itemId = $(this).closest("div.rule-detail-item").attr("item-id")

    const valueExpiresType = $(this).val()
    const ruleId = $(this).closest("div.rule-detail-item").attr("item-rule-id")
    const role = $(this).closest("div.rule-detail-item").attr("item-role")
    const data = {
      expires: expires,
      expiresType: valueExpiresType,
      ruleId,
      role,
      unLimited: false
    }
    // return console.log(data);
    if (!valueExpiresType || valueExpiresType == "") return
    $loadingData.show()

    if (!itemId) {
      // create
      console.log("create")
      createRuleDetail(data)
    } else {
      console.log("update")
      updateRuleDetail(itemId, data)
    }

  })

  $inputCbUnLimited.bind("change", function (e) {
    e.preventDefault()
    const itemId = $(this).closest("div.rule-detail-item").attr("item-id")
    const ruleId = $(this).closest("div.rule-detail-item").attr("item-rule-id")
    const role = $(this).closest("div.rule-detail-item").attr("item-role")
    const thisExpiresType = $(this).closest("div.rule-detail-item").find('.expires-type')
    const thisExpires = $(this).closest("div.rule-detail-item").find('.expires')

    const unLimited = $(this).is(":checked")
    const data = {
      ruleId,
      role,
      unLimited: unLimited
    }
    console.log(data, thisExpiresType, thisExpires)
    if (unLimited) {
      thisExpiresType.prop('disabled', true)
      thisExpires.prop('disabled', true)
    } else {
      thisExpiresType.prop('disabled', false)
      thisExpires.prop('disabled', false)
    }
    // return;
    $loadingData.show()

    if (!itemId) {
      // create
      console.log("create")
      createRuleDetail(data)
    } else {
      console.log("update")
      updateRuleDetail(itemId, data)
    }

  })

  $inputCbIsActive.bind("change", function (e) {
    e.preventDefault()
    const itemId = $(this).closest("div.rule-detail-item").attr("item-id")
    const ruleId = $(this).closest("div.rule-detail-item").attr("item-rule-id")
    const role = $(this).closest("div.rule-detail-item").attr("item-role")

    const isActive = $(this).is(":checked")
    const data = {
      ruleId,
      role,
      isActive: isActive
    }

    $loadingData.show()
    updateRuleDetail(itemId, data)

  })

  function createRuleDetail(data) {
    $.ajax({
      type: "POST",
      url: "/ruleDetails/",
      data: data,
      dataType: "text",
      success: function () {
        $loadingData.hide()
        toastr.success('Cập nhật thành công !')
        window.location.reload()
      },
      error: function (error) {
        $loadingData.hide()

        return toastr.error(JSON.parse(error.responseText).message)
      },
    })
  }

  function updateRuleDetail(id, data) {
    $.ajax({
      type: "PUT",
      url: "/ruleDetails/" + id,
      data: data,
      dataType: "text",
      success: function () {
        $loadingData.hide()
        toastr.success('Cập nhật thành công !')
        setTimeout(() => {
          window.location.reload()
        }, 2500)
      },
      error: function (error) {
        $loadingData.hide()

        return toastr.error(JSON.parse(error.responseText).message)
      },
    })
  }

})
