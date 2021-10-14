function select(i) {
    var $switchTabTitle = $(".switch-tab-title")
    var $scrollBar = $(".scroll-bar")
    var tLabelWidth = $switchTabTitle.eq(0).width() + 20;
    var tBarWidth = $switchTabTitle.eq(i).width() + 20;
    $scrollBar.width(tBarWidth);
    $scrollBar.css("transform", "translate3d(" + (i * tLabelWidth) + "px, 0px, 0px)");
    switchDiv(i);
    setTableRange(i);
}
function switchDiv(i) {
    if (i == 0) {
        $(".systemAlertList").show();
        $(".filterLogicSetting").hide();
    }
    else {
        $(".systemAlertList").hide();
        $(".filterLogicSetting").show();
    }
}
function setTableRange(i) {
    var tHeaderH = $("#nav_major").height() + $("#nav_sub").height();
    if (i == 0) {
        var tPageTitle_set = $(".switch-tab").height() + $(".setupArea").height();
        $(".tabledisplay").css('height', 'calc(100vh - ' + tHeaderH + 'px - ' + tPageTitle_set + 'px - ' + $("footer").height() + 'px - 45px)');
    }
    else {
        var tPageTitle_alt = $(".switch-tab").height() + $(".alertArea").height();
        $(".alertTable").css('height', 'calc(100vh - ' + tHeaderH + 'px - ' + tPageTitle_alt + 'px - ' + $("footer").height() + 'px - 45px)');
    }
    //$(".messageTable").css('height', 'calc(100vh - ' + tPageTitle + 'px - ' + $("footer").height() + 'px - ' + tHeaderH + 'px)');
}

//建立邏輯設定表單
function getLogicData(isChange){
    const $logicSetting = $("#logicSetting");
    const tDataTitle = ['序號','篩選情境','狀態種類','動作種類1','動作種類2','描述','建立人員','觸發警示','啟用','管理'];
    let thead = `<thead><tr></tr></thead>`;
    let tbody = `<tbody></tbody>`;
    $logicSetting.append(thead,tbody);
    if( !isChange ){
        tDataTitle.forEach(function(v){
            $logicSetting.find("thead tr").eq(0).append(`<th>${v}</th>`);
        })
    }
    if(JSON.stringify(stateData.searchData) === '{}'){
        getLogicList();
    }else{
        getLogicList(stateData.searchData);
    }
}

//邏輯設定取得表單資料
function getLogicList(data){
    const $logicSetting = $("#logicSetting");
    const $selectLogic = $("#selectLogic");
    const $th_detail = $("#tabletest").find(`tbody`).find('tr').eq(1).find(`th`).eq(1);
    let num,arr;
    $logicSetting.find("tbody").html("");
    $selectLogic.html("").append(`<option value="-999">請選擇邏輯</option>`);
    $.when(getLogicSetting(data)).done(function (res) {
        num  = $(".pageSelect").val();
        arr = pageController(num,res);
        if(!data){
            res.forEach(v => {
                $selectLogic.append(`<option title=${v.scenario},${v.description} value=${v.logic}>邏輯${v.logic}</option>`);
                mutation.setLogicList(stateData,{item:`${v.logic}`,value:`${v.scenario},${v.description}`});
                if($th_detail.data("logic") == `${v.logic}`){
                    $th_detail.attr("title",`${v.scenario},${v.description}`)
                };
            });
        }
        if(arr.length > 0){
            arr.forEach(function(v,i){
                const triggeralarm = v.triggeralarm ? `<i class="icon success"></i>開啟` : `<i class="icon error"></i>關閉`
                const status = v.status ? `<i class="icon success"></i>啟用中` : `<i class="icon error"></i>停用中`
                $logicSetting.find("tbody").append(
                    `<tr data-logic=${v.logic}><td>${v.logic}</td><td>${v.scenario}</td><td>${v.t}</td><td>${v.x}</td><td>${v.yorz}</td><td>${v.description}</td><td>${v.estab}</td><td data-triggeralarm="${v.triggeralarm}">${triggeralarm}</td><td data-status="${v.status}">${status}</td><td><i class="icon delete link" data-event="delete" onclick="logicSettingEvent(this)"></i><i class="icon edit link" onclick="editLogic(this)"></i></td></tr>`
                );
            })
        }else{
            alertSwal({ icon: "warning", title: "搜尋錯誤", text: "無搜尋結果" });
        }
    }).fail(function(error){
        console.log(error)
    });
}

//設定搜尋DATA
function searchLogicSetting(){
    let data = {
        "scenario": $("#selectScenario").val(),
        "t": $("#inputStatus").val(),
        "x": $("#inputAction1").val(),
        "yorz": $("#inputAction2").val(),
        "estab": $("#createMember").val(),
        "triggeralarm": $("#alertStatus").val(),
        "status": $("#startStatus").val(),
    }
    mutation.setSearchData(stateData,{item:'searchData',value:data});
    getLogicList(data);
}

//表單排序與每頁顯示行數
function pageController(num,data){
    let result = [];
    let line,pageEnd,pageStart;
    const $totalLogicPage = $("#totalLogicPage");
    const windowWidth = document.body.clientWidth;
    switch(true){
        case (windowWidth > 1600):
            line = 10;
            break;
        case (windowWidth > 1440):
            line = 8;
            break;
        case (windowWidth > 1280):
            line = 5;
            break;
        default:
            line = 4;
            break;
    }
    pageEnd = num*line - 1;
    pageStart = num*line - line;
    data.sort(function(a, b) {
        return a.logic - b.logic;
    });
    data.forEach(function(v,i){
        if(i<=pageEnd && i>=pageStart){
            result.push(v)
        }
    })
    $totalLogicPage.text(Math.ceil(data.length/line));
    return result;
}

//切換頁數功能
function setPageNum(obj){
    const pageNum = $("#totalLogicPage").text();
    const $modalMsg = $("#modalMsg");
    const $warningMsg = $("#warningMsg");
    const $pageSelect = $(".pageSelect");
    const pageSelectVal = $(".pageSelect").val();
    const act = $(obj).data("btn");
    if(act==="add"){
        if(parseInt(pageSelectVal) == pageNum){
            $modalMsg.text("已是最後一頁");
            $warningMsg.modal('toggle');
        }else{
            $pageSelect.val(parseInt(pageSelectVal) + 1);
        }
    }else if(act==="reduce"){
        if (parseInt(pageSelectVal) == 1) {
            $modalMsg.text("已是第一頁");
            $warningMsg.modal('toggle');
        }else{
            $pageSelect.val(parseInt(pageSelectVal) - 1);
        }
    }
    $("#logicSetting").find('tbody').remove();
    getLogicData(true);
}

//邏輯設定操作事件(新增 修改 刪除)
function logicSettingEvent(s){
    //var dfd = $.Deferred();
    let action = $(s).data("event");
    let scenario = $("#scenario").val();
    let estab = stateData.userName;
    let logic = $("#addAlert").data("logic");
    let triggeralarm = $('input[name="isAlert"]:checked').data("value");
    let status = $('input[name="isOpen"]:checked').data("value");
    let descript = $("#logicDescription").val();
    let t =  $("#logicStatus").val();
    let x =  $("#action1").val();
    let yorz =  $("#action2").val();
    let data = {
        "scenario": scenario,
        "t": t,
        "x": x,
        "yorz": yorz,
        "description": descript,
        "estab": estab,
        "triggeralarm": triggeralarm,
        "status": status,
    }
    let deleteData = {
        "logic": $(s).parents("tr").data("logic"),
        "logicdelete": true
    }
    let editData = {
        "logic": logic,
        "scenario": scenario,
        "t": t,
        "x": x,
        "yorz": yorz,
        "description": descript,
        "estab": estab,
        "triggeralarm": triggeralarm,
        "status": status,
    }
    if(action === "add"){
        $.when(addFilterCondition(data)).done(function(res){
            logicSettingEventAlert({'type':'新增'})
        }).fail(function(err){
            console.log(err);
        })
    }else if(action === "edit"){
        $.when(updateFilterCondition(editData)).done(function(res){   
            logicSettingEventAlert({'type':"編輯"})
        }).fail(function(err){
            console.log(err);
        })
    }else if(action === "delete"){
        deleteLogicAlert(function(){
            $.when(updateFilterCondition(deleteData)).done(function(res){   
                logicSettingEventAlert({'type':"刪除"})
            }).fail(function(err){
                console.log(err);
            })
        });
    }
}

//編輯取得原有邏輯DATA
function editLogic(s){
    const $content = $(s).parents("tr").find("td");
    let res = {
        "logic":$content.eq(0).text(),
        "scenario":$content.eq(1).text(),
        "t":$content.eq(2).text(),
        "x":$content.eq(3).text(),
        "yorz":$content.eq(4).text(),
        "description":$content.eq(5).text(),
        "estab":$content.eq(6).text(),
        "triggeralarm":$content.eq(7).data("triggeralarm"),
        "status":$content.eq(8).data("status"),
    }
    addAlertModal({type:'編輯',data:res});
}

//開啟編輯視窗
function addAlertModal(obj){
    const $addalertModal = $('#addalert_modal');
    const modalData = obj.data;
    const modalText = obj.type;
    $addalertModal.modal({backdrop: 'static'});
    $addalertModal.find("h6").text(`${modalText}篩選邏輯`);
    
    if(obj.data){
        $addalertModal.find("#addAlert").data({"logic":modalData.logic,"event":"edit"});
        $addalertModal.find("#scenario").val(modalData.scenario).change();
        $addalertModal.find("#logicStatus").val(modalData.t);
        $addalertModal.find("#action1").val(modalData.x);
        $addalertModal.find("#action2").val(modalData.yorz);
        $addalertModal.find("#logicDescription").val(modalData.description);
        if(modalData.triggeralarm){
            $('input[name="isAlert"]')[0].checked = true;
        }else{
            $('input[name="isAlert"]')[1].checked = true;
        }
        if(modalData.status){
            $('input[name="isOpen"]')[0].checked = true;
        }else{
            $('input[name="isOpen"]')[1].checked = true;
        }
    }else{
        $addalertModal.find("#addAlert").data("event","add");
        $addalertModal.find("input").val("");
        $addalertModal.find("#scenario").val("-999");
        $('input[name="isAlert"]')[0].checked = true;
        $('input[name="isOpen"]')[0].checked = true;
    }
}

//邏輯提示訊息(新增 編輯 刪除)
function logicSettingEventAlert(obj) {
    swal.fire({
        title: `<b class="alertTitle">${obj.type}邏輯</b>`,
        html: `<span>邏輯已經${obj.type}</span>`,
        showCloseButton: true,
        confirmButtonText: '確定',
        confirmButtonClass: "submitBtn1 w-40",
        customClass: 'swal-wide'
    }).then(function () {
        $('#addalert_modal').modal('hide');
        getLogicList();
    });
}

//邏輯提示訊息(刪除)
function deleteLogicAlert(callback){
    swal.fire({
        title: '<b class="alertTitle modal-title fs24 fw700">刪除邏輯</b>',
        html:
            '<span>確定要將此篩選邏輯移除嗎？</span>',
        showCloseButton: true,
        showCancelButton: true,
        reverseButtons: true,
        cancelButtonText:'取消',
        confirmButtonText:'確定',
        confirmButtonColor: "#4C7DA2",
        cancelButtonColor: "#C2D9EA",
        customClass: 'swal-wide',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
        }).then(function(res){
            if(res.value){
                callback();
            }
        }
    )
}

function hideTag(){
    const $switchTab = $("#switchTab");
    $switchTab.find("div").eq(1).hide();
    $switchTab.find(".scroll-bar").hide();
}




