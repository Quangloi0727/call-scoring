
const { Op, QueryTypes } = require('sequelize')
const pagination = require('pagination')
const UserModel = require('../models/user')
const UserRoleModel = require('../models/userRole')
const titlePage = 'Nhiệm vụ chấm điểm'
const {
    SUCCESS_200,
    ERR_500,
    ERR_400,
    ERR_403
} = require("../helpers/constants/statusCodeHTTP")
const SOURCE_NAME = {
    oreka: {
        code: 'ORK',
        text: 'Orec'
    },
    fs: {
        code: 'FS',
        text: 'Freeswitch'
    },
}
const { cheSo } = require("../helpers/functions")
const model = require('../models')
const moment = require('moment')
const { headerDefault } = require('../helpers/constants/fieldScoreMission')
exports.index = async (req, res, next) => {
    try {


        return _render(req, res, 'scoreMission/index', {
            title: titlePage,
            titlePage: titlePage,
            headerDefault: headerDefault
        })
    } catch (error) {
        console.log(`------- error ------- `)
        console.log(error)
        console.log(`------- error ------- `)
        return next(error)
    }
}

exports.getScoreMission = async (req, res, next) => {
    try {
        const {
            page
        } = req.query
        let { limit } = req.query
        let { user } = req

        if (!limit) limit = process.env.LIMIT_DOCUMENT_PAGE

        limit = Number(limit)

        const pageNumber = page ? Number(page) : 1
        const offset = (pageNumber * limit) - limit

        let query = ''
        let order = 'ORDER BY records.origTime DESC'

        let queryData = `
          DECLARE @df_AFTER_DAY VARCHAR(100) = '7'; -- recording cach ngay hien tai 7 ngay thi file goc .wav da duoc convert sang .mp3 de giam dung luong file
    
          SELECT
            records.callId AS callId,
            records.xmlCdrId AS xmlCdrId,
            records.caller AS caller,
            records.called AS called,
            records.origTime AS origTime,
            records.duration AS duration,
            records.recordingFileName AS recordingFileName,
            -- case 
            --   when records.recordingFileName IS NOT null AND DATEDIFF(day, dateadd(SS, records.connectTime + 7*60*60, '1970-01-01'), CAST(CURRENT_TIMESTAMP AS DATE)) >=  @df_AFTER_DAY then LEFT(records.recordingFileName, LEN(records.recordingFileName) - 4) + '.mp3'
            --   else records.recordingFileName
            -- end as recordingFileName,
            records.direction AS direction,
            records.sourceName AS sourceName,
            agent.fullName AS fullName,
            agent.userName AS userName,
            team.name AS teamName
          FROM dbo.call_detail_records records 
          LEFT JOIN dbo.Users agent ON records.agentId = agent.id
          LEFT JOIN dbo.Teams team ON records.teamId = team.id
          WHERE records.origTime >= 1657990800    
            AND records.origTime <= 1659632399
            AND (
              records.sourceName = '${SOURCE_NAME.oreka.code}'
              or
              (
                records.sourceName = '${SOURCE_NAME.fs.code}'
                and records.caller is not null
                and records.called is not null
              )
            )
              ${query}
            ${order}
          OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
        `

        let queryCountData = `
          SELECT COUNT(*) AS total
          FROM dbo.call_detail_records records 
          LEFT JOIN dbo.Users agent ON records.agentId = agent.id
          LEFT JOIN dbo.Teams team ON records.teamId = team.id
          WHERE records.origTime >= 1657990800      
            AND records.origTime <= 1659632399
            AND (
              records.sourceName = '${SOURCE_NAME.oreka.code}'
              or
              (
                records.sourceName = '${SOURCE_NAME.fs.code}'
                and records.caller is not null
                and records.called is not null
              )
            )
              ${query}
        `

        const [recordResult, totalData] = await Promise.all([
            await model.sequelize.query(queryData, { type: QueryTypes.SELECT }),
            await model.sequelize.query(queryCountData, { type: QueryTypes.SELECT }),
        ])

        let paginator = new pagination.SearchPaginator({
            current: pageNumber,
            rowsPerPage: limit,
            totalResult: totalData && totalData[0] && totalData[0].total || 0
        })

        return res.status(SUCCESS_200.code).json({
            message: 'Success!',
            data: recordResult && handleData(recordResult, _config.privatePhoneNumberWebView) || [],
            paginator: { ...paginator.getPaginationData(), rowsPerPage: limit },
        })
    } catch (error) {
        console.log(`------- error ------- getRecording`)
        console.log(error)
        console.log(`------- error ------- getRecording`)

        return res.status(ERR_500.code).json({ message: error.message })
    }
}


function handleData(data, privatePhoneNumber = false) {
    let newData = []

    newData = data.map((el) => {
        el.origTime = moment(el.origTime * 1000).format('HH:mm:ss DD/MM/YYYY')
        el.duration = hms(el.duration)
        el.recordingFileName = _config.pathRecording + el.recordingFileName

        // che số
        if (privatePhoneNumber) {
            if (el.caller && el.caller.length >= 10) el.caller = cheSo(el.caller, 4)
            if (el.called && el.called.length >= 10) el.called = cheSo(el.called, 4)
        }

        return el
    })

    return newData
}

function hms(secs) {
    if (isNaN(secs) || !secs || secs == 0) return '00:00:00'

    let sec = 0
    let minutes = 0
    let hours = 0

    sec = Math.ceil(secs)
    minutes = Math.floor(sec / 60)
    sec = sec % 60
    hours = Math.floor(minutes / 60)
    minutes = minutes % 60

    return `${hours}:${pad(minutes)}:${pad(sec)}`
}

function pad(num) {
    return ('0' + num).slice(-2)
}