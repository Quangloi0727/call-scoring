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
            createTable(result.data, result.ConfigurationColums, queryData)
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

function createTable(data) {
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
                <i class="fas fa-check mr-2" title="Chấm điểm"></i>
                <i class="fas fa-pen-square mr-2" title="Sửa chấm điểm"></i>
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