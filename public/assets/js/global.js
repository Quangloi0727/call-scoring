! function () {
    "use strict"
}(), function (e) {
    // có 2 contentType có thể dùng nhiều là : multipart/form-data và application/json
    window._AjaxData = function (t, n, i, opts, o) {
        e(".page-loader").show(), e.ajax({
            url: t,
            method: n,
            data: i,
            cache: !1,
            contentType: opts && opts.contentType ? opts.contentType : !1,
            processData: !1
        }).done(function (t) {
            e(".page-loader").fadeOut("slow", function () {
                o && o(t)
            })
        })
    }, window._AjaxGetData = function (t, n, o) {
        e(".page-loader").show(), e.ajax({
            url: t,
            method: n,
            cache: !1,
            processData: !1
        }).done(function (t) {
            e(".page-loader").fadeOut("slow", function () {
                o && o(t)
            })
        })
    }, window._convertTime = function (minute, second) {
        return parseInt(minute) * 60 + parseInt(second)
    }, window._secondsToTimestamp = function (seconds) {
        seconds = Math.floor(seconds)
        var h = Math.floor(seconds / 3600)
        var m = Math.floor((seconds - (h * 3600)) / 60)
        var s = seconds - (h * 3600) - (m * 60)

        h = h < 10 ? '0' + h : h
        m = m < 10 ? '0' + m : m
        s = s < 10 ? '0' + s : s
        return h + ':' + m + ':' + s
    }, window._genNoteFor = function (criteria, criteriaGroup) {
        if (!criteria) return "Toàn bộ kịch bản"
        return `${criteria.name} / ${criteriaGroup.name}`
    }, window._updateTimer = function (wavesurfer) {
        var formattedTime = _secondsToTimestamp(wavesurfer.getCurrentTime())
        $('.waveform-time-indicator .time').text(formattedTime)
    }, window._configWaveSurfer = function (arrRegion, urlRecord, container) {
        var wavesurfer = new WaveSurfer.create({
            container: container ? container : '#formDetailRecord',
            scrollParent: true,
            waveColor: '#A8DBA8',
            progressColor: '#3B8686',
            backend: 'MediaElement',
            splitChannels: true,
            splitChannelsOptions: {
                overlay: false,
                channelColors: {
                    0: {
                        progressColor: 'green',
                        waveColor: 'pink'
                    },
                    1: {
                        progressColor: 'orange',
                        waveColor: 'purple'
                    }
                }
            },
            plugins: [
                WaveSurfer.regions.create({})
            ]
        })

        wavesurfer.empty()
        //wavesurfer.load("https://qa.metechvn.com/static/call.metechvn.com/archive/2022/Aug/29/409ddeda-2766-11ed-813e-95f7e31f94c6.wav")
        wavesurfer.load(urlRecord)

        wavesurfer.on('ready', function (e) {
            wavesurfer.play()
            _updateTimer(wavesurfer)
            const totalTime = _secondsToTimestamp(wavesurfer.getDuration())
            $('.waveform-time-indicator .totalTime').text(totalTime)
        })

        wavesurfer.on('audioprocess', function (e) {
            _updateTimer(wavesurfer)
        })

        arrRegion.forEach(el => {
            const initRegion = wavesurfer.addRegion({
                start: _convertTime(el.timeNoteMinutes || 0, el.timeNoteSecond || 0),
                loop: false,
                color: 'rgba(255, 0, 0, 0.8)',
                attributes: {
                    title: `Nội dung ghi chú: ${el.description}\nGhi chú cho: ${_genNoteFor(el.criteria, el.criteriaGroup)}\nNgười ghi chú: ${el.userCreate && el.userCreate.fullName ? el.userCreate.fullName : ''} (${el.userCreate && el.userCreate.userName ? el.userCreate.userName : ''}) lúc ${(moment(el.createdAt).format("DD/MM/YYYY HH:mm:ss"))}\nVị trí ghi chú: ${_secondsToTimestamp(_convertTime(el.timeNoteMinutes || 0, el.timeNoteSecond || 0))}`
                }
            })
            if (!el.criteria) {
                $(initRegion.element.children[0]).addClass("wholeScript")
                $(initRegion.element.children[1]).addClass("wholeScript")
            }
        })

        //event change title wavesurfer to notes
        wavesurfer.on('region-mouseenter', function (region, e) {
            region.element.title = region.attributes.title
        })
        return wavesurfer
    }
}(jQuery)