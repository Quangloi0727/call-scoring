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
        // reset tick
        renderPopupCustomColumn(headerDefault, true)
    })

    $(document).on('click', '.fa-play-circle', function () {
        const urlRecord = $(this).attr('url-record')
        $("#formDetailRecord").html('')
        $('#showDetailRecord').modal('show')
        $("#defaultPlaySpeed").text("Chuẩn")
        //$("#downloadFile").attr("url-record", "https://qa.metechvn.com/static/call.metechvn.com/archive/2022/Aug/17/d6a4f7a2-1dce-11ed-b31a-95f7e31f94c6.wav")
        $("#downloadFile").attr("url-record", urlRecord)
        var wavesurfer = WaveSurfer.create({
            container: '#formDetailRecord',
            scrollParent: true,
            waveColor: '#A8DBA8',
            progressColor: '#3B8686',
            backend: 'MediaElement',
            plugins: [
                WaveSurfer.regions.create({

                })
            ]
        })
        //wavesurfer.load("https://qa.metechvn.com/static/call.metechvn.com/archive/2022/Aug/17/d6a4f7a2-1dce-11ed-b31a-95f7e31f94c6.wav")
        wavesurfer.load(urlRecord)

        wavesurfer.on('ready', function (e) {
            wavesurfer.play()
            updateTimer(wavesurfer)
            const totalTime = secondsToTimestamp(wavesurfer.getDuration())
            $('#waveform-time-indicator .totalTime').text(totalTime)
        })

        wavesurfer.on('audioprocess', function (e) {
            updateTimer(wavesurfer)
        })

        $('.controls .btn').on('click', function () {
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
    })

    $("#showDetailRecord").on("hidden.bs.modal", function () {
        location.reload()
    })

    $(document).on('click', '.showCallScore', function () {
        let callId = $(this).attr('data-callId')
        let idScoreScript = $(this).attr('data-id')
        $('#btn-save-modal').attr('data-callId', callId)
        $('#btn-save-modal').attr('data-idScoreScript', idScoreScript)
        return getDetailScoreScript(idScoreScript)
    })

    $(document).on('click', '.detailScoreScript', function () {
        $('#collapseScoreScript').show()
    })

    $(document).on('click', '.detailNoteScore', function () {
        $('#collapseNoteScore').show()
    })

    $(document).on('click', '.nav-link.nav-criteria-group', function () {
        $('.nameCriteriaGroup').text($(this).text())
        $('.scoreCriteria').text(`Tổng điển: 0/${$(this).attr('data-point')} - 0%`)
    })

    // xử lí chọn option ghi chú của mục tiêu
    $(document).on('change', '#idCriteriaGroup', function () {
        let html = ``
        if (_criteriaGroups && _criteriaGroups.length > 0) {
            _criteriaGroups.map((criteriaGroup) => {

                if (criteriaGroup.id == parseInt($(this).val())) {
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
        console.log(obj)
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
        console.log(data)

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
    var formattedTime = secondsToTimestamp(wavesurfer.getCurrentTime())
    $('#waveform-time-indicator .time').text(formattedTime)
}

function secondsToTimestamp(seconds) {
    seconds = Math.floor(seconds)
    var h = Math.floor(seconds / 3600)
    var m = Math.floor((seconds - (h * 3600)) / 60)
    var s = seconds - (h * 3600) - (m * 60)

    h = h < 10 ? '0' + h : h
    m = m < 10 ? '0' + m : m
    s = s < 10 ? '0' + s : s
    return h + ':' + m + ':' + s
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
    console.log(page)
    $('.page-loader').show()

    $.ajax({
        type: 'GET',
        url: '/scoreMission/getData?' + $.param(queryData),
        cache: 'false',
        success: function (result) {
            console.log('result: ', result)

            $('.page-loader').hide()
            // debugger
            CACHE_CONFIG_COLUMN = result.ConfigurationColums ? result.ConfigurationColums : headerDefault
            console.log(CACHE_CONFIG_COLUMN)
            createTable(result.data, result.scoreScripts, CACHE_CONFIG_COLUMN ? CACHE_CONFIG_COLUMN : headerDefault)
            return $('#paging_table').html(window.location.CreatePaging(result.paginator))

        },
        error: function (error) {
            $('.page-loader').hide()
            console.log(error)
            return toastr.error(error.responseJSON.message)
        },
    })
}

// xử lí data cho chức năng tùy chỉnh bảng
/// *****_Start_*****
function renderPopupCustomColumn(ConfigurationColums, init = false) {

    let popupHtml = ''
    popupHtml += `<div class="mb-3 border-bottom">
        <ul>Mã cuộc gọi</ul>
        <ul>Thao tác</ul>
    </div>`
    for (const [key, value] of Object.entries(ConfigurationColums)) {
        popupHtml += itemColumn(key, headerDefault[key], value)
    }
    let columnNotTick = _.difference(Object.keys(headerDefault), Object.keys(ConfigurationColums))
    columnNotTick.forEach(i => {
        popupHtml += itemColumn(i, headerDefault[i], false)
    })
    $('#sortable').html(popupHtml)

}

function renderHeaderTable(ConfigurationColums) {
    let headerTable = ''
    // debugger
    for (const [key, value] of Object.entries(ConfigurationColums)) {
        headerTable += `<th class="text-center ${key} ${value.status == 1 ? '' : 'd-none'}">${value.name}</th>`
    }
    return $('.table-right.custom-table thead tr').html(headerTable)
}

function itemColumn(key, title, value) {
    // debugger;
    return `<li class="mb-3 border-bottom">
        <input class="form-check-input" type="checkbox" name="${key}"
        ${title.status == 1 ? 'checked' : ''} />
        ${title.name}
        <span style="float: right;">
        <i class="fas fa-arrows-alt" title="Giữ kéo/thả để sắp xếp"></i>
        </span>
  </li>`
}
///***** __end__*****
function createTable(data, scoreScripts, ConfigurationColums) {
    console.log(data)
    let objColums = { ...ConfigurationColums }
    renderPopupCustomColumn(ConfigurationColums)
    renderHeaderTable(ConfigurationColums)

    let uuidv4 = window.location.uuidv4()
    let rightTable = ''
    let leftTable = ``

    data.forEach((item, element) => {
        let check = false
        let idScoreScript
        if (item.callRatingNote && item.callRatingNote.length > 0) {
            check = true
            idScoreScript = item.callRatingNote[0].idScoreScript
        }
        console.log(idScoreScript)
        let dropdown = ''
        if (scoreScripts.length > 0) {
            scoreScripts.map((el) => {
                dropdown += `<a class="dropdown-item showCallScore disabled" data-callId="${item.id}"  data-id="${el.scoreScriptId}">${el.ScoreScripts.name}</a>`
            })
        }
        let tdTable = ''
        for (const [key, value] of Object.entries(objColums)) {
            tdTable += ` <td class="text-center ${key} ${value.status == 1 ? '' : 'd-none'}">${item[key] || ''}</td>`
        }
        rightTable += `<tr>${tdTable}</tr>`
        leftTable += ` <tr class="text-center">
            <td class="text-center callId">${item.callId || ''}</td>
            <td class="text-center">    
                <i class="fas fa-check mr-2 dropdown-toggle " id="dropdown-${uuidv4}" data-toggle="dropdown" title="Chấm điểm"></i>
                <div class="dropdown-menu" aria-labelledby="dropdown-${uuidv4}">
                    ${dropdown}
                </div>
                <i class="fas fa-pen-square mr-2 showCallScore" data-id="${idScoreScript}" title="Sửa chấm điểm"></i>
                <i class="fas fa-comment-alt mr-2" title="Ghi chú"></i>
                <i class="fas fa-history mr-2" title="Lịch sử chấm điểm"></i>
                <i class="fas fa-play-circle mr-2" title="Xem chi tiết ghi âm" url-record = ${item.recordingFileName}></i>
            </td>
        </tr>`
    })

    $leftTable.html(leftTable)
    $rightTable.html(rightTable)
    return

}

// lấy thông tin chi tiết của kịch bản chấm điểm
function getDetailScoreScript(idScoreScript) {
    let queryData = {}
    queryData.id = idScoreScript
    _AjaxGetData('scoreMission/getScoreScript?' + $.param(queryData), 'GET', function (resp) {
        console.log(resp)
        if (resp.code != 200) {
            return toastr.error(resp.message)
        }
        if (resp.data.CriteriaGroup.length > 0) {
            $('.nameScoreScript').text(resp.data.name)
            _criteriaGroups = resp.data.CriteriaGroup
            //render dữ liệu ra popup

            return popupScore(resp.data.CriteriaGroup)
        }
    })
    $('#popupCallScore').modal('show')
}

// xử lí dữ liệu ra popup
function popupScore(criteriaGroup) {
    let navHTML = `
    <li class="nav-item border-bottom" disable>
        <a class="nav-link active" href="#">[Tên nhóm tiêu chí]</a>
    </li>`
    $('#formCallScore')[0].reset()
    $('.tab-content').html('')
    let optionidCriteriaGroup = `<option value="default">Toàn bộ kịch bản</option>`
    let totalPoint = 0
    criteriaGroup.map((criteriaGroup) => {
        let uuidv4 = window.location.uuidv4()
        let pointCriteria = 0
        let navTabContent
        if (criteriaGroup.Criteria && criteriaGroup.Criteria.length > 0) {
            let criteriaHtml = ``
            criteriaGroup.Criteria.map((criteria) => {
                let htmlSelectionCriteria = ``
                if (criteria.SelectionCriteria.length > 0) {
                    criteria.SelectionCriteria.map((el) => {
                        htmlSelectionCriteria += `<option value="${el.id}">${el.name + ': ' + (el.score)}</option>`
                    })

                }
                criteriaHtml += `<label class="col-sm-10 form-check-label mt-4">${criteriaGroup.name} - <span class="font-italic">${criteria.name}</span></label>
                <select class="form-control selectpicker pl-2 criteria" data-criteriaId="${criteria.id}">
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
            <a class="nav-link nav-criteria-group" data-toggle="pill" href="#tab-criteria-group-${uuidv4}" role="tab" 
            aria-controls="tab-score-script-script" data-point="${pointCriteria}" aria-selected="false">${criteriaGroup.name}</a>
        </li>`
        optionidCriteriaGroup += `<option value="${criteriaGroup.id}">${criteriaGroup.name}</option>`
        $('.tab-content').append(navTabContent)

    })

    $('.scoreScript').text(`Tổng điển: 0/${totalPoint} - 0%`)
    $('#idCriteriaGroup').html(optionidCriteriaGroup)
    $('#idCriteria').val("")
    $('#idCriteria').prop("disabled", true)
    $('.selectpicker').selectpicker('refresh')
    $('#idCriteriaGroup').val('default')
    $('.selectpicker').selectpicker('refresh')
    $('.nav-scoreScript').html(navHTML)
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
})