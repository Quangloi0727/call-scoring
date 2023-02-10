$(function () {
    let check_Input_Change_Value = false

    // bắt sự kiện khi chọn file
    $(".custom-file-input").on("change", function (e) {
        var fileName = $(this).val().split("\\").pop()
        var self = this
        if (self.files.length > 0) {
            var _extension = self.files[0].name.split('.').pop().trim()
            if (['png', 'jpeg', 'jpg'].indexOf(_extension) < 0) {
                toastr.error('Tệp tin không hợp lệ !')
                $(".custom-file-input").val(null)
                $('span[class*="name-file-logo"]').remove()
                $('.default-text').removeClass("d-none")
                $('#previewImg-error').removeClass("d-none")
                $('#previewImg').addClass("d-none")
                $('#my_image').attr('src', '')
                check_Input_Change_Value = true
                return false
            }
        }
        $('span[class*="name-file-logo"]').remove()
        let html = `
        <span class="name-file-logo">${fileName}</span>
        `
        $(".custom-file-label").append(html)
        $('.default-text').addClass("d-none")
        readURL(this)
    })
    // bắt sự kiện click xóa file ảnh đang có
    $(document).on('click', 'i[class*="fa-trash"]', function () {
        $(".custom-file-input").val(null)
        $('span[class*="name-file-logo"]').remove()
        $('.default-text').removeClass("d-none")
        $('#previewImg-error').removeClass("d-none")
        $('#previewImg').addClass("d-none")
        $('#my_image').attr('src', '')
        check_Input_Change_Value = true
    })

    // btn upload ảnh
    $(document).on('click', '#btn-upload-logo', function () {

        var data = new FormData()
        console.log(check_Input_Change_Value)
        if (check_Input_Change_Value == false) {
            toastr.success("Upload ảnh thàng công !")
            toastr.options = {
                closeButton: true,
                onCloseClick: () => {
                    location.reload()
                }
            }
            return setTimeout(() => {
                location.reload()
            }, 2500)
        }
        data.append('fileAvatar', $('.custom-file-input')[0].files[0])
        $.ajax({
            type: 'POST',
            enctype: 'multipart/form-data',
            url: "/tenant/uploadLogo",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            success: function (result) {
                toastr.success(result.message)
                toastr.options = {
                    closeButton: true,
                    onCloseClick: () => {
                        location.reload()
                    }
                }
                return setTimeout(() => {
                    location.reload()
                }, 2500)

            },
            error: function (error) {
                toastr.error(error.responseJSON.message.message)
                toastr.options = {
                    closeButton: true,
                    onCloseClick: () => {
                        location.reload()
                    }
                }
                return setTimeout(() => {
                    location.reload()
                }, 2500)

            },
        })
    })
    $(document).on('click', "#btn-cancel-upload-logo", function () {
        return location.reload()
    })
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader()
            check_Input_Change_Value = true
            reader.onload = function (e) {
                $('#previewImg img').attr('src', e.target.result)
                $('#previewImg').addClass("d-none")
                $('#previewImg-error').addClass("d-none")
                $('#previewImg').removeClass("d-none")
            }
            return reader.readAsDataURL(input.files[0])
        }
        return check_Input_Change_Value = true
    }
})