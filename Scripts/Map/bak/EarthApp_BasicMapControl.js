var BasicMapControl = function (pEarth) {
	
	function pScaleHandleStop(tEvent) {
		pEarth.EndNavigate();
		document.body.style.cursor = "default";
		//DetachEvent(pZIn, "mouseup", pScaleHandleStop, true);
		$("#dimgZoomIn").off("mouseup", pScaleHandleStop);
		//DetachEvent(pZOut, "mouseup", pScaleHandleStop, true);
		$("#dimgZoomOut").off("mouseup", pScaleHandleStop);
	}
	function pScaleInHandleStart(tEvent) {
		tEvent.preventDefault();
		document.body.style.cursor = "n-resize";
		//AttachEvent(pZIn, "mouseup", pScaleHandleStop, true);
		$("#dimgZoomIn").on("mouseup", pScaleHandleStop);
		var pCenter = SuperGIS.DDDEarth.PickingVector(pEarth, SuperGIS.DDDCore.RenderPriority.Ground, new SuperGIS.DDDCore.Vector3(0, 0, 0), false, tEvent.ctrlKey ? 0 : 3);
		pEarth.StartNavigate(pEarth.CreateZoomAction(pCenter, -1, 0), 0);
		return false;
	}
	function pScaleOutHandleStart(tEvent) {
		tEvent.preventDefault();
		document.body.style.cursor = "n-resize";
		//AttachEvent(pZOut, "mouseup", pScaleHandleStop, true);
		$("#dimgZoomOut").on("mouseup", pScaleHandleStop);
		var pCenter = SuperGIS.DDDEarth.PickingVector(pEarth, SuperGIS.DDDCore.RenderPriority.Ground, new SuperGIS.DDDCore.Vector3(0, 0, 0), false, tEvent.ctrlKey ? 0 : 3);
		pEarth.StartNavigate(pEarth.CreateZoomAction(pCenter, 1, 0), 0);
		return false;
	}
	$("#dimgZoomOut").on("mousedown", pScaleOutHandleStart);
	$("#dimgZoomIn").on("mousedown", pScaleInHandleStart);
	$("#dimgHome").click(function () {
		//Home紐按一下搞定,上面兩個zoom in & zoom out則是
		earth_.SetViewpoint(120.414247, 23.650445, 70000, 0, (earth_.AllowTilt ? pCam.Pitch : 0), false);
	});
	$("#PoweroffLocation").click(function () {
		if(eventMarkers.PPoweroff >= eventMarkers.MPoweroff.length)
			eventMarkers.PPoweroff = 0;
		var loc = {X:eventMarkers.MPoweroff[eventMarkers.PPoweroff].GetExtent()[0] , Y:eventMarkers.MPoweroff[eventMarkers.PPoweroff].GetExtent()[1] , Z:0}
		loc = (new TaipowerCoordinateTransform()).EPSG3857ToLngLat(loc)
		if(loc.X == 0 | loc.Y == 0)
			return;
		earth_.SetViewpoint(loc.X, loc.Y, 5000, 0, (earth_.AllowTilt ? pCam.Pitch : 0), false);
		eventMarkers.PPoweroff++;
		if(eventMarkers.PPoweroff == eventMarkers.MPoweroff.length)
			eventMarkers.PPoweroff = 0;
	});
	$("#FaultLocation").click(function () {
		if(eventMarkers.PFault >= eventMarkers.MFault.length)
			eventMarkers.PFault = 0;
		var loc = {X:eventMarkers.MFault[eventMarkers.PFault].GetExtent()[0] , Y:eventMarkers.MFault[eventMarkers.PFault].GetExtent()[1] , Z:0}
		loc = (new TaipowerCoordinateTransform()).EPSG3857ToLngLat(loc)
		if(loc.X == 0 | loc.Y == 0)
			return;
		earth_.SetViewpoint(loc.X, loc.Y, 5000, 0, (earth_.AllowTilt ? pCam.Pitch : 0), false);
		eventMarkers.PFault++;
		if(eventMarkers.PFault == eventMarkers.MFault.length)
			eventMarkers.PFault = 0;
	});
	$("#TransferLocation").click(function () {
		if(eventMarkers.PTransfer >= eventMarkers.MTransfer.length)
			eventMarkers.PTransfer = 0;
		var loc = {X:eventMarkers.MTransfer[eventMarkers.PTransfer].GetExtent()[0] , Y:eventMarkers.MTransfer[eventMarkers.PTransfer].GetExtent()[1] , Z:0}
		loc = (new TaipowerCoordinateTransform()).EPSG3857ToLngLat(loc)
		if(loc.X == 0 | loc.Y == 0)
			return;
		earth_.SetViewpoint(loc.X, loc.Y, 5000, 0, (earth_.AllowTilt ? pCam.Pitch : 0), false);
		eventMarkers.PTransfer++;
		if(eventMarkers.PTransfer == eventMarkers.MTransfer.length)
			eventMarkers.PTransfer = 0;
	});
	$("#ShortcircuitLocation").click(function () {
		if(eventMarkers.PShortcircuit >= eventMarkers.MShortcircuit.length)
			eventMarkers.PShortcircuit = 0;
		var loc = {X:eventMarkers.MShortcircuit[eventMarkers.PShortcircuit].GetExtent()[0] , Y:eventMarkers.MShortcircuit[eventMarkers.PShortcircuit].GetExtent()[1] , Z:0}
		loc = (new TaipowerCoordinateTransform()).EPSG3857ToLngLat(loc)
		if(loc.X == 0 | loc.Y == 0)
			return;
		earth_.SetViewpoint(loc.X, loc.Y, 5000, 0, (earth_.AllowTilt ? pCam.Pitch : 0), false);
		eventMarkers.PShortcircuit++;
		if(eventMarkers.PShortcircuit == eventMarkers.MShortcircuit.length)
			eventMarkers.PShortcircuit = 0;
	});
};