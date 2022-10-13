var log4js = require('log4js')
var log4js_extend = require("log4js-extend")
var fs = require('fs-extra')

var getLogger = function (moduleName) {
    try {
        var appList = []
        appList.push(moduleName)
        var logger = log4js.getLogger(moduleName)
        var appLog = './logs/app.log'
        fs.ensureFileSync(appLog)

        log4js.configure({
            appenders: {
                console: { type: 'console' },
                filelog: { type: 'file', filename: appLog, pattern: '-yyyy-MM-dd', category: appList } //log theo từng ngày (có thể set up theo từng giờ/phút/giây -yyyy-MM-dd-hh-mm-ss)
            },
            categories: {
                file: { appenders: ['filelog'], level: 'error' },
                another: { appenders: ['console'], level: 'trace' },
                default: { appenders: ['console', 'filelog'], level: 'trace' }
            }
        })

        log4js_extend(log4js, {
            format: "[@name (@file:@line:@column)]"
        })

    } catch (err) {
        console.log(err)
    }
    return logger
}
exports.getLogger = getLogger