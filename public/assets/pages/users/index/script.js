$(function () {
    // $('#myModal').modal('show')
    console.log("aaaaaaaaaa", title);
    $('#btn_create_user').on('click', function () {
        $('#form_input_user').validate({
            rules: {
                firstName: {
                    required: true,
                    maxlength: 30,
                },
                lastName: {
                    required: true,
                    maxlength: 30,
                },
                userName: {
                    required: true,
                    maxlength: 30,
                },
                extension: {
                    required: true,
                    number: true
                },
            },
            messages: {
                firstName: {
                    required: "Không được để trống Họ và Tên đệm",
                    maxlength: "Số kí tự đối đa là 30/30"
                },
                lastName: {
                    required: "Không được để trống Tên",
                    maxlength: "Số kí tự đối đa là 30/30"
                },
                userName: {
                    required: "Không được để trống Tên đăng nhập",
                    maxlength: "Số kí tự đối đa là 30/30"
                },
                extension: {
                    required: "Không được để trống extension",
                    number: "Chỉ nhập định dạng số"
                }
            },
            errorElement: 'span',
            errorPlacement: function (error, element) {
                error.addClass('invalid-feedback');
                element.closest('.form-group').append(error);
            },
            highlight: function (element, errorClass, validClass) {
                $(element).addClass('is-invalid');
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass('is-invalid');
            }
        });
        console.log("aaaaaaaaaa", title);
        console.log("aaaaaaaaaaaa");
        let inputValue = $('#form_input_user').serializeArray();
        let queryData = {};
        inputValue.forEach((el) => {
            if (el.value && el.value !== '') {
                queryData[el.name] = el.value;
            }
        });
        console.log(queryData)
    });
    $('#myModal').on('hidden.bs.modal', function (e) {
        // do something...
        console.log("aaaaaaaaaaaa");
        document.getElementById('#form_input_user').trigger("reset");
        $('#form_input_user').trigger("reset"); h
    })
});