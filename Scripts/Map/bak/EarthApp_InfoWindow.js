/**
 * 彈出資訊窗格
 * @param {any} pParent
 * @param {any} pEarth
 * @param {any} callback
 */
var GInfoWindow = function (pParent, pEarth, callback, title, content, locationx, locationy) {
    //基於繼承，這個是一定要先call的
    ToolWindowBase.call(this, pParent, {
        Class: "GInfoWindow"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    /**
     * 視窗標題
     * */
    this.Title = null;
    this.ProcessBeforeClose = function () {
        //關閉視窗前中止timer運作
        if (tmrRefreshRealtimeData != null) {
            clearInterval(tmrRefreshRealtimeData);
        }
    };
    /**
     * 即時數據欄位名稱集合
     * */
    var RealtimeColumns = [
        { name: "設備編號", wid: "225px" },
        { name: "設備點", wid: "262px" },
        { name: "當前數值", wid: "263px" }];
    /**
     * 這筆資料的台電圖號坐標
     * */
    var Position_TPC = null;
    /**
     * 目前的即時數據資訊
     * */
    var CurrentRealtimeData = null;
    /**
     * 刷新即時數據用timer
     * */
    var tmrRefreshRealtimeData = null;
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 設定資訊顯示視窗標題
     * @param {any} TitleText 新的資訊顯示視窗標題
     */
    this.SetTitle = function (TitleText) {
        this.Title = TitleText;
        this.LabelBox.innerText = this.Title;
    };
    this.RecordMousePoint = function (EPSG3857) {
        var TCT = new TaipowerCoordinateTransform();
        Position_TPC = TCT.LngLatToTPCPoint(TCT.EPSG3857ToLngLat(new Coords(EPSG3857.X, EPSG3857.Y, 0)));
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
        //這個infowindow和其他窗格的不同點:不需要記關掉錢顯示第幾個頁籤 基於不可能預知下一次開啟顯示什麼內容
        switch (i) {
            //0:設備資訊 1:擁有者 2:即時資料 3:Error顯示(不能換到其他頁)
            case 0:
                $("#tblBasicInfo").show();
                $("#tblOwnerInfo").hide();
                $("#divRealtimeBasis").hide();
                $("#tblRealtimeInfo").hide();
                $("#divErrorInfo").hide();
                break;
            case 1:
                $("#tblBasicInfo").hide();
                $("#tblOwnerInfo").show();
                $("#divRealtimeBasis").hide();
                $("#tblRealtimeInfo").hide();
                $("#divErrorInfo").hide();
                break;
            case 2:
                $("#tblBasicInfo").hide();
                $("#tblOwnerInfo").hide();
                $("#divRealtimeBasis").show();
                $("#tblRealtimeInfo").show();
                $("#divErrorInfo").hide();
                break;
            case 3:
                $("#tblPageSwitchHighlightUse").hide();
                //↑出錯時連換頁區都要藏起來 Gary Lu 20201008
                $("#tblBasicInfo").hide();
                $("#tblOwnerInfo").hide();
                $("#divRealtimeBasis").hide();
                $("#tblRealtimeInfo").hide();
                $("#divErrorInfo").show();
                $("hr").hide();
                $("#btnSCADALocating").hide();
                break;
        }
    }
    // 回傳結果: pGeos 為 x, y, z 坐標陣列
    //			 nParts 為每個 part 的點數
    //Supplied by Leon 20201111
    function ProcessGeometryFromWKT(sWKT) {
        //Gary Lu 20201117:別的部分也要用,就拉出來到Supergeo.js裡面當成公用function來用
        return Supergeo.ProcessGeometryFromWKT(sWKT);
    }
    //更新即時數據用函數
    function LoadRealtimeData(newRealtimeData) {
        if (newRealtimeData != null && newRealtimeData.length > 0) {
            //SORT
            newRealtimeData = Supergeo.QuickSort(newRealtimeData, "unikey");
            //先比對一下新的即時數據和目前的即時數據有沒有不一樣
            var blnFound = (CurrentRealtimeData == null || (CurrentRealtimeData.length!=newRealtimeData.length));
            if (!blnFound && CurrentRealtimeData != null) {
                //目前數據不是空的,新送來的數據量和目前數據的量一樣的話,要檢查一下要不要刷
                //會run進來一定是目前數據存在,且目前數據量和新數據量一樣多(不然blnFound在這if前設成true就不會來這裡了)
                for (var i = 0; (i < newRealtimeData.length && !blnFound); i += 1) {
                    var cr = CurrentRealtimeData[i];
                    var nr = newRealtimeData[i];
                    //找到一筆數據不太一樣的就可以標示要刷新，然後出迴圈了
                    blnFound = blnFound || (cr.tpclid != nr.tpclid || cr.sitename != nr.sitename || cr.equipname != nr.equipname ||
                        cr.unikey!=nr.unikey || cr.pointname!=nr.pointname || cr.datavalue!=nr.datavalue);
                }
            }
            //CHANGE
            CurrentRealtimeData = newRealtimeData;
            if (blnFound) {
                //確定要刷新
                var dr0 = CurrentRealtimeData[0];
                //$("#lblRT_FeederID").text(dr0.FeederID);
                $("#lblRT_TPCLID").text(dr0.tpclid);
                $("#lblRT_SiteName").text(dr0.sitename);
                $("#lblRT_EquipName").text(dr0.equipname);
                trb3.clearChildren();
                for (i = 0; i < CurrentRealtimeData.length; i += 1) {
                    var dr = CurrentRealtimeData[i];
                    var tr = trb3.appendObject("tr", null, null);
                    tr.appendObject("td", { width: RealtimeColumns[0].wid }, null).appendObject("label", { class: "RealtimeValue" }, null).appendText(dr.unikey);
                    tr.appendObject("td", { width: RealtimeColumns[1].wid }, null).appendObject("label", { class: "RealtimeValue PointName", title: dr.pointname }, null).appendText(dr.pointname);
                    tr.appendObject("td", { width: RealtimeColumns[2].wid }, null).appendObject("label", { class: "RealtimeValue" }, null).appendText(dr.datavalue);
                }
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    if (locationx != null & locationy != null) {
        this.RecordMousePoint({ X: locationx, Y: locationy });
    }
    if (content.PositionInformation != null && content.PositionInformation != "") {
        var arrPoints = ProcessGeometryFromWKT(content.PositionInformation)[0].pGeoArr;
        if (arrPoints.length > 0) {
            Position_TPC = (new TaipowerCoordinateTransform().TWD97ToTPCPoint(new Coords(arrPoints[0], arrPoints[1])));
        }
    }
	if(!((content.BasicInfo == undefined || content.BasicInfo.length == 0) && (content.OwnerInfo == undefined || content.OwnerInfo.length == 0)))
	{
		if(content.BasicInfo[2].strKey == "圖號座標")
			Position_TPC = content.BasicInfo[2].objValue;
		if(content.OwnerInfo != null && content.OwnerInfo.length > 0)
			if(content.OwnerInfo[2].strKey == "圖號座標")
				Position_TPC = content.OwnerInfo[2].objValue;
	}
    this.ScrollbarID = "InfoWindowBar";
    this.SetPageSwitchItems((content.RealtimeDataTable == null || content.RealtimeDataTable.length == 0) ? [
        { Text: "設備資訊", OnClick: function () { select(0); } },
        { Text: "擁有者", OnClick: function () { select(1); } }
    ] :
        [
            { Text: "設備資訊", OnClick: function () { select(0); } },
            { Text: "擁有者", OnClick: function () { select(1); } },
            { Text: "即時資料", OnClick: function () { select(2); } }
        ]);
    this.SetShuttleSpace(6, 6);
    this.IconBox.src = "../images/ToolWindow/Feeder.svg";
    this.LabelBox.innerText = content.EquipmentClassName + "-" + (content.FeederID != null ? content.FeederID : "") + "-" + title;
    var ttable = this.BodyCell.appendObject("table", null, { position: "absolute", left: "0", top: "55px", width: "100%", height: "254px" });
    var tr1 = ttable.appendObject("tr", null, { height: "244px" });
    //基本設備資訊
    var tb1 = tr1.appendObject("table", { id: "tblBasicInfo", class: "DisplayAttribute" });
    //擁有者
    var tb2 = tr1.appendObject("table", { id: "tblOwnerInfo", class: "DisplayAttribute" });
    //即時資訊
    var div3 = tr1.appendObject("div", { id: "divRealtimeBasis" }, { position: "absolute", left: "8px", top: "0", height: "60px", width: "calc(100% - 16px)" });
    div3.appendObject("label", { class: "RealtimeBasisTitle" }, { position: "absolute", left: "10px", top: "0" }).appendText("饋線編號");
    div3.appendObject("label", { class: "RealtimeBasisTitle" }, { position: "absolute", left: "10px", top: "30px" }).appendText("圖號坐標");
    div3.appendObject("label", { class: "RealtimeBasisTitle" }, { position: "absolute", left: "330px", top: "0" }).appendText("設備主體");
    div3.appendObject("label", { class: "RealtimeBasisTitle" }, { position: "absolute", left: "330px", top: "30px" }).appendText("設備名稱");
    var tb3 = tr1.appendObject("table", { id: "tblRealtimeInfo", class: "DisplayAttribute" });
    //出錯
    var div4 = tr1.appendObject("div", { id: "divErrorInfo" }, { position: "absolute", left: "0", top: "0", width: "100%", height: "100%" });
    var tr2 = ttable.appendObject("tr", null, { height: "10px" });
    var hr = tr2.appendObject("hr");
    //SCADA定位紐樣式由ID來定
    var SCADAButton = this.BodyCell.appendObject("input", { type: "button", id: "btnSCADALocating", value: "發送定位指令" });
    AttachEvent(SCADAButton, "click", function () {
        // if (content.FeederID.length > 0) {
            ws.send("GISUI,11,TPC_GRID=" + Position_TPC);
        // }
    });
    //開始處理content
    if ((content.BasicInfo == undefined || content.BasicInfo.length == 0) && (content.OwnerInfo == undefined || content.OwnerInfo.length == 0)) {
        select(3);
        div4.appendObject("label", null, { position: "absolute", left: "345px", top: "103px", fontWeight: "bold", fontSize: "24px", lineHeight: "35px", color: "#344059" }).appendText("查無資訊");
        div4.appendObject("label", null, { position: "absolute", left: "325px", top: "195px", fontWeight: "bold", fontSize: "14px", lineHeight: "20px", color: "#344059", letterSpacing: "0.125em" }).appendText(content.DEVICENAME + "無屬性資料");
        var errconfirm = div4.appendObject("input", { type: "button", value: "確定" }, { position: "absolute", left: "316px", top: "229px", width: "160px", height: "36px", color: "#FFFFFF", background: "#344059", fontWeight: "bold", fontSize: "14px", lineHeight: "20px" });
        AttachEvent(errconfirm, "click", function () {
            that.Close();
        });
    } else {
        select(0);
        //有資料
        //原則上content.BasicInfo必定有東西,擁有者和即時數據就難說了
        for (var i = 1; i <= 9; i += 1) {
            //基本設備資料
            var tr1 = tb1.appendObject("tr", null, { height: "22px" });
            //FIGMA上顯示一直排七項資料,剩下的當緩衝
            if (i <= 7) {
                //第一直排
                if (content.BasicInfo.length >= 7 * 0 + i) {
                    tr1.appendObject("td", { class: "FieldName" }).appendText(content.BasicInfo[i - 1].strKey);
                    tr1.appendObject("td", { class: "FieldValue" }).appendText(content.BasicInfo[i - 1].objValue);
                } else {
                    tr1.appendObject("td", { class: "FieldName" });
                    tr1.appendObject("td", { class: "FieldValue" });
                }
                //第2直排
                if (content.BasicInfo.length >= 7 * 1 + i) {
                    tr1.appendObject("td", { class: "FieldName" }).appendText(content.BasicInfo[7 + i - 1].strKey);
                    tr1.appendObject("td", { class: "FieldValue" }).appendText(content.BasicInfo[7 + i - 1].objValue);
                } else {
                    tr1.appendObject("td", { class: "FieldName" });
                    tr1.appendObject("td", { class: "FieldValue" });
                }
                //放在最右邊壓縮空間
                tr1.appendObject("td", { class: "FieldName" });
            }
            //擁有者
            if (content.OwnerInfo != null && content.OwnerInfo.length > 0) {
                var tr2 = tb2.appendObject("tr", null, { height: "22px" });
                //FIGMA上顯示一直排七項資料,剩下的當緩衝
                if (i <= 7) {
                    //第一直排
                    if (content.OwnerInfo.length >= 7 * 0 + i) {
                        tr2.appendObject("td", { class: "FieldName" }).appendText(content.OwnerInfo[i - 1].strKey);
                        tr2.appendObject("td", { class: "FieldValue" }).appendText(content.OwnerInfo[i - 1].objValue);
                    } else {
                        tr2.appendObject("td", { class: "FieldName" });
                        tr2.appendObject("td", { class: "FieldValue" });
                    }
                    //第2直排
                    if (content.OwnerInfo.length >= 7 * 1 + i) {
                        tr2.appendObject("td", { class: "FieldName" }).appendText(content.OwnerInfo[7 + i - 1].strKey);
                        tr2.appendObject("td", { class: "FieldValue" }).appendText(content.OwnerInfo[7 + i - 1].objValue);
                    } else {
                        tr2.appendObject("td", { class: "FieldName" });
                        tr2.appendObject("td", { class: "FieldValue" });
                    }
                }
            }

        }
        //即時資訊顯示用架構(基於要有刷新機制，建立呈現版面的部份拉出來 Gary Lu 20201125)
        var trh3 = tb3.appendObject("thead", null, null).appendObject("tr", null, null);
        for (var i = 0; i < RealtimeColumns.length; i += 1) {
            trh3.appendObject("th", { width: RealtimeColumns[i].wid }, null)
                .appendObject("label", null, {/*Gary Lu:20201016照FIGMA樣式呈現會有欄位名稱斷行狀況，font-size&line-height先下修2px*/
                    "font-weight": "500"
                    , "font-size": "14px"
                    , "line-height": "21px"
                    , "color": "#344059"
                    , "margin-top": "4px"
                    , "margin-left": "2px"
                }).appendText(RealtimeColumns[i].name);
        }
        div3.appendObject("label", { id: "lblRT_FeederID", class: "RealtimeBasisVal" }, { position: "absolute", left: "128px", top: "0" });
        div3.appendObject("label", { id: "lblRT_TPCLID", class: "RealtimeBasisVal" }, { position: "absolute", left: "128px", top: "30px" });
        div3.appendObject("label", { id: "lblRT_SiteName", class: "RealtimeBasisVal" }, { position: "absolute", left: "435px", top: "0" });
        div3.appendObject("label", { id: "lblRT_EquipName", class: "RealtimeBasisVal" }, { position: "absolute", left: "435px", top: "30px" });
        var trb3 = tb3.appendObject("tbody", null, null);
        //即時資訊顯示
        if (content.RealtimeDataTable != null && content.RealtimeDataTable.length > 0) {
            var tpclid = content.RealtimeDataTable[0].tpclid;
            LoadRealtimeData(content.RealtimeDataTable);
            tmrRefreshRealtimeData = setInterval(function () {
                $.post("../GisMap/GetEquipmentRealtimeData", { TaipowerCoordinate: tpclid }, function (res) {
                    if (res.ProcessFlag) {
                        var ret = JSON.parse(res.ProcessMessage);
                        LoadRealtimeData(ret);
                    }
                });
            }, 5000);
            //content.RealtimeDataTable = Supergeo.QuickSort(content.RealtimeDataTable, "unikey");
            //var i;
            //var dr0 = content.RealtimeDataTable[0];
            $("#lblRT_FeederID").text(content.FeederID);
            //$("#lblRT_TPCLID").text(dr0.tpclid);
            //$("#lblRT_SiteName").text(dr0.sitename);
            //$("#lblRT_EquipName").text(dr0.equipname);
            
            //for (i = 0; i < content.RealtimeDataTable.length; i += 1) {
            //    var dr = content.RealtimeDataTable[i];
            //    var tr = trb3.appendObject("tr", null, null);
            //    tr.appendObject("td", { width: RealtimeColumns[0].wid }, null).appendObject("label", { class: "RealtimeValue" }, null).appendText(dr.unikey);
            //    tr.appendObject("td", { width: RealtimeColumns[1].wid }, null).appendObject("label", { class: "RealtimeValue PointName", title: dr.pointname }, null).appendText(dr.pointname);
            //    tr.appendObject("td", { width: RealtimeColumns[2].wid }, null).appendObject("label", { class: "RealtimeValue" }, null).appendText(dr.datavalue);
            //}
        }
    }
};
