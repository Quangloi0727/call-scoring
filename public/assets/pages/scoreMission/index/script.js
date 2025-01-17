// https://codepen.io/scottjehl/pen/abJrPOP

const $leftTable = $('.content-table-left')
const $rightTable = $('.content-table-right')
const $resetColumnCustom = $('#resetColumnCustom')
const $modal_customs_table = $("#modal_customs_table")
const $selectAll = $("#select-all")

//init wavesurfer
var wavesurfer = null

// Lưu tạm dữ liệu của nhóm tiêu chí từ kịch bản chấm điểm
var _criteriaGroups = {}

// WARNING
// CACHE
var CACHE_CONFIG_COLUMN = null

// data before edir
var dataEditOrigin = null

function bindClick() {

    $(document).on('click', '.zpaging', function () {
        let page = $(this).attr('data-link')
        return findData(page)
    })

    $(document).on('change', '.sl-limit-page', function () {
        console.log('change sl-limit-page')
        return findData(1)
    })

    $selectAll.click(function (event) {
        if (this.checked) {
            // Iterate each checkbox
            $(':checkbox').each(function () {
                this.checked = true
            })
        } else {
            $(':checkbox').each(function () {
                console.log($(this).attr('name'))
                if ($(this).attr('name') == 'callId') return
                this.checked = false

            })
        }
    })

    $resetColumnCustom.on('click', async () => {
        _AjaxData('/scoreMission/configurationColums', 'DELETE', null, null, function (resp) {
            if (resp.code == 200) {
                // reset tick
                renderPopupCustomColumn(headerDefault, true)
                // xóa cache
                CACHE_CONFIG_COLUMN = null
                location.reload()
            } else {
                return toastr.error(resp.message)
            }
        })
    })

    $(document).on('click', '.fa-history', function () {
        $('#popupHistory').modal('show')
        const callId = $(this).attr('data-callId')
        _AjaxGetData('/scoreMission/' + callId + '/getCallRatingNotes', 'GET', function (resp) {
            if (resp.code == 200) {
                if (resp.result && resp.result.length == 0) return
                let html = ``
                resp.result.forEach(el => {
                    html += `
                                <p class="font-weight-bold">[${el.userCreate && el.userCreate.fullName ? el.userCreate.fullName : ''}] đã thêm một ghi chú lúc ${(moment(el.createdAt).format("DD/MM/YYYY HH:mm:ss"))}</p>
                                <p>Ghi chú cho :${_genNoteFor(el.criteria, el.criteriaGroup)}</p>
                                <p>Hiển thị trên file ghi âm tại :${_secondsToTimestamp(_convertTime(el.timeNoteMinutes || 0, el.timeNoteSecond || 0))}</p>
                                <p>${el.description}</p>
                                <hr></hr>
                            `
                })
                $("#comment .card-body").html(html)
            } else {
                console.log("get call rating note form history fail", resp)
            }
        })
        _AjaxGetData('/scoreMission/' + callId + '/getCallRatingHistory', 'GET', function (resp) {
            console.log("data edit history", resp)
            if (resp.code == 200) {
                if (resp.resultEdit && resp.resultEdit.length == 0 && resp.resultAdd && resp.resultAdd.length == 0) return
                let html = ``
                const grouped = _.groupBy(resp.resultEdit, el => el.createdAt)
                for (let index in grouped) {
                    const data = grouped[index]
                    html += `<p class="font-weight-bold">[${data[0].userCreate && data[0].userCreate.fullName ? data[0].userCreate.fullName : ''}] đã sửa chấm điểm lúc ${(moment(data[0].createdAt).format("DD/MM/YYYY HH:mm:ss"))}</p>`
                    data.forEach(el => {
                        html += `
                                    <div class = "row">
                                        <div class="col-6">
                                            <i class='fas fa-edit'></i>
                                            ${el.criteria && el.criteria.name ? el.criteria.name : ''} :
                                        </div>
                                        <div class="col-6">
                                            ${el.selectionCriteriaOld && el.selectionCriteriaOld.name ? el.selectionCriteriaOld.name : ''} <i class="fas fa-angle-double-right"></i>
                                            ${el.selectionCriteriaNew && el.selectionCriteriaNew.name ? el.selectionCriteriaNew.name : ''}
                                        </div>
                                    </div>
                                `
                    })
                    html += `<hr></hr>`
                }

                if (resp.resultAdd && !_.isEmpty(resp.resultAdd)) {
                    const { userCreate, createdAt } = resp.resultAdd || {}
                    html += `<p class="font-weight-bold">[${userCreate.fullName}] đã chấm điểm lúc ${(moment(createdAt).format("DD/MM/YYYY HH:mm:ss"))}</p>`
                }

                $("#callScore .card-body").html(html)
            } else {
                console.log("get call rating note form history fail", resp)
            }
        })
    })

    $(document).on('click', '.fa-comment-alt', function () {
        const urlRecord = $(this).attr('url-record')
        const callId = $(this).attr('data-callId')
        $('#btn-add-comment').attr('data-callId', callId)
        $("#downloadFile-popupComment").attr("url-record", urlRecord)
        $(".callId").text(callId)
        _AjaxGetData('/scoreMission/' + callId + '/checkScored', 'GET', function (resp) {
            if (resp.code == 401) return toastr.error(resp.message)
            $('#popupComment').modal('show')
            if (resp.code == 200) {
                $("#idCriteriaGroupComment").attr("disabled", true)
                $("#idCriteriaComment").attr("disabled", true)
                $('.selectpicker').selectpicker('refresh')
            } else {
                $("#idCriteriaGroupComment").attr("disabled", false)
                $("#idCriteriaComment").attr("disabled", false)
                $('.selectpicker').selectpicker('refresh')
                _AjaxGetData('/scoreMission/' + callId + '/getCriteriaGroupByCallRatingId', 'GET', function (resp) {
                    renderCriteriaGroup(resp.result && resp.result.CriteriaGroup ? resp.result.CriteriaGroup : [])
                    $('.selectpicker').selectpicker('refresh')
                })
            }
            _AjaxGetData('/scoreMission/' + callId + '/getCallRatingNotes', 'GET', function (resp) {
                if (resp.code == 200) {
                    wavesurfer = _configWaveSurfer(resp.result, urlRecord, "#recordComment")
                } else {
                    console.log("get list note callId " + callId + " error")
                    wavesurfer = _configWaveSurfer([], urlRecord, "#recordComment")
                }
            })
        })

    })

    $(document).on('click', '.fa-play-circle', function () {
        const urlRecord = $(this).attr('url-record')
        const callId = $(this).attr('data-callId')
        $(".callId").text(callId)
        $("#formDetailRecord").html('')
        $('#showDetailRecord').modal('show')
        //$("#downloadFile").attr("url-record", "https://qa.metechvn.com/static/call.metechvn.com/archive/2022/Aug/17/d6a4f7a2-1dce-11ed-b31a-95f7e31f94c6.wav")
        $("#downloadFile").attr("url-record", urlRecord)
        _AjaxGetData('/scoreMission/' + callId + '/getCallRatingNotes', 'GET', function (resp) {
            if (resp.code == 200) {
                wavesurfer = _configWaveSurfer(resp.result, urlRecord, null)
            } else {
                console.log("get list note callId " + callId + " error")
                wavesurfer = _configWaveSurfer([], urlRecord, null)
            }
        })
    })

    $(document).on('click', '.showCallScore', function () {
        if ($(this).attr('check-disable') == 'false') return toastr.error("Cuộc gọi chưa được chấm điểm !")
        let callId = $(this).attr('data-callId')
        $(".callId").text(callId)
        let idScoreScript = $(this).attr('data-id')
        let url = $(this).attr('url-record')
        return getDetailScoreScript(idScoreScript, callId, url)
    })

    $(document).on('click', '.detailScoreScript', function () {
        $('#collapseScoreScript').show()
    })

    $(document).on('click', '.detailNoteScore', function () {
        $('#collapseNoteScore').show()
    })

    // event nhập text ghi chú
    $('textarea').on('keyup', function (e) {
        const lengthValue = $(this).val()
        $(".countValueLength").text(lengthValue.length + "/500")
    })

    // xử lí chọn option ghi chú của mục tiêu
    $(document).on('change', '#idCriteriaGroup', function () {
        renderCriteria($(this).val(), '#idCriteria')
    })

    $(document).on('click', '#btn-add-comment', function () {
        let data = {}
        let callId = $(this).attr('data-callId')
        data.note = getFormData('formCallComment')
        data.note.callId = callId
        data.note.idCriteria = data.note.idCriteriaComment
        data.note.idCriteriaGroup = data.note.idCriteriaGroupComment
        data.note.createdByForm = CreatedByForm.COMMENT
        _AjaxData('/scoreMission/saveCallRating', 'POST', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
            if (resp.code != 200) return toastr.error(resp.message)
            toastr.success('Lưu thành công !')
            return setTimeout(() => {
                window.location.href = "/scoreMission"
            }, 2500)
        })
    })

    // xử lí chọn option ghi chú của mục tiêu
    $(document).on('change', '#idCriteriaGroupComment', function () {
        renderCriteria($(this).val(), '#idCriteriaComment')
    })

    // button lưu tùy chỉnh bảng
    $(document).on('click', '#btn_save_customs', function () {
        let obj = {}
        $("#sortable input:checkbox").each(function (index) {
            // gán dữ liệu
            let key = $(this).attr("name")
            let value = $(this).is(":checked")
            obj[key] = value
        })
        // debugger;
        SaveConfigurationColums(obj)
    })

    // hiển thị data sau khi tủy chỉnh bảng
    $modal_customs_table.on('show.bs.modal', function (event) {
        if (CACHE_CONFIG_COLUMN) {
            renderPopupCustomColumn(CACHE_CONFIG_COLUMN)
        } else {
            renderPopupCustomColumn(headerDefault, true)
        }
    })

    $(document).on('click', '#downloadFile', function () {
        let src_file = $(this).attr("url-record")
        window.location = src_file
    })

    $(document).on('click', '#downloadFile-popupCallScore', function () {
        let src_file = $(this).attr("url-record")
        window.location = src_file
    })

    $(document).on('click', '#downloadFile-popupCallScore', function () {
        let src_file = $(this).attr("url-record")
        window.location = src_file
    })

    $(document).on('click', '#btn-save-modal', function () {
        let data = {}
        let callId = $(this).attr('data-callId')
        let idScoreScript = $(this).attr('data-idScoreScript')
        let arr = []
        let checkSelectNull = false
        $(".error-non-select").remove()
        $(".selectpicker.criteria").each(function () {
            if ($(this).val() == '') {
                checkSelectNull = true
                $(this).closest('.form-group').append(`<span class="error-non-select mr-1">${window.location.MESSAGE_ERROR["QA-001"]}</span>`)
            }
            arr.push({
                idSelectionCriteria: $(this).val() == 'not_enough_infor' ? null : $(this).val(),
                idCriteria: $(this).attr('data-criteriaId'),
                callId: callId,
                idScoreScript: idScoreScript
            })
        })

        if (checkSelectNull) return toastr.error("Không được để trống tiêu chí")

        data.note = getFormData('formCallScore')
        data.note.callId = callId
        data.note.idScoreScript = idScoreScript
        data.note.createdByForm = CreatedByForm.ADD
        data.resultCriteria = arr


        if (data.note.description && (!data.note.timeNoteMinutes && !data.note.timeNoteSecond)) {
            $('.error-input-timeNote').removeClass('d-none')
            $('.error-input-timeNote').text(window.location.MESSAGE_ERROR["QA-001"])
            return toastr.error('Thời gian ghi chú không được bỏ trống !')
        }

        if (data.note.timeNoteMinutes || data.note.timeNoteSecond) {
            let timeNoteMinutes = data.note.timeNoteMinutes ? data.note.timeNoteMinutes : 0
            let timeNoteSecond = data.note.timeNoteSecond ? data.note.timeNoteSecond : 0
            let totalSeconds = _convertTime(timeNoteMinutes, timeNoteSecond)
            if (totalSeconds > wavesurfer.getDuration()) {
                $('.error-input-timeNote').removeClass('d-none')
                $('.error-input-timeNote').text("Thời gian ghi chú không hợp lệ !")
                return toastr.error("Thời gian ghi chú không hợp lệ !")
            }
        }

        if (!data.note.description && (data.note.timeNoteMinutes || data.note.timeNoteSecond)) {
            $('.error-textarea-description').removeClass('d-none')
            $('.error-textarea-description').text('Nội dung ghi chú không được bỏ trống !')
            return toastr.error(window.location.MESSAGE_ERROR["QA-001"])
        }

        if (!data.note.timeNoteMinutes && !data.note.timeNoteSecond) delete data.note // case này là case KH k nhập chấm điểm

        const action = $(this).attr('method')

        if (action == 'edit') {
            delete data.note
            data.type = 'edit'
        } else {
            data.type = 'add'
        }

        data.dataEditOrigin = dataEditOrigin

        _AjaxData('/scoreMission/saveCallRating', 'POST', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
            if (resp.code != 200) return toastr.error(resp.message)

            toastr.success('Lưu thành công !')
            return setTimeout(() => {
                const findPage = $(".active .page-link").text()
                const findScoreTargetId = $("#scoreTargetId").val()
                $('#popupCallScore').modal('hide')
                findData(Number(findPage), findScoreTargetId)
            }, 2500)
        })
    })


    // hiển thị data sau khi tủy chỉnh bảng
    $modal_customs_table.on('show.bs.modal', function (event) {
        if (CACHE_CONFIG_COLUMN) {
            renderPopupCustomColumn(CACHE_CONFIG_COLUMN)
        } else {
            renderPopupCustomColumn(headerDefault, true)
        }
    })


    $(`.controls .btn`).on('click', function () {
        var action = $(this).data('action')
        console.log("action", action)
        switch (action) {
            case 'play':
                wavesurfer.playPause()
                break
            case 'back':
                wavesurfer.skipBackward(10)
                _updateTimer(wavesurfer)
                break
            case 'forward':
                wavesurfer.skipForward(10)
                _updateTimer(wavesurfer)
                break
        }
    })

    $('#scoreTargetId').on('change', function () {
        const arrValue = $(this).val()
        findData(1, arrValue)
    })

    $('#submitGeneralSetting').on('click', function () {
        const idChange = $("#generalSetting").val()
        SaveConfigurationColums({ generalSetting: idChange })
    })

    $('#cancelGeneralSetting').on('click', function () {
        window.location.href = "/scoreMission"
    })

    $('.dropdown-item').on('click', function () {
        var val = $(this).attr("data-val")
        console.log("value play speed", val)
        wavesurfer.setPlaybackRate(val)
        $(".defaultPlaySpeed").text(val == 1 ? "Chuẩn" : val)
    })

    $("#showDetailRecord").on("hidden.bs.modal", function () {
        wavesurfer ? wavesurfer.destroy() : ''
    })

    $("#popupCallScore").on("hidden.bs.modal", function () {
        wavesurfer ? wavesurfer.destroy() : ''
        $('#recordCallScore').html('')
        $(".countValueLength").text("0/500")
    })

    $("#popupHistory").on("hidden.bs.modal", function () {
        $("#callScore .card-body").html('')
        $("#comment .card-body").html('')
    })

    $("#popupComment").on("hidden.bs.modal", function () {
        wavesurfer ? wavesurfer.destroy() : ''
        $('#formCallComment')[0] ? $('#formCallComment')[0].reset() : ''
        $("#idCriteriaComment").html('')
        $(".countValueLength").text("0/500")
    })


    $(document).on('click', '.nav-link.nav-criteria-group', function () {
        $('.nameCriteriaGroup').text($(this).text())
        if ($(this).attr('resultPointCriteriaGroup')) {
            return setTimeout(() => {
                let totalTemp = 0
                $(".tab-pane.fade.mb-4.show.active option:selected").each(function () {
                    if ($(this).val() != "not_enough_infor") {
                        totalTemp += parseInt($(this).parent().attr('data-point-max'))
                    }
                })
                $(`.nav-link.nav-criteria-group.active`).attr("data-point", totalTemp)
                let point = $(this).attr('resultPointCriteriaGroup')
                let total = $(this).attr('data-point')
                var perc = _convertPercentNumber(point, total)
                let html = `<div class="progress-bar" role="progressbar" style="width: ${perc}%;" aria-valuenow="${perc}" aria-valuemin="0" aria-valuemax="100">Hoàn thành ${perc}%</div>`
                $('#progress-scoreCriteria').html(html)
                $('.scoreCriteria').text(`Tổng điểm: ${point}/${total} - ${perc}%`)
            }, 345)
        } else {
            $('#progress-scoreCriteria').html('')
            $('.scoreCriteria').text(`Tổng điểm: 0/${$(this).attr('data-point')} - 0%`)
        }
    })

    $(document).on('change', '#criteriaChange', function () {
        //tổng điểm nhóm tiêu chí
        const groupId = $(this).attr("data-criterialGroupId")
        const $firstElm = $(`.nav-link.nav-criteria-group.group-${groupId}`)
        let point = 0
        let dataUnScoreScript = false
        $(".tab-pane.fade.mb-4.show.active option:selected").each(function () {
            const dataUnScoreCriteriaGroup = $(this).attr("data-unScoreCriteriaGroup")
            if (dataUnScoreCriteriaGroup == "true") {
                point = 0
                return false
            } else {
                point += $(this).attr("data-point") ? parseInt($(this).attr("data-point")) : 0
            }
        })

        let totalTemp = 0
        $(".tab-pane.fade.mb-4.show.active option:selected").each(function () {
            if ($(this).attr("data-unScoreScript") == "true") dataUnScoreScript = true

            if ($(this).val() != "not_enough_infor") {
                totalTemp += parseInt($(this).parent().attr('data-point-max'))
            }
        })
        $(`.nav-link.nav-criteria-group.group-${groupId}.active`).attr("data-point", totalTemp)

        const total = $firstElm.attr('data-point')
        const perc = _convertPercentNumber(point, total)
        let htmlScoreCriteria = `<div class="progress-bar" role="progressbar" style="width: ${perc}%;" aria-valuenow="${perc}" aria-valuemin="0" aria-valuemax="100">Hoàn thành ${perc}%</div>`
        $('#progress-scoreCriteria').html(htmlScoreCriteria)
        $('.scoreCriteria').text(`Tổng điểm: ${point}/${total} - ${perc}%`)
        $(`.nav-link.nav-criteria-group.group-${groupId}.active`).attr("resultpointcriteriagroup", point)
        $(`.nav-link.nav-criteria-group.group-${groupId}.active`).attr("data-unScoreScript", dataUnScoreScript)
        //tổng điểm kịch bản
        let totalScoreScript = 0
        let pointScoreScript = 0
        let checkDataUnScoreScript = false
        $(".nav-criteria-group").each(function () {
            if ($(this).attr("data-unScoreScript") == "true") checkDataUnScoreScript = true
            totalScoreScript += $(this).attr("resultpointcriteriagroup") ? parseInt($(this).attr("resultpointcriteriagroup")) : 0
            pointScoreScript += $(this).attr("data-point") ? parseInt($(this).attr("data-point")) : 0
        })
        checkDataUnScoreScript == true ? totalScoreScript = 0 : totalScoreScript
        const percScoreScript = _convertPercentNumber(totalScoreScript, pointScoreScript)
        let htmlScoreScript = `<div class="progress-bar" role="progressbar" style="width: ${percScoreScript}%;" aria-valuenow="${percScoreScript}" aria-valuemin="0" aria-valuemax="100">Hoàn thành ${percScoreScript}%</div>`
        $('#progress-scoreScript').html(htmlScoreScript)
        $('.scoreScript').text(`Tổng điểm: ${totalScoreScript}/${pointScoreScript} - ${percScoreScript}%`)
    })

}

function SaveConfigurationColums(dataUpdate) {
    return _AjaxData('/scoreMission/configurationColums', 'POST', JSON.stringify(dataUpdate), { contentType: "application/json" }, function (resp) {
        if (resp.code != 200) {
            return toastr.error(resp.message)
        }
        toastr.success('Lưu thành công !')
        return setTimeout(() => {
            window.location.href = "/scoreMission"
        }, 2500)
    })
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

function findData(page, arrScoreTargetId) {
    let queryData = {}
    if (page) queryData.page = page
    queryData.scoreTargetId = arrScoreTargetId ? arrScoreTargetId : $("#scoreTargetId").val()
    queryData.limit = $('.sl-limit-page').val() || 10
    $('.page-loader').show()
    $.ajax({
        type: 'GET',
        url: '/scoreMission/getData?' + $.param(queryData),
        cache: 'false',
        success: function (result) {
            console.log("List data score mission", result)
            if (result.configurationColums) {
                const checkValueFalse = Object.values(result.configurationColums).every((rs) => rs === false)
                if (checkValueFalse == true) {
                    $('.table-left').css('position', 'inherit')
                }
            }
            $('.page-loader').hide()
            CACHE_CONFIG_COLUMN = result.configurationColums
            createTable(result.data, result.configurationColums ? result.configurationColums : headerDefault, result.configurationColums ? false : true)
            return $('#paging_table').html(window.location.CreatePaging(result.paginator))
        },
        error: function (error) {
            $('.page-loader').hide()
            console.log(error)
            return toastr.error(error.responseJSON.message)
        },
    })
}

/**
 * xử lí data cho chức năng tùy chỉnh bảng
 * *****Start*****
 */
function renderPopupCustomColumn(ConfigurationColums, init = false) {
    let popupHtml = ''
    popupHtml += `<div>
                    <ul class='p-0 border-bottom mb-3'>Mã cuộc gọi</ul>
                    <ul class='p-0 border-bottom mb-3'>Thao tác</ul>
                </div>`
    if (CACHE_CONFIG_COLUMN) {
        for (const [key, value] of Object.entries(ConfigurationColums)) {
            popupHtml += itemColumn(key, headerDefault[key], init == true ? 'true' : value)
        }
        let columnNotTick = _.difference(Object.keys(headerDefault), Object.keys(ConfigurationColums))
        columnNotTick.forEach(i => {
            popupHtml += itemColumn(i, headerDefault[i], false)
        })
    } else {
        for (const [key, value] of Object.entries(ConfigurationColums)) {
            popupHtml += itemColumn(key, headerDefault[key], value.status == 1 ? 'true' : 'false')
        }
    }

    $('#sortable').html(popupHtml)
}


function renderHeaderTable(ConfigurationColums, configDefault) {
    const headerTable = checkConfigDefaultHeader(ConfigurationColums, configDefault)
    return $('.table-right.custom-table thead tr').html(headerTable)
}

function itemColumn(key, title, value) {
    // debugger;
    return `<li class="mb-3 border-bottom">
                <div class="row">
                    <div class = "col-md-11">
                        <input class="form-check-input" type="checkbox" name="${key}" ${value == true || value == 'true' ? 'checked' : ''} /> ${title.name}
                    </div>
                    <div class = "col-md-1">
                        <i class="fas fa-arrows-alt" title="Giữ kéo/thả để sắp xếp"></i>
                    </div>
                </div>
            </li>`
}
///***** __end__*****
function createTable(data, ConfigurationColums, configDefault) {
    let objColums = { ...ConfigurationColums }
    renderPopupCustomColumn(ConfigurationColums)
    renderHeaderTable(ConfigurationColums, configDefault)

    let uuidv4 = window.location.uuidv4()
    let rightTable = ''
    let leftTable = ``
    data.forEach(item => {
        const ScoreTarget_ScoreScript = item.scoreTargetInfo && item.scoreTargetInfo.ScoreTarget_ScoreScript ? item.scoreTargetInfo.ScoreTarget_ScoreScript : []
        const { recordingFileName } = item.callInfo
        let dropdown = ''
        if (ScoreTarget_ScoreScript.length > 0) {
            ScoreTarget_ScoreScript.map((el) => {
                dropdown += `<a class="dropdown-item showCallScore ${item.isMark ? 'disabled' : ''}" data-callId="${item.callId}" 
                                url-record="${recordingFileName}" data-id="${el.scoreScriptId}">${el.scoreScriptInfo && el.scoreScriptInfo.name ? el.scoreScriptInfo.name : ''}
                            </a>`
            })
        }

        let tdTable = checkConfigDefaultBody(objColums, configDefault, item)

        rightTable += `<tr>${tdTable}</tr>`
        leftTable += ` <tr class="text-center">
            <td class="text-center callIdColumn" title="${item.callId || ''}">${item.callId || ''}</td>
            <td class="text-center">    
                <i class="fas fa-check mr-2" id="dropdown-${uuidv4}" data-toggle="dropdown" title="Chấm điểm"></i>
                <div class="dropdown-menu" aria-labelledby="dropdown-${uuidv4}">
                    ${item.isMark == false ? dropdown : '<a class="dropdown-item">Cuộc gọi đã được chấm điểm !</a>'}
                </div>
                <i class="fas fa-pen-square mr-2 showCallScore" url-record="${recordingFileName}" data-callId="${item.callId}" data-id="${item.idScoreScript}" title="Sửa chấm điểm" check-disable="${item.isMark}"></i>
                <i class="fas fa-comment-alt mr-2" title="Ghi chú" url-record="${recordingFileName}" data-callId=${item.callId}></i>
                <i class="fas fa-history mr-2" title="Lịch sử chấm điểm" data-callId=${item.callId}></i>
                <i class="fas fa-play-circle mr-2" title="Xem chi tiết ghi âm" url-record="${recordingFileName}" data-callId=${item.callId}></i>
            </td>
        </tr>`
    })

    $leftTable.html(leftTable)
    $rightTable.html(rightTable)
    return

}

function checkConfigDefaultHeader(dataConfig, configDefault) {
    let htmlString = ``
    if (configDefault) {
        for (const [key] of Object.entries(dataConfig)) {
            htmlString += ` <th class="text-center ${key} ${headerDefault[key].status == 1 ? '' : 'd-none'}">${headerDefault[key].name || ''}</th>`
        }
    } else {
        for (const [key, value] of Object.entries(dataConfig)) {
            htmlString += `<th class="text-center  ${key} ${value == true ? '' : 'd-none'}" >${headerDefault[key].name}</th>`
        }
    }
    return htmlString
}

function checkConfigDefaultBody(dataConfig, configDefault, item) {
    const { callInfo } = item
    let resultReviewScore = ''
    let pointResultCallRating = '-'
    if (item.isMark) {
        resultReviewScore = item.typeResultCallRating != '' ? constTypeResultCallRating[`point${item.typeResultCallRating}`].txt : ''
        if (item.scoreScriptInfo.scoreDisplayType == OP_UNIT_DISPLAY.phanTram.n) {
            pointResultCallRating = _convertPercentNumber(item.pointResultCallRating, item.scoreMax) + `%`
        } else {
            pointResultCallRating = `${item.pointResultCallRating}/${item.scoreMax}` || 0
        }
    }
    let htmlString = ``
    if (configDefault) {
        for (const [key] of Object.entries(dataConfig)) {
            if (key == 'manualReviewScore') {

                htmlString += ` <td class="text-center manualReviewScore ${headerDefault['manualReviewScore'].status == 1 ? '' : 'd-none'}">${pointResultCallRating}</td>`

            } else if (key == 'resultReviewScore') {

                htmlString += ` <td class="text-center resultReviewScore ${dataConfig['resultReviewScore'].status == 1 ? '' : 'd-none'}">${resultReviewScore}</td>`

            } else if (key == 'agentName') {

                htmlString += ` <td class="text-center agentName ${headerDefault['agentName'].status == 1 ? '' : 'd-none'}">${callInfo['agent'] ? callInfo['agent'].fullName : ''}</td>`

            } else if (key == 'teamName') {

                htmlString += ` <td class="text-center teamName ${headerDefault['teamName'].status == 1 ? '' : 'd-none'}">${callInfo['team'] ? callInfo['team'].name : ''}</td>`

            } else if (key == 'groupName') {

                htmlString += ` <td class="text-center teamName ${headerDefault['groupName'].status == 1 ? '' : 'd-none'}">${genGroupOfAgent(callInfo['groupName'])}</td>`

            } else {
                htmlString += ` <td class="text-center ${key} ${headerDefault[key].status == 1 ? '' : 'd-none'}">${callInfo[key] || '&nbsp'}</td>`
            }
        }
    } else {
        for (const [key, value] of Object.entries(dataConfig)) {
            if (key == 'manualReviewScore') {

                htmlString += ` <td class="text-center manualReviewScore ${dataConfig['manualReviewScore'] == true ? '' : 'd-none'}">${pointResultCallRating}</td>`

            } else if (key == 'resultReviewScore') {

                htmlString += ` <td class="text-center resultReviewScore ${dataConfig['resultReviewScore'] == true ? '' : 'd-none'}">${resultReviewScore}</td>`

            } else if (key == 'agentName') {

                htmlString += ` <td class="text-center agentName ${dataConfig['agentName'] == true ? '' : 'd-none'}">${callInfo['agent'] ? callInfo['agent'].fullName : ''}</td>`

            } else if (key == 'teamName') {

                htmlString += ` <td class="text-center teamName ${dataConfig['teamName'] == true ? '' : 'd-none'}">${callInfo['team'] ? callInfo['team'].name : ''}</td>`

            } else if (key == 'groupName') {

                htmlString += ` <td class="text-center teamName ${dataConfig['groupName'] == true ? '' : 'd-none'}">${genGroupOfAgent(callInfo['groupName'])}</td>`

            } else {
                htmlString += ` <td class="text-center ${key} ${value == true ? '' : 'd-none'}">${callInfo[key] || '&nbsp'}</td>`
            }
        }
    }
    return htmlString
}

function genGroupOfAgent(groupName) {
    if (!groupName || !groupName.length) return ''
    if (groupName.length == 1) return groupName[0]
    return `
            <div class="dropdown">
                <a class="dropdown-custom dropdown-toggle" role="button" id="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    ${groupName.length} nhóm
                </a>
                <div class="dropdown-menu" aria-labelledby="dropdown">
                    ${genEachGroup(groupName)}
                </div>
            </div>
    `
}

function genEachGroup(groupName) {
    let html = ''
    groupName.forEach(el => {
        html += `<a class="dropdown-item" type="button">${el}</a>`
    })
    return html
}

// lấy thông tin chi tiết của kịch bản chấm điểm
function getDetailScoreScript(idScoreScript, callId, url) {
    let queryData = {}
    queryData.idScoreScript = idScoreScript
    queryData.callId = callId
    _AjaxGetData('scoreMission/getScoreScript?' + $.param(queryData), 'GET', function (resp) {
        console.log("data kịch bản chấm điểm", resp)
        if (resp.code != 200) return toastr.error(resp.message)
        if (resp?.scoreScriptInfo?.CriteriaGroup?.length > 0) {
            $('.nameScoreScript').text(resp.scoreScriptInfo.name)
            // data tiêu chí vào biến chugng để xử lí cho các element khác -- các tiêu chí có trong có trong kịch bản ko có giá trị để tính điểm
            _criteriaGroups = resp.scoreScriptInfo.CriteriaGroup

            $("#downloadFile-popupCallScore").attr("url-record", url)
            wavesurfer = _configWaveSurfer(resp.resultCallRatingNote ? resp.resultCallRatingNote : [], url, '#recordCallScore')

            $('#btn-save-modal').attr('data-callId', callId)
            $('#btn-save-modal').attr('data-idScoreScript', idScoreScript)
            //render dữ liệu ra popup
            dataEditOrigin = resp.resultCallRating
            popupScore(resp.scoreScriptInfo.CriteriaGroup, resp.resultCallRatingNote, resp.resultCallRating)
            return $('#popupCallScore').modal('show')
        }
    })
}

//
function renderCriteriaGroup(data) {
    let html = `<option value="0" selected>Toàn bộ kịch bản</option>`
    data.forEach(el => {
        html += `<option value="${el.id}">${el.name}</option>`
    })
    $('#idCriteriaGroupComment').html(html)
    $('.selectpicker').selectpicker('refresh')
}

// xử lí dữ liệu ra popup
function popupScore(criteriaGroups, resultCallRatingNote, resultCallRating) {
    let navHTML = ``
    $('#formCallScore')[0].reset()
    $('.tab-content').html('')
    let optionIdCriteriaGroup = `<option value="0">Toàn bộ kịch bản</option>`
    let totalPoint = 0
    criteriaGroups.map((criteriaGroup, index) => {
        let uuidv4 = window.location.uuidv4()
        let pointCriteria = 0
        let navTabContent
        if (criteriaGroup.Criteria && criteriaGroup.Criteria.length > 0) {
            let criteriaHtml = ``
            criteriaGroup.Criteria.map((criteria) => {
                let _uuidv4 = window.location.uuidv4()
                let htmlSelectionCriteria = ``
                if (criteria.SelectionCriteria.length > 0) {
                    criteria.SelectionCriteria.map((el) => {
                        htmlSelectionCriteria += `  <option 
                                                        data-point="${(el.unScoreCriteriaGroup == true) ? 0 : el.score}" 
                                                        value="${el.id}"
                                                        data-unScoreCriteriaGroup = "${el.unScoreCriteriaGroup}"
                                                        data-unScoreScript = "${el.unScoreScript}"
                                                    >
                                                        ${el.name + ': ' + (el.score)}
                                                    </option>`
                    })
                }
                htmlSelectionCriteria += `<option data-point="0" value="not_enough_infor" data-point-max="${criteria.scoreMax}">Không đủ thông tin để chấm</option>`
                criteriaHtml += `
                <div class="form-group">
                    <label class="col-sm-10 form-check-label mt-4">${criteria.name}<span class="text-danger">(*)</span></label>
                    <select class="form-control selectpicker pl-2 criteria criteriaGroup-${criteriaGroup.id}" id="criteriaChange" required name="criteriaGroup-${_uuidv4}" title="--- Chọn ---" data-criteriaId="${criteria.id}" data-criterialGroupId="${criteriaGroup.id}" data-point-max="${criteria.scoreMax}">
                        ${htmlSelectionCriteria}
                    </select>
                </div>`
                pointCriteria += parseInt(criteria.scoreMax)
                totalPoint += parseInt(criteria.scoreMax)
            })
            // giao diện từng tiêu chí của mỗi Nhóm tiêu chí
            navTabContent = `<div class="tab-pane fade mb-4 ${index == 0 ? "show active" : ""}" id="tab-criteria-group-${uuidv4}" role="tabpanel" aria-labelledby="custom-tabs-three-home-tab">
                                ${criteriaHtml}
                            </div>`
        }
        // tạo thanh nav cho Nhóm tiêu chí
        navHTML += `<li class="nav-item border-bottom">
                        <a class="nav-link nav-criteria-group group-${criteriaGroup.id} ${index == 0 ? "active" : ""}" data-toggle="pill" href="#tab-criteria-group-${uuidv4}" role="tab" 
                        aria-controls="tab-score-script-script" data-point="${pointCriteria}" aria-selected="false">${criteriaGroup.name}</a>
                    </li>`
        optionIdCriteriaGroup += `<option value="${criteriaGroup.id}">${criteriaGroup.name}</option>`
        $('.tab-content').append(navTabContent)

    })

    $('#idCriteriaGroup').html(optionIdCriteriaGroup)
    console.log('resultCallRating', resultCallRating)
    console.log('resultCallRatingNote', resultCallRatingNote)
    // xử lí dữ liệu cho phần ghi chú chấm điểm
    if (resultCallRating && resultCallRating.length > 0) {
        //ưu tiên hiển thị ở màn tạo mới 
        let dataPriority
        dataPriority = resultCallRatingNote.find(el => el.createdByForm == CreatedByForm.ADD)
        if (!dataPriority) dataPriority = resultCallRatingNote[0]

        const { idCriteriaGroup, description, timeNoteMinutes, timeNoteSecond } = dataPriority || {}

        $('.titlePopupCallSource').text('Sửa chấm điểm cuộc gọi:')
        $('#idCriteriaGroup').val(idCriteriaGroup == null ? 0 : idCriteriaGroup)
        $('#idCriteria').html(`<option>${dataPriority && dataPriority.criteria && dataPriority.criteria.name ? dataPriority.criteria.name : ''}</option>`)
        $('#description').val(description)
        $('#timeNoteMinutes').val(timeNoteMinutes)
        $('#timeNoteSecond').val(timeNoteSecond)

        showDisableElement(true)
        $("#btn-save-modal").attr('method', 'edit')
        $(".countValueLength").text(description && description.length + "/500")
    } else {
        $('.titlePopupCallSource').text('Tạo chấm điểm cuộc gọi:')
        $('#idCriteria').val("")
        $('#idCriteriaGroup').val('0')

        $('#progress-scoreCriteria').html('')
        $('.nameCriteriaGroup').text('')
        $('.scoreCriteria').text('')

        showDisableElement(false)
        $("#btn-save-modal").attr('method', 'add')
        $('#idCriteria').prop("disabled", true)
        $('.scoreScript').text(`Tổng điểm: 0/${totalPoint} - 0%`)
    }

    // xử lí dữ liệu cho phần kịch bản và tính tổng điểm
    $('.selectpicker').selectpicker('refresh')
    $('.nav-scoreScript').html(navHTML)
    $('#progress-scoreScript').html('')

    // add các lựa chọn đã chọn
    resultCallRating.map((el) => {
        $(`select[data-criteriaId='${el.idCriteria}']`).val(el.idSelectionCriteria ? el.idSelectionCriteria : 'not_enough_infor')
        if (!el.idSelectionCriteria) {
            totalPoint -= parseInt($(`select[data-criteriaId='${el.idCriteria}']`).attr('data-point-max'))
        }
    })

    // tổng điểm kịch bản
    let totalScoreScript = 0
    let checkUnscorescript = true
    criteriaGroups.map((cr) => {
        let totalPointCriteriaGroup = 0
        resultCallRating.map((el) => {
            let totalPointOfGroup = 0
            let point = $(`.selectpicker.criteriaGroup-${cr.id} option[value="${el.idSelectionCriteria}"]`).attr('data-point')
            let dataUnscorescript = $(`.selectpicker.criteriaGroup-${cr.id} option[value="${el.idSelectionCriteria}"]`).attr('data-unscorescript')
            let dataUnscorecriteriagroup = $(`.selectpicker.criteriaGroup-${cr.id} option[value="${el.idSelectionCriteria}"]`).attr('data-unscorecriteriagroup')
            if (dataUnscorescript == "true") checkUnscorescript = false
            if (dataUnscorecriteriagroup == "true") {
                $(`.criteriaGroup-${cr.id} option:selected`).each(function () {
                    const pointOfSelection = $(this).attr("data-point")
                    totalPointOfGroup += parseInt(pointOfSelection) || 0
                })
            }
            totalPointCriteriaGroup += point ? parseInt(point) : 0
            // trừ đi tất cả các giá chị của nhóm nếu có liệt nhóm
            totalPointCriteriaGroup = totalPointCriteriaGroup - totalPointOfGroup
        })
        // điểm kịch bản = tổng điểm của các nhóm tiêu chí
        if (checkUnscorescript == false) {
            totalScoreScript = 0
        } else {
            totalScoreScript += totalPointCriteriaGroup
        }
        $(`.nav-link.nav-criteria-group.group-${cr.id}`).attr('resultPointCriteriaGroup', totalPointCriteriaGroup)
    })

    // phần trăm điểm
    var perc = _convertPercentNumber(totalScoreScript, totalPoint)
    // gán phần trăm điểm
    let html = `<div class="progress-bar" role="progressbar" style="width: ${perc}%;" aria-valuenow="${perc}" aria-valuemin="0" aria-valuemax="100">Hoàn thành ${perc}%</div>`
    $('#progress-scoreScript').html(html)
    $('.scoreScript').text(`Tổng điểm: ${totalScoreScript}/${totalPoint} - ${perc}%`)

    //tổng điểm các nhóm
    let pointCriteriaGroup = 0
    $(".tab-pane.fade.mb-4.show.active option:selected").each(function () {
        const dataUnScoreCriteriaGroup = $(this).attr("data-unScoreCriteriaGroup")
        if (dataUnScoreCriteriaGroup == "true") {
            pointCriteriaGroup = 0
            return false
        } else {
            pointCriteriaGroup += $(this).attr("data-point") ? parseInt($(this).attr("data-point")) : 0
        }
    })
    let totalTemp = 0
    $(".tab-pane.fade.mb-4.show.active option:selected").each(function () {
        if ($(this).val() != "not_enough_infor") {
            totalTemp += parseInt($(this).parent().attr('data-point-max'))
        }
    })
    $(`.nav-link.nav-criteria-group.group-${criteriaGroups[0].id}.active`).attr("data-point", totalTemp)

    let $firstElm = $(`.nav-link.nav-criteria-group.group-${criteriaGroups[0].id}`)
    $('.nameCriteriaGroup').text($firstElm.text())
    const total = $firstElm.attr('data-point')
    const percCriteriaGroup = _convertPercentNumber(pointCriteriaGroup, total)
    let htmlScoreCriteria = `<div class="progress-bar" role="progressbar" style="width: ${percCriteriaGroup}%;" aria-valuenow="${percCriteriaGroup}" aria-valuemin="0" aria-valuemax="100">Hoàn thành ${percCriteriaGroup}%</div>`
    $('#progress-scoreCriteria').html(htmlScoreCriteria)
    $('.scoreCriteria').text(`Tổng điểm: ${pointCriteriaGroup}/${total} - ${percCriteriaGroup}%`)

    $('.selectpicker').selectpicker('refresh')
}

function showDisableElement(check) {
    $('#idCriteriaGroup').prop('disabled', check)
    $('#idCriteria').prop('disabled', check)
    $('#timeNoteMinutes').prop('disabled', check)
    $('#timeNoteSecond').prop('disabled', check)
    $('#description').prop('disabled', check)
    return
}

function renderCriteria(idCriteriaGroup, idAddCriteria) {
    let html = ``
    _AjaxGetData('/scoreMission/' + idCriteriaGroup + '/getCriteriaByCriteriaGroup', 'GET', function (resp) {
        if (resp.code == 200) {
            resp.result.forEach((el, index) => {
                html += `<option value="${el.id}" ${index == 0 ? 'selected' : ''}>${el.name}</option>`
            })
            $(`${idAddCriteria}`).html(html)
            $('.selectpicker').selectpicker('refresh')
            $(`${idAddCriteria}`).prop("disabled", html ? false : true)
            $('.selectpicker').selectpicker('refresh')
        }
    })
}

$(function () {
    $('#popup_startTime').datetimepicker({
        format: 'DD/MM/YYYY',
        icons: { time: 'far fa-clock' }
    })

    $('#popup_endTime').datetimepicker({
        format: 'DD/MM/YYYY',
        icons: { time: 'far fa-clock' }
    })

    bindClick()

    findData(1)

    $("#sortable").sortable({
        items: "li:not(.unsortable)"
    })

    $(".defaultPlaySpeed").text("Chuẩn")
})

$(window).on('beforeunload', function () {

    $(document).off('click', '.fa-history')
    $(document).off('click', '.btn-add-comment')
    $(document).off('click', '.sorting')
    $(document).off('click', '#resetColumnCustom')
    $(document).off('click', '.fa-comment-alt')
    $(document).off('click', '.fa-play-circle')
    $(document).off('click', '.zpaging')
    $(document).off('click', '#select-all')
    $(document).off('click', '#modal_customs_table')
    $(document).off('click', '.showCallScore')
    $(document).off('click', '.detailScoreScript')
    $(document).off('click', '.detailNoteScore')
    $(document).off('click', '.nav-link.nav-criteria-group')
    $(document).off('change', '#idCriteriaGroup')
    $(document).off('change', '#idCriteriaGroupComment')
    $(document).off('click', '#downloadFile')
    $(document).off('click', '#downloadFile-popupCallScore')
    $(document).off('click', '#downloadFile-popupComment')
    $(document).off('click', '#btn-save-modal')
    $(document).off('click', '#submitGeneralSetting')
    $(document).off('click', '#cancelGeneralSetting')
    $(document).off('change', '#scoreTargetId')

})