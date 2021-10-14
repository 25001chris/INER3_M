//取得通訊點位清單
function getAiDiQuery(data) {
    let dfd = $.Deferred();
    $.get(`https://demo.supergeotek.com/ineradms_integration/REST/AiDiQuery/${data}`, function (res) {
        dfd.resolve(res);
    }).fail(function (e) {
        dfd.reject(e);
    })
    return dfd.promise();
}

//取得XML轉換設定項目
function getXMLSetting() {
    let dfd = $.Deferred();
    $.get(`https://demo.supergeotek.com/ineradms_integration/REST/GetXMLSettings`, function (res) {
        dfd.resolve(res);
    }).fail(function (e) {
        dfd.reject(e);
    })
    return dfd.promise();
}

function addFilterCondition(data){
    let dfd = $.Deferred();
    $.post(`https://demo.supergeotek.com/ineradms_integration/REST/InsertFilterCondition`, data, function (res) {
        dfd.resolve(res);
    }).fail(function (e) {
        dfd.reject(e);
    })
    return dfd.promise();
}

function setXMLDemo(){
    let dfd = $.Deferred();
    $.post(`https://demo.supergeotek.com/FeederAnalysis/Transformation/XMLDemo`, function (res) {
        dfd.resolve(res);
    }).fail(function (e) {
        dfd.reject(e);
    })
    return dfd.promise();
}

function recoveryXMLDemo(){
    let dfd = $.Deferred();
    $.post(`https://demo.supergeotek.com/FeederAnalysis/Transformation/XMLRecovery`, function (res) {
        dfd.resolve(res);
    }).fail(function (e) {
        dfd.reject(e);
    })
    return dfd.promise();
}

function updateFilterCondition(data){
    let dfd = $.Deferred();
    $.ajax({
        url: `https://demo.supergeotek.com/ineradms_integration/REST/UpdateFilterCondition`,
        type: 'PATCH',
        data: data
    }).done(function (res) {
        dfd.resolve(res);
    }).fail(function (e) {
        dfd.reject(e);
    })
    return dfd.promise();
}

//邏輯設定取得表單傳入數值
function getLogicSetting(obj){
    let dfd = $.Deferred();
    let defaultData = {
        "scenario": "",
        "t": "",
        "x": "",
        "yorz": "",
        "estab": "",
        "triggeralarm": "",
        "status": "",
    }
    let data = !obj ? defaultData : obj;
    $.get(`https://demo.supergeotek.com/ineradms_integration/REST/GetFilterCondition?scenario=${data.scenario}&t=${data.t}&x=${data.x}&yorz=${data.yorz}&estab=${data.estab}&triggeralarm=${data.triggeralarm}&status=${data.status}`, function (res) {
        dfd.resolve(res);
    }).fail(function (e) {
        dfd.reject(e);
    })
    return dfd.promise();
}

function getXMLList(data){
    let dfd = $.Deferred();
    $.post(`https://demo.supergeotek.com/FeederAnalysis/Transformation/XML`,data, function (res) {
        dfd.resolve(res);
    }).fail(function (e) {
        dfd.reject(e);
    })
    return dfd.promise();
}