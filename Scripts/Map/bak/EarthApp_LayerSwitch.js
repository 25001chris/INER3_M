/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  這是把圖層套疊工具獨立出來成單獨一個JS檔
//  需要使用時請先include好EarthApp.js 與 EarthApp_ToolWindow.js 以維持正常運作
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 圖層套疊工具窗格
 * @param {any} pParent
 * @param {any} pEarth
 * @param {any} callback
 */
var GLayerSwitchDialog = function (pParent, pEarth, callback) {
    ToolWindowBase.call(this, pParent, {
        Class: "GLayerSwitchDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    /**
     * 開啟時窗格高度(縮到最小後還原用)
     * */
    var NormalHeight = null;
    /**
     * 目前可以處理的底圖
     * */
    var BaseLayers = [
        //通用電子地圖
        { lyr: Basemap, id: "imgBaseMapVisibility", name:"通用版電子地圖"}
        ,
        //衛星影像圖
        { lyr: Photo, id: "imgPhotoVisibility", name:"衛星影像圖"}
    ];
    /**
     * 饋線圖層名稱與可見度紐ID設定
     * */
    var Feeders = [{ id: "imgFeeder01", name: "匯流排", lyrname: "busbar" }
        , { id: "imgFeeder02", name: "高壓導線(主幹)", lyrname: "edge0" }
		, { id: "imgFeeder06", name: "高壓導線(分岐)", lyrname: "edge1" }
        , { id: "imgFeeder03", name: "再生能源", lyrname: "energy" }
        , { id: "imgFeeder04", name: "直接連接", lyrname: "connection" }
        , {id:"imgFeeder05",name:"電流方向",lyrname:"current_dir"}
		, {id:"imgFeeder07",name:"停電/故障區間",lyrname:"buffer"}
    ];
    /**
     * 設備圖層名稱與可見度紐ID設定
     * */
    var Equips = [
        { id: "imgEquip01", name: "電容", lyrname: "capacitor" }
        , { id: "imgEquip02", name: "故障指示器", lyrname: "faultindicator" }
        , { id: "imgEquip03", name: "高壓用戶", lyrname: "hicustomer" }
        , { id: "imgEquip04", name: "斷路器", lyrname: "breaker" }
        , { id: "imgEquip05", name: "高壓跳線", lyrname: "jumper" }
        , { id: "imgEquip06", name: "再生能源", lyrname: "distributedenergy" }
        , { id: "imgEquip07", name: "游休", lyrname: "youxiu" }
        , { id: "imgEquip08", name: "開關", lyrname: "switch" }
        , { id: "imgEquip09", name: "線路變壓器", lyrname: "sxfmr" }
        , { id: "imgEquip10", name: "終端", lyrname: "terminal" }
        , { id: "imgEquip11", name: "主變壓器", lyrname: "mxfmr" }
        , { id: "imgEquip12", name: "電驛", lyrname: "capacitor" }
        , { id: "imgEquip13", name: "高壓節點", lyrname: "node" }
        , { id: "imgEquip14", name: "導線交叉", lyrname: "edgecross" }
        , { id: "imgEquip15", name: "導線變更", lyrname: "edgechange" }
        , { id: "imgEquip16", name: "變電所", lyrname: "substation" }
        , { id: "imgEquip17", name: "電桿", lyrname: "pole" }
        , { id: "imgEquip18", name: "配電室", lyrname: "dsbnroom" }
        , { id: "imgEquip19", name: "備註文字", lyrname: "annotation" }
    ];
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 手機環境下，縮到最小、還原窗格後，預設流程是要隱藏或顯示窗格BODY部分並變更窗格CSS Class以變更窗格高度
     * 除此之外還要幹嘛?ANS:本視窗下基於饋線編號頁與其他頁高度不同 要特別紀錄目前開啟時窗格高度 還原時方便
     * */
    this.MobileResizeCallBack = function () {
        if ($(".SG3DTool").hasClass("GMinimizeDialogGeneral")) {
            that.getNode().style.height = "36px";
        } else {
            that.getNode().style.height = NormalHeight;
        }
    };
    /**
     * 底圖開關
     * @param {any} r
     */
    function TurnOnOffBase(r) {
        if (BaseLayers[r].lyr.getVisible()) {
            BaseLayers[r].lyr.setVisible(false);
            $("#" + BaseLayers[r].id).prop("src", "../images/ToolWindow/VisibilityOff.svg");
        } else {
            BaseLayers[r].lyr.setVisible(true);
            $("#" + BaseLayers[r].id).prop("src", "../images/ToolWindow/VisibilityOn.svg");
            for (var i = 0; i < BaseLayers.length; i += 1) {
            /*目前僅通用電子地圖和衛星影像圖 所以一開另一個必定關 在此保留擴充性*/
                if (i != r) {
                    BaseLayers[i].lyr.setVisible(false);
                    $("#" + BaseLayers[i].id).prop("src", "../images/ToolWindow/VisibilityOff.svg");
                }
            }
        }
    }
    /**
     * 這個圖層是否可見
     * @param {any} TargetLayer
     */
    function GetOnOffState(TargetLayer) {
        return BaseLayers[TargetLayer].lyr.getVisible();
    }
    /**
     * 取得圖層是否可見狀態
     * @param {any} name
     */
    function GetLayerVisible(name) {
        //Gary Lu:20201106起改用switch
        switch (name) {
            case "switch":
                return Layers["switch-0"].Visible;
            case "current_dir":
                return current_visible;
			case "edge0":
				return LineData.GetLayerVisible(name);
			case "edge1":
				return LineData.GetLayerVisible(name);
			case "busbar":
				return LineData.GetLayerVisible(name);
			case "energy":
				return LineData.GetLayerVisible(name);
			case "connection":
				return LineData.GetLayerVisible(name);
			case "annotation":
				return TextData.GetLayerVisible(name);
			case "buffer":
				return buffer_visible;
            default:
                return Layers[name].Visible;
        }
        //if (name == "switch") {
        //    return Layers["switch-0"].Visible;
        //} else if (name == "current_dir") {
        //    return current_visible;
        //}
        //else {
        //    return Layers[name].Visible;
        //}
    }
    /**
     * 頁面切換按鈕區下方的效果條
     * @param {any} i
     */
    function select(i) {
        var tLabelWidth = $($("#" + that.ScrollbarID).parent().find(".switch-tab-title")[0]).width();
        var tBarWidth = $($("#" + that.ScrollbarID).parent().find(".switch-tab-title")[i]).width();
        $("#" + that.ScrollbarID).width(tBarWidth);
        $("#" + that.ScrollbarID).css("transform", "translate3d(" + (i * tLabelWidth) + "px, 0px, 0px)");
        switchDiv(i);
    }
    /**
     * 切換頁面
     * @param {any} i 頁面索引
     */
    function switchDiv(i) {
        intLayer = i;
        /*
         * Gary Lu 變更點:
         * 20200925:四個區塊有三種不同窗格高度，較坐標與定位多了一種高度
         * 20200926:設備圖層過多 所以為了卷軸 外面加了一層DIV覆蓋 這層DIV可不可見跟著那個區塊走
         */
        switch (i) {
            case 0:
                NormalHeight = "180px";
                $("#DivBaseMapLayer").show();
                $("#DivFeederLayer").hide();
                $("#DivEquipmentLayerCover").hide();
                $("#DivEquipmentLayer").hide();
                $("#DivWarningLayer").hide();
                break;
            case 1:
                NormalHeight = "360px";
                $("#DivBaseMapLayer").hide();
                $("#DivFeederLayer").show();
                $("#DivEquipmentLayerCover").hide();
                $("#DivEquipmentLayer").hide();
                $("#DivWarningLayer").hide();
                break;
            case 2:
                NormalHeight = "445px";
                $("#DivBaseMapLayer").hide();
                $("#DivFeederLayer").hide();
                $("#DivEquipmentLayerCover").show();
                $("#DivEquipmentLayer").show();
                $("#DivWarningLayer").hide();
                break;
            case 3:
                NormalHeight = "260px";
                $("#DivBaseMapLayer").hide();
                $("#DivFeederLayer").hide();
                $("#DivEquipmentLayerCover").hide();
                $("#DivEquipmentLayer").hide();
                $("#DivWarningLayer").show();
                break;
        }
        that.MobileResizeCallBack();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.ScrollbarID = "LayerBar";
    this.IconBox.src = "../images/ToolWindow/Positioning.svg";
    this.LabelBox.innerText = "圖層套疊";
    this.SetShuttleSpace(4, 4);
    this.SetPageSwitchItems([
        { Text: "底圖", OnClick: function () { select(0); } },
        { Text: "線路", OnClick: function () { select(1); } },
        { Text: "設備", OnClick: function () { select(2); } },
        { Text: "應用", OnClick: function () { select(3); } },
    ]);
    //底圖
    var DivBaseMap = this.BodyCell.appendObject("table", { id: "DivBaseMapLayer", class: "LayerWindowOperation" }, { tableLayout: "fixed" });
    for (var i = 0; i < BaseLayers.length; i += 1) {
        var Row11 = DivBaseMap.appendObject("tr", null, { height: "40px" });
        Row11.appendObject("td", null, { width: "80%" }).appendObject("label", { class: "LayerToolLayerName" }).appendText(BaseLayers[i].name);
        Row11.appendObject("td", null, { width: "20%" }).appendObject("img", {
            id: BaseLayers[i].id,
            src: (GetOnOffState(i) ? "../images/ToolWindow/VisibilityOn.svg" : "../images/ToolWindow/VisibilityOff.svg")
        });
        //事件設定
        $("#" + BaseLayers[i].id).click(function () {
            var i0 = 0;
            while (BaseLayers[i0].id != $(this).attr("id") && i0<BaseLayers.length) {
                i0 += 1;
            }
            if (i0 < BaseLayers.length) {
                TurnOnOffBase(i0);
            }
        });
    }
    //var Row11 = DivBaseMap.appendObject("tr", null, { height: "40px" });
    //Row11.appendObject("td", null, { width: "80%" }).appendObject("label", { class: "LayerToolLayerName" }).appendText("通用版電子地圖");
    //Row11.appendObject("td", null, { width: "20%" }).appendObject("img", {
    //    id: "imgBaseMapVisibility",
    //    src: (GetOnOffState(BaseLayers[0]) ? "../images/ToolWindow/VisibilityOn.svg" :"../images/ToolWindow/VisibilityOff.svg")
    //});
    ////事件設定
    //$("#imgBaseMapVisibility").click(function () {//通用電子地圖
    //    TurnOnOffBase(BaseLayers[0]);
    //});
    //var Row12 = DivBaseMap.appendObject("tr", null, { height: "40px" });
    //Row12.appendObject("td", null, { width: "80%" }).appendObject("label", { class: "LayerToolLayerName" }).appendText("衛星影像圖");
    //Row12.appendObject("td", null, { width: "20%" }).appendObject("img",
    //    {
    //        id: "imgPhotoVisibility",
    //        src: (GetOnOffState(BaseLayers[1]) ? "../images/ToolWindow/VisibilityOn.svg" : "../images/ToolWindow/VisibilityOff.svg")
    //    });
    //$("#imgPhotoVisibility").click(function () {//衛星影像圖
    //    TurnOnOffBase(BaseLayers[1]);
    //});
    //饋線
    var DivFeeder = this.BodyCell.appendObject("table", { id: "DivFeederLayer", class: "LayerWindowOperation"});
    for (var i = 0; i < Feeders.length; i += 1) {
        var Row21 = DivFeeder.appendObject("tr", null, { height: "40px" });
        Row21.appendObject("td", null, { width: "80%" }).appendObject("label", { class: "LayerToolLayerName" }).appendText(Feeders[i].name);
        Row21.appendObject("td", null, { width: "20%" }).appendObject("img", {
            id: Feeders[i].id,
            src: (GetLayerVisible(Feeders[i].lyrname) ? "../images/ToolWindow/VisibilityOn.svg" :"../images/ToolWindow/VisibilityOff.svg"),
            "layer-target": Feeders[i].lyrname
        });
        $("#" + Feeders[i].id).click(function () {
            //各自綁定事件
            LayerVisible($(this).attr("layer-target"));
            if (GetLayerVisible($(this).attr("layer-target"))) {
                $(this).prop("src", "../images/ToolWindow/VisibilityOn.svg");
            } else {
                $(this).prop("src", "../images/ToolWindow/VisibilityOff.svg");
            }
        });
    }
    //設備
    var DivEquipmentCover = this.BodyCell.appendObject("div", { id: "DivEquipmentLayerCover" });
    var DivEquip = DivEquipmentCover.appendObject("table", { id: "DivEquipmentLayer" },
        { position: "absolute", width: "calc(100% - 10px)", height: "100%", left: "4px", top: "0" });
    var DivEquipBody = DivEquip.appendObject("tbody", null, null);
    for (var i = 0; i < Equips.length; i += 1) {
        var Rowtmp = DivEquipBody.appendObject("tr", null, { height: "36px" });
        Rowtmp.appendObject("td", null, { width: "80%" }).appendObject("label", { class: "LayerToolLayerName" }).appendText(Equips[i].name);
        Rowtmp.appendObject("td", null, { width: "20%" }).appendObject("img", { id: Equips[i].id, src: (GetLayerVisible(Equips[i].lyrname) ? "../images/ToolWindow/VisibilityOn.svg" : "../images/ToolWindow/VisibilityOff.svg"), "layer-target": Equips[i].lyrname });
        $("#" + Equips[i].id).click(function () {
            //各自綁定事件
            LayerVisible($(this).attr("layer-target"));
            if (GetLayerVisible($(this).attr("layer-target"))) {
                $(this).prop("src", "../images/ToolWindow/VisibilityOn.svg");
            } else {
                $(this).prop("src", "../images/ToolWindow/VisibilityOff.svg");
            }
        });
    }
    //告警
    var DivWarning = this.BodyCell.appendObject("table", { id: "DivWarningLayer", class: "LayerWindowOperation" }, { tableLayout: "fixed" });
    var Row41 = DivWarning.appendObject("tr", null, { height: "36px" });
    var Row411 = Row41.appendObject("td", null, { width: "50%" });
    Row411.appendObject("label", { class: "LayerToolLayerName" }).appendText("主要警報");
    Row411.appendObject("img", { class: "WarningSign", src: "../images/Notification/AL3.png" });
    var eye41 = Row41.appendObject("td", null, { width: "50%", position: "relative" }).appendObject("img", { class: "VisibilityButton", src: (INERAlertings.AL3s.VisibleFlag ? "../images/ToolWindow/VisibilityOn.svg" : "../images/ToolWindow/VisibilityOff.svg") });
    AttachEvent(eye41, "click", function () {
        INERAlertings.SwitchMarkers(3);
        if (INERAlertings.AL3s.VisibleFlag) {
            $(this).prop("src", "../images/ToolWindow/VisibilityOn.svg");
        } else {
            $(this).prop("src", "../images/ToolWindow/VisibilityOff.svg");
        }
    });
    var Row42 = DivWarning.appendObject("tr", null, { height: "45px" });
    var Row421 = Row42.appendObject("td", null, { width: "50%" });
    Row421.appendObject("label", { class: "LayerToolLayerName" }).appendText("次要警報");
    Row421.appendObject("img", { class: "WarningSign", src: "../images/Notification/AL2.png" });
    var eye42 = Row42.appendObject("td", null, { width: "50%", position: "relative" }).appendObject("img", { class: "VisibilityButton", src: (INERAlertings.AL2s.VisibleFlag ? "../images/ToolWindow/VisibilityOn.svg" : "../images/ToolWindow/VisibilityOff.svg") });
    AttachEvent(eye42, "click", function () {
        INERAlertings.SwitchMarkers(2);
        if (INERAlertings.AL2s.VisibleFlag) {
            $(this).prop("src", "../images/ToolWindow/VisibilityOn.svg");
        } else {
            $(this).prop("src", "../images/ToolWindow/VisibilityOff.svg");
        }
    });
    var Row43 = DivWarning.appendObject("tr", null, { height: "45px" });
    var Row431 = Row43.appendObject("td", null, { width: "50%" });
    Row431.appendObject("label", { class: "LayerToolLayerName" }).appendText("一般警報");
    Row431.appendObject("img", { class: "WarningSign", src: "../images/Notification/AL1.png" });
    var eye43 = Row43.appendObject("td", null, { width: "50%", position: "relative" }).appendObject("img", { class: "VisibilityButton", src: (INERAlertings.AL1s.VisibleFlag ? "../images/ToolWindow/VisibilityOn.svg" : "../images/ToolWindow/VisibilityOff.svg") });
    AttachEvent(eye43, "click", function () {
        INERAlertings.SwitchMarkers(1);
        if (INERAlertings.AL1s.VisibleFlag) {
            $(this).prop("src", "../images/ToolWindow/VisibilityOn.svg");
        } else {
            $(this).prop("src", "../images/ToolWindow/VisibilityOff.svg");
        }
    });
	var Row44 = DivWarning.appendObject("tr", null, { height: "45px" });
    var Row441 = Row44.appendObject("td", null, { width: "50%" });
    Row441.appendObject("label", { class: "LayerToolLayerName" }).appendText("事件標記");
    Row441.appendObject("img", { class: "WarningSign", src: "../images/Poweroff.png", style:"width: 30px" });
    var eye44 = Row44.appendObject("td", null, { width: "50%", position: "relative" }).appendObject("img", { class: "VisibilityButton", src: (eventMarkers.VisibleFlag ? "../images/ToolWindow/VisibilityOn.svg" : "../images/ToolWindow/VisibilityOff.svg") });
    AttachEvent(eye44, "click", function () {
		eventMarkers.VisibleFlag = !eventMarkers.VisibleFlag;
        for(var i in eventMarkers.MTransfer)
			eventMarkers.MTransfer[i].Visible = eventMarkers.VisibleFlag;
		for(var i in eventMarkers.MPoweroff)
			eventMarkers.MPoweroff[i].Visible = eventMarkers.VisibleFlag;
		for(var i in eventMarkers.MFault)
			eventMarkers.MFault[i].Visible = eventMarkers.VisibleFlag;
		for(var i in eventMarkers.MShortcircuit)
			eventMarkers.MShortcircuit[i].Visible = eventMarkers.VisibleFlag;
        if (eventMarkers.VisibleFlag) {
            $(this).prop("src", "../images/ToolWindow/VisibilityOn.svg");
        } else {
            $(this).prop("src", "../images/ToolWindow/VisibilityOff.svg");
        }
    });
    select(Supergeo.IfNull(intLayer, 0));
};