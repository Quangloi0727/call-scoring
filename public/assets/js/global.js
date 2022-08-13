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
    }
}(jQuery)