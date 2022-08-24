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
    }
}(jQuery)