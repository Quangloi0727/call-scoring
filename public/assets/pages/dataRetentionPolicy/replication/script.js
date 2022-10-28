const NUMBER_MAX_VALUE_TXT = "Giá trị phải lớn hơn 0"
const NUMBER_MIN_VALUE_TXT = "Giá trị không vượt quá 999"
const REQUIRED_IS_NUMBER = "Giá trị nhập vào là số"
const STRING_MAX_LENGTH = "Độ dài không được vượt quá 250"
const REQUIRED_STRING = "Không được để trống tên chính sách"

$(function () {

  $(document).on('change', '#unlimitedSaveForCallGotPoint', function () {

    let checked = $('#unlimitedSaveForCallGotPoint').is(':checked');
    if (!checked) {
      return $('#valueSaveForCallGotPoint').prop("disabled", false);
    }

    $('#valueSaveForCallGotPoint').val('')
    return $('#valueSaveForCallGotPoint').prop("disabled", true);
  })


  // kiểm tra ô check box có tích chọn thì disable ô input nhập trong khoảng
  $(document).on('change', '#unlimitedSaveForCallNoPoint', function () {

    let checked = $('#unlimitedSaveForCallNoPoint').is(':checked');
    if (!checked) {
      return $('#valueSaveForCallNoPoint').prop("disabled", false);
    }

    $('#valueSaveForCallNoPoint').val('')
    return $('#valueSaveForCallNoPoint').prop("disabled", true);
  })

  // validate form 
  const validator = $('#frmDataRetentionPolicy').validate({
    rules: {
      nameDataRetentionPolicy: {
        required: true,
        maxlength: 250
      },
      valueSaveForCallGotPoint: {
        number: true,
        min: 0,
        max: 999
      },
      valueSaveForCallNoPoint: {
        number: true,
        min: 0,
        max: 999
      }
    },
    messages: {
      nameDataRetentionPolicy: {
        required: REQUIRED_STRING,
        maxlength: STRING_MAX_LENGTH,
      },
      valueSaveForCallGotPoint: {
        number: REQUIRED_IS_NUMBER,
        min: NUMBER_MIN_VALUE_TXT,
        max: NUMBER_MAX_VALUE_TXT
      },
      valueSaveForCallNoPoint: {
        number: REQUIRED_IS_NUMBER,
        min: NUMBER_MIN_VALUE_TXT,
        max: NUMBER_MAX_VALUE_TXT
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
      let dataCreate = _.chain($(".inputData"))
        .reduce(function (memo, el) {
          let value = $(el).val()
          if (value != "" && value != null) memo[el.name] = value
          return memo
        }, {})
        .value()

      const id = $('#btnSave').attr('data-id')

      // check và set giá trị cho "Cuộc gọi đã được chấm điểm"
      if (parseInt(dataCreate.valueSaveForCallGotPoint) >= 0) {
        dataCreate.unlimitedSaveForCallGotPoint = UnlimitedSaveForCall.UnlimitedNotSave.value
        dataCreate.valueSaveForCallGotPoint = parseInt(dataCreate.valueSaveForCallGotPoint)
      } else {
        dataCreate.unlimitedSaveForCallGotPoint = UnlimitedSaveForCall.UnlimitedSave.value
        dataCreate.valueSaveForCallGotPoint = null
      }

      // check và set giá trị cho "Cuộc gọi chưa được chấm điểm"
      if (parseInt(dataCreate.valueSaveForCallNoPoint) >= 0) {
        dataCreate.unlimitedSaveForCallNoPoint = UnlimitedSaveForCall.UnlimitedNotSave.value
        dataCreate.valueSaveForCallNoPoint = parseInt(dataCreate.valueSaveForCallNoPoint)
      } else {
        dataCreate.unlimitedSaveForCallNoPoint = UnlimitedSaveForCall.UnlimitedSave.value
        dataCreate.valueSaveForCallNoPoint = null
      }
      _AjaxData('/dataRetentionPolicy', 'POST', JSON.stringify(dataCreate), { contentType: "application/json" }, function (resp) {
        if (resp.code != 200 && resp.message != window.location.MESSAGE_ERROR['QA-002'])
          return toastr.error(resp.message)
        if (resp.code != 200 && resp.message == window.location.MESSAGE_ERROR['QA-002']) {
          $('.duplicateName').removeClass('d-none')
          return toastr.error(resp.message)
        }
        toastr.success("Tạo mới thành công !")
        return setTimeout(() => {
          window.location.href = "/dataRetentionPolicy"
        }, 2500)
      })

    }

  });

  $(document).on('click', '#btnAddTeams', function () {
    let teamIds = $('#selectAddTeams').val()
    if (teamIds && teamIds.length > 0) {
      let strTeamIds = teamIds.join(',')
      _AjaxGetData('/dataRetentionPolicy/getTeamByIds?teamIds=' + `${strTeamIds}`, 'GET', function (resp) {
        if (resp.code != 200) {
          return toastr.error(resp.message)
        }

        if (resp.data && resp.data.length > 0) {
          return renderTeams(resp.data)
        }
      })
    }
  })

  $(document).on('click', '.remove-team', function () {
    // xóa trên giao diện
    let teamIds = []
    $(this).parent().parent().remove()
    $('span.remove-team').each(function () {
      teamIds.push($(this).attr('data-id'))
    })
    // update lại ô input chọn team
    $('#selectAddTeams').val(teamIds)
    $('.selectpicker').selectpicker('refresh')
  })

  $(document).on('click', '#btnCancel', function () {
    window.location.href = "/dataRetentionPolicy"
  })

  if (dataRetentionPolicy && dataRetentionPolicy.DataRetentionPolicyTeam) {
    let teams = _.pluck(dataRetentionPolicy.DataRetentionPolicyTeam, 'TeamInfo')
    let teamIds = _.pluck(teams, 'id')
    $('#selectAddTeams').val(teamIds)
    $('.selectpicker').selectpicker('refresh')
    return renderTeams(teams)
  }
})

function renderTeams(teams) {
  let teamHtml = ''

  teams.forEach(el => {
    teamHtml += `
      <div class="col-sm-2 col-md-3 col-lg-4">
        <div class="border rounded border-primary info-box shadow-none">
          <span class="info-box-icon">
          <i class="fa fa-users fa-1-5x text-primary" aria-hidden="true"></i>
          </span>
          <div class="info-box-content">
            <span class="info-box-text font-weight-bold">
              ${el.name}
            </span>
          </div>
          <span class="remove-team" data-id="${el.id}">
            <i class="fas fa-times"></i>
          </span>
        </div>
      </div>
    `
  })

  return $('#listTeam').html(teamHtml)
}

// event uncut
$(window).on('beforeunload', function () {
  $(document).off('change', '#unlimitedSaveForCallGotPoint')
  $(document).off('change', '#unlimitedSaveForCallNoPoint')
  $(document).off('click', '#btnAddTeams')
  $(document).off('click', '.remove-team')
})