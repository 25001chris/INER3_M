/////////////////////////////////////////////////////////////////////////////////////////////////////////\
// 必要函數 與 核研所系統專用的工具窗格基底區
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var dlgLayer = null;
var dlgPositioning = null;
var dlgStatus = null;
var dlgMeasure = null;
var dlg3DOnlyTool = null;
var intLayer = null;
var intPositioning = null;
var intStatus = null;
var intMeasure = null;
var intFeederLine = null;

/**
 * 按鈕狀態設定:開著還是關閉
 * @param {any} ButtonID 按鈕HTML ID
 * @param {any} IsOn 是開著(true)還是關閉(false)
 */
function TurnButtonOn(ButtonID, IsOn) {
    if (IsOn) {
        $("#" + ButtonID).removeClass("GisMapToolboxButton_Normal");
        $("#" + ButtonID).addClass("GisMapToolboxButton_Pressed");
    } else {
        $("#" + ButtonID).removeClass("GisMapToolboxButton_Pressed");
        $("#" + ButtonID).addClass("GisMapToolboxButton_Normal");
    }
}
/**
 * 寫操作紀錄
 * @param {any} FunctionID 功能編號
 */
function WriteUserLog(FunctionID) {
    $.ajax({
        url: "../GisMap/WriteUserLog?FunctionID=" + FunctionID,
        method: "post",
        success: function (res) {
            console.log(res);
            if (!res.ProcessFlag && res.ProcessMessage == "Not Login") {
                window.location = "../Home/LogIn";
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}
/**
 * 功能帶控管
 * */
var ToolWindowBarControl = {
    //按鈕名稱表
    Buttons: ["BtnPipeDistMeasure", "BtnGroundHoleTool", "BtnSectionalViewTool", "BtnMeasureTool"
        , "BtnLayersTool", "BtnPositioningTool", "BtnFeederLineTool", "BtnStatusEvaluationTool"]
    ,
    //可進行饋線演算分析的設備類別表
    TopologyEquipmentClasses: []
    ,
    /**
     * 設定只有指定的按鈕可以亮
     * @param {any} ButtonID 按鈕HTML ID
     */
    SetTurnOnButton: function (ButtonID) {
        for (var i = 0; i < this.Buttons.length; i += 1) {
            TurnButtonOn(this.Buttons[i], (this.Buttons[i] == ButtonID));
        }
    }
    ,
    /**
    * 開啟狀態估測工具窗
    * */
    OpenStatusDialog: function () {
        this.SetTurnOnButton("BtnStatusEvaluationTool");
        if (dlgPositioning != null) {
            dlgPositioning.Close();
        }
        if (dlgLayer != null) {
            dlgLayer.Close();
        }
        if (dlgMeasure != null) {
            dlgMeasure.Close();
        }
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        if (dlgStatus == null) {
            dlgStatus = new GStatusDialog(HTMLContainer, earth_);
            dlgStatus.addEventListener("Closed", function () { dlgStatus = null; });
        }
    },
    /**
     * 開啟測量工具窗
     * */
    OpenMeasureDialog: function () {
        this.SetTurnOnButton("BtnMeasureTool");
        if (dlgPositioning != null) {
            dlgPositioning.Close();
        }
        if (dlgLayer != null) {
            dlgLayer.Close();
        }
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        if (dlgMeasure == null) {
            dlgMeasure = new GMeasureDialog(HTMLContainer, earth_);
            dlgMeasure.addEventListener("Closed", function () { dlgMeasure = null; });
        }
    }
    ,
    /**
     * 開啟坐標與定位工具窗
     * */
    OpenPositioningDialog: function () {
        this.SetTurnOnButton("BtnPositioningTool");
        if (dlgLayer != null) {
            dlgLayer.Close();
        }
        if (dlgMeasure != null) {
            dlgMeasure.Close();
        }
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        if (dlgPositioning == null) {
            dlgPositioning = new GPositioningDialog(HTMLContainer, earth_);
            dlgPositioning.addEventListener("Closed", function () { dlgPositioning = null; });
        }
    }
    ,
    /**
     * 開啟圖層工具窗格
     * */
    OpenLayerDialog: function () {
        this.SetTurnOnButton("BtnLayersTool");
        if (dlgPositioning != null) {
            dlgPositioning.Close();
        }
        if (dlgMeasure != null) {
            dlgMeasure.Close();
        }
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        if (dlgLayer == null) {
            dlgLayer = new GLayerSwitchDialog(HTMLContainer, earth_);
            dlgLayer.addEventListener("Closed", function () { dlgLayer = null; });
        }
    }
    ,
    /**
     * 開啟管線測量窗格
     * */
    OpenPipeDistDialog: function () {
        this.SetTurnOnButton("BtnPipeDistMeasure");
        if (dlgPositioning != null) {
            dlgPositioning.Close();
        }
        if (dlgMeasure != null) {
            dlgMeasure.Close();
        }
        if (dlgLayer != null) {
            dlgLayer.Close();
        }
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        dlg3DOnlyTool = new GPipeLineDistanceDialog(HTMLContainer, earth_);
        dlg3DOnlyTool.addEventListener("Closed", function () { dlg3DOnlyTool = null; });
    }
    ,
    /**
     * 開啟開挖工具窗格
     * */
    OpenGroundHoleDialog: function () {
        this.SetTurnOnButton("BtnGroundHoleTool");
        if (dlgPositioning != null) {
            dlgPositioning.Close();
        }
        if (dlgMeasure != null) {
            dlgMeasure.Close();
        }
        if (dlgLayer != null) {
            dlgLayer.Close();
        }
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        dlg3DOnlyTool = new GGroundHoleDialog(HTMLContainer, earth_);
        dlg3DOnlyTool.addEventListener("Closed", function () { dlg3DOnlyTool = null; });
    }
    ,
    /**
     * 開啟開挖工具窗格
     * */
    OpenProfileDialog: function () {
        this.SetTurnOnButton("BtnSectionalViewTool");
        if (dlgPositioning != null) {
            dlgPositioning.Close();
        }
        if (dlgMeasure != null) {
            dlgMeasure.Close();
        }
        if (dlgLayer != null) {
            dlgLayer.Close();
        }
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        dlg3DOnlyTool = new GProfileDialog(HTMLContainer, earth_);
        dlg3DOnlyTool.addEventListener("Closed", function () { dlg3DOnlyTool = null; });
    }
    ,
    /**
     * 開啟窗格:饋線演算分析
     * */
    OpenFeederAnalysisDialog: function () {
        this.SetTurnOnButton("BtnFeederLineTool");
        if (dlgPositioning != null) {
            dlgPositioning.Close();
        }
        if (dlgMeasure != null) {
            dlgMeasure.Close();
        }
        if (dlgLayer != null) {
            dlgLayer.Close();
        }
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        dlg3DOnlyTool = new GFeederLineAnalysisDialog(HTMLContainer, earth_);
        dlg3DOnlyTool.addEventListener("Closed", function () { dlg3DOnlyTool = null; });
    }
    ,
    /**
     * 開啟窗格:告警通知
     * */
    OpenNotificationDialog: function () {
        if (dlg3DOnlyTool != null) {
            dlg3DOnlyTool.Close();
        }
        this.SetTurnOnButton("BtnAlertNotifySwitchPanel");
        dlg3DOnlyTool = new GAlertNotifyDialog(HTMLContainer, earth_);
        dlg3DOnlyTool.addEventListener("Closed", function () { dlg3DOnlyTool = null; });
    }
};
/**
 * 定位功能相關函數
 * (寫在這邊代表不是只有"坐標與定位"窗格會去用到它)
 * */
/**
* 地圖上的標記
* */
var pm;
var Positioning = {
    /**
     * 利用經緯度定位。
     * @param {any} lng 經度
     * @param {any} lat 緯度
     */
    DoByLngLat: function (lng, lat, height) {
        //3D圖台 earth_.AllowTilt=true
        var z = (height != null ? height : 1000);
        earth_.SetViewpoint(lng, lat, z, earth_.GetCamera().Yaw, (earth_.AllowTilt ? earth_.GetCamera().Pitch : 0), false);
		// 插標記前掃掉舊的標記
		if (pm != null) {
			earth_.PlacemarkObjects.Remove(pm);
			pm = null;
		}
		// 插標記
		var loc = { X: lng, Y: lat, Z: 0 };
		loc = (new TaipowerCoordinateTransform()).LngLatToEPSG3857(loc);
		var mkr = new SuperGIS.Marker(earth_, loc, "", "../map.svg");
		pm = mkr.getPlacemark();
		pm.DDDSymbol.Size = 30;
		pm.DDDSymbol.DynamicSize = false;
    }
    ,
    /**
     * 利用台電圖號座標定位。
     * @param {any} TPCCoord 台電圖號座標
     */
    DoByTPCCoord: function (TPCCoord, height) {
        var lnglat = (new TaipowerCoordinateTransform()).TPCPointToLngLat(TPCCoord);
        var z = (height != null ? height : 1000);
        earth_.SetViewpoint(lnglat.X, lnglat.Y, z, earth_.GetCamera().Yaw, (earth_.AllowTilt ? earth_.GetCamera().Pitch : 0), false);
		//插標記前掃掉舊的標記
		if (pm != null) {
			earth_.PlacemarkObjects.Remove(pm);
			pm = null;
		}
		//插標記
		var loc = (new TaipowerCoordinateTransform()).LngLatToEPSG3857(lnglat);
		var mkr = new SuperGIS.Marker(earth_, lnglat, "", "../map.svg");
		pm = mkr.getPlacemark();
		pm.DDDSymbol.Size = 30;
		pm.DDDSymbol.DynamicSize = false;
    }
    ,
    /**
     * 饋線編號定位
     * @param {any} FeederID 饋線編號
     */
    DoByFeeder: function (FeederID, height) {
        var z = (height != null ? height : 1000);
        $.post("../GisMap/PositioningUsingFeeder", { FeederID: FeederID }, function (ret) {
            //查詢成功時ProcessMessage裡面會放著一個圖號座標
            if (ret.ProcessFlag) {
                var TPCCoord = ret.ProcessMessage;
                Positioning.DoByTPCCoord(TPCCoord,z);
            }
        });
    }
    ,
    /**
     * 自圖台介面上的點取得座標
     * @param {any} x
     * @param {any} y
     */
    GetCoordinateFromUI: function (x, y) {
        var pScene = earth_.GetScene();
        var pCam = earth_.GetCamera();
        var pGlobe = earth_.GetGlobe();
        var CurPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
        if (CurPosition == null)
            return;

        var CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(CurPosition), 1, false);
        var pPick = earth_.Objects.Picking(SuperGIS.DDDCore.RenderPriority.Ground, pCam.EyeAt, pCam.Ray(CurPosition), 0);
        if (pPick != null)
            CurLocation = pPick.GetLocate();
        var pt = pGlobe.GeodeticFromCartesian(CurLocation);
        return pt;
    }
};
/**
 * 工具視窗共通
 * @param {*} pParent 此視窗上一層元素
 * @param {*} Options 此視窗專屬特別設定
 */
var ToolWindowBase = function (pParent, Options) {
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    var that = this;
    /**
     * 這個視窗是否可見
     * */
    var bVisible = true;
    /**
     * 主容器
     * */
    this.Container = null;
    /**
     * 關閉本窗格鈕
     * */
    this.CloseButton = null;
    /**
     * 視窗位置(有可能左上角或右上角)
     * */
    this.Location = null;
    /**
     * 視窗位置是靠左側算還是靠右側算
     * */
    this.FloatLeft = null;
    /**
     * 視窗寬度
     * */
    this.Width = null;
    /**
     * 視窗高度
     * */
    this.Height = null;
    /**
     * 位置與大小設定用CSS Class
     * */
    this.PositioningCSSClass = null;
    /**
     * 目前選項
     * */
    this.CurrentPicked = null;
    /**
     * 頁面切換用點選項目容器(HTML Table Row)
     * */
    this.PageSwitchClickRow = null;
    /**
     * 左側緩衝區寬度
     * */
    this.LeftSideSpace = null;
    /**
     * 右側緩衝區寬度
     * */
    this.RightSideSpace = null;
    /**
     * 頁面切換區的點選條ID
     * */
    this.ScrollbarID = null;
    /**
     * 手機環境下，縮到最小、還原窗格後，預設流程是要隱藏或顯示窗格BODY部分並變更窗格CSS Class以變更窗格高度
     * 除此之外還要幹嘛
     * */
    this.MobileResizeCallBack = null;
    /**
     * 關掉這個工具窗格，執行預設的那兩行CODE前要先幹嘛
     * */
    this.ProcessBeforeClose = null;
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 讀取視窗設定值
     * @param {any} OPTS Json物件記錄著視窗設定值
     */
    this.ReadOptions = function (OPTS) {
        if (!OPTS) {//NULL或undefined就離開
            return;
        }
        //位置
        if (OPTS.x && OPTS.y && (!isNaN(OPTS.x) && !isNaN(OPTS.y)) && OPTS.x > 0 && OPTS.y > 0) {
            this.X = OPTS.x;
            this.Y = OPTS.y;
        }
        //靠左還是靠右
        if (OPTS.Float && OPTS.Float.toUpperCase() == "RIGHT") {
            this.Float = "right";
        } else {
            this.Float = "left";
        }
        //寬、高
        if (OPTS.width && !isNaN(OPTS.width)) {
            this.Width = OPTS.width;
        }
        if (OPTS.height && !isNaN(OPTS.height)) {
            this.SetHeight(OPTS.height);
        }
        //位置設定的CSS Class
        if (OPTS.Class) {
            this.PositioningCSSClass = OPTS.Class;
        }
    };
    /**
     * 定義一個按鈕滑鼠移入移出以及被點一下時要做什麼事
     */
    this.SetHeaderButtonEvent = function (AppendTarget, MouseOverCallBack, MouseOutCallBack, ClickCallBack) {
        AttachEvent(AppendTarget, "mouseover", MouseOverCallBack);
        AttachEvent(AppendTarget, "mouseout", MouseOutCallBack);
        AttachEvent(AppendTarget, "click", ClickCallBack);
    };
    /**
     * 設定窗格高度
     * @param {number} NewHeight 新的高度值
     */
    this.SetHeight = function (NewHeight) {
        this.Height = NewHeight;
    };
    /**
     * 取得視窗是否可見狀態
     * */
    this.GetVisible = function () {
        return bVisible;
    };
    /**
     * 設定本視窗是否可見
     * @param {any} v 本視窗是否可見(true:是,false:否)
     */
    this.SetVisible = function (v) {
        bVisible = v;
        this.applyStyles({ display: (bVisible ? "" : "none") });
    };
    /**
     * 解構這個物件的事件
     * */
    this.Destroy = function () {
        pParent.removeChildren(this);
        this.raiseEvent("Closed");
    };
    /**
     * 設定緩衝區寬度(單位:像素)
     * @param {number} LeftSide 左側寬度
     * @param {number} RightSide 右側寬度
     */
    this.SetShuttleSpace = function (LeftSide, RightSide) {
        this.LeftSideSpace = LeftSide;
        this.RightSideSpace = RightSide;
    };
    /**
     * 建構準備點選用的HTML Table結構
     * (不是每一款視窗都會有所以用成function有需要才叫來用)
     * */
    this.BuildPageSwitcherTable = function () {
        var tbl = AttributeTable.Create(this.BodyCell.getNode(),
            { id:"tblPageSwitchHighlightUse",cellSpacing: "0", cellPadding: "0", border: "0" },
            { position: "absolute", left: "0", top: "0", width: "100%" });
        this.PageSwitchClickRow = tbl.createRow(null, { height: "50px" });
    };
    /**
     * 設定窗格內頁面切換選項
     * @param {any} PageSwitchItems
     */
    this.SetPageSwitchItems = function (PageSwitchItems) {
        this.BuildPageSwitcherTable();
        this.PageSwitchClickRow.createCell(null, null, { width: that.LeftSideSpace + "px" });
        var MiddleCell = this.PageSwitchClickRow.createCell(null, null);
        var SwitcherDIV = MiddleCell.appendObject("div",
            { class: "switch-tab" }, { margin: 0 });
        for (var i = 0; i < PageSwitchItems.length; i += 1) {
            var subDiv = SwitcherDIV.appendObject("div", { class: "switch-tab-title centering" }, { width: (100 / PageSwitchItems.length) + "%" });
            subDiv.appendText(PageSwitchItems[i].Text);
            subDiv.addEventListener("click", PageSwitchItems[i].OnClick);
        }
        SwitcherDIV.appendObject("div", { class: "scroll-bar", id: that.ScrollbarID }, null);
        this.PageSwitchClickRow.createCell(null, null, { width: that.RightSideSpace + "px" });
    };
    /**
     * 關閉本窗格事件
     * */
    this.Close = function () {
        if (this.ProcessBeforeClose) {
            this.ProcessBeforeClose();
        }
        this.Destroy();
        this.raiseEvent("Closed");
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.ReadOptions(Options);
    if (this.Float == "left") {
        if (that.PositioningCSSClass == null) {
            AttributeTable.call(this, pParent.appendObject("table",
                { class: "SG3DTool", cellSpacing: "0", cellPadding: "0", border: "0" },
                {
                    position: "absolute",
                    float: "left",
                    left: that.X + "px",
                    top: that.Y + "px",
                    width: that.Width + "px",
                    height: that.Height + "px",
                    backgroundColor: "#FFFFFF",
                    tableLayout: "fixed"
                }).getNode());
        }
        else {
            AttributeTable.call(this, pParent.appendObject("table",
                { class: "SG3DTool " + that.PositioningCSSClass, cellSpacing: "0", cellPadding: "0", border: "0" },
                {
                    backgroundColor: "#FFFFFF",
                    tableLayout: "fixed"
                }).getNode());
        }
    }
    else {
        if (that.PositioningCSSClass == null) {
            AttributeTable.call(this, pParent.appendObject("table",
                { class: "SG3DTool", cellSpacing: "0", cellPadding: "0", border: "0" },
                {
                    position: "absolute",
                    float: "right",
                    right: that.X + "px",
                    top: that.Y + "px",
                    width: that.Width + "px",
                    height: that.Height + "px",
                    backgroundColor: "#FFFFFF",
                    tableLayout: "fixed"
                }).getNode());
        }
        else {
            AttributeTable.call(this, pParent.appendObject("table",
                { class: "SG3DTool " + that.PositioningCSSClass, cellSpacing: "0", cellPadding: "0", border: "0" },
                {
                    backgroundColor: "#FFFFFF",
                    tableLayout: "fixed"
                }).getNode());
        }
        
    }
    var stlheaderWidth = { height: "36px" };
    this.HeaderRow = this.createRow(null, stlheaderWidth);
    this.HeaderCell = this.HeaderRow.createCell(null, null, SuperGIS.Windows.MergeStyle([stlheaderWidth, { width: "100%", background: "#DDECF6", "border-top-left-radius": "5px", "border-top-right-radius": "5px" }]));
    this.BodyRow = this.createRow({ class: "ToolWindowBody" }, null);
    this.BodyCell = this.BodyRow.createCell(null, null, { position: "relative", width: "100%" });
    //讓標頭可以動(電腦版(長768PX以上))
    if (window.innerWidth > 768) {
        new DragTracker(this.HeaderCell.getNode(), this.getNode());
    }
    //Icon & Label:圖示與視窗名稱(留著，底下的類別要用)
    this.IconBox = this.HeaderCell.appendElement("img", null, {
        position: "absolute"
        , left: "20px"
        , top: "8px"
        , width: "20px"
        , height: "20px"
    });
    this.LabelBox = this.HeaderCell.appendElement("label", null, {
        position: "absolute"
        , left: "42px"
        ,top:"8px"
        , fontWeight: "bold"
        , fontFamily: "Microsoft Jhenghei"
        , fontSize: "14px"
        , lineHeight: "20px"
        , letterSpacing: "0.115em"
        , color: "#344059"
    });
    //固定放一個關閉本窗格用的X在右上角,然後按了後應該可以把自己關掉
    this.CloseButton = this.HeaderCell.appendElement("img", { src: "../images/ToolWindow/x.svg" },
        { position: "absolute", right: "11px", top: "11px", width: "14px", height: "14px", cursor: "pointer" });
    AttachEvent(that.CloseButton, "click", function () {
        that.Close();
    });
    //固定放一個縮小還原鈕在上述的XX鈕的左邊，手機環境下可以縮到只剩標題帶或是還原窗格大小(電腦版環境下看不到)
    this.BoxSizeButton = this.HeaderCell.appendElement("img", { class: "BoxSizeButton", src: "../images/ToolWindow/Minimize.svg" });
    AttachEvent(that.BoxSizeButton, "click", function () {
        if ($(".SG3DTool").hasClass("GMinimizeDialogGeneral")) {
            that.BoxSizeButton.src = "../images/ToolWindow/Minimize.svg";
            $(".SG3DTool").removeClass("GMinimizeDialogGeneral");
            that.BodyRow.getNode().style.display = "";
            $(".SG3DTool").addClass(that.PositioningCSSClass);
        } else {
            that.BoxSizeButton.src = "../images/ToolWindow/ReturnSize.svg";
            $(".SG3DTool").addClass("GMinimizeDialogGeneral");
            that.BodyRow.getNode().style.display = "none";
            $(".SG3DTool").removeClass(that.PositioningCSSClass);
        }
        //看看還有沒有特別要幹嘛
        if (that.MobileResizeCallBack) {
            that.MobileResizeCallBack();
        }
    });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  上面是 Gary 新造樣板視窗的code區
//  下面是 Gary 以上面的新造樣板重新刻出來的各種功能視窗區(Part 1:坐標與定位)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 坐標與定位窗格
 * @param {any} pParent
 * @param {any} pEarth
 * @param {any} callback
 */
var GPositioningDialog = function (pParent, pEarth, callback) {
    //基於繼承，這個是一定要先call的
    ToolWindowBase.call(this, pParent, {
        Class: "GPositioningDialog"
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
     * 台電圖號座標轉換機制
     * */
    var TPC = new TaipowerCoordinateTransform();
    /**
     * 饋線編號或台電圖號座標：暫存用
     * */
    var TempValue;
    /**
     * 經緯度(定位用)
     * */
    var LngLatValue;

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
			that.getNode().style.width = "357px";
        }
    };
    /*
     * 從台電圖號座標轉換成可以定位的座標(經緯度&TWD97)
     */
    this.ExecuteFromTPCCoords = function (TPCCoord) {
        //原本專屬於下面ExecuteCoordinateTransform函數中處理圖號座標的片段，
        //饋線編號也要用
        return { WGS84: TPC.TPCPointToLngLat(TPCCoord), TWD97: TPC.TPCPointToTWD97(TPCCoord) };
    };
    /**
     * 關閉本窗格前先把定位標記掃掉
     * */
    this.ProcessBeforeClose = function () {
        if (pm != null) {
            pEarth.PlacemarkObjects.Remove(pm);
            pm = null;
        }
    };
    /**
     * 執行座標換算
     * */
    this.ExecuteCoordinateTransform = function (FeederLineCallBack) {
        if ($("#DivFeederLinePos").is(":visible")) {
            //饋線編號
            $.post("../GisMap/PositioningUsingFeeder", { FeederID: $("#iptPosFeederLine").val() }, function (ret) {
                //查詢成功時ProcessMessage裡面會放著一個圖號座標
                if (ret.ProcessFlag) {
                    var TPCCoord = ret.ProcessMessage;
                    if (FeederLineCallBack)
                        FeederLineCallBack(that.ExecuteFromTPCCoords(TPCCoord).WGS84);
                }else{
                    Swal.fire({
                        icon: "warning"
                        , title: "饋線編號錯誤"
                        , text: "請輸入正確的饋線編號"
                    });
                }
            });
        }
        else if ($("#DivTPCCoordsPos").is(":visible")) {
            //目前是在"圖號坐標"
            var Errors = TPC.TPCPointIsValid($("#iptPosTPCCoords").val());
            if (Errors!=null) {
				this.Cell24.clearChildren();
                this.Cell24.appendText("無法找到該筆圖號，請重新輸入!");
            } else {
                var res = that.ExecuteFromTPCCoords($("#iptPosTPCCoords").val());
                var ptWGS84 = res.WGS84;
                var ptTWD97 = res.TWD97;
                //不clearChildren的下場就是換算結果文字會不斷往下堆積破壞版面
                this.Cell24.clearChildren();
                this.Cell24.appendText("TWD97：" + ptTWD97.X.toFixed(0) + "," + ptTWD97.Y.toFixed(0));
                this.Cell24.appendObject("br", null, null);
                this.Cell24.appendText("WGS84：" + ptWGS84.X.toFixed(5) + "," + ptWGS84.Y.toFixed(5));
                LngLatValue = ptWGS84;
            }
        } else if ($("#DivTWD97Pos").is(":visible")) {
            var ptTWD97 = new Coords($("#iptPosTWD97X").val(), $("#iptPosTWD97Y").val());
            var ptWGS84 = TPC.TWD97ToLngLat(ptTWD97);
            var ptTPC = TPC.TWD97ToTPCPoint(ptTWD97);
            this.Cell34.clearChildren();
            this.Cell34.appendText("圖號座標：" + ptTPC);
            this.Cell34.appendObject("br", null, null);
            this.Cell34.appendText("WGS84：" + ptWGS84.X.toFixed(5) + "," + ptWGS84.Y.toFixed(5));
            LngLatValue = ptWGS84;
            //目前是在"TWD97"
        } else if ($("#DivLngLatPos").is(":visible")) {
            //目前是在"WGS84"
            var ptWGS84 = new Coords($("#iptPosLng").val(), $("#iptPosLat").val());
            var ptTPC = TPC.LngLatToTPCPoint(ptWGS84);
            var ptTWD97 = TPC.LngLatToTWD97(ptWGS84);
            this.Cell44.clearChildren();
            this.Cell44.appendText("圖號坐標：" + ptTPC);
            this.Cell44.appendObject("br", null, null);
            this.Cell44.appendText("TWD97：" + ptTWD97.X.toFixed(0) + "," + ptTWD97.Y.toFixed(0));
            LngLatValue = ptWGS84;
        }
    };
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
        if (intPositioning == i && !$("#DivFeederLinePos").is(":visible")) {
            return;
        }
        intPositioning = i;
        switch (i) {
            case 0:
                NormalHeight = "213px";
                $("#DivFeederLinePos").show();
                $("#DivTPCCoordsPos").hide();
                $("#DivTWD97Pos").hide();
                $("#DivLngLatPos").hide();
				$("#DivUDPReceiveManage").hide();
				$("#BtnGISPositioning").show();
                if (window.innerWidth > 768) {
                    $("#BtnSendPositioningCmd").show();
                }
                break;
            case 1:
                NormalHeight = "357px";
                $("#DivFeederLinePos").hide();
                $("#DivTPCCoordsPos").show();
                $("#DivTWD97Pos").hide();
                $("#DivLngLatPos").hide();
				$("#DivUDPReceiveManage").hide();
				$("#BtnGISPositioning").show();
                if (window.innerWidth > 768) {
                    $("#BtnSendPositioningCmd").show();
                }
                break;
            case 2:
                NormalHeight = "357px";
                $("#DivFeederLinePos").hide();
                $("#DivTPCCoordsPos").hide();
                $("#DivTWD97Pos").show();
                $("#DivLngLatPos").hide();
				$("#DivUDPReceiveManage").hide();
                $("#BtnSendPositioningCmd").hide();
				$("#BtnGISPositioning").show();
                break;
            case 3:
                NormalHeight = "357px";
                $("#DivFeederLinePos").hide();
                $("#DivTPCCoordsPos").hide();
                $("#DivTWD97Pos").hide();
                $("#DivLngLatPos").show();
				$("#DivUDPReceiveManage").hide();
                $("#BtnSendPositioningCmd").hide();
				$("#BtnGISPositioning").show();
                break;
			case 4:
                NormalHeight = "357px";
                $("#DivFeederLinePos").hide();
                $("#DivTPCCoordsPos").hide();
                $("#DivTWD97Pos").hide();
                $("#DivLngLatPos").hide();
				$("#DivUDPReceiveManage").show();
                $("#BtnSendPositioningCmd").hide();
				$("#BtnGISPositioning").hide();
				//載入UDP定位資訊
				UDPInfoBuild();
                break;
        }
        that.MobileResizeCallBack();
    }
    /**
     * 透過WebSocket送資料to SCADA端
     * @param {any} OutputData 要傳輸的資料
     */
    function UDPSendOut(OutputData) {
        ws.send(OutputData);
    }
	
	//////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.ScrollbarID = "PositioningBar";
    this.IconBox.src = "../images/ToolWindow/Positioning.svg";
    this.LabelBox.innerText = "坐標與定位";
    this.SetShuttleSpace(5, 5);
    this.SetPageSwitchItems([
        { Text: "饋線編號", OnClick: function () { select(0); } },
        { Text: "圖號坐標", OnClick: function () { select(1); } },
        { Text: "TWD97", OnClick: function () { select(2); } },
        { Text: "WGS84", OnClick: function () { select(3); } },
		{ Text: "UDP接收", OnClick: function () { select(4); } },
    ]);
    pm = null;
    this.BodyCell.appendObject("input", { type: "button", id: "BtnSendPositioningCmd", class: "CoordinateActionButton", value: "發送定位指令" }, null);
    this.BodyCell.appendObject("input", { type: "button", id: "BtnGISPositioning", class: "CoordinateActionButton", value: "圖台定位" }, null);
    //Bootstrap container
    //饋線編號
    var DivLine = this.BodyCell.appendObject("div", { id: "DivFeederLinePos", class: "ToolWindowOperation container-fluid" }, { height: "40px" });
    var Cell11 = DivLine.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell11.appendObject("input", { id: "iptPosFeederLine", placeholder: "請輸入饋線編號", class: "CoordinateInput" });
    //台電圖號座標
    var DivTPCCoords = this.BodyCell.appendObject("div", { id: "DivTPCCoordsPos", class: "ToolWindowOperation container-fluid" }, { height: "170px", display: "none" });
    var Cell21 = DivTPCCoords.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell21.appendObject("input", { id: "iptPosTPCCoords", placeholder: "請輸入台電圖號坐標", class: "CoordinateInput" });
    DivTPCCoords.appendObject("div", { class: "row" }, { height: "40px" });
    var Cell23 = DivTPCCoords.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell23.appendObject("hr", null, null);
    this.Cell24 = DivTPCCoords.appendObject("div", { class: "row" }, { height: "50px" }).appendObject("div", { class: "col-sm-12 CoordinateResult" }, null);
    //TWD97座標
    var DivTWD97 = this.BodyCell.appendObject("div", { id: "DivTWD97Pos", class: "ToolWindowOperation container-fluid" }, { height: "170px", display: "none" });
    var Cell31 = DivTWD97.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell31.appendObject("input", { id: "iptPosTWD97X", placeholder: "請輸入TWD97坐標(X)", class: "CoordinateInput" });
    var Cell32 = DivTWD97.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell32.appendObject("input", { id: "iptPosTWD97Y", placeholder: "請輸入TWD97坐標(Y)", class: "CoordinateInput" });
    var Cell33 = DivTWD97.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell33.appendObject("hr", null, null);
    this.Cell34 = DivTWD97.appendObject("div", { class: "row" }, { height: "50px" }).appendObject("div", { class: "col-sm-12 CoordinateResult" }, null);
    //WGS84座標(經緯度)
    var DivLngLat = this.BodyCell.appendObject("div", { id: "DivLngLatPos", class: "ToolWindowOperation container-fluid" }, { height: "170px", display: "none" });
    var Cell41 = DivLngLat.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell41.appendObject("input", { id: "iptPosLng", placeholder: "請輸入經度", class: "CoordinateInput" });
    var Cell42 = DivLngLat.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell42.appendObject("input", { id: "iptPosLat", placeholder: "請輸入緯度", class: "CoordinateInput" });
    var Cell43 = DivLngLat.appendObject("div", { class: "row" }, { height: "40px" }).appendObject("div", { class: "col-sm-12" }, null);
    Cell43.appendObject("hr", null, null);
    this.Cell44 = DivLngLat.appendObject("div", { class: "row" }, { height: "50px" }).appendObject("div", { class: "col-sm-12 CoordinateResult" }, null);
	//UDP接收管理
	var div2 = this.BodyCell.appendObject("div", { id: "DivUDPReceiveManage", class: "ToolWindowOperation container-fluid"  }, {  height: "170px", display: "none" });
    var tb = div2.appendObject("table", { class:"fixed_header" }, {width: "327px"}).appendObject("thead", null, null).appendObject("tr", null, null);
    tb.appendObject("th", { style: "width:120px" }).appendText("定位來源");
	tb.appendObject("th", { style: "width:120px" }).appendText("圖號坐標");
    tb.appendObject("th", { style: "width:87px" }).appendText("定位");
    var tbb = tb.appendObject("tbody", { id: "tb", class: "mt-2" }, {height: "230px"});
    //Button Click
    $("#BtnSendPositioningCmd").click(function () {
        that.ExecuteCoordinateTransform();
        WriteUserLog(4);
        switch (intPositioning) {
            case 0:
                TempValue = "GISUI,21,FEEDER=" + $("#iptPosFeederLine").val()+","+$("#CURRENTUSERID").text();
                UDPSendOut(TempValue);
                break;
            case 1:
                TempValue = "GISUI,11,TPC_GRID=" + $("#iptPosTPCCoords").val()+","+$("#CURRENTUSERID").text();
                UDPSendOut(TempValue);
                break;
            default:
                //DO NOTHING
                break;
        }
    });
    $("#BtnGISPositioning").click(function () {
        //圖台定位紐
        if ($("#DivFeederLinePos").is(":visible")) {
            that.ExecuteCoordinateTransform(function (LngLatValue) {
                Positioning.DoByLngLat(LngLatValue.X, LngLatValue.Y);
				/*
				//插標記前掃掉舊的標記
				if (pm != null) {
					pEarth.PlacemarkObjects.Remove(pm);
					pm = null;
				}
				//插標記
				var loc = TPC.LngLatToEPSG3857(LngLatValue);
				var mkr = new SuperGIS.Marker(pEarth, loc, "", "../map.svg");
				pm = mkr.getPlacemark();
				pm.DDDSymbol.Size = 30;
				pm.DDDSymbol.DynamicSize = false;
				*/
            });
        } else {
            that.ExecuteCoordinateTransform();
            Positioning.DoByLngLat(LngLatValue.X, LngLatValue.Y);
			/*
			//插標記前掃掉舊的標記
			if (pm != null) {
				pEarth.PlacemarkObjects.Remove(pm);
				pm = null;
			}
			//插標記
			var loc = TPC.LngLatToEPSG3857(LngLatValue);
			var mkr = new SuperGIS.Marker(pEarth, loc, "", "../map.svg");
			pm = mkr.getPlacemark();
			pm.DDDSymbol.Size = 30;
			pm.DDDSymbol.DynamicSize = false;
			*/
        }


    });
    //ws = new WebSocket("ws://" + $("#hidSCADASideIP").val());
    
    select(Supergeo.IfNull(intPositioning, 0));
};

/**
 * 管距工具窗格
 * @param {any} pParent
 * @param {any} pEarth
 * @param {any} callback
 */
var GPipeLineDistanceDialog = function (pParent, pEarth, callback) {
    //基於繼承，這個是一定要先call的
    ToolWindowBase.call(this, pParent, {
        Class: "GPipeLineDistanceDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 關閉本工具窗格時把滑鼠狀態調回到可以點地圖查詢的狀態
     * */
    this.ProcessBeforeClose = function () {
        /**
         * 滑鼠狀態應該是一個瞬間就一種而已，因此將使用列舉型態列管，到時候作用相同的b開頭變數廢掉
         * */
        _3DMouseUpDown.MouseType = ClickFor.PointQuery;
        _3DMouseUpDown.Reset();
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.IconBox.src = "../images/ToolWindow/Only3D/Distance.svg";
    this.LabelBox.innerText = "管距測量";
    this.SetShuttleSpace(6, 4);
    var MeasureTable = this.BodyCell.appendObject("table", { class: "MeasureToolBoxBody2 Only3DToolBox" }, null);
    var Row1 = MeasureTable.appendObject("tr", null, { height: "px" });
    var ReadMeBox = Row1.appendObject("td", { class: "MeasureToolReadMe" }, null);
    ReadMeBox.appendText("請依序在地圖圖面上點擊欲測量的間距的管線，將計算管線間的最短距離。");
    var Row2 = MeasureTable.appendObject("tr", null, { height: "7px" });
    Row2.appendObject("hr", null, null);
    var BtnStartMeasure = ReadMeBox.appendObject("input", {
        id: "BtnStartMeasure",
        type: "button",
        value: "測量"
    }, {
        position: "absolute",
        right: "13px",
        bottom: "6px",
        borderRadius: "5px",
        background: "#344059",
        color: "#ffffff",
        width: "92px",
        height: "36px"
    });
    var Row3 = MeasureTable.appendObject("tr", null, null);
    var MeasureDataBox = Row3.appendObject("td", { id: "tdMeasureStatus", class: "MeasureToolNumeric MeetTop" }, null);
    MeasureDataBox.appendObject("label", { id: "lblMeasureStatus" }, null);
    AttachEvent(BtnStartMeasure, "click", function () {
        _3DMouseUpDown.Reset();
        _3DMouseUpDown.MouseType = ClickFor.PipeDisting;
        $("#lblMeasureStatus").text("請點選第一條管線。");
    });
};
/**
 * 開挖工具窗格
 * @param {any} pParent
 * @param {any} pEarth
 * @param {any} callback
 */
var GGroundHoleDialog = function (pParent, pEarth, callback) {
    //基於繼承，這個是一定要先call的
    ToolWindowBase.call(this, pParent, {
        Class: "GGroundHoleDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 關閉本工具窗格時把滑鼠狀態調回到可以點地圖查詢的狀態
     * */
    this.ProcessBeforeClose = function () {
        /**
         * 滑鼠狀態應該是一個瞬間就一種而已，因此將使用列舉型態列管，到時候作用相同的b開頭變數廢掉
         * */
        _3DMouseUpDown.ClearMeasure();
        _3DMouseUpDown.MouseType = ClickFor.PointQuery;
        _3DMouseUpDown.Reset();
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.IconBox.src = "../images/ToolWindow/Only3D/Shovel.svg";
    this.LabelBox.innerText = "開挖工具";
    this.SetShuttleSpace(6, 4);
    var MeasureTable = this.BodyCell.appendObject("table", { class: "MeasureToolBoxBody2 Only3DToolBox" }, null);
    var Row1 = MeasureTable.appendObject("tr", null, { height: "81px" });
    var ReadMeBox = Row1.appendObject("td", { class: "MeasureToolReadMe" }, null);
    ReadMeBox.appendText("以滑鼠點擊地圖框出您欲開挖的範圍，雙擊後完成開挖，並顯示開挖深度下會裸露的地下設施。");
    //var Row2 = MeasureTable.appendObject("tr", null, { height: "7px" });
    //Row2.appendObject("hr", null, null);
    var Row3 = MeasureTable.appendObject("tr", null, null);
    var MeasureDataBox = Row3.appendObject("td", { class: "MeasureToolNumeric MeetTop" }, null);
    var labelDeepness = MeasureDataBox.appendObject("label", null, {
        "font-family": "Microsoft Jhenghei,Noto Sans TC"
        , "font-weight": "bold"
        , "font-size": "14px"
        , "line-height": "20px"
        , "color": "#344059"
    });
    labelDeepness.appendText("開挖深度");
    var iptDeepness = MeasureDataBox.appendObject("input", { id: "iptDeepness", type: "number", min: "0", value: "20" }, {
        width: "50px", height: "29px", border: "1px solid #C1C5DC", "border-radius": "5px", "text-align": "center", "margin-left": "5px", "margin-right": "5px"
    });
    var labelDeepness2 = MeasureDataBox.appendObject("label", null, {
        "font-family": "Microsoft Jhenghei,Noto Sans TC"
        , "font-weight": "bold"
        , "font-size": "14px"
        , "line-height": "20px"
        , "color": "#344059"
    });
    labelDeepness2.appendText("公尺");
    MeasureDataBox.appendObject("input", { type: "button", id: "BtnStartDigging", value: "開始開挖", class: "Btn3DOnlyToolButton", onclick: "_3DMouseUpDown.AddGroundHole();" },
        { right: "14px", bottom: "14px", background: "#344059", color: "#FFFFFF" });
    MeasureDataBox.appendObject("input", { type: "button", id: "BtnClearDigging", value: "清除開挖", class: "Btn3DOnlyToolButton", onclick: "_3DMouseUpDown.RemoveGroundHole();" },
        { left: "14px", bottom: "14px", background: "#FCD76E", color: "#344059", border: "none" });
    _3DMouseUpDown.MouseType = ClickFor.GroundHole;
};
/**
 * 剖面線工具窗格
 * @param {any} pParent
 * @param {any} pEarth
 * @param {any} callback
 */
var GProfileDialog = function (pParent, pEarth, callback) {
    //基於繼承，這個是一定要先call的
    ToolWindowBase.call(this, pParent, {
        Class: "GProfileDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    /**
     * 關閉本工具窗格時把滑鼠狀態調回到可以點地圖查詢的狀態
     * */
    this.ProcessBeforeClose = function () {
        /**
         * 滑鼠狀態應該是一個瞬間就一種而已，因此將使用列舉型態列管，到時候作用相同的b開頭變數廢掉
         * */
        _3DMouseUpDown.ClearMeasure();
        _3DMouseUpDown.MouseType = ClickFor.PointQuery;
        _3DMouseUpDown.Reset();
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 關閉本工具窗格時把滑鼠狀態調回到可以點地圖查詢的狀態
     * */
    this.ProcessBeforeClose = function () {
        /**
         * 滑鼠狀態應該是一個瞬間就一種而已，因此將使用列舉型態列管，到時候作用相同的b開頭變數廢掉
         * */
        _3DMouseUpDown.MouseType = ClickFor.PointQuery;
        _3DMouseUpDown.Reset();
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.IconBox.src = "../images/ToolWindow/Only3D/Pacman.svg";
    this.LabelBox.innerText = "剖面線工具";
	var MeasureTable = this.BodyCell.appendObject("table", { class: "MeasureToolBoxBody2 Only3DToolBox" }, null);
    var Row1 = MeasureTable.appendObject("tr", null, { height: "81px" });
    var ReadMeBox = Row1.appendObject("td", { class: "MeasureToolReadMe" }, null);
    ReadMeBox.appendText("點擊繪製剖面線按鈕後，於圖面上左鍵點擊一次決定起點後，滑鼠移至終點再次點擊完成設定。");
    this.BodyCell.appendObject("input", {type:"button", id: "BtnDrawProfileLine", value: "繪製剖面線", class: "Btn3DOnlyToolButton", onclick:"_3DMouseUpDown.AddProfileLine();" },
        { right: "14px", top: "59px", background: "#344059", color: "#FFFFFF" });
    this.BodyCell.appendObject("canvas", { id: "ProfileCanvas" }, {
        position: "absolute",
        left: "8px",
        bottom: "7px",
        width: "347px",
        height: "171px"
    });
    _3DMouseUpDown.DrawProfileAxis();
    AttachEvent("")
};