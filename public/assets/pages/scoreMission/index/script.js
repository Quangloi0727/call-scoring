// https://codepen.io/scottjehl/pen/abJrPOP

const $leftTable = $('.content-table-left')
const $rightTable = $('.content-table-right')
const $resetColumnCustom = $('#resetColumnCustom')
const $modal_customs_table = $("#modal_customs_table")
const $selectAll = $("#select-all")
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
        $("#formDetailRecord").html('')
        $('#showDetailRecord').modal('show')
        var wavesurfer = WaveSurfer.create({
            container: '#formDetailRecord',
            scrollParent: true,
            waveColor: '#A8DBA8',
            progressColor: '#3B8686',
            backend: 'MediaElement',
            plugins: [
                WaveSurfer.regions.create({})
            ]
        })
        wavesurfer.load('https://qa.metechvn.com/static/trainghiem.metechvn.com/archive/2022/Aug/19/fad8699a-1f92-11ed-8fe1-95f7e31f94c6.wav')
        wavesurfer.on('ready', function () {
            wavesurfer.play()
            console.log(1111111,wavesurfer.getDuration());
            
        })
        $('.controls .btn').on('click', function(){
            var action = $(this).data('action');
            console.log(action);
            switch (action) {
              case 'play':
                wavesurfer.playPause();
                break;
              case 'back':
                wavesurfer.skipBackward();
                break;
              case 'forward':
                wavesurfer.skipForward();
                break;
              case 'mute':
                wavesurfer.toggleMute();
                break;
            }
        });

    $(document).on('click', '.showCallScore', function () {
        console.log($(this).attr('data-id'))
        let queryData = {}
        queryData.id = $(this).attr('data-id')
        _AjaxGetData('scoreMission/getScoreScript?' + $.param(queryData), 'GET', function (resp) {
            console.log(resp)
            if (resp.code != 200) {
                return toastr.error(resp.message)
            }
            if (resp.data.CriteriaGroup.length > 0) {
                $('.nameScoreScript').text(resp.data.name)
                _criteriaGroups = resp.data.CriteriaGroup
                return popupScore(resp.data.CriteriaGroup)
            }
        })
        $('#popupCallScore').modal('show')
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

    $(document).on('change', '#noteCriteriaGroup', function () {
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
            $('#noteCriteria').html(html)
            $('.selectpicker').selectpicker('refresh')
            $('#noteCriteria').prop("disabled", html ? false : true)
            $('.selectpicker').selectpicker('refresh')
        }
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
            createTable(result.data, result.scoreScripts)
            return $('#paging_table').html(window.location.CreatePaging(result.paginator))

        },
        error: function (error) {
            $('.page-loader').hide()
            console.log(error)
            return toastr.error(error.responseJSON.message)
        },
    })
}

function handleAudio() {
    setTimeout(() => {
        $(".audio-element").on({
            play: function () { // the audio is playing!
                // $(".audio-element").pause();
                // _.each($('.audio-element'), function (el) {
                //   var __audio = $(el)[0];
                //   __audio.pause();
                //   // if (__audio != audio && !__audio.paused) {

                //         // $(el).closest('td').find('.zmdi-play').show();
                //         // $(el).closest('td').find('.zmdi-pause').hide();
                //     // }
                // });

                // let _audio = $(this)[0];
                // _audio.play();

                console.log('play')
            },
            pause: function () { // the audio is paused!
                console.log('páue', this)
            },
        })
    }, 50)
}

function renderPopupCustomColumn(ConfigurationColums, init = false) {

    let popupHtml = ''
    popupHtml += `<div class="mb-3 border-bottom">
        <ul>Mã cuộc gọi</ul>
        <ul>Thao tác</ul>
    </div>`
    for (const [key, value] of Object.entries(ConfigurationColums)) {
        popupHtml += itemColumn(key, headerDefault[key], init == true ? 'true' : value)
    }
    let columnNotTick = _.difference(Object.keys(headerDefault), Object.keys(ConfigurationColums))
    columnNotTick.forEach(i => {
        popupHtml += itemColumn(i, headerDefault[i], false)
    })
    $('#sortable').html(popupHtml)

}

function itemColumn(key, title, value) {
    console.log(key, title, value)
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

function createTable(data, scoreScripts) {

    let dropdown = ''
    if (scoreScripts.length > 0) {
        scoreScripts.map((el) => {
            dropdown += `<a class="dropdown-item showCallScore"  data-id="${el.scoreScriptId}">${el.ScoreScripts.name}</a>`
        })
    }

    let uuidv4 = window.location.uuidv4()
    let rightTable = ''
    let leftTable = ``
    data.forEach((item, element) => {
        rightTable += `
          <tr>
            <td class="text-center"></td>
            <td class="text-center"></td>
            <td class="text-center"></td>
            <td class="text-center direction">${item.direction}</td>
            <td class="text-center agentName">${item.agentName}</td>
            <td class="text-center teamName">${item.teamName}</td>
            <td class="text-center groupName">${item.groupName}</td>
            <td class="text-center caller">${item.caller}</td>
            <td class="text-center called">${item.called}</td>
            <td class="text-center origTime">${item.origTime}</td>
            <td class="text-center duration">${item.duration}</td>
          </tr>
        `
        leftTable += ` <tr class="text-center">
            <td class="text-center callId">${item.callId || ''}</td>
            <td class="text-center">    
                <i class="fas fa-check mr-2 dropdown-toggle" id="dropdown-${uuidv4}" data-toggle="dropdown" title="Chấm điểm"></i>
                <div class="dropdown-menu" aria-labelledby="dropdown-${uuidv4}">
                    ${dropdown}
                </div>
                <a type="button" class="callScore"><i class="fas fa-pen-square mr-2" title="Sửa chấm điểm"></i></a>
                <i class="fas fa-comment-alt mr-2" title="Ghi chú"></i>
                <i class="fas fa-history mr-2" title="Lịch sử chấm điểm"></i>
                <i class="fas fa-play-circle mr-2" title="Xem chi tiết ghi âm"></i>
            </td>
        </tr>`
    })

    $leftTable.html(leftTable)
    $rightTable.html(rightTable)
    // handleAudio();
    return

}

function popupScore(criteriaGroup) {
    let navHTML = `
    <li class="nav-item border-bottom" disable>
        <a class="nav-link active" href="#">[Tên nhóm tiêu chí]</a>
    </li>`
    $('#formCallScore')[0].reset()
    $('.tab-content').html('')
    let optionNoteCriteriaGroup = `<option value="default">Toàn bộ kịch bản</option>`
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
                <select class="form-control selectpicker input pl-2">
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
        optionNoteCriteriaGroup += `<option value="${criteriaGroup.id}">${criteriaGroup.name}</option>`
        $('.tab-content').append(navTabContent)

    })

    $('.scoreScript').text(`Tổng điển: 0/${totalPoint} - 0%`)
    $('#noteCriteriaGroup').html(optionNoteCriteriaGroup)
    $('#noteCriteria').val("")
    $('#noteCriteria').prop("disabled", true)
    $('.selectpicker').selectpicker('refresh')
    $('#noteCriteriaGroup').val('default')
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
    $(document).off('change', '#noteCriteriaGroup')
})