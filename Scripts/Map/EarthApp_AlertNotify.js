/**
 * 告警通知是否顯示狀態
 * */
var AlertNotifyState = {
    /**
     * GIS告警通知
     */
    GISAlert: true
    ,
    /**
     * SCADA告警通知
     */
    SCADAAlert:true
    ,
    /**
     * SCADA告警篩選通知
     */
    SCADAFilterAlert:true
};
/**
 * 告警通知開關控制小面板
 * @param {any} pParent
 * @param {any} pEarth
 * @param {any} callback
 */
var GAlertNotifyDialog = function (pParent, pEarth, callback) {
    ToolWindowBase.call(this, pParent, {
        Class: "GAlertNotifyDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    /**
     * 通知開關
     * */
    var Switches = [
        "GIS告警通知"
        , "SCADA告警通知"
        , "SCADA告警篩選"
    ];
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    function GetSwitchState(SwitchName) {
        switch (SwitchName) {
            case Switches[0]:
                return AlertNotifyState.GISAlert;
            case Switches[1]:
                return AlertNotifyState.SCADAAlert;
            case Switches[2]:
                return AlertNotifyState.SCADAFilterAlert;
        }
    }
    function SetSwitchState(SwitchName) {
        switch (SwitchName) {
            case Switches[0]:
                AlertNotifyState.GISAlert = !AlertNotifyState.GISAlert;
                break;
            case Switches[1]:
                AlertNotifyState.SCADAAlert = !AlertNotifyState.SCADAAlert;
                break;
            case Switches[2]:
                AlertNotifyState.SCADAFilterAlert = !AlertNotifyState.SCADAFilterAlert;
                break;
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.ScrollbarID = "InfoWindowBar";
    this.IconBox.src = "../images/ToolWindow/AlarmNotify.svg";
    this.LabelBox.innerText = "告警通知";
    var divSwitches = this.BodyCell.appendObject("table", { id: "tblNotificationSwitches", class: "MeasureToolBoxBody2" });
    for (var i = 0; i < Switches.length; i += 1) {
        var Row21 = divSwitches.appendObject("tr", null, { height: "40px" });
        Row21.appendObject("td", null, { width: "80%" }).appendObject("label", { class: "LayerToolLayerName" }).appendText(Switches[i]);
        Row21.appendObject("td", null, { width: "20%" }).appendObject("img", {
            id: "imgSwitch"+i,
            src: (GetSwitchState(Switches[i]) ? "../images/Notification/Alarm1.svg" : "../images/Notification/Alarm0.svg"),
            "layer-target": Switches[i]
        });
        $("#imgSwitch" + i).click(function () {
            //各自綁定事件
            SetSwitchState($(this).attr("layer-target"));
            if (GetSwitchState($(this).attr("layer-target"))) {
                $(this).prop("src", "../images/Notification/Alarm1.svg");
            } else {
                $(this).prop("src", "../images/Notification/Alarm0.svg");
            }
        });
    }
};