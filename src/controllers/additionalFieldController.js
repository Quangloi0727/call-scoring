const titlePage = 'Quản lý trường bổ sung trên Recording'
exports.index = async (req, res, next) => {
    try {
        return _render(req, res, 'additionalField/index', {
            title: titlePage,
            titlePage: titlePage,
        })
    } catch (error) {
        console.log(`------- error ------- `)
        console.log(error)
        console.log(`------- error ------- `)
        return next(error)
    }
}