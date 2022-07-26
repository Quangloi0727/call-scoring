module.exports = {
    mapHeaderDefault: function (headerDefault, additionalField) {
        let newObject = additionalField.reduce(
            (obj, item) => Object.assign(obj, { [item.code]: item.value }), {})
        return { ...headerDefault, ...newObject }
    }
}