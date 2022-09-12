function validateAndCreate() {
    $("#form_new_source").validate({
        rules: {
            name: {
                required: true
            },
            sourceType: {
                required: true
            },
            dbServerName: {
                required: true
            },
            dbServerId: {
                required: true
            },
            dbHost: {
                required: true
            },
            dbPort: {
                required: true
            },
            dbUser: {
                required: true
            },
            dbPassword: {
                required: true
            },
            dbName: {
                required: true
            }
        },
        ignore: ":hidden",
        errorElement: "span",
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
            let dataCreate = _.chain($("#form_new_source .input"))
                .reduce(function (memo, el) {
                    let value = $(el).val()
                    if (value != "" && value != null) memo[el.name] = value
                    return memo
                }, {})
                .value()

            dataCreate.id = window.location.uuidv4()

            _AjaxData('/manageSourceRecord', 'POST', JSON.stringify(dataCreate), { contentType: "application/json" }, function (resp) {
                if (resp.code == 500) return toastr.error(resp.message)

                toastr.success(resp.message)
                return setTimeout(() => {
                    window.location.href = "/manageSourceRecord"
                }, 2500)
            })

        }
    })
}
function bindClick() {
    // get list source record
    $(document).on('click', '#source-recording', function () {
        let formSearch = getFormData('form_search')
        console.log(111, formSearch)
        _AjaxGetData('/manageSourceRecord/getListSource', 'GET', function (resp) {
            console.log(111, resp)
            if (resp.code == 500) return toastr.error(resp.message)
            createTable(resp.listData)
            $('#paging_table').html(window.location.CreatePaging(resp.paginator))
        })
    })

}

function createTable(listData) {
    let html = ''
    listData.forEach(item => {
        html += `<tr>
                    <td>${item.sourceName}</td>
                    <td>${item.sourceName}</td>
                    <td>${item.sourceType}</td>
                    <td>${item.enabled == true ? 'Hoạt động' : 'Ngừng hoạt động'}</td>
                    <td>${item.createdAt ? moment(item.createdAt).format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                    <td>${item.userCreate && item.userCreate.fullName ? item.userCreate.fullName : ''}</td>
                    <td>${item.updatedAt ? moment(item.updatedAt).format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                    <td>${item.userUpdate && item.userUpdate.fullName ? item.userUpdate.fullName : ''}</td>
                </tr>`
    })

    $("#tableBody").html(html)
    return
}

function getFormData(formId) {
    let filter = {}

    filter = _.chain($(`#${formId} .input`)).reduce(function (memo, el) {
        let value = $(el).val()
        if (value != '' && value != null) memo[el.name] = value
        return memo
    }, {}).value()

    return filter
}

$(function () {
    validateAndCreate()
    bindClick()
})

$(window).on('beforeunload', function () {
    $(document).off('click', '.fa-history')
})