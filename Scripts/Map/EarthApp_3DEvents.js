/**
 * enum:目前圖台上點一下滑鼠是要幹嘛的狀態列舉
 * */
var ClickFor = {
    EndPointSelect: -3//動畫(終止節點點選)
    , FeederLineRangeSelect: -2//動畫(饋線範圍點選)
    , GroundHole: -1//開挖
    , None: 0//沒要幹嘛
    , PickTopology: 1//拓樸演算(點選)
    , PipeDisting: 2//管距
    , PointQuery: 3//點選查詢
    , PolygonSelect: 4//框選查詢
    , Profiling: 5//執行剖面線工具
    , StartPointSelect: 6//動畫(起使節點點選)
    , TestCircuitChangeDirect: 7//測試電流變向,
    , PickFeederEstimation: 8//狀態估測(點選)
};
/**
 * 滑鼠事件控制專用靜態物件
 * */
var _3DMouseUpDown = {
    bMakePipe: false
    ,
    bMouseOver: true
    ,
    bMouseDown: false
    ,
    g_pms: {}
    ,
	edgevisible: true
	,
    g_surfaces : {}
    ,
    g_surfaces2 : {}
    ,
    cur_Segment: null
    ,
    current_Board: null
    ,
    cursorX: null
    ,
    cursorY: null
    ,
    DegreeToMeter: 106550
    ,
    dist_cur: null
    ,
    dist_sum: null
    ,
    dirty_pms: []
    ,
    changedDevices : [], // 20201119
    changeinfo_interval: 2000, // 20201119
    allchange_applied : false
    // 原來的 offCBs 拿掉 // 20201119
    //off_CBs : []
    ,
    down_Loc: null
    ,
    down_x: null
    ,
    down_y: null
    ,
    GMarks: {
    }
    ,
    GButtom: null
    ,
    GWall: null
    ,
    holewalls: []
    ,
    isMeasureing: false
    ,
    last_Board: null
    ,
    line_width: 0
    ,
    m_AddPointMode: false
    ,
    m_EdgesToCalcDist: []
    ,
    m_FlyMode: false
    ,
    m_HolePoints: null
    ,
    m_ProfileMode: false
    ,
    measure_Marks: []
    ,
    /*
     * 目前滑鼠點一下的目的
     */
    MouseType:ClickFor.None
    ,
    pickingBuffer: null
    ,
    pInfoWindow: null
    ,
    Pipes: []
    ,
    pLineSymbol:null
    ,
    PolyPoints: []
    ,
    ProfileH: 125
    ,
    ProfileW: 250
    ,
    pUnderground: null
    ,
    qrstatus: false
    ,
    queryResults:[]
    ,
    SR_4326: EPSG.CreateSpatialReference(4326), // WGS84
    SR_3857: EPSG.CreateSpatialReference(3857), // WM
    SR_3826: EPSG.CreateSpatialReference(3826), // 97
    tipMarker: null
    ,
    tmp_Position: null
    ,
    tmpMarks:[]
    ,
    vertex_Locs: []
    ,
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    //  下面是滑鼠事件相關函數，上面是下面那些函數執行所需共通變數
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    /*****************************************開挖相關CODE BEGIN*******************************************/
    AddGroundHole: function () {
        //開挖
        _3DMouseUpDown.Reset();
        _3DMouseUpDown.MouseType = ClickFor.GroundHole;
    }
    ,
    RemoveGroundHole: function () {
        //移除開挖
        _3DMouseUpDown.Reset();
    }
    ,
    GeodeticFromDevice: function (x, y) {
        var pScene = earth_.GetScene();
        var pGlobe = earth_.GetGlobe();
        var pPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
        var CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(pPosition), 1, false);
        var globeLoc = pGlobe.GeodeticFromCartesian2(CurLocation);
        return globeLoc;
    }
    ,
    GetSegment: function (loc1, loc2, pOriSegment) {
        var x1 = loc1[0];
        var y1 = loc1[1];
        var z1 = loc1[2] + 1;
        var x2 = loc2[0];
        var y2 = loc2[1];
        var z2 = loc2[2] + 1;
        var wkt = "LINESTRING(" + parseFloat(x1) + " " + parseFloat(y1) + " " + parseFloat(z1) + "," +
            parseFloat(x2) + " " + parseFloat(y2) + " " + parseFloat(z2) + ")";

        if (pOriSegment == null) {
            var pSegment = earth_.CreatePlacemark("", wkt);
            pSegment.DDDSymbol = earth_.CreateSimpleDDDLineSymbol(earth_.CreateModelMaterial(2, earth_.CreateColor(0.58203125, 0.58203125, 0, 1)));
            earth_.PlacemarkObjects.Add(pSegment);
            _3DMouseUpDown.measure_Marks.push(pSegment);
            _3DMouseUpDown.tmpMarks.push(pSegment);
            return pSegment;
        }
        else {
            pOriSegment.Geometry = wkt;
            pOriSegment.SetDirty();
            return pOriSegment;
        }
    }
    ,
    CreateHole: function () {
        var depth = $("#iptDeepness").val();
        var loc1 = _3DMouseUpDown.vertex_Locs[_3DMouseUpDown.vertex_Locs.length - 1];
        var loc2 = _3DMouseUpDown.vertex_Locs[0];
        _3DMouseUpDown.GetSegment(loc1, loc2, null); // 使首尾連
        _3DMouseUpDown.vertex_Locs.push(loc2);

        var wkt1 = "LINESTRING(";
        var wkt2 = "POLYGON((";
        for (var i in _3DMouseUpDown.vertex_Locs) {
            var x = _3DMouseUpDown.vertex_Locs[i][0];
            var y = _3DMouseUpDown.vertex_Locs[i][1];

            wkt1 += x.toString() + " " + y.toString();
            wkt2 += x.toString() + " " + y.toString();
            if (i < _3DMouseUpDown.vertex_Locs.length - 1) {
                wkt1 += ",";
                wkt2 += ",";
            }
            else {
                wkt1 += ")";
                wkt2 += "))";
            }
        }
        var line = earth_.CreatePlacemark("", wkt1);
        line.DDDSymbol = earth_.CreateSimpleDDDLineSymbol(earth_.CreateModelMaterial(0, earth_.CreateColor(0.08, 0.71, 0.78, 1)));
        line.ExtrudeSymbol = earth_.CreateSimpleDDDFillSymbol(earth_.CreateModelMaterial(0, earth_.CreateColor(1, 1, 1, 0.6)), null);
        line.ExtrudeSymbol.Texture = _3DMouseUpDown.GWall;
        line.DefaultElevation = -depth;
        line.ReplaceZ = depth;
		line.BelowSurface = true;
        earth_.PlacemarkObjects.Add(line);

        var bottom = earth_.CreatePlacemark("", wkt2);
        bottom.DDDSymbol = earth_.CreateSimpleDDDFillSymbol(earth_.CreateModelMaterial(0, earth_.CreateColor(1, 1, 1, 1)), null);
        bottom.DDDSymbol.Texture = _3DMouseUpDown.GBottom;
        bottom.ReplaceZ = -depth;
		bottom.BelowSurface = true;
        earth_.PlacemarkObjects.Add(bottom);

        _3DMouseUpDown.tmpMarks.push(line);
        _3DMouseUpDown.tmpMarks.push(bottom);

        earth_.AddHole("h1", wkt2);
    }
    /*****************************************開挖相關CODE END*********************************************/
    /*****************************************剖面相關CODE BEGIN*******************************************/
    ,
    AddProfileLine: function () {
        _3DMouseUpDown.MouseType = ClickFor.Profiling;
        _3DMouseUpDown.DrawProfileAxis();
        _3DMouseUpDown.Reset();
    }
    ,
    DrawProfileAxis: function () {
        var canvas = document.getElementById("ProfileCanvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(10, 20);
        ctx.lineTo(40 + _3DMouseUpDown.ProfileW, 20);
        ctx.moveTo(40, 20); // 原點
        ctx.lineTo(40, 20 + _3DMouseUpDown.ProfileH);
        ctx.stroke();
    }
    ,
    CalcDist: function (x1, y1, x2, y2) {
        var pt1 = { X: x1, Y: y1, Z: 0 };
        var pt2 = { X: x2, Y: y2, Z: 0 };
        return Math.sqrt((pt2.X - pt1.X) * (pt2.X - pt1.X) + (pt2.Y - pt1.Y) * (pt2.Y - pt1.Y));
    }
    ,
    DoProfile: function (startx, starty, endx, endy) {
        //剖面線流程待移植中
        var distance = _3DMouseUpDown.CalcDist(startx, starty, endx, endy);
        var distScale = distance / _3DMouseUpDown.ProfileW;

        var MaxDepth = -10;
        var Intersections = [];

		//var pms = LineData.GetPlacemarks();
		var pms = LineData.GetRenderFeatures();
		pms = pms.concat(LineData1.GetRenderFeatures());
		
		// 加入 round pipes
		for (var i = 0; i < earth_.PlacemarkObjects.GetCount(); i++)
		{
			var obj = earth_.PlacemarkObjects.GetObject(i);
			if (obj.BelowSurface == true && obj instanceof SuperGIS.DDDEarth.Placemark)
				pms.push(obj);
		}
			
        for (var i = 0; i < pms.length; i++) {
            var pm = pms[i];
			var ls;
			if (IsPlacemark(pm))
			{
				var geo = pm.Geometry;
				ls = geo[0].pGeoArr;
				pm.ReplaceZ = ls[2];
			}
			else
			{
				var geo = pm.geometry;
				ls = geo[0];
			}
            var cnt = ls.length;
            for (var j = 0; j < cnt - 3; j += 3) {
                var x1 = ls[j];
                var y1 = ls[j + 1];

                var x2 = ls[j + 3];
                var y2 = ls[j + 4];

                var pt1 = { X: x1, Y: y1, Z: 0 };
                var pt2 = { X: x2, Y: y2, Z: 0 };

                var res = _3DMouseUpDown.checkLineIntersection(startx, starty, endx, endy, pt1.X, pt1.Y, pt2.X, pt2.Y);
                if (res.onLine1 == true && res.onLine2 == true) {
                    res.Placemark = pm;
                    Intersections.push(res);
                }
            }
        }

        var depthScale = -MaxDepth / _3DMouseUpDown.ProfileH;

        var canvas = document.getElementById("ProfileCanvas");
        var ctx = canvas.getContext("2d");
        ctx.textAlign = "right";
        ctx.font = "14px Arial";
        ctx.fillStyle = "rgba(0, 45, 0, 1)";
        ctx.fillText("0m", 40, 18);
        ctx.fillText("10m", 40, 32);
        ctx.fillText(distance.toFixed(0) + "m", 40 + _3DMouseUpDown.ProfileW, 18);
        ctx.fillText((distance / 4).toFixed(0) + "m", 40 + _3DMouseUpDown.ProfileW / 4, 18);
        ctx.fillText((distance / 2).toFixed(0) + "m", 40 + _3DMouseUpDown.ProfileW / 2, 18);
        ctx.fillText((distance / 4 * 3).toFixed(0) + "m", 40 + _3DMouseUpDown.ProfileW / 4 * 3, 18);

        ctx.fillText("-10m", 38, 20 + _3DMouseUpDown.ProfileH - 10);
        ctx.fillText("0m", 38, 20 + _3DMouseUpDown.ProfileH / 2);
        ctx.stroke();
        //Gary 20190201:緩衝區:到這裡，圖的座標軸的深度與距離標示完成
        var LengthPerPixel = distance / _3DMouseUpDown.ProfileW;//每點像素代表的距離(下面算水平或垂直距離時要用)
        var HeightPerPixel = MaxDepth / _3DMouseUpDown.ProfileH;
        var xvalues = [];
        for (var i in Intersections) {
            var res = Intersections[i];

            var dist = _3DMouseUpDown.CalcDist(startx, starty, res.x, res.y);
            var offsetx = dist / distScale;
            var offsety = 5 / depthScale;

			var r, g, b;
			if (IsPlacemark(res.Placemark))
			{
				var c = res.Placemark.DDDSymbol.Material.Color;
				r = c.Red * 255;
				g = c.Green * 255;
				b = c.Blue * 255;
				offsety = (5 - res.Placemark.ReplaceZ / 2) / depthScale;
			}
			else
			{
				var c = res.Placemark.values.symcolor;
				var color = HexToRGB(c);
				r = color[0] * 255;
				g = color[1] * 255;
				b = color[2] * 255;
			}

            ctx.beginPath();
            ctx.fillStyle = "rgb(" + r.toFixed(0) + "," + g.toFixed(0) + "," + b.toFixed(0) + ")";
            ctx.arc(offsetx + 40, offsety + 20, 5, 0, 2 * Math.PI, false);

            // 轉為 device 坐標供點擊查詢用
            res.x = offsetx + 40;
            res.y = offsety + 20;

            ctx.fill();
            ctx.stroke();
            //Gary 20190201:畫完點了接著是畫垂直線，要標示每條管線的水平距離用
            //本行以下到本程式末尾為Gary應需求新增的流程
            ctx.moveTo(offsetx + 40, offsety + 20 + 10);//垂直線上頭不要直接接到剛剛畫的點
            ctx.lineTo(offsetx + 40, _3DMouseUpDown.ProfileH + 20);//垂直線下端與左邊的座標線的下端等高
            ctx.stroke();//垂直線一條繪製完畢
            //要畫水平雙箭頭線並且標距離的關係，所以x軸值與y軸值分別放陣列內做排序
            xvalues.push(offsetx + 40);
        }
        //水平雙箭頭線處理
        xvalues = xvalues.sort(function (a, b) { return a - b; });//排序
        var xi = 0;
        while (xi + 1 < xvalues.length) {
            //保留一點高度
            _3DMouseUpDown.DrawHorizontalDoubleEndedArrows(canvas, xvalues[xi], xvalues[xi + 1], _3DMouseUpDown.ProfileH);
            //距離文字
            var DistText = ((xvalues[xi + 1] - xvalues[xi]) * LengthPerPixel).toFixed(1) + "m";
            var DistTextLength = ctx.measureText(DistText).width;
            if (Math.abs(xvalues[xi + 1] - xvalues[xi]) >= DistTextLength) {
                ctx.fillText(DistText, ((xvalues[xi] + xvalues[xi + 1]) / 2 + DistTextLength / 2), _3DMouseUpDown.ProfileH - 3);
                ctx.stroke();
            }
            xi += 1;
        }
    }
    ,
    checkLineIntersection: function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
        var denominator, a, b, numerator1, numerator2, result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false,
            Placemark: null
        };
        denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
        if (denominator == 0)
            return result;
        a = line1StartY - line2StartY;
        b = line1StartX - line2StartX;
        numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
        numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;
        result.x = line1StartX + (a * (line1EndX - line1StartX));
        result.y = line1StartY + (a * (line1EndY - line1StartY));
        if (a > 0 && a < 1)
            result.onLine1 = true;
        if (b > 0 && b < 1)
            result.onLine2 = true;
        return result;
    }
    ,
    DrawHorizontalDoubleEndedArrows: function (canvas, xl, xr, y) {
        var ltriangle = _3DMouseUpDown.GetTriangle3Points(xl, y, "W", 6);
        var rtriangle = _3DMouseUpDown.GetTriangle3Points(xr, y, "E", 6);
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(ltriangle[0], ltriangle[1]);
        ctx.lineTo(ltriangle[2], ltriangle[3]);
        ctx.lineTo(ltriangle[4], ltriangle[5]);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rtriangle[0], rtriangle[1]);
        ctx.lineTo(rtriangle[2], rtriangle[3]);
        ctx.lineTo(rtriangle[4], rtriangle[5]);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        ctx.moveTo(xl, y);
        ctx.lineTo(xr, y);
        ctx.stroke();
    }
    ,
    GetTriangle3Points: function (ox, oy, news, length) {
        var pts = [];
        pts.push(ox);
        pts.push(oy);
        var triangle_height = length * Math.sqrt(3) / 2; //Height of this triangle
        switch (news.toUpperCase()) {
            /*Gary 20190201:取東西南北正代表左右上下(目前功能需求上只要求畫水平的，此三角形尖端只會朝水平或垂直方向共四種而已)*/
            case "E":
                pts.push(ox - triangle_height);
                pts.push(oy - length / 2);
                pts.push(ox - triangle_height);
                pts.push(oy + length / 2);
                break;
            case "W":
                pts.push(ox + triangle_height);
                pts.push(oy - length / 2);
                pts.push(ox + triangle_height);
                pts.push(oy + length / 2);
                break;
            case "N":
                pts.push(ox - length / 2);
                pts.push(oy + triangle_height);
                pts.push(ox + length / 2);
                pts.push(oy + triangle_height);
                break;
            case "S":
                pts.push(ox - length / 2);
                pts.push(oy - triangle_height);
                pts.push(ox + length / 2);
                pts.push(oy - triangle_height);
                break;
            default:
                throw "Directions of triangles only allow for N,E,W,S 4 kinds.";
        }
        return pts;
    }
    /*****************************************剖面相關CODE END*********************************************/
    /*****************************************管距相關CODE BEGIN*******************************************/
    ,
    PickPlacemark: function (x, y) {
		var feature0 = null;
		var feature1 = null;
		for (var i = x - 2; i < x + 2; i++)
		{
			for (var j = y - 2; j < y + 2; j++)
			{
                if(LineData) feature0 = LineData.HitTestFeature(i, j);
                if(LineData1) feature1 = LineData1.HitTestFeature(i, j);
				if (feature0 || feature1)
					break;
			}
			if (feature0 || feature1)
				break;
		}
		if (feature0)
			return feature0;
		if (feature1)
			return feature1;
	
        var pm = earth_.PickPlacemark(x, y);
        if (pm == null) {
            for (var i = 1; i <= 3; i++) {
                for (var j = -i; j <= i; j++) {
                    for (var k = -i; k <= i; k++) {
                        pm = earth_.PickPlacemark(x + j, y + k);
                        if (pm != null)
                            return pm;
                    }
                    if (pm != null)
                        return pm;
                }
                if (pm != null)
                    return pm;
            }
        }
        return pm;
    }
    ,
    CalcEdgeDist: function () {
        var pipe1 = _3DMouseUpDown.m_EdgesToCalcDist[0];
        var pipe2 = _3DMouseUpDown.m_EdgesToCalcDist[1];
        m_PipeDistMode = false;

        // var pts1 = pipe1.Geometry[0].pGeoArr;
        // var pts2 = pipe2.Geometry[0].pGeoArr;
		var pts1 = pipe1.geometry[0];
        var pts2 = pipe2.geometry[0];
        var z1 = (pipe1.ReplaceZ != null) ? pipe1.ReplaceZ : pts1[2];
        var z2 = (pipe2.ReplaceZ != null) ? pipe2.ReplaceZ : pts2[2];
        var zoff = Math.abs(z1 - z2);

        var arrA = [];
        var arrB = [];
        for (var i = 0; i < pts1.length; i++) {
            if (i % 3 != 2)
                arrA.push(pts1[i]);
        }
        for (var i = 0; i < pts2.length; i++) {
            if (i % 3 != 2)
                arrB.push(pts2[i]);
        }

        var result = CalcNearestDistance(arrA, arrB);
        var dist = Math.sqrt(result.dist * result.dist + zoff * zoff);
        var msg = "饋線間距: " + dist.toFixed(2) + " m";

        var pt1 = { X: result.pt1[0], Y: result.pt1[1], Z: 0 };
        var pt2 = { X: result.pt2[0], Y: result.pt2[1], Z: 0 };
        var x1 = pt1.X;
        var y1 = pt1.Y;
        var x2 = pt2.X;
        var y2 = pt2.Y;
        var cx = (x1 + x2) / 2;
        var cy = (y1 + y2) / 2;
        var cz = (z1 + z2) / 2;

        var pLine = earth_.CreatePlacemark('', 'LINESTRING(' +
            x1.toFixed(6) + ' ' + y1.toFixed(6) + ' ' + z1.toFixed(2) + ',' +
            x2.toFixed(6) + ' ' + y2.toFixed(6) + ' ' + z2.toFixed(2) + ')');
        pLine.DDDSymbol = earth_.CreateSimpleDDDLineSymbol(new SuperGIS.DDDCore.Material(earth_.CreateColor(1, 0, 0, 1.0), 0, 1));
        earth_.PlacemarkObjects.Add(pLine);
        _3DMouseUpDown.tmpMarks.push(pLine);

        var marker = new SuperGIS.Marker(earth_, SuperGIS.DDDEarth.LatLonAlt.NewLatLonAlt(cy, cx, 0), msg, "");
        var pm = marker.getPlacemark();
        pm.ReplaceZ = 10;
        pm.DefaultElevation = cz;
        pm.ExtrudeSymbol = earth_.CreateSimpleDDDLineSymbol(earth_.CreateModelMaterial(0, earth_.CreateColor(1, 1, 1, 1)));
        _3DMouseUpDown.tmpMarks.push(pm);
        earth_.Invalidate();
        //MouseType = 0;
        $("#lblMeasureStatus").text(msg);
        //回到點選查詢狀態(若不要此時能點選查詢的話就要拿掉)
        _3DMouseUpDown.MouseType = ClickFor.PointQuery;
    }
    /*****************************************管距相關CODE END*********************************************/
    ,
    AddVertex: function (loc, radius, ZOffset) {
        var xy = _3DMouseUpDown.CircleToPolygon(loc[0], loc[1], radius);
        var wkt = "POLYGON((";
        for (var i in xy) {
            wkt += xy[i][0].toString() + ' ';
            wkt += xy[i][1].toString();
            if (i != xy.length - 1)
                wkt += ','
        }
        wkt += "))";
        var marker = earth_.CreatePlacemark("", wkt);
        marker.DDDSymbol = earth_.CreateSimpleDDDFillSymbol(earth_.CreateModelMaterial(0, earth_.CreateColor(0.58203125, 0.58203125, 0, 1)), null);
        marker.ReplaceZ = loc[2] + ZOffset;
        earth_.PlacemarkObjects.Add(marker);
        _3DMouseUpDown.measure_Marks.push(marker);
        return marker;
    }
    ,
    CircleToPolygon: function (cx, cy, radius) {
        var length = radius / _3DMouseUpDown.DegreeToMeter;
        var N = 20;
        var xy = [];
        var CV_PI = 3.1425;
        for (var i = 0; i < N; i++) {
            var x = cx + length * Math.cos(i * 2 * CV_PI / N);
            var y = cy + length * Math.sin(i * 2 * CV_PI / N);
            xy.push([x, y]);
        }
        return xy;
    }
    ,
    ClearMeasure: function () {
        for (var i in this.measure_Marks) {
            earth_.PlacemarkObjects.Remove(this.measure_Marks[i]);
            delete this.measure_Marks[i];
        }
        this.measure_Marks = [];

        this.isMeasureing = false;
        earth_.Invalidate();
    }
    ,
    /**
     * 清除查詢
     * */
    ClearQuery: function () {
        $("nav#navQueryWindow").hide();
        $("select#selEquipmentClass2").val("");
        $("#iptQueryFeederNo2").val("");
        $("#tblQueryResult").find("tbody").html("");
		if (pm != null){
			earth_.PlacemarkObjects.Remove(pm);
			pm = null;
		}
    }
    ,
    DBLClick: function (tEvent) {
        switch (_3DMouseUpDown.MouseType) {
            //共兩個情境會要滑鼠連點兩次:框選查詢、開挖模式
            case ClickFor.GroundHole:
                //開挖模式
                if (_3DMouseUpDown.vertex_Locs.length < 3)
                    return;

                _3DMouseUpDown.CreateHole();
                _3DMouseUpDown.MouseType = ClickFor.None;
                break;
            case ClickFor.PolygonSelect:
                //框選查詢
                earth_.Invalidate();
                $("div#body").css("cursor", "wait");
                _3DMouseUpDown.DoPolyQuery();
                
                _3DMouseUpDown.PolyPoints = [];
                break;
        }
    }
    ,
    DisplayQueryResult: function (result) {
        var arrtr = [];
        for (var i = 0; i < result.length; i += 1) {
            var objresult = JSON.parse(result[i]);
            console.log(objresult);
            var tr = [
                "<tr>"
                , "<td>"
                , "<label class='ItemName' style='top:10px;'>饋線編號</label>"
                , "<label class='ItemValue' style='top:10px;'>" + objresult.FeederID + "</label>"
                , "<label class='ItemName' style='top:37px;'>設備類型</label>"
                , "<label class='ItemValue' style='top:37px;'>" + objresult.EquipmentClassName + "</label>"
                , "<label class='ItemName' style='top:65px;'>設備流水號</label>"
                , "<label class='ItemValue' style='top:65px;'>" + objresult.iEquipmentSerial + "</label>"
                , "<label class='ViewDetail'>看詳細</label>"
                , "<input type='hidden' class='json' value='" + result[i] + "' y='" + objresult.Y + "' />"
                , "<input type='hidden' class='locx' value='" + objresult.X + "' />"
                , "<input type='hidden' class='locy' value='" + objresult.Y + "' />"
                , "<input type='hidden' class='locgeometry' value='" + objresult.PositionInformation + "' />"
                , "</td>"
                , "</tr>"
            ];
            arrtr.push(tr.join(""));
        }
        $("#tblQueryResult").find("tbody").html(arrtr.join(""));
        //HTML字串上面一行指令中才會填到html table裡面去，"看詳細"事件一定要在這之後才能綁
        $("label.ViewDetail").click(function () {
            //點"看詳細"必須觸發的事件
            var EquipmentSerial = $(this).parent().find("label.ItemValue").eq(2).text();
            var EquipmentJsonData = $(this).parent().find("input.json[type=hidden]").val();
            var x = $(this).parent().find("input.locx[type=hidden]").val();
            var y = $(this).parent().find("input.locy[type=hidden]").val();
            var geom = $(this).parent().find("input.locgeometry[type=hidden]").val();
            var TPC = new TaipowerCoordinateTransform();
            if (geom != null && geom != "") {
                //查詢時沒有查到X,Y就是從WKT取
                var arr = Supergeo.ProcessGeometryFromWKT(geom);
                if (arr.length > 0) {
                    arr = arr[0].pGeoArr;
                }
                if (arr.length > 0) {
					var sum_x = 0, sum_y = 0;
					for (var j = 0; j < arr.length; j += 3) {
						sum_x += arr[j];
						sum_y += arr[j + 1];
					}
	                var loc = TPC.TWD97ToLngLat(new Coords(sum_x / (arr.length / 3), sum_y / (arr.length / 3), 200));
                    //靠台電圖號定位高200m
                    Positioning.DoByLngLat(loc.X, loc.Y, 200);
                }
            } else if (x != null && x != "" && y != null && y != "") {
                //若查詢就有查到X,Y就直接拿X,Y來定位
                var loc = TPC.TWD67ToLngLat(new Coords(x, y, 200));
                //靠台電圖號定位高200m
                Positioning.DoByLngLat(loc.X, loc.Y, 200);
            }
            _3DMouseUpDown.PopupInfoWindow(EquipmentSerial, EquipmentJsonData );
        });
        if (!QueryWindowState) {
            $("#aToggleButton").trigger("click");
        }
    }
    ,
    DoPolyQuery: function () {
        _3DMouseUpDown.queryResults = [];
		
		if (LineData.Visible)
		{
			var features = LineData.GetRenderFeatures();
			features = features.concat(LineData1.GetRenderFeatures());
			for (var j = 0; j < features.length; j++)
			{
				var feature = features[j];
				var res = _3DMouseUpDown.LineCrossPoly(_3DMouseUpDown.PolyPoints, feature.geometry[0]);
				if (res)
					_3DMouseUpDown.queryResults.push(feature);
			}
		}
			
        for (var i in Layers) {
            var layer = Layers[i];
            if (layer.GeoType == 0 || !layer.Visible) // 文字不查
                continue;
            var tiles = layer.GetRenderTile();
            for (var j in tiles) {
                var tile = tiles[j];
                var pms = tile.GetPlacemarks();
                for (var k in pms) {
                    var pm = pms[k];
                   	var geo = pm.Centroid;
                    if (PtInPoly(_3DMouseUpDown.PolyPoints, geo.X, geo.Y))
                        _3DMouseUpDown.queryResults.push(pm);
                }
            }
        }
        console.log(_3DMouseUpDown.queryResults);
        //下面就是把撈到的一筆一筆攤出來的事情了
        var TIDOIDSET = [];
        for (var i = 0; i < _3DMouseUpDown.queryResults.length; i += 1) {
			var obj = _3DMouseUpDown.queryResults[i];
			var oid = GetValue(obj, "oid");
			var tid = GetValue(obj, "tid");
            TIDOIDSET.push([tid, oid]);
        }
        var strTIDOIDSET = JSON.stringify(TIDOIDSET);
        ajaxStart();
        $.post("../GisMap/GetGroupedInfoWindowData", { Json2DIntArray:strTIDOIDSET }, function (ret) {
            if (ret.ProcessFlag) {
                //Gary 20201014:傳回來的是多個[單一設備資訊構成的JSON物件轉字串]逗號結合起來的字串
                $("nav#navQueryWindow").show();
                var result = JSON.parse(ret.ProcessMessage);
                console.log(result);
                if (result.length == 0) {
                    Swal.fire({
                        icon: "warning"
                        , title: "查詢失敗"
                        , text: "查無資訊，請重新框選"
                    });
                } else if (result.length > 100) {
                    Swal.fire({
                        icon: "warning"
                        , title: "查詢失敗"
                        , text: "筆數超過100筆，請重新框選"
                    });
                } else {
                    _3DMouseUpDown.DisplayQueryResult(result);
                }
                ajaxStop();
            }
            $("div#body").css("cursor", "default");
        });
    }
    ,
    EndRender: function (tEvent) {
        //
        if (_3DMouseUpDown.MouseType != ClickFor.PolygonSelect && _3DMouseUpDown.MouseType != ClickFor.PointQuery && _3DMouseUpDown.MouseType!=ClickFor.GroundHole)
            return;
        var gr = pScene.GetGraphics(2);
        gr.getContext().setLineDash([8, 5]);
        for (var i = 0; i < _3DMouseUpDown.PolyPoints.length; i++) {
            var pt1 = _3DMouseUpDown.PolyPoints[i];
            var cpt1 = pGlobe.CartesianFromGeodetic2(pt1);
            var dv1 = pScene.DeviceFromPosition2(pCam.ViewProject2(cpt1));

            var pt2 = (i < _3DMouseUpDown.PolyPoints.length - 1) ? _3DMouseUpDown.PolyPoints[i + 1] : _3DMouseUpDown.MapXYFromCursor();
            var cpt2 = pGlobe.CartesianFromGeodetic2(pt2);
            var dv2 = pScene.DeviceFromPosition2(pCam.ViewProject2(cpt2));

            gr.drawLine(dv1[0], dv1[1], dv2[0], dv2[1], "#959500", 3);
        }
    }
    ,
    ExecuteKeyInQuery: function (FSC, CodeText) {
        //饋線查詢:下拉選單+饋線編號框
        var Errors = [];
        if (FSC == null || FSC == "") {
            Errors.push("請選擇設備類型");
        }
        if (CodeText == null || CodeText == "") {
            Errors.push("請輸入饋線編號");
        }
        if (Errors.length > 0) {
            Swal.fire({
                icon: "warning"
                , title: "無法進行查詢"
                , html: Errors.join("<br />")
            });
            return;
        }
        //檢查過關就開始交給後台
        ajaxStart();
        $.post("../GisMap/ExecuteFeederQuery", { FeederID: CodeText, FSC: FSC }, function (ret) {
            if (ret.ProcessFlag) {
                //Gary 20201014:傳回來的是多個[單一設備資訊構成的JSON物件轉字串]兠起來的字串
                $("nav#navQueryWindow").show();
                var result = JSON.parse(ret.ProcessMessage);
                console.log(result);
                if (result.length == 0) {
                    Swal.fire({
                        icon: "warning"
                        , title: "饋線編號錯誤"
                        , text: "請輸入正確的饋線編號"
                    });
                } else {
                    _3DMouseUpDown.DisplayQueryResult(result);
                }
                ajaxStop();
            }else{
                Swal.fire({
                    icon: "warning"
                    , title: "饋線編號錯誤"
                    , text: "請輸入正確的饋線編號"
                })
                ajaxStop();
            }
        });
    }
    
    ,
    LineCrossPoly: function (PolyPoints, Line) {
        for (var i = 0; i < PolyPoints.length; i++) {
            var p1 = PolyPoints[i];
            var p2 = (i == PolyPoints.length - 1) ? PolyPoints[0] : PolyPoints[i + 1];
            for (var j = 0; j < Line.length; j += 3) {
                var p3 = Line.slice(j, j + 3);
                var p4 = Line.slice(j + 3, j + 6);

                var res = _3DMouseUpDown.lineSegmentsIntersect(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]);
                if (res)
                    return true;
            }
        }
        return PtInPoly(PolyPoints, Line[0], Line[1]);
    }
    ,
    lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        var a_dx = x2 - x1;
        var a_dy = y2 - y1;
        var b_dx = x4 - x3;
        var b_dy = y4 - y3;
        var s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
        var t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
        return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
    }
    ,
    MapXYFromCursor: function () {
        var CurPosition = earth_.GetCurrentPosition();
        var CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(CurPosition), 1, true);
        return (CurLocation ? pGlobe.GeodeticFromCartesian2(CurLocation) : null);
    }
    ,
    MouseDown: function (tEvent) {
        _3DMouseUpDown.down_x = tEvent.x;
        _3DMouseUpDown.down_y = tEvent.offsetY;
        _3DMouseUpDown.bMouseDown = true;
    }
    ,
    MouseMove: function (tEvent) {
        switch (_3DMouseUpDown.MouseType) {
            case ClickFor.GroundHole:
            case ClickFor.Profiling:
                //開挖、剖面線模式
                if (_3DMouseUpDown.vertex_Locs.length != 0) {
                    var cur_Loc = _3DMouseUpDown.GeodeticFromDevice(tEvent.x, tEvent.offsetY);
                    _3DMouseUpDown.cur_Segment = _3DMouseUpDown.GetSegment(_3DMouseUpDown.down_Loc, cur_Loc, _3DMouseUpDown.cur_Segment);
                    earth_.Invalidate();
                }
                break;
            case ClickFor.PolygonSelect:
                //框選查詢
                earth_.Invalidate();
                break;
        }
    }
    ,
    Highlight: function (obj, restore, sec, color) {
        if (color == null)
            color = [1, 0, 0];

		if (IsPlacemark(obj))
		{
			if (obj.GeoType == 2)
				color.push(0);
			else
				color.push(1);
			obj.Highlight(color, restore, sec);
		}
		else
		{
			if (obj.type == 1)
				color.push(0);
			else
				color.push(1);
			LineData.HighlightFeature(obj, color, restore, sec);
		}
    }
    ,
    MouseUp: function (tEvent) {
        var MY = tEvent.offsetY;
        /**
         * 本站台不同於Leon大的範例站台，地圖上方還有標題帶&功能選單帶占用高度，直接取Y值會有應該點到東西卻點不到的問題
         * Y值因此另外處理，X就沒關係
         * */
        _3DMouseUpDown.bMouseDown = false;
        var bMoved = (tEvent.x != _3DMouseUpDown.down_x || MY != _3DMouseUpDown.down_y);
        _3DMouseUpDown.down_x = _3DMouseUpDown.down_y = null;
        if (bMoved)
            return false;

        switch (_3DMouseUpDown.MouseType) {
            case ClickFor.Profiling:
            case ClickFor.GroundHole:
                //挖洞、剖面模式
                if (_3DMouseUpDown.vertex_Locs.length > 0 && _3DMouseUpDown.cur_Segment == null) // 按了 DblClick
                    return;

                _3DMouseUpDown.down_Loc = _3DMouseUpDown.GeodeticFromDevice(tEvent.x, MY);
                _3DMouseUpDown.vertex_Locs.push(_3DMouseUpDown.down_Loc);
                _3DMouseUpDown.cur_Segment = null;

                if (_3DMouseUpDown.MouseType == ClickFor.Profiling && _3DMouseUpDown.vertex_Locs.length == 2) // 剖面
                {
                    _3DMouseUpDown.MouseType = ClickFor.None;
                    var start = _3DMouseUpDown.vertex_Locs[0];
                    var end = _3DMouseUpDown.vertex_Locs[1];
                    _3DMouseUpDown.DoProfile(start[0], start[1], end[0], end[1]);
                    earth_.Invalidate();
                }

                if (_3DMouseUpDown.vertex_Locs.length == 8) // 目前限 8 點, 數量到自動結束
                {
                    _3DMouseUpDown.CreateHole();
                    _3DMouseUpDown.MouseType = ClickFor.None;
                }
                break;
            case ClickFor.PipeDisting:
                //管距模式
                var pm = _3DMouseUpDown.PickPlacemark(tEvent.x, MY);
                if (pm) {
                    _3DMouseUpDown.Highlight(pm, true, 1, [1, 0, 0, 1],);
                    _3DMouseUpDown.m_EdgesToCalcDist.push(pm);
                    if (_3DMouseUpDown.m_EdgesToCalcDist.length == 2) {
                        _3DMouseUpDown.CalcEdgeDist();

                    }
                    else {
                        $("#lblMeasureStatus").text("請點選第二條管線。");
                    }
                }
                break;
            case ClickFor.PointQuery:
                if (_3DMouseUpDown.pickingBuffer == null)
                    _3DMouseUpDown.pickingBuffer = earth_.CreatePickingBuffer();

                var pm = _3DMouseUpDown.PickPlacemark(tEvent.x, MY);
 
                console.log(pm);

                if (!pm) {
                    return;
                }
                if (pm.GeoType == 2)
                    _3DMouseUpDown.Highlight(pm, true, null, [1, 0, 0, 0]);
                else
                    _3DMouseUpDown.Highlight(pm, true, null, [1, 0, 0, 1]);
                var pmobject = IsPlacemark(pm) ? pm.GetFieldValues() : pm.values;
                //設備類別
                var EquipClass = pmobject.tid;
                //設備流水號
                var EquipSerial = pmobject.oid;
                //取得滑鼠點選時滑鼠點的位置
                var MousePoint = Positioning.GetCoordinateFromUI(tEvent.x, MY);
                ajaxStart();
                $.post("../GisMap/GetInfoWindowData", { TID: EquipClass, OID: EquipSerial }, function (EI) {
                    console.log(EI);
                    if (EI.ProcessFlag == true) {
                        _3DMouseUpDown.PopupInfoWindow(EquipSerial, EI.ProcessMessage, MousePoint);
                        ajaxStop();
                    }
                });
                //點選查詢
                break;
            case ClickFor.PolygonSelect:
                //框選查詢
                var pt = _3DMouseUpDown.MapXYFromCursor();
                if (pt) {
                    _3DMouseUpDown.PolyPoints.push(pt);
                }
                break;
        }
    }
    ,
    PopupInfoWindow: function (OID, JsonString, EPSG3857PT) {
        //傳入設備流水號與建物設備Json字串
        //基於滑出查詢結果窗的"看詳細"要用故提出來為共用function
        if (_3DMouseUpDown.pInfoWindow != null) {
            _3DMouseUpDown.pInfoWindow.Close();
            _3DMouseUpDown.pInfoWindow = null;
        }
        var EquipObj = JSON.parse(JsonString);
        console.log(EquipObj);
        if (EPSG3857PT != null) {
            _3DMouseUpDown.pInfoWindow = new GInfoWindow(HTMLContainer, earth_, null, OID, EquipObj, EPSG3857PT.X, EPSG3857PT.Y);
        } else {
            _3DMouseUpDown.pInfoWindow = new GInfoWindow(HTMLContainer, earth_, null, OID, EquipObj);
        }
        _3DMouseUpDown.pInfoWindow.addEventListener("Closed", function () { _3DMouseUpDown.pInfoWindow = null; });
        //if (EPSG3857PT != null) {
        //    _3DMouseUpDown.pInfoWindow.RecordMousePoint(EPSG3857PT.X, EPSG3857PT.Y);
        //}
    }
    ,
    RemoveMeasure: function () {
        for (var i in this.measure_Marks) {
            earth_.PlacemarkObjects.Remove(this.measure_Marks[i]);
            delete this.measure_Marks[i];
        }
        this.measure_Marks = [];
        this.isMeasureing = false;
        if (dlgMeasure != null) {
            dlgMeasure.Close();
        }
        $("#btn_measure").attr("src", "images/menu/ruler.png")
        earth_.Invalidate();
    }
    ,
    RemoveQuery: function () {
        $("#btn_query").attr("src", "images/menu/info.png")
        earth_.removeEventListener("mouseup", MouseUp, false);
        earth_.removeEventListener("mousedown", MouseDown, false);
        this.qrstatus = false;
        $("#div_infowindow").dialog("close");
    }
    ,
    RemovePipe: function () {
        _3DMouseUpDown.bMakePipe = false;
        _3DMouseUpDown.Pipes = [];
    }
    ,
    Reset: function () {
        earth_.RemoveHole("h1");
        for (var i in _3DMouseUpDown.tmpMarks) {
            earth_.PlacemarkObjects.Remove(_3DMouseUpDown.tmpMarks[i]);
            delete _3DMouseUpDown.tmpMarks[i];
        }
        _3DMouseUpDown.tmpMarks = [];
        _3DMouseUpDown.vertex_Locs = [];
        _3DMouseUpDown.m_EdgesToCalcDist = [];
        earth_.Invalidate();
    }
    ,
    /*Gary 20190201:以下是自製繪製雙箭頭的線的演算法*/
    /**
     * Draw Vertical Double Ended Arrows
     * @param x x-axis value
     * @param yl y-axis value of the lower point
     * @param yu y-axis value of the upper point
     */
    DrawVerticalDoubleEndedArrows: function (canvas, x, yl, yu) {
        var ltriangle = _3DMouseUpDown.GetTriangle3Points(x, yl, "N", 6);
        var utriangle = _3DMouseUpDown.GetTriangle3Points(x, yu, "S", 6);
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000"; //Black
        ctx.beginPath();
        ctx.moveTo(ltriangle[0], ltriangle[1]);
        ctx.lineTo(ltriangle[2], ltriangle[3]);
        ctx.lineTo(ltriangle[4], ltriangle[5]);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(utriangle[0], utriangle[1]);
        ctx.lineTo(utriangle[2], utriangle[3]);
        ctx.lineTo(utriangle[4], utriangle[5]);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        ctx.moveTo(x, yl);
        ctx.lineTo(x, yu);
        ctx.stroke();
    },
    /**
     * Draw Horizontal Double Ended Arrows
     * @param xl x-axis value of the left side point
     * @param xr x-axis value of the right side point
     * @param y y-axis value
     */
    DrawHorizontalDoubleEndedArrows: function (canvas, xl, xr, y) {
        var ltriangle = _3DMouseUpDown.GetTriangle3Points(xl, y, "W", 6);
        var rtriangle = _3DMouseUpDown.GetTriangle3Points(xr, y, "E", 6);
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000"; //Black
        ctx.beginPath();
        ctx.moveTo(ltriangle[0], ltriangle[1]);
        ctx.lineTo(ltriangle[2], ltriangle[3]);
        ctx.lineTo(ltriangle[4], ltriangle[5]);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rtriangle[0], rtriangle[1]);
        ctx.lineTo(rtriangle[2], rtriangle[3]);
        ctx.lineTo(rtriangle[4], rtriangle[5]);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        ctx.moveTo(xl, y);
        ctx.lineTo(xr, y);
        ctx.stroke();
    },
    /**
     * Decide the 3 points of a triangle include(ox,oy)
     * @param ox x-axis value of a point
     * @param oy y-axis value of a point
     * @param news Direction:'E' to right,'W' to left,'S' to lower,'N' to upper
     * @param length length of this triangle
     */
    GetTriangle3Points: function (ox, oy, news, length) {
        var pts = [];
        pts.push(ox);
        pts.push(oy);
        var triangle_height = length * Math.sqrt(3) / 2; //Height of this triangle
        switch (news.toUpperCase()) {
            /*Gary 20190201:取東西南北正代表左右上下(目前功能需求上只要求畫水平的，此三角形尖端只會朝水平或垂直方向共四種而已)*/
            case "E":
                pts.push(ox - triangle_height);
                pts.push(oy - length / 2);
                pts.push(ox - triangle_height);
                pts.push(oy + length / 2);
                break;
            case "W":
                pts.push(ox + triangle_height);
                pts.push(oy - length / 2);
                pts.push(ox + triangle_height);
                pts.push(oy + length / 2);
                break;
            case "N":
                pts.push(ox - length / 2);
                pts.push(oy + triangle_height);
                pts.push(ox + length / 2);
                pts.push(oy + triangle_height);
                break;
            case "S":
                pts.push(ox - length / 2);
                pts.push(oy - triangle_height);
                pts.push(ox + length / 2);
                pts.push(oy - triangle_height);
                break;
            default:
                throw "Directions of triangles only allow for N,E,W,S 4 kinds.";
        }
        return pts;
    }
    /*Gary 20190201:以上是自製繪製雙箭頭的線的演算法*/
    ,/*Gary 20201006:以下是核研所專案事件switch*/
    /**
     * 點擊查詢功能開關
     * */
    TurnClickQueryOnOff: function () {
        if (_3DMouseUpDown.qrstatus) {
            //$("#btn_query").attr("src", "images/menu/info.png")
            earth_.removeEventListener("mouseup", _3DMouseUpDown.MouseUp, false);
            earth_.removeEventListener("mousedown", _3DMouseUpDown.MouseDown, false);
            _3DMouseUpDown.qrstatus = false;
        }
        else {
            _3DMouseUpDown.RemoveGroundHole();
            _3DMouseUpDown.RemoveMeasure();
            //$("#btn_query").attr("src", "images/menu/info2.png");
            earth_.addEventListener("mouseup", _3DMouseUpDown.MouseUp, false);
            earth_.addEventListener("mousedown", _3DMouseUpDown.MouseDown, false);
            _3DMouseUpDown.qrstatus = true;
        }
    },
    SameArray: function (arr1, arr2) {
        if (arr1.length != arr2.length)
            return false;
        for (var i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i])
                return false;
        }
        return true;
    }
	,
	SameDevice: function(dv1, dv2)
		{
			return (dv1.clr == dv2.clr && dv1.dir == dv2.dir && dv1.fdr1 == dv2.fdr1 && dv1.fsc == dv2.fsc && dv1.ufid == dv2.ufid);
		}
    /*Gary 20201006:以上是核研所專案事件switch*/
    ,
	CheckChange: function(arr1, arr2)
	{
		/*
		if (arr1.length != arr2.length)
				return true;

			var found = false;
			var dv = arr1[0];
			for (var i = 0; i < arr2.length; i++)
			{
				if (_3DMouseUpDown.SameDevice(dv, arr2[i]))
				{
					found = true;
					break;
				}
			}
			if (!found)
				return true;
				
			dv = arr1[arr1.length - 1];
			for (var i = 0; i < arr2.length; i++)
			{
				if (_3DMouseUpDown.SameDevice(dv, arr2[i]))
				{
					found = true;
					break;
				}
			}
			if (!found)
				return true;
			return false;
		*/
		if (arr1.length != arr2.length)
				return true;

			for (var i = 0; i < arr1.length; i++)
			{
				if (!_3DMouseUpDown.SameDevice(arr1[i], arr2[i]))
					return true;
			}
		return false;
	}
	,
	EventMarkerClear: function() {
		for(var i in eventMarkers.MTransfer)
			earth_.PlacemarkObjects.Remove(eventMarkers.MTransfer[i]);
		for(var i in eventMarkers.MPoweroff)
			earth_.PlacemarkObjects.Remove(eventMarkers.MPoweroff[i]);
		for(var i in eventMarkers.MFault)
			earth_.PlacemarkObjects.Remove(eventMarkers.MFault[i]);
		for(var i in eventMarkers.MShortcircuit)
			earth_.PlacemarkObjects.Remove(eventMarkers.MShortcircuit[i]);
		eventMarkers.fdr_labels = {};
		eventMarkers.MPoweroff = [];
		eventMarkers.MFault = [];
		eventMarkers.MShortcircuit = [];
		eventMarkers.MTransfer = [];
		$("#ShortcircuitLocation").css('display', 'none');
		$("#FaultLocation").css('display', 'none');
		$("#PoweroffLocation").css('display', 'none');
		$("#TransferLocation").css('display', 'none');
	}
	,
	SortDevices: function(d1, d2) {
		if (d1.fsc > d2.fsc)
			return 1;
		else if (d1.fsc < d2.fsc)
			return -1;
		else
			return (d1.ufid > d2.ufid) ? 1 : -1;
	},
    CheckChangeInfo: function () {
        if (!blnUpdate && !blnUpdate2)
        {//沒開自動，也沒手動按鈕=>離開
            return;
        }
        if (blnUpdate2) {
            //手動按鈕按進來的
            blnUpdate2 = false;
        }
        var now = new Date();
        stuspnl.SetUpdateInfoText("更新時間:" + now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0'));
        //函數開頭先更新一下更新時間(SOON期望進入函數時做)
        var url = "../../FeederAnalysis/GetChangedDeviceList";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
        xmlHttp.onload = function (e) {

            // 取得所有變更的導線及設備
            var tmp_dvs = JSON.parse(e.target.responseText);
			tmp_dvs.sort(_3DMouseUpDown.SortDevices); // 先做好排序, 確保 device list 不僅因順序變化被判有變更
			if (!_3DMouseUpDown.CheckChange(tmp_dvs, _3DMouseUpDown.changedDevices))
			{
				// 沒有變更, 返回, 待下次檢查
				setTimeout(function() { _3DMouseUpDown.CheckChangeInfo(); }, _3DMouseUpDown.changeinfo_interval);
				return;				
			}
			// ChangedList 有變化，停電故障短接轉供的label要清空
			_3DMouseUpDown.EventMarkerClear();
            var newdvs = [];
            var new_tmp_dvs = [];
			if (tmp_dvs.length == 0)
			{
				$("#divPowerShow").html("受影響區間負載量：0千瓦");
				$("#divPowerShow").hide();
			}				
			else
            {
                var i0, i1;
                /* 
                 * Gary Lu 20210119
                 * 因應新需求改為斷路器優先，故以饋線為單位，同一組饋線內只要有斷路器，找到的開關就忽略掉
                 */
                var FeederIDs = [];
				for (i0 = 0; i0 < tmp_dvs.length; i0 += 1) {
                    //if ((tmp_dvs[i0].fsc == 114 || tmp_dvs[i0].fsc == 108)&& (tmp_dvs[i0].dir == 99 || tmp_dvs[i0].dir == -1)) {
					if ((tmp_dvs[i0].fsc == 114 || tmp_dvs[i0].fsc == 108)&& (tmp_dvs[i0].dir == 99 || tmp_dvs[i0].dir == -1 || tmp_dvs[i0].dir == -2)) { // Leon modified
						//第四碼是區別饋線用，同一組饋線用同一個數字
                        new_tmp_dvs.push([tmp_dvs[i0].fsc, tmp_dvs[i0].ufid, tmp_dvs[i0].dir, tmp_dvs[i0].fdr1]);
                        if (!FeederIDs.includes(tmp_dvs[i0].fdr1)) {
                            FeederIDs.push(tmp_dvs[i0].fdr1);
                        }
					}
                }
                /*
                 * Gary Lu 20210119
                 * 到這裡資料還要經過整理才能放到newdvs陣列去往後端拋，另外到這裡，FeederIDs有幾個元素就是找到有幾組問題饋線
                 */
                var new_tmp_dvs_feeder = [];//同一個feeder的放這裡
                for (i0 = 0; i0 < FeederIDs.length; i0 += 1) {
                    var fdr = FeederIDs[i0];
                    for (i1 = new_tmp_dvs.length - 1; i1 >= 0; i1 -= 1) {
                        if (new_tmp_dvs[i1][3] == fdr) {
                            new_tmp_dvs_feeder.push(new_tmp_dvs.splice(i1,1)[0]);
                        }
                    }
                    //饋線編號為fdr的饋線到這裡，已經脫離new_tmp_dvs，搬到new_tmp_dvs_feeder內了
                    //接著來找斷路器
                    var BreakerFound = null;
                    for (i1 = 0; (i1 < new_tmp_dvs_feeder.length && BreakerFound == null); i1 += 1) {
                        if (new_tmp_dvs_feeder[i1][0] == 108) {
                            BreakerFound = i1;
                        }
                    }
                    /*
                     * BreakerFound紀錄者這條問題饋線有沒有斷路器(SOON SAID若有就只一個(所以上方流程是BreakerFound不是NULL就出迴圈))
                     * 有:Breaker在陣列中索引，無則還是null
                     * So,BreakerFound有東西時就把那東西放進newdvs,沒有時則是陣列內所有元素都進去
                     */
                    if (BreakerFound != null) {
                        newdvs.push(new_tmp_dvs_feeder[BreakerFound]);
                    } else {
                        while (new_tmp_dvs_feeder.length > 0) {
                            newdvs.push(new_tmp_dvs_feeder.splice(0, 1)[0]);
                        }
                    }
                }
				$.get(window.getRootPath() + "/GisMap/GetPowerRateV2", function (res) {
					if (res[0].message == "success") {
						var powerratelist = res[0].feederpowerratearray;
						var powerratemessage = "";
						for(var i = 0 ; i < powerratelist.length; i++)
						{
							var objres = powerratelist[i];
							powerratemessage = powerratemessage + objres.feedername + " 停電區間負載量：" + parseFloat(objres.feederpowerrate).toFixed(2) + "千瓦<br />";
						}
						powerratemessage = powerratemessage + "停電區間總負載量：" +  parseFloat(res[0].totalpowerrate).toFixed(2) + "千瓦";
						$("#divPowerShow").height(36 + 35 * (powerratelist.length));
						$("#divPowerShow").html(powerratemessage);
						$("#divPowerShow").show();
					}
				});
			}

            var tmp_pms = [];
            for (var i = 0; i < tmp_dvs.length; i++) {
                var dv = tmp_dvs[i];
                var id = dv.fsc.toString() + "." + dv.ufid.toString();
                var pms = _3DMouseUpDown.g_pms[id];
                if (pms == null)
				{
					// 此 dv 對應的 pms 未載入, 為確保下次依然 CheckChange 會判為有變更再次進入這裡
					// 刻意將此 dv 的任意屬性調整, 目的是使下次 SameDevice 一定被判為 false
					dv.ufid = -1;
                    continue;
				}

				for (var j = 0; j < pms.length; j++)
				{
					var pm = pms[j];
					if ((IsPlacemark(pm) && pm.GetMeshes() == null) || (!IsPlacemark(pm) && pm.parent.VecBuf == null))
					{
						// 此 pm 未載入, 同上
						dv.ufid = -1;
						continue;
					}
					var clr;
					if (dv.dir == 99) // 不通電
						clr = [0, 0, 0];
					else if (dv.dir == -1) // 視為故障
						clr = [1, 0, 0];
					else if (dv.dir == -2) // 視為異常
						clr = [0, 0, 0];
					else
						clr = HexToRGB(dv.clr);
					
					_3DMouseUpDown.Highlight(pm, false, null, clr);
					if (dv.fsc == 106) // 導線
					{
						var oid = GetValue(pm, "oid");
						pm.dir_changed = true;
						UpdateSurface(pm, dv.dir, clr);
						//取得出狀況饋線的編號、最大最小邊界
						var dirstring = (dv.dir != 99 && dv.dir != -1 && dv.dir != -2) ? "1" : dv.dir.toString();
						var name = dv.fdr1.toString() + ":" + dirstring;
						var ext = pm.extent;
						var fl = eventMarkers.fdr_labels[name];
						if (!fl)
							fl = eventMarkers.fdr_labels[name] = ext;
						else
						{
							fl.xmin = Math.min(fl.xmin, ext.xmin);
							fl.ymin = Math.min(fl.ymin, ext.ymin);
							fl.xmax = Math.max(fl.xmax, ext.xmax);
							fl.ymax = Math.max(fl.ymax, ext.ymax);
						}
						
					}
					tmp_pms.push(pm);
				}
            }
			// 針對出狀況的饋線，建立醒目label標示
			
			for (var i in eventMarkers.fdr_labels)
			{
				var state = i.split(":")[1];
				var ext = eventMarkers.fdr_labels[i];
				if (state == -1)
				{
					state = "Fault";
					$("#FaultLocation").css('display', 'flex');
				}
				else if (state == -2)
				{					
					state = "Shortcircuit";
					$("#ShortcircuitLocation").css('display', 'flex');
				}
				else if (state == 99)
				{
					state = "Poweroff";
					$("#PoweroffLocation").css('display', 'flex');
				}
				else
				{
					state = "Transfer";
					$("#TransferLocation").css('display', 'flex');
				}
				var loc = { X: (ext.xmin + ext.xmax) / 2, Y:(ext.ymin + ext.ymax) / 2, Z: 0 };
				var marker = new SuperGIS.Marker(earth_, loc, "", window.getRootPath() + "/images/" + state + ".png",{FixedSize : true});
				var pmlabel = marker.getPlacemark();
				pmlabel.DDDSymbol.Size = 60;
				pmlabel.DDDSymbol.DynamicSize = false;
				pmlabel.Visible = eventMarkers.VisibleFlag;
				if (state == "Fault")
					eventMarkers.MFault.push(pmlabel);
				else if (state == "Shortcircuit")
					eventMarkers.MShortcircuit.push(pmlabel);
				else if (state == "Poweroff")
					eventMarkers.MPoweroff.push(pmlabel);
				else
					eventMarkers.MTransfer.push(pmlabel);
			}
			
			

            // 若這次要變更的還是在上次的 dirty_pms 中, 不用還原
            for (var i = 0; i < _3DMouseUpDown.dirty_pms.length; i++) {
                var pm = _3DMouseUpDown.dirty_pms[i];
                var found = false;
                for (var j = 0; j < tmp_pms.length; j++) {
                    if (pm == tmp_pms[j]) {
                        found = true;
                        break;
                    }
                }
                if (found)
                    continue;

                var clr = HexToRGB(GetValue(pm, "symcolor"));
				if (pm.GeoType == 2) // 設備
				{
					var tid = GetValue(pm, "tid");
					var ostatus = GetValue(pm, "ostatus");
					if (tid == 114 && ostatus == 0) // 常用開關為黑
						clr = [0, 0, 0];
				}
                _3DMouseUpDown.Highlight(pm, false, null, clr);
                if (pm.dir_changed) {
                    var dir = GetValue(pm, "dir");
                    UpdateSurface(pm, dir);
                    pm.dir_changed = null;
                }
            }
            _3DMouseUpDown.dirty_pms = tmp_pms;
            _3DMouseUpDown.changedDevices = tmp_dvs;
			
            setTimeout(function () { _3DMouseUpDown.CheckChangeInfo(); }, _3DMouseUpDown.changeinfo_interval);
        }
    }
    ,
    RestoreDefault: function () {
        for (var i = 0; i < _3DMouseUpDown.dirty_pms.length; i++) {
            var pm = _3DMouseUpDown.dirty_pms[i];
			var clr = GetValue(pm, "symcolor");
            clr = HexToRGB(clr);
            if (pm.GeoType == 2) // 設備
            {
                var tid = GetValue(pm, "tid");
                var ostatus = GetValue(pm, "ostatus");
                if (tid == 114 && ostatus == 0) // 常用開關為黑
                    clr = [0, 0, 0];
            }
            _3DMouseUpDown.Highlight(pm, false, null, clr);
            if (pm.dir_changed) {
                var dir = GetValue(pm, "dir");
                UpdateSurface(pm, dir);
                pm.dir_changed = null;
            }
        }
		_3DMouseUpDown.EventMarkerClear();
        _3DMouseUpDown.changedDevices = [];
    }
	,
	SortDevices: function(d1,d2){
		return (d1.ufid - d2.ufid);
	}
};