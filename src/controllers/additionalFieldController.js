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

exports.edit = async (req, res, next) => {
    try {
        const additionalField = fs.readFileSync(_pathFileAdditionField)
        const arrayValue = _.pluck(JSON.parse(additionalField), 'value')
        const newArrayValue = String(arrayValue).toUpperCase().split(",")

        const { value } = req.body
        const { id } = req.params

        if (newArrayValue.indexOf(value.toUpperCase()) > -1) return res.json({ code: 500 })

        const newData = arrayValue.map(obj =>
            obj.id == req.id ? { ...obj, value: value } : obj
        );

        saveAdditionalFieldData(newData)

        return res.json({ code: 200 })

    } catch (error) {
        console.log(`------- error ------- `)
        console.log(error)
        console.log(`------- error ------- `)
        return next(error)
    }
}

const saveAdditionalFieldData = (data) => {
    // JSON.stringify(data, null, 4) pretty-print JSON
    const stringifyData = JSON.stringify(data, null, 4)
    fs.writeFileSync(_pathFileAdditionField, stringifyData)
}