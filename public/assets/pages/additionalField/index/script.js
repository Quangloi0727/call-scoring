const messageDuplicate = "Tên hiển thị đã bị trùng"
var loadViewTable = function () {
    var rows = ''
    additionalField.forEach(function (el) {
        if (_.isEmpty(el)) return
        rows += `<tr>
                    <td class="text-center">${el.code ? el.code : ''}</td>
                    <td class="text-center">${el.value ? el.value : ''}</td>
                    <td class="text-center">
                        <span 
                            class="p-1 btn-action btn-edit-additionalField"
                            title="Chỉnh sửa thông tin" data-id="${el.id ? el.id : ''}" 
                            data-value="${el.value ? el.value : ''}"
                        >
                            <i class="fas fa-pencil"></i>
                        </span>
                    </td>
                </tr>`

    })
    $('#tbl_additionalField_body').html(rows)
}

var bindClick = function () {
    // event nhập text chỉnh sửa
    $('#additionalFieldValue').on('keyup', function () {
        const lengthValue = $('#additionalFieldValue').val()
        $("#countValueLength").text(lengthValue.length + "/20")
    })
    // show view edit
    $('.btn-edit-additionalField').on('click', function () {
        const _id = $(this).attr("data-id")
        const _value = $(this).attr("data-value")
        // show modal
        $('#edit_additionalField_Modal').modal('show')
        //load value in input
        $("#additionalFieldValue").val(_value)
        $("#countValueLength").text(_value.length + "/20")
        $("#save_additionalField").attr("data-id", _id)
        $("#duplicateValue").text('')
    })

    //process edit
    $('#save_additionalField').on('click', function () {
        const _id = $(this).attr("data-id")
        const data = { value: $("#additionalFieldValue").val() }
        _AjaxData('additional-field/' + _id + '/edit', 'PUT', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
            if (resp.code == 500) return $("#duplicateValue").text(messageDuplicate)
            // off modal
            $('#edit_additionalField_Modal').modal('hide')
            //show notify
            toastr.success('Lưu thành công !')
            return setTimeout(() => {
                location.reload()
            }, 2500)
        })

    })
}
//run for load page
$(function () {
    loadViewTable()
    bindClick()
})
// event uncut
$(window).on('beforeunload', function () {
    $(document).off('click', '.btn-edit-additionalField')
})