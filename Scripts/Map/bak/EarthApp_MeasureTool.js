/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  這是把量測工具獨立出來成單獨一個JS檔
//  需要使用時請先include好EarthApp.js 與 EarthApp_ToolWindow.js 以維持正常運作
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 測量工具窗格
 * @param {any} pParent 上層視窗
 * @param {any} pEarth 3D地圖
 * @param {any} callback
 */
var GMeasureDialog = function (pParent, pEarth, callback) {
    //基於繼承，這個是一定要先call的
    ToolWindowBase.call(this, pParent, {
        Class: "GMeasureDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    var that = this;
    /**
     * 覆寫關閉事件
     * */
    this.Close = function () {
        document.body.style.cursor = "default";
        //點選查詢回復
        _3DMouseUpDown.MouseType=ClickFor.PointQuery;

        ClearMeasure();
        var pNavi = pEarth.GetCurrentTool();
        pNavi.ExitTool();
        pNavi.DoubleClickEnable = true;
        pNavi.InitTool(pEarth);

        pEarth.removeEventListener("MouseDown", funcMouseDown, false, true);
        pEarth.removeEventListener("MouseMove", funcMouseMove, false, true);

        this.Destroy();
        this.raiseEvent("Closed");
    };
    /**
     * 座標轉換器。
     * */
    this.TPC = new TaipowerCoordinateTransform();
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members在上, Member functions在下  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
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
        if (intMeasure == i && ReadMeBox.getNode().children.length > 0) {
            return;
        }
        intMeasure = i;
        ReadMeBox.clearChildren();
        MeasureDataBox.clearChildren();
        switch (i) {
            case 0:
                //坐標量測
                ReadMeBox.appendText("以滑鼠點擊地圖新增點，量測坐標。");
                MeasureDataBox.appendText("TWD97:");
                MeasureDataBox.appendObject("br", null, null);
                MeasureDataBox.appendText("WGS84:");
                MeasureDataBox.appendObject("br", null, null);
                MeasureDataBox.appendText("圖號坐標:");
                break;
            case 1:
                //距離量測
                ReadMeBox.appendText("以滑鼠點擊地圖新增線段起點，再點擊一次決定線段終點，量測出線段的直線距離。");
                MeasureDataBox.appendText("線段長度:");
                break;
            case 2:
                //面積量測
                ReadMeBox.appendText("以滑鼠點擊地圖框出您欲測量的範圍，雙擊後顯示多邊形的水平面積。");
                ReadMeBox.appendObject("br", null, null);
                ReadMeBox.appendText("註:有地形效果時，計算結果不是地形的表面積。");
                MeasureDataBox.appendText("面積:");
                break;
            case 3:
                //高度量測
                ReadMeBox.appendText("以滑鼠點擊地圖新增起始點，移動滑鼠決定高度後，再點擊一次顯示兩點高度差。");
                MeasureDataBox.appendText("高度差:");
                break;
        }
    }
    /**
     * 更新座標量測結果
     * @param {any} pt 經緯度點座標
     */
    function UpdatePointResult(pt) {
        var pt97 = that.TPC.LngLatToTWD97(pt);
        var ptTPC = that.TPC.LngLatToTPCPoint(pt);
        MeasureDataBox.clearChildren();
        MeasureDataBox.appendText("TWD97:" + pt97.X.toFixed(0) + "," + pt97.Y.toFixed(0));
        MeasureDataBox.appendObject("br", null, null);
        MeasureDataBox.appendText("WGS84:" + pt.X.toFixed(5) + "," + pt.Y.toFixed(5));
        MeasureDataBox.appendObject("br", null, null);
        MeasureDataBox.appendText("圖號坐標:" + ptTPC);
    }
    function UpdateLineResult(dist) {
        var e1;
        e1 = "線段長度:";
        if (pSRef)
            e1 += dist_cur.toFixed(2) + " 公尺";
        else
            e1 += dist_cur.toString();
        MeasureDataBox.clearChildren();
        MeasureDataBox.appendText(e1);
    }
    function UpdateAreaResult(area, dist) {
        //面積量測
        MeasureDataBox.clearChildren();
        var e1, e2;
        if (pSRef)
            e1 = area.toFixed(2) + " 平方公尺";
        else
            e1 = area.toString();
        if (pSRef)
            e2 = dist_sum.toFixed(2) + "m";
        else
            e2 = dist_sum.toString();
        MeasureDataBox.appendText("面積:" + e1);
        MeasureDataBox.appendObject("br", null, null);
        MeasureDataBox.appendText("周長:" + e2);
    }
    /**
     * 更新高度量測結果數據
     * @param {any} diff 高度量測結果
     */
    function UpdateHeightResult(diff) {
        MeasureDataBox.clearChildren();
        MeasureDataBox.appendText("高度差:" + diff.toFixed(2) + "m");
    }
    /*************************************************************************************************************************
     * MOVE CODE FROM 欣中系統
     *************************************************************************************************************************/
    // 功能移植

    var nMode = 0;
    var pScene = pEarth.GetScene();
    var pCam = pEarth.GetCamera();
    var pGlobe = pEarth.GetGlobe();
    var pSRef = SpatialReference.ImportFromWKT(pGlobe.GetSpatialReference());
    var SR_4326 = EPSG.CreateSpatialReference(4326);
    var SR_3857 = EPSG.CreateSpatialReference(3857);

    var down_Loc = null;
    var last_Board = null;
    var current_Board = null;
    var cur_Segment = null;
    var cur_Segments = [];

    var dist_sum = 0;
    var dist_cur = 0;
    var line_width = 0;
    var vertex_Locs = [];
    var measure_Marks = [];
    var isMeasureing = false;
    var pVerticalGroundMarker = null;
    var pVerticalMarker = null;
    var pVerticalExtrude = null;

    var pNavi = pEarth.GetCurrentTool();
    pNavi.ExitTool();
    pNavi.DoubleClickEnable = false;
    pNavi.InitTool(pEarth);

    function RayTest(pori1, pdir1, pori2, pdir2) {
        var ori1 = SuperGIS.DDDCore.Vector3.ToVec3(pori1);
        var dir1 = SuperGIS.DDDCore.Vector3.ToVec3(pdir1);
        var ori2 = SuperGIS.DDDCore.Vector3.ToVec3(pori2);
        var dir2 = SuperGIS.DDDCore.Vector3.ToVec3(pdir2);
        var cdir = vec3.cross(dir1, dir2, [0, 0, 0]);
        var clen = vec3.dot(cdir, cdir);
        var len = 0;
        if (clen != 0) {
            var tvtr = vec3.subtract(ori2, ori1, [0, 0, 0]);
            var cvtr = vec3.scale(cdir, vec3.dot(tvtr, cdir) / clen, [0, 0, 0]);
            var adir = vec3.cross(vec3.subtract(tvtr, cvtr, [0, 0, 0]), dir1);
            len = vec3.dot(adir, cdir) / clen;
        }
        return SuperGIS.DDDCore.Vector3.NewVector3(vec3.add(vec3.scale(dir2, len, [0, 0, 0]), ori2));
    }

    function AddThousand(num) {
        var len = num.length;
        var len2 = 0;
        var pos = num.indexOf('.');
        if (pos != -1)
            len2 = len - pos;

        var cnt = Math.floor((len - len2 - 1) / 3);
        for (var i = 0; i < cnt; i++) {
            var pos = len - len2 - (i + 1) * 3;
            num = num.slice(0, pos) + ',' + num.slice(pos);
        }
        return num;
    }

    function FormatDist(dist) {
        if (!pSRef)
            return dist.toString();

        if (dist < 1000)
            return AddThousand(dist.toFixed(2)) + " m";
        else
            return AddThousand((dist / 1000).toFixed(2)) + " km";
    }

    function FormatArea(area) {
        if (!pSRef)
            return area.toString();

        if (area > 1000000)
            return AddThousand((area / 1000000).toFixed(2)) + " km\xB2";
        else
            return AddThousand(area.toFixed(2)) + " m\xB2";
    }

    function CalcDist(x1, y1, x2, y2) {
        if (pGlobe.IsGCS()) {
            var pt1 = { X: x1, Y: y1, Z: 0 };
            var pt2 = { X: x2, Y: y2, Z: 0 };
            pt1 = SpatialReference.CoordinateTransform(SR_4326, SR_3857, null, pt1);
            pt2 = SpatialReference.CoordinateTransform(SR_4326, SR_3857, null, pt2);
            return Math.sqrt((pt2.X - pt1.X) * (pt2.X - pt1.X) + (pt2.Y - pt1.Y) * (pt2.Y - pt1.Y));
        }
        else
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function CalcArea(XY) {
        var area = 0;
        var j = XY.length - 1;
        for (var i = 0; i < XY.length; i++) {
            area += (XY[j][0] + XY[i][0]) * (XY[j][1] - XY[i][1]);
            j = i;
        }
        return Math.abs(area / 2);
    }
    var tmp_Position = null;
    function GeodeticFromDevice(x, y) {
        if (tmp_Position == null)
            tmp_Position = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
        else {
            var nWidth = pScene.GetWidth();
            var nHeight = pScene.GetHeight();
            tmp_Position.X = x / nWidth * 2 - 1;
            tmp_Position.Y = 1 - y / nHeight * 2;
        }

        var CurLocation;
        var pPick = pEarth.Objects.Picking(SuperGIS.DDDCore.RenderPriority.Unknown, pCam.EyeAt, pCam.Ray(tmp_Position), 0);
        if (pPick != null)
            CurLocation = pPick.GetLocate();
        else
            CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(tmp_Position), 1, false);

        var globeLoc = pGlobe.GeodeticFromCartesian2(CurLocation);
        return globeLoc;
    }

    function GetSegment(loc1, loc2, pOriSegment) {
        var x1 = loc1[0];
        var y1 = loc1[1];
        var z1 = loc1[2] + 1;
        var x2 = loc2[0];
        var y2 = loc2[1];
        var z2 = loc2[2] + 1;
        var rad = Math.atan((y2 - y1) / (x2 - x1));
        var dx = line_width * Math.sin(rad);
        var dy = line_width * Math.cos(rad);

        var corners = [];
        corners.push([x1 - dx, y1 + dy, z1]);
        corners.push([x2 - dx, y2 + dy, z2]);
        corners.push([x2 + dx, y2 - dy, z2]);
        corners.push([x1 + dx, y1 - dy, z1]);
        corners.push([x1 - dx, y1 + dy, z1]);

        var wkt = "POLYGON((";
        for (var k = 0; k < 5; k++) {
            var x = corners[k][0];
            var y = corners[k][1];
            var z = corners[k][2];
            wkt += parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(z);
            if (k < 4)
                wkt += ",";
            else
                wkt += "))";
        }

        if (pOriSegment == null) {
            var pSegment = pEarth.CreatePlacemark("", wkt);
            pSegment.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 0.45, 0.08, 0.6)), null);
            pEarth.PlacemarkObjects.Add(pSegment);
            measure_Marks.push(pSegment);
            return pSegment;
        }
        else {
            pOriSegment.Geometry = wkt;
            pOriSegment.SetDirty();
            return pOriSegment;
        }
    }

    function GetSegmentWKT(loc1, loc2) {
        var x1 = loc1[0];
        var y1 = loc1[1];
        var x2 = loc2[0];
        var y2 = loc2[1];
        var rad = Math.atan((y2 - y1) / (x2 - x1));
        var dx = line_width * Math.sin(rad);
        var dy = line_width * Math.cos(rad);

        var ox = x2 - x1;
        var oy = y2 - y1;
        x2 = x1 + ox;
        y2 = y1 + oy;

        var corners = [];
        corners.push([x1 - dx, y1 + dy]);
        corners.push([x2 - dx, y2 + dy]);
        corners.push([x2 + dx, y2 - dy]);
        corners.push([x1 + dx, y1 - dy]);
        corners.push([x1 - dx, y1 + dy]);

        var wkt = "POLYGON((";
        for (var k = 0; k < 5; k++) {
            var x = corners[k][0];
            var y = corners[k][1];
            wkt += parseFloat(x) + " " + parseFloat(y);
            if (k < 4)
                wkt += ",";
            else
                wkt += "))";
        }
        return wkt;
    }

    function GetSegment2(loc1, loc2, pOriSegments) {
        var x1 = loc1[0];
        var y1 = loc1[1];
        var z1 = loc1[2] + 1;
        var x2 = loc2[0];
        var y2 = loc2[1];
        var z2 = loc2[2] + 1;
        var rad = Math.atan((y2 - y1) / (x2 - x1));
        var dx = line_width * Math.sin(rad);
        var dy = line_width * Math.cos(rad);

        var div = 1; // 11;
        var ox = (x2 - x1) / div;
        var oy = (y2 - y1) / div;
        var oz = (z2 - z1) / div;

        var pOriSegment = null;
        for (var i = 0; i < div; i++) {
            if (pOriSegments.length == div)
                pOriSegment = pOriSegments[i];

            x2 = x1 + ox;
            y2 = y1 + oy;
            z2 = z1 + oz;

            var corners = [];
            corners.push([x1 - dx, y1 + dy, z1]);
            corners.push([x2 - dx, y2 + dy, z2]);
            corners.push([x2 + dx, y2 - dy, z2]);
            corners.push([x1 + dx, y1 - dy, z1]);
            corners.push([x1 - dx, y1 + dy, z1]);

            var wkt = "POLYGON((";
            for (var k = 0; k < 5; k++) {
                var x = corners[k][0];
                var y = corners[k][1];
                var z = corners[k][2];
                wkt += parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(z);
                if (k < 4)
                    wkt += ",";
                else
                    wkt += "))";
            }

            if (pOriSegment == null) {
                var pSegment = pEarth.CreatePlacemark("", wkt);
                var color;
                if (i % 2)
                    color = pEarth.CreateColor(1, 1, 1, 0.6);
                else
                    color = pEarth.CreateColor(1, 0.45, 0.08, 0.6);
                pSegment.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, color), null);
                pEarth.PlacemarkObjects.Add(pSegment);
                measure_Marks.push(pSegment);
                pOriSegments.push(pSegment);
            }
            else {
                pOriSegment.Geometry = wkt;
                pOriSegment.SetDirty();
            }

            x1 = x2;
            y1 = y2;
            z1 = z2;
        }

        return pOriSegments;
    }

    function CircleToPolygon(cx, cy, radius) {
        var length = radius;
        var N = 30;
        var xy = [];
        var CV_PI = 3.1416;
        for (var i = 0; i < N; i++) {
            var x = cx + length * Math.cos(i * 2 * CV_PI / N);
            var y = cy + length * Math.sin(i * 2 * CV_PI / N);
            xy.push([x, y]);
        }
        xy.push([cx + length, cy]);
        return xy;
    }

    function AddVertex(loc, radius, ZOffset) {
        var xy = CircleToPolygon(loc[0], loc[1], radius);
        var wkt = "POLYGON((";
        for (var i in xy) {
            wkt += xy[i][0].toString() + ' ';
            wkt += xy[i][1].toString();
            if (i != xy.length - 1)
                wkt += ','
        }
        wkt += "))";
        var marker = pEarth.CreatePlacemark("", wkt);
        marker.PreserveGeometry = true;
        marker.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 0.45, 0.08, 1)), null);
        marker.ReplaceZ = loc[2] + ZOffset;
        pEarth.PlacemarkObjects.Add(marker);
        measure_Marks.push(marker);
        return marker;
    }

    function funcMouseDown(x, y, b, k) {
        bDown = true;
        down_x = x;
        down_y = y;

        pEarth.addEventListener("MouseUp", funcMouseUp, false, true);
    }

    function funcMouseMove(x, y, b, k) {
        if (intMeasure == 1 || intMeasure == 2) {
            if (isMeasureing && measure_Marks.length != 0) {
                var board_height = pEarth.GetCamera().Position.Z / 10;
                if (intMeasure == 1) {
                    var cur_Loc = GeodeticFromDevice(x, y);
                    cur_Segments = GetSegment2(down_Loc, cur_Loc, cur_Segments);
                    dist_cur = CalcDist(down_Loc[0], down_Loc[1], cur_Loc[0], cur_Loc[1]);

                    current_Board.Name = FormatDist(dist_cur);
                    current_Board.ReplaceZ = board_height;
                    current_Board.DefaultElevation = (down_Loc[2] + cur_Loc[2]) / 2;
                    current_Board.Geometry = "POINT(" + parseFloat((down_Loc[0] + cur_Loc[0]) / 2) + " " + parseFloat((down_Loc[1] + cur_Loc[1]) / 2) + ")";
                    current_Board.SetDirty();
                    UpdateLineResult(dist_cur);
                }
                else {
                    var cur_Loc = GeodeticFromDevice(x, y);
                    cur_Segment = GetSegment(down_Loc, cur_Loc, cur_Segment);
                    dist_cur = CalcDist(down_Loc[0], down_Loc[1], cur_Loc[0], cur_Loc[1]);

                    current_Board.Name = FormatDist(dist_cur);
                    current_Board.ReplaceZ = board_height;
                    current_Board.DefaultElevation = cur_Loc[2];
                    current_Board.Geometry = "POINT(" + parseFloat(cur_Loc[0]) + " " + parseFloat(cur_Loc[1]) + ")";
                    current_Board.SetDirty();
                }
                pEarth.Invalidate();
            }
        }
        else if (intMeasure == 3) {
            if (pVerticalExtrude != null && isMeasureing) {
                var CurPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
                if (CurPosition == null)
                    return;

                var CurLocation = RayTest(pCam.EyeAt, pCam.Ray(CurPosition), pRefLocation, pGlobe.UpDirection(pRefLocation));
                var pt = pGlobe.GeodeticFromCartesian(CurLocation);
                if (pt.Z < pVerticalGroundMarker.ReplaceZ) {
                    pVerticalExtrude.DefaultElevation = pt.Z;
                    pVerticalExtrude.ReplaceZ = pVerticalGroundMarker.ReplaceZ - pt.Z;
                    pVerticalExtrude.ReplaceZ = pVerticalGroundMarker.ReplaceZ - pt.Z;
                }
                else {
                    pVerticalExtrude.DefaultElevation = pVerticalGroundMarker.ReplaceZ;
                    pVerticalExtrude.ReplaceZ = pt.Z - pVerticalGroundMarker.ReplaceZ;
                }
                pVerticalExtrude.SetDirty();
                pVerticalMarker.ReplaceZ = pt.Z;
                pVerticalMarker.SetDirty();
                var diff = pt.Z - pVerticalGroundMarker.ReplaceZ;
                UpdateHeightResult(diff);
                pEarth.Invalidate();
            }
        }
    }

    function funcMouseUp(x, y, b, k) {
        pEarth.removeEventListener("MouseUp", funcMouseUp, false, true);
        bDown = false;
        var bMoved = (x != down_x || y != down_y);
        down_x = down_y = null;
        if (bMoved)
            return false;

        var CurPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
        if (CurPosition == null)
            return;

        var CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(CurPosition), 1, false);
        var pPick = pEarth.Objects.Picking(SuperGIS.DDDCore.RenderPriority.Ground, pCam.EyeAt, pCam.Ray(CurPosition), 0);
        if (pPick != null)
            CurLocation = pPick.GetLocate();
        var pt = pGlobe.GeodeticFromCartesian(CurLocation);
        pt = { X: pt.X, Y: pt.Y, Z: pt.Z };
        switch (intMeasure) {
            //目前選到哪個功能
            case 0:
                //坐標量測
                ClearMeasure();

                var loc = SuperGIS.DDDEarth.LatLonAlt.NewLatLonAlt(pt.Y, pt.X, pt.Z);
                var marker = new SuperGIS.Marker(pEarth, loc, "", "../map.svg");
                var pm = marker.getPlacemark();
                pm.DDDSymbol.Size = 30;
                pm.DDDSymbol.DynamicSize = false;
                measure_Marks.push(marker.getPlacemark());
                //Gary Lu 20201022:傳來的XY是EPSG3857,弄成經緯度再處理
                UpdatePointResult({ X: pt.X * 180 / 20037508.34, Y: Math.atan(Math.exp(pt.Y * Math.PI / 20037508.34)) * 360 / Math.PI - 90, Z: pt.Z });

                if (callback)
                    callback({ Position: { X: pt.X, Y: pt.Y }, Altitude: pt.Z });
                break;
            
            case 1:
                //距離量測
                var old_Loc = down_Loc;
                down_Loc = GeodeticFromDevice(x, y);

                if (isMeasureing == false) {
                    ClearMeasure();
                    isMeasureing = true;
                    dist_sum = 0;
                    var h = pCam.Position.Z;
                    line_width = h * 0.00000004;
                    if (nMode == 1)
                        line_width *= 2;
                    if (!pGlobe.IsGCS())
                        line_width *= 100000;
                    last_Board = null;
                    current_Board = null;
                    vertex_Locs = [];
                }
                else {
                    isMeasureing = false;
                    AddVertex(down_Loc, line_width * 2, 1);
                    var wkt = GetSegmentWKT(old_Loc, down_Loc);
                    var res = pEarth.AddSurface("M-Line", wkt, "RGB(253, 126, 38, 0.6)");
                    // AddSurface 不成功是因為沒有 TileLayer 存在
                    if (res) {
                        for (var i in cur_Segments)
                            pEarth.PlacemarkObjects.Remove(cur_Segments[i]);
                    }

                    pEarth.Invalidate();
                    if (callback)
                        callback({ Length: dist_cur });
                    return;

                    if (cur_Segment == null) // 按了 DblClick
                        return;

                    dist_sum += dist_cur;
                    current_Board.Name = FormatDist(dist_sum);
                }

                vertex_Locs.push(down_Loc);

                AddVertex(down_Loc, line_width * 2, 1);

                if (current_Board) {
                    if (last_Board)
                        pEarth.PlacemarkObjects.Remove(last_Board);

                    last_Board = current_Board;
                }

                var loc = SuperGIS.DDDEarth.LatLonAlt.NewLatLonAlt(down_Loc[1], down_Loc[0], down_Loc[2]);
                var board = new SuperGIS.Marker(pEarth, loc, "", "");
                current_Board = board.getPlacemark();
                current_Board.DDDSymbol.Size = 0;
                current_Board.ExtrudeSymbol = pEarth.CreateSimpleDDDLineSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 1, 1)));
                //current_Board.ReplaceZ = 100;
                //current_Board.DefaultElevation = down_Loc[2];

                measure_Marks.push(current_Board);
                current_Board.TextSymbol.FontSize = 20;

                cur_Segment = null;
                cur_Segments = [];
                break;
            case 2:
                //面積量測
                var old_Loc = down_Loc;
                down_Loc = GeodeticFromDevice(x, y);

                if (isMeasureing == false) {
                    ClearMeasure();
                    isMeasureing = true;
                    dist_sum = 0;
                    var h = pCam.Position.Z;
                    line_width = h * 0.00000004;
                    if (nMode == 1)
                        line_width *= 2;
                    if (!pGlobe.IsGCS())
                        line_width *= 100000;
                    last_Board = null;
                    current_Board = null;
                    vertex_Locs = [];
                }
                else {

                    if (cur_Segment == null) // 按了 DblClick
                        return;

                    dist_sum += dist_cur;
                    current_Board.Name = FormatDist(dist_sum);
                }

                vertex_Locs.push(down_Loc);

                AddVertex(down_Loc, line_width * 2, 1);

                if (current_Board) {
                    if (last_Board)
                        pEarth.PlacemarkObjects.Remove(last_Board);

                    last_Board = current_Board;
                }

                var loc = SuperGIS.DDDEarth.LatLonAlt.NewLatLonAlt(down_Loc[1], down_Loc[0], down_Loc[2]);
                var board = new SuperGIS.Marker(pEarth, loc, "", "");
                current_Board = board.getPlacemark();
                current_Board.DDDSymbol.Size = 0;
                current_Board.ExtrudeSymbol = pEarth.CreateSimpleDDDLineSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 1, 1)));
                //current_Board.ReplaceZ = 100;
                //current_Board.DefaultElevation = down_Loc[2];

                measure_Marks.push(current_Board);
                current_Board.TextSymbol.FontSize = 20;

                cur_Segment = null;
                cur_Segments = [];
                break;
            case 3:
                //高度量測
                if (pVerticalExtrude == null) {
                    ClearMeasure();
                    isMeasureing = true;

                    pRefLocation = CurLocation;

                    down_Loc = GeodeticFromDevice(x, y);
                    var radius = pEarth.GetCamera().Position.Z / 50000000;
                    if (!pGlobe.IsGCS())
                        radius *= 100000;

                    pVerticalGroundMarker = AddVertex(down_Loc, radius * 5, 0);
                    pVerticalExtrude = AddVertex(down_Loc, radius, 0);
                    pVerticalExtrude.DefaultElevation = down_Loc[2];
                    pVerticalExtrude.ReplaceZ = 0;
                    pVerticalExtrude.ExtrudeSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 0, 0.6)), null);
                    pVerticalMarker = AddVertex(down_Loc, radius * 5, 0);
                }
                else {
                    isMeasureing = false;
                    pVerticalExtrude = null;
                    if (callback)
                        callback({ Elevation: pVerticalMarker.ReplaceZ - pVerticalGroundMarker.ReplaceZ });
                }
                break;
        }
        //if (nMode == 0) {
        //}
        //else if (nMode == 1 || nMode == 2) {

        //}

        pEarth.Invalidate();
        return false;
    }

    function funcDblClick(tEvent) {
        if (vertex_Locs.length < 3)
            return;

        var loc1 = vertex_Locs[vertex_Locs.length - 1];
        var loc2 = vertex_Locs[0];
        GetSegment(loc1, loc2, null); // 使首尾連
        vertex_Locs.push(vertex_Locs[0]);

        var min_x = Number.MAX_VALUE;
        var min_y = Number.MAX_VALUE;
        var max_x = -Number.MAX_VALUE;
        var max_y = -Number.MAX_VALUE;
        var max_h = -Number.MAX_VALUE;
        for (var i in vertex_Locs) {
            min_x = Math.min(vertex_Locs[i][0], min_x);
            min_y = Math.min(vertex_Locs[i][1], min_y);
            max_x = Math.max(vertex_Locs[i][0], max_x);
            max_y = Math.max(vertex_Locs[i][1], max_y);

            max_h = Math.max(vertex_Locs[i][2], max_h);
        }
        if (Math.round(max_h) == 0) // 使不要看到很小的科學記號值
            max_h = 0;
        max_h += 1; // 因所畫的線及節點都往上長 1

        var XYs = [];
        var wkt = "POLYGON((";
        for (var i in vertex_Locs) {
            var loc = vertex_Locs[i];
            var x = loc[0];
            var y = loc[1];
            var z = loc[2] + 1; // 因所畫的線及節點都往上長 1
            wkt += parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(max_h);
            if (i == vertex_Locs.length - 1)
                wkt += "))";
            else
                wkt += ",";

			/*if (max_h > z)
			{
				var wkt_line = "LINESTRING(" + parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(loc[2]) + "," +
											   parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(max_h) + ")";
				var extrude_line = pEarth.CreatePlacemark("", wkt_line);
				extrude_line.DDDSymbol = pEarth.CreateSimpleDDDLineSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 0, 0.6)));
				pEarth.PlacemarkObjects.Add(extrude_line);
				measure_Marks.push(extrude_line);
			}*/

            var pt = { X: x, Y: y, Z: 0 };
            if (pGlobe.IsGCS())
                pt = SpatialReference.CoordinateTransform(SR_4326, SR_3857, null, pt);
            XYs.push([pt.X, pt.Y]);
        }

        var area = CalcArea(XYs);
        var txt = FormatArea(area);

        var loc = SuperGIS.DDDEarth.LatLonAlt.NewLatLonAlt((min_y + max_y) / 2, (min_x + max_x) / 2, max_h);
        var board = new SuperGIS.Marker(pEarth, loc, txt, "");
        var pm = board.getPlacemark();
        pm.DDDSymbol.Size = 0;
        measure_Marks.push(pm);
        pm.TextSymbol.FontSize = 25;

		/*var surface = pEarth.CreatePlacemark("", wkt);
		surface.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 1, 0.3)), null);
		surface.DDDSymbol.Texture = surfaceTexture;
		pEarth.PlacemarkObjects.Add(surface);
		measure_Marks.push(surface);*/
        pEarth.AddSurface("M-Area", wkt, "RGB(253, 126, 38, 0.3)");

        var dist = CalcDist(loc1[0], loc1[1], loc2[0], loc2[1]);
        dist_sum += dist;
        last_Board.Name = FormatDist(dist_sum);
        UpdateAreaResult(area, dist_sum);

        if (callback)
            callback({ Area: area, Perimeter: dist_sum });

        vertex_Locs = [];
        isMeasureing = false;
        pEarth.Invalidate();
    }

    function ClearMeasure() {
        pEarth.RemoveSurface("M-Line");
        pEarth.RemoveSurface("M-Area");
        for (var i in measure_Marks) {
            pEarth.PlacemarkObjects.Remove(measure_Marks[i]);
            delete measure_Marks[i];
        }
        measure_Marks = [];
        isMeasureing = false;
        pVerticalExtrude = null;
        pEarth.Invalidate();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions在上， 必須執行的流程在下  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //暫時關閉點選查詢指令
    _3DMouseUpDown.MouseType=ClickFor.None;
    this.ScrollbarID = "MeasureBar";
    this.IconBox.src = "../images/ToolWindow/Measure.svg";
    this.LabelBox.innerText = "量測工具";
    this.SetShuttleSpace(6, 4);
    this.SetPageSwitchItems([
        { Text: "坐標量測", OnClick: function () { select(0); } },
        { Text: "距離量測", OnClick: function () { select(1); } },
        { Text: "面積量測", OnClick: function () { select(2); } },
        { Text: "高度量測", OnClick: function () { select(3); } },
    ]);
    var MeasureTable = this.BodyCell.appendObject("table", { class: "MeasureToolBoxBody" }, null);
    var Row1 = MeasureTable.appendObject("tr", null, null);
    var ReadMeBox = Row1.appendObject("td", { class: "MeasureToolReadMe MeetTop" }, null);
    var Row2 = MeasureTable.appendObject("tr", null, null);
    Row2.appendObject("hr", null, null);
    var Row3 = MeasureTable.appendObject("tr", null, null);
    var MeasureDataBox = Row3.appendObject("td", { class: "MeasureToolNumeric MeetTop" }, null);
    select(Supergeo.IfNull(intMeasure, 0));
    pEarth.addEventListener("MouseDown", funcMouseDown, false, true);
    pEarth.addEventListener("MouseMove", funcMouseMove, false, true);
    pEarth.addEventListener("dblclick", funcDblClick, false);
};