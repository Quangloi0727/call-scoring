// cấu hình bảng mặc định
const headerDefaultRecording = {
    callId: "ID cuộc gọi",
    action: "Thao tác",
    direction: "Hướng gọi",
    agentName: "Điện thoại viên",
    teamName: "Đội ngũ",
    groupName: "Nhóm",
    caller: "Số gọi đi",
    called: "Số gọi đến",
    audioHtml: "File ghi âm",
    origTime: "Ngày giờ gọi",
    duration: "Thời lượng",
    scoreScriptHandle: "Điểm đánh giá thủ công",
    scoreScriptAuto: "Điểm đánh giá tự động",
    scoreScriptCreatedBy: "Người chấm điểm",
    scoreScriptResult: "Kết quả đánh giá",
    sourceName: "Nguồn ghi âm"
}

const keysTitleExcelRecording = [
    "callId",
    "direction",
    "agentName",
    "teamName",
    "groupName",
    "caller",
    "called",
    "origTime",
    "duration",
    "scoreScriptHandle",
    "scoreScriptAuto",
    "scoreScriptCreatedBy",
    "scoreScriptResult",
    "var1",
    "var2",
    "var3",
    "var4",
    "var5",
    "var6",
    "var7",
    "var8",
    "var9",
    "var10",
]

const SOURCE_NAME = {
    oreka: {
        code: 'ORK',
        text: 'Orec'
    },
    fs: {
        code: 'FS',
        text: 'Freeswitch'
    }
}

module.exports = {
    headerDefaultRecording,
    keysTitleExcelRecording,
    SOURCE_NAME
}