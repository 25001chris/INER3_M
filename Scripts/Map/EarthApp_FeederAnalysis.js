/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  這是把饋線演算分析窗格獨立出來成單獨一個JS檔
//  需要使用時請先include好EarthApp.js 與 EarthApp_ToolWindow.js 以維持正常運作
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var pm_marker;
var GTopoResultDialog = function (pParent, pEarth, jsonobject, callback,fsize=10) {
    //基於繼承，這個是一定要先call的
    ToolWindowBase.call(this, pParent, {
        Class: "GTopoResultDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    /**
     * Canvas
     * */
    var cvs;
    var topo_down_x, topo_down_y;
    var bDown = false;
	var bPan = false;
    var bDown2 = false;
    var eleW = 60;
    var eleH = 36;
    var xgap = eleW / 5 * 3;
    var ygap = eleH / 5 * 3;
    var elements = {};
    var SR_3828 = EPSG.CreateSpatialReference(3828);
    var SR_3857 = EPSG.CreateSpatialReference(3857);
    var SR_4326 = EPSG.CreateSpatialReference(4326);
    var tdx, tdy;
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 覆寫關閉事件
     * */
    this.Close = function () {
        document.body.style.cursor = "default";
        //點選查詢回復
        _3DMouseUpDown.MouseType = ClickFor.PointQuery;
		if (pm_marker != null){
			earth_.PlacemarkObjects.Remove(pm_marker);
			pm_marker = null;
		}
        this.Destroy();
        this.raiseEvent("Closed");
    };
    ////自定義滑鼠事件開始////////////////////////////////////////////////////////
    $(".GTopoResultDialog").on("mousedown",function (event) {
        topo_down_x = event.offsetX;
        topo_down_y = event.offsetY;
        bDown = true;
		bPan = false;
    });
    $(".GTopoResultDialog").mousemove(function (event) {
        if (bDown) {
            var x = topo_down_x - event.offsetX + this.scrollLeft;
            var y = topo_down_y - event.offsetY + this.scrollTop;
            this.scrollTo(x, y);
			bPan = true;
        }
    });
    $(".GTopoResultDialog").mouseup(function (event) {
        bDown = false;
        if (!bPan)
            ClickElement(topo_down_x, topo_down_y);
    });
    $(".GTopoResultDialog").mouseleave(function (event) {
        bDown = false;
    });
    $(".GTopoResultDialog").scroll(function (event) {
        bPan = true;
    });
	
	$(".GTopoResultDialog").resizable({
        handles: "all"
        ,
        containment: "parent"
        ,
        resize: function (event, ui) {
            that.HeaderRow.applyStyles({ height: "36px" });
            that.BodyRow.applyStyles({ height: (ui.size.height - 36) + "px" });
        }
    });
    
    ////自定義滑鼠事件結束////////////////////////////////////////////////////////
    function NameFromFSC(fsc) {
        switch (fsc) {
            case 101:
                return "匯流排";
            case 102:
                return "電容";
            case 103:
                return "故障指示器";
            case 106:
                return "高壓導線";
            case 107:
                return "高壓用戶";
            case 108:
                return "斷路器";
            case 109:
                return "高壓跳線";
            case 110:
                return "再生能源";
            case 113:
                return "游休";
            case 114:
                return "開關";
            case 115:
                return "線路變壓器";
            case 116:
                return "終端";
            case 118:
                return "主變壓器";
            case 119:
                return "電驛";
            case 120:
                return "高壓節點";
            case 122:
                return "直接連接";
            case 130:
                return "導線交叉";
            case 131:
                return "導線變更";
            case 402:
                return "變電所";
            case 407:
                return "電桿";
            case 411:
                return "配電室";
        }
        return "";
    }
    function CheckPosition(ori) {
        for (var i in elements) {
            if (elements[i].x == ori.x && elements[i].y == ori.y) {
                ori.y += (eleH + ygap);
                CheckPosition(ori);
                return;
            }
        }
    }

    function GetPlacemarkByID(id) {
		var idstring = id.split('.');
		var fsc = idstring[0];
		var ufid = idstring[1];
		var layerlist = LayerFSClookup[fsc];
        for (var i in layerlist) {
            var layer = Layers[layerlist[i]];
            if (layer.GeoType == 0 || !layer.Visible) // 文字不查
                continue;
            var tiles = layer.GetRenderTile();
            for (var j in tiles) {
                var tile = tiles[j];
                var pms = tile.GetPlacemarks();
                for (var k in pms) {
                    var pm = pms[k];
                    if (GetValue(pm, "oid") == ufid)
                        return pm;
                }
            }
        }
        return null;
    }
    function ClickElement(x, y) {
        for (var i in elements) {
            if (x > elements[i].x && x < elements[i].x + eleW && y > elements[i].y && y < elements[i].y + eleH) {
                var ele = elements[i];
                var pt = { X: ele.mapx, Y: ele.mapy, Z: 0 };
                pt = SpatialReference.CoordinateTransform(SR_3828, SR_4326, null, pt);
                earth_.SetViewpoint(pt.X, pt.Y, 150, pCam.Yaw, 0, false);
				var pm = GetPlacemarkByID(i);
				if (pm)
				{
					if (pm_marker != null){
						earth_.PlacemarkObjects.Remove(pm_marker);
						pm_marker = null;
					}
					_3DMouseUpDown.Highlight(pm, true, 1);
					var mkr = new SuperGIS.Marker(pEarth, pm.Centroid, "", "../map.svg");
					pm_marker = mkr.getPlacemark();
					pm_marker.DDDSymbol.Size = 30;
					pm_marker.DDDSymbol.DynamicSize = false;
				}
            }
        }
    }
    function DrawHorizontalArrows(ctx, xr, y) {
        ctx.beginPath();
        ctx.moveTo(xr, y);
        var th = 6 * Math.sqrt(3) / 2;
        ctx.lineTo(xr - th, y - 3);
        ctx.lineTo(xr - th, y + 3);
        ctx.fill();
        ctx.closePath();
    }
	function MeasureSize(dv, ori, max_origin) 
	{
		if (ori.x > 32767 || ori.y > 7000)
			return;
			
		var ori_child = { x: ori.x + eleW + xgap, y: ori.y };
		for (var i = 0; i < dv.children.length; i++) {
			var child = dv.children[i];
			var fsc = child.fsc;
			var ufid = child.ufid;
			if (i == 0)
				CheckPosition(ori_child);
				
			var id = fsc.toString() + "." + ufid.toString();
			elements[id] = { x: ori_child.x, y: ori_child.y, mapx: child.x, mapy: child.y };
			
			max_origin.x = Math.max(max_origin.x, ori_child.x);
			max_origin.y = Math.max(max_origin.y, ori_child.y);
			
			MeasureSize(child, ori_child, max_origin);
			ori_child.y += (eleH + ygap);
		}
	}
    function DrawElement(dv, ori, canvas) {
		/*
        if ((canvas.width != 32767 && canvas.width - eleW < ori.x + eleW) ||
            (canvas.height != 32767 && canvas.height - eleH < ori.y + eleH)) { // 當快畫超出前
            var dummyCanvas = document.createElement('canvas');
            dummyCanvas.width = canvas.width;
            dummyCanvas.height = canvas.height;
            dummyCanvas.getContext('2d').drawImage(canvas, 0, 0);
            if (canvas.width - eleW < ori.x + eleW)
                canvas.width += canvas.width;
            if (canvas.height - eleH < ori.y + eleH)
                canvas.height += canvas.height;
            canvas.width = Math.min(32767, canvas.width);
            canvas.height = Math.min(32767, canvas.height);
            var ctx = canvas.getContext("2d");
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.font = "11.5px Arial";
            ctx.drawImage(dummyCanvas, 0, 0);
        }
		*/
		if (ori.x > canvas.width || ori.y > canvas.height)
				return;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#f2f2f2";

        var txtOffset = 0;
        var bDirected = document.getElementById("iptDrawDirectionalGraph").checked;
        var bDrawn = false;
		/*
        if (dv.dir == 1 || dv.dir == 5) {
            ctx.beginPath();
            ctx.moveTo(ori.x, ori.y);
            ctx.lineTo(ori.x + eleW / 5 * 4, ori.y);
            ctx.lineTo(ori.x + eleW, ori.y + eleH / 2);
            ctx.lineTo(ori.x + eleW / 5 * 4, ori.y + eleH);
            ctx.lineTo(ori.x, ori.y + eleH);
            ctx.lineTo(ori.x, ori.y);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            txtOffset = -3;
        }
        else if (dv.dir == 2 || dv.dir == 7) {
            ctx.beginPath();
            ctx.moveTo(ori.x + eleW / 5, ori.y);
            ctx.lineTo(ori.x + eleW, ori.y);
            ctx.lineTo(ori.x + eleW, ori.y + eleH);
            ctx.lineTo(ori.x + eleW / 5, ori.y + eleH);
            ctx.lineTo(ori.x, ori.y + eleH / 2);
            ctx.lineTo(ori.x + eleW / 5, ori.y);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            txtOffset = 3;
        }
        else {*/
            if (dv.dir == 3 || dv.dir == 4 || dv.dir == 98 || dv.dir == 99)
                ctx.setLineDash([5, 3]);
            ctx.strokeRect(ori.x, ori.y, eleW, eleH);
            ctx.fillRect(ori.x, ori.y, eleW, eleH);
            if (dv.dir == 3 || dv.dir == 4 || dv.dir == 98 || dv.dir == 99)
                ctx.setLineDash([]);
        //}
        ctx.fillStyle = "black";

        var name = NameFromFSC(dv.fsc)
        ctx.fillText(name, ori.x + eleW / 2 + txtOffset, ori.y + eleH / 3);
		if (dv.tpclid != null)
			ctx.fillText(dv.tpclid, ori.x + eleW / 2 + txtOffset, ori.y + eleH / 3 * 2 + 2);
		else
			ctx.fillText(dv.ufid, ori.x + eleW / 2 + txtOffset, ori.y + eleH / 3 * 2 + 2);

        var ori_child = { x: ori.x + eleW + xgap, y: ori.y };

        for (var i in dv.children) {
            var child = dv.children[i];
            var ufid = child.ufid;
			var fsc = child.fsc;
            if (i == 0)
                CheckPosition(ori_child); // 只有第一個需比對
            //if (elements[ufid] != null)
            //    alert("repeated ufid");
			var id = fsc.toString() + "." + ufid.toString();
            elements[id] = { x: ori_child.x, y: ori_child.y, mapx: child.x, mapy: child.y };

            ctx.beginPath();
            ctx.moveTo(ori.x + eleW, ori.y + eleH / 2);
            if (ori_child.y == ori.y)
                ctx.lineTo(ori_child.x, ori_child.y + eleH / 2);
            else {
                ctx.lineTo(ori_child.x - xgap / 3 * 2, ori.y + eleH / 2);
                ctx.lineTo(ori_child.x - xgap / 3, ori_child.y + eleH / 2);
                ctx.lineTo(ori_child.x, ori_child.y + eleH / 2);
            }
            ctx.stroke();
            ctx.closePath();
            if (bDirected)
                DrawHorizontalArrows(ctx, ori_child.x, ori_child.y + eleH / 2);

            DrawElement(dv.children[i], ori_child, canvas);
            ori_child.y += (eleH + ygap);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    this.LabelBox.innerText = "饋線演算分析結果";
    this.ScrollbarID = "TopoResultDialog";
    this.IconBox.src = "../images/ToolWindow/Feeder.svg";
    this.BodyCell.applyAttributes({ id: "tdTopoCanvasContainer" });
    this.BodyCell.applyStyles({ resizable: true, position: "relative", overflow: "auto", width: "500px", height: "320px", maxWidth: "500px", maxHeight: "320px" });
    this.BodyCell.appendObject("canvas", { id: "TopoCanvas" }, { position: "absolute", left: "0", top: "0" });

    if (!jsonobject)
        return;
	
    //json物件傳進來後的處理
	var fs = fsize; // 帶入設定文字尺寸
	fs = Math.min(Math.max(fs, 8), 20);
	eleW = 70 * (fs / 10);
	eleH = 36 * (fs / 10);
	xgap = eleW / 5 * 3;
	ygap = eleH / 5 * 3;
	
	elements = {};
	var start = { x: 1, y: 10, mapx: jsonobject.x, mapy: jsonobject.y };
	var id = jsonobject.fsc.toString() + "." + jsonobject.ufid.toString();
	elements[id] = start;
	// 預算所需尺寸
	var max_origin = { x: start.x, y: start.y };
	MeasureSize(jsonobject, start, max_origin);
	max_origin.x += eleW + 1;
	max_origin.y += eleH + 1;

	elements = {};
	elements[id] = start;
    var canvas = document.getElementById("TopoCanvas");
    var ctx = canvas.getContext("2d");
	// 建立 HD 的 Canvas
	{
		let ratio = window.devicePixelRatio;
		var w = max_origin.x;
		var h = max_origin.y;
		canvas.width = Math.min(w * ratio, 32767);
		canvas.height = Math.min(h * ratio, 7000);
		canvas.style.width = canvas.width / ratio + "px";
		canvas.style.height = canvas.height / ratio + "px";
		ctx.scale(ratio, ratio);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = fs + "px Arial";
	
    DrawElement(jsonobject, start, canvas);
    //pEarth.addEventListener("mouseup", LocalMouseUp, false, true);
    //pEarth.addEventListener("mousedown", LocalMouseDown, false, true);
    //pEarth.addEventListener("mousemove", LocalMouseMove, false, true);
    //pEarth.addEventListener("mouseleave", LocalMouseLeave, false, true);
    $("#tdTopoCanvasContainer").mousedown(function (event) {
        tdx = event.offsetX;
        tdy = event.offsetY;
        bDown2 = true;
    });
    $("#tdTopoCanvasContainer").mousemove(function (event) {
        if (bDown2) {
            var x = tdx - event.offsetX + this.scrollLeft;
            var y = tdy - event.offsetY + this.scrollTop;
            this.scrollTo(x, y);
        }
    });
    $("#tdTopoCanvasContainer").mouseup(function () {
        bDown2 = false;
    });
};
/**
 * 饋線演算分析窗格
 * @param {any} pParent
 * @param {any} pEarth
 * @param {any} callback
 */
var GFeederLineAnalysisDialog = function (pParent, pEarth, callback) {
    //基於繼承，這個是一定要先call的
    ToolWindowBase.call(this, pParent, {
        Class: "GFeederAnalysisDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    /**
     * 設備類別與關係對照表
     * */
    this.EquipClass_Properties = [
        {
            classname: "高壓用戶", tablename: "hicustomer", props: [
                { propname: "容量", propfield: "hicucapacity" }
            ]
        }, {
            classname: "再生能源用戶", tablename: "distributedcustomer", props: [
                { propname: "容量(KWP)", propfield: "capacities" }
            ]
        }, {
            classname: "再生能源能量", tablename: "distributedenergy", props: [
                { propname: "容量(KWP)", propfield: "capacities" }
            ]
        }, {
            classname: "線路變壓器", tablename: "sxfmr", props: [
                { propname: "指定相別容量", propfield: "sxfmrcapacity" },
                { propname:"用戶數" }
            ]
        }, {
            classname: "主變壓器", tablename: "distributedenergy", props: [
                { propname: "容量", propfield: "mxfmrcapacity" }
            ]
        }, {
            classname: "開關", tablename: "switch", props: [
                { propname: "指定種類數目", propfield: "switchtype" }
            ]
        }
    ];
    var down_x;
    var down_y;
    var TopologyGraphWindow = null;
    var ani_pms = [];
    var ani_interval = null
    var ani_playidx = 0;
    var pmStart = null;
    var pmEnds = []; // 終點多個
    var bMakePipe = false;
    var PolyPoints = [];
    var queryResults = [];
    var Pipes = [];
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 覆寫關閉事件
     * */
    this.Close = function () {
        CloseFeederAni();
        document.body.style.cursor = "default";
        //點選查詢回復
        _3DMouseUpDown.MouseType = ClickFor.PointQuery;

        pEarth.removeEventListener("mousedown", funcMouseDown, false, true);
		if (pm_marker != null){
			earth_.PlacemarkObjects.Remove(pm_marker);
			pm_marker = null;
		}
        if (TopologyGraphWindow != null) {
            TopologyGraphWindow.Close();
        }
        this.Destroy();
        this.raiseEvent("Closed");
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
		that.getNode().style.zIndex = "32767";
        switchDiv(i);
    }
    /**
     * 切換頁面
     * @param {any} i 頁面索引
     */
    function switchDiv(i) {
        intFeederLine = i;
        if (i == 0) {
            WriteUserLog(7);
            that.getNode().style.height = "380px";
            //拓樸圖形演算:主頁面框與"繪製有向圖"勾選框的容器
            $("#divTopologyAnimation").show();
            $("#divDrawGraphCHKBOX").show();
            //連結性演算動畫:主頁面框與再次播放紐
            $("#divConnectionAnimation").hide();
            $("#btnPlayAnimationAgain").hide();
        }
        else {
            WriteUserLog(8);
            that.getNode().style.height = "637px";
            $("#divTopologyAnimation").hide();
            $("#divDrawGraphCHKBOX").hide();
            $("#divConnectionAnimation").show();
            $("#btnPlayAnimationAgain").show();
        }
    }
    /*************************
     * 拓樸主要流程函數區域起始點 
     * ***********************/
    /* Leon大範例站台的MouseType為整數紀錄區別用途,Gary在此改MouseType併入ClickFor列舉型別內(參EarthApp_3DEvents.js最上緣)
     *                MouseUp函數內多if-else-if-else....在此將改成switch結合ClickFor列舉型別較易辨識
     *                文字方塊填值方式使用jQuery語法
     *                呼叫後台函數方式:XMLHttpRequest全廢改用jQuery式
     * 另外由於圖台上面兩條選單在壓高度，取滑鼠所在Y值要小心
     */

    function FeederTopo_Click1() {
        _3DMouseUpDown.MouseType = ClickFor.PickTopology;
    }
    function funcMouseDown(tEvent) {
        down_x = tEvent.x;
        down_y = tEvent.offsetY;
        pEarth.addEventListener("mouseup", funcMouseUp, false, true);
    }
    function GeodeticFromDevice(x, y) {
        var pScene = earth_.GetScene();
        var pGlobe = earth_.GetGlobe();
        var pPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
        var CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(pPosition), 1, false);
        var globeLoc = pGlobe.GeodeticFromCartesian2(CurLocation);
        return globeLoc;
    }
    function AddMarker(screenX, screenY, bStart) {
        var loc = GeodeticFromDevice(screenX, screenY);
        var xy = CircleToPolygon(loc[0], loc[1], 8);
        var wkt = "POLYGON((";
        for (var i in xy) {
            wkt += xy[i][0].toString() + ' ';
            wkt += xy[i][1].toString();
            if (i != xy.length - 1)
                wkt += ','
        }
        wkt += "))";
        var marker = earth_.CreatePlacemark("", wkt);
        var color = bStart ? earth_.CreateColor(1, 0.98, 0.4, 1) : earth_.CreateColor(0.35, 0.6, 0.6, 1);
        marker.DDDSymbol = earth_.CreateSimpleDDDFillSymbol(earth_.CreateModelMaterial(0, color), null);
        marker.ReplaceZ = 0.6;
        earth_.PlacemarkObjects.Add(marker);
        return marker;
    }
    function funcMouseUp(tEvent) {
        pEarth.removeEventListener("mouseup", funcMouseUp, false, true);
        if (tEvent.x != down_x || tEvent.offsetY != down_y)
            return;
        switch (_3DMouseUpDown.MouseType) {
            case ClickFor.PointQuery:
                //單點查詢沒事
                break;
            case ClickFor.PolygonSelect:
                //框選查詢沒事
                break;
            case ClickFor.PickTopology:
                //拓樸圖形結構演算
                var pm = _3DMouseUpDown.PickPlacemark(down_x, down_y);
                //var elem = document.getElementById("FeederCode");
                if (!pm) {
                    $("#iptFeederID_Analysis").val("");
                    //elem.value = "";
                    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
                    return;
                }
                var tid = GetValue(pm, "tid");
                var oid = GetValue(pm, "oid");

                //照點選查詢的流程辦理，但對於取回的資料，饋線編號以外全都不要了
                $.post("../GisMap/GetInfoWindowData", { TID: tid, OID: oid }, function (EI) {
                    console.log(EI);
                    if (EI.ProcessFlag == true) {
                        var obj = JSON.parse(EI.ProcessMessage);
                        $("#iptFeederID_Analysis").val(obj.FeederID);
                        $("#iptStatusCal").val(obj.FeederID);
                    }
                    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
                });
                break;
            case ClickFor.FeederLineRangeSelect://動畫 饋線範圍點選
            case ClickFor.StartPointSelect://動畫 起始節點點選
            case ClickFor.EndPointSelect://動畫 終止節點點選
            case ClickFor.TestCircuitChangeDirect://測試電流變向
                var pm = _3DMouseUpDown.PickPlacemark(down_x, down_y);
                var elem;
                switch (_3DMouseUpDown.MouseType) {
                    case ClickFor.FeederLineRangeSelect://動畫 饋線範圍點選
                        elem = document.getElementById("iptFeederLineRange");
                        break;
                    case ClickFor.StartPointSelect://動畫 起始節點點選
                        elem = document.getElementById("iptFeederLineStartNode");
                        if (pmStart)
                            RemoveMarker(pmStart);
                        if (pm)
                            pmStart = AddMarker(tEvent.x, tEvent.offsetY, true);
                        break;
                    case ClickFor.EndPointSelect://動畫 終止節點點選
                        elem = document.getElementById("iptFeederLineEndNode");
                        if (pm)
                            pmEnds.push(AddMarker(tEvent.x, tEvent.offsetY, false));
                        break;
                }
                if (!pm) {
                    elem.value = "";
                    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
                    return;
                }

                var tid = GetValue(pm, "tid");
				var oid = GetValue(pm, "oid");

                $.post("../GisMap/GetInfoWindowData", { TID: tid, OID: oid }, function (EI) {
                    console.log(EI);
                    if (EI.ProcessFlag == true) {
                        var obj = JSON.parse(EI.ProcessMessage);
                        //$("#iptFeederID_Analysis").val(obj.FeederID);
                        var rt = " " + obj.FeederID + " ";
                        rt = rt.slice(1, rt.length - 1);
                        if (_3DMouseUpDown.MouseType != ClickFor.FeederLineRangeSelect)
                            rt += " " + oid.toString();

                        elem.value = rt;
                        if (_3DMouseUpDown.MouseType == ClickFor.FeederLineRangeSelect) // 饋線範圍直接加入 list
                        { FeederAni_Add1(); }
                        else if (_3DMouseUpDown.MouseType == ClickFor.EndPointSelect) // 終點直接加入 list
                        { FeederAni_Add2(); }
                    }
                    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
                });
                //var url = host_url + "FeederAnalysis/FeederCodeFromIDs/" + tid + "/" + oid;
                //var xmlHttp = new XMLHttpRequest();
                //xmlHttp.open("GET", url, false); // false for synchronous request
                //xmlHttp.send(null);
                //var rt = xmlHttp.responseText;
                //rt = rt.slice(1, rt.length - 1);
                //if (MouseType >= 4)
                //    rt += " " + oid.toString();

                //elem.value = rt;
                //if (MouseType == 3) // 饋線範圍直接加入 list
                //    FeederAni_Add1();
                //else if (MouseType == 5) // 終點直接加入 list
                //    FeederAni_Add2();

                //_3DMouseUpDown.MouseType = ClickFor.PointQuery;
                break;
        }
    }
    function RemoveMarker(pm) {
        earth_.PlacemarkObjects.Remove(pm);
    }
    function CheckDeviceDisplay(dv) {
        for (var i = 0; i < dv.children.length; i++) {
            var child = dv.children[i];

            var check = document.getElementById("chkEquip" + child.fsc.toString()).checked;
            if (!check) {
                for (var j in child.children)
                    dv.children.push(child.children[j]);
                dv.children.splice(i--, 1);
                continue;
            }
        }

        for (var i = 0; i < dv.children.length; i++) {
            var child = dv.children[i];
            CheckDeviceDisplay(child);
        }
    }
    function CircleToPolygon(cx, cy, radius) {
        var length = radius;
        var N = 30;
        var xy = [];
        var CV_PI = 2 * Math.PI / N;
        for (var i = 0; i < N; i++) {
            var x = cx + length * Math.cos(i * CV_PI);
            var y = cy + length * Math.sin(i * CV_PI);
            xy.push([x, y]);
        }
        return xy;
    }
    function StartAnalysis() {
        var $btnFeederCalculation = document.getElementById("btnFeederCalculation")
        var code = $("#iptFeederID_Analysis").val();//document.getElementById("FeederCode").value;
        $btnFeederCalculation.disabled = true;
        //var url = host_url + "FeederAnalysis/TopoByFeeder/" + code;
        if (!code){
            Swal.fire({
                icon: "warning",
                title: "無法進行查詢",
                text:"請輸入饋線編號"
            }).then(function(r){
                if(r.value)
                    $btnFeederCalculation.disabled = false;
            })
            ajaxStop();
            return;
        }else{
            ajaxStart();
        }

        $.when($.get("../../FeederAnalysis/TopoByFeeder/" + code, null)).then(function(str){
            var rt = str;
            if (!rt || rt.length == 0){
                Swal.fire({
                    icon: "warning",
                    title: "饋線編號錯誤",
                    text: "請輸入正確的饋線編號"
                }).then(function(r){
                    if(r.value)
                        $btnFeederCalculation.disabled = false;
                })
                ajaxStop();
                return;
            }else{
                return rt;
            }
        }).done(function(rt){
            $btnFeederCalculation.disabled = false;    
            //var dv = rt;
			var dv_list = rt;
			var dv = dv_list[0];
			GenerateChildren(dv, dv_list);
            while (1) {
                var check = document.getElementById("chkEquip" + dv.fsc.toString()).checked;
                if (!check) {
                    if (dv.children.length > 0)
                        dv = dv.children[0];
                    else {
                        dv = null;
                        break;
                    }
                }
                else
                    break;
            }
            if (dv){
                CheckDeviceDisplay(dv);
                //DrawTopoResult(dv);
                if (TopologyGraphWindow != null) {
                    TopologyGraphWindow.Close();
                }
                TopologyGraphWindow = new GTopoResultDialog(pParent, pEarth, dv, callback, $("#iptFeederShowFontSize").val());
                TopologyGraphWindow.addEventListener("Closed", function () { TopologyGraphWindow = null; });
                ajaxStop();
            }else{
                Swal.fire({
                    icon: "warning",
                    title: "無法進行查詢",
                    text: "請勾選設備項目"
                }).then(function (r) {
                    if (r.value){
                        return;
                    }
                })
                ajaxStop();
            }
                


        });
    }
    function FeederAni_Click1() {
        _3DMouseUpDown.MouseType = ClickFor.FeederLineRangeSelect;
    }
    function FeederAni_Add1() {
        var txt = document.getElementById("iptFeederLineRange").value;
        if (txt == "")
            return;
        // 檢查有無重複
        var repeated = false;
        $("#ulFeederLineRange").find("li").each(function () {
            if (repeated) {
                return;
            }
            if ($(this).attr("targetval") == txt) {
                repeated = true;
            }
        });
        if (repeated) {
            return;
        }
        $("#ulFeederLineRange").append("<li targetval='" + txt + "'>" + txt + "<span style='right:0;width:20px;height:20px;'><img onclick='FeederAni_Del1();' class='topology_removeitem' src='./images/ToolWindow/Topology/RubbishBin.svg' style='display:none;' /></span></option>");
        //事件重綁
        RebindEvents();
        $("#ulFeederLineRange").find("li").find("span").find("img").click(function () {
            var ti = null;
            for (var i = 0;(ti==null && i < $("#ulFeederLineRange").find("li").length); i += 1) {
                if ($("#ulFeederLineRange").find("li")[i] == $(this).parent().parent()[0]) {
                    ti = i;
                }
            }
            FeederAni_Del1(ti);
        });
    }
    function RebindEvents() {
        //事件重新綁定
        $(".NodeFeederBox").unbind("hover");
        $(".NodeFeederBox").hover(function (e) {
            $(".topology_removeitem").hide();
            $(e.target).find(".topology_removeitem").show();
        });
    }
    function FeederAni_Del1(ti) {
        if (ti == null) {
            return;
        }
        var select = document.getElementById("ulFeederLineRange");
        select.removeChild(select.childNodes[ti]);
        RebindEvents();
    }
    function FeederAni_Click2() {
        _3DMouseUpDown.MouseType = ClickFor.StartPointSelect;
    }
    function FeederAni_Click3() {
        _3DMouseUpDown.MouseType = ClickFor.EndPointSelect;
    }
    function FeederAni_Add2() {
        var txt = document.getElementById("iptFeederLineEndNode").value;
        if (txt == "")
            return;
        // 檢查有無重複
        var repeated = false;
        $("#ulFeederEndNode").find("li").each(function () {
            if (repeated) {
                return;
            }
            if ($(this).attr("targetval") == txt) {
                repeated = true;
            }
        });
        if (repeated) {
            return;
        }
        $("#ulFeederEndNode").append("<li targetval='" + txt + "'>" + txt + "<span style='right:0;width:20px;height:20px;'><img class='topology_removeitem' src='./images/ToolWindow/Topology/Rubbishbin.svg'></span></li>");

        //var opts = document.getElementById("ulFeederEndNode").options;
        //for (var i = 0; i < opts.length; i++) {
        //    if (txt == opts[i].value)
        //        return;
        //}
        //opts[opts.length] = new Option(txt);
        RebindEvents();
        $("#ulFeederEndNode").find("li").find("span").find("img").click(function () {
            var ti = null;
            for (var i = 0; (ti == null && i < $("#ulFeederEndNode").find("li").length); i += 1) {
                if ($("#ulFeederEndNode").find("li")[i] == $(this).parent().parent()[0]) {
                    ti = i;
                }
            }
            FeederAni_Del2(ti);
        });
    }
    function FeederAni_Del2(sel) {
        if (sel == null) {
            return;
        }
        var select = document.getElementById("ulFeederEndNode");
        select.removeChild(select.childNodes[sel]);
        RemoveMarker(pmEnds[sel]);
        pmEnds.splice(sel, 1);
        RebindEvents();
    }
    function CloseFeederAni() {
        RemoveMarker(pmStart);
        for (var i in pmEnds)
            RemoveMarker(pmEnds[i]);
        for (var i in ani_pms) {
            var pm = ani_pms[i];
            var clr = GetValue(pm, "symcolor");
            var rgb = HexToRGB(clr);
            _3DMouseUpDown.Highlight(pm, false, 0, rgb);
        }
        ani_pms = [];
    }
	function GenerateChildren(dv, dv_list)
	{
		for (var i in dv.children)
		{
			var idx = dv.children[i];
			var child = dv_list[idx];
			dv.children[i] = child;
			
			GenerateChildren(child, dv_list);
		}
	}
    function FeederAni_Calculate() {
        //Gary Lu 20201105:原本的select改成unordered list(基於各個子項目內要放垃圾桶圖刪除紐)
        //
        //var opts = document.getElementById("ulFeederLineRange").childNodes;
		ajaxStart();
        var feeder_range = [];

        $("#ulFeederLineRange").find("li").each(function () {
            feeder_range.push($(this).attr("targetval"));
        });
        //for (var i = 0; i < opts.length; i++)
        //    feeder_range.push(opts[i].value);

        var txt = document.getElementById("iptFeederLineStartNode").value;
        var start_ufid = txt.split(" ")[1];
        //opts = document.getElementById("ulFeederEndNode").options;
        var end_ufids = [];
        var errorText = "";
        $("#ulFeederEndNode").find("li").each(function () {
            end_ufids.push($(this).attr("targetval").split(" ")[1]);
        });
        //for (var i = 0; i < opts.length; i++)
        //    end_ufids.push(opts[i].value.split(" ")[1]);
        
        if (!start_ufid || end_ufids.length == 0 || feeder_range.length == 0) {
            errorText = feeder_range.length == 0 ? '饋線' : '節點'
            Swal.fire({
                icon: "warning",
                title: "無法進行查詢",
                text: `請輸入${errorText}範圍`
            }).then(function (r) {
                if (r.value){
                    return;
                }
            })
            ajaxStop();
        }
        var ranges = "";
        for (var i in feeder_range)
            ranges += feeder_range[i] + ';';
        if (ranges == "")
            return;

        var ufids = "";
        for (var i in end_ufids)
            ufids += end_ufids[i] + ';';

        var dir = 0;
        if ($("#rdoCalcDirection1").attr("src").toUpperCase().endsWith("RDOCHECKED.SVG"))
            dir = 2;
        else if ($("#rdoCalcDirection2").attr("src").toUpperCase().endsWith("RDOCHECKED.SVG"))
            dir = 1;

        var _class = document.getElementById("selEquipClass").value;
        var _att = document.getElementById("selEquipProperty").value;
		var _condition = document.getElementById("iptAnimationAttribute").value;
		if(_condition)
			_att = _att + "(" + _condition + ")";

        var url = "../../FeederAnalysis/TopoByUFID/" + start_ufid.toString() + "/" +
            ufids + "/" + dir.toString() + "/" + ranges + "/" + _class + "/" + _att;
        $.when($.get(url, null)).done(function(returnval){
            var rt = returnval;
            if (rt == null)
                return;

            var result = returnval;
            var dv = result.dv_list[0];
            if (dv == null) {
                //document.getElementById("StatsResult").textContent = "搜尋無法滿足終止條件,請重新設定。";
                Swal.fire({
                    icon: "warning",
                    title: "連結性演算動畫",
                    text:"搜尋無法滿足終止條件,請重新設定。"
                });
                return;
            }

            // 調整順序, 使從起點播放 (下游本身就是)
            if (dir == 0) // 無向
            {
            }
            else // 上游
            {
            }

			GenerateChildren(dv, result.dv_list);
            var pms = [];
            pms = pms.concat(LineData.GetRenderFeatures());
			pms = pms.concat(LineData1.GetRenderFeatures());
            pms = pms.concat(IconData.GetPlacemarks());
            ani_pms = [];

            CollectAniPlacemarks(dv, pms);

            if (dir == 2) // 上游, 調整播放順序, 使從起點開始
                ani_pms = ani_pms.reverse();
            else if (dir == 0) // 無向, 先播下游, 再播上游
            {
                var ups = null;
                for (var i = 0; i < ani_pms.length; i++) {
                    if (GetValue(ani_pms[i], "oid") == start_ufid) {
                        // 截斷上游
                        ups = ani_pms.splice(0, i);
                        ups = ups.reverse();
                        break;
                    }
                }
                if (ups != null)
                    ani_pms = ani_pms.concat(ups);
            }

            // 統計結果
            var msg = "運算範圍內的【" + $("#selEquipClass").val() + "】共 " + result.dvCount.toString() + " 具, 【" + $("#selEquipProperty").val()+"】加總為 " + result.attSum.toString() + ".";
            $("div#divStatisticsResult").html(msg);
            //Swal.fire({
            //    icon: "info", title: "連結性演算動畫", text: msg
            //});
            //document.getElementById("StatsResult").textContent = msg;
			ajaxStop();
            PlayAni();
        }).fail(function(err){
            console.log(err.status)
            Swal.fire({
                icon: "warning",
                title: "無法進行查詢",
                text: "錯誤代碼:"+err.status
            }).then(function (r) {
                if (r.value){
                    return;
                }
            })
            ajaxStop();
        })
    }
    function CollectAniPlacemarks(dv, pms) {
        for (var i in pms) {
            if (GetValue(pms[i], "oid") == dv.ufid && GetValue(pms[i], "tid") == dv.fsc) {
                ani_pms.push(pms[i]);
                //break;
            }
        }

        for (var i in dv.children)
            CollectAniPlacemarks(dv.children[i], pms);
    }


    function FeederAni_Replay() {
        for (var i in ani_pms) {
            var pm = ani_pms[i];
            var clr = GetValue(pm, "symcolor");
            var rgb = HexToRGB(clr);
            _3DMouseUpDown.Highlight(pm, false, 0, rgb);
        }
        PlayAni();
    }

    function PlayAni() {
        //這個input已經被限定只能輸入數字了
        var ms = $("#iptAnimationInterval").val();//parseInt(document.getElementById("FeederAni_Txt4").value);

        ani_playidx = 0;
        ani_interval = setInterval(function () {
            if (ani_playidx != ani_pms.length) {
                var pm = ani_pms[ani_playidx++];
                _3DMouseUpDown.Highlight(pm, false, ms / 1000, [1, 1, 0]);				
				if (ani_playidx != ani_pms.length)
					{
						var nextpm = ani_pms[ani_playidx++];
						if (GetValue(nextpm, "oid") == GetValue(pm, "oid"))
							_3DMouseUpDown.Highlight(nextpm, false, ms / 1000, [1, 1, 0]);
						else
							ani_playidx--;
					}
            }
            else
                clearInterval(ani_interval);
        }, ms);
    }


    function SetDirectionRDO(val) {
        for (var i = 1; i <= 3; i += 1) {
            $("#rdoCalcDirection" + i).prop("src", (val == i ? "../images/ToolWindow/Topology/RdoChecked.svg" :"../images/ToolWindow/Topology/RdoNonChecked.svg"))
        }
    }
    /*************************************** 
     * 拓樸主要流程AND連結性演算動畫相關函數終點
     * ************************************/
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //暫時關閉點選查詢指令
    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
    this.ScrollbarID = "FeederLineAnalysisDialog";
    this.IconBox.src = "../images/ToolWindow/Feeder.svg";
    this.LabelBox.innerText = "饋線演算分析";
    this.SetShuttleSpace(10, 10);
    this.SetPageSwitchItems([
        { Text: "拓樸圖形結構演算", OnClick: function () { select(0); } },
        { Text: "連結性演算動畫", OnClick: function () { select(1); } }
    ]);
    //拓樸圖形演算
    var div1 = this.BodyCell.appendObject("div", { id: "divTopologyAnimation" }, null);
    div1.appendObject("label", null, {
        position: "absolute", left: "5px", top: "5px",
        "font-size": "14px", "line-height": "20px", "letter-spacing": "0.125em", color: "#484848", "font-weight": "normal"
    }).appendText("左鍵點擊饋線或輸入饋線編號");
    div1.appendObject("input", { id: "iptFeederID_Analysis", type: "text" });
    var btnPickFeederNo = div1.appendObject("input", { id: "btnPickFeederNo", type: "button", class: "PointerButton", onclick: "" }, { right: "8px", top: "31px" });
    AttachEvent(btnPickFeederNo, "click", function () {
        FeederTopo_Click1();
    });
    var ul11 = div1.appendObject("ul", { id: "ulTopologyEquipmentClasses" }, null);
    for (var i0 = 0; i0 < ToolWindowBarControl.TopologyEquipmentClasses.length; i0 += 1) {
        var eqp = ToolWindowBarControl.TopologyEquipmentClasses[i0];
        var li = ul11.appendObject("li", null, null);
        li.appendObject("input", { type: "checkbox", id: "chkEquip" + eqp.fsc, value: eqp.fsc, checked: (eqp.fsc == 108 || eqp.fsc == 114) });
        li.appendText(eqp.devicename);
    }
    var div11 = this.BodyCell.appendObject("table", { id: "divDrawGraphCHKBOX" }, { position: "absolute", left: "0", bottom: "0", width: "150px", height: "70px" });
    div11.appendObject("label", null, { position: "absolute", left: "24px", bottom: "40px" }).appendText("字型大小(8-12):");
    div11.appendObject("input", { id: "iptFeederShowFontSize", type: "number", min: 8, max: 12, value: 10 }, { position: "absolute", right: "-114px", bottom: "46px" });
    div11.appendObject("input", { id: "iptDrawDirectionalGraph", type: "checkbox" }, { position: "absolute", left: "24px", bottom: "21px" });
    div11.appendObject("label", null, { position: "absolute", left: "42px", bottom: "10px" }).appendText("繪製有向圖");
    ////連結性演算
    var div2 = this.BodyCell.appendObject("table", { id: "divConnectionAnimation" }, { display: "none", tableLayout: "fixed" });
    var td1 = div2.appendObject("tr", null, { height: "110px" }).appendObject("td", null, null);
    td1.appendObject("label", null, { "letter-spacing": "0.125em", position: "absolute", left: "14px", top: "5px" }).appendText("饋線範圍");
    td1.appendObject("input", { id: "iptFeederLineRange", class: "NodeFeederInput", type: "text" }, { top: "0" });
    td1.appendObject("ul", { id: "ulFeederLineRange", class: "NodeFeederBox", size: "3" }, { top: "38px" });
    var btnAddFeederRange = td1.appendObject("input", { id: "btnAddFeederRange", type: "button", class: "AddObjectButton" }, { right: "8px", top: "8px" });
    AttachEvent(btnAddFeederRange, "click", function () {
        FeederAni_Add1();
    });
    var btnPickFeederRange = td1.appendObject("input", { id: "btnPickFeederRange", type: "button", class: "PointerButton" }, { right: "36px", top: "8px" });
    AttachEvent(btnPickFeederRange, "click", function () {
        FeederAni_Click1();
    });
    var td2 = div2.appendObject("tr", null, { height: "152px" }).appendObject("td", null, null);
    td2.appendObject("img", { src: "../images/ToolWindow/Topology/StartNode.svg" }, { position: "absolute", left: "9px", top: "10px" });
    td2.appendObject("label", null, { position: "absolute", left: "35px", top: "10px", "letter-spacing": "0.125em" }).appendText("起始節點");
    td2.appendObject("input", { id: "iptFeederLineStartNode", class: "NodeFeederInput", type: "text" }, { top: "3px" });
    var btnPickFeederLineStartNode = td2.appendObject("input", { id: "btnPickFeederLineStartNode", type: "button", class: "PointerButton" }, { right: "8px", top: "8px" });
    AttachEvent(btnPickFeederLineStartNode, "click", function () {
        FeederAni_Click2();
    });
    td2.appendObject("img", { src: "../images/ToolWindow/Topology/EndNode.svg" }, { position: "absolute", left: "9px", top: "49px" });
    td2.appendObject("label", null, { position: "absolute", left: "35px", top: "48px", "letter-spacing": "0.125em" }).appendText("終止節點");
    td2.appendObject("input", { id: "iptFeederLineEndNode", class: "NodeFeederInput", type: "text" }, { top: "40px" });
    var btnAddFeederLineEndNode = td2.appendObject("input", { id: "btnAddFeederLineEndNode", type: "button", class: "AddObjectButton" }, { right: "8px", top: "48px" });
    AttachEvent(btnAddFeederLineEndNode, "click", function () {
        FeederAni_Add2();
    });
    var btnPickFeederLineEndNode = td2.appendObject("input", { id: "btnPickFeederLineEndNode", type: "button", class: "PointerButton" }, { right: "36px", top: "48px" });
    AttachEvent(btnPickFeederLineEndNode, "click", function () {
        FeederAni_Click3();
    });
    td2.appendObject("ul", { id: "ulFeederEndNode", class: "NodeFeederBox py-0", size: "3" }, { top: "76px" });
    var td3 = div2.appendObject("tr", null, { height: "85px" }).appendObject("td", null, null);
    td3.appendObject("label", null, { position: "absolute", left: "0", top: "0px", letterSpacing: "0.125em" }).appendText("設備計數與屬性計算");
    td3.appendObject("label", null, { position: "absolute", left: "20px", top: "23px" }).appendText("類別");
    var sel71 = td3.appendObject("select", { id: "selEquipClass" }, { position: "absolute", left: "55px", top: "22px", width: "200px", height: "26px" });
    for (var i1 = 0; i1 < this.EquipClass_Properties.length; i1 += 1) {
        var r = this.EquipClass_Properties[i1];
        sel71.appendObject("option", (i1 == 0 ? { value: r.classname, selected: "true" } : { value: r.classname })).appendText(r.classname);
    }
    $("#selEquipClass").change(function () {
        var selectedvar = $(this).val();
        sel72.clearChildren();
        for (var i2 = 0; i2 < that.EquipClass_Properties.length; i2 += 1) {
            var r = that.EquipClass_Properties[i2];
            if (selectedvar == r.classname) {
                for (var i3 = 0; i3 < r.props.length; i3 += 1) {
                    var s = r.props[i3];
                    sel72.appendObject("option", (i2 == 0 ? { value: s.propname, selected: "true" } : { value: s.propname })).appendText(s.propname);
                }
            }
        }
		if(selectedvar == "線路變壓器" || selectedvar == "開關")
			$("#iptAnimationAttribute").show();		
		else
			$("#iptAnimationAttribute").hide();	
    });
    td3.appendObject("label", null, { position: "absolute", left: "20px", top: "56px" }).appendText("屬性");
    var sel72 = td3.appendObject("select", { id: "selEquipProperty" }, { position: "absolute", left: "55px", top: "55px", width: "120px", height: "26px" });
	$("#selEquipProperty").change(function () {
        var selectedvar = $(this).val();
		if(selectedvar == "指定相別容量" || selectedvar == "指定開關種類")
			$("#iptAnimationAttribute").show();		
		else
			$("#iptAnimationAttribute").hide();	
    });
	var attributeinput = td3.appendObject("input", { id: "iptAnimationAttribute", class: "NodeFeederInput"}, { bottom: "0",width:"75px", display:"none" });
    var td4 = div2.appendObject("tr", null, { height: "85px" }).appendObject("td", null, { "vertical-align": "middle" });
    td4.appendObject("label", null, { position: "absolute", left: "0", top: "0", letterSpacing: "0.125em" }).appendText("計算方向");
    var rdo1 = td4.appendObject("img", { id: "rdoCalcDirection1", src: "../images/ToolWindow/Topology/RdoChecked.svg", class: "RdoCalculationDirection" }, { left: "15px" });
    td4.appendObject("label", { class: "LblCalculationDirection" }, { left: "44px" }).appendText("向上游");
    var rdo2 = td4.appendObject("img", { id: "rdoCalcDirection2", src: "../images/ToolWindow/Topology/RdoNonChecked.svg", class: "RdoCalculationDirection" }, { left: "110px" });
    td4.appendObject("label", { class: "LblCalculationDirection" }, { left: "134px" }).appendText("向下游");
    var rdo3 = td4.appendObject("img", { id: "rdoCalcDirection3", src: "../images/ToolWindow/Topology/RdoNonChecked.svg", class: "RdoCalculationDirection" }, { left: "200px" });
    AttachEvent(rdo1, "click", function () {
        SetDirectionRDO(1);
    });
    AttachEvent(rdo2, "click", function () {
        SetDirectionRDO(2);
    });
    AttachEvent(rdo3, "click", function () {
        SetDirectionRDO(3);
    });
    td4.appendObject("label", { class: "LblCalculationDirection" }, { left: "224px" }).appendText("無向");
    td4.appendObject("label", null, { "letter-spacing": "0.125em", position: "absolute", left: "14px", bottom: "2px" }).appendText("動畫效果間隔(毫秒)");
    td4.appendObject("input", { id: "iptAnimationInterval", class: "NodeFeederInput", type: "number",min:"0",value:"1000" }, { bottom: "0",width:"84px" });
    var td5 = div2.appendObject("tr", null, { height: "4px" }).appendObject("td", null, { "vertical-align": "middle", position: "relative" });
    td5.appendObject("hr", null, null);
    var td6 = div2.appendObject("tr", null, { height: "45px" }).appendObject("td", null, { "vertical-align": "middle", position: "relative" });
    //結果小窗
    td6.appendObject("div", { id: "divStatisticsResult" }, { position: "absolute", left: "0", top: "0", width: "100%", height: "100%" });
    var btnPlayAgain = this.BodyCell.appendObject("input", { id: "btnPlayAnimationAgain", value: "再次播放", type: "button" }, { display: "none" });
    AttachEvent(btnPlayAgain, "click", function () {
        //再次播放功能保留區
        FeederAni_Replay();
    });
    //計算紐(兩個子頁面中都放在同一個位置，不然就乾脆共用好了)(樣式參ToolWindow.css以ID定)
    var btnCalculation = this.BodyCell.appendObject("input", { id: "btnFeederCalculation", type: "button", value: "計算" }, null);
    AttachEvent(btnCalculation, "click", function () {
        //計算功能保留區
        switch (intFeederLine) {
            case 0:
                StartAnalysis();
                break;
            case 1:
                FeederAni_Calculate();
                break;
        }
    });
    //預選
    select(intFeederLine == null ? 0 : intFeederLine);
    $("#selEquipClass").trigger("change");
    pEarth.addEventListener("mousedown", funcMouseDown, false, true);
};