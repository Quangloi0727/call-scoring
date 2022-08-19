// https://codepen.io/scottjehl/pen/abJrPOP

const $leftTable = $('.content-table-left')
const $rightTable = $('.content-table-right')
const $resetColumnCustom = $('#resetColumnCustom')
const $modal_customs_table = $("#modal_customs_table")
const $selectAll = $("#select-all")


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
                let navHTML = `
                <li class="nav-item border-bottom" disable>
                    <a class="nav-link active" href="#">[Tên nhóm tiêu chí]</a>
                </li>`

                resp.data.CriteriaGroup.map((CriteriaGroup) => {
                    let uuidv4 = window.location.uuidv4()
                    navHTML += `
                    <li class="nav-item border-bottom">
                        <a class="nav-link" data-toggle="pill" href="#tab-criteria-group-${uuidv4}" role="tab" 
                        aria-controls="tab-score-script-script" aria-selected="false">${CriteriaGroup.name}</a>
                    </li>`

                    let navTabContent
                    if (CriteriaGroup.Criteria && CriteriaGroup.Criteria.length > 0) {
                        let criteria = ``
                        CriteriaGroup.Criteria.map((SelectionCriteria) => {
                            let htmlSelectionCriteria = ``
                            if (SelectionCriteria.SelectionCriteria.length > 0) {
                                SelectionCriteria.SelectionCriteria.map((el) => {
                                    htmlSelectionCriteria += `<option value="${el.id}">${el.name}</option>`
                                })

                            }
                            criteria += `<label for="timeNote" class="col-sm-3 form-check-label mt-4">${CriteriaGroup.name}</label>
                            <select class="form-control selectpicker input pl-2">
                                ${htmlSelectionCriteria}
                            </select>`
                        })

                        navTabContent = `
                        <div class="tab-pane fade mb-4" id="tab-criteria-group-${uuidv4}" role="tabpanel"
                            aria-labelledby="custom-tabs-three-home-tab">
                            ${criteria}
                        </div>
                        `
                    }

                    $('.tab-content').append(navTabContent)

                })
                $('.selectpicker').selectpicker('refresh')
                $('.nav-scorescript').html(navHTML)
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
    console.log(scoreScripts)
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
})