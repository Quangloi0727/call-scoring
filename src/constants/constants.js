// cấu hình bảng mặc định
const headerDefault = {
    callId: "ID cuộc gọi",
    direction: "Hướng gọi",
    agentName: "Điện thoại viên",
    teamName: "Đội ngũ",
    caller: "Số gọi đi",
    called: "Số gọi đến",
    origTime: "Ngày giờ gọi",
    duration: "Thời lượng",
    audioHtml: "Ghi âm",
    sourceName: "Nguồn ghi âm",
    var1: "Var1",
    var2: "Var2",
    var3: "Var3",
    var4: "Var4",
    var5: "Var5",
    var6: "Var6",
    var7: "Var7",
    var8: "Var8",
    var9: "Var9",
    var10: "Var10"
}

const var1Tovar10 = {
    var1: "Var1",
    var2: "Var2",
    var3: "Var3",
    var4: "Var4",
    var5: "Var5",
    var6: "Var6",
    var7: "Var7",
    var8: "Var8",
    var9: "Var9",
    var10: "Var10"
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
];

module.exports = {
    headerDefault,
    keysTitleExcel,
    var1Tovar10
}