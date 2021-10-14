var blnUpdate = true;//AUTO更新
var blnUpdate2 = false;//MANUAL更新(按下狀態列上那一顆)
var ohug0_height = 20;
var ohug1_depth = -10;
function loadScript(url, callback)
{
	// Adding the script tag to the head as suggested before
	var head = document.head;
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;

	// Then bind the event to the callback function.
	// There are several events for cross browser compatibility.
	script.onreadystatechange = callback;
	script.onload = callback;

	// Fire the loading
	head.appendChild(script);
}

function CreatePluginEarth(pParent, pCallback, pFailCallback)
{
	var ctrlStyle = { position:"relative", width: "100%", height: "100%" };
	var pEarth = null;
	if ("attachEvent" in pParent.getNode())
		pEarth = pParent.appendElement("object", { classid : "CLSID:7D358CA6-E1A5-48A3-B58D-45015FCFA215"}, ctrlStyle);
	else if ("addEventListener" in pParent.getNode())
		pEarth = pParent.appendElement("embed", { type : "application/supergis-plugin-earth" }, ctrlStyle);
	var tcnt = 0;
	function LoadTest()
	{
		if ("InitialEngine" in pEarth)
		{
			tcnt = 100;
			pEarth.InitialEngine(0);
			if (!pEarth.GetScene())
				pEarth.InitialEngine(1);
			if (pEarth.GetScene())
			{
				if ("InitializeCoordinateSystem" in pEarth)
				{
					function CreateSpatialReference(sSource)
					{
						if (sSource.indexOf("[") >= 0)
							return SpatialReference.ImportFromWKT(sSource);
						return OGC.CreateByURI(new OGC.URI(sSource));
					}
					pEarth.InitializeCoordinateSystem(function (sSource, sDest, vDatas)
					{
						var pSource = CreateSpatialReference(sSource);
						var pDest = CreateSpatialReference(sDest);
						var cnt = vDatas.length / 3
						var pLoc = new CPoint3(0, 0, 0);
						for (var i = 0; i < cnt; i++)
						{
							pLoc.X = vDatas[i * 3 + 0];
							pLoc.Y = vDatas[i * 3 + 1];
							pLoc.Z = vDatas[i * 3 + 2];
							pLoc = SpatialReference.CoordinateTransform(pSource, pDest, null, pLoc);
							vDatas[i * 3 + 0] = pLoc.X;
							vDatas[i * 3 + 1] = pLoc.Y;
							vDatas[i * 3 + 2] = pLoc.Z;
						}
						return vDatas;
					});
				}
				if (pCallback)
					pCallback(pEarth);
				return;
			}
		}
		if (tcnt >= 20)
		{
			pParent.removeChildren(pEarth);
			if (pFailCallback)
				pFailCallback();
			return;
		}
		tcnt++;
		setTimeout(LoadTest, 100);
	}
	LoadTest();
}

var strAppRoot = "";
function CreateHTML5Earth(pParent, pCallback, pFailCallback)
{
	loadScript("/ServerGate/scripts/Marker.js");
	
	var sRoot = location.href;
	var idx = sRoot.lastIndexOf('/');
	//idx = sRoot.lastIndexOf('/', idx - 1);
	if (idx >= 0) sRoot = sRoot.substring(0, idx + 1);
	strAppRoot = sRoot;

	var ctrlStyle = { position:"relative", width: "100%", height: "100%" };
	if (SuperGIS.Windows.HTMLContainer != EarthHTMLContainer)
	{
		EarthHTMLContainer._Container = SuperGIS.Windows.HTMLContainer;
		SuperGIS.Windows.HTMLContainer = EarthHTMLContainer;
	}
	SuperGIS.Windows.Dialog = EarthDialog;
	SuperGIS.DDDCore.DataLoader.Load = function (sURL, sMimeType, bProxy, pCallback)
	{
		if (sURL.indexOf("dropbox") != -1)
			return;
		var agt = new AjaxAgent(null, true, false);
		SuperGIS.DDDCore.DataLoader.isRunning = true;
		function ProcResponse(pReq)
		{
			if (pReq == null)
				return;
			if (pReq.responseType == "arraybuffer" || pReq.responseType == "blob")
				pCallback(pReq.response);
			else
				pCallback(pReq.responseXML ? pReq.responseXML : pReq.response);
			SuperGIS.DDDCore.DataLoader.isRunning = false;
		}
		function ProcProxy()
		{
			// 測試將 port number 拿掉
			{
				var i = sURL.lastIndexOf(':');
				if (i > 5)
				{
					var i2 = sURL.indexOf('/', i);
					if (i2 > 0)
						sURL = sURL.slice(0, i) + sURL.slice(i2);
				}
			}
			agt.Open("GET", strAppRoot + "KMZProxy.ashx/Proxy?Path=" + encodeURIComponent(sURL));
			//agt.Open("GET", "/KMZProxy.ashx/Proxy?Path=" + encodeURIComponent(sURL));
			if (sMimeType != null)
				agt.OverrideMimeType(sMimeType);
			agt.SendRequest(null, ProcResponse);
		}
		if (bProxy)
		{
			ProcProxy();
		}
		else
		{
			agt.Open("GET", sURL);
			if (sMimeType != null)
				agt.OverrideMimeType(sMimeType);
			// 不需要 Failed 就呼叫 ProcProxy, 又不是都在下載 KMZ
			//agt.SendRequest(null, ProcResponse, null, ProcProxy);
			agt.SendRequest(null, ProcResponse, null, null);
		}
	}
	var pEarth = new Earth(pParent.appendObject("div", null, ctrlStyle));
	pEarth.InitialEngine();
	if (pEarth.GetScene())
	{
		if (pCallback)
			pCallback(pEarth);
	}
	else if (pFailCallback)
		pFailCallback(pEarth);
}

function EarthHTMLContainer(pNode)
{
	if (EarthHTMLContainer._Container != null)
		EarthHTMLContainer._Container.call(this, pNode);
	
	var inputStyles =
	{
		//border:"0px solid #000000",
		//color:"black",
		//background:"none",
		//fontFamily:"Arial",
		//fontSize:"12pt",
	};
		
	var _appendObjectBase = this.appendObject;
	this.appendObject = function(objType, opts, styles)
	{
		if (objType == "input")
		{
			var stls = inputStyles;
			if (!opts.type || opts.type == "text") {
				//stls = SuperGIS.Windows.MergeStyle([stls, { width: "300px" }]);
				stls = SuperGIS.Windows.MergeStyle([stls, {}]);
			}
			styles = SuperGIS.Windows.MergeStyle([stls, styles]);
		}
		if (_appendObjectBase)
			return _appendObjectBase.call(this, objType, opts, styles);
		return null;
	}
	var _appendElementBase = this.appendElement;
	this.appendElement = function(elemType, opts, styles)
	{
		if (elemType == "input")
		{
			var stls = inputStyles;
			if (!opts.type || opts.type == "text") {
				//stls = SuperGIS.Windows.MergeStyle([stls, { width: "300px" }]);
				stls = SuperGIS.Windows.MergeStyle([stls, {  }]);
			}
			styles = SuperGIS.Windows.MergeStyle([stls, styles]);
		}
		if (_appendElementBase)
			return _appendElementBase.call(this, elemType, opts, styles);
		return null;
	}

	function CreateInput(opts, styles)
	{
		var pTbl = new AttributeTable(this.appendElement("table", null, {border:"0px solid black",borderCollapse:"collapse",margin:"1px"}));
		var pRow = pTbl.createRow(null, {height:"26px"})
		pRow.createCell(null, {width:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table1.png)",backgroundRepeat:"no-repeat",backgroundPosition:"left"});
		var pCell = pRow.createCell(null, {vAlign:"middle"}, {backgroundImage:"url(" + strAppRoot + "images/table2.png)",backgroundRepeat:"repeat-x",backgroundPosition:"center",position:"relative"});
		var pDiv = new SuperGIS.Windows.HTMLContainer(pCell.appendElement("div", null, {position:"relative",left:"0px",top:"0px",height:"24px",width:"100%",verticalAlign:"middle",background:"none"}));
		var pIpt = pDiv.appendElement("input", opts, styles);
		pIpt.style.height = "24px";
		pIpt.style.verticalAlign = "text-bottom";
		pRow.createCell(null, {width:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table3.png)",backgroundRepeat:"no-repeat",backgroundPosition:"right"});
		return {Div:pDiv,Input:pIpt};
	}
	
	/*this.appendInputText = function(sValue, sTips)
	{
		var pIpt = CreateInput.call(this, {type:"text", value:sValue}, {width:"300px"});
		if (sTips)
		{
			var pLbl = pIpt.Div.appendElement("label", null, {position:"absolute",right:"0px",color:"#C0C0C0"});
			pLbl.innerHTML = sTips;
			pLbl.style.display = (pIpt.Input.value == "") ? "" : "none";
			AttachEvent(pIpt.Input, "focus", function() { pLbl.style.display = "none"; }, false);
			AttachEvent(pIpt.Input, "blur", function() { if (pIpt.Input.value == "") pLbl.style.display = ""; }, false);
		}
		return pIpt.Input;
	}*/
	
	/*this.appendInputCheckBox = function(sTitle, sValue, sID)
	{
		var pIpt = this.appendElement("input", { "type": "checkbox", "id": sID });
		pIpt.checked = sValue;
		var pImg = this.appendElement("img", null, {display:"none"});
		function UpdateState() { pImg.src = pIpt.checked ? strAppRoot + "images/Checked.png" : strAppRoot + "images/CheckBox.png"; }
		AttachEvent(pIpt, "click", UpdateState, false);
		AttachEvent(pImg, "click", function() { pIpt.click(); }, false);
		AttachEvent(pImg, "load", function() 
		{
			pIpt.style.display = "none";
			pImg.style.display = "";
		}, false);
		AttachEvent(pImg, "error", function() 
		{
			pIpt.style.display = "";
			pImg.style.display = "none";
		}, false);
		UpdateState();
		if (sTitle)
		{
			var pLbl = pNode.ownerDocument.createElement("label", {}, {});
			pLbl.appendChild(pLbl.ownerDocument.createTextNode(sTitle));
			pLbl.htmlFor = pIpt.id;
			pNode.appendChild(pLbl);
			pIpt.labelObject = pLbl;
		}
		return pIpt;
	}*/
	
	this.appendInputRadio = function(sTitle, sValue, sID, sName)
	{
		var pIpt = this.appendElement("input", { "type": "radio", "id": sID, "name": sName });
		pIpt.checked = sValue;
		if (sTitle)
		{
			var pLbl = pNode.ownerDocument.createElement("label", {}, {});
			pLbl.appendChild(pLbl.ownerDocument.createTextNode(sTitle));
			pLbl.htmlFor = pIpt.id;
			pNode.appendChild(pLbl);
			pIpt.labelObject = pLbl;
		}
		return pIpt;
	}
	
	this.appendTextArea = function(sValue, sTips)
	{
		var pTbl = new AttributeTable(this.appendElement("table", null, {border:"0px solid black",borderCollapse:"collapse",margin:"1px"}));
		var pRow = pTbl.createRow(null, {height:"6px"})
		pRow.createCell(null, {height:"6px",width:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table_01.png)",backgroundRepeat:"no-repeat",backgroundPosition:"top left"});
		pRow.createCell(null, {height:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table_02.png)",backgroundRepeat:"repeat-x",backgroundPosition:"top"});
		pRow.createCell(null, {height:"6px",width:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table_03.png)",backgroundRepeat:"no-repeat",backgroundPosition:"top right"});
		var pRow = pTbl.createRow()
		pRow.createCell(null, {width:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table_04.png)",backgroundRepeat:"repeat-y",backgroundPosition:"left"});
		var pCell = pRow.createCell(null, {vAlign:"middle"}, {backgroundImage:"url(" + strAppRoot + "images/table_05.png)",backgroundRepeat:"repeat",backgroundPosition:"center",position:"relative"});
		pRow.createCell(null, {width:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table_06.png)",backgroundRepeat:"repeat-y",backgroundPosition:"right"});
		var pRow = pTbl.createRow(null, {height:"6px"})
		pRow.createCell(null, {height:"6px",width:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table_07.png)",backgroundRepeat:"no-repeat",backgroundPosition:"bottom left"});
		pRow.createCell(null, {height:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table_08.png)",backgroundRepeat:"repeat-x",backgroundPosition:"bottom"});
		pRow.createCell(null, {height:"6px",width:"6px"}, {backgroundImage:"url(" + strAppRoot + "images/table_09.png)",backgroundRepeat:"no-repeat",backgroundPosition:"bottom right"});

		var pDiv = new SuperGIS.Windows.HTMLContainer(pCell.appendElement("div", null, {position:"relative",left:"0px",top:"0px",width:"100%",verticalAlign:"middle",background:"none"}));
		var pIpt = pDiv.appendElement("textarea", {value:sValue}, SuperGIS.Windows.MergeStyle([inputStyles, {resize:"none",width:"300px"}]));
		if (sTips)
		{
			var pLbl = pDiv.appendElement("label", null, {position:"absolute",right:"0px",color:"#C0C0C0"});
			pLbl.innerHTML = sTips;
			pLbl.style.display = (pIpt.value == "") ? "" : "none";
			AttachEvent(pIpt, "focus", function() { pLbl.style.display = "none"; }, false);
			AttachEvent(pIpt, "blur", function() { if (pIpt.Input.value == "") pLbl.style.display = ""; }, false);
		}
		return pIpt;
	}
	
	this.appendFrameButton = function(imgNormal, imgActive, funcClick)
	{
		var pBtn = this.appendObject("button", {type:"button"}, {padding:"0px",border:"0px solid #000000",color:"black",background:"none"});
		if (funcClick)
			pBtn.addEventListener("click", funcClick, false, true);
		var pImg = pBtn.appendElement("img");
		pImg.src = imgNormal;
		function MU()
		{
			pImg.src = imgNormal;
			pBtn.removeEventListener("mouseup", MU, true);
		}
		pBtn.addEventListener("mousedown", function()
		{
			pImg.src = imgActive;
			pBtn.addEventListener("mouseup", MU, true, true);
		}, false, true);
		return pBtn.getNode();
	}
}
EarthHTMLContainer._Container = null;

function EarthDialog(pParent)
{
	AttributeTable.call(this, pParent.appendObject("table", 
		{cellSpacing:"0px",cellPadding:"0px",border:"0px"}, 
		{position:"absolute",top:"150px",left:"100px"}).getNode())
	var bVisible = true;
	
	this.getVisible = function()
	{
		return bVisible;
	};
	this.setVisible = function(v)
	{
		bVisible = v;
		this.applyStyles({display:(bVisible ? "" : "none")});
	}
	this.Destroy = function()
	{
		pParent.removeChildren(this);
	}
	
	var ctop = {height:"34px"};
	var cbtm = {height:"8px"};
	var clft = {width:"5px"};
	var crgt = {width:"5px"};
	var c1 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_01.png)",backgroundRepeat:"no-repeat",backgroundPosition:"top left"};
	var c2 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_03.png)",backgroundRepeat:"repeat-x",backgroundPosition:"top"};
	var c3 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_05.png)",backgroundRepeat:"no-repeat",backgroundPosition:"top right"};
	var c4 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_08.png)",backgroundRepeat:"repeat-y",backgroundPosition:"left"};
	var c5 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_10.png)",backgroundRepeat:"repeat"};
	var c6 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_12.png)",backgroundRepeat:"repeat-y",backgroundPosition:"right"};
	var c7 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_14.png)",backgroundRepeat:"no-repeat",backgroundPosition:"bottom left"};
	var c8 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_16.png)",backgroundRepeat:"repeat-x",backgroundPosition:"bottom"};
	var c9 = {backgroundImage:"url(" + strAppRoot + "images/Dlg_18.png)",backgroundRepeat:"no-repeat",backgroundPosition:"bottom right"};
	
	this.HeaderRow = this.createRow(null, ctop);
	this.HeaderRow.createCell(null, null, SuperGIS.Windows.MergeStyle([c1, ctop, clft]));
	this.Header = this.HeaderRow.createCell(null, null, SuperGIS.Windows.MergeStyle([c2, ctop, EarthDialog.CaptionStyle]));
	this.HeaderRow.createCell(null, null, SuperGIS.Windows.MergeStyle([c3, ctop, crgt]))
		
	this.ContentRow = this.createRow(null, {height:"34px"});
	this.ContentRow.createCell(null, null, SuperGIS.Windows.MergeStyle([c4, clft]));
	this.Content = this.ContentRow.createCell(null, null, c5);
	this.ContentRow.createCell(null, null, SuperGIS.Windows.MergeStyle([c6, crgt]));
	
	this.FooterRow = this.createRow(null, cbtm);
	this.FooterRow.createCell(null, null, SuperGIS.Windows.MergeStyle([c7, cbtm, clft]));
	this.Footer = this.FooterRow.createCell(null, null, SuperGIS.Windows.MergeStyle([c8, cbtm]));
	this.FooterRow.createCell(null, null, SuperGIS.Windows.MergeStyle([c9, cbtm, crgt]));
	
	new DragTracker(this.Header.getNode(), this.getNode());
}
EarthDialog.CaptionStyle = {fontSize:"12pt", fontFamily:"Arial",color:"white"};

function Earth(pMain)
{
	SuperGIS.DDDEarth.Earth.call(this, pMain);

	this.CreateKMLDocument = function (sTitle, vDocumentSource, sDefaultIcon, callback)
	{
		var k = new OGC.KMLDocument(this, sDefaultIcon);
		k.Load(vDocumentSource, callback);
		return k;
	};
	this.CreateGMLDocument = function (sTitle, vDocumentSource, callback)
	{
		var g = new OGC.GMLDocument(this);
		g.Load(vDocumentSource, callback);
		return g;
	};
	this.CreateOBJDocument = function (sTitle, vDocumentSource, callback)
	{
		var o = new OGC.OBJDocument(this);
		o.Load(vDocumentSource, callback);
		return o;
	};
	this.CreateIFCDocument = function (sTitle, vDocumentSource, callback)
	{
		var i = new IFCDocument(this);
		i.Load(vDocumentSource, callback);
		return i;
	};

	this.CreateStatusPanel = function (opt) { return new StatusPanel(pMain, this, opt); };
	this.CreateNavigationPanel = function () { return new NavigationPanel(pMain, this); };
	this.CreateToolbarPanel = function (vLeftImage, vCenterImage, vRightImage) { return new ToolbarPanel(pMain, this, vLeftImage, vCenterImage, vRightImage); };

	this.CreateIndexview = function () { return new DialogCommand(pMain, IndexviewDialog); };
	this.CreateCommandPaint = function () { return new DialogCommand(pMain, PaintDialog); };
	this.CreateCommandMeasure = function () { return new DialogCommand(pMain, MeasureDialog); };
	this.CreateCommandAddKML = function (sDefaultIcon) { return new DialogCommand(pMain, KMLDialog); };
	//this.CreateCommandQuery = function () { return new DialogCommand(pMain, QueryDialog); };
	//this.CreateCommandConfig = function () { return new DialogCommand(pMain, ConfigDialog); };
	//this.CreateCommandShare = function () { return new DialogCommand(pMain, EMailDialog); };
	this.CreateCommandCustom = function () { return new CommandCustom(); };
}
Earth.VisibleMode = SuperGIS._EnumType.Enum(["Hidden", "Show", "ShowMinimum"]);
Earth.Origin = SuperGIS._EnumType.Enum(["UpperLeft", "UpperRight", "LowerLeft", "LowerRight"]);
Earth.Placement = SuperGIS._EnumType.Enum(["Left", "Middle", "Right"]);
Earth.UnitSystem = SuperGIS._EnumType.Enum(["Metric", "Imperial"]);

function ObjectEventFunction(pObj, sEvent, pFunc) { return function OEFunction(pObjT, sEventT) { if (pObjT == pObj && sEventT == sEvent) pFunc(pObjT, sEventT); }; }

function NavigationPanel(pParent, pEarth)
{
	var m_PanelObject = pParent.appendObject("div", null, {position:"absolute",top:"0px",right:"10px",width:"160px",height:"190px"});
	var pEyeTool = m_PanelObject.appendObject("div", null, {position:"absolute",top:"0px",left:"0px",width:"160px",height:"160px",overflow:"hidden"});
	var pScaleTool = m_PanelObject.appendObject("div", null, {position:"absolute",top:"160px",left:"41px",width:"79px",height:"30px"});

	var pEye = pEyeTool.appendObject("img", {src:strAppRoot + "images/Eye.png"}, {position:"absolute",top:"30px",left:"30px"});
	var pN = pEyeTool.appendObject("img", {src:strAppRoot + "images/N.png"}, {position:"absolute",top:"0px",left:"0px"});
	var pZOut = pScaleTool.appendFrameButton(strAppRoot + "images/bar-02.png", strAppRoot + "images/bar-o-02.png", function(tEvent) { tEvent.preventDefault(); });
	var pZIn = pScaleTool.appendFrameButton(strAppRoot + "images/bar-01.png", strAppRoot + "images/bar-o-01.png", function(tEvent) { tEvent.preventDefault(); });
	//Gary 20181219:顯示ToolTip專用DIV
	var pToolTip=pEyeTool.appendObject("div", null, {position:"absolute",display:"none",backgroundColor:"#FFFFFF",fontSize:"10px",padding:"3px"});
	function ShowToolTip(tooltiptext){
		pToolTip.style.display="block";
		pToolTip.innerHTML=tooltiptext;
	}
	function CloseToolTip(tooltiptext){
		pToolTip.innerHTML="";
		pToolTip.style.display="none";
	}
	
	pZOut.setAttribute("title","縮放地圖");
	pZIn.setAttribute("title","縮放地圖");
	
	var mEyeTool = new EyeTool(pEarth, pEyeTool.getNode(), 100, 100, 80, 80, pN.getNode());

	function pScaleHandleStop(tEvent)
	{
		pEarth.EndNavigate();
		document.body.style.cursor = "default";
		DetachEvent(pZIn,"mouseup", pScaleHandleStop, true);
		DetachEvent(pZOut,"mouseup", pScaleHandleStop, true);
	}
	AttachEvent(pZIn, "mousedown", function pScaleInHandleStart(tEvent)
	{
		tEvent.preventDefault();
		document.body.style.cursor = "n-resize";
		AttachEvent(pZIn, "mouseup", pScaleHandleStop, true);

		var pCenter = SuperGIS.DDDEarth.PickingVector(pEarth, SuperGIS.DDDCore.RenderPriority.Ground, new SuperGIS.DDDCore.Vector3(0, 0, 0), false, tEvent.ctrlKey ? 0 : 3);
		pEarth.StartNavigate(pEarth.CreateZoomAction(pCenter, -1, 0), 0);
		return false;
	});
	AttachEvent(pZOut, "mousedown", function pScaleOutHandleStart(tEvent)
	{
		tEvent.preventDefault();
		document.body.style.cursor = "n-resize";
		AttachEvent(pZOut, "mouseup", pScaleHandleStop, true);
		
		var pCenter = SuperGIS.DDDEarth.PickingVector(pEarth, SuperGIS.DDDCore.RenderPriority.Ground, new SuperGIS.DDDCore.Vector3(0, 0, 0), false, tEvent.ctrlKey ? 0 : 3);
		pEarth.StartNavigate(pEarth.CreateZoomAction(pCenter, 1, 0), 0);
		return false;
	});

	var m_Navi = null;
	var m_Visible = true;
	function Draw()
	{
		m_PanelObject.applyStyles({display:(m_Visible ? "" : "none")});
		if (m_Visible)
		{
			if (m_Navi == null)
				m_Navi = new SuperGIS.AlphaAnimation(m_PanelObject.getNode(), 0.1, 1.0, 0.2);
			m_Navi.setEnable(true);
		}
		else if (m_Navi != null)
			m_Navi.setEnable(false);
	}
	Draw();

	Object.defineProperty(this, "Visible",
	{
		"enumerable": true,
		"get": function () { return m_Visible; },
		"set": function (newVal)
		{
			m_Visible = newVal;
			Draw();
		}
	});

	this.setPosition = function(x, y, origin)
	{
		if (origin == Earth.Origin.UpperLeft)
			m_PanelObject.applyStyles({left:x + "px", top:y + "px", right:"", bottom:""});
		else if (origin == Earth.Origin.UpperRight)
			m_PanelObject.applyStyles({right:x + "px", top:y + "px", left:"", bottom:""});
		else if (origin == Earth.Origin.LowerLeft)
			m_PanelObject.applyStyles({left:x + "px", bottom:y + "px", right:"", top:""});
		else //if (origin == Earth.Origin.UpperRight)
			m_PanelObject.applyStyles({right:x + "px", bottom:y + "px", left:"", top:""});
	}

	function EyeTool(pEarth, pNode, ctrlWidth, ctrlHeight, effWidth, effHeight, pN)
	{
		var pScene = pEarth.GetScene();
		var pCam = pEarth.GetCamera();
		var pGlobe = pEarth.GetGlobe();

		var yawSpeed = 2.0 * Math.PI / 10.0;
		var pitchSpeed = 2.0 * Math.PI / 20.0;
		var glideSpeed = 2.0 * Math.PI / 20.0;
	
		var eyeTool = pNode;
		var effectLayer = null;
		var effectLayerContext = null;
		var northLayer = pN;
	
		var compassWidth = eyeTool.clientWidth;
		var compassHeight = eyeTool.clientHeight;
		var effectWidth = effWidth;
		var effectHeight = effHeight;
		var controlWidth = ctrlWidth;
		var controlHeight = ctrlHeight;
		var NorthWidth = (compassWidth - controlWidth) / 2;

		var m_pRNav = null;
		var m_pTNav = null;
		var m_pPNav = null;
		var dCurRadian = 0;
		var m_dCurAngle = 0;
		var bDrag = false;
	
		effectLayer = eyeTool.ownerDocument.createElement("canvas");
		eyeTool.appendChild(effectLayer);
		effectLayer.style.position = "absolute";
		effectLayer.style.top = "0px";
		effectLayer.style.left = "0px";
		effectLayer.style.width = compassWidth + "px";
		effectLayer.style.height = compassHeight + "px";
		effectLayer.width = compassWidth;
		effectLayer.height = compassHeight;
		effectLayerContext = effectLayer.getContext("2d");
		effectLayerContext.translate(compassWidth / 2, compassWidth / 2);
		effectLayerContext.scale(effectWidth / 2, effectHeight / 2);
	
		pEarth.addEventListener("ObjectEvent", ObjectEventFunction(pCam, "changed", function (obj, sEvent)
		{
			m_dCurAngle = pCam.Yaw + pCam.Roll;
			while (m_dCurAngle > 180) m_dCurAngle -= 360;
			while (m_dCurAngle < -180) m_dCurAngle += 360;
			northLayer.style.webkitTransform = 
			northLayer.style.MozTransform = 
			northLayer.style.transform = 
				"rotate(" + Math.round(-m_dCurAngle).toString() + "deg)";
		}), false);

		AttachEvent(eyeTool, "mousedown", pEyeStart);
		AttachEvent(eyeTool, "mousemove", function(tEvent){
			if(eyeTool!=undefined){
				var ost = GetOffset(eyeTool);
				var deltaX = (tEvent.clientX - ost.X) / compassWidth * 2 - 1;
				var deltaY = (tEvent.clientY - ost.Y) / compassHeight * 2 - 1;
				var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
				var ToolTipDIVs=eyeTool.getElementsByTagName("div");
				if(ToolTipDIVs!=undefined){
					var ToolTipDIV=ToolTipDIVs[0];
					if(ToolTipDIV.style.display=="none"){
						ToolTipDIV.style.display="block";
						}
					if (delta > controlWidth / compassWidth){
						ToolTipDIV.innerText="調整北方位置";
						}
					else if (delta > effectWidth / compassWidth){
						ToolTipDIV.innerText="平移視角";
						}
					else{
						ToolTipDIV.innerText="傾斜視角";
						}
				}				
			}
		});
		AttachEvent(eyeTool,"mouseout",function(){
			if(eyeTool!=undefined && eyeTool.getElementsByTagName("div")!=undefined){
				var ToolTipDIV=eyeTool.getElementsByTagName("div")[0];
				ToolTipDIV.innerText="";
				ToolTipDIV.style.display="none";
			}
		});
	
		this.setVisibility = function(newVisibility)
		{
			eyeTool.style.visibility = newVisibility;
		}

		function pEyeStart(tEvent)
		{
			var ost = GetOffset(eyeTool);
			var deltaX = (tEvent.clientX - ost.X) / compassWidth * 2 - 1;
			var deltaY = (tEvent.clientY - ost.Y) / compassHeight * 2 - 1;
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			if (delta > 1)
				return;
			tEvent.preventDefault();
			pEarth.EndNavigate();
			if (m_pRNav != null)
				delete m_pRNav;
			m_pRNav = null;
			if (m_pTNav != null)
				delete m_pTNav;
			m_pTNav = null;
			if (m_pPNav != null)
				delete m_pPNav;
			m_pPNav = null;
			if (delta > controlWidth / compassWidth)
			{
				AttachEvent(eyeTool, "mouseup", pCompStop, true);
				AttachEvent(eyeTool, "mousemove", pCompPan, true);
				
				var pCenter = SuperGIS.DDDEarth.PickingVector(pEarth, SuperGIS.DDDCore.RenderPriority.Ground, new SuperGIS.DDDCore.Vector3(0, 0, 0), false, tEvent.ctrlKey ? 0 : 3);
				m_pRNav = pEarth.CreateRotateAction(pCenter, pGlobe.UpDirection(pCenter), 0);
				dCurRadian = Math.atan2(deltaX, -deltaY);
				bDrag = false;

				var buttonRadius = NorthWidth / compassWidth;
				var compassRad = -m_dCurAngle / 180 * Math.PI;
				var dx = deltaX - Math.sin(compassRad) * (1 - buttonRadius);
				var dy = deltaY + Math.cos(compassRad) * (1 - buttonRadius);
				if (dx * dx + dy * dy > buttonRadius * buttonRadius)
					pCompPan(tEvent);
			}
			else if (delta > effectWidth / compassWidth)
			{
				AttachEvent(eyeTool, "mouseup", pGlideStop, true);
				AttachEvent(eyeTool, "mousemove", pGliding, true);
				m_pPNav = new SuperGIS.DDDEarth.PanAction(pCam);
				pGliding(tEvent);
				pEarth.StartNavigate(m_pPNav, 0);
			}
			else
			{
				AttachEvent(eyeTool, "mouseup", pEyeStop, true);
				AttachEvent(eyeTool, "mousemove", pEyePan, true);
				m_pTNav = pEarth.CreateTiltAction(pCam.EyeAt, 0);
				m_pRNav = pEarth.CreateRotateAction(pCam.EyeAt, pGlobe.UpDirection(pCam.EyeAt), 0);
				pEyePan(tEvent);
				var pGrp = pEarth.CreateActionGroup();
				pGrp.AddAction(m_pTNav);
				pGrp.AddAction(m_pRNav);
				pEarth.StartNavigate(pGrp, 0);
			}
		}
		function pEyePan(tEvent)
		{
			var ost = GetOffset(eyeTool);
			var deltaX = Math.limits((tEvent.clientX - ost.X) / compassWidth * 2 - 1, -1, 1);
			var deltaY = Math.limits((tEvent.clientY - ost.Y) / compassHeight * 2 - 1, -1, 1);
			deltaX = Math.pow(deltaX, 2) * (deltaX > 0 ? 1 : -1);
			deltaY = Math.pow(deltaY, 2) * (deltaY > 0 ? 1 : -1);
		
			var len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			var rad = Math.atan2(deltaY, deltaX);
			var range = Math.PI * 0.25;
		
			var grd = effectLayerContext.createRadialGradient(0, 0, 0.2, 0, 0, 1);
			effectLayerContext.fillStyle = grd;
			grd.addColorStop(0, "rgba(203, 228, 212, " + 0.2 + ")");
			grd.addColorStop(0.5, "rgba(123, 213, 164, " + (0.2 + 0.3 * len) + ")");
			grd.addColorStop(1, "rgba(91, 152, 142, " + (0.2 + 0.6 * len) + ")");
			effectLayerContext.clearRect(-1, -1, 2, 2); 
			effectLayerContext.beginPath();
			effectLayerContext.moveTo(0, 0);
			effectLayerContext.arc(0, 0, 1, rad - range, rad + range);
			effectLayerContext.closePath();
			effectLayerContext.fill();
			m_pTNav.Radian = -pitchSpeed * deltaY;
			m_pRNav.Radian = -yawSpeed * deltaX;
		}
		function pEyeStop(tEvent)
		{
			tEvent.preventDefault();
			pEarth.EndNavigate();
			m_pRNav = null;
			DetachEvent(eyeTool, "mouseup", pEyeStop, true);
			DetachEvent(eyeTool, "mousemove", pEyePan, true);
			effectLayerContext.clearRect(-1, -1, 2, 2);
		}
	
		function pGliding(tEvent)
		{
			var ost = GetOffset(eyeTool);
			var deltaX = (tEvent.clientX - ost.X) / compassWidth * 2 - 1;
			var deltaY = (tEvent.clientY - ost.Y) / compassHeight * 2 - 1;
			m_pPNav.Gliding(pCam, pGlobe, deltaX, deltaY, 1);
		}
		function pGlideStop(tEvent)
		{
			tEvent.preventDefault();
			pEarth.EndNavigate();
			m_pPNav = null;
			DetachEvent(eyeTool, "mousemove", pGliding, true);
			DetachEvent(eyeTool, "mouseup", pGlideStop, true);
		}
	
		function pCompPan(tEvent)
		{
			var ost = GetOffset(eyeTool);
			var deltaX = (tEvent.clientX - ost.X) / compassWidth * 2 - 1;
			var deltaY = (tEvent.clientY - ost.Y) / compassHeight * 2 - 1;
			var rad = Math.atan2(deltaX, -deltaY);
			if (rad != dCurRadian)
			{
				m_pRNav.Radian = rad - dCurRadian;
				m_pRNav.Apply(1);
				pEarth.Invalidate();
				dCurRadian = rad;
				bDrag = true;
			}
		}
		function pCompStop(tEvent)
		{
			tEvent.preventDefault();
			DetachEvent(eyeTool, "mouseup", pCompStop, true);
			DetachEvent(eyeTool, "mousemove", pCompPan, true);
			if (!bDrag && m_dCurAngle != 0)
			{
				var R = (m_dCurAngle > 0 ? 1 : -1) * 60;
				m_pRNav.Radian = R * Math.PI / 180;
				pEarth.StartNavigate(m_pRNav, m_dCurAngle / R, null);
			}
			bDrag = false;
			m_pRNav = null;
		}
	}
}
function GNavigationPanel(pParent, pEarth, gOptions) {
	//Gary Lu 20201111原生NavigationPanel中改一下在核研所系統用
	//基於已經另有zoom in&zoom out紐而把+與-的圖紐丟了
	var m_PanelObject = pParent.appendObject("div", null, { position: "absolute", top: "100px", right: "10px", width: "160px", height: "190px" });
	var pEyeTool = m_PanelObject.appendObject("div", null, { position: "absolute", top: "0px", left: "0px", width: "160px", height: "160px", overflow: "hidden" });
	var pScaleTool = m_PanelObject.appendObject("div", null, { position: "absolute", top: "160px", left: "41px", width: "79px", height: "30px" });

	var pEye = pEyeTool.appendObject("img", { src: strAppRoot + "../images/Eye.png" }, { position: "absolute", top: "30px", left: "30px" });
	var pN = pEyeTool.appendObject("img", { src: strAppRoot + "../images/N.png" }, { position: "absolute", top: "0px", left: "0px" });
	//var pZOut = pScaleTool.appendFrameButton(strAppRoot + "images/bar-02.png", strAppRoot + "images/bar-o-02.png", function (tEvent) { tEvent.preventDefault(); });
	//var pZIn = pScaleTool.appendFrameButton(strAppRoot + "images/bar-01.png", strAppRoot + "images/bar-o-01.png", function (tEvent) { tEvent.preventDefault(); });
	//Gary 20181219:顯示ToolTip專用DIV
	var pToolTip = pEyeTool.appendObject("div", null, { position: "absolute", display: "none", backgroundColor: "#FFFFFF", fontSize: "10px", padding: "3px" });
	function ShowToolTip(tooltiptext) {
		pToolTip.style.display = "block";
		pToolTip.innerHTML = tooltiptext;
	}
	function CloseToolTip(tooltiptext) {
		pToolTip.innerHTML = "";
		pToolTip.style.display = "none";
	}

	var mEyeTool = new EyeTool(pEarth, pEyeTool.getNode(), 100, 100, 80, 80, pN.getNode());

	function pScaleHandleStop(tEvent) {
		pEarth.EndNavigate();
		document.body.style.cursor = "default";
		DetachEvent(pZIn, "mouseup", pScaleHandleStop, true);
		DetachEvent(pZOut, "mouseup", pScaleHandleStop, true);
	}

	var m_Navi = null;
	var m_Visible = true;
	function Draw() {
		m_PanelObject.applyStyles({ display: (m_Visible ? "" : "none") });
		if (m_Visible) {
			if (m_Navi == null)
				m_Navi = new SuperGIS.AlphaAnimation(m_PanelObject.getNode(), 0.1, 1.0, 0.2);
			m_Navi.setEnable(true);
		}
		else if (m_Navi != null)
			m_Navi.setEnable(false);
	}
	Draw();

	Object.defineProperty(this, "Visible",
		{
			"enumerable": true,
			"get": function () { return m_Visible; },
			"set": function (newVal) {
				m_Visible = newVal;
				Draw();
			}
		});

	this.setPosition = function (x, y, origin) {
		if (origin == Earth.Origin.UpperLeft)
			m_PanelObject.applyStyles({ left: x + "px", top: y + "px", right: "", bottom: "" });
		else if (origin == Earth.Origin.UpperRight)
			m_PanelObject.applyStyles({ right: x + "px", top: y + "px", left: "", bottom: "" });
		else if (origin == Earth.Origin.LowerLeft)
			m_PanelObject.applyStyles({ left: x + "px", bottom: y + "px", right: "", top: "" });
		else //if (origin == Earth.Origin.UpperRight)
			m_PanelObject.applyStyles({ right: x + "px", bottom: y + "px", left: "", top: "" });
	}

	function EyeTool(pEarth, pNode, ctrlWidth, ctrlHeight, effWidth, effHeight, pN) {
		var pScene = pEarth.GetScene();
		var pCam = pEarth.GetCamera();
		var pGlobe = pEarth.GetGlobe();

		var yawSpeed = 2.0 * Math.PI / 10.0;
		var pitchSpeed = 2.0 * Math.PI / 20.0;
		var glideSpeed = 2.0 * Math.PI / 20.0;

		var eyeTool = pNode;
		var effectLayer = null;
		var effectLayerContext = null;
		var northLayer = pN;

		var compassWidth = eyeTool.clientWidth;
		var compassHeight = eyeTool.clientHeight;
		var effectWidth = effWidth;
		var effectHeight = effHeight;
		var controlWidth = ctrlWidth;
		var controlHeight = ctrlHeight;
		var NorthWidth = (compassWidth - controlWidth) / 2;

		var m_pRNav = null;
		var m_pTNav = null;
		var m_pPNav = null;
		var dCurRadian = 0;
		var m_dCurAngle = 0;
		var bDrag = false;

		effectLayer = eyeTool.ownerDocument.createElement("canvas");
		eyeTool.appendChild(effectLayer);
		effectLayer.style.position = "absolute";
		effectLayer.style.top = "0px";
		effectLayer.style.left = "0px";
		effectLayer.style.width = compassWidth + "px";
		effectLayer.style.height = compassHeight + "px";
		effectLayer.width = compassWidth;
		effectLayer.height = compassHeight;
		effectLayerContext = effectLayer.getContext("2d");
		effectLayerContext.translate(compassWidth / 2, compassWidth / 2);
		effectLayerContext.scale(effectWidth / 2, effectHeight / 2);

		pEarth.addEventListener("ObjectEvent", ObjectEventFunction(pCam, "changed", function (obj, sEvent) {
			m_dCurAngle = pCam.Yaw + pCam.Roll;
			while (m_dCurAngle > 180) m_dCurAngle -= 360;
			while (m_dCurAngle < -180) m_dCurAngle += 360;
			northLayer.style.webkitTransform =
				northLayer.style.MozTransform =
				northLayer.style.transform =
				"rotate(" + Math.round(-m_dCurAngle).toString() + "deg)";
		}), false);

		AttachEvent(eyeTool, "mousedown", pEyeStart);
		AttachEvent(eyeTool, "mousemove", function (tEvent) {
			if (eyeTool != undefined) {
				var ost = GetOffset(eyeTool);
				var deltaX = (tEvent.clientX - ost.X) / compassWidth * 2 - 1;
				var deltaY = (tEvent.clientY - ost.Y) / compassHeight * 2 - 1;
				var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
				var ToolTipDIVs = eyeTool.getElementsByTagName("div");
				if (ToolTipDIVs != undefined) {
					var ToolTipDIV = ToolTipDIVs[0];
					if (ToolTipDIV.style.display == "none") {
						ToolTipDIV.style.display = "block";
					}
					if (delta > controlWidth / compassWidth) {
						ToolTipDIV.innerText = "調整北方位置";
					}
					else if (delta > effectWidth / compassWidth) {
						ToolTipDIV.innerText = "平移視角";
					}
					else {
						ToolTipDIV.innerText = "傾斜視角";
					}
				}
			}
		});
		AttachEvent(eyeTool, "mouseout", function () {
			if (eyeTool != undefined && eyeTool.getElementsByTagName("div") != undefined) {
				var ToolTipDIV = eyeTool.getElementsByTagName("div")[0];
				ToolTipDIV.innerText = "";
				ToolTipDIV.style.display = "none";
			}
		});

		this.setVisibility = function (newVisibility) {
			eyeTool.style.visibility = newVisibility;
		}

		function pEyeStart(tEvent) {
			var ost = GetOffset(eyeTool);
			var deltaX = (tEvent.clientX - ost.X) / compassWidth * 2 - 1;
			var deltaY = (tEvent.clientY - ost.Y) / compassHeight * 2 - 1;
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			if (delta > 1)
				return;
			tEvent.preventDefault();
			pEarth.EndNavigate();
			if (m_pRNav != null)
				delete m_pRNav;
			m_pRNav = null;
			if (m_pTNav != null)
				delete m_pTNav;
			m_pTNav = null;
			if (m_pPNav != null)
				delete m_pPNav;
			m_pPNav = null;
			if (delta > controlWidth / compassWidth) {
				AttachEvent(eyeTool, "mouseup", pCompStop, true);
				AttachEvent(eyeTool, "mousemove", pCompPan, true);

				var pCenter = SuperGIS.DDDEarth.PickingVector(pEarth, SuperGIS.DDDCore.RenderPriority.Ground, new SuperGIS.DDDCore.Vector3(0, 0, 0), false, tEvent.ctrlKey ? 0 : 3);
				m_pRNav = pEarth.CreateRotateAction(pCenter, pGlobe.UpDirection(pCenter), 0);
				dCurRadian = Math.atan2(deltaX, -deltaY);
				bDrag = false;

				var buttonRadius = NorthWidth / compassWidth;
				var compassRad = -m_dCurAngle / 180 * Math.PI;
				var dx = deltaX - Math.sin(compassRad) * (1 - buttonRadius);
				var dy = deltaY + Math.cos(compassRad) * (1 - buttonRadius);
				if (dx * dx + dy * dy > buttonRadius * buttonRadius)
					pCompPan(tEvent);
			}
			else if (delta > effectWidth / compassWidth) {
				AttachEvent(eyeTool, "mouseup", pGlideStop, true);
				AttachEvent(eyeTool, "mousemove", pGliding, true);
				m_pPNav = new SuperGIS.DDDEarth.PanAction(pCam);
				pGliding(tEvent);
				pEarth.StartNavigate(m_pPNav, 0);
			}
			else {
				AttachEvent(eyeTool, "mouseup", pEyeStop, true);
				AttachEvent(eyeTool, "mousemove", pEyePan, true);
				m_pTNav = pEarth.CreateTiltAction(pCam.EyeAt, 0);
				m_pRNav = pEarth.CreateRotateAction(pCam.EyeAt, pGlobe.UpDirection(pCam.EyeAt), 0);
				pEyePan(tEvent);
				var pGrp = pEarth.CreateActionGroup();
				pGrp.AddAction(m_pTNav);
				pGrp.AddAction(m_pRNav);
				pEarth.StartNavigate(pGrp, 0);
			}
		}
		function pEyePan(tEvent) {
			var ost = GetOffset(eyeTool);
			var deltaX = Math.limits((tEvent.clientX - ost.X) / compassWidth * 2 - 1, -1, 1);
			var deltaY = Math.limits((tEvent.clientY - ost.Y) / compassHeight * 2 - 1, -1, 1);
			deltaX = Math.pow(deltaX, 2) * (deltaX > 0 ? 1 : -1);
			deltaY = Math.pow(deltaY, 2) * (deltaY > 0 ? 1 : -1);

			var len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			var rad = Math.atan2(deltaY, deltaX);
			var range = Math.PI * 0.25;

			var grd = effectLayerContext.createRadialGradient(0, 0, 0.2, 0, 0, 1);
			effectLayerContext.fillStyle = grd;
			grd.addColorStop(0, "rgba(203, 228, 212, " + 0.2 + ")");
			grd.addColorStop(0.5, "rgba(123, 213, 164, " + (0.2 + 0.3 * len) + ")");
			grd.addColorStop(1, "rgba(91, 152, 142, " + (0.2 + 0.6 * len) + ")");
			effectLayerContext.clearRect(-1, -1, 2, 2);
			effectLayerContext.beginPath();
			effectLayerContext.moveTo(0, 0);
			effectLayerContext.arc(0, 0, 1, rad - range, rad + range);
			effectLayerContext.closePath();
			effectLayerContext.fill();
			m_pTNav.Radian = -pitchSpeed * deltaY;
			m_pRNav.Radian = -yawSpeed * deltaX;
		}
		function pEyeStop(tEvent) {
			tEvent.preventDefault();
			pEarth.EndNavigate();
			m_pRNav = null;
			DetachEvent(eyeTool, "mouseup", pEyeStop, true);
			DetachEvent(eyeTool, "mousemove", pEyePan, true);
			effectLayerContext.clearRect(-1, -1, 2, 2);
		}

		function pGliding(tEvent) {
			var ost = GetOffset(eyeTool);
			var deltaX = (tEvent.clientX - ost.X) / compassWidth * 2 - 1;
			var deltaY = (tEvent.clientY - ost.Y) / compassHeight * 2 - 1;
			m_pPNav.Gliding(pCam, pGlobe, deltaX, deltaY, 1);
		}
		function pGlideStop(tEvent) {
			tEvent.preventDefault();
			pEarth.EndNavigate();
			m_pPNav = null;
			DetachEvent(eyeTool, "mousemove", pGliding, true);
			DetachEvent(eyeTool, "mouseup", pGlideStop, true);
		}

		function pCompPan(tEvent) {
			var ost = GetOffset(eyeTool);
			var deltaX = (tEvent.clientX - ost.X) / compassWidth * 2 - 1;
			var deltaY = (tEvent.clientY - ost.Y) / compassHeight * 2 - 1;
			var rad = Math.atan2(deltaX, -deltaY);
			if (rad != dCurRadian) {
				m_pRNav.Radian = rad - dCurRadian;
				m_pRNav.Apply(1);
				pEarth.Invalidate();
				dCurRadian = rad;
				bDrag = true;
			}
		}
		function pCompStop(tEvent) {
			tEvent.preventDefault();
			DetachEvent(eyeTool, "mouseup", pCompStop, true);
			DetachEvent(eyeTool, "mousemove", pCompPan, true);
			if (!bDrag && m_dCurAngle != 0) {
				var R = (m_dCurAngle > 0 ? 1 : -1) * 60;
				m_pRNav.Radian = R * Math.PI / 180;
				pEarth.StartNavigate(m_pRNav, m_dCurAngle / R, null);
			}
			bDrag = false;
			m_pRNav = null;
		}
	}
}

function ToolbarPanel(pParent, pEarth, vLeftImage, vCenterImage, vRightImage)
{
	var m_MainTable = null;
	var m_vLeftImage = vLeftImage;
	var m_vCenterImage = vCenterImage;
	var m_vRightImage = vRightImage;
	var m_LeftImage = null;
	var m_CenterImage = null;
	var m_RightImage = null;
	var m_hObj = null;
	var m_hRow = null;
	var m_Tools = new Array;
	var m_CurrentTool = null;
	
	var pScene = pEarth.GetScene();
	var pCamera = pEarth.GetCamera();
	var pObj = pParent;//pEarth.GetObject();

	m_MainTable = AttributeTable.Create(pObj.getNode(), {border:"0px",cellPadding:"0px",cellSpacing:"0px"}, {position:"absolute",top:"0px",left:"0px"});
	var Row = m_MainTable.createRow();
	m_LeftImage = Row.createCell().appendObject("img", {src:m_vLeftImage});
	m_CenterImage = Row.createCell();
	if (typeof(m_vCenterImage) == "string")
		m_CenterImage.applyStyles({backgroundImage:url(m_vCenterImage)});
	m_hObj = m_CenterImage.appendSubTable({border:"0px",cellPadding:"0px",cellSpacing:"0px"}, {position:"relative",left:"0px",top:"0px"});
	m_RightImage = Row.createCell().appendObject("img", {src:m_vRightImage});
	
	var m_Visible = true;
	function Draw()
	{
		m_MainTable.applyStyles({display:(m_Visible ? "" : "none")});
	}
	Draw();
	Object.defineProperty(this, "Visible",
	{
		"enumerable": true,
		"get": function () { return m_Visible; },
		"set": function (newVal)
		{
			m_Visible = newVal;
			Draw();
		}
	});
	this.setPosition = function(x, y, origin)
	{
		if (origin == Earth.Origin.UpperLeft)
			m_MainTable.applyStyles({left:x + "px", top:y + "px", right:"", bottom:""});
		else if (origin == Earth.Origin.UpperRight)
			m_MainTable.applyStyles({right:x + "px", top:y + "px", left:"", bottom:""});
		else if (origin == Earth.Origin.LowerLeft)
			m_MainTable.applyStyles({left:x + "px", bottom:y + "px", right:"", top:""});
		else //if (origin == Earth.Origin.UpperRight)
			m_MainTable.applyStyles({right:x + "px", bottom:y + "px", left:"", top:""});
	}
	this.SetBackgroundImage = function(vLeftImage, vCenterImage, vRightImage)
	{
		m_vLeftImage = vLeftImage;
		m_vCenterImage = vCenterImage;
		m_vRightImage = vRightImage;
		if (m_LeftImage != null)
			m_LeftImage.applyAttributes({src:m_vLeftImage});
		if (m_CenterImage != null && typeof(m_vCenterImage) == "string")
			m_CenterImage.applyStyles({backgroundImage:m_vCenterImage});
		if (m_RightImage != null)
			m_RightImage.applyAttributes({src:m_vRightImage});
	}
//public
	this.FinalRelease = function()
	{
		if (m_Tools)
		{
			cnt = m_Tools.length;
			for (var i=0;i<cnt;i++)
			{
				var hObj = m_Tools[i];
				if (hObj.pClickFunc)
					DetachEvent(hObj, "click", hObj.pClickFunc, false);
				hObj.pClickFunc = null;
				if (hObj.pMouseDownFunc)
					DetachEvent(hObj, "mousedown", hObj.pMouseDownFunc, false);
				hObj.pMouseDownFunc = null;
				if (hObj.pMouseOverFunc)
					DetachEvent(hObj, "mouseover", hObj.pMouseOverFunc, false);
				hObj.pMouseOverFunc = null;
			}
		}
		
		pParentElem.removeChild(pTbl.getNode());
		m_Tools = null;
	}
	
	function ToolbarItem(pNode, pToolbar, pItmeTool, imgPath, imgActPath)
	{
		var pThis = this;
		SuperGIS._EventTarget.call(this, pNode);
		pNode.src = imgPath;
		var bActive = false;
		this.Tool = pItmeTool;
		this.FinalRelease = function()
		{
			DetachEvent(pNode, "click", pClick, false);
			DetachEvent(pNode, "mousedown", pMouseDown, false);
			DetachEvent(pNode, "mouseover", pMouseOver, false);
		}
		
		function ChangeClassName(strClass)
		{
			if (strClass == "ButtonDown" || strClass == "ButtonFocus")
				pNode.src = imgActPath;
			else
				pNode.src = imgPath;
		}
		
		this.Active = function()
		{
			bActive = true;
			ChangeClassName("ButtonDown");
			return false;
		}
		
		this.Deactive = function()
		{
			bActive = false;
			ChangeClassName("ButtonDefault");
		}
		
		var pClick = function(tEvent) 
		{
			pToolbar.Click(pThis);
		}
		
		var pMouseDown = function(tEvent) 
		{
			if (tEvent.button != 0)
				return;
			ChangeClassName("ButtonDown");
			AttachEvent(pNode, "mouseup", pMouseUp, true);
		}
		var pMouseUp = function(tEvent)
		{
			ChangeClassName("ButtonDefault");
			DetachEvent(pNode, "mouseup", pMouseUp, true);
		}
		var pMouseOver = function()
		{
			if (!bActive) 
				ChangeClassName("ButtonFocus");
			AttachEvent(pNode, "mouseout", pMouseOut, false);
		}
		var pMouseOut = function()
		{
			if (!bActive) 
				ChangeClassName("ButtonDefault");
			DetachEvent(pNode, "mouseout", pMouseOut, false);
		}
		this.addEventListener("click", pClick, false, true);
		this.addEventListener("mousedown", pMouseDown, false, true);
		this.addEventListener("mouseover", pMouseOver, false, true);
	}
	
	this.Click = function(pItem)
	{
		if (m_CurrentTool == pItem)
		{
			//pEarth.SelectMapTool(null);
			//m_CurrentTool.Deactive();
			//m_CurrentTool = null;
		}
		else if (pItem.Tool)
		{
			if (pItem.Tool.MapCommand)
				pItem.Tool.MapCommand(pEarth);
			//if (pEarth.SelectMapTool(pItem.Tool))
			//{
			//	if (m_CurrentTool)
			//		m_CurrentTool.Deactive();
			//	m_CurrentTool = pItem;
			//	m_CurrentTool.Active();
			//}
		}
	}
	
	this.AddTool = function(pTool, imgPath, imgActPath, altString)
	{
		if (m_Tools.length == 0)
			m_hRow = m_hObj.createRow();
		
		var pCell = m_hRow.createCell();
		if (pTool && pTool.InitialMapBase)
			pTool.InitialMapBase(pMapBase);
		var hObj = pCell.appendElement("img");
		m_Tools.push(new ToolbarItem(hObj, this, pTool, imgPath, imgActPath));
	}
	
	this.selectTool = function(Index)
	{
		m_Tools[Index].raiseEvent("click");
	}
}

function StatusPanel(pParent, pEarth, opt)
{
	var pObj = pEarth.GetObject();
	var pCam = pEarth.GetCamera();
	var pScene = pEarth.GetScene();
	var pGlobe = pEarth.GetGlobe();
	var ShowBtn;
	var UpdBtn;
	pObj.addEventListener("mousemove", Refresh, false, true);
	pCam.addEventListener("changed", Refresh, false, true);

	/*setInterval(function () {
		Refresh();
	}, 1000);*/

	var bkcolor = "rgba(255, 255, 255, 0.5)";
	var align = "center";
	var m_Font = "微軟正黑體"
	var m_FontSize = "16px";
	var m_FontColor = "rgba(0, 0, 0, 1)";
	if (opt)
	{
		if (opt.Color)
			bkcolor = opt.Color;
		if (opt.Placement)
			align = opt.Placement;
		if (opt.Font)
			m_Font = opt.Font;
		if (opt.FontSize)
			m_FontSize = opt.FontSize.toString() + "px";
		if (opt.FontColor)
			m_FontColor = opt.FontColor;
	}
	//Ajax呼叫自身用
	var that = this;
	//下方狀態列:table型態顯示
	//var pDesTbl = pObj.appendObject("table", { border: "0px", cellPadding: "0px", cellSpacing: "0px" },
	//	{ position: "absolute", left: "0px", bottom: "0px", width: "100%", height: "40px", "background-color": bkcolor });
	var pDesTbl = pObj.appendObject("table", { border: "0px", cellPadding: "0px", cellSpacing: "0px" ,class:"StateBarHeight"},
		{ position: "absolute", left: "0px", bottom: "0px", width: "100%" });
	AttachEvent(pDesTbl, "mouseover", function () {
		_3DMouseUpDown.MouseType = ClickFor.None;
	});
	AttachEvent(pDesTbl, "mouseleave", function () {
		_3DMouseUpDown.MouseType = ClickFor.PointQuery;
	});
	var pDesRow = pDesTbl.appendObject("tr", { height: "1px" });
	var m_pCell2 = pDesRow.appendObject("td", { width: "8px", vAlign: "center", Align: "right" });
	//三個座標的呈現用新容器
	var cellTPC = pDesRow.appendObject("td", { class: "StateBarGeneral CoordinateBox" });
	var cellTWD97 = pDesRow.appendObject("td", { class: "StateBarGeneral CoordinateBox" });
	var cellLngLat = pDesRow.appendObject("td", { class: "StateBarGeneral CoordinateBox" });
	var cellHeight = pDesRow.appendObject("td", { class: "StateBarGeneral CoordinateBox" });
	//var m_Loading = m_pCell2.appendObject("img", { src: strAppRoot + "images/download_static.png", width: 135, height: m_FontSize });
	var m_pCell = pDesRow.appendObject("td", { width: "auto", align: align, vAlign: "bottom" },
		{ "fontFamily": m_Font, color: m_FontColor, fontSize: m_FontSize });
	//兩段更新資訊(含一個立即更新紐和一個Checkbox)
	var cellUpdateInfo = pDesRow.appendObject("td", null, { width: "300px" });
	var lblInfo = cellUpdateInfo.appendObject("label", { class: "tdUpdateText" }, null);
	/**
	 * 設定顯示文字內容
	 * @param {any} Text 顯示文字
	 */
	this.SetUpdateInfoText = function (Text) {
		lblInfo.clearChildren();
		lblInfo.appendText(Text);
	};
	//按鈕怎麼出現要看權限
	$.post(window.getRootPath() + "/GisMap/RightCheck", { PermitID: 17 }, function (res) {
		if (res.ProcessFlag) {
			
			//處理OK但Message可能不OK
			switch (res.ProcessMessage) {
				case "OK"://可以顯示"展示"
					UpdBtn = cellUpdateInfo.appendObject("input", { type: "button", class: "SmallUpdateOrDisplay", value: "更新" }, null);
					AttachEvent(UpdBtn, "click", function () {
						blnUpdate2 = true;
						_3DMouseUpDown.CheckChangeInfo();
					});
					ShowBtn = cellUpdateInfo.appendObject("input", { type: "button", class: "SmallUpdateOrDisplay", value: "展示" }, null);
					AttachEvent(ShowBtn, "click", function () {
						//展示鈕動作
						_3DMouseUpDown.RestoreDefault();
					});
					break;
				case "沒有權限"://只是沒有權限
					UpdBtn = cellUpdateInfo.appendObject("input", { type: "button", id: "btnImmediateUpdate", value: "立即更新" }, null);
					AttachEvent(UpdBtn, "click", function () {
						blnUpdate2 = true;
						_3DMouseUpDown.CheckChangeInfo();
					});
					//cellUpdateInfo.appendObject("input", { type: "button", class: "SmallUpdateOrDisplay", value: "更新" }, null);
					//cellUpdateInfo.appendObject("input", { type: "button", class: "SmallUpdateOrDisplay", value: "展示" }, null);
					break;
				case "未登入":
				case "帳號已停用":
					location.href = "../Home/LogIn";
					break;
            }
        }
	});
	//cellUpdateInfo.appendObject("input", { type: "button", id: "btnImmediateUpdate", value: "更新" }, null);
	var cellSelectUpdate = pDesRow.appendObject("td", { class: "tdCheckAutoUpdate" });
	cellSelectUpdate.appendObject("img", {id:"chkAutoUpdate"}, { marginLeft: "2px", marginTop: "-2px", width: "22px", height: "22px" });
	cellSelectUpdate.appendObject("label", { id: "lblAutoUpdate", class: "tdUpdateText" }, null).appendText("自動更新");
	var clsChkBox = new EarthAppCheckBox("chkAutoUpdate", "lblAutoUpdate", function () {
		$("#chkAutoUpdate").attr("src", window.getRootPath() + "/images/inputreplacement/checkbox/" + (blnUpdate ? "y.svg" : "n.svg"));
	}, function () {
			blnUpdate = clsChkBox.Checked();
			if(blnUpdate)
				_3DMouseUpDown.CheckChangeInfo();
	});
	//AttachEvent(clsChkBox, "click", function () {
	//	blnUpdate = !blnUpdate;
	//	$("#chkAutoUpdate").attr("src", "../images/inputreplacement/checkbox/"+(blnUpdate ? "y.svg" : "n.svg"));
	//});
	var SR_84 = EPSG.CreateSpatialReference(4326);
	var SR_97 = EPSG.CreateSpatialReference(3826);
	var m_isDownloading = false;
	//$.post("../GisMap/GetUpdateInterval", null, function (Res) {
	//	that.SetUpdateInfoText("資料更新頻率:每"+Res.ProcessMessage+"分鐘  最後更新:2020-06-12 11:50");
	//});
	this.SetUpdateInfoText("");
	
	function Refresh(tEvent)
	{
		var CurPosition = pEarth.GetCurrentPosition();
		var CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(CurPosition), 1, true);
		var TPC = new TaipowerCoordinateTransform();
		if (CurLocation)
		{
			var pt = pGlobe.GeodeticFromCartesian(CurLocation);
			var pt84 = { X: pt.X, Y: pt.Y, Z: 0 };
			if (!pGlobe.IsGCS())
				pt84 = SpatialReference.CoordinateTransform(pGlobe.SpatialReference, SR_84, null, pt84);
			var pt97 = SpatialReference.CoordinateTransform(SR_84, SR_97, null, pt84);

			var sTPCPoint = "台電圖號坐標( " + TPC.LngLatToTPCPoint(pt84) + " )";
			cellTPC.clearChildren();
			cellTPC.appendText(sTPCPoint);
			var sTmp1 = "WGS84坐標( " + pt84.X.toFixed(5) + ", " + pt84.Y.toFixed(5) + " )";
			cellLngLat.clearChildren();
			cellLngLat.appendText(sTmp1);
			var sTmp2 = "TWD97( " + pt97.X.toFixed(0) + ", " + pt97.Y.toFixed(0) + " )";
			cellTWD97.clearChildren();
			cellTWD97.appendText(sTmp2);
			var sTmp3 = "視角高度 " + pEarth.LengthFormatter.Format(pCam.Position.Z);
			cellHeight.clearChildren();
			sTmp3 = sTmp3.replace(/kilometers/, "公里");
			sTmp3 = sTmp3.replace(/meters/, "公尺");
			cellHeight.appendText(sTmp3);
			
			
			var yaw = pCam.Yaw;
			if (yaw < 0)
				yaw += 360;
			yaw = yaw.toFixed(0);
			if (yaw == "360")
				yaw = "0";
			//var sTmp4 = "方向: " + yaw + "\u02DA";
			//var sTmp5 = "傾角: " + pCam.Pitch.toFixed(0) + "\u02DA";
			
			//if (!m_isDownloading)
			if (SuperGIS.DDDCore.DataLoader.isRunning && !m_isDownloading)
			{
				//m_Loading.applyStyles({ visibility: "visible" });
				m_isDownloading = true;
				//m_Loading.getNode().src = strAppRoot + "images/download_animation.gif";
			}
			else if (!SuperGIS.DDDCore.DataLoader.isRunning && m_isDownloading)
			{
				//m_Loading.applyStyles({ visibility: "hidden" });
				m_isDownloading = false;
				//m_Loading.getNode().src = strAppRoot + "images/download_static.png";
			}
	
			//m_pCell.clearChildren();
			//m_pCell.appendText(sTPCPoint + "  |  " + sTmp1 + "  |  " + sTmp2 + "  |  " + sTmp3 + "  |  " + sTmp4 + "  |  " + sTmp5);
		}
	}
}

function DialogCommand(pParent, DialogPrototype)
{
	var pDlg = null;
	this.MapCommand = function(pEarth)
	{
		if (pDlg == null)
		{
			pDlg = new DialogPrototype(pParent, pEarth);
			pDlg.addEventListener("Closed", function() { pDlg = null; });
		}
		else 
			pDlg.Close();
	}
}

function CommandCustom() { this.MapCommand = function(pEarth) { pEarth.RaiseObjectEvent(this, "Command"); }; }

function IndexviewDialog(pParent, pEarth)
{
	SuperGIS.Windows.Dialog.call(this, pParent);
	this.Close = function()
	{
		this.Destroy();
		this.raiseEvent("Closed");
		return true;
	}
	var pThis = this;
	var pCam = pEarth.GetCamera();
	function DrawIndexRect(obj, sEvent)
	{
		if (!pThis.getVisible())
			return;
		var rects = [
			[-1, -1, 0], [-1, -0.5, 0], [-1, 0, 0], [-1, 0.5, 0],
			[-1, 1, 0], [-0.75, 1, 0], [-0.5, 1, 0], [-0.25, 1, 0], [0, 1, 0], [0.25, 1, 0], [0.5, 1, 0], [0.75, 1, 0],
			[1, 1, 0], [1, 0.5, 0], [1, 0, 0], [1, -0.5, 0],
			[1, -1, 0], [0.75, -1, 0], [0.5, -1, 0], [0.25, -1, 0], [0, -1, 0], [-0.25, -1, 0], [-0.5, -1, 0], [-0.75, -1, 0]
		];
		var pGlobe = pEarth.GetGlobe();
		var vEye = pCam.EyeAt;
		
		var cpt = pGlobe.GeodeticFromCartesian(pGlobe.RayTest(vEye, pCam.Ray(new SuperGIS.DDDCore.Vector3(0, 0, 0)), 1, false));
		var rx = 0;
		var ry = 0;
		var pts = []
		for (var r in rects)
		{
			var pt = pGlobe.GeodeticFromCartesian(pGlobe.RayTest(vEye, pCam.Ray(SuperGIS.DDDCore.Vector3.NewVector3(rects[r])), 1, false));
			if (pt)
			{
				var dx = pt.Longitude - cpt.Longitude;
				var dy = pt.Latitude - cpt.Latitude;
				if (dx < -180) dx += 360;
				if (dx > 180) dx -= 360;
				pts.push([dx, dy]);
				rx = Math.max(rx, Math.abs(dx));
				ry = Math.max(ry, Math.abs(dy));
			}
		}
		var da = Math.max(1, 30 / Math.max(rx, ry));
		da = Math.pow(2, Math.round(Math.log(da) / Math.log(2)));
		var iw = pDiv.getNode().clientWidth * da;
		var ih = pDiv.getNode().clientHeight * da;
		var sdx = pDiv.getNode().clientWidth / 2.0;
		var sdy = pDiv.getNode().clientHeight / 2.0;
		var nx = Math.round(cpt.Longitude * iw / 360.0);
		var ny = Math.round(cpt.Latitude * ih / 180.0);
		if (sdy > ih / 2.0 - ny) sdy = ih / 2.0 - ny;
		if (sdy > ih / 2.0 + ny) sdy = sdy * 2 - ih / 2.0 - ny
		m_pIndexviewImage1.applyStyles({width:iw + "px",height:ih + "px",left:(sdx - nx - iw) + "px",top:(sdy - ih / 2.0 + ny) + "px"});
		m_pIndexviewImage2.applyStyles({width:iw + "px",height:ih + "px",left:(sdx - nx) + "px",top:(sdy - ih / 2.0 + ny) + "px"});
		for (var p in pts)
		{
			pts[p][0] = sdx + pts[p][0] * iw / 360.0;
			pts[p][1] = sdy - pts[p][1] * ih / 180.0;
		}
		pts.push(pts[0]);
		var topt = null;
		var opt = pts[0];
		var idx = [];
		var s = 0;
		for (var i = 1 ; i < pts.length ; i++)
		{
			var tpt = pts[i];
			var dx = opt[0] - tpt[0];
			if (Math.abs(dx) > iw / 2.0)
			{
				var tpts = pts.slice(s, i);
				s = i;
				if (topt != null)
					tpts.unshift(topt);
				if (dx < 0)
				{
					tpts.push([tpt[0] - iw, tpt[1]]);
					topt = [opt[0] + iw, opt[1]]
				}
				else if (dx > 0)
				{
					tpts.push([tpt[0] + iw, tpt[1]]);
					topt = [opt[0] - iw, opt[1]]
				}
				idx.push(tpts);
			}
			opt = tpt;
		}
		if (topt != null)
		{
			var tpts = pts.slice(s, pts.length - 1);
			tpts.unshift(topt);
			idx[0] = tpts.concat(idx[0]);
		}
		else
			idx.push(pts.slice(s, pts.length));
		for (var i in idx)
		{
			tpts = idx[i];
			var tpt = tpts[0];
			var opt = tpts[tpts.length - 1];
			var dx = opt[0] - tpt[0];
			if (Math.abs(dx) > iw / 2.0)
			{
				if (dx < 0)
				{
					tpts.push([-1, -1]);
					tpts.push([iw + 1, -1]);
				}
				else if (dx > 0)
				{
					tpts.push([iw + 1, ih + 1]);
					tpts.push([-1, ih + 1]);
				}
			}
		}
		m_pIndexviewGraph.clear();
		for (var i in idx)
			m_pIndexviewGraph.drawPolyline(idx[i], "rgba(255,0,0,1)", 1);
		m_pIndexviewGraph.drawPolygon(idx, "rgba(255,0,0,0.2)");
	}

	this.Update = function() { DrawIndexRect(pCam, "changed"); }
	
	this.applyStyles({bottom:"0px",left:"0px",top:"",right:""});
	this.Header.applyAttributes({align:"center"});
	this.Header.applyStyles({fontFamily:"Arial", color:"rgb(1,1,1)"});
	this.Header.appendText("IndexView");
	this.Content.applyStyles({height:"138px"});
	var pDiv = this.Content.appendObject("div", null, {position:"relative",top:"0px",left:"0px",width:"268px",height:"134px",overflow:"hidden"})
	m_pIndexviewImage1 = pDiv.appendObject("img", {src:strAppRoot + "images/Skin.jpg",width:"268",height:"134"}, {position:"absolute",left:"0px"});
	m_pIndexviewImage2 = pDiv.appendObject("img", {src:strAppRoot + "images/Skin.jpg",width:"268",height:"134"}, {position:"absolute",left:"268px"});
	m_pIndexviewGraph = new SuperGIS.Graphic.Canvas(pDiv.appendElement("canvas", {width:"268px",height:"134px"}, {position:"absolute",top:"0px",left:"0px",width:"268px",height:"134px"}));
	pEarth.addEventListener("ObjectEvent", ObjectEventFunction(pCam, "changed", DrawIndexRect));
	this.Update();
}



//
// 以下是新版的 UI 工具
//

/**
 * 設定一個項目的尺寸
 * @param {number} w 長
 * @param {number} h 高
 */
function Size(w, h) {
    /**
     * 長
     */
    this.width = (isNaN(w)) ? 0 : w;
    /**
     * 高
     */
    this.height = (isNaN(h)) ? 0 : h;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EatrhApp_G.js  for  重新刻版高雄3D系統用
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 基底樣板窗格
 * @param {*} pParent 此視窗上一層元素
 * @param {*} Options 此視窗專屬特別設定
 */
function TemplateWindow(pParent, Options) {
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
    /**
     * 關閉本窗格紐
     */
    this.CloseButton = null;
    /**
     * 視窗左上角位置(單位:像素pixels,容器最左上角(0,0)起計算,預設(150,100))
     */
    this.Location = { top: 60, left: 60 };
    /**
     * 視窗大小(單位:像素pixels,預設150*100)
     */
    this.Size = { width: 150, height: 100 };
    /**
     * 三段寬度
     */
    this._3SecWidth = [7, 136, 7];
    /**
     * 三段高度
     */
    this._3SecHeight = [38, 52, 10];
    /**
     * 目前選項
     */
    this.CurrentPicked = null;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.ReadOptions = function (OPTS) {
        if (!OPTS) {
            //沒有設定值就離開
            return;
        }
        //窗格左上角
        if (OPTS.Left && OPTS.Top && (!isNaN(OPTS.Left)) && (!isNaN(OPTS.Top)) && OPTS.Left > 0 && OPTS.Top > 0) {
            this.Location.top = OPTS.Top;
            this.Location.left = OPTS.Left;
        }
        //窗格大小(改用三段寬度、三段高度處理)
        if (OPTS.WidthSet && OPTS.HeightSet && OPTS.WidthSet instanceof Array && OPTS.HeightSet instanceof Array &&
            OPTS.WidthSet.length > 2 && (!OPTS.WidthSet.some(isNaN)) &&
            OPTS.HeightSet.length > 2 && (!OPTS.HeightSet.some(isNaN))) {
            this._3SecWidth = OPTS.WidthSet;
            this._3SecHeight = OPTS.HeightSet;
            //this.Size.width = OPTS.WidthSet.reduce((a, b) => a + b);
            //this.Size.height = OPTS.HeightSet.reduce((a, b) => a + b);
			this.Size.width = OPTS.WidthSet.reduce(function(a, b) { return a + b; });
            this.Size.height = OPTS.HeightSet.reduce(function(a, b) { return a + b; });
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
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是建立本物件時怎樣都要跑的程序  /////////
    ///////////////////////////////////////////////////////////////////////////
    //抄自EarthApp.js內EarthDialog裡面的Code但部分設定值改成上面ReadOptions讀出來後的值(換言之,可以靠傳入Options自定義)
    this.ReadOptions(Options);
    AttributeTable.call(this, pParent.appendObject("table",
        { class: "SG3DTool", cellSpacing: "0px", cellPadding: "0px", border: "0px" },
        {
            position: "absolute", top: that.Location.top + "px", left: that.Location.left + "px",
            width: that.Size.width + "px", height: that.Size.height + "px", backgroundColor:"#FFFFFF",borderRadius:"5px"
        }).getNode());
    var bVisible = true;
    this.getVisible = function () {
        return bVisible;
    };
    this.setVisible = function (v) {
        bVisible = v;
        this.applyStyles({ display: (bVisible ? "" : "none") });
    }
    this.Destroy = function () {
        pParent.removeChildren(this);
        this.raiseEvent("Closed");
    }

    var cVertical = [{ height: this._3SecHeight[0] + "px" }, { height: this._3SecHeight[1] + "px" }, { height: this._3SecHeight[2] + "px" }];
    // var ctop = { height: this._3SecHeight[0] + "px" };
    // var cbtm = { height: this._3SecHeight[2] + "px" };
    var clft = { width: this._3SecWidth[0] + "px" };
    var cmid = { width: this._3SecWidth[1] + "px" };
    var crgt = { width: this._3SecWidth[2] + "px" };
    /*var c1 = { backgroundImage: "url(" + strAppRoot + "images/bg/T-Left.svg)", backgroundRepeat: "no-repeat", backgroundPosition: "top left" };
    var c2 = { backgroundImage: "url(" + strAppRoot + "images/bg/T-Middle.svg)", backgroundRepeat: "repeat-x", backgroundPosition: "top" };
    var c3 = { backgroundImage: "url(" + strAppRoot + "images/bg/T-Right.svg)", backgroundRepeat: "no-repeat", backgroundPosition: "top right" };
    var c4 = { backgroundImage: "url(" + strAppRoot + "images/bg/M-Left.svg)", backgroundRepeat: "repeat-y", backgroundPosition: "left" };
    var c5 = { backgroundImage: "url(" + strAppRoot + "images/bg/M-Middle.svg)", backgroundRepeat: "repeat" };
    var c6 = { backgroundImage: "url(" + strAppRoot + "images/bg/M-Right.svg)", backgroundRepeat: "repeat-y", backgroundPosition: "right" };
    var c7 = { backgroundImage: "url(" + strAppRoot + "images/bg/B-Left.svg)", backgroundRepeat: "no-repeat", backgroundPosition: "bottom left" };
    var c8 = { backgroundImage: "url(" + strAppRoot + "images/bg/B-Middle.svg)", backgroundRepeat: "repeat-x", backgroundPosition: "bottom" };
    var c9 = { backgroundImage: "url(" + strAppRoot + "images/bg/B-Right.svg)", backgroundRepeat: "no-repeat", backgroundPosition: "bottom right" };*/

    this.HeaderRow = this.createRow(null, cVertical[0]);
    this.HeaderRow.createCell(null, null, SuperGIS.Windows.MergeStyle([cVertical[0], clft]));
    this.Header = this.HeaderRow.createCell(null, null, SuperGIS.Windows.MergeStyle([cVertical[0], cmid, EarthDialog.CaptionStyle]));
    this.HeaderRow.createCell(null, null, SuperGIS.Windows.MergeStyle([cVertical[0], crgt]))

    this.ContentRow = this.createRow(null, cVertical[1]);
    this.ContentRow.createCell(null, null, SuperGIS.Windows.MergeStyle([clft]));
    this.Content = this.ContentRow.createCell(null, null, null, cmid);
    this.ContentRow.createCell(null, null, SuperGIS.Windows.MergeStyle([crgt]));

    this.FooterRow = this.createRow(null, cVertical[2]);
    this.FooterRow.createCell(null, null, SuperGIS.Windows.MergeStyle([cVertical[2], clft]));
    this.Footer = this.FooterRow.createCell(null, null, SuperGIS.Windows.MergeStyle([cVertical[2], cmid]));
    this.FooterRow.createCell(null, null, SuperGIS.Windows.MergeStyle([cVertical[2], crgt]));

    new DragTracker(this.Header.getNode(), this.getNode());
    //固定放一個關閉本窗格用的X在右上角,然後按了後應該可以把自己關掉
    this.CloseButton = this.Header.appendElement("img", null,
        { position: "absolute", right: "14px", top: "14px", width: "8px", height: "8px", cursor: "pointer" });
    this.CloseButton.src = strAppRoot + "images/close.svg";
    AttachEvent(that.CloseButton, "click", function () {
        that.Close();
    });
}
/////////////////////////////////////////////////////////////////////////////////
//  可能需要被overwrite的方法
/////////////////////////////////////////////////////////////////////////////////
/**
 * 關閉窗格
 */
TemplateWindow.prototype.close = function () {
    this.Destroy();
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  上面是 Gary 新造樣板視窗的code區
//  下面是 Gary 以上面的新造樣板重新刻出來的各種功能視窗區(Part 1:測量)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 測量工具窗
 * @param {*} pParent 此對話框的上一層HTML元件
 * @param {*} pEarth 3D地圖
 * @param {*} callback 
 */
function MeasureDialog(pParent, pEarth, callback) {
    TemplateWindow.call(this, pParent, {
        WidthSet: [7, 253, 7]
        , HeightSet: [38, 132, 10]
    });
    //基於繼承,這個是一定要先call的
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.Initialize = function () {
		document.body.style.cursor = "crosshair";
		
        this.Header.applyAttributes({ vAlign: "middle" });
        //----測量窗  標頭  四個按鈕
        /**
         * Gary Lu 20200218 新加入一個選擇測量類型的圖片、並且設定好滑鼠進出與被點選之後怎麼處理(以下面這個點為範例，其他水平距離、垂直高、面積都一樣)
         */
        var imgPoint = this.appendElement("img", { src: "images/Measure/Measure_Point_UnSelected.svg" }, { position: "absolute", left: "10px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        AttachEvent(imgPoint, "mouseover", function () {
            if (that.CurrentPicked != "Point")
                imgPoint.src = "images/Measure/Measure_Point_hover.svg";
        });
        AttachEvent(imgPoint, "mouseout", function () {
            if (that.CurrentPicked != "Point")
                imgPoint.src = "images/Measure/Measure_Point_UnSelected.svg";
        });
        AttachEvent(imgPoint, "click", function () {
            imgPoint.src = "images/Measure/Measure_Point_Selected.svg";
            RenewCurrentPicked("Point");
        });
        var imgLine = this.appendElement("img", { src: "images/Measure/Measure_Line_UnSelected.svg" }, { position: "absolute", left: "62px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        AttachEvent(imgLine, "mouseover", function () {
            if (that.CurrentPicked != "Line")
                imgLine.src = "images/Measure/Measure_Line_hover.svg";
        });
        AttachEvent(imgLine, "mouseout", function () {
            if (that.CurrentPicked != "Line")
                imgLine.src = "images/Measure/Measure_Line_UnSelected.svg";
        });
        AttachEvent(imgLine, "click", function () {
            imgLine.src = "images/Measure/Measure_Line_Selected.svg";
            RenewCurrentPicked("Line");
        });
        var imgArea = this.appendElement("img", { src: "images/Measure/Measure_Area_UnSelected.svg" }, { position: "absolute", left: "114px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        AttachEvent(imgArea, "mouseover", function () {
            if (that.CurrentPicked != "Area")
                imgArea.src = "images/Measure/Measure_Area_hover.svg";
        });
        AttachEvent(imgArea, "mouseout", function () {
            if (that.CurrentPicked != "Area")
                imgArea.src = "images/Measure/Measure_Area_UnSelected.svg";
        });
        AttachEvent(imgArea, "click", function () {
            imgArea.src = "images/Measure/Measure_Area_Selected.svg";
            RenewCurrentPicked("Area");
        });
        var imgHeight = this.appendElement("img", { src: "images/Measure/Measure_Height_UnSelected.svg" }, { position: "absolute", left: "166px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        AttachEvent(imgHeight, "mouseover", function () {
            if (that.CurrentPicked != "Height")
                imgHeight.src = "images/Measure/Measure_Height_hover.svg";
        });
        AttachEvent(imgHeight, "mouseout", function () {
            if (that.CurrentPicked != "Height")
                imgHeight.src = "images/Measure/Measure_Height_UnSelected.svg";
        });
        AttachEvent(imgHeight, "click", function () {
            imgHeight.src = "images/Measure/Measure_Height_Selected.svg";
            RenewCurrentPicked("Height");
        });
        //----測量窗  中間段  說明(按了標頭區四個按鈕後要顯示操作說明的地方)
        that.Content.applyAttributes({ valign: "top" });
        var pMiddleLbl = that.Content.appendElement("label", { id: "lblMeasureGuide" }
            , {
                "font-family": "Microsoft Jhenghei"
                , "font-size": "12px"
                , "line-height": "21px"
            });
        /**
         * 更新目前的測量項目(作為把按鈕圖還原的依據)
         * @param {string} newVal 目前選擇的測量項目
         */
        var RenewCurrentPicked = function (newVal) {
            if (that.CurrentPicked == newVal) {
                return;
            }
            //先把舊選項的圖換回來
            switch (that.CurrentPicked) {
                case "Point":
                    imgPoint.src = "images/Measure/Measure_Point_UnSelected.svg";
                    break;
                case "Line":
                    imgLine.src = "images/Measure/Measure_Line_UnSelected.svg";
                    break;
                case "Area":
                    imgArea.src = "images/Measure/Measure_Area_UnSelected.svg";
                    break;
                case "Height":
                    imgHeight.src = "images/Measure/Measure_Height_UnSelected.svg";
                    break;
            }
            //設定新值
            that.CurrentPicked = newVal;
			var elem = document.getElementById("lblMeasureGuide");
			var elem2 = document.getElementById("lblResult");
			if (newVal == "Point")
			{
                elem.innerHTML = "以滑鼠任意點擊地圖上某一個位置，將顯示該點的經緯度坐標與海拔高度。";
				elem2.innerHTML = "坐標：<br />海拔：";
				nMode = 0;
			}
			else if (newVal == "Line")
			{
				elem.innerHTML = "以滑鼠點擊地圖新增線段起點，再點擊一次決定線段終點後，量測出線段的直線距離。";
				elem2.innerHTML = "線段長度：";
				nMode = 1;
			}
			else if (newVal == "Area")
			{
                elem.innerHTML = "以滑鼠點擊地圖框出您欲測量的範圍，雙擊後顯示多邊形的水平面積。<br />註.有地形效果時，計算結果不是地形的表面積";
				elem2.innerHTML = "面積：<br />周長：";
				nMode = 2;
			}
			else
			{
                elem.innerHTML = "以滑鼠點擊地圖新增起始點，移動滑鼠決定高度後，再點擊一次顯示兩點高度差。";
				elem2.innerHTML = "高度差：";
				nMode = 3;
			}
			
			ClearMeasure();
			pEarth.Invalidate();
        };
		//分隔線和結果區
		that.Content.appendElement("hr",null,{
			position:"absolute"
			,top:"100px"
			,width:"253px"
		});
		var lblRes=that.Content.appendElement("label",{id:"lblResult"},{
			"position":"absolute"
			, "left":"10px"
			, "top":"120px"
			, "font-family": "Microsoft Jhenghei"
            , "font-size": "12px"
            , "line-height":"21px"
		});
		//預設選"點"
        imgPoint.src = "images/Measure/Measure_Point_Selected.svg";
        RenewCurrentPicked("Point");
    };
	
	function UpdatePointResult(pt)
	{
		var elem = document.getElementById("lblResult");
		elem.innerHTML = "坐標：" + pt.X.toFixed(6) + ", " + pt.Y.toFixed(6);
		elem.innerHTML += "<br/>海拔：";
		if (pSRef)
			elem.innerHTML += pt.Z.toFixed(2) + " 公尺";
		else
			elem.innerHTML += pt.Z.toString();
	}
	function UpdateLineResult(dist)
	{
		var elem = document.getElementById("lblResult");
		elem.innerHTML = "線段長度：";
		if (pSRef)
			elem.innerHTML +=  dist_cur.toFixed(2) + " 公尺";
		else
			elem.innerHTML +=  dist_cur.toString();
	}
	function UpdateAreaResult(area, dist)
	{
		var elem = document.getElementById("lblResult");
		elem.innerHTML = "面積：";
		if (pSRef)
			elem.innerHTML += area.toFixed(2) + " 平方公尺";
		else
			elem.innerHTML += area.toString();
		elem.innerHTML += "<br/>周長：";
		if (pSRef)
			elem.innerHTML += dist_sum.toFixed(2) + " 公尺";
		else
			elem.innerHTML += dist_sum.toString();
	}
	function UpdateHeightResult(diff)
	{
		var elem = document.getElementById("lblResult");
		elem.innerHTML = "高度差：";
		if (pSRef)
			elem.innerHTML += diff.toFixed(2) + " 公尺";
		else
			elem.innerHTML += diff.toString();
	}
	
    this.Close = function () {
		document.body.style.cursor = "default";
		
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
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是必要的私有Functions  /////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //  上面是必要的私有Functions,下面是建立本物件時怎樣都要跑的程序  //////////////
    ////////////////////////////////////////////////////////////////////////////
    this.Initialize();
	
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
	
	function RayTest(pori1, pdir1, pori2, pdir2)
	{
		var ori1 = SuperGIS.DDDCore.Vector3.ToVec3(pori1);
		var dir1 = SuperGIS.DDDCore.Vector3.ToVec3(pdir1);
		var ori2 = SuperGIS.DDDCore.Vector3.ToVec3(pori2);
		var dir2 = SuperGIS.DDDCore.Vector3.ToVec3(pdir2);
		var cdir = vec3.cross(dir1, dir2, [0, 0, 0]);
		var clen = vec3.dot(cdir, cdir);
		var len = 0;
		if (clen != 0)
		{
			var tvtr = vec3.subtract(ori2, ori1, [0, 0, 0]);
			var cvtr = vec3.scale(cdir, vec3.dot(tvtr, cdir) / clen, [0, 0, 0]); 
			var adir = vec3.cross(vec3.subtract(tvtr, cvtr, [0, 0, 0]), dir1);
			len = vec3.dot(adir, cdir) / clen;
		}
		return SuperGIS.DDDCore.Vector3.NewVector3(vec3.add(vec3.scale(dir2, len, [0, 0, 0]), ori2));
	}
	
	function AddThousand(num)
	{
		var len = num.length;
		var len2 = 0;
		var pos = num.indexOf('.');
		if (pos != -1)
			len2 = len - pos;

		var cnt = Math.floor((len - len2 - 1) / 3);
		for (var i = 0; i < cnt; i++)
		{
			var pos = len - len2 - (i + 1) * 3;
			num = num.slice(0, pos) + ',' + num.slice(pos);
		}
		return num;
	}

	function FormatDist(dist)
	{
		if (!pSRef)
			return dist.toString();
		
		if (dist < 1000)
			return AddThousand(dist.toFixed(2)) + " m";
		else
			return AddThousand((dist / 1000).toFixed(2)) + " km";
	}
	
	function FormatArea(area)
	{
		if (!pSRef)
			return area.toString();
		
		if (area > 1000000)
			return AddThousand((area / 1000000).toFixed(2)) + " km\xB2";
		else
			return AddThousand(area.toFixed(2)) + " m\xB2";
	}
	
	function CalcDist(x1, y1, x2, y2)
	{
		if (pGlobe.IsGCS())
		{
			var pt1 = { X: x1, Y: y1, Z: 0 };
			var pt2 = { X: x2, Y: y2, Z: 0 };
			pt1 = SpatialReference.CoordinateTransform(SR_4326, SR_3857, null, pt1);
			pt2 = SpatialReference.CoordinateTransform(SR_4326, SR_3857, null, pt2);
			return Math.sqrt((pt2.X - pt1.X) * (pt2.X - pt1.X) + (pt2.Y - pt1.Y) * (pt2.Y - pt1.Y));
		}
		else
			return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	}
	
	function CalcArea(XY)
	{
		var area = 0;
		var j = XY.length - 1;
		for (var i = 0; i < XY.length; i++)
		{
			area += (XY[j][0] + XY[i][0]) * (XY[j][1] - XY[i][1]);
			j = i;
		}
		return Math.abs(area / 2);
	}
	var tmp_Position = null;
	function GeodeticFromDevice(x, y)
	{
		if (tmp_Position == null)
			tmp_Position = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
		else
		{
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
	
	function GetSegment(loc1, loc2, pOriSegment)
	{
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
		for (var k = 0; k < 5; k++)
		{
			var x = corners[k][0];
			var y = corners[k][1];
			var z = corners[k][2];
			wkt += parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(z);
			if (k < 4)
				wkt += ",";
			else
				wkt += "))";
		}
		
		if (pOriSegment == null)
		{
			var pSegment = pEarth.CreatePlacemark("", wkt);
			pSegment.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 0.45, 0.08, 0.6)), null);
			pEarth.PlacemarkObjects.Add(pSegment);
			measure_Marks.push(pSegment);
			return pSegment;
		}
		else
		{
			pOriSegment.Geometry = wkt;
			pOriSegment.SetDirty();
			return pOriSegment;
		}
	}
	
	function GetSegmentWKT(loc1, loc2)
	{
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
		for (var k = 0; k < 5; k++)
		{
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
	
	function GetSegment2(loc1, loc2, pOriSegments)
	{
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
		for (var i = 0; i < div; i++)
		{
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
			for (var k = 0; k < 5; k++)
			{
				var x = corners[k][0];
				var y = corners[k][1];
				var z = corners[k][2];
				wkt += parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(z);
				if (k < 4)
					wkt += ",";
				else
					wkt += "))";
			}
			
			if (pOriSegment == null)
			{
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
			else
			{
				pOriSegment.Geometry = wkt;
				pOriSegment.SetDirty();
			}
			
			x1 = x2;
			y1 = y2;
			z1 = z2;
		}
		
		return pOriSegments;
	}		

	function CircleToPolygon(cx, cy, radius)
	{
		var length = radius;
		var N = 30;
		var xy = [];
		var CV_PI = 3.1416;
		for (var i = 0; i < N; i++)
		{
			var x = cx + length * Math.cos(i * 2 * CV_PI / N);
			var y = cy + length * Math.sin(i * 2 * CV_PI / N);
			xy.push([x, y]);
		}
		xy.push([cx + length, cy]);
		return xy;
	}
	
	function AddVertex(loc, radius, ZOffset)
	{
		var xy = CircleToPolygon(loc[0], loc[1], radius);
		var wkt = "POLYGON((";
		for (var i in xy)
		{
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
	
	function funcMouseDown(x, y, b, k)
	{
		bDown = true;
		down_x = x;
		down_y = y;
			
		pEarth.addEventListener("MouseUp", funcMouseUp, false, true);
	}
	
	function funcMouseMove(x, y, b, k)
	{
		if (nMode == 1 || nMode == 2)
		{
			if (isMeasureing && measure_Marks.length != 0)
			{
				var board_height = pEarth.GetCamera().Position.Z / 10;
				if (nMode == 1)
				{				
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
				else
				{
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
		else if (nMode == 3)
		{
			if (pVerticalExtrude != null && isMeasureing)
			{
				var CurPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
				if (CurPosition == null)
					return;
				
				var CurLocation = RayTest(pCam.EyeAt, pCam.Ray(CurPosition), pRefLocation, pGlobe.UpDirection(pRefLocation));
				var pt = pGlobe.GeodeticFromCartesian(CurLocation);
				if (pt.Z < pVerticalGroundMarker.ReplaceZ)
				{
					pVerticalExtrude.DefaultElevation = pt.Z;
					pVerticalExtrude.ReplaceZ = pVerticalGroundMarker.ReplaceZ - pt.Z;
					pVerticalExtrude.ReplaceZ = pVerticalGroundMarker.ReplaceZ - pt.Z;
				}
				else
				{
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
	
	function funcMouseUp(x, y, b, k)
	{
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
		pt = { X: pt.X, Y: pt.Y, Z: pt.Z};
		if (nMode == 0)
		{
			ClearMeasure();

			var loc = SuperGIS.DDDEarth.LatLonAlt.NewLatLonAlt(pt.Y, pt.X, pt.Z);
			var marker = new SuperGIS.Marker(pEarth, loc, "", "images/map.svg");
			var pm = marker.getPlacemark();
			pm.DDDSymbol.Size = 30;
			measure_Marks.push(marker.getPlacemark());
			UpdatePointResult(pt);

			if (callback)
				callback({ Position: { X: pt.X, Y: pt.Y }, Altitude: pt.Z });
		}
		else if (nMode == 1 || nMode == 2)
		{
			var old_Loc = down_Loc;
			down_Loc = GeodeticFromDevice(x, y);
			
			if (isMeasureing == false)
			{
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
				vertex_Locs	= [];					
			}
			else
			{
				if (nMode == 1)
				{
					isMeasureing = false;
					AddVertex(down_Loc, line_width * 2, 1);
					var wkt = GetSegmentWKT(old_Loc, down_Loc);
					var res = pEarth.AddSurface("M-Line", wkt, "RGB(253, 126, 38, 0.6)");
					// AddSurface 不成功是因為沒有 TileLayer 存在
					if (res)
					{
						for (var i in cur_Segments)
							pEarth.PlacemarkObjects.Remove(cur_Segments[i]);
					}
					
					pEarth.Invalidate();
					if (callback)
						callback({ Length: dist_cur });
					return;
				}
				
				if (cur_Segment == null) // 按了 DblClick
					return;
					
				dist_sum += dist_cur;
				current_Board.Name = FormatDist(dist_sum);
			}
				
			vertex_Locs.push(down_Loc);
			
			AddVertex(down_Loc, line_width * 2, 1);

			if (current_Board)
			{
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
		}
		else if (nMode == 3)
		{		
			if (pVerticalExtrude == null)
			{
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
			else
			{
				isMeasureing = false;
				pVerticalExtrude = null;
				if (callback)
					callback({ Elevation: pVerticalMarker.ReplaceZ - pVerticalGroundMarker.ReplaceZ });
			}
		}

		pEarth.Invalidate();
		return false;
	}
	
	function funcDblClick(tEvent)
	{
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
		for (var i in vertex_Locs)
		{
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
		for (var i in vertex_Locs)
		{
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
	
	function ClearMeasure()
	{
		pEarth.RemoveSurface("M-Line");
		pEarth.RemoveSurface("M-Area");
		for (var i in measure_Marks)
		{
			pEarth.PlacemarkObjects.Remove(measure_Marks[i]);
			delete measure_Marks[i];
		}
		measure_Marks = [];
		isMeasureing = false;
		pVerticalExtrude = null;
		pEarth.Invalidate();
	}
	
	pEarth.addEventListener("MouseDown", funcMouseDown, false, true);
	pEarth.addEventListener("MouseMove", funcMouseMove, false, true);
	pEarth.addEventListener("dblclick", funcDblClick, false);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  這裡是 Gary 以上面的新造樣板重新刻出來的各種功能視窗區
//  上面:Part 1:測量  下面:Part 2:繪圖
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function PaintDialog(pParent, pEarth) {
    TemplateWindow.call(this, pParent, {
        WidthSet: [7, 253, 7]
        , HeightSet: [38, 42, 10]
    });
    //基於繼承,這個是一定要先call的
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.Initialize = function () {
		document.body.style.cursor = "crosshair";
		
        this.Header.applyAttributes({ vAlign: "middle" });
        /**
         * Gary Lu 20200218 新加入一個選擇測量類型的圖片、並且設定好滑鼠進出與被點選之後怎麼處理(以下面這個點為範例，其他水平距離、垂直高、面積都一樣)
         */
        var imgPoint = this.appendElement("img", { src: "images/Draw/Draw_Point_UnSelected.svg" }, { position: "absolute", left: "10px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        var imgLine = this.appendElement("img", { src: "images/Draw/Draw_Line_UnSelected.svg" }, { position: "absolute", left: "62px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        var imgArea = this.appendElement("img", { src: "images/Draw/Draw_Area_UnSelected.svg" }, { position: "absolute", left: "114px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgPoint
            , function () {
                if (that.CurrentPicked != "Point")
                    imgPoint.src = "images/Draw/Draw_Point_hover.svg";
            }
            , function () {
                if (that.CurrentPicked != "Point")
                    imgPoint.src = "images/Draw/Draw_Point_UnSelected.svg";
            }
            , function () {
                imgPoint.src = "images/Draw/Draw_Point_Selected.svg";
                RenewCurrentPicked("Point");
            });
        this.SetHeaderButtonEvent(imgLine
            , function () {
                if (that.CurrentPicked != "Line")
                    imgLine.src = "images/Draw/Draw_Line_hover.svg";
            }
            , function () {
                if (that.CurrentPicked != "Line")
                    imgLine.src = "images/Draw/Draw_Line_UnSelected.svg";
            }
            , function () {
                imgLine.src = "images/Draw/Draw_Line_Selected.svg";
                RenewCurrentPicked("Line");
            });
        this.SetHeaderButtonEvent(imgArea
            , function () {
                if (that.CurrentPicked != "Area")
                    imgArea.src = "images/Draw/Draw_Area_hover.svg";
            }
            , function () {
                if (that.CurrentPicked != "Area")
                    imgArea.src = "images/Draw/Draw_Area_UnSelected.svg";
            }
            , function () {
                imgArea.src = "images/Draw/Draw_Area_Selected.svg";
                RenewCurrentPicked("Area");
            });
        //----繪圖窗  中間段  顯示功能操作提示文字
        var pMiddleLbl = that.Content.appendElement("label", { id: "lblDrawGuide" }
            , {
                "font-family": "Microsoft Jhenghei"
                , "font-size": "12px"
                , "line-height": "21px"
            });
        /**
          * 更新目前的測量項目(作為把按鈕圖還原的依據)
          * @param {string} newVal 目前選擇的項目
          */
        var RenewCurrentPicked = function (newVal) {
            if (that.CurrentPicked == newVal) {
                return;
            }
            //先把舊選項的圖換回來
            switch (that.CurrentPicked) {
                case "Point":
                    imgPoint.src = "images/Draw/Draw_Point_UnSelected.svg";
                    break;
                case "Line":
                    imgLine.src = "images/Draw/Draw_Line_UnSelected.svg";
                    break;
                case "Area":
                    imgArea.src = "images/Draw/Draw_Area_UnSelected.svg";
                    break;
            }
            //設定新值
            that.CurrentPicked = newVal;
			var elem = document.getElementById("lblDrawGuide");
			if (newVal == "Point")
			{
                elem.innerHTML = "點擊地圖，新增一筆點圖形。";
				nMode = 0;
			}
			else if (newVal == "Line")
			{
                elem.innerHTML = "點擊地圖，新增線段節點，雙擊左鍵後完成線圖形。";
				nMode = 1;
			}
			else
			{
				elem.innerHTML = "點擊地圖，新增多邊形節點，雙擊左鍵後完成多邊形。";
				nMode = 2;
			}
        };
        imgPoint.src = "images/Draw/Draw_Point_Selected.svg";
        RenewCurrentPicked("Point");
    };
    this.Close = function () {
		document.body.style.cursor = "default";
		
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
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是必要的私有Functions  /////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //  上面是必要的私有Functions,下面是建立本物件時怎樣都要跑的程序  //////////////
    ////////////////////////////////////////////////////////////////////////////
    this.Initialize();
	
	// 功能移植

	var line_width = 0;
	var vertex_Locs = [];
	var measure_Marks = [];
	var isMeasureing = false;
	var pScene = pEarth.GetScene();
	var pCam = pEarth.GetCamera();
	var pGlobe = pEarth.GetGlobe();
	var surfaceTexture = pEarth.CreateModelTexture("images/surface.jpg");

	var down_Loc = null;
	var cur_Segment = null;
	var cur_Segments = [];
	
	var pNavi = pEarth.GetCurrentTool();
	pNavi.ExitTool();
	pNavi.DoubleClickEnable = false;
	pNavi.InitTool(pEarth);
	
	pEarth.addEventListener("MouseDown", funcMouseDown, false, true);
	pEarth.addEventListener("MouseMove", funcMouseMove, false, true);
	pEarth.addEventListener("dblclick", funcDblClick, false);

	var tmp_Position = null;
	function GeodeticFromDevice(x, y)
	{
		if (tmp_Position == null)
			tmp_Position = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
		else
		{
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
	
	function GetSegment(loc1, loc2, pOriSegment)
	{
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
		for (var k = 0; k < 5; k++)
		{
			var x = corners[k][0];
			var y = corners[k][1];
			var z = corners[k][2];
			wkt += parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(z);
			if (k < 4)
				wkt += ",";
			else
				wkt += "))";
		}
		
		if (pOriSegment == null)
		{
			var pSegment = pEarth.CreatePlacemark("", wkt);
			pSegment.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 0.45, 0.08, 0.6)), null);
			pEarth.PlacemarkObjects.Add(pSegment);
			measure_Marks.push(pSegment);
			return pSegment;
		}
		else
		{
			pOriSegment.Geometry = wkt;
			pOriSegment.SetDirty();
			return pOriSegment;
		}
	}
	
	function GetSegmentWKT(loc1, loc2)
	{
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
		for (var k = 0; k < 5; k++)
		{
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

	function CircleToPolygon(cx, cy, radius)
	{
		var length = radius;
		var N = 30;
		var xy = [];
		var CV_PI = 3.1416;
		for (var i = 0; i < N; i++)
		{
			var x = cx + length * Math.cos(i * 2 * CV_PI / N);
			var y = cy + length * Math.sin(i * 2 * CV_PI / N);
			xy.push([x, y]);
		}
		xy.push([cx + length, cy]);
		return xy;
	}
	
	function AddVertex(loc, radius, ZOffset)
	{
		var xy = CircleToPolygon(loc[0], loc[1], radius / 2);
		var wkt = "POLYGON((";
		for (var i in xy)
		{
			wkt += xy[i][0].toString() + ' ';
			wkt += xy[i][1].toString();
			if (i != xy.length - 1)
				wkt += ','
		}
		wkt += "))";
		var marker = pEarth.CreatePlacemark("", wkt);
		marker.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 0.45, 0.08, 0.6)), null);
		marker.ReplaceZ = loc[2] + ZOffset;
		pEarth.PlacemarkObjects.Add(marker);
		measure_Marks.push(marker);
		return marker;
	}
		
	function funcMouseDown(x, y, b, k)
	{
		bDown = true;
		down_x = x;
		down_y = y;
			
		pEarth.addEventListener("MouseUp", funcMouseUp, false, true);
	}
	
	function funcMouseMove(x, y, b, k)
	{
		if (nMode == 1 || nMode == 2)
		{
			if (isMeasureing && measure_Marks.length != 0)
			{
				var cur_Loc = GeodeticFromDevice(x, y);
				cur_Segment = GetSegment(down_Loc, cur_Loc, cur_Segment);				
				pEarth.Invalidate();
			}
		}
	}
	function funcMouseUp(x, y, b, k)
	{
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
		pt = { X: pt.X, Y: pt.Y, Z: pt.Z};
		if (nMode == 0)
		{
			var loc = SuperGIS.DDDEarth.LatLonAlt.NewLatLonAlt(pt.Y, pt.X, pt.Z);
			var marker = new SuperGIS.Marker(pEarth, loc, "", "images/map.svg");
			var pm = marker.getPlacemark();
			pm.DDDSymbol.Size = 30;
			measure_Marks.push(marker.getPlacemark());
		}
		else if (nMode == 1 || nMode == 2)
		{
			var old_Loc = down_Loc;
			down_Loc = GeodeticFromDevice(x, y);
			
			if (isMeasureing == false)
			{
				isMeasureing = true;
				dist_sum = 0;
				var h = pCam.Position.Z;
				line_width = h * 0.00000004;
				if (nMode == 1)
					line_width *= 2;
				if (!pGlobe.IsGCS())
					line_width *= 100000;
				vertex_Locs	= [];					
			}
			else
			{
				if (cur_Segment == null) // 按了 DblClick
					return;
			}
				
			vertex_Locs.push(down_Loc);
			AddVertex(down_Loc, line_width * 2, 1);
			cur_Segment = null;
			cur_Segments = [];
		}
		pEarth.Invalidate();
		return false;
	}
	
	function funcDblClick(tEvent)
	{
		if (vertex_Locs.length < 3)
			return;
		
		if (nMode == 1)
		{
			isMeasureing = false;
			pEarth.Invalidate();
			return;
		}
		
		var loc1 = vertex_Locs[vertex_Locs.length - 1];
		var loc2 = vertex_Locs[0];
		GetSegment(loc1, loc2, null); // 使首尾連
		vertex_Locs.push(vertex_Locs[0]);

		var max_h = -Number.MAX_VALUE;
		for (var i in vertex_Locs)
			max_h = Math.max(vertex_Locs[i][2], max_h);
		if (Math.round(max_h) == 0) // 使不要看到很小的科學記號值
			max_h = 0;
		max_h += 1; // 因所畫的線及節點都往上長 1
		
		var XYs = [];
		var wkt = "POLYGON((";
		for (var i in vertex_Locs)
		{
			var loc = vertex_Locs[i];
			var x = loc[0];
			var y = loc[1];
			var z = loc[2] + 1; // 因所畫的線及節點都往上長 1
			wkt += parseFloat(x) + " " + parseFloat(y) + " " + parseFloat(max_h);
			if (i == vertex_Locs.length - 1)
				wkt += "))";
			else
				wkt += ",";
				
			var pt = { X: x, Y: y, Z: 0 };
			if (pGlobe.IsGCS())
				pt = SpatialReference.CoordinateTransform(SR_4326, SR_3857, null, pt);
			XYs.push([pt.X, pt.Y]);
		}

		var surface = pEarth.CreatePlacemark("", wkt);
		surface.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 1, 0.3)), null);
		surface.DDDSymbol.Texture = surfaceTexture;
		pEarth.PlacemarkObjects.Add(surface);
		measure_Marks.push(surface);

		vertex_Locs = [];
		isMeasureing = false;
		
		pEarth.Invalidate();
	}
	
	function ClearMeasure()
	{
		for (var i in measure_Marks)
		{
			pEarth.PlacemarkObjects.Remove(measure_Marks[i]);
			delete measure_Marks[i];
		}
		measure_Marks = [];
		isMeasureing = false;
		pEarth.Invalidate();
	}	
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  這裡是 Gary 以上面的新造樣板重新刻出來的各種功能視窗區
//  上面:Part 2:繪圖  下面:Part 3:上傳KML或KMZ
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function KMLDialog(pParent, pEarth) {
    TemplateWindow.call(this, pParent, {
        WidthSet: [7, 253, 7]
        , HeightSet: [38, 72, 10]
    });
    //基於繼承,這個是一定要先call的
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.Initialize = function () {
        //標題帶 選擇URL或是檔案上傳的兩顆鈕
        var imgByURL = this.appendElement("img", { src: "images/Uploads/Upload_Url_UnSelected.svg" }, { position: "absolute", left: "10px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        var imgByFile = this.appendElement("img", { src: "images/Uploads/Upload_File_UnSelected.svg" }, { position: "absolute", left: "62px", top: "10px", width: "42px", height: "23px", cursor: "pointer" });
        this.SetHeaderButtonEvent(
            imgByURL
            , function () {
                if (that.CurrentPicked != "URL") {
                    imgByURL.src = "images/Uploads/Upload_Url_hover.svg";
                }
            }
            , function () {
                if (that.CurrentPicked != "URL") {
                    imgByURL.src = "images/Uploads/Upload_Url_UnSelected.svg";
                }
            }
            , function () {
                imgByURL.src = "images/Uploads/Upload_Url_Selected.svg";
                RenewCurrentPicked("URL");
                divUploadByURL.applyStyles({ display: "" });
                divUploadByFile.applyStyles({ display: "none" });
            }
        );
        this.SetHeaderButtonEvent(
            imgByFile
            , function () {
                if (that.CurrentPicked != "File") {
                    imgByFile.src = "images/Uploads/Upload_File_hover.svg";
                }
            }
            , function () {
                if (that.CurrentPicked != "File") {
                    imgByFile.src = "images/Uploads/Upload_File_UnSelected.svg";
                }
            }
            , function () {
                imgByFile.src = "images/Uploads/Upload_File_Selected.svg";
                RenewCurrentPicked("File");
                divUploadByURL.applyStyles({ display: "none" });
                divUploadByFile.applyStyles({ display: "" });
            }
        );
        /**
          * 更新目前的測量項目(作為把按鈕圖還原的依據)
          * @param {string} newVal 目前選擇的項目
          */
        var RenewCurrentPicked = function (newVal) {
            if (that.CurrentPicked == newVal) {
                return;
            }
            //先把舊選項的圖換回來
            switch (that.CurrentPicked) {
                case "File":
                    imgByFile.src = "images/Uploads/Upload_File_UnSelected.svg";
					imgAddModel.style.display = "";
                    break;
                case "URL":
                    imgByURL.src = "images/Uploads/Upload_Url_UnSelected.svg";
					imgAddModel.style.display = "none";
                    break;
            }
            //設定新值
            that.CurrentPicked = newVal;
        };
        //中間段 兩個DIV切換
        var divUploadByURL = this.Content.appendObject("div", { id: "divUploadKMLByURL" }, { width: "100%", height: "45px", display: "none" });
        var divUploadByFile = this.Content.appendObject("div", { id: "divUploadKMLByFile" }, { width: "100%", height: "45px", display: "none" });
        var lblSign = divUploadByURL.appendElement("label", null, { margin: "0px", fontFamily: "Microsoft Jhenghei", fontSize: "12px", lineHeight: "21px" });
        lblSign.innerHTML = "URL：";
        //(輸入方塊在"URL："字樣的下方，先暫時放一個br斷行，怕等一下新增一個輸入方塊變成在"URL："的後面)
        divUploadByURL.appendObject("br", null, null);
        divUploadByURL.appendObject("input", { id: "iptKMLURL", type: "text" }, { width: "100%", fontFamily: "Microsoft Jhenghei", fontSize: "12px", border: "#909090 1px solid" });
		//"加入模型"
        var imgAddModel = this.Content.appendElement("img", { src: "images/Uploads/Upload_Add.svg" }, { width: "78px", height: "20px", marginRight: "0", marginBottom: "0", float: "right", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgAddModel
            , function () {
                imgAddModel.src = "images/Uploads/Upload_Add_Click.svg";
            }
            , function () {
                imgAddModel.src = "images/Uploads/Upload_Add.svg";
            }
            , function () {
                imgAddModel.src = "images/Uploads/Upload_Add_Click.svg";
				if (LoadKMZs(document.getElementById("iptKMLURL").value))
					document.getElementById("iptKMLURL").value = "";
            }
        );
        //預設"URL"
        imgByURL.src = "images/Uploads/Upload_Url_Selected.svg";
        RenewCurrentPicked("URL");
        divUploadByURL.applyStyles({ display: "" });

		function AppendNextFile(tEvent)
		{
			pForm.getNode().submit();
		}
		var id = new Date().getTime();
		var pIFrame = this.Content.appendObject("iframe", {name:"upload" + id,id:"upload" + id}, {display:"none"});
		pIFrame.addEventListener("load", function()
		{
			pForm.getNode().reset();
			pForm.clearChildren();
			//var pIpt = pForm.appendObject("input", { name: "KMZFile", type: "File" }, { width: "100%", fontFamily: "Microsoft Jhenghei", border: "#909090 1px solid" });
			//pIpt.addEventListener("change", AppendNextFile, false);
			
			var plabel = pForm.appendObject("label", { id: "plabel"}, {width: "173px", height:"25px", cursor:"pointer", display: "inline-block", margin: "12px 40px"});
			document.getElementById('plabel').style.background = 'url("images/Uploads/Upload_ChooseFile.svg")';
			var pIpt = plabel.appendObject("input", { name: "KMZFile", type: "File" }, { display: "none", position: "fixed", right:"100%", bottom:"100%" });
			pIpt.addEventListener("change", AppendNextFile, false);
			
			that.SetHeaderButtonEvent(plabel
				, function () {
					document.getElementById('plabel').style.background = 'url("images/Uploads/Upload_ChooseFile_Click.svg")';
				}
				, function () {
					document.getElementById('plabel').style.background = 'url("images/Uploads/Upload_ChooseFile.svg")';
				}
				, function () {
				}
			);
			
			var pXML = pIFrame.getNode().contentDocument;
			if (pXML == null)
				return;
			var pRoot = pXML.documentElement;
			if (pRoot == null)
				return;
			var pFNodes = FindXMLNodes(pRoot, "File");
			var fcnt = GetNodeCount(pFNodes);
			for (var j = 0; j < fcnt; j++)
			{
				var sRPath = strAppRoot + "KMZProxy.ashx/" + GetXMLNodeAttribute(GetNode(pFNodes, j), "Path");
				var pNodes = FindXMLNodes(GetNode(pFNodes, j), "Entry");
				var cnt = GetNodeCount(pNodes);
				for (var i = 0; i < cnt; i++)
				{
					var sPath = GetXMLNodeText(GetNode(pNodes, i));
					if (sPath.substr(sPath.length - 4).toLowerCase() == ".kml")
					{
						if (sRPath == null || sRPath.length == 0)
							LoadKMZs(sPath);
						else if (sPath.indexOf("/") < 0)
							LoadKMZs(sRPath + "/" + sPath);
					}
				}
			}
		});
		var pForm = divUploadByFile.appendObject("form", {action:strAppRoot + "KMZProxy.ashx/Upload",method:"post",enctype:"multipart/form-data",target:pIFrame.getNode().name,acceptcharset:"utf-8"});
        //var pIpt = pForm.appendObject("input", { name: "KMZFile", type: "File" }, { width: "100%", fontFamily: "Microsoft Jhenghei", border: "#909090 1px solid" });
  		//pIpt.addEventListener("change", AppendNextFile, false);
		
		var plabel = pForm.appendObject("label", { id: "plabel"}, {width: "173px", height:"25px", cursor:"pointer", display: "inline-block", margin: "12px 40px"});
		document.getElementById('plabel').style.background = 'url("images/Uploads/Upload_ChooseFile.svg")';
		var pIpt = plabel.appendObject("input", { name: "KMZFile", type: "File" }, { display: "none", position: "fixed", right:"100%", bottom:"100%" });
		pIpt.addEventListener("change", AppendNextFile, false);
		
		this.SetHeaderButtonEvent(plabel
            , function () {
				document.getElementById('plabel').style.background = 'url("images/Uploads/Upload_ChooseFile_Click.svg")';
            }
            , function () {
				document.getElementById('plabel').style.background = 'url("images/Uploads/Upload_ChooseFile.svg")';
            }
            , function () {
            }
        );
    };
    this.Close = function () {
        this.Destroy();
		this.raiseEvent("Closed");
    };
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是必要的私有Functions  /////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //  上面是必要的私有Functions,下面是建立本物件時怎樣都要跑的程序  //////////////
    ////////////////////////////////////////////////////////////////////////////
    this.Initialize();
	
	// 移植功能
	
	function LoadKMZs(sKML)
	{
		if (sKML == null || sKML.length <= 0)
			return false;
		var k = new OGC.KMLDocument(pEarth, "");
		k.Load(sKML, function(pData){
			var x = (pData.region[0] + pData.region[2]) / 2;
			var y = (pData.region[1] + pData.region[3]) / 2;
			pEarth.SetViewpoint(x, y, 500, 0, 0, false);
			alert("上傳成功");
		});
		pEarth.PlacemarkObjects.Add(k);
		pEarth.Invalidate();
		return true;
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  這裡是 Gary 以上面的新造樣板重新刻出來的各種功能視窗區
//  上面:Part 3:上傳KML或KMZ  下面:Part 4:視域分析
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {*} pParent 
 * @param {*} pEarth 
 * @param {*} callback 
 */
function ViewShedDialog(pParent, pEarth, callback) {
    TemplateWindow.call(this, pParent, {
        WidthSet: [7, 253, 7]
        , HeightSet: [38, 132, 10]
    });
    //基於繼承,這個是一定要先call的
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.Initialize = function () {
		document.body.style.cursor = "crosshair";
		
        this.Content.applyStyles({ vAlign: "top" });
        //標頭圖示
        this.Header.appendElement("img", { src: "images/ViewShed/ViewShed_Title.svg" }, { position: "absolute", left: "10px", top: "10px", width: "81px", height: "17px" });
        //文字說明
        var lblGuide = this.Content.appendElement("label", null, { fontFamily: "Microsoft Jhenghei", fontSize: "12px", marginLeft: "0", marginTop: "0" });
        lblGuide.innerHTML = [
            "1.左鍵點選地面，決定地面基準點"
            , "2.上下移動滑鼠決定視點高度，點擊左鍵確定"
            , "3.移動滑鼠決定視角與觀察點，點擊左鍵確定"
        ].join("<br />");
        //下方功能按鈕
        var divFuncs = this.Content.appendObject("div", null, { width: "100%", height: "65px" });
        var divFuncL = divFuncs.appendObject("div", null, { width: "33.33%", height: "100%", align: "center", display: "inline-block", position: "relative" });
        var imgTurnL = divFuncL.appendElement("img", { src: "images/ViewShed/ViewShed_TurnLeft.svg" }, { position: "absolute", width: "81px", height: "58px", marginTop: "2px", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgTurnL
            , function () {
                imgTurnL.src = "images/ViewShed/ViewShed_TurnLeft_Click.svg";
            }
            , function () {
                imgTurnL.src = "images/ViewShed/ViewShed_TurnLeft.svg";
            }
            , function () {
                imgTurnL.src = "images/ViewShed/ViewShed_TurnLeft_Click.svg";
            }
        );
        var divFuncC = divFuncs.appendObject("div", null, { width: "33.33%", height: "100%", align: "center", display: "inline-block" });
        var imgTurnR = divFuncC.appendElement("img", { src: "images/ViewShed/ViewShed_TurnRight.svg" }, { position: "absolute", width: "81px", height: "58px", marginTop: "2px", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgTurnR
            , function () {
                imgTurnR.src = "images/ViewShed/ViewShed_TurnRight_Click.svg";
            }
            , function () {
                imgTurnR.src = "images/ViewShed/ViewShed_TurnRight.svg";
            }
            , function () {
                imgTurnR.src = "images/ViewShed/ViewShed_TurnRight_Click.svg";
            }
        );
        var divFuncR = divFuncs.appendObject("div", null, { width: "33.34%", height: "100%", align: "center", display: "inline-block", position: "relative" });
        var imgShowShadow = divFuncR.appendElement("img", { src: "images/ViewShed/ViewShed_Checked.svg" }, { position: "absolute", top: "4px", cursor: "pointer" });
        AttachEvent(imgShowShadow, "click", function () {
            if (!bShadow)
			{
                imgShowShadow.src = "images/ViewShed/ViewShed_Checked.svg";
				bShadow = true;
			}
            else
			{
                imgShowShadow.src = "images/ViewShed/ViewShed_UnChecked.svg";
				bShadow = false;
			}
			UpdateViewshed(0);
        });
        var imgClearVS = divFuncR.appendElement("img", { src: "images/ViewShed/ViewShed_Clear.svg" }, { position: "absolute", bottom: "0", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgClearVS
            , function () { imgClearVS.src = "images/ViewShed/Viewshed_Clear_Click.svg"; }
            , function () { imgClearVS.src = "images/ViewShed/Viewshed_Clear.svg"; }
            , function () {
				imgClearVS.src = "images/ViewShed/Viewshed_Clear_Click.svg";
				ClearViewshed();
			}
        );
		
		AttachEvent(imgTurnL, "mousedown", function(){RotateDown(-1);}, false);
		AttachEvent(imgTurnL, "mouseup", function(){RotateUp();}, false);
		AttachEvent(imgTurnL, "mouseout", function(){RotateUp();}, false);
		AttachEvent(imgTurnR, "mousedown", function(){RotateDown(1);}, false);
		AttachEvent(imgTurnR, "mouseup", function(){RotateUp();}, false);
		AttachEvent(imgTurnR, "mouseout", function(){RotateUp();}, false);
    };
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是必要的私有Functions  /////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //  上面是必要的私有Functions,下面是建立本物件時怎樣都要跑的程序  //////////////
    ////////////////////////////////////////////////////////////////////////////
    this.Initialize();
	
	// 功能移植

	var bDone = false;
	var bShadow = true;
	var timer = null;
	var bFootAdded = false;
	var bEyeAdded = false;
	var pVerticalGroundMarker = null;
	var pVerticalMarker = null;
	var pVerticalExtrude = null;
	var pEyeLine = null;
	var viewshed_Marks = [];

	pEarth.addEventListener("MouseDown", funcMouseDown, false, true);
	pEarth.addEventListener("MouseMove", funcMouseMove, false, true);

	function UpdateViewshed(dir)
	{
		var TWOPI = 6.2831853071795865;
		var RAD2DEG = 57.2957795130823209;
		var theta = Math.atan2(loc2.X - loc1.X, loc2.Y - loc1.Y);
		if (theta < 0.0)
			theta += TWOPI;
		var deg = theta * RAD2DEG;
		deg += dir;
		theta = deg / RAD2DEG;
		var dist = Math.sqrt((loc2.X - loc1.X) * (loc2.X - loc1.X) + (loc2.Y - loc1.Y) * (loc2.Y - loc1.Y));
		loc2.X = loc1.X + dist * Math.sin(theta);
		loc2.Y = loc1.Y + dist * Math.cos(theta);
		pVerticalMarker.Visible = false;
		pVerticalExtrude.Visible = false;
		pEarth.ViewshedAnalysis(loc1, loc2, pEarth.CreateColor(0, 1, 0, 0.3), bShadow, true);
		pVerticalMarker.Visible = true;
		pVerticalExtrude.Visible = true;
	}
	
	function RotateDown(dir)
	{
		if (!bDone)
			return;
		
		timer = setInterval(function()
		{
			UpdateViewshed(dir);
		}, 100);
	}
	function RotateUp()
	{
		clearInterval(timer);
	}
	
	var tmp_Position = null;
	function GeodeticFromDevice(x, y)
	{
		var pScene = pEarth.GetScene();
		var pCam = pEarth.GetCamera();
		var pGlobe = pEarth.GetGlobe();
		
		if (tmp_Position == null)
			tmp_Position = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
		else
		{
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
	function AddVertex(loc, radius, ZOffset)
	{
		var xy = CircleToPolygon(loc[0], loc[1], radius);
		var wkt = "POLYGON((";
		for (var i in xy)
		{
			wkt += xy[i][0].toString() + ' ';
			wkt += xy[i][1].toString();
			if (i != xy.length - 1)
				wkt += ','
		}
		wkt += "))";
		var marker = pEarth.CreatePlacemark("", wkt);
		marker.PreserveGeometry = true;
		marker.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 0.45, 0.08, 0.6)), null);
		marker.ReplaceZ = loc[2] + ZOffset;
		pEarth.PlacemarkObjects.Add(marker);
		viewshed_Marks.push(marker);
		return marker;
	}
	function CircleToPolygon(cx, cy, radius)
	{
		var length = radius;
		var N = 30;
		var xy = [];
		var CV_PI = 3.1416;
		for (var i = 0; i < N; i++)
		{
			var x = cx + length * Math.cos(i * 2 * CV_PI / N);
			var y = cy + length * Math.sin(i * 2 * CV_PI / N);
			xy.push([x, y]);
		}
		xy.push([cx + length, cy]);
		return xy;
	}
	function ClearViewshed()
	{
		for (var i in viewshed_Marks)
		{
			pEarth.PlacemarkObjects.Remove(viewshed_Marks[i]);
			delete viewshed_Marks[i];
		}
		bEyeAdded = false;
		bFootAdded = false;
		bDone = false;
		loc1 = loc2 = null;
		pEyeLine = null;
		viewshed_Marks = [];
		pVerticalExtrude = null;
		pEarth.ClearViewshed();
		pEarth.Invalidate();
	}
	function funcMouseDown(x, y, b, k)
	{
		bDown = true;
		down_x = x;
		down_y = y;
		pEarth.addEventListener("MouseUp", funcMouseUp, false, true);
	}
	function RayTest(pori1, pdir1, pori2, pdir2)
	{
		var ori1 = SuperGIS.DDDCore.Vector3.ToVec3(pori1);
		var dir1 = SuperGIS.DDDCore.Vector3.ToVec3(pdir1);
		var ori2 = SuperGIS.DDDCore.Vector3.ToVec3(pori2);
		var dir2 = SuperGIS.DDDCore.Vector3.ToVec3(pdir2);
		var cdir = vec3.cross(dir1, dir2, [0, 0, 0]);
		var clen = vec3.dot(cdir, cdir);
		var len = 0;
		if (clen != 0)
		{
			var tvtr = vec3.subtract(ori2, ori1, [0, 0, 0]);
			var cvtr = vec3.scale(cdir, vec3.dot(tvtr, cdir) / clen, [0, 0, 0]); 
			var adir = vec3.cross(vec3.subtract(tvtr, cvtr, [0, 0, 0]), dir1);
			len = vec3.dot(adir, cdir) / clen;
		}
		return SuperGIS.DDDCore.Vector3.NewVector3(vec3.add(vec3.scale(dir2, len, [0, 0, 0]), ori2));
	}
	this.Close = function()
	{
		document.body.style.cursor = "default";
		ClearViewshed();
		//clearInterval(timer);
		
		pEarth.removeEventListener("MouseDown", funcMouseDown, false, true);
		pEarth.removeEventListener("MouseMove", funcMouseMove, false, true);
		this.Destroy();
		this.raiseEvent("Closed");
	}
	function funcMouseMove(x, y, b, k)
	{
		if (bDone)
			return;
		
		var pScene = pEarth.GetScene();
		if (bEyeAdded)
		{
			var pLoc = GeodeticFromDevice(x, y);
			var wkt = "LINESTRING(" + down_Loc[0].toString() + " " + down_Loc[1].toString() + " " + pVerticalMarker.ReplaceZ.toString() + "," +
										pLoc[0].toString() + " " + pLoc[1].toString() + " " + pLoc[2].toString() + ")";
			if (!pEyeLine)
			{
				pEyeLine = pEarth.CreatePlacemark("", wkt);
				pEyeLine.DDDSymbol = pEarth.CreateSimpleDDDLineSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 0.45, 0.08, 0.6)));
				pEarth.PlacemarkObjects.Add(pEyeLine);
				viewshed_Marks.push(pEyeLine);
			}
			else
			{
				pEyeLine.Geometry = wkt;
				pEyeLine.SetDirty();
			}

			loc2 = new SuperGIS.DDDCore.Vector3(pLoc[0], pLoc[1], pLoc[2]);
		}
		else if (bFootAdded)
		{
			var pCam = pEarth.GetCamera();
			var pGlobe = pEarth.GetGlobe();
			var CurPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
			if (CurPosition == null)
				return;
			
			var CurLocation = RayTest(pCam.EyeAt, pCam.Ray(CurPosition), pRefLocation, pGlobe.UpDirection(pRefLocation));
			var pt = pGlobe.GeodeticFromCartesian(CurLocation);
			if (pt.Z < pVerticalGroundMarker.ReplaceZ)
			{
				pVerticalExtrude.DefaultElevation = pt.Z;
				pVerticalExtrude.ReplaceZ = pVerticalGroundMarker.ReplaceZ - pt.Z;
			}
			else
			{
				pVerticalExtrude.DefaultElevation = pVerticalGroundMarker.ReplaceZ;
				pVerticalExtrude.ReplaceZ = pt.Z - pVerticalGroundMarker.ReplaceZ;
			}
			pVerticalExtrude.SetDirty();
			pVerticalMarker.ReplaceZ = pt.Z;
			pVerticalMarker.SetDirty();
		}
		pEarth.Invalidate();
	}
	function funcMouseUp(x, y, b, k)
	{
		if (bDone)
			return;
		
		pEarth.removeEventListener("MouseUp", funcMouseUp, false, true);
		bDown = false;
		var bMoved = (x != down_x || y != down_y);
		down_x = down_y = null;
		if (bMoved)
			return false;
			
		var pScene = pEarth.GetScene();
		var pCam = pEarth.GetCamera();
		var pGlobe = pEarth.GetGlobe();
		var CurPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
		if (CurPosition == null)
			return;
		
		var CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(CurPosition), 1, false);
		var pPick = pEarth.Objects.Picking(SuperGIS.DDDCore.RenderPriority.Ground, pCam.EyeAt, pCam.Ray(CurPosition), 0);
		if (pPick != null)
			CurLocation = pPick.GetLocate();
			
		if (!bFootAdded)
		{
			bFootAdded = true;
			pRefLocation = CurLocation;
			
			down_Loc = GeodeticFromDevice(x, y);
			if (pPick)
			{
				var pGeo = pGlobe.GeodeticFromCartesian(CurLocation);
				down_Loc[0] = pGeo.X;
				down_Loc[1] = pGeo.Y;
				down_Loc[2] = pGeo.Z;
			}
			var radius = pEarth.GetCamera().Position.Z / 50000000;
			if (!pGlobe.IsGCS())
				radius *= 100000;
			
			pVerticalGroundMarker = AddVertex(down_Loc, radius * 5, 0);
			pVerticalExtrude = AddVertex(down_Loc, radius, 0);
			pVerticalExtrude.DefaultElevation = down_Loc[2];
			pVerticalExtrude.ReplaceZ = 0;
			pVerticalExtrude.ExtrudeSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 0, 0.6)), null);
			pVerticalMarker = AddVertex(down_Loc, radius, 0);
		}
		else if (!bEyeAdded)
		{
			bEyeAdded = true;
			loc1 = new SuperGIS.DDDCore.Vector3(down_Loc[0], down_Loc[1], pVerticalMarker.ReplaceZ);
		}
		else
		{
			pVerticalMarker.Visible = false;
			pVerticalExtrude.Visible = false;
			pEarth.ViewshedAnalysis(loc1, loc2, pEarth.CreateColor(0, 1, 0, 0.3), bShadow, true);
			pVerticalMarker.Visible = true;
			pVerticalExtrude.Visible = true;
			pEarth.PlacemarkObjects.Remove(pEyeLine);
			bDone = true;
		}
	}
}

function SceneDialog(pParent, pEarth, callback) {
    TemplateWindow.call(this, pParent, {
        WidthSet: [7, 253, 7]
        , HeightSet: [38, 456, 10]
    });
    //基於繼承,這個是一定要先call的
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
	var pCtx = null;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.Initialize = function () {
        this.Content.applyStyles({ vAlign: "top" });
        //標頭圖示
        this.Header.appendElement("img", { src: "images/Scene/SceneManage_Title.svg" }, { position: "absolute", left: "10px", top: "10px", width: "81px", height: "17px" });
        //下方功能按鈕
        var imgAdd = this.appendElement("img", { src: "images/Scene/SceneManage_Add.svg" }, { position: "absolute", top: "35", right: "20", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgAdd
            , function () { imgAdd.src = "images/Scene/SceneManage_Add_Click.svg"; }
            , function () { imgAdd.src = "images/Scene/SceneManage_Add.svg"; }
            , function () {
				imgAdd.src = "images/Scene/SceneManage_Add_Click.svg";
				AddScene(null);
			}
        );
        pCtx = this.Content.appendObject("div", null, { "margin-top": "30px", width: "100%", height: "425px", "overflow-y": "scroll", "overflow-x": "hidden" });
    };
    this.Close = function () {
        this.Destroy();
		this.raiseEvent("Closed");
    };
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是必要的私有Functions  /////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //  上面是必要的私有Functions,下面是建立本物件時怎樣都要跑的程序  //////////////
    ////////////////////////////////////////////////////////////////////////////
    this.Initialize();
	
	// 移植功能
	
	var pScene = pEarth.GetScene();
	var pCam = pEarth.GetCamera();
	var m_Names = [];
	var m_Scenes = [];

	function SortScene(n1, n2)
	{
		var nameA = n1.toUpperCase(); // ignore upper and lowercase
		var nameB = n2.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB)
			return -1;
		if (nameA > nameB)
			return 1;
		// names must be equal
		return 0;
	}

	var pAgt = new AjaxAgent(null, true, false);
	var url = strAppRoot + "Scene/";
	pAgt.Open("GET", url);
	pAgt.SendRequest("", function(pReq)
	{
		m_Names = JSON.parse(pReq.response);
		m_Names.sort(SortScene);
		for (var i in m_Names)
		{
			var pAgt2 = new AjaxAgent(null, true, false);
			var url2 = url + m_Names[i];
			pAgt2.Open("GET", url2);
			pAgt2.SendRequest(null, function(pReq)
			{
				var source = JSON.parse(pReq.response);
				m_Scenes.push(source);
				if (m_Scenes.length == m_Names.length) // 全下載完
				{
					for (var i in m_Names)
					{
						for (var j in m_Scenes)
						{
							if (m_Scenes[j].Name == m_Names[i]) // 使照名稱排序
							{
								AddScene(m_Scenes[j]);
								break;
							}
						}
					}
				}
			});
		}
	});
	
	function ImgFromCanvas()
	{
		var pCanvas = document.createElement("canvas");
		pCanvas.width = pScene.GetWidth();
		pCanvas.height = pScene.GetHeight();
		var ctx = pCanvas.getContext("2d");	
		ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);		
		ctx.drawImage(pScene.GetObject().getNode(), 0, 0);
		return pCanvas.toDataURL("image/jpeg", 0.1);
	}
	
	function CheckName(name)
	{
		for (var i in m_Names)
		{
			if (m_Names[i].toLowerCase() == name.toLowerCase())
				return true;
		}
		return false;
	}
	
	var rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
	var rg2 = /^\./; // cannot start with dot (.)
	var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
	function isValid(fname) {
		return rg1.test(fname)&&!rg2.test(fname)&&!rg3.test(fname);
	}
	
	function AddScene(source)
	{
        var pItem = pCtx.appendObject("div", null, { "margin-top": "5px", left: "15px", width: "227px", height: "135px", border: "0.5px solid #C1C1C1", "border-radius": "3px" });
		
		that.SetHeaderButtonEvent(pItem
            , function () {
				pItem.applyStyles({ border: "0.5px solid #1F85E3" });
			}
            , function () {
				pItem.applyStyles({ border: "0.5px solid #C1C1C1" });
			}
            , function () {}
        );
		
        var pTop = pItem.appendObject("div", null, { align: "center", width: "100%", height: "80%", display: "inline-block" });
        var pLeft = pTop.appendObject("div", null, { align: "center", width: "80%", height: "100px", display: "inline-block" });
        var pRight = pTop.appendObject("div", null, { align: "center", width: "20%", height: "100px", display: "inline-block" });
        var pBottom = pItem.appendObject("div", null, { align: "center", width: "100%", height: "20%", display: "inline-block" });
		var Scene = pLeft.appendElement("img", null, { margin: "5px", width: "180", height: "100%", cursor: "pointer" });
		
		var pt1 = { X: pCam.Position.X, Y: pCam.Position.Y, Z: 0 };
		pt1 = SpatialReference.CoordinateTransform(pEarth.GetGlobe().SpatialReference, EPSG.CreateSpatialReference(4326), null, pt1);
		
		if (source)
		{
			Scene.src = Base64Decode(source.Image);
			Scene.name = source.Name;
			Scene.px = source.X;
			Scene.py = source.Y;
			Scene.pz = source.Z;
			Scene.yaw = source.Yaw;
			Scene.pitch = source.Pitch;
		}
		else
		{
			Scene.src = ImgFromCanvas();
			var id = 1;
			Scene.name = "場景" + (id++).toString();
			while (CheckName(Scene.name))
				Scene.name = "場景" + (id++).toString();
			m_Names.push(Scene.name);
			Scene.px = pt1.X;
			Scene.py = pt1.Y;
			Scene.pz = pCam.Position.Z;
			Scene.yaw = pCam.Yaw;
			Scene.pitch = pCam.Pitch;
		}
		
		AttachEvent(Scene, "click", function () {
			pEarth.SetViewpoint(Scene.px, Scene.py, Scene.pz, Scene.yaw, Scene.pitch, true);
		}, false);
		/*AttachEvent(Scene, "click", function () {
			pt1 = { X: pCam.Position.X, Y: pCam.Position.Y, Z: 0 };
			pt1 = SpatialReference.CoordinateTransform(pEarth.GetGlobe().SpatialReference, EPSG.CreateSpatialReference(4326), null, pt1);
			var SceneP = { X: Scene.px, Y: Scene.py, Z: Scene.pz};
			SceneP = SpatialReference.CoordinateTransform(EPSG.CreateSpatialReference(4326), 	pEarth.GetGlobe().SpatialReference, null, SceneP);
			var dis = Math.sqrt(Math.pow(SceneP.X - pCam.Position.X,2) + Math.pow(SceneP.Y - pCam.Position.Y,2));
			var tempx = (Scene.px + pt1.X) / 2;
			var tempy = (Scene.py + pt1.Y) / 2;
			var tempz = (SceneP.Z > pCam.Position.Z) ? SceneP.Z + dis : pCam.Position.Z + dis;
			var tempyaw = (Scene.yaw + pCam.Yaw) / 2;
			var tempp = (Scene.pitch + pCam.Pitch) / 2;
			pEarth.SetViewpoint(tempx, tempy, tempz, tempyaw, tempp, true);
			setTimeout(function() {pEarth.SetViewpoint(Scene.px, Scene.py, Scene.pz, Scene.yaw, Scene.pitch, true);}, 3000);}, 
		false);*/

		var pEdit = pBottom.appendInputText(Scene.name, { "margin-left": "5px", height: "20px", width: "215px", fontFamily: "Microsoft Jhenghei", fontSize: "10px", border: "0.5px solid #9C9C9C", "border-radius": "3px" }, function(){
			if (!isValid(pEdit.value) || CheckName(pEdit.value))
			{
				pEdit.value = Scene.name;
				return;
			}
			DeleteFile(Scene.name);
			Scene.name = pEdit.value;
			UpdateFile(Scene);
			m_Names.push(Scene.name);
		});
        var imgRemove = pRight.appendElement("img", { src: "images/Scene/SceneManage_Remove.svg" }, { "margin-left": "10px", display: "block", cursor: "pointer" });
		that.SetHeaderButtonEvent(imgRemove
            , function () { imgRemove.src = "images/Scene/SceneManage_Remove_Click.svg"; }
            , function () { imgRemove.src = "images/Scene/SceneManage_Remove.svg"; }
            , function () {
				imgRemove.src = "images/Scene/SceneManage_Remove_Click.svg";
				pCtx.removeChildren(pItem);
				DeleteFile(Scene.name);
			}
        );
        var imgRefresh = pRight.appendElement("img", { src: "images/Scene/SceneManage_Refresh.svg" }, { "margin-left": "10px", "margin-top": "5px", display: "block", cursor: "pointer" });
		that.SetHeaderButtonEvent(imgRefresh
            , function () { imgRefresh.src = "images/Scene/SceneManage_Refresh_Click.svg"; }
            , function () { imgRefresh.src = "images/Scene/SceneManage_Refresh.svg"; }
            , function () {
				imgRefresh.src = "images/Scene/SceneManage_Refresh_Click.svg";
				Scene.src = ImgFromCanvas();
				var pt1 = { X: pCam.Position.X, Y: pCam.Position.Y, Z: 0 };
				pt1 = SpatialReference.CoordinateTransform(pEarth.GetGlobe().SpatialReference, EPSG.CreateSpatialReference(4326), null, pt1);
				Scene.px = pt1.X;
				Scene.py = pt1.Y;
				Scene.pz = pCam.Position.Z;
				Scene.yaw = pCam.Yaw;
				Scene.pitch = pCam.Pitch;
				UpdateFile(Scene);
			}
        );

		if (source)
			return;

		UpdateFile(Scene);
	}
	
	function UpdateFile(Scene)
	{
		var pAgt = new AjaxAgent(null, true, false);
		var url = strAppRoot + "Scene/" + Scene.name;
		pAgt.Open("POST", url);
		var content = "{ \"Name\": \"" + Scene.name + "\", ";
		content += "\"X\": " + Scene.px.toString() + ", ";
		content += "\"Y\": " + Scene.py.toString() + ", ";
		content += "\"Z\": " + Scene.pz.toString() + ", ";
		content += "\"Yaw\": " + Scene.yaw.toString() + ", ";
		content += "\"Pitch\": " + Scene.pitch.toString() + ", ";
		content += "\"Image\": \"" + Base64Encode(Scene.src) + "\" }";
		pAgt.SendRequest(content);
	}
	
	function DeleteFile(name)
	{
		var pAgt = new AjaxAgent(null, true, false);
		pAgt.Open("DELETE", strAppRoot + "Scene/" + name);
		pAgt.SendRequest(null);
		
		for (var i in m_Names)
		{
			if (m_Names[i] == name)
			{
				m_Names.splice(i, 1);
				return;
			}
		}
	}
}

function SceneList(pParent, pEarth, callback) {
    TemplateWindow.call(this, pParent, {
        WidthSet: [7, 253, 7]
        , HeightSet: [38, 456, 10]
    });
    //基於繼承,這個是一定要先call的
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
	var pCtx = null;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.Initialize = function () {
        this.Content.applyStyles({ vAlign: "top" });
        //標頭圖示
        this.Header.appendElement("img", { src: "images/Scene/SceneList_Title.svg" }, { position: "absolute", left: "10px", top: "10px", width: "81px", height: "17px" });
        pCtx = this.Content.appendObject("div", null, { width: "100%", height: "450px", "overflow-y": "scroll", "overflow-x": "hidden" });
    };
    this.Close = function () {
        this.Destroy();
		this.raiseEvent("Closed");
    };
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是必要的私有Functions  /////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //  上面是必要的私有Functions,下面是建立本物件時怎樣都要跑的程序  //////////////
    ////////////////////////////////////////////////////////////////////////////
    this.Initialize();
	
	// 移植功能
	
	var pScene = pEarth.GetScene();
	var pCam = pEarth.GetCamera();
	var m_Names = [];
	var m_Scenes = [];
	
	function SortScene(n1, n2)
	{
		var nameA = n1.toUpperCase(); // ignore upper and lowercase
		var nameB = n2.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB)
			return -1;
		if (nameA > nameB)
			return 1;
		// names must be equal
		return 0;
	}

	var pAgt = new AjaxAgent(null, true, false);
	var url = strAppRoot + "Scene/";
	pAgt.Open("GET", url);
	pAgt.SendRequest("", function(pReq)
	{
		m_Names = JSON.parse(pReq.response);
		for (var i in m_Names)
		{
			var pAgt2 = new AjaxAgent(null, true, false);
			var url2 = url + m_Names[i];
			pAgt2.Open("GET", url2);
			pAgt2.SendRequest(null, function(pReq)
			{
				var source = JSON.parse(pReq.response);
				m_Scenes.push(source);
				if (m_Scenes.length == m_Names.length) // 全下載完
				{
					for (var i in m_Names)
					{
						for (var j in m_Scenes)
						{
							if (m_Scenes[j].Name == m_Names[i]) // 使照名稱排序
							{
								AddScene(m_Scenes[j]);
								break;
							}
						}
					}
				}
			});
		}
	});
	
	function AddScene(source)
	{
        var pItem = pCtx.appendObject("div", null, { "margin-top": "5px", left: "15px", width: "227px", height: "140px", border: "0.5px solid #C1C1C1", "border-radius": "3px" });
		
		that.SetHeaderButtonEvent(pItem
            , function () {
				pItem.applyStyles({ border: "0.5px solid #1F85E3" });
			}
            , function () {
				pItem.applyStyles({ border: "0.5px solid #C1C1C1" });
			}
            , function () {}
        );
		
        var pTop = pItem.appendObject("div", null, { align: "center", width: "100%", height: "80%", display: "inline-block" });
        var pBottom = pItem.appendObject("div", { class: "center" }, { "margin-top": "8px", width: "100%", height: "20%", display: "inline-block" });
		var Scene = pTop.appendElement("img", null, { margin: "5px", width: "217", height: "100%", cursor: "pointer" });
		
		var pt1 = { X: pCam.Position.X, Y: pCam.Position.Y, Z: 0 };
		pt1 = SpatialReference.CoordinateTransform(pEarth.GetGlobe().SpatialReference, EPSG.CreateSpatialReference(4326), null, pt1);
		
		Scene.src = Base64Decode(source.Image);
		Scene.name = source.Name;
		Scene.px = source.X;
		Scene.py = source.Y;
		Scene.pz = source.Z;
		Scene.yaw = source.Yaw;
		Scene.pitch = source.Pitch;
		
		AttachEvent(Scene, "click", function () {
			pEarth.SetViewpoint(Scene.px, Scene.py, Scene.pz, Scene.yaw, Scene.pitch, true);
		}, false);
		var pLabel = pBottom.appendElement("label", null, { fontFamily: "Microsoft Jhenghei", fontWeight: "700", fontSize: "10px", color: "#595959" });
		pLabel.innerHTML = Scene.name;

	}
}

function SunDialog(pParent, pEarth, callback) {
    TemplateWindow.call(this, pParent, {
        WidthSet: [7, 253, 7]
        , HeightSet: [38, 132, 10]
    });
    //基於繼承,這個是一定要先call的
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
	var pRange = null;
	var pDate = null;
	var pTime = null;
	var bShowShadow = true;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.Initialize = function () {
        this.Content.applyStyles({ vAlign: "top" });
        //標頭圖示
        this.Header.appendElement("img", { src: "images/Sun/Sun_Title.svg" }, { position: "absolute", left: "10px", top: "10px", width: "81px", height: "17px" });
        var pCtx = this.Content.appendObject("div", null, { width: "100%", height: "100%" });
        pTime = pCtx.appendElement("label", null, { "margin-left": "5px", fontFamily: "Microsoft Jhenghei", fontSize: "8px", lineHeight: "10px" });
		pRange = pCtx.appendElement("input", { type: "range", min: 0, max: 1000 });
		AttachEvent(pRange, "input", function(e){
			var pos = parseInt(e.target.value);
			var mins = pos * 1.44;
			var h = Math.floor(mins / 60);
			var m = Math.round(mins - h * 60);
			if (m == 60)
			{
				m = 0;
				h++;
			}

			var now = new Date();
			var year = parseInt(pDate.value.slice(0, 4))
			var month = parseInt(pDate.value.slice(5, 7));
			var date = parseInt(pDate.value.slice(8, 10));
			pDate.setAttribute("data-date", FormatDate(year, month, date));
			now.setYear(year);
			now.setMonth(month - 1);
			now.setDate(date);
			now.setHours(h);
			now.setMinutes(m);
			
			h = h.toString();
			if (h.length == 1)
				h = '0' + h;
			m = m.toString();
			if (m.length == 1)
				m = '0' + m;
			pTime.innerHTML = ((h > 11) ? "PM " : "AM ") + h + ":" + m;
			var scale = 1000 / 200;
			pos = Math.round(10 + pos / scale);
			pTime.style["margin-left"] = pos.toString() + "px"; // 換位置
			
			var pCam = pEarth.GetCamera();
			var pGlobe = pEarth.GetGlobe();

			var pt84 = pCam.Position;
			if (!pGlobe.IsGCS())
				pt84 = SpatialReference.CoordinateTransform(pGlobe.SpatialReference, SR_84, null, pt84);
			
			var times = SunCalc.getTimes(now, pt84.Y, pt84.X);

			pos = SunCalc.getPosition(now, pt84.Y, pt84.X);
			var azi = pos.azimuth * 180 / Math.PI;
			
			var loc = pEarth.Light.Location;
			if (azi >= 0 && azi <= 180)
				loc[1] = -1;
			else
				loc[1] = 1;
			loc[0] = loc[1] / Math.tan(pos.azimuth);
			
			var hy = Math.sqrt(1 + loc[0] * loc[0]);
			loc[2] = hy * Math.tan(pos.altitude);
			
			var solarNoonStart_sec = (3 * times.sunrise.getTime() + times.sunset.getTime()) / 4000;
			var solarNoonStart = toDateTime(solarNoonStart_sec);
			var solarNoonEnd_sec = (times.sunrise.getTime() + 3 * times.sunset.getTime()) / 4000;
			var solarNoonEnd = toDateTime(solarNoonEnd_sec);
			function toDateTime(sec){
				var t = new Date(1970, 0, 1);
				t.setHours(8);
				t.setSeconds(sec);
				return t;
			}

			var bShadow = true;
			//pEarth.Light.Color = [1, 1, 1];
			pEarth.Light.Color = [0.33, 0.33, 0.33];
			if (now > times.dusk || now < times.dawn)
			{
				//pEarth.Light.Ambient = -0.45;
				pEarth.Light.Ambient = 0.4;
				bShadow = false;
			}
			else
			{
				if (now >= times.dawn && now < times.sunrise) // 06:17 – 06:41
				{
					//pEarth.Light.Color = [1, 0.66, 0.66];
					//pEarth.Light.Ambient = 0.425;
					var parameter = solarParameter(now, times.dawn, times.sunrise, [0.33, 0.33, 0.33], [0.66, 0.33, 0.33], 0.55, 0.725);
					pEarth.Light.Color = [parameter[0], parameter[1], parameter[2]];
					pEarth.Light.Ambient = parameter[3]
				}
				else if (now >= times.sunrise && now < solarNoonStart) // 06:41 – 09:23
				{
					//pEarth.Light.Ambient = 0.725;
					var parameter = solarParameter(now, times.sunrise, solarNoonStart, [0.66, 0.33, 0.33], [0.33, 0.33, 0.33], 0.725, 0.9);
					pEarth.Light.Color = [parameter[0], parameter[1], parameter[2]];
					pEarth.Light.Ambient = parameter[3];
				}
				else if (now >= solarNoonStart && now < solarNoonEnd) // 09:23 – 14:50
				{
					//pEarth.Light.Ambient = 0.9;
					pEarth.Light.Color = [0.33, 0.33, 0.33];
					pEarth.Light.Ambient = 0.9;
				}
				else if (now >= solarNoonEnd && now < times.sunsetStart) // 14:50 – 17:26
				{
					//pEarth.Light.Ambient = 0.725;
					var parameter = solarParameter(now, solarNoonEnd, times.sunsetStart, [0.33, 0.33, 0.33], [0.66, 0.33, 0.33], 0.9, 0.725);
					pEarth.Light.Color = [parameter[0], parameter[1], parameter[2]];
					pEarth.Light.Ambient = parameter[3];
				}
				else if (now >= times.sunsetStart && now < times.dusk) // 17:26 – 17:51
				{
					//pEarth.Light.Color = [1, 0.66, 0.66];
					//pEarth.Light.Ambient = 0.425;
					var parameter = solarParameter(now, times.sunsetStart, times.dusk, [0.66, 0.33, 0.33], [0.33, 0.33, 0.33], 0.725, 0.55);
					pEarth.Light.Color = [parameter[0], parameter[1], parameter[2]];
					pEarth.Light.Ambient = parameter[3];
				}
				else
					pEarth.Light.Ambient = 0.4;
			}
			pEarth.Invalidate();
			function solarParameter(now, tFrom, tTo, cFrom, cTo, aFrom, aTo)
			{
				var result = [];
				var ratio = (now.getTime() - tFrom.getTime()) / (tTo.getTime() - tFrom.getTime());
				result[0] = (cFrom[0] + (cTo[0] - cFrom[0]) * ratio);
				result[1] = (cFrom[1] + (cTo[1] - cFrom[1]) * ratio);
				result[2] = (cFrom[2] + (cTo[2] - cFrom[2]) * ratio);
				result[3] = (aFrom + (aTo - aFrom) * ratio);
				return result;
			}

			if (bShowShadow && bShadow)
			{
				var max_h = 500;
				var dist = max_h / Math.tan(pos.altitude);
				var dx = dist * Math.sin(pos.azimuth);
				var dy = dist * Math.cos(pos.azimuth);
				
				var pTest = pGlobe.RayTest(pCam.EyeAt, pCam.LookDir, 1, false);
				var pLookAt = pGlobe.GeodeticFromCartesian2(pTest);
				if (pGlobe.IsGCS())
				{
					dx /= (111320 * Math.cos(pLookAt[1] * Math.PI / 180));
					dy /= 110574;
				}

				var lookat = { X: pLookAt[0], Y: pLookAt[1], Z: 0};
				var eye = {};
				eye.X = lookat.X - dx;
				eye.Y = lookat.Y + dy;
				eye.Z = max_h;
				
				pEarth.ViewshedAnalysis(eye, lookat, pEarth.CreateColor(1, 1, 1, 0), true, false);
			}
			else
				pEarth.ClearViewshed();
		}, false);

        pCtx.appendElement("img", { src: "images/Sun/Sun_TimeInterval.svg" }, { position: "absolute", left: "12px", top: "75px" });
        pCtx.appendElement("img", { src: "images/Sun/back.png" }, { position: "absolute", left: "27px", top: "110px", width: "210px" });
		pDate = pCtx.appendElement("input", { type: "date" }, { position: "absolute", left: "32px", top: "110px", width: "200px", fontSize: "12px" });
		AttachEvent(pDate, "change", function(e)
		{
			var event = new Event('input');
			pRange.dispatchEvent(event);
		}, false);
        var imgShowShadow = pCtx.appendElement("img", { src: "images/ViewShed/ViewShed_Checked.svg" }, { position: "absolute", left: "180px", top: "135px", cursor: "pointer" });
		AttachEvent(imgShowShadow, "click", function () {
            if (!bShowShadow)
			{
                imgShowShadow.src = "images/ViewShed/ViewShed_Checked.svg";
				bShowShadow = true;
			}
            else
			{
                imgShowShadow.src = "images/ViewShed/ViewShed_UnChecked.svg";
				bShowShadow = false;
			}
			var event = new Event('input');
			pRange.dispatchEvent(event);
        });
    };
    this.Close = function () {
		pEarth.Light.Ambient = oldAmbient;
		pEarth.Light.Location = oldLocation.slice(0);
		pEarth.Light.Color = oldColor.slice(0);
		pEarth.ClearViewshed();
		pEarth.Invalidate();
		
        this.Destroy();
		this.raiseEvent("Closed");
    };
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是必要的私有Functions  /////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //  上面是必要的私有Functions,下面是建立本物件時怎樣都要跑的程序  //////////////
    ////////////////////////////////////////////////////////////////////////////
    this.Initialize();
	
	// 移植功能
	
	var SR_84 = EPSG.CreateSpatialReference(4326);
	var oldAmbient = pEarth.Light.Ambient;
	var oldLocation = pEarth.Light.Location.slice(0);
	var oldColor = pEarth.Light.Color.slice(0);
	
	var now = new Date();
	var mins = now.getHours() * 60 + now.getMinutes();
	pRange.value = mins / 1.44;
	var sTime;
	pTime.innerHTML = ((now.getHours() > 11) ? "PM " : "AM ") + now.getHours() + ":" + now.getMinutes();

	var mm = now.getMonth() + 1;
	mm = mm.toString();
	if (mm.length == 1)
		mm = '0' + mm;
	var dd = now.getDate();
	dd = dd.toString();
	if (dd.length == 1)
		dd = '0' + dd;
	pDate.value = now.getFullYear().toString() + '-' + mm + '-' + dd;
	pDate.setAttribute("data-date", FormatDate(now.getFullYear(), now.getMonth() + 1, now.getDate()));
	
	var event = new Event('input');
	pRange.dispatchEvent(event);
	
	function FormatDate(y, m, d)
	{
		if (m == 1)
			m = "January"
		else if (m == 2)
			m = "February"
		else if (m == 3)
			m = "March"
		else if (m == 4)
			m = "April"
		else if (m == 5)
			m = "May"
		else if (m == 6)
			m = "June"
		else if (m == 7)
			m = "July"
		else if (m == 8)
			m = "August"
		else if (m == 9)
			m = "September"
		else if (m == 10)
			m = "October"
		else if (m == 11)
			m = "November"
		else
			m = "December"
		return m + " " + d.toString() + ", " + y.toString();
	}
}

function SliceDialog(pParent, pEarth, callback) {
    TemplateWindow.call(this, pParent, {
        WidthSet: [7, 253, 7]
        , HeightSet: [38, 132, 10]
    });
    //基於繼承,這個是一定要先call的
    /////////////////////////////////////////////////////////////////////
    //  下面是Data Members  /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    var that = this;
    /////////////////////////////////////////////////////////////////////
    //  上面是Data Members，下面是Member Functions  //////////////////////
    /////////////////////////////////////////////////////////////////////
    this.Initialize = function () {
		document.body.style.cursor = "crosshair";
		
        this.Content.applyStyles({ vAlign: "top" });
        //標頭圖示
        this.Header.appendElement("img", { src: "images/Slice/Slice_Title.svg" }, { position: "absolute", left: "10px", top: "10px", width: "79px", height: "18px" });
        //文字說明
        var lblGuide = this.Content.appendElement("label", null, { fontFamily: "Microsoft Jhenghei", fontSize: "12px", marginLeft: "0", marginTop: "0" });
        lblGuide.innerHTML = [
            "1.左鍵點擊地面，決定切面工具中心點。"
            , "2.上下移動滑鼠，觀察不同高程下的建物切面"
            , "3.工具視窗按鈕可進行切面範圍與高度的調整"
        ].join("<br />");
        //下方功能按鈕
        var divFuncs = this.Content.appendObject("div", null, { width: "100%", height: "65px" });
        var divFuncL = divFuncs.appendObject("div", null, { width: "33.33%", height: "100%", align: "center", display: "inline-block", position: "relative" });
        divFuncL.appendElement("img", { src: "images/Slice/Slice_Area.svg" }, { position: "absolute", top: "13px", left: "0", width: "70px", height: "17px" });
        var imgPlusArea = divFuncL.appendElement("img", { src: "images/Slice/Slice_Plus.svg" }, { position: "absolute", bottom: "0", left: "0", width: "34px", height: "24px", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgPlusArea
            , function () { imgPlusArea.src = "images/Slice/Slice_Plus_Click.svg"; }
            , function () { imgPlusArea.src = "images/Slice/Slice_Plus.svg"; }
            , function () { imgPlusArea.src = "images/Slice/Slice_Plus_Click.svg"; }
        );
        var imgMinusArea = divFuncL.appendElement("img", { src: "images/Slice/Slice_Minus.svg" }, { position: "absolute", bottom: "0", left: "50%", width: "34px", height: "24px", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgMinusArea
            , function () { imgMinusArea.src = "images/Slice/Slice_Minus_Click.svg"; }
            , function () { imgMinusArea.src = "images/Slice/Slice_Minus.svg"; }
            , function () { imgMinusArea.src = "images/Slice/Slice_Minus_Click.svg"; }
        );
        var divFuncC = divFuncs.appendObject("div", null, { width: "33.33%", height: "100%", align: "center", display: "inline-block", position: "relative" });
        divFuncC.appendElement("img", { src: "images/Slice/Slice_Height.svg" }, { position: "absolute", top: "13px", left: "0", width: "70px", height: "17px" });
        var imgPlusHeight = divFuncC.appendElement("img", { src: "images/Slice/Slice_Plus.svg" }, { position: "absolute", bottom: "0", left: "0", width: "34px", height: "24px", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgPlusHeight
            , function () { imgPlusHeight.src = "images/Slice/Slice_Plus_Click.svg"; }
            , function () { imgPlusHeight.src = "images/Slice/Slice_Plus.svg"; }
            , function () { imgPlusHeight.src = "images/Slice/Slice_Plus_Click.svg"; }
        );
        var imgMinusHeight = divFuncC.appendElement("img", { src: "images/Slice/Slice_Minus.svg" }, { position: "absolute", bottom: "0", left: "50%", width: "34px", height: "24px", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgMinusHeight
            , function () { imgMinusHeight.src = "images/Slice/Slice_Minus_Click.svg"; }
            , function () { imgMinusHeight.src = "images/Slice/Slice_Minus.svg"; }
            , function () { imgMinusHeight.src = "images/Slice/Slice_Minus_Click.svg"; }
        );
        var divFuncR = divFuncs.appendObject("div", null, { width: "33.34%", height: "100%", align: "center", display: "inline-block", position: "relative" });
        var imgClearSlice = divFuncR.appendElement("img", { src: "images/Slice/Slice_Clear.svg" }, { position: "absolute", bottom: "0", left: "0", width: "67px", height: "20px", cursor: "pointer" });
        this.SetHeaderButtonEvent(imgClearSlice
            , function () { imgClearSlice.src = "images/Slice/Slice_Clear_Click.svg"; }
            , function () { imgClearSlice.src = "images/Slice/Slice_Clear.svg"; }
            , function () {
				imgClearSlice.src = "images/Slice/Slice_Clear_Click.svg";
				ClearSlice();
			}
        );

		AttachEvent(imgPlusArea, "mousedown", function(){RangeDown(0.5);}, false);
		AttachEvent(imgPlusArea, "mouseup", function(){RangeUp();}, false);
		AttachEvent(imgPlusArea, "mouseout", function(){RangeUp();}, false);
		AttachEvent(imgMinusArea, "mousedown", function(){RangeDown(-0.5);}, false);
		AttachEvent(imgMinusArea, "mouseup", function(){RangeUp();}, false);
		AttachEvent(imgMinusArea, "mouseout", function(){RangeUp();}, false);

		AttachEvent(imgPlusHeight, "mousedown", function(){ZDown(0.5);}, false);
		AttachEvent(imgPlusHeight, "mouseup", function(){ZUp();}, false);
		AttachEvent(imgPlusHeight, "mouseout", function(){ZUp();}, false);
		AttachEvent(imgMinusHeight, "mousedown", function(){ZDown(-0.5);}, false);
		AttachEvent(imgMinusHeight, "mouseup", function(){ZUp();}, false);
		AttachEvent(imgMinusHeight, "mouseout", function(){ZUp();}, false);
    };
    this.Close = function () {
		document.body.style.cursor = "default";
		ClearSlice();
		pEarth.removeEventListener("MouseDown", funcMouseDown, false, true);
		pEarth.removeEventListener("MouseMove", funcMouseMove, false, true);
        this.Destroy();
		this.raiseEvent("Closed");
    };
    ///////////////////////////////////////////////////////////////////////////
    //  上面是自訂的Member Functions，下面是必要的私有Functions  /////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    //  上面是必要的私有Functions,下面是建立本物件時怎樣都要跑的程序  //////////////
    ////////////////////////////////////////////////////////////////////////////
    this.Initialize();
	
	// 移植功能
	
	var bDone = false;
	var MeterPerDegree = 6378137 * 2 * Math.PI / 360;
	var slice_Marks = [];
	var curDim = null;
	var timer = null;
	var pVerticalMarker = null;
	var pVerticalExtrude = null;
	var bFootAdded = false;
	var bEyeAdded = false;
	var slice_Marks = [];
	
	pEarth.addEventListener("MouseDown", funcMouseDown, false, true);
	pEarth.addEventListener("MouseMove", funcMouseMove, false, true);

	function RangeDown(dir)
	{
		if (!bDone)
			return;
		
		timer = setInterval(function()
		{
			var pGlobe = pEarth.GetGlobe();
			curRadius += curRadiusStep * dir;

			var ori = pVerticalMarker.GetOrigin();
			down_Loc[2] = 0;
			pEarth.PlacemarkObjects.Remove(pVerticalMarker);			
			pVerticalMarker = AddVertex(down_Loc, curRadius, pVerticalMarker.ReplaceZ);
			pVerticalMarker.RenderPretreatment(pEarth.GetScene(), pEarth.GetCamera());
			curDim = DimFromMarker(pVerticalMarker);
			
			ori = [ori.X, ori.Y, (pVerticalMarker.ReplaceZ + 0.1) / 6378137];
			pEarth.SliceAnalysis(ori, curDim);
			
			pEarth.Invalidate();
		}, 50);
	}
	function RangeUp()
	{
		clearInterval(timer);
	}
	function ZDown(dir)
	{
		if (!bDone)
			return;
		
		timer = setInterval(function()
		{
			var pGlobe = pEarth.GetGlobe();
			var off = curZStep * dir;
			pVerticalMarker.ReplaceZ += off;
			pVerticalMarker.SetDirty();
			pVerticalExtrude.ReplaceZ += off;
			pVerticalExtrude.SetDirty();
			pEarth.Invalidate();
			
			setTimeout(function()
			{
				var ori = pVerticalMarker.GetOrigin();
				ori = [ori.X, ori.Y, (pVerticalMarker.ReplaceZ + 0.1) / 6378137];
				pEarth.SliceAnalysis(ori, curDim);
			}, 1);
		}, 50);
	}
	function ZUp()
	{
		clearInterval(timer);
	}
	
	var tmp_Position = null;
	function GeodeticFromDevice(x, y)
	{
		var pScene = pEarth.GetScene();
		var pCam = pEarth.GetCamera();
		var pGlobe = pEarth.GetGlobe();
		
		if (tmp_Position == null)
			tmp_Position = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
		else
		{
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
	function AddVertex(loc, radius, ZOffset)
	{
		var xy = ToRectangle(loc[0], loc[1], radius);
		var wkt = "POLYGON((";
		for (var i in xy)
		{
			wkt += xy[i][0].toString() + ' ';
			wkt += xy[i][1].toString();
			if (i != xy.length - 1)
				wkt += ','
		}
		wkt += "))";
		var marker = pEarth.CreatePlacemark("", wkt);
		marker.PreserveGeometry = true;
		marker.DDDSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 1, 0.2)), null);
		marker.ReplaceZ = loc[2] + ZOffset;
		pEarth.PlacemarkObjects.Add(marker);
		slice_Marks.push(marker);
		return marker;
	}
	function ToRectangle(cx, cy, radius)
	{
		var xy = [];
		xy.push([cx - radius, cy - radius]);
		xy.push([cx - radius, cy + radius]);
		xy.push([cx + radius, cy + radius]);
		xy.push([cx + radius, cy - radius]);
		return xy;
	}
	function ClearSlice()
	{
		for (var i in slice_Marks)
		{
			pEarth.PlacemarkObjects.Remove(slice_Marks[i]);
			delete slice_Marks[i];
		}
		bEyeAdded = false;
		bFootAdded = false;
		bDone = false;
		loc1 = loc2 = null;
		pEyeLine = null;
		slice_Marks = [];
		pVerticalExtrude = null;
		curRadius = null;
		curDim = null;
		pEarth.ClearSlice();
		pEarth.Invalidate();
	}
	function funcMouseDown(x, y, b, k)
	{
		bDown = true;
		down_x = x;
		down_y = y;
		pEarth.addEventListener("MouseUp", funcMouseUp, false, true);
	}
	function RayTest(pori1, pdir1, pori2, pdir2)
	{
		var ori1 = SuperGIS.DDDCore.Vector3.ToVec3(pori1);
		var dir1 = SuperGIS.DDDCore.Vector3.ToVec3(pdir1);
		var ori2 = SuperGIS.DDDCore.Vector3.ToVec3(pori2);
		var dir2 = SuperGIS.DDDCore.Vector3.ToVec3(pdir2);
		var cdir = vec3.cross(dir1, dir2, [0, 0, 0]);
		var clen = vec3.dot(cdir, cdir);
		var len = 0;
		if (clen != 0)
		{
			var tvtr = vec3.subtract(ori2, ori1, [0, 0, 0]);
			var cvtr = vec3.scale(cdir, vec3.dot(tvtr, cdir) / clen, [0, 0, 0]); 
			var adir = vec3.cross(vec3.subtract(tvtr, cvtr, [0, 0, 0]), dir1);
			len = vec3.dot(adir, cdir) / clen;
		}
		return SuperGIS.DDDCore.Vector3.NewVector3(vec3.add(vec3.scale(dir2, len, [0, 0, 0]), ori2));
	}
	function DimFromMarker(pMarker)
	{
		var pCV = pMarker.GetMeshes()[0].Mesh.GetCoordinateVertices();
		var xmin = null, xmax = null, ymin = null, ymax = null;
		for (var i = 0; i < pCV.length; i += 3)
		{
			if (!xmin)
			{
				xmin = xmax = pCV[i];
				ymin = ymax = pCV[i + 1];
			}
			else
			{
				xmin = Math.min(xmin, pCV[i]);
				xmax = Math.max(xmax, pCV[i + 1]);
				ymin = Math.min(ymin, pCV[i]);
				ymax = Math.max(ymax, pCV[i + 1]);
			}
		}
		return xmax - xmin;
	}
	
	function funcMouseMove(x, y, b, k)
	{
		if (bDone)
			return;
		
		var pScene = pEarth.GetScene();
		if (bEyeAdded)
		{
			var pLoc = GeodeticFromDevice(x, y);
			var wkt = "LINESTRING(" + down_Loc[0].toString() + " " + down_Loc[1].toString() + " " + pVerticalMarker.ReplaceZ.toString() + "," +
										pLoc[0].toString() + " " + pLoc[1].toString() + " " + pLoc[2].toString() + ")";
			loc2 = new SuperGIS.DDDCore.Vector3(pLoc[0], pLoc[1], pLoc[2]);
		}
		else if (bFootAdded)
		{
			var pCam = pEarth.GetCamera();
			var pGlobe = pEarth.GetGlobe();
			var CurPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
			if (CurPosition == null)
				return;
			
			var CurLocation = RayTest(pCam.EyeAt, pCam.Ray(CurPosition), pRefLocation, pGlobe.UpDirection(pRefLocation));
			var pt = pGlobe.GeodeticFromCartesian(CurLocation);
			if (pt.Z < 0)
			{
				pVerticalExtrude.DefaultElevation = pt.Z;
				pVerticalExtrude.ReplaceZ = -pt.Z;
			}
			else
			{
				pVerticalExtrude.DefaultElevation = 0;
				pVerticalExtrude.ReplaceZ = pt.Z;
			}
			pVerticalExtrude.SetDirty();
			pVerticalMarker.ReplaceZ = pt.Z;
			pVerticalMarker.SetDirty();
			pEarth.Invalidate();

			setTimeout(function()
			{
				if (pVerticalMarker.GetMeshes())
				{
					if (!curDim)
					{
						curDim = DimFromMarker(pVerticalMarker);
						curDimStep = curDim / 50;
					}
					var ori = pVerticalMarker.GetOrigin();
					ori = [ori.X, ori.Y, (pVerticalMarker.ReplaceZ + 0.1) / 6378137];
					pEarth.SliceAnalysis(ori, curDim);
				}
			}, 1);
		}
	}

	function funcMouseUp(x, y, b, k)
	{
		if (bDone)
			return;
		
		pEarth.removeEventListener("MouseUp", funcMouseUp, false, true);
		bDown = false;
		var bMoved = (x != down_x || y != down_y);
		down_x = down_y = null;
		if (bMoved)
			return false;
			
		var pScene = pEarth.GetScene();
		var pCam = pEarth.GetCamera();
		var pGlobe = pEarth.GetGlobe();
		var CurPosition = pScene.PositionFromDevice(new SuperGIS.DDDCore.Vector3(x, y, 0));
		if (CurPosition == null)
			return;
		
		var CurLocation = pGlobe.RayTest(pCam.EyeAt, pCam.Ray(CurPosition), 1, false);
		if (!bFootAdded)
		{
			bFootAdded = true;
			pRefLocation = CurLocation;
			
			down_Loc = GeodeticFromDevice(x, y);
			var radius = pEarth.GetCamera().Position.Z / 100000000;
			if (!pGlobe.IsGCS())
				radius *= MeterPerDegree;
			
			var h = pScene.GetHeight();
			var w = pScene.GetWidth();
			var p1 = pScene.PositionFromDevice(SuperGIS.DDDCore.Vector3.NewVector3([0, h / 2, 0]));
			var p2 = pScene.PositionFromDevice(SuperGIS.DDDCore.Vector3.NewVector3([w, h / 2, 0]));
			var pG1 = pGlobe.GeodeticFromCartesian(pGlobe.RayTest(pCam.EyeAt, pCam.Ray(new SuperGIS.DDDCore.Vector3(-1, 0, 0)), 1, false));
			var pG2 = pGlobe.GeodeticFromCartesian(pGlobe.RayTest(pCam.EyeAt, pCam.Ray(new SuperGIS.DDDCore.Vector3(1, 0, 0)), 1, false));
			var d = Math.sqrt((pG1.X - pG2.X) * (pG1.X - pG2.X) + (pG1.Y - pG2.Y) * (pG1.Y - pG2.Y));
			curRadius = d / 4;
			curRadiusStep = curRadius / 50;
		
			pVerticalExtrude = AddVertex(down_Loc, radius, 0);
			pVerticalExtrude.DefaultElevation = down_Loc[2];
			pVerticalExtrude.ReplaceZ = 0;
			pVerticalExtrude.ExtrudeSymbol = pEarth.CreateSimpleDDDFillSymbol(pEarth.CreateModelMaterial(0, pEarth.CreateColor(1, 1, 0, 0.6)), null);
			pVerticalMarker = AddVertex(down_Loc, curRadius, 0);
		}
		else if (!bEyeAdded)
		{
			bEyeAdded = true;
			bDone = true;
			curZStep = pVerticalMarker.ReplaceZ / 25;
		}
	}
}
