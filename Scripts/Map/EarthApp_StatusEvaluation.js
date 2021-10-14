var count = 0;
var calculateTime = 5;
var feederID = "";
var GStatusDialog = function (pParent, pEarth, callback) {
    //����~�ӡA�o�ӬO�@�w�n��call��
    ToolWindowBase.call(this, pParent, {
        Class: "GStatusDialog"
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members �w�q�}�l  //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * �ۨ����N��
     * */
    var that = this;
    var orangeNotice = 5;
    var redNotice = 10;
    var normalHeight = 1000;
    var down_x;
    var down_y;
    var interval;
    var feederList;
    //var testData = '[{"values":[17,"XF27","K1324CD83","S01",11405.0,11432.0,11418.0,43.215,64.245,108.437,39.0,5.0,17.0,0.00341955282770715,0.000437368789363191,0.00148887721142056,5.0,5.0,4.0,0.128205128205128,1.0,0.235294117647059,1,"2021-06-23T10:03:28.767707+08:00"]},{"values":[17,"XF27","K1324CD83","S01",11405.0,11432.0,11418.0,43.215,64.245,108.437,39.0,5.0,17.0,0.00341955282770715,0.000437368789363191,0.00148887721142056,5.0,5.0,4.0,0.128205128205128,1.0,0.235294117647059,1,"2021-06-23T10:03:28.767707+08:00"]}]';
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Data Members�b�W, Member functions�b�U  /////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * �мg�����ƥ�
     * */
    this.Close = function () {
        document.body.style.cursor = "default";
        //�I��d�ߦ^�_
        _3DMouseUpDown.MouseType = ClickFor.PointQuery;
        pEarth.removeEventListener("mousedown", funcMouseDown, false, true);
        //
        clearInterval(interval);

        this.Destroy();
        this.raiseEvent("Closed");
    };
    /**
     * �����������s�ϤU�誺�ĪG��
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
     * ��������
     * @param {any} i ��������
     */
    function switchDiv(i) {
        intStatus = i;
        if (i == 0) {
            //WriteUserLog(7);
            that.getNode().style.height = "190px";
            $("#divStatusCal").show();
            $("#btnStatusCalculation").show();
            $("#divStatusCompare").hide();
            $("#btnStatusRefresh").hide();
            $("#btnStatusClean").hide();
        }
        else {
            
            //WriteUserLog(8);
            that.getNode().style.height = "385px";
            $("#divStatusCal").hide();
            $("#btnStatusCalculation").hide();
            $("#divStatusCompare").show();
            $("#btnStatusRefresh").show();
            $("#btnStatusClean").show();
            //���J�����
            loadEstResult(estResults, orangeNotice, redNotice, normalHeight, true);
        }
    }

    function noticeColor(value,orange,red) {
        if (parseFloat(value) >= orange && parseFloat(value) < red)
            return "style='color:orange;'@#ffa333";
        else if (parseFloat(value) >= red)
            return "style='color:red;'@#ff3333";
        else
            return "style='color:black;'@#ffffff";
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
            case ClickFor.PickFeederEstimation:
                var pm = _3DMouseUpDown.PickPlacemark(down_x, down_y);
                if (!pm) {
                    $("#iptStatusCal").val('');
                    //elem.value = "";
                    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
                    return;
                }
                var tid = GetValue(pm, "tid");
                var oid = GetValue(pm, "oid");
                console.log('tid:' + tid);
                //���I��d�ߪ��y�{��z�A�������^����ơA�X�u�s���H�~�������n�F
                $.post("../GisMap/GetInfoWindowData", { TID: tid, OID: oid }, function (EI) {
                    console.log(EI);
                    if (EI.ProcessFlag == true) {
                        var obj = JSON.parse(EI.ProcessMessage);
                        $("#iptStatusCal").val(obj.FeederID);
                    }
                    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
                });
                break;
        }
    }

    function RemoveMarker(pm) {
        earth_.PlacemarkObjects.Remove(pm);
    }

    var list_interval = null;
    function EstResult_Refresh(oNotice, rNotice, vHeight) {
        ClearEstResult();

        if (list_interval != null)
            clearInterval(list_interval);

        list_interval = setInterval(function () {
            if (estResults.length > 0) {
                clearInterval(list_interval);
                list_interval = null;
                loadEstResult(estResults, oNotice, rNotice, vHeight, false);
            }
        }, 100);
    }

    function DoEstCalulation(feederID, time) {
		if(time == 1)
		{
			ajaxStart();
			var url = window.getServicePath() + "/feederanalysis/FeederEstimation/manual/" + feederID;
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("GET", url, true);
			xmlHttp.send(null);
			xmlHttp.onload = function (e) {
				
				if (interval != null)
					clearInterval(interval);

				var result = e.target.responseText;
				if (result == "PENDING") {
					Swal.fire({
						icon: "warning",
						title: "���A�����t��",
						text: "�ثe���b�i���L�X�u�������t��A�еy�ԦA�աC"
					});
					buttonclicksetting('#btnStatusCalculation', false)
					buttonclicksetting('#btnStatusCalculation_cont', false)
					ajaxStop();
					return;
				} else if (result == "Error"){
					Swal.fire({
						icon: "warning",
						title: "���A�����t��",
						text: "�X�u�Y�ɺʴ��ƾڲ��`�A�L�k�p��C"
					}).then(function (r) {
						buttonclicksetting('#btnStatusCalculation', false)
						buttonclicksetting('#btnStatusCalculation_cont', false)
					})
					ajaxStop();
				} 	else {
					Swal.fire({
						icon: "warning",
						title: "���A�����t��",
						text: "�X�u�u���[�c�P�B���Ʀ��\���X�A�t�⥿�b�i��A�еy�ԡC"
					}).then(function (r) {
						buttonclicksetting('#btnStatusCalculation', false)
						buttonclicksetting('#btnStatusCalculation_cont', false)
					})
					ajaxStop();
				}
			}
		}
		else
		{
			if(count == 0)
			{
				Swal.fire({
							icon: "warning",
							title: "���A�����t��",
							text: "�}�l�i��s��ʦ����t��C"
						});
				count++;
			}			
			if(count <= calculateTime)
			{
				var url = window.getServicePath() + "/feederanalysis/FeederEstimation/manual/" + feederID;
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", url, true);
				xmlHttp.send(null);
				xmlHttp.onload = function (e) {				
					if (interval != null)
						clearInterval(interval);
					var result = e.target.responseText;
					if (result == "PENDING") {
						setTimeout(function () { DoEstCalulation(feederID, time) }, 10000);
						return;
					} else if (result == "Error"){
						Swal.fire({
							icon: "warning",
							title: "���A�����t��",
							text: "�X�u�Y�ɺʴ��ƾڲ��`�A�L�k�p��C"
						})
					} 	else {
						Swal.fire({
							icon: "warning",
							title: "���A�����t��",
							text: (count >= calculateTime) ? "���b�i��̫� 1 �����A�����t��A�еy�ԡC" : "���b�i��� " + (count) + " �����A�����t��A�еy�ԡC" 
						}).then(function (r) {
							count++;
							if(count <= calculateTime)
								setTimeout(function () { DoEstCalulation(feederID, time) }, 10000);
							else
							{
								clearInterval(interval);
								interval = null;
								count = 0;
								Swal.fire({
									icon: "warning",
									title: "���A�����t��",
									text: "�s������t�⧹���C" 
								});
								buttonclicksetting('#btnStatusCalculation', false)
								buttonclicksetting('#btnStatusCalculation_cont', false)
							}
						})
					}
				}
			}
		}
    }


    function feederSelData() {
        feederList = "";
        $('#feederSel').empty();
        var url = window.getServicePath() + "/feederanalysis/GetAllFeeder";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
        xmlHttp.onload = function (e) {
            $('#feederSel').append("<option value='0'>�X�u�s��</option>");
            var results = JSON.parse(e.target.responseText);
            for (var i = 0; i < results.length; i++) {
                var r = results[i];
                var values = r.values;
                var feederid = values[0]; // �X�u�s��
                $('#feederSel').append("<option value='" + feederid + "'>" + feederid + "</option>");
                //
                if (i + 1 == results.length)
                    feederList += feederid;
                else
                    feederList += feederid + ",";
            }
        }
    }

    function loadEstResult(data, oNotice, rNotice, vHeight, isFirst) {
        $('#tb').empty();
        var mt_type = "v";
        if ($("#rdoCalcDirection1").attr("src").toUpperCase().endsWith("RDOCHECKED.SVG"))
            mt_type = "v";
        else if ($("#rdoCalcDirection2").attr("src").toUpperCase().endsWith("RDOCHECKED.SVG"))
            mt_type = "i";

        var TPC = new TaipowerCoordinateTransform();

        for (var i = 0; i < data.length; i++) {
            var r = data[i];
            var oid = r.oid;
            var values = r.attributes.values;
            var feederid = values[1]; // �X�u�s��
            var coordinate = values[2]; // �ϸ�����
            var loopid = values[3]; // �j���O
            var errlabel = r.err_label;
            var errValue = Math.abs(r.max_err).toFixed(3);
            var errInfo = errlabel + "(" + errValue + ")";
            var M_Color = noticeColor(errValue, oNotice, rNotice).split("@");
            var label = "";
            //�a��mark����
            var pm = r.marker.getPlacemark();
            if (isFirst != true) {
                RemoveMarker(pm);
                SEMarkers.GeneralMaxVisibleHeight = vHeight;
                CameraChanged();
                //
                //mark��ܼ��ҳ]�w
                if (mt_type == "v") {
                    var vr = (Math.round(values[4] * 1000) / 1000).toFixed(3);
                    var vs = (Math.round(values[5] * 1000) / 1000).toFixed(3);
                    var vt = (Math.round(values[6] * 1000) / 1000).toFixed(3);
                    label = "VR: " + vr + "; VS: " + vs + "; VT: " + vt;
                    var pos3857 = TPC.TPCPointToEPSG3857(coordinate); // �ϸ��� 3857
                    r.marker = new SuperGIS.Marker(earth_, pos3857, label, null, { FontSize: r.auto ? 20 : 15 });
                } else {
                    var ir = (Math.round(values[7] * 1000) / 1000).toFixed(3);
                    var is = (Math.round(values[8] * 1000) / 1000).toFixed(3);
                    var it = (Math.round(values[9] * 1000) / 1000).toFixed(3);
                    label = "IR: " + ir + "; IS: " + is + "; IT: " + it;
                    var pos3857 = TPC.TPCPointToEPSG3857(coordinate); // �ϸ��� 3857
                    r.marker = new SuperGIS.Marker(earth_, pos3857, label, null, { FontSize: r.auto ? 20 : 15 });
                }
                r.marker.pos84 = TPC.TPCPointToLngLat(coordinate); // �B�~�O�g�n��, �ѩw��
                // Soon 1100725 �إ�marker�}�C�Ϥ��@��}��label�P�۰ʤƶ}��label
                if (r.auto) {
                    var pm = r.marker.getPlacemark();
                    pm.Visible = SEMarkers.AutoVisible;
                    SEMarkers.Autolabel.push(pm);
                    if (Math.abs(r.max_err) > level2_err)
                        pm.TextSymbol.Color = M_Color[1];
                    else if (Math.abs(r.max_err) > level1_err)
                        pm.TextSymbol.Color = M_Color[1];
                }
                else {
                    var pm = r.marker.getPlacemark();
                    pm.Visible = SEMarkers.GeneralVisible;
                    SEMarkers.Generallabel.push(pm);
                }
            } 
            
            if (!r.auto) // �۰ʤƶ}���_
                continue;
            $('#tb').append("<tr id='tr_" + i + "' " + M_Color[0] + "><td>" + feederid + "</td><td>" + coordinate + "</td><td>" + loopid + "</td><td style='width:30%'>" + errInfo + "</td><td style='width:10%'><img src='../images/ToolWindow/Locate.svg' id='est_locateBtn_" + i + "'></td><td style='width:10%'><img src='../images/ToolWindow/Information.svg' id='est_infoBtn_" + oid + "'></td></tr>");
        }
        //�j�q�w��\��
        $('#tb').find("img[id*='est_locateBtn_']").bind('click', function () {
            var id = ($(this).attr("id")).replace("est_locateBtn_", "");
            EstResult_Locate(id);
        });
        //�j�w�˵��\��
        $('#tb').find("img[id*='est_infoBtn_']").bind('click', function () {
            var id = ($(this).attr("id")).replace("est_infoBtn_", "");
            EstResult_View(id);
        });
    }

    //�������-�w��
    function EstResult_Locate(id) {
        var marker = estResults[id].marker;
        earth_.SetViewpoint(marker.pos84.X, marker.pos84.Y, 1000, 0, 0, false); //�w�찪�׽վ� 1100809 Soon
    }

    //�������-�˵�
    function EstResult_View(id) {
        var oid = id;
        var tid = 114;
        ajaxStart();
        $.post("../GisMap/GetInfoWindowData", { TID: tid, OID: oid }, function (EI) {
            console.log(EI);
            if (EI.ProcessFlag == true) {
                _3DMouseUpDown.PopupInfoWindow(oid, EI.ProcessMessage);
                ajaxStop();
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "���A�����t��",
                    text: "���Ū�����~�C"
                }).then(function (r) {
                    if (r.value) {
                        ajaxStop();
                        return;
                    }
                })
            }
        });
    }
    //
    function statusEva_click() {
        _3DMouseUpDown.MouseType = ClickFor.PickFeederEstimation;
    }
    //
    function feedercheck(feederid, time) {
        var list = feederList.split(",");
        if (list.includes(feederid) == true) {
            DoEstCalulation(feederid, time)
        }
        else {
            $('#btnStatusCalculation').enabled = false;
            Swal.fire({
                icon: "warning",
                title: "���A�����t��",
                text: "�п�J���T���X�u�s���C"
            })
            return
        }  
    }
    //
    function SetDirectionRDO(val) {
        for (var i = 1; i <= 2; i += 1) {
            $("#rdoCalcDirection" + i).prop("src", (val == i ? "../images/ToolWindow/Topology/RdoChecked.svg" : "../images/ToolWindow/Topology/RdoNonChecked.svg"))
        }
    }
	
	function buttonclicksetting(val, boolean)
	{
		$(val).prop('disabled', boolean);
		if(boolean)
		{
			$(val).css('background', '#909090')
		}
		else
		{
			$(val).css('background', '#344059')
		}
	}
	

    /*************************************** 
     * ���A�����D�n�y�{AND�s���ʺt��ʵe������Ʋ��I
     * ************************************/
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Member Functions�b�W�A �������檺�y�{�b�U  ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //�Ȯ������I��d�߫��O
    _3DMouseUpDown.MouseType = ClickFor.PointQuery;
    this.ScrollbarID = "StatusEvaDialog";
    this.IconBox.src = "../images/ToolWindow/StateEstimation.svg";
    this.LabelBox.innerText = "���A�����p��";
    this.SetShuttleSpace(10, 10);
    this.SetPageSwitchItems([
        { Text: "�����B��", OnClick: function () { select(0); } },
        { Text: "�������", OnClick: function () { select(1); } }
    ]);
    //�����B��
    var div1 = this.BodyCell.appendObject("div", { id: "divStatusCal" }, null);
    div1.appendObject("label", null, {
        position: "absolute", left: "5px", top: "5px",
        "font-size": "14px", "line-height": "20px", "letter-spacing": "0.125em", color: "#484848"
    }).appendText("�����I���X�u�ο�J�X�u�s��");
    var div1_1 = div1.appendObject("div", null, { float: "left", "margin-right": "10px" });
    var div1_2 = div1.appendObject("div", null, { float: "left" });
    div1_1.appendObject("select", { id: "feederSel" }, { width: "100px" });
    div1_2.appendObject("input", { id: "iptStatusCal", type: "text" }, { width: "405px" });
	 $('#iptStatusCal').val(feederID);
    //
    feederSelData();
    AttachEvent(feederSel, "change", function () {
        feederID = $('#feederSel').val();
        if (feederID != 0)
            $('#iptStatusCal').val(feederID);
        else
            $('#iptStatusCal').val('');

        $('#feederSel').val(0);
    })
    //
    var btnPickFeederNo = div1.appendObject("input", { id: "btnPickFeederNo", type: "button", class: "PointerButton", onclick: "" }, { left: "500px", top: "30px" });
    AttachEvent(btnPickFeederNo, "click", function () {
        statusEva_click();
    });
	//�榸�p��
    var btnCalculation = this.BodyCell.appendObject("input", { id: "btnStatusCalculation", type: "button", value: "�榸�p��", class: "CoordinateActionButton", enabled:false }, { position: "absolute", bottom: "7px", right: "380px", background: "#344059", color: "#FFFFFF"});
    AttachEvent(btnCalculation, "click", function () {
        feederID = $('#iptStatusCal').val();
        feedercheck(feederID, 1);
		$('#btnStatusCalculation_stop').hide();
		buttonclicksetting('#btnStatusCalculation', true)
		buttonclicksetting('#btnStatusCalculation_cont', true)
    });
	//�s��p��
	var btnCalculation_cont = this.BodyCell.appendObject("input", { id: "btnStatusCalculation_cont", type: "button", value: "�s��p��", class: "CoordinateActionButton", enabled:false }, { position: "absolute", bottom: "7px", right: "240px", background: "#344059", color: "#FFFFFF"});
	AttachEvent(btnCalculation_cont, "click", function () {
		count = 0;
		feederID = $('#iptStatusCal').val();
        calculateTime = $('#btnStatusCalculation_cont_time').val();
        feedercheck(feederID, calculateTime);
		$('#btnStatusCalculation_stop').show();
		buttonclicksetting('#btnStatusCalculation', true)
		buttonclicksetting('#btnStatusCalculation_cont', true)
    });
	//�s�򦸼�
	var btnCalculation_cont_time = this.BodyCell.appendObject("input", { id: "btnStatusCalculation_cont_time", type: "text", value: "5"}, { position: "absolute", bottom: "11px", right: "200px", width: "30px"});
	
	this.BodyCell.appendObject("label", null, {
        position: "absolute", right: "180px", bottom: "8px",
        "font-size": "14px", "line-height": "20px", "letter-spacing": "0.125em", color: "#484848"
    }).appendText("��");
	//����
	var btnCalculation_stop = this.BodyCell.appendObject("input", { id: "btnStatusCalculation_stop", type: "button", value: "����", class: "CoordinateActionButton", enabled:false }, { position: "absolute", bottom: "7px", right: "40px", background: "#344059", color: "#FFFFFF", display: "none"});
    AttachEvent(btnCalculation_stop, "click", function () {
		count = parseInt(calculateTime) + 1;
		Swal.fire({
						icon: "warning",
						title: "���A�����t��",
						text: "�s��ʦ����t�⤤��C" 
					});
		buttonclicksetting('#btnStatusCalculation', false)
		buttonclicksetting('#btnStatusCalculation_cont', false)
    });
	//�P�_�O�_�p�⤤
	if(count != 0)
	{
		buttonclicksetting('#btnStatusCalculation', true)
		buttonclicksetting('#btnStatusCalculation_cont', true)
		$('#btnStatusCalculation_stop').show();
	}
    //�������
    //��ư��]json: [{ "L_No": "XF27", "P_No": "K1425EA91", "Loop": "S01", "M_Value": "-7.25" }, { "L_No": "XF27", "P_No": "K1425EA91", "Loop": "S01", "M_Value": "-0.5" }, { "L_No": "XF27", "P_No": "K1425EA91", "Loop": "S01", "M_Value": "-0.5" }]
    var div2 = this.BodyCell.appendObject("div", { id: "divStatusCompare" }, { display: "none" });
    var tb = div2.appendObject("table", { class:"fixed_header" }, null).appendObject("thead", null, null).appendObject("tr", null, null);
    tb.appendObject("th").appendText("�X�u�s��");
    tb.appendObject("th").appendText("�ϸ�����");
    tb.appendObject("th").appendText("�j���O");
    tb.appendObject("th", { style: "width:30%" }).appendText("�~�t�̤j����(�~�t��%)");
    tb.appendObject("th", { style: "width:10%" }).appendText("�w��");
    tb.appendObject("th", { style: "width:10%" }).appendText("�˵�");
    var tbb = tb.appendObject("tbody", { id: "tb", class: "mt-2" }, null);
    //
    var info = div2.appendObject("div", { class: "col-12 d-flex mt-3"}, null);
    info.appendObject("label", { class: "mt-1 mr-1" }, { "font-size": "10px" }).appendText("�~�t�W�L");
    info.appendObject("input", { id: "iptStatusCompare1", type: "text", placeholder: orangeNotice }, { width: "30px" });
    info.appendObject("label", { class: "mt-1 mr-1 ml-1" }, { "font-size": "10px" }).appendText("%��ⴣ��; �W�L");
    info.appendObject("input", { id: "iptStatusCompare2", type: "text", placeholder: redNotice }, { width: "30px" });
    info.appendObject("label", { class: "mt-1 ml-1" }, { "font-size": "10px" }).appendText("%���ⴣ��");
    //
    var info2 = div2.appendObject("div", { class: "col-12 d-flex mt-1" }, null);
    info2.appendObject("label", { class: "mt-1 mr-1" }, { "font-size": "10px" }).appendText("�@������a�ϼ��ҥi������");
    info2.appendObject("input", { id: "iptStatusCompare3", type: "text", placeholder: normalHeight }, { width: "40px" });
    info2.appendObject("label", { class: "mt-1 mr-1 ml-1" }, { "font-size": "10px" }).appendText("���إH�U");
    //
    var info3 = div2.appendObject("div", { class: "col-12 d-flex mt-1" }, null);
    info3.appendObject("label", { class: "mt-1 mr-1" }, { "font-size": "10px" }).appendText("�����������");
    var rdo1 = info3.appendObject("img", { id: "rdoCalcDirection1", src: "../images/ToolWindow/Topology/RdoChecked.svg", class: "RdoCalculationDirection2 mt-1" });
    info3.appendObject("label", { class: "mt-1 mr-1 ml-1" }, { "font-size": "10px" }).appendText("�q��");
    var rdo2 = info3.appendObject("img", { id: "rdoCalcDirection2", src: "../images/ToolWindow/Topology/RdoNonChecked.svg", class: "RdoCalculationDirection2 mt-1" }, null);
    info3.appendObject("label", { class: "mt-1 mr-1 ml-1" }, { "font-size": "10px" }).appendText("�q�y");
    //
    AttachEvent(rdo1, "click", function () {
        SetDirectionRDO(1);
    });
    AttachEvent(rdo2, "click", function () {
        SetDirectionRDO(2);
    });
    //
    var btnRefresh = this.BodyCell.appendObject("input", { id: "btnStatusRefresh", type: "button", value: "��s", class: "CoordinateActionButton" }, { position: "absolute", bottom: "45px", right: "14px", background: "#344059", color: "#FFFFFF"});
    AttachEvent(btnRefresh, "click", function () {
        var newOrangeNotice = $('#iptStatusCompare1').val() == "" ? orangeNotice : $('#iptStatusCompare1').val();
        var newRedNotice = $('#iptStatusCompare2').val() == "" ? redNotice : $('#iptStatusCompare2').val();
        var newHeight = $('#iptStatusCompare3').val() == "" ? normalHeight : $('#iptStatusCompare3').val();
        //
        EstResult_Refresh(newOrangeNotice, newRedNotice, newHeight);
    })
    var btnClean = this.BodyCell.appendObject("input", { id: "btnStatusClean", type: "button", value: "�M��", class: "CoordinateActionButton" }, { position: "absolute", bottom: "7px", right: "14px", background: "#344059", color: "#FFFFFF"});
    AttachEvent(btnClean, "click", function () {
        $('#tb').empty();
    })
    //�w��
    select(intStatus == null ? 0 : intStatus);
    pEarth.addEventListener("mousedown", funcMouseDown, false, true);
};
