const titlePage = 'Bạn không đủ quyền truy cập trang danh sách cuộc gọi !'
exports.index = async (req, res, next) => {
    try {
        return _render(req, res, 'default/index', {
            title: titlePage,
            titlePage: titlePage
        })
    } catch (error) {
        console.log(`------- error ------- `)
        console.log(error)
        console.log(`------- error ------- `)
        return next(error)
    }
}