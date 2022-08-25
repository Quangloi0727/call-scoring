// https://codepen.io/scottjehl/pen/abJrPOP

const $leftTable = $('.content-table-left')
const $rightTable = $('.content-table-right')
const $resetColumnCustom = $('#resetColumnCustom')
const $modal_customs_table = $("#modal_customs_table")
const $selectAll = $("#select-all")

// Lưu tạm dữ liệu của nhóm tiêu chí từ kịch bản chấm điểm
let _criteriaGroups = {}

// WARNING
// CACHE
let CACHE_CONFIG_COLUMN = null

function bindClick() {

    $(document).on('click', '.zpaging', function () {
        let page = $(this).attr('data-link')
        return findData(page)
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

    $(document).on('click', '.fa-play-circle', function () {
        const urlRecord = $(this).attr('url-record')
        const callId = $(this).attr('data-callId')
        $("#formDetailRecord").html('')
        $('#showDetailRecord').modal('show')
        $("#defaultPlaySpeed").text("Chuẩn")
        //$("#downloadFile").attr("url-record", "https://qa.metechvn.com/static/call.metechvn.com/archive/2022/Aug/17/d6a4f7a2-1dce-11ed-b31a-95f7e31f94c6.wav")
        $("#downloadFile").attr("url-record", urlRecord)
        _AjaxGetData('/scoreMission/' + callId + '/getCallRatingNotes', 'GET', function (resp) {
            if (resp.code == 200) {
                configWaveSurfer(resp.result, urlRecord, null)
            } else {
                console.log("get list note callId " + callId + " error")
                configWaveSurfer([], urlRecord, null)
            }
        })
    })

    $("#showDetailRecord").on("hidden.bs.modal", function () {
        location.reload()
    })

    $("#popupCallScore").on("hidden.bs.modal", function () {
        $('#recordCallScore').html('')
        location.reload()
    })

    $(document).on('click', '.showCallScore', function () {
        let callId = $(this).attr('data-callId')
        let idScoreScript = $(this).attr('data-id')
      
        if($(this).attr('check-disable') == 'false') return toastr.error("Cuộc gọi chưa được chấm điểm")
        let url = $(this).attr('url-record')
        return getDetailScoreScript(idScoreScript, callId,url)
    })

    $(document).on('click', '.detailScoreScript', function () {
        $('#collapseScoreScript').show()
    })

    $(document).on('click', '.detailNoteScore', function () {
        $('#collapseNoteScore').show()
    })

    $(document).on('click', '.nav-link.nav-criteria-group', function () {
        $('.nameCriteriaGroup').text($(this).text())
        if ($(this).attr('resultPointCriteriaGroup') || $(this).attr('resultPointCriteriaGroup') == 0) {
            let point = $(this).attr('resultPointCriteriaGroup')

            let total = $(this).attr('data-point')
            var perc = ((point / total) * 100).toFixed(0)
            let html = `
            <div class="progress-bar" role="progressbar" style="width: ${perc}%;" aria-valuenow="${perc}" aria-valuemin="0"
            aria-valuemax="100">Hoàn thành ${perc}%</div>`
            $('#progress-scoreCriteria').html(html)
            $('.scoreCriteria').text(`Tổng điểm: ${point}/${total} - ${perc}%`)

        } else $('.scoreCriteria').text(`Tổng điểm: 0/${$(this).attr('data-point')} - 0%`)
    })

    // xử lí chọn option ghi chú của mục tiêu
    $(document).on('change', '#idCriteriaGroup', function () {
        renderCriteria($(this).val())
    })

    // button lưu tùy chỉnh bảng
    $(document).on('click', '#btn_save_customs', function () {
        let listCheck = []
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

    $(document).on('click', '#btn-save-modal', function () {
        let data = {}
        let callId = $(this).attr('data-callId')
        let idScoreScript = $(this).attr('data-idScoreScript')
        let arr = []
        $(".selectpicker.criteria").each(function () {
            arr.push({
                idSelectionCriteria: $(this).val(),
                idCriteria: $(this).attr('data-criteriaId'),
                callId: callId
            })
        })
        data.note = getFormData('formCallScore')
        data.note.callId = callId
        data.note.idScoreScript = idScoreScript
        data.resultCriteria = arr

        _AjaxData('/scoreMission/saveCallRating', 'POST', JSON.stringify(data), { contentType: "application/json" }, function (resp) {
            if (resp.code != 200) {
                return toastr.error(resp.message)
            }
            toastr.success('Lưu thành công !')
            return setTimeout(() => {
                window.location.href = "/scoreMission"
            }, 2500)
        })
    })

}
function configWaveSurfer(arrRegion, urlRecord, container) {
    var wavesurfer = WaveSurfer.create({
        container: container ? container : '#formDetailRecord',
        scrollParent: true,
        waveColor: '#A8DBA8',
        progressColor: '#3B8686',
        backend: 'MediaElement',
        plugins: [
            WaveSurfer.regions.create({})
        ]
    })
    wavesurfer.empty()
    // wavesurfer.load("https://qa.metechvn.com/static/call.metechvn.com/archive/2022/Aug/17/d6a4f7a2-1dce-11ed-b31a-95f7e31f94c6.wav")
    wavesurfer.load(urlRecord)

    wavesurfer.on('ready', function (e) {
        wavesurfer.play()
        updateTimer(wavesurfer)
        const totalTime = _secondsToTimestamp(wavesurfer.getDuration())
        $('.waveform-time-indicator .totalTime').text(totalTime)
    })

    wavesurfer.on('audioprocess', function (e) {
        updateTimer(wavesurfer)
    })

    arrRegion.forEach(el => {
        wavesurfer.addRegion({
            start: _convertTime(el.timeNoteMinutes || 0, el.timeNoteSecond || 0),
            loop: false,
            color: 'hsla(9, 100%, 64%, 1)',
            attributes: {
                title: `Nội dung ghi chú: ${el.description}\nNgười ghi chú: ${el.userCreate && el.userCreate.fullName ? el.userCreate.fullName : ''} (${el.userCreate && el.userCreate.userName ? el.userCreate.userName : ''}) lúc ${(moment(el.createdAt).format("DD/MM/YYYY HH:mm:ss"))}\nVị trí ghi chú: ${_secondsToTimestamp(_convertTime(el.timeNoteMinutes || 0, el.timeNoteSecond || 0))}`
            }
        })
    })
    let elementSelector = '#showDetailRecord .controls .btn'
    if (container) {
        elementSelector = '#elmRecordCallScore .controls .btn'
    }

    $(`${elementSelector}`).on('click', function () {
        var action = $(this).data('action')
        console.log("action", action)
        switch (action) {
            case 'play':
                wavesurfer.playPause()
                break
            case 'back':
                wavesurfer.skipBackward(10)
                updateTimer(wavesurfer)
                break
            case 'forward':
                wavesurfer.skipForward(10)
                updateTimer(wavesurfer)
                break
        }
    })

    $('.dropdown-item').on('click', function () {
        var val = $(this).attr("data-val")
        console.log("value play speed", val)
        wavesurfer.setPlaybackRate(val)
        $("#defaultPlaySpeed").text(val == 1 ? "Chuẩn" : val)
    })

    //event change title wavesufer to notes
    wavesurfer.on('region-mouseenter', function (region, e) {
        region.element.title = region.attributes.title
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

function updateTimer(wavesurfer) {
    var formattedTime = _secondsToTimestamp(wavesurfer.getCurrentTime())
    $('.waveform-time-indicator .time').text(formattedTime)
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

function findData(page) {
    let queryData = {}
    if (page) queryData.page = page
    queryData.scoreTargetId = $('#scoreTargetId').val()
    queryData.limit = $('.sl-limit-page').val() || 10
    $('.page-loader').show()
    $.ajax({
        type: 'GET',
        url: '/scoreMission/getData?' + $.param(queryData),
        cache: 'false',
        success: function (result) {
            $('.page-loader').hide()
            CACHE_CONFIG_COLUMN = result.configurationColums
            createTable(result.data, result.scoreScripts, result.configurationColums ? result.configurationColums : headerDefault, result.configurationColums ? false : true)
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
    popupHtml += `<div class="mb-3 border-bottom">
                    <ul class='p-0'>Mã cuộc gọi</ul>
                    <ul class='p-0'>Thao tác</ul>
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
            popupHtml += itemColumn(key, headerDefault[key], init == true ? 'true' : value)
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
function createTable(data, scoreScripts, ConfigurationColums, configDefault) {
    let objColums = { ...ConfigurationColums }
    renderPopupCustomColumn(ConfigurationColums)
    renderHeaderTable(ConfigurationColums, configDefault)

    let uuidv4 = window.location.uuidv4()
    let rightTable = ''
    let leftTable = ``

    data.forEach((item, element) => {
        let check = false

        //check xem cuộc gọi đã chấm điểm chưa , nếu đã chấm thì show edit và disable nút chấm mới và ngược lại
        let idScoreScript
        if (item.callRatingNote && item.callRatingNote.length > 0) {
            check = true
            idScoreScript = item.callRatingNote[0].idScoreScript
        }
        let dropdown = ''
        if (scoreScripts.length > 0) {
            scoreScripts.map((el) => {
                dropdown += `<a class="dropdown-item showCallScore ${check ? 'disabled' : ''}" data-callId="${item.id}" 
                url-record="${item.recordingFileName}" data-id="${el.scoreScriptId}">${el.ScoreScripts.name}</a>`
            })
        }

        let tdTable = checkConfigDefaultBody(objColums, configDefault, item)

        rightTable += `<tr>${tdTable}</tr>`
        leftTable += ` <tr class="text-center">
            <td class="text-center callId" title=${item.id || ''} style="width:200px; overflow:hidden;">${item.id || ''}</td>
            <td class="text-center">    
                <i class="fas fa-check mr-2 dropdown-toggle " id="dropdown-${uuidv4}" data-toggle="dropdown" title="Chấm điểm"></i>
                <div class="dropdown-menu" aria-labelledby="dropdown-${uuidv4}">
                    ${dropdown}
                </div>
                <i class="fas fa-pen-square mr-2 showCallScore" url-record="${item.recordingFileName}" data-callId="${item.id}" data-id="${idScoreScript}" title="Sửa chấm điểm" check-disable="${check}"></i>
                <i class="fas fa-comment-alt mr-2" title="Ghi chú"></i>
                <i class="fas fa-history mr-2" title="Lịch sử chấm điểm"></i>
                <i class="fas fa-play-circle mr-2" title="Xem chi tiết ghi âm" url-record = ${item.recordingFileName} data-callId=${item.id}></i>
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
    let htmlString = ``
    if (configDefault) {
        for (const [key] of Object.entries(dataConfig)) {
            htmlString += ` <td class="text-center ${key} ${headerDefault[key].status == 1 ? '' : 'd-none'}">${item[key] || '&nbsp'}</td>`
        }
    } else {
        for (const [key, value] of Object.entries(dataConfig)) {
            htmlString += ` <td class="text-center ${key} ${value == true ? '' : 'd-none'}">${item[key] || '&nbsp'}</td>`
        }
    }
    return htmlString
}

// lấy thông tin chi tiết của kịch bản chấm điểm
function getDetailScoreScript(idScoreScript, callId,url) {
    let queryData = {}
    queryData.idScoreScript = idScoreScript
    queryData.callId = callId
    _AjaxGetData('scoreMission/getScoreScript?' + $.param(queryData), 'GET', function (resp) {
        console.log("data kịch bản chấm điểm", resp)
        if (resp.code != 200) {
            return toastr.error(resp.message)
        }
        if (resp.data.CriteriaGroup.length > 0) {
            $('.nameScoreScript').text(resp.data.name)

            // data tiêu chí vào biến chugng để xử lí cho các element khác -- các tiêu chí có trong có trong kịch bản ko có giá trị để tính điểm
            _criteriaGroups = resp.data.CriteriaGroup
            $("#downloadFile-popupCallScore").attr("url-record", url)
            configWaveSurfer([], url, '#recordCallScore')
    
            $('#btn-save-modal').attr('data-callId', callId)
            $('#btn-save-modal').attr('data-idScoreScript', idScoreScript)
            //render dữ liệu ra popup
            popupScore(resp.data.CriteriaGroup, resp.resultCallRatingNote, resp.resultCallRating)
            return $('#popupCallScore').modal('show')
        }
    })
}

// xử lí dữ liệu ra popup
function popupScore(criteriaGroups, resultCallRatingNote, resultCallRating) {
    let navHTML = `
    <li class="nav-item border-bottom" disable>
        <a class="nav-link active" href="#">[Tên nhóm tiêu chí]</a>
    </li>`
    $('#formCallScore')[0].reset()
    $('.tab-content').html('')
    let optionIdCriteriaGroup = `<option value="0">Toàn bộ kịch bản</option>`
    let totalPoint = 0
    criteriaGroups.map((criteriaGroup) => {
        let uuidv4 = window.location.uuidv4()
        let pointCriteria = 0
        let navTabContent
        if (criteriaGroup.Criteria && criteriaGroup.Criteria.length > 0) {
            let criteriaHtml = ``
            criteriaGroup.Criteria.map((criteria) => {
                let htmlSelectionCriteria = ``
                if (criteria.SelectionCriteria.length > 0) {
                    criteria.SelectionCriteria.map((el) => {
                        htmlSelectionCriteria += `<option data-point="${el.score}" value="${el.id}">${el.name + ': ' + (el.score)}</option>`
                    })
                }
                criteriaHtml += `
                <label class="col-sm-10 form-check-label mt-4">${criteriaGroup.name} - <span class="font-italic">${criteria.name}</span></label>
                <select class="form-control selectpicker pl-2 criteria criteriaGroup-${criteriaGroup.id}" data-criteriaId="${criteria.id}">
                    ${htmlSelectionCriteria}
                </select>`
                pointCriteria += parseInt(criteria.scoreMax)
                totalPoint += parseInt(criteria.scoreMax)
            })
            // giao diện từng tiêu chí của mỗi Nhóm tiêu chí
            navTabContent = `
            <div class="tab-pane fade mb-4" id="tab-criteria-group-${uuidv4}" role="tabpanel"
                aria-labelledby="custom-tabs-three-home-tab">
                ${criteriaHtml}
            </div>
            `
        }
        // tạo thanh nav cho Nhóm tiêu chí
        navHTML += `
        <li class="nav-item border-bottom">
            <a class="nav-link nav-criteria-group group-${criteriaGroup.id}" data-toggle="pill" href="#tab-criteria-group-${uuidv4}" role="tab" 
            aria-controls="tab-score-script-script" data-point="${pointCriteria}" aria-selected="false">${criteriaGroup.name}</a>
        </li>`
        optionIdCriteriaGroup += `<option value="${criteriaGroup.id}">${criteriaGroup.name}</option>`
        $('.tab-content').append(navTabContent)

    })

    $('#idCriteriaGroup').html(optionIdCriteriaGroup)

    // xử lí dữ liệu cho phần ghi chú chấm điểm
    if (resultCallRatingNote && resultCallRatingNote.length > 0 && resultCallRatingNote[0].idCriteriaGroup != 0) {
        $('.popupCallScore').text('Sửa chấm điểm cuộc gọi')
        $('#idCriteriaGroup').val(resultCallRatingNote[0].idCriteriaGroup) 
        renderCriteria(resultCallRatingNote[0].idCriteriaGroup)
        $('#idCriteria').val(resultCallRatingNote[0].idCriteria)
        $('#description').val(resultCallRatingNote[0].description)
        $('#timeNoteMinutes').val(resultCallRatingNote[0].timeNoteMinutes)
        $('#timeNoteSecond').val(resultCallRatingNote[0].timeNoteSecond)
    } else {
        $('#idCriteria').val("")
        $('#idCriteria').prop("disabled", true)
        $('#idCriteriaGroup').val('0')
        $('.scoreScript').text(`Tổng điểm: 0/${totalPoint} - 0%`)
    }

    // xử lí dữ liệu cho phần kịch bản và tính tổng điểm
    $('.selectpicker').selectpicker('refresh')
    $('.nav-scoreScript').html(navHTML)
    let resultPointCriteria = 0
    if (resultCallRating && resultCallRatingNote.length > 0) {
        resultCallRating.map((el) => {
            // tìm các mục tiêu có id tương ứng và cộng điểm
            resultPointCriteria += parseInt($(`.selectpicker.criteria option[value="${el.idSelectionCriteria}"]`).attr('data-point'))
            //gán giá trị cho ô select
            $(`select[data-criteriaId='${el.idCriteria}']`).val(el.idSelectionCriteria)
        })

        criteriaGroups.map((criteriaGroup) => {
            let resultPointCriteriaGroup = 0
            resultCallRating.map((el) => {
                let point = $(`.selectpicker.criteriaGroup-${criteriaGroup.id} option[value="${el.idSelectionCriteria}"]`).attr('data-point')
                resultPointCriteriaGroup += point ? parseInt(point) : 0
            })
            $(`.nav-link.nav-criteria-group.group-${criteriaGroup.id}`).attr('resultPointCriteriaGroup', resultPointCriteriaGroup)
        })


        // phần trăm điểm
        var perc = ((resultPointCriteria / totalPoint) * 100).toFixed(0)
        // gán phần trăm điểm
        let html = `
        <div class="progress-bar" role="progressbar" style="width: ${perc}%;" aria-valuenow="${perc}" aria-valuemin="0"
        aria-valuemax="100">Hoàn thành ${perc}%</div>`
        $('#progress-scoreScript').html(html)
        $('.scoreScript').text(`Tổng điểm: ${resultPointCriteria}/${totalPoint} - ${perc}%`)
    }

    $('.selectpicker').selectpicker('refresh')
}

function renderCriteria(idCriteriaGroup) {
    let html = ``
    if (_criteriaGroups && _criteriaGroups.length > 0) {
        _criteriaGroups.map((criteriaGroup) => {

            if (criteriaGroup.id == parseInt(idCriteriaGroup)) {
                if (criteriaGroup.Criteria && criteriaGroup.Criteria.length > 0) {
                    criteriaGroup.Criteria.map((el) => {
                        html += `<option value="${el.id}">${el.name}</option>`
                    })
                }
            }
        })
        $('#idCriteria').html(html)
        $('.selectpicker').selectpicker('refresh')
        $('#idCriteria').prop("disabled", html ? false : true)
        $('.selectpicker').selectpicker('refresh')
    }
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
})

$(window).on('beforeunload', function () {

    $(document).off('click', '.sorting')
    $(document).off('click', '.zpaging')
    $(document).off('click', '#select-all')
    $(document).off('click', '#modal_customs_table')
    $(document).off('click', '.showCallScore')
    $(document).off('click', '.detailScoreScript')
    $(document).off('click', '.detailNoteScore')
    $(document).off('click', '.nav-link.nav-criteria-group')
    $(document).off('change', '#idCriteriaGroup')
    $(document).off('click', '#downloadFile')
    $(document).off('click', '#downloadFile-popupCallScore')

})