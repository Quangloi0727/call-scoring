const titlePage = 'Quản lý trường bổ sung trên Recording'
exports.index = async (req, res, next) => {
    try {
        const additionalField = fs.readFileSync(_pathFileAdditionField)

        return _render(req, res, 'additionalField/index', {
            additionalField: JSON.parse(additionalField),
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