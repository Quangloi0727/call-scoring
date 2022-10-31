const SOURCE_NAME = {
    orecx: {
        code: 'orecx',
        text: 'ORECX',
        tableInclude: 'oreka.orktape,oreka.orktag,oreka.orksegment'
    },
    fs: {
        code: 'fs',
        text: 'FS',
        tableInclude: 'public.v_extensions,public.v_call_center_agents,public.v_xml_cdr'
    }
}

const ENABLED = {
    ON: 1,
    OFF: 0
}

const idExist = "Đã xảy ra lỗi,vui lòng thử lại !"
const nameExist = "Tên nguồn đã tồn tại !"
const hostPortExist = "dbHost và dbPort đã tồn tại !"
const sourceNotExist = "Nguồn ghi âm không tồn tại  !"

module.exports = {
    sourceNotExist,
    hostPortExist,
    SOURCE_NAME,
    ENABLED,
    idExist,
    nameExist
}