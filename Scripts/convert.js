//轉檔應用(饋線地圖/xml轉換)連結轉址
function linkToXMLConvert(obj){
    const getUrlString = location.href;
    const urlObj = getUrlString.split("/Convert/");
    const pageList = ["SetConvert","CommPosCompare","FeederLineDiagram"];
    const urlData = urlObj[1].split("#")[0];
    if(pageList.indexOf(urlData) >= 0){
        location.href = `${urlObj[0]}/Convert?event=${obj}`
    }
}
/* 饋線地圖/XML轉換 */
//XML DATA讀取依序載入
function loadXML(res, errList) {
    const $content = $("#XMLDataBox");
    const $setDataBtn = $("#setDataBtn").find("button");
    const $tblListBox = $("#tblListBox");
    const num = res.content.length;
    let isload = stateData.isXmlload;
    let arr = res.content;
    arr.forEach(function (element, i) {
        $content.append(appendXML({ content: element, error: errList }));
        // 動態載入XML轉檔DATA
        // if (isload === i && num >= isload) {
        //     setTimeout(() => {
        //         isload++;
        //         $content.append(appendXML({content:element,error:errList}));
        //         mutation.toggleIsXmlLoad(stateData,{item:'isXmlload',value:isload});
        //         loadXML(res,errList);
        //         $content.scrollTop(document.getElementById("XMLDataBox").scrollHeight);
        //     }, 5);
        // }
    })
    // if(isload >= num){
    //     $tblListBox.removeClass("closed");
    //     btnDisable($setDataBtn,false);
    //     let XMLDataBottom = changeXMLData('</rdf:RDF>')
    //     $content.append(`<pre>${XMLDataBottom}</pre>`)
    // }
    let XMLDataTop = changeXMLData('<rdf:RDF xmlns:cim="http://iec.ch/TC57/CIM100#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">');
    let XMLDataBottom = changeXMLData('</rdf:RDF>');
    $content.prepend(`<pre>${XMLDataTop}</pre>`);
    $content.append(`<pre>${XMLDataBottom}</pre>`);
    $tblListBox.removeClass("closed");
    btnDisable($setDataBtn, false);
}
//XML 錯誤清單讀入
function loadXMLErrList(res) {
    const $tblListBox = $("#tblListBox");
    let position, pt, positionArr;
    res.forEach(function (v) {
        if (typeof v.position === "string") {
            positionArr = v.position.split(',');
            pt = { X: positionArr[0], Y: positionArr[1] };
            position = new TaipowerCoordinateTransform().TWD67ToTPC(pt);
        } else {
            position = ""
        }

        let isLink = v.rdfid === "" ? "closed" : "";
        let result = `
        <div class="resultList w-100" data-id=${v.rdfid}>
            <ul class="left w-100">
                <li><span class="left">設備編號 - </span><span class="resultNum">${v.rdfid}</span></li>
                <li><span class="left">饋線編號 - </span><span class="resultFeeder">${v.feederid}</span></li>
                <li><span class="left">描述 - </span><span class="resultDescription">${v.description}</span></li>
            </ul>
            <div class="left w-40 linkBox ${isLink}">
                <div class="w-100"><a href="https://demo.supergeotek.com/INERADMS_INTEGRATION/GISMAP/MAP?Method=Coordinate&Value=${position}" target="_blank">地圖定位</a></div>
                <div class="w-100"><a href="#${v.rdfid}">XML定位</a></div>
            </div>
        </div>`
        $tblListBox.append(result);
    })
}
//屬性設定收合選單
function toggleAttributeList(self) {
    const $this = $(self);
    const $list = $this.parent("h6").siblings("ul");
    const $allList = $("#ulSettingAttribute").find("ul");
    const $listIcon = $("#ulSettingAttribute").find("h6").find(".icon");
    $allList.removeClass("active");

    if ($this.hasClass("display")) {
        $listIcon.removeClass("hide").addClass("display");
        $this.removeClass("display").addClass("hide");
        $list.addClass("active");
    } else {
        $listIcon.removeClass("hide").addClass("display");
        $this.removeClass("hide").addClass("display");
        $list.removeClass("active");
    }
}
//上方Nav選單切換
function toggleToolboxButton(self) {
    const btn = $(self).attr("id");
    const openBtnList = ["BtnXmlTransfer"];
    const isOpen = openBtnList.indexOf(btn) ? true : false;
    toggleNavQueryWindow(isOpen, btn);
}
//收合側方選單欄
function toggleNavQueryWindow(obj, btn) {
    const $aToggleButton = $("#aToggleButton");
    const $navConvertWindow = $("#navConvertWindow");
    $("#divConvertToolBox").find("li").removeClass("active");
    $("#" + btn).addClass("active");
    if (obj) {
        $aToggleButton.find("i").removeClass("fa-caret-left").addClass("fa-caret-right");
        $navConvertWindow.removeClass("OpeningNav").addClass("ClosingNav");
    } else {
        $aToggleButton.find("i").removeClass("fa-caret-right").addClass("fa-caret-left");
        $navConvertWindow.removeClass("ClosingNav").addClass("OpeningNav");
    }
}
//開合共同資訊模型區塊
function openTraneferData(obj) {
    const $monitorTraneferData = $("#monitorTraneferData");
    const $tblTransferBox = $("#tblTransferBox");
    const $tblListBox = $("#tblListBox");
    const $aToggleButton = $("#aToggleButton");
    const $divMapBaseOperation = $("#divMapBaseOperation");
    if (obj) {
        $tblTransferBox.hide();
        $aToggleButton.hide();
        $monitorTraneferData.show();
        $tblListBox.show();
        $divMapBaseOperation.hide();
    } else {
        $tblTransferBox.show();
        $aToggleButton.show();
        $monitorTraneferData.hide();
        $tblListBox.hide();
        $divMapBaseOperation.show();
    }
}
//下載XML檔案DATA格式處理
function getXMLRandomData() {
    const $content = $("#XMLDataBox");
    let arr = [];
    let data = "";
    $content.each(function () {
        let text = $(this).text();
        data += text + "\r\n";
    })
    arr.push(data)
    return arr
}
/* 饋線地圖/XML轉換 */
/* SET轉換 */
//SET DATA讀取依序載入
function loadList(res, obj) {
    const $setDataBtn = $("#setConvertBtn").find("button");
    const $content = $("#" + obj).find("ul");
    let isload = stateData.isload;
    let arr = res.content;
    let num = arr.length;
    let errList = [];
    if (res.errorlist.length > 0) {
        res.errorlist.forEach(function (v, i) {
            errList.push(v.rdfid)
        })
    }
    arr.forEach(function (v, i) {
        let isError;
        let list = v.split(",");
        if (isload === i && num >= isload) {
            setTimeout(() => {
                isload++;
                isError = errList.indexOf(list[0]) < 0 ? "" : "warn";
                $content.append(`<li id="${list[0]}" class="${isError}">${v}</li>`);
                mutation.toggleIsLoad(stateData, { item: 'isload', value: isload });
                loadList(res, obj);
                $content.scrollTop($content.find('li').length * 24);
            }, 100);
        }
        if (num == isload) {
            btnDisable($setDataBtn, false);
            reOpenBtn();
        }
    })
}

//讀取XML檔案
function openXMLData(e) {
    
    const file = e.files[0];
    const reader = new FileReader();
    const $self = $(e);
    const fn = eventOption[$self.data("option")];
    const fileType = getFileExtension(file.name);
    fn.beforeCallBack(e);
    if (!file) {
        return;
    }
    if (/xml/.test(fileType)) {
        reader.readAsText(file);
        reader.onload = function () {
            const result = reader.result;
            fn.successCallBack(e,result,file);
        }
    } else {
        fn.errorCallBack(e);
    }

    //檔案上傳
    //上傳後將檔案清除
    e.value = '';
}
/* SET轉換 */
//下載檔案(使用BLOB)
function downloadFile(type) {
    //藉型別陣列建構的 blob 來建立 URL
    const fileName = type === "XML" ? "CIM.xml" : "SET.set";
    const data = type === "XML" ? getXMLRandomData() : getRandomData();
    let blob = new Blob(data, {
        type: "text/plain;chartset=utf-8",
    });
    let href = URL.createObjectURL(blob);
    //從 Blob 取出資料
    let link = document.createElement("a");
    document.body.appendChild(link);
    link.href = href;
    link.download = fileName;
    link.click();
}
//下載檔案DATA格式處理
function getRandomData() {
    const $content = $("#SystemDataBox").find("li");
    let arr = [];
    let data = "\ufeff";
    $content.each(function () {
        let text = $(this).text();
        data += text + ",\r\n";
    })
    arr.push(data);
    return arr
}

//讀取SET檔案
function upload(e) {
    const file = e.files[0];
    const reader = new FileReader();
    const $self = $(e);
    const content = "#" + $self.data("box");
    const fileType = getFileExtension(file.name);
    //清除檔案內容
    $self.siblings(".addFile").remove();
    $(content).val("");
    if (!file) {
        return;
    }
    if (/set/.test(fileType)) {
        ajaxStart();
        reader.readAsText(file);
        reader.onload = function () {
            if (reader.result === "") {
                alertSwal({ icon: "warning", title: "檔案錯誤", text: "檔案內容為空" });
            }
            $self.siblings(".mainTitle").after(addFileTag(file));
            const $tbody = $("#divSetLoaderResult table tbody");
            const $compareResult = $("#compareResult");
            let result = reader.result.split(/\s+/)
            let arr = result.filter(el => el)
            clearContent([$tbody, $(content)]);
            getSETFeeder(arr).done(function (feeder) {
                getAiDiQuery(feeder).done(function (res) {
                    let getAiDiQueryData = res[0].switchs;
                    let $setNum = $("#setNum");
                    mutation.toggleIsLoad(stateData, { item: 'AiDiList', value: getAiDiQueryData });
                    mutation.toggleIsLoad(stateData, { item: 'SETList', value: arr });
                    $compareResult.removeClass("active").addClass("closed");
                    getAiDiQueryData.forEach(function (switchData) {
                        let mapLink = switchData.split("-")[0]; 
                        $tbody.append(
                            `<tr class="" data-coordinate="${switchData}">
                            <td>${feeder}</td>
                            <td>${switchData}</td>
                            <td></td>
                            <td>
                                <a href="https://demo.supergeotek.com/INERADMS_INTEGRATION/GISMAP/MAP?Method=Coordinate&Value=${mapLink}" target="_blank"><i class="icon location"></i></a>
                            </td>
                        </tr>`
                        )
                    })
                    $tbody.removeClass("closed");
                    btnDisable($("#compare"), false);
                    $setNum.find("b").text(getAiDiQueryData.length);
                    ajaxStop();
                }).fail(function (error) {
                    alertSwal({ icon: "warning", title: "載入錯誤", text: "饋線讀取失敗" }).done(function () {
                        ajaxStop();
                    });
                })
            });
        }
    } else {
        alertSwal({ icon: "warning", title: "檔案錯誤", text: "必須是SET檔案" });
    }
    //檔案上傳
    //上傳後將檔案清除
    e.value = '';
}

//取得XML檔饋線編號
function getFeederId(result) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(result, "text/xml");
    const layer = xmlDoc.getElementsByTagName('rdf:RDF')[0];
    let arr = [];
    let i = 0;
    let feederId, titleNum;
    if (!layer) {
        Swal.fire({
            icon: 'error',
            title: '資料錯誤',
            text: '檔案中未取得饋線編號',
        })
    } else {
        titleNum = layer.getElementsByTagName('cim:Feeder').length - 1;
        while (i <= titleNum) {
            feederId = layer.getElementsByTagName('cim:Feeder')[i].getAttribute('rdf:ID');
            arr.push(feederId)
            i++;
        }
        return arr;
    }
}

function reOpenBtn() {
    const $ulSETLineRange = $("#ulSETLineRange");
    const $btnTransferSET = $("#btnTransferSET");
    $ulSETLineRange.find("input[type=checkbox]").click(function () {
        if ($btnTransferSET.attr("disabled") === "disabled") {
            btnDisable($btnTransferSET, false)
        }
    })
}

//XML轉換設定項目依螢幕高度顯示
function setListBoxLine() {
    const $ListBox = $(".tblBox").find(".listBox");
    const mapHeight = $("#divBodyContainer").height();
    let boxHeight = "";
    switch (true) {
        case mapHeight < 560:
            boxHeight = "56px"
            break;
        case mapHeight < 640:
            boxHeight = "78px"
            break;
        case mapHeight < 720:
            boxHeight = "100px"
            break;
        case mapHeight < 750:
            boxHeight = "122px"
            break;
        case mapHeight < 840:
            boxHeight = "144px"
            break;
        default:
            boxHeight = "166px"
            break;
    }
    $ListBox.css({ "height": boxHeight });
}

//通訊點位比對功能
function compareData() {
    let aiDiQuery, coordinate;
    let setList = stateData.SETList;
    let aidiList = stateData.AiDiList;
    ajaxStart();
    aidiList.forEach(function (aidiItem, aidiIndex, aidiArr) {
        setList.forEach(function (setItem, setIndex, setArr) {
            coordinate = setItem.split(',')[0];
            aiDiQuery = setItem.split(',')[7];
            let list = setArr.map((x) => {
                return x.split(',')[0];
            });
            //SETList表單比對
            setListCompare(aidiList, coordinate, aiDiQuery, setIndex);
            //AiDiList表單比對
            aidiListCompare(aidiArr, coordinate, aiDiQuery, aidiIndex, list);
        })
    })
}
//SETList表單比對
function setListCompare(aidiList, coordinate, aiDiQuery, setIndex) {
    const isAuto = stateData.isAutoList;
    const $setDataBox = $("#setDataBox");
    let isWarn, isBold;

    if (arrHasData(isAuto, aiDiQuery) !== -1) {
        isWarn = arrHasData(aidiList, coordinate) === -1 ? "warn" : "success";
    } else {
        isWarn = arrHasData(aidiList, coordinate) !== -1 ? "warn" : "normal";
    }
    isBold = isWarn === "normal" ? "" : "bold";
    $setDataBox.find("li").eq(setIndex).addClass(isWarn).addClass(isBold);
}
//通訊點位清單比對處理
function aidiListCompare(aidiArr, coordinate, aiDiQuery, aidiIndex, setList) {
    //data:(點位清單,圖號坐標,開關種類代碼,點位清單INDEX,SET清單)
    const autoList = stateData.isAutoList;
    const isAuto = arrHasData(autoList, aiDiQuery);
    const isAidi = arrHasData(aidiArr, coordinate);
    const $obj = $("#divSetLoaderResult tbody tr");
    const note = `<i class="icon note"></i>`;
    const success = `<i class="icon success"></i>`;
    const isError = $obj.eq(isAidi).hasClass("dataError");
    //通訊點位清單比對SET資料開關種類代碼是否正確
    if (isAidi !== -1) {
        if (isAuto === -1 || isError) {
            $obj.eq(isAidi).find("td").eq(2).html(note);
            $obj.eq(isAidi).addClass("dataError");
        } else {
            $obj.eq(isAidi).find("td").eq(2).html(success);
            //通訊點位清單比對是否有對應SET資料
            compareAidiList(aidiArr, aidiIndex, setList);
        }
    } else {
        ajaxStop();
    }
}
//通訊點位比對清單
function compareAidiList(arr, index, setList) {
    const $obj = $("#divSetLoaderResult tbody tr");
    const success = `<i class="icon success"></i>`;
    const error = `<i class="icon error"></i>`;
    //兩陣列間的資料比對結果
    let result = arr.filter((e) => {
        return setList.indexOf(e) === -1;
    })
    if (result.length > 0) {
        //$obj.eq(index).find("td").eq(2).html(success);
        result.forEach(function (v, i) {
            const $coordinate = $("#divSetLoaderResult").find("[data-coordinate='" + v + "']")
            $coordinate.find("td").eq(2).html(error);
            $coordinate.addClass("dataError");
        })
    }
    if (index === arr.length - 1) openCompareResult();
}
//開啟通訊點位比對結果
function openCompareResult() {
    const $compareResult = $("#compareResult");
    const $compareSuccess = $("#compareResult").find("span").eq(0).find("b");
    const $compareError = $("#compareResult").find("span").eq(1).find("b");
    const $successPercent = $("#compareResult").find("span").eq(0).find("small");
    const $errorPercent = $("#compareResult").find("span").eq(1).find("small");
    const resultData = computeCompareResult();
    setTimeout(function () {
        $compareResult.removeClass("closed").addClass("active");
        $compareSuccess.text(resultData.successNum);
        $compareError.text(resultData.errorNum);
        $successPercent.text(resultData.successPercent);
        $errorPercent.text(resultData.errorPercent);
        ajaxStop();
    }, 500)
}
//計算通訊點位比對數
function computeCompareResult() {
    const $dataBox = $("#divSetLoaderResult");
    const count = $dataBox.find("tbody").find("tr").length;
    const errorNum = $dataBox.find("tbody").find(".dataError").length;
    const successNum = count - errorNum;
    const successPercent = computePercent(successNum, count);
    const errorPercent = computePercent(errorNum, count);
    let result = {
        "successNum": successNum,
        "errorNum": errorNum,
        "successPercent": successPercent + "%",
        "errorPercent": errorPercent + "%"
    };
    return result;
}

//取得副檔名
function getFileExtension(filename) {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
}

//計算小數點後第二位數
function computePercent(num, count) {
    const result = ((num / count) * 100).toFixed(2);
    return result;
}

//加入檔案標籤
function addFileTag(file) {
    const html = `
        <div class="addFile left">
            <i class="icon clip"></i>${file.name}
        </div>`
    return html;
}

//checkBox全選
function selectAllCheckBox(obj) {
    const $obj = $("#" + obj.id);
    const $option = $obj.find("input[type=checkbox]");
    const num = $("#ulSETLineRange").find("li").length;
    const openAll = obj.action === "open" ? true : false;
    let i = 0;
    while (i < num) {
        $option[i].checked = openAll;
        i++;
    }
}

//判斷陣列中是否有值
function arrHasData(arr, data) {
    const result = arr.indexOf(data);
    return result;
}

//判斷是否點擊全選
function handleCheck(self) {
    const isCheck = self.checked;
    const Obj = $(self).attr("name");
    mutation.setAllCheck(stateData, { item: 'isCheck', value: isCheck, obj: Obj });
}

//提示訊息呼叫
function alertSwal(content) {
    Swal.fire({
        icon: content.icon,
        title: content.title,
        text: content.text
    }).then(function (r) {
        ajaxStop();
        if (r.value) {
            return;
        }
    })
}

//移除清單饋線ITEM
function removeFeederItem(self) {
    const $self = $(self);
    $self.parent("li").remove();
}

//新增清單饋線ITEM
function addFeederItem(id, content) {
    const $obj = $("#" + id);
    const data = $($obj).val();
    const $content = $("#" + content);
    const item = `<li targetval="" data-item="${data}">${data}
        <span style="right:0;width:20px;height:20px;" onclick="removeFeederItem(this)">
            <img class="topology_removeitem" src="./images/ToolWindow/Topology/RubbishBin.svg" style="">
        </span>
    </li>`

    if (data !== "") {
        $content.append(item);
    } else {
        alertSwal({ icon: "warning", title: "無法新增", text: "請先輸入饋線編號" });
    }

}

//開啟or關閉內容編輯
function toggleEdit(obj, isOpen) {
    let dfd = $.Deferred();
    const $obj = $("#" + obj);

    function toggleContenteditable() {
        $obj.attr("contenteditable", isOpen);
        if (isOpen) {
            dfd.resolve({ title: '已開啟編輯', text: '您可以開始編輯' });
        } else {
            dfd.resolve({ title: '已儲存編輯', text: '編輯完成' });
        }
        return dfd.promise();
    }
    $.when(toggleContenteditable()).then(function (res) {
        alertSwal({ icon: "info", title: res.title, text: res.text });
    })
}

//清除html內容
function clearContent(obj) {
    const arr = Array.isArray(obj) ? obj : [];
    if (arr.length > 0) {
        arr.forEach(function (item) {
            $(item).html("");
        })
    }
}

function revertData(arr) {
    let result = {};
    result.data = [];
    let words;
    arr.forEach(function (v, i) {
        words = v.split(',');
        result.data.push(words);
    })
    return result;
}

//復原編輯
function revertEdit(content) {
    const data = stateData.SETTransfer;
    const obj = content === 'XML' ? "monitorTraneferData" : "monitorSystemData";
    const $content = $("#monitorSystemData").find("ul");
    clearContent([$content]);
    mutation.toggleIsLoad(stateData, { item: 'isload', value: 0 });
    loadList(data, obj);
}

//按鈕設定點擊狀態
function btnDisable(obj, isDisable) {
    const $obj = $(obj);
    if (isDisable) {
        $obj.addClass("isdisable");
    } else {
        $obj.removeClass("isdisable");
    }
    $obj.prop("disabled", isDisable);
}

//處理XML DATA Function
//寫入XML編輯區
function appendXML(data) {
    let _id = (data.content.split('>')[0]).split('"')[1];
    let isError = data.error.indexOf(_id) < 0 ? "normal" : "warn";
    let xml = `\n`;
    xml += `<pre class="${isError}" id="${_id}">`;
    xml += changeXMLData(data.content);
    xml += `</pre>`;
    xml += `\n`;
    return xml;
}
//XML檔案轉換
function changeXMLData(data) {
    result = data.replace(/[>][<][/]/g, '&gt;\n&lt;/').replace(/></g, '&gt;\n&nbsp;&nbsp;&lt;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return result;
}
//修復XML功能
function restoreXML() {
    const $tblListBox = $("#tblListBox");
    $tblListBox.find(".closed").remove();
    const listLength = $tblListBox.find(".resultList").length;
    $("#XMLDataBox").attr("contenteditable", false);
    swalTest({ id: 0, listLength: listLength });
}
//修復XML呼叫彈窗
function swalTest(obj) {
    let i = obj.id;
    const $feeder = $("#tblListBox").find(".resultList").eq(i).find(".resultFeeder").text();
    const $description = $("#tblListBox").find(".resultList").eq(i).find(".resultDescription").text();
    const $listNum = $("#tblListBox").find(".resultList").eq(i).find(".resultNum").text();
    const swalObj = switchObj($feeder, $listNum, $description);
    const swalData = {
        title: "轉檔異常",
        text: swalObj.text,
        confirmButtonText: swalObj.confirmButtonText,
    }
    if (swalObj.obj === "E02" || swalObj.obj === "E03") {
        swalData.denyButtonText = swalObj.denyButtonText;
        swalData.cancelButtonText = swalObj.cancelButtonText;
        swalData.showCancelButton = true;
        swalData.showDenyButton = true;
    }

    Swal.fire(swalData).then(function (res) {
        let errorObj = {
            id: i + 1,
            listLength: obj.listLength
        }
        switchfunction(swalObj.obj, res, $listNum, errorObj)
        if (errorObj.id < errorObj.listLength) {
            swalTest(errorObj);
        }
    })
}

//XML異常行為彈窗訊息
function switchObj(feeder, num, text) {
    let result = {};
    switch (true) {
        case text.indexOf("連結性異常") > -1:
            result.text = `${feeder}連結性異常,請檢查連結性表單`;
            result.obj = 'E01';
            result.confirmButtonText = '下一個';
            break;
        case text.indexOf("相別紀錄異常") > -1:
            result.text = `${num}相別轉換異常,請選擇`;
            result.obj = 'E02';
            result.confirmButtonText = '以連結性表單為準';
            result.denyButtonText = '以變壓器表單為準';
            result.cancelButtonText = '略過';
            break;
        case text.indexOf("開關狀態異常") > -1:
            result.text = `${num}開關狀態異常,請選擇`;
            result.obj = 'E03';
            result.confirmButtonText = '以一般開關處理';
            result.denyButtonText = '以常開開關處理';
            result.cancelButtonText = '略過';
            break;
        case text.indexOf("屬性值缺漏") > -1:
            result.text = `${num}屬性值缺漏,請檢查設備資料表或編輯XML`;
            result.obj = 'E04';
            result.confirmButtonText = '下一個';
            break;
    }
    return result;
}

//xml修復異常行為
function switchfunction(obj, res, listNum, errorObj) {
    switch (obj) {
        case "E01":
            console.log(`${obj}confirm`);
            //clearXMLErr(listNum);
            break;
        case "E02":
            if (res.isDenied) { convertErrE02(listNum, errorObj, true) }
            else if (res.isDismissed) { console.log(`${obj}confirm`) }
            else { convertErrE02(listNum, errorObj, false) }
            break;
        case "E03":
            if (res.isDenied) { convertErrE03(listNum, true) }
            else if (res.isDismissed) { console.log(`${obj}confirm`) }
            else { convertErrE03(listNum, false) }
            break;
        case "E04":
            console.log(`${obj}confirm`);
            //clearXMLErr(listNum);
            break;
    }
}

//異常轉換(相別轉換異常)
function convertErrE02(listNum, errorObj, isConvert) {
    const $obj = $("#tblListBox").find(`div[data-id=${listNum}]`);
    const $XMLDataBox = $("#XMLDataBox");
    const description = $obj.find(".resultDescription").text();
    const data = (description.replace(/\s*/g, "")).split("：");
    const arr = (data[0].split(":"))[1].split(",");
    const resourceUrl = "http://iec.ch/TC57/CIM100#PhaseCode."
    const target = $XMLDataBox.find(`#${listNum}`).text();
    const start = target.indexOf(resourceUrl);
    let oldData = target.substring(start + resourceUrl.length, start + resourceUrl.length + 3).split(/[/\/"\/>]/)[0];
    let replaceData = "";
    function setValue() {
        let $dfd = $.Deferred();
        if (isConvert) {
            arr.forEach(function (v) {
                if (v == 1) {
                    replaceData = "error";
                } else if (v == 2) {
                    replaceData += "A"
                } else if (v == 3) {
                    replaceData += "B"
                } else if (v == 4) {
                    replaceData += "C"
                }
            })
        }
        $dfd.resolve({ replaceData: replaceData });
        return $dfd.promise();
    }

    setValue().then(function (res) {
        let oldText = resourceUrl + oldData;
        let replaceText = resourceUrl + res.replaceData;
        if (res.replaceData.indexOf("error") > -1) {
            Swal.fire({
                icon: 'error',
                title: '資料有誤',
                text: '資料有誤，請手動修改',
                confirmButtonText: '確認'
            }).then(function () {
                if (errorObj.id < errorObj.listLength) {
                    swalTest(errorObj);
                }
            })
        } else {
            if (isConvert) {
                clearXMLErr(listNum, target.replace(oldText, replaceText));
            } else {
                clearXMLErr(listNum);
            }
        }
    })
}

//異常轉換(開關狀態異常)
function convertErrE03(listNum, isNormal) {
    const $XMLDataBox = $("#XMLDataBox");
    const target = $XMLDataBox.find(`#${listNum}`).text();
    if (isNormal) {
        clearXMLErr(listNum, target.replace("False", "True").replace("False", "True"));
    } else {
        clearXMLErr(listNum, target.replace("True", "False").replace("True", "False"));
    }
}

//已修復xml資訊檔代換
function clearXMLErr(listNum, text) {
    const $XMLDataBox = $("#XMLDataBox");
    if (typeof text === "string" && text !== "") {
        $XMLDataBox.find(`#${listNum}`).text(text);
    }
    $XMLDataBox.find(`#${listNum}`).removeClass("warn");
    $("#tblListBox").find(`div[data-id=${listNum}]`).addClass("closed");
    //$("#tblListBox").find(`div[data-id=${listNum}]`).remove();
}

//地圖饋線操作
function mapEvent(event) {
    let FeederLineTool = new GFeederLineGetFunction(HTMLContainer, earth_);
    switch (event) {
        case 'addFeederLine':
            FeederLineTool.addFeederLine("FeederLineRangeBox");
            break;
        case 'getFeederLine':
            FeederLineTool.getFeederLine();
            break;
    }
}

// 通訊點位比對-轉換SET檔內容
function getSETFeeder(arr) {
    let $dfd = $.Deferred();
    let feeder;
    arr.forEach(function (v) {
        coordinate = (v.split(',')[0]).split("-");
        feeder = v.split(',')[3];
        $("#setDataBox").append(`<li class="">${v}</li>`);
    })
    $dfd.resolve(feeder);
    return $dfd.promise();
}

//轉換設定-設備項目/項目屬性 取得選項
function setXMLItem() {
    $.when(getXMLSetting()).done(function (res) {
        const $ulSettingItem = $("#ulSettingItem");
        const $ulSettingAttribute = $("#ulSettingAttribute");
        const $selectAttrBox = $("#selectAttrBox");
        const objectexports = res[0].objectexports;
        const treeobjects = res[0].treeobjects;
        objectexports.forEach(function (v, i) {
            let isCheck = v.defaultvalue ? "checked" : "";
            let item = `<li targetval="">
                <input type="checkbox" id="${v.parameter}" name="${v.parameter}" value="${v.parameter}" ${isCheck}>
                <label for="${v.parameter}"></label>
                <span class="checkText">${v.text}</span>
            </li>`
            $ulSettingItem.append(item);
        })
        treeobjects.forEach(function (v, i) {
            let item = `<li><h6><i id="attribute${i}" onclick="toggleAttributeList(this)" class="icon link display"></i>${v.parenttext}</h6>
                <ul id="attributeList${i}" class="checkBoxList toggleList" style="display: none;">
                </li>`
            $ulSettingAttribute.append(item);
            $selectAttrBox.find("select").append(`<option value="${i}">${v.parenttext}</option>`);
        })
    }).then(function (res) {
        res[0].treeobjects.forEach(function (v, i) {
            let $attribute = $(`#attributeList${i}`);
            v.childrenobjects.forEach(function (a) {
                let isCheck = a.defaultvalue ? "checked" : "";
                let item = `<li targetval=${a.parameter} class="w-100">
                <input type="checkbox" id=${a.parameter} name=${a.parameter} value=${a.parameter} ${isCheck}>
                <label for=${a.parameter}></label>
                <span title=${a.childtext}>${a.childtext}</span>
                </li>`
                $attribute.append(item);
            })
        })
    }).fail(function (err) {
        console.log(err)
    })
}

//轉換設定-項目屬性 選取開啟項目
function openTreeobject() {
    const $selectBox = document.getElementById("XmltreeObject");
    const $ulSettingAttribute = $("#ulSettingAttribute");
    const selectedValue = $selectBox.options[$selectBox.selectedIndex].value;
    $ulSettingAttribute.animate({ scrollTop: selectedValue * 24 }, 200);
    if (selectedValue !== "all") {
        $(`#attribute${selectedValue}`).trigger("click");
    } else {
        $ulSettingAttribute.find("ul").removeClass("active");
        $ulSettingAttribute.find("h6").find(".icon").removeClass("hide").addClass("display");
    }
}

//轉換設定-項目屬性下拉選單切換滾動
function attributeChange(self) {
    const $obj = $(`#attribute${self.value}`);
    const $allList = $("#ulSettingAttribute");
    const $listIcon = $("#ulSettingAttribute").find("h6").find(".icon");
    const pos = (self.value) * 24;
    if (self.value === "all") {
        $allList.find("ul").removeClass("active");
        $listIcon.removeClass("hide").addClass("display");
        $allList.animate({ scrollTop: 0 });
    } else {
        $obj.trigger("click");
        $allList.animate({ scrollTop: pos });
    }
}

//取得電力共同資訊模型轉換清單
function getXMLData() {
    const $feederLineRangeBox = $("#FeederLineRangeBox");
    const $allTransfer = $("#allTransfer");
    const $ulSettingItem = $("#ulSettingItem");
    const $ulSettingAttribute = $("#ulSettingAttribute");
    let result = {};
    let feeder = [];

    const getCheckBoxData = function (self, obj) {
        if ($(self).find("input").is(':checked')) {
            obj[$(self).find("input").attr("id")] = true
        } else {
            obj[$(self).find("input").attr("id")] = false
        }
    }

    if ($allTransfer.is(':checked')) {
        feeder.push('all');
    } else {
        $feederLineRangeBox.find("li").each(function (v) {
            feeder.push($(this).attr("targetval"));
        });
    }

    $ulSettingItem.find("li").each(function (v) {
        getCheckBoxData(this, result);
    })

    $ulSettingAttribute.find(".checkBoxList").each(function (v) {
        $(this).find("li").each(function (v) {
            getCheckBoxData(this, result);
        });
    })

    result.feederList = feeder;
    return result;
}

function UploadFile(feederlistArr,callBack){
    let formData = new FormData();
    formData.append('feederlist', feederlistArr);
    formData.append('file', stateData.xmlFile);

    fetch('https://demo.supergeotek.com/FeederAnalysis/Transformation/SET', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
        if(callBack) callBack.call(eventOption.UploadXMLFile,response);
    })
}

function setErrorList(res){
    let $divSetResult = $("#divSetResult");
    res.errorlist.forEach(function(v){
        let isPosition = v.position === "" ? "closed" : "";
        let html = `
        <div class="resultList w-100 left">
            <ul class="left w-100">
                <li><span class="left">設備編號 - </span><span class="resultNum">${v.rdfid}</span></li>
                <li><span class="left">饋線編號 - </span><span class="resultFeeder">${v.feederid}</span></li>
                <li><span class="left">設備名稱 - </span><span class="resultDescription">${v.description}</span></li>
            </ul>
            <div class="left w-50 linkBox">
                <div class="w-100  ${isPosition}"><a href="https://demo.supergeotek.com/INERADMS_INTEGRATION/GISMAP/MAP?Method=Coordinate&Value=${v.position}" target="_blank">地圖定位</a></div>
                <div class="w-100"><a href="#${v.rdfid}">SET定位</a></div>
            </div>
        </div>`
        $divSetResult.append(html)
    })
}