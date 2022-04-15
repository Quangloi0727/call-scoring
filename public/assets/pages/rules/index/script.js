$(function () {
  const $formCreateGroup = $("#form_input_group");
  const $formSearchGroup = $("#form_search_teams");
  const $buttonSearchGroup = $("#search_group");
  const $modalGroup = $("#modal_group");
  const $loadingData = $(".page-loader");
  const $inputLeader = $("#form_input_group #leader");
  const $inputExpires = $(".expires");
  const $inputCbUnLimited = $(".cb-unLimited");
  const $inputSlExpiresType = $(".expires-type");

  $inputExpires.bind("change", function (e) {
    e.preventDefault();
    const expires = $(this).val();
    const itemId = $(this).closest("div.rule-detail-item").attr("item-id");

    const valueExpiresType = $(this).closest("div.rule-detail-item").find('.expires-type').val();
    const ruleId = $(this).closest("div.rule-detail-item").attr("item-rule-id");
    const role = $(this).closest("div.rule-detail-item").attr("item-role");
    const data = {
      expires: expires,
      expiresType: valueExpiresType,
      ruleId,
      role,
      unLimited: false
    }
    // return console.log(data);
    if (!expires || expires == "") return;
    $loadingData.show();

    if (!itemId) {
      // create
      console.log("create");
      createRuleDetail(data);
    } else {
      console.log("update");
      updateRuleDetail(itemId, data);
      // console.log("aa: ", value);
    }

  });
  $inputSlExpiresType.bind("change", function (e) {
    e.preventDefault();
    const expires = $(this).closest("div.rule-detail-item").find('.expires').val();
    const itemId = $(this).closest("div.rule-detail-item").attr("item-id");

    const valueExpiresType = $(this).val();
    const ruleId = $(this).closest("div.rule-detail-item").attr("item-rule-id");
    const role = $(this).closest("div.rule-detail-item").attr("item-role");
    const data = {
      expires: expires,
      expiresType: valueExpiresType,
      ruleId,
      role,
      unLimited: false
    }
    // return console.log(data);
    if (!valueExpiresType || valueExpiresType == "") return;
    $loadingData.show();

    if (!itemId) {
      // create
      console.log("create");
      createRuleDetail(data);
    } else {
      console.log("update");
      updateRuleDetail(itemId, data);
      // console.log("aa: ", value);
    }

  });
  $inputCbUnLimited.bind("change", function (e) {
    e.preventDefault();
    const itemId = $(this).closest("div.rule-detail-item").attr("item-id");
    const ruleId = $(this).closest("div.rule-detail-item").attr("item-rule-id");
    const role = $(this).closest("div.rule-detail-item").attr("item-role");
    const thisExpiresType = $(this).closest("div.rule-detail-item").find('.expires-type');
    const thisExpires = $(this).closest("div.rule-detail-item").find('.expires');

    const unLimited =  $(this).is(":checked");
    const data = {
      ruleId,
      role,
      unLimited: unLimited
    }
    console.log(data, thisExpiresType, thisExpires);
    if(unLimited){
      thisExpiresType.prop('disabled', true);
      thisExpires.prop('disabled', true);
    }else {
      thisExpiresType.prop('disabled', false);
      thisExpires.prop('disabled', false);
    }
    // return;
    $loadingData.show();

    if (!itemId) {
      // create
      console.log("create");
      createRuleDetail(data);
    } else {
      console.log("update");
      updateRuleDetail(itemId, data);
      // console.log("aa: ", value);
    }

  });

  function createRuleDetail(data) {
    $.ajax({
      type: "POST",
      url: "/ruleDetails/",
      data: data,
      dataType: "text",
      success: function () {
        $loadingData.hide();
        toastr.success('Thành công');
        window.location.reload();
      },
      error: function (error) {
        $loadingData.hide();

        return toastr.error(JSON.parse(error.responseText).message);
      },
    });
  }

  function updateRuleDetail(id, data) {
    $.ajax({
      type: "PUT",
      url: "/ruleDetails/" + id,
      data: data,
      dataType: "text",
      success: function () {
        $loadingData.hide();
        toastr.success('Thành công');
      },
      error: function (error) {
        $loadingData.hide();

        return toastr.error(JSON.parse(error.responseText).message);
      },
    });
  }

});
