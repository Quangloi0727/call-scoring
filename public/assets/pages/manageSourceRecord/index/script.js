function validateAndCreate() {
    $("#form_new_source").validate({
        rules: {
            sourceName: {
                required: true
            },
            sourceType: {
                required: true
            },
            dbServerName: {
                required: true
            },
            dbServerId: {
                required: true,
                maxlength: 5
            },
            dbHost: {
                required: true
            },
            dbPort: {
                required: true,
                number: true,
                maxlength: 6
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
        messages: {
            sourceType: window.location.MESSAGE_ERROR["QA-001"]
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
                return refreshPage("modalCreateSource")
            })

        }
    })

    $("#form_update_source").validate({
        rules: {
            sourceName: {
                required: true
            },
            sourceType: {
                required: true
            },
            dbServerName: {
                required: true
            },
            dbServerId: {
                required: true,
                maxlength: 5
            },
            dbHost: {
                required: true
            },
            dbPort: {
                required: true,
                number: true,
                maxlength: 6
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
        messages: {
            sourceType: window.location.MESSAGE_ERROR["QA-001"]
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
            let dataEdit = _.chain($("#form_update_source .input"))
                .reduce(function (memo, el) {
                    let value = $(el).val()
                    if (value != "" && value != null) memo[el.name] = value
                    return memo
                }, {})
                .value()

            const id = $("#save_edit_source").attr("data-id")

            _AjaxData('/manageSourceRecord/' + id, 'PUT', JSON.stringify(dataEdit), { contentType: "application/json" }, function (resp) {
                if (resp.code == 500) return toastr.error(resp.message)

                toastr.success(resp.message)
                return refreshPage("modalUpdateSource")
            })
        }
    })

    $("#form_file_server").validate({
        rules: {
            ipServer: {
                required: true
            },
            path: {
                required: true
            },
            port: {
                required: true,
                number: true
            }
        },
        messages: {
            ipServer: {
                required: window.location.MESSAGE_ERROR["QA-001"],
            },
            path: {
                required: window.location.MESSAGE_ERROR["QA-001"],
            },
            port: {
                required: window.location.MESSAGE_ERROR["QA-001"],
                number: 'Giá trị cần nhập là số'
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
            let data = {}
            data = getFormData('manage-source')
            if ($('#btn-save-file-server').attr('data-id')) data.id = $(this).attr('data-id')

            _AjaxData('/manageSourceRecord/checkShhFileServer', 'POST', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
                if (resp.code != 200) {
                    return toastr.error("Thông tin file server không thể kết nối được")
                }

                _AjaxData('/manageSourceRecord/saveFileServer', 'POST', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
                    if (resp.code != 200) {
                        return toastr.error(resp.message)
                    }
                    toastr.success('Lưu thành công !')
                    return setTimeout(() => {
                        window.location.href = "/manageSourceRecord"
                    }, 2500)
                })
            })
        }
    })
}
function bindClick() {
    $(document).on('click', '.action-on', function () {
        $("#activeSource").modal('show')
        const id = $(this).attr("data-id")
        $("#confirmActive").attr("data-id", id)
    })

    $(document).on('click', '.action-off', function () {
        $("#unActiveSource").modal('show')
        const id = $(this).attr("data-id")
        $("#confirmUnActive").attr("data-id", id)
    })

    $(document).on('click', '#confirmActive', function () {
        const id = $(this).attr("data-id")
        _AjaxData('/manageSourceRecord/' + id + '/updateStatus', 'PUT', JSON.stringify({ enabled: ENABLED.ON }), { contentType: "application/json" }, function (resp) {
            if (resp.code == 500) return toastr.error(resp.message)

            toastr.success(resp.message)
            return refreshPage("activeSource")
        })
    })

    $(document).on('click', '#confirmUnActive', function () {
        const id = $(this).attr("data-id")
        _AjaxData('/manageSourceRecord/' + id + '/updateStatus', 'PUT', JSON.stringify({ enabled: ENABLED.OFF }), { contentType: "application/json" }, function (resp) {
            if (resp.code == 500) return toastr.error(resp.message)

            toastr.success(resp.message)
            return refreshPage("unActiveSource")
        })
    })

    $(document).on('click', '.detail-manage-source-record', function () {
        const id = $(this).attr("data-id")
        _AjaxGetData('/manageSourceRecord/' + id + '/detail', 'GET', function (resp) {
            console.log("manage source detail", resp)
            if (resp.code == 500) return toastr.error(resp.message)

            $('#modalUpdateSource').modal('show')
            showDetailSource(resp.data)
            $("#save_edit_source").attr("data-id", id)
        })

    })
    // get list source record
    $(document).on('click', '#source-recording', function () {
        findData()
    })

    $(document).on('click', '#searchSource', function () {
        const limit = $(".sl-limit-page").val()
        findData(limit)
    })

    $(document).on('click', '.zpaging', function () {
        const page = $(this).attr('data-link')
        const limit = $(".sl-limit-page").val()
        findData(limit, page)
    })

    $(document).on('change', '.sl-limit-page', function () {
        console.log('change sl-limit-page', $(this).val())
        const limit = $(this).val()
        findData(limit)
    })

    $("#modalCreateSource").on("hidden.bs.modal", function () {
        $('#form_new_source')[0].reset()
    })

    $("#modalUpdateSource").on("hidden.bs.modal", function () {
        $('#form_update_source')[0].reset()
    })

    $(document).on('click', "#btn-cancel-save-file-server", function () {
        return location.reload()
    })

    // $(document).on('click', "#btn-save-file-server", function () {

    // })


    $(document).on('click', "#btn-try-to-connect", function () {
        data = getFormData('manage-source')

        if ($(this).attr('data-id')) data.id = $(this).attr('data-id')

        _AjaxData('/manageSourceRecord/checkShhFileServer', 'POST', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
            if (resp.code != 200) {
                console.log('kết nối không thành công:', resp.message);
                return toastr.error('Thử kết nối không thành công')
            }
            toastr.success('Kết nối thành công !')
        })
    })

}

function refreshPage(idForm) {
    setTimeout(() => {
        $(`#${idForm}`).modal('hide')
        $('[href="#manage-file-server"]').tab('show')
        findData()
    }, 2500)
}

function findData(limit, page) {
    var filter = _.chain($('.searchColumn')).reduce(function (memo, el) {
        if (!_.isEqual($(el).val(), '')) memo[el.name] = $(el).val()
        return memo
    }, {}).value()

    if (limit) filter.limit = limit
    if (page) filter.page = page

    _AjaxGetData('/manageSourceRecord/getListSource?' + $.param(filter), 'GET', function (resp) {
        console.log("list data manage source", resp)
        if (resp.code == 500) return toastr.error(resp.message)
        createTable(resp.listData)
        $('#paging_table').html(window.location.CreatePaging(resp.paginator))
    })
}

function createTable(listData) {
    let html = ''
    listData.forEach(item => {
        html += `<tr>
                    <td class = "text-center"><a href="javascript:void(0)" class="detail-manage-source-record" data-id="${item.id} ">${item.sourceName}</a></td>
                    <td class = "text-center"><a href="javascript:void(0)" class="${item.enabled == true ? 'action-off' : 'action-on'}" data-id="${item.id} ">${item.enabled == true ? 'Ngừng hoạt động' : 'Kích hoạt'}</a></td>
                    <td class = "text-center">${item.sourceType}</td>
                    <td class = "text-center">${item.enabled == true ? '<span class="badge badge-success">Hoạt động</span>' : '<span class="badge badge-danger">Ngừng hoạt động</span>'}</td>
                    <td class = "text-center">${item.createdAt ? moment(item.createdAt, "HH:mm:ss DD/MM/YYYY").format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                    <td class = "text-center">${item.userCreate && item.userCreate.fullName ? item.userCreate.fullName : ''}</td>
                    <td class = "text-center">${item.updatedAt ? moment(item.updatedAt, "HH:mm:ss DD/MM/YYYY").format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                    <td class = "text-center">${item.userUpdate && item.userUpdate.fullName ? item.userUpdate.fullName : ''}</td>
                </tr>`
    })

    $("#tableBody").html(html)
    return
}

function showDetailSource(data) {
    $("#sourceName").val(data.sourceName)
    $("#sourceType").val(genSourceType(data.sourceType))
    $('.selectpicker').selectpicker('refresh')
    $("#dbServerName").val(data.dbServerName)
    $("#dbServerId").val(data.dbServerId)
    $("#dbHost").val(data.dbHost)
    $("#dbPort").val(data.dbPort)
    $("#dbUser").val(data.dbUser)
    $("#dbPassword").val(data.dbPassword)
    $("#dbName").val(data.dbName)
}

function genSourceType(sourceType) {
    for (var pro in SOURCE_NAME) {
        if (SOURCE_NAME[pro].text == sourceType) {
            return SOURCE_NAME[pro].code
        }
    }
}

function getFormData(formId) {
    let filter = {}

    filter = _.chain($(`#${formId} .input`)).reduce(function (memo, el) {
        let value = $(el).val()
        if (value != '' && value != null) memo[el.name] = value
        else memo[el.name] = ""
        return memo
    }, {}).value()

    return filter
}

$(function () {
    $('.selectpicker').selectpicker().change(function () {
        $(this).valid()
    })
    validateAndCreate()
    bindClick()
})

$(window).on('beforeunload', function () {
    $(document).off('click', '#source-recording')
    $(document).off('click', '#searchSource')
    $(document).off('click', '#confirmActive')
    $(document).off('click', '#confirmUnActive')
    $(document).off('click', '.detail-manage-source-record')
    $(document).off('click', '.zpaging')
    $(document).off('click', '.sl-limit-page')
    $(document).off('click', '.action-on')
    $(document).off('click', '.action-off')
})