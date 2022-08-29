module.exports = {
    mapHeaderDefault: function (headerDefault, additionalField) {
        let newObject = additionalField.reduce(
            (obj, item) => Object.assign(obj, { [item.code]: item.value }), {})
        return { ...headerDefault, ...newObject }
    },
    hms: function (secs) {
        if (isNaN(secs) || !secs || secs == 0) return '00:00:00'

        let sec = 0
        let minutes = 0
        let hours = 0

        sec = Math.ceil(secs)
        minutes = Math.floor(sec / 60)
        sec = sec % 60
        hours = Math.floor(minutes / 60)
        minutes = minutes % 60

        return `${hours}:${_.pad(minutes)}:${_.pad(sec)}`
    },

    pad: function (num) {
        return ('0' + num).slice(-2)
    }
}