
    var FLD;
    var strPath = getRootPath();

    function getRootPath(){
        var curPageUrl = window.document.location.href;
        var rootPath = `${curPageUrl.split("//")[0]}//`; 
        rootPath += `${curPageUrl.split("//")[1].split("/")[0]}/`;
        rootPath += `${curPageUrl.split("//")[1].split("/")[1]}`;
        return rootPath;
    }

    function uploadFeederLineDiagramData(e){
        const $btnTransfer = $("#btnTransfer");
        const $selectXMLSETBox = $("#selectXMLSETBox");
        const $selectXMLSETBoxSpan = $selectXMLSETBox.find("span");
        const $selectXMLSETBoxSelect = $selectXMLSETBox.find("select");
        const file = e.files[0];
        let fileType = getFileExtension(file.name);
        let type = /xml/.test(fileType) ? true : false ;
        let reader = new FileReader();
        $selectXMLSETBox.find("span em").remove();
        $selectXMLSETBox.find("select option").remove();
        
        if (!file) {
            return;
        }else{
            btnDisable($btnTransfer, false);
            mutation.setXMLFileData(stateData,{item:'xmlFile',value:""})
        }
        if(type){
            $selectXMLSETBoxSelect.show();
            reader.readAsText(file);
            reader.onload = function () {
                const result = reader.result;
                let feederArr = getFeederId(result);
                $selectXMLSETBoxSpan.addClass("addSelect").append(`<em>${file.name}</em>`);
                feederArr.forEach(function(v){
                    $selectXMLSETBoxSelect.append(`<option class="feederId" value="${v}">${v}</option>`);
                })
            }
        }else{
            $selectXMLSETBoxSelect.hide();
            $selectXMLSETBoxSpan.removeClass("addSelect").append(`<em>${file.name}</em>`);
        }
        
        $btnTransfer.off("click").on("click",function(){
            btnDisable($btnTransfer, true);
            if (/set|xml/.test(fileType)){
                handleFileSelect(e,type).then(function(res){
                    if(res.status){
                        e.value = '';
                    }
                });
            }else{
                alertSwal({ icon: "warning", title: "檔案錯誤", text: "必須是SET/XML檔案" });
                btnDisable($btnTransfer, false);
            }
            
        })
    }

    function handleFileSelect(evt,isxml) {
        var f = stateData.xmlFile !== "" ? stateData.xmlFile : evt.files[0];
        var reader = new FileReader();
        let dfd = $.Deferred();
        reader.onload = (function (theFile) {
            return function (e) {
                var binaryData = reader.result;
                var base64String = window.btoa(binaryData);
                ajaxStart();
                if(isxml){
                    mutation.setXMLFileData(stateData,{item:'xmlFile',value:f})
                    UploadFile(getFeederId(binaryData),eventOption.UploadXMLFile["XMLToFeederDiagram"]);
                }else{
                    DrawFeederDiagramData(base64String);
                }
            };
        })(f);
        reader.readAsBinaryString(f);
        dfd.resolve({status:true});
        return dfd.promise();
    }

    function DrawFeederDiagramData(base64String){
        const http = new XMLHttpRequest();
        const url = 'https://demo.supergeotek.com/FeederAnalysis/feeder/FeederDiagramData';
        const params = 'data=' + encodeURIComponent(base64String);
                    
        http.open('POST', url, true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        http.send(params);
        http.onload = function (e) {
            var tmp_results = JSON.parse(e.target.responseText);
            FLD.model = go.Model.fromJson(
                tmp_results
            );
            sessionStorage.setItem("nodeData", e.target.responseText);
            ajaxStop();
        }
    }

    function init() {
        var $ = go.GraphObject.make;

        function isUnoccupied(r, node) {
            var diagram = node.diagram;

            function navig(obj) {
                var part = obj.part;
                if (part === node) return null;
                if (part instanceof go.Link) return null;
                if (part.isMemberOf(node)) return null;
                if (node.isMemberOf(part)) return null;
                return part;
            }
            var lit = diagram.layers;
            while (lit.next()) {
                var lay = lit.value;
                if (lay.isTemporary) continue;
                if (lay.findObjectsIn(r, navig, null, true).count > 0) return false;
            }
            return true;
        }

        function avoidNodeOverlap(node, pt, gridpt) {
            if (node.diagram instanceof go.Palette) return gridpt;
            var bnds = node.actualBounds;
            var loc = node.location;
            var r = new go.Rect(gridpt.x - (loc.x - bnds.x), gridpt.y - (loc.y - bnds.y), bnds.width, bnds.height);
            r.inflate(-0.5, -0.5);  
            if (!(node.diagram.currentTool instanceof go.DraggingTool) &&
                (!node._temp || !node.layer.isTemporary)) { 
                node._temp = true; 
                while (!isUnoccupied(r, node)) {
                    r.x += 10;  
                    r.y += 2;  
                }
                r.inflate(0.5, 0.5);
                return new go.Point(r.x - (loc.x - bnds.x), r.y - (loc.y - bnds.y));
            }
            if (isUnoccupied(r, node)) return gridpt; 
            return loc;  
        }

        function nodeClicked(e, obj) { 
            var evt = e.copy();
			var node = obj.part;
			var targetKey = node.data.text;
			var category = node.data.category;
			var gText = category.includes("green") ? node.data.g_text : "";
			var lText = node.data.l_text.replace("#", "@");
			var stroke = node.data.stroke.replace("#", "@");
			var lStroke = node.data.lStroke.replace("#", "@");
			var edgeType = node.data.edgeType;
            var isContainBranch = node.data.isContainBranch;
            if (isContainBranch == true && (edgeType == "001" || edgeType == "003"))
				createPop("branch.html?tcplid=" + targetKey + "&type=" + category + "&g=" + gText + "&l=" + lText + "&c1=" + stroke + "&c2=" + lStroke, "test");
        }

        var newwindow;

        function createPop(url, name) {
            newwindow = window.open(url, name, 'width=700,height=500,toolbar=0,menubar=0,location=0');
            if (window.focus) { newwindow.focus() }
        }

        FLD = $(go.Diagram, "myDiagramDiv", {
            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
			initialAutoScale: go.Diagram.Uniform,
            initialViewportSpot: go.Spot.LeftCenter,
            layout:
              $(go.TreeLayout,
                {
                    isOngoing: false, 
                    angle: 0,
                    layerSpacing: 100
                })
        });

    FLD.nodeTemplateMap.add("feeder",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/feeder.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("ftu_on",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/ftu_on.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right, 
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("ftu_off",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/ftu_off.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right, 
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("ftu_on_green",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/ftu_on.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Spot",
                { height: 65 },
                $(go.Picture, `${strPath}/images/feederLineDiagram/generatingunit.png`,
                    { maxSize: new go.Size(10, 10), margin: new go.Margin(0, 0, 0, 0) },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
                $(go.TextBlock, "Spot",
                    {
                        margin: new go.Margin(0, 0, 0, 60),
                        alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Top,
                        font: '14px "Open Sans", sans-serif',
                        stroke: "#fff",
                        editable: false
                    },
                    new go.Binding("text", "g_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject()
                )
            ),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("ftu_off_green",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/ftu_off.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Spot",
                { height: 65 },
                $(go.Picture, `${strPath}/images/feederLineDiagram/generatingunit.png`,
                    { maxSize: new go.Size(10, 10), margin: new go.Margin(0, 0, 0, 0) },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
                $(go.TextBlock, "Spot",
                    {
                        margin: new go.Margin(0, 0, 0, 60),
                        alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Top,
                        font: '14px "Open Sans", sans-serif',
                        stroke: "#fff",
                        editable: false
                    },
                    new go.Binding("text", "g_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject()
                )
            ),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("switch_on",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/switch_on.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        )
    );

    FLD.nodeTemplateMap.add("switch_off",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/switch_off.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("switch_off_normalOpen",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/switch_off.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Spot",
                { height: 55 },
                $(go.Picture, `${strPath}/images/feederLineDiagram/normalopen.png`,
                    { maxSize: new go.Size(20, 20), margin: new go.Margin(0, 0, 0, 60)  },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            ),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("switch_on_normalOpen",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/switch_on.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Spot",
                { height: 55 },
                $(go.Picture, `${strPath}/images/feederLineDiagram/normalopen.png`,
                    { maxSize: new go.Size(20, 20), margin: new go.Margin(0, 0, 0, 60) },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            ),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("switch_on_green",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/switch_on.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Spot",
                { height: 65 },
                $(go.Picture, `${strPath}/images/feederLineDiagram/generatingunit.png`,
                    { maxSize: new go.Size(10, 10), margin: new go.Margin(0, 0, 0, 0) },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
                $(go.TextBlock, "Spot",
                    {
                        margin: new go.Margin(0, 0, 0, 60),
                        alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Top,
                        font: '14px "Open Sans", sans-serif',
                        stroke: "#fff",
                        editable: false
                    },
                    new go.Binding("text", "g_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject()
                )
            ),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        ));

    FLD.nodeTemplateMap.add("switch_off_green",
        $(go.Node, "Spot",
            { click: nodeClicked, dragComputation: avoidNodeOverlap },
            new go.Binding("visible", "visible"),
            $(go.Picture, `${strPath}/images/feederLineDiagram/switch_off.png`,
                {
                    portId: "",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Left
                },
                { maxSize: new go.Size(50, 20) },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
            $(go.Panel, "Spot",
                { height: 65 },
                $(go.Picture, `${strPath}/images/feederLineDiagram/generatingunit.png`,
                    { maxSize: new go.Size(10, 10), margin: new go.Margin(0, 0, 0, 0) },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
                $(go.TextBlock, "Spot",
                    {
                        margin: new go.Margin(0, 0, 0, 60),
                        alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Top,
                        font: '14px "Open Sans", sans-serif',
                        stroke: "#fff",
                        editable: false
                    },
                    new go.Binding("text", "g_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject()
                )
            ),
            $(go.Panel, "Position",
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 60),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "stroke")
                ),
                $(go.TextBlock,
                    {
                        position: new go.Point(0, 65),
                        margin: 0, font: '14px "Open Sans", sans-serif',
                        editable: false
                    },
                    new go.Binding("text", "l_text").makeTwoWay(),
                    new go.Binding("angle", "angle", function (a) { return a === 180 ? 180 : 0; }).ofObject(),
                    new go.Binding("stroke", "lStroke")
                )
            )
        )
    );

    FLD.nodeTemplateMap.add("4Route",
        $(go.Node, "Spot",
            $(go.Panel, "Auto",
                { width: 270, height: 90, margin: new go.Margin(0, 0, 80, 0) },
                $(go.Shape, "Rectangle",
                    {
                        stroke: null, strokeWidth: 0
                    }),
					 $(go.TextBlock,
                    {
                        margin: new go.Margin(0, 0, 60, 70),
                        width:300,
                        font: '14px "Open Sans", sans-serif',
                        editable: false,
                        stroke: "#d2d200"
                    },
                    new go.Binding("text", "text")
                ),
                $(go.TextBlock, "區間",
                    {
                        margin: new go.Margin(35, 0, 0, 0),
                        font: '14px "Open Sans", sans-serif',
                        editable: false,
                        stroke: "#fff"
                    }
                ),
                $(go.TextBlock,
                    {
                        margin: new go.Margin(0, 230, 15, 0),
                        font: '11px "Open Sans", sans-serif',
                        editable: false,
                        stroke: "#fff"
                    },
                    new go.Binding("text", "loopid_1_text").makeTwoWay()
                ),
                $(go.TextBlock,
                    {
                        margin: new go.Margin(0, 95, 15, 0),
                        font: '11px "Open Sans", sans-serif',
                        editable: false,
                        stroke: "#fff"
                    },
                    new go.Binding("text", "loopid_2_text").makeTwoWay()
                ),
                $(go.TextBlock,
                    {
                        margin: new go.Margin(0, 0, 15, 40),
                        font: '11px "Open Sans", sans-serif',
                        editable: false,
                        stroke: "#fff"
                    },
                    new go.Binding("text", "loopid_3_text").makeTwoWay()
                ),
                $(go.TextBlock,
                    {
                        margin: new go.Margin(0, 0, 15, 175),
                        font: '11px "Open Sans", sans-serif',
                        editable: false,
                        stroke: "#fff"
                    },
                    new go.Binding("text", "loopid_4_text").makeTwoWay()
                ),
				$(go.Panel, "Table",
                    { width: 270, height: 90, margin: new go.Margin(0, 0, 39, 0) },
                    $(go.Shape,  
                        { row: 0, column: 0, width: 5, height: 5, portId: "loop1", fill: "#fff" }),
                    $(go.Shape,  
                        { row: 0, column: 1, width: 5, height: 5, portId: "loop2", fill: "#fff" }),
                    $(go.Shape,  
                        { row: 0, column: 2, width: 5, height: 5, portId: "loop3", fill: "#fff" }),
                    $(go.Shape, 
                        { row: 0, column: 3, width: 5, height: 5, portId: "loop4", fill: "#fff" }),
                 ),
                $(go.Panel, "Table",
                    { width: 270, height: 90 },
                    $(go.Picture, `${strPath}/images/feederLineDiagram/switch_on.png`,
                        { row: 0, column: 0, margin: new go.Margin(0, 0, 0, 0), maxSize: new go.Size(50, 20), angle:90 }
                    ),
                    $(go.Picture, `${strPath}/images/feederLineDiagram/switch_on.png`,
                        { row: 0, column: 1, margin: new go.Margin(0, 0, 0, 0), maxSize: new go.Size(50, 20), angle: 90}
                    ),
                    $(go.Picture, `${strPath}/images/feederLineDiagram/switch_on.png`,
                        { row: 0, column: 2, margin: new go.Margin(0, 0, 0, 0), maxSize: new go.Size(50, 20), angle: 90 }
                    ),
                    $(go.Picture, `${strPath}/images/feederLineDiagram/switch_on.png`,
                        { row: 0, column: 3, margin: new go.Margin(0, 0, 0, 0), maxSize: new go.Size(50, 20), angle: 90 }
                    ),
                    $(go.Shape,  
                        { row: 1, column: 0, width: 5, height: 5, portId: "A", fill: "#fff" }),
                    $(go.Shape,  
                        { row: 1, column: 1, width: 5, height: 5, portId: "B", fill: "#fff" }),
                    $(go.Shape,  
                        { row: 1, column: 2, width: 5, height: 5, portId: "C", fill: "#fff" }),
                    $(go.Shape,  
                        { row: 1, column: 3, width: 5, height: 5, portId: "D", fill: "#fff" }),
                )
            )
        )
    );

    FLD.groupTemplate =
        $(go.Group, "Vertical",
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle",  
                    {
                        parameter1: 14,
                        fill: "rgba(128,128,128,0.33)"
                    }),
                $(go.Placeholder,    
                    { padding: 5 })  
            ),
            $(go.TextBlock,         
                { alignment: go.Spot.Right, font: "Bold 12pt Sans-Serif" },
                new go.Binding("text", "key"))
        );

    FLD.linkTemplate =
        $(go.Link,
            { routing: go.Link.Orthogonal, corner: 10 },
            $(go.Shape,
                { strokeWidth: 2, stroke: "#0000ff" },
                new go.Binding("visible", "indexLine", function (c) { return c === false ? false : true })
            ),
            $(go.TextBlock,
                {
                    segmentIndex: 0,
                    segmentOffset: new go.Point(60, -20),
                    font: '14px "Open Sans", sans-serif',
                    stroke: "#fff",
                    segmentOrientation: go.Link.OrientUpright
                },new go.Binding("text", "text")
			)
        ); 
    }