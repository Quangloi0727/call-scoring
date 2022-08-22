// cấu hình bảng mặc định
const headerDefault = {
    callId: "ID cuộc gọi",
    action: "Thao tác",
    direction: "Hướng gọi",
    agentName: "Điện thoại viên",
    teamName: "Đội ngũ",
    caller: "Số gọi đi",
    called: "Số gọi đến",
    origTime: "Ngày giờ gọi",
    duration: "Thời lượng",
    audioHtml: "Ghi âm",
    sourceName: "Nguồn ghi âm"
}

const keysTitleExcel = [
    "direction",
    "agentName",
    "teamName",
    "caller",
    "called",
    "origTime",
    "duration",
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

module.exports = {
    headerDefault,
    keysTitleExcel
}