/**
 * 告警資訊一覽
 * */

var INERAlertings = {
    AL1s: { VisibleFlag: false, Markers: [] } //狀態估測，告警Marker預設為fasle 1100811 Soon
    ,
    AL2s: { VisibleFlag: false, Markers: [] } //狀態估測，告警Marker預設為fasle 1100811 Soon
    ,
    AL3s: { VisibleFlag: false, Markers: [] } //狀態估測，告警Marker預設為fasle 1100811 Soon
    ,
    /**
     * 初始化標示資訊
     * */
    Initialize: function () {
        $.post("../GisMap/GetActivatingAlerts", null, function (rets) {
            if (rets.ProcessFlag) {
                var arrAlerts = JSON.parse(rets.ProcessMessage);
                var TPCC = new TaipowerCoordinateTransform();
                console.log(arrAlerts);
                for (var i = 0; i < arrAlerts.length; i += 1) {
                    var Alerti = arrAlerts[i];
                    if (Alerti.acoor != null && TPCC.TPCPointIsValid(Alerti.acoor)==undefined) {
                        Alerti.loc3857 = arrAlerts[i].loc3857 = TPCC.TPCPointToEPSG3857(Alerti.acoor);
						var label = Alerti.ename + "," + Alerti.pname + "," + Alerti.remark;
                        var mkr = new SuperGIS.Marker(earth_, Alerti.loc3857, "", "../images/Notification/AL" + Alerti.alvl.toUpperCase().replace("A", "").replace("L", "") + ".svg",{
							Hitable : true,
							HaloColor : {
								r : 0,
								g : 0,
								b : 0,
								a : 255
							},
							TextColor : {
								r : 255,
								g : 219,
								b : 25,
								a : 255
							},
							FontSize : 12
						});
                        var pm = mkr.getPlacemark();
                        pm.DDDSymbol.Size = 24;
                        pm.DDDSymbol.DynamicSize = false;
                        switch ("AL"+Alerti.alvl.toUpperCase().replace("A", "").replace("L", "")) {
                            case "AL1":
								pm.Visible = INERAlertings.AL1s.VisibleFlag;
                                INERAlertings.AL1s.Markers.push(pm);								
                                break;
                            case "AL2":
								pm.Visible = INERAlertings.AL2s.VisibleFlag;
                                INERAlertings.AL2s.Markers.push(pm);
                                break;
                            case "AL3":
								pm.Visible = INERAlertings.AL3s.VisibleFlag;
                                INERAlertings.AL3s.Markers.push(pm);
                                break;
                        }
                    }
                }
            }
        });
    }
    ,
    /**
     * 告警標示開關
     * @param {any} levelcode 警示層級(1,2,3)
     */
    SwitchMarkers: function (levelcode) {
        var i;
        switch (levelcode) {
            case 1:
                INERAlertings.AL1s.VisibleFlag = !INERAlertings.AL1s.VisibleFlag;
                for (i = 0; i < INERAlertings.AL1s.Markers.length; i += 1) {
                    var pm = INERAlertings.AL1s.Markers[i];
                    pm.Visible = INERAlertings.AL1s.VisibleFlag;
                }
                break;
            case 2:
                INERAlertings.AL2s.VisibleFlag = !INERAlertings.AL2s.VisibleFlag;
                for (i = 0; i < INERAlertings.AL2s.Markers.length; i += 1) {
                    var pm = INERAlertings.AL2s.Markers[i];
                    pm.Visible = INERAlertings.AL2s.VisibleFlag;
                }
                break;
            case 3:
                INERAlertings.AL3s.VisibleFlag = !INERAlertings.AL3s.VisibleFlag;
                for (i = 0; i < INERAlertings.AL3s.Markers.length; i += 1) {
                    var pm = INERAlertings.AL3s.Markers[i];
                    pm.Visible = INERAlertings.AL3s.VisibleFlag;
                }
                break;
        }
    }
};