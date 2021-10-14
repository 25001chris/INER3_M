eventOption = {
    openXML : {
        beforeCallBack:function(e){
            const $self = $(e);
            const content = "#" + $self.data("box");
            $self.siblings(".addFile").remove();
            clearContent([$("#divSetResult"), $(content)]);
        },
        successCallBack:function(e,result,file){
            const $self = $(e);
            const content = "#" + $self.data("box");
            const $setConvertBtn = $("#setConvertBtn").find("button");
            const $btnTransferSET = $("#btnTransferSET");
            $self.siblings(".mainTitle").after(addFileTag(file));
            mutation.setXMLFileData(stateData, { item: 'xmlFile', value: file });
            let arr = getFeederId(result);
            arr.forEach(function (v, i) {
                let html = `<li targetval="">
                    <input type="checkbox" id="a${i}" name="" value="${v}" checked>
                    <label for="a${i}"></label>
                    <span class="checkText">${v}</span>
                </li>`
                $(content).append(html);
            })
            btnDisable($setConvertBtn, true);
            btnDisable($btnTransferSET, false);
        },
        errorCallBack:function(e){
            const $setConvertBtn = $("#setConvertBtn").find("button");
            const $btnTransferSET = $("#btnTransferSET");
            alertSwal({ icon: "warning", title: "檔案錯誤", text: "必須是XML檔案" });
            btnDisable($setConvertBtn, false);
            btnDisable($btnTransferSET, true);
        }
    },
    UploadXMLFile : {
        XMLToSET:function(res){
            let $monitorSystemData = "monitorSystemData";
            setErrorList(res);
            loadList(res, $monitorSystemData);
            mutation.setSETTransfer(stateData,{item:'SETTransfer',value:res})
            ajaxStop();
        },
        XMLFileData:function(res){
            let dfd = $.Deferred();
            let data = "";
            res.content.forEach(function(v){
                let feeder = v.split(",")
                let feederId = $("#selectXMLSETBox").find("select").val();
                if(feeder[3] == feederId){
                    data += `${v},\r\n`
                }
            });
            dfd.resolve(data);
            return dfd.promise();
        },
        XMLToFeederDiagram:function(res){
            this.XMLFileData(res).then(function(data){
                if(data){
                    const binaryData = encodeURI(data);
                    const base64String = window.btoa(unescape(binaryData));
                    DrawFeederDiagramData(base64String);
                }else{
                    const $btnTransfer = $("#btnTransfer");
                    const $selectXMLSETBox = $("#selectXMLSETBox");
                    $selectXMLSETBox.find("select option").remove(".feederId").find("span em").text("");
                    alertSwal({ icon: "warning", title: "檔案錯誤", text: "請選擇饋線編號" });
                    btnDisable($btnTransfer, false);
                }
            })
        }
    }
}