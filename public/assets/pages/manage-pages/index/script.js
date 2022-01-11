$(function () {
  // Xóa phần tử
  $(document).on('click', '.btn-remove', function () {
    var pageID = $(this).attr('page-id');

    Swal.fire({
      title: 'Cảnh báo',
      text: "Bạn có chắc chắn muốn xóa",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          type: 'DELETE',
          url: '/manage-pages/delete',
          cache: 'false',
          data: { id: pageID },
          success: function (result) {
            window.location.reload();
          },
          error: function (error) {
            toastr.error(error.responseJSON.message);
          },
        });
      }
    })
  });

  $(document).on('click', '.checkbox-active', function () {
    var pageID = $(this).attr('page-id');
    var isActive = this.checked ? true : false

    $.ajax({
      type: 'PUT',
      url: '/manage-pages/change-active',
      cache: 'false',
      data: {
        active: isActive,
        _id: pageID
      },
      success: function (result) {
        toastr.success(result.message);
      },
      error: function (error) {
        toastr.error(error.responseJSON.message);
      },
    });
  })

  $(document).on('click', '#async_data', function () {
    $('#icon_sync').addClass('fa-spin')

    setTimeout(function () {
      $.ajax({
        type: 'GET',
        url: '/manage-pages/async-data',
        success: function (result) {
          $('#icon_sync').removeClass('fa-spin');
          toastr.success(result.message);
        },
        error: function (error) {
          $('#icon_sync').removeClass('fa-spin');
          toastr.error(error.responseJSON.message);
        }
      });
    }, 1000);
  })
});