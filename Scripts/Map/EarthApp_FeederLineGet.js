var GFeederLineGetFunction = function (pParent, pEarth, callback) {
    ToolWindowBase.call(this, pParent, {
        Class: "GFeederLineGetFunction"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members 定義開始  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 自身的代稱
     * */
    //var that = this;
    this.getFeederLine = function () {
        _3DMouseUpDown.MouseType = ClickFor.GetFeederLineRange;
        pEarth.addEventListener("mousedown", funcMouseDown, false, true);
    }

    this.addFeederLine = function (obj) {
        FeederAni_Add(obj);
    }

    this.removeFeederLine = function (s) {
        Feeder_Del(s);
    }

    function FeederAni_Add(obj,data) {
        let $obj = $("#" +　obj);
        let txt = data ? data : $("#transferInputNo").val();
        if (txt == "")
            return;
        // 檢查有無重複
        var repeated = false;
        $obj.find("li").each(function () {
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
        $obj.append("<li targetval='" + txt + "'>" + txt + "<span class='topology_removeitem' style='right:0;width:20px;height:20px;'><img src='./images/ToolWindow/Topology/Rubbishbin.svg'></span></li>");
        $obj.find("li").find("span").find("img").click(function () {
            var ti = null;
            for (var i = 0; (ti == null && i < $obj.find("li").length); i += 1) {
                if ($obj.find("li")[i] == $(this).parent().parent()[0]) {
                    ti = i;
                }
            }
            FeederAni_Del(ti);
        });
    }

    function FeederAni_Del(ti) {
        if (ti == null) {
            return;
        }
        var select = document.getElementById("FeederLineRangeBox");
        select.removeChild(select.childNodes[ti]);
    }

    function funcMouseDown(tEvent) {
        down_x = tEvent.x;
        down_y = tEvent.offsetY;
        pEarth.addEventListener("mouseup", funcMouseUp, false, true);
    }

    function funcMouseUp(tEvent) {
        pEarth.removeEventListener("mouseup", funcMouseUp, false, true);
        if (tEvent.x != down_x || tEvent.offsetY != down_y)
            return;  
        switch (_3DMouseUpDown.MouseType) {
            case ClickFor.GetFeederLineRange:
                //單點查詢沒事
                //拓樸圖形結構演算
                var pm = _3DMouseUpDown.PickPlacemark(down_x, down_y);
                if (!pm) {
                    $("#iptFeederID_Analysis").val("");
                    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
                    return;
                }
                var tid = GetValue(pm, "tid");
                var oid = GetValue(pm, "oid");
                //照點選查詢的流程辦理，但對於取回的資料，饋線編號以外全都不要了
                $.post("./GisMap/GetInfoWindowData", { TID: tid, OID: oid }, function (EI) {
                    if (EI.ProcessFlag == true) {
                        var obj = JSON.parse(EI.ProcessMessage);
                        FeederAni_Add("FeederLineRangeBox",obj.FeederID);
                    }
                    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
                    pEarth.removeEventListener("mousedown", funcMouseDown, false, true);
                });
                break;
        }
    }
};