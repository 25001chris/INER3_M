$(document).ready(function () {
    ControllerName = $("#hf_ControllerName").val();
    ActionName = $("#hf_ActionName").val();
    RootUrl = $("#hf_RootUrl").val();
    if (RootUrl === "/") RootUrl = "";

    //Hamburger Button
    $('.navbar-toggler').on('click', function () {
        $('.animated-icon').toggleClass('open');
    });

    //行動版導航列自動收合
    $(window).scroll(function () {
        if ($(window).width() < 768) {
            $('.animated-icon').removeClass('open');
            $(".navbar-collapse").removeClass("show");
        }
    });

    //點擊非導覽列處自動收合
    $("#div_SystemMa").mouseup(function () {
        if ($(window).width() < 768) {
            $('.animated-icon').removeClass('open');
            $(".navbar-collapse").removeClass("show");
        }
    });

    //ICON圖示更換、子導覽列隱藏
    if ($(window).width() < 768) {
        $("#nav_mobile").removeAttr("hidden");  //漢堡選單導覽列顯出
        $("#nav_major, #nav_sub").attr("hidden", "hidden");  //主、子導覽列隱藏
        $(".btn-print.xs").removeAttr("hidden");  //系統操作紀錄-列印按鈕(分頁左邊)顯出
        $(".btn-print.md").attr("hidden", "hidden");  //系統操作紀錄-(登出按鈕下)隱藏
        $("#myModal2 .md").attr("hidden", "hidden");
        $("#myModal2 .xs").removeAttr("hidden");
    }
    else {
        $("#nav_mobile").attr("hidden", "hidden");  //漢堡選單導覽列隱藏
        $("#nav_major, #nav_sub").removeAttr("hidden");  //主、子導覽列顯出
        $(".btn-print.xs").attr("hidden", "hidden");  //系統操作紀錄-列印按鈕(分頁左邊)隱藏
        $(".btn-print.md").removeAttr("hidden");  //系統操作紀錄-(登出按鈕下)顯出
        $("#myModal2 .md").removeAttr("hidden");
        $("#myModal2 .xs").attr("hidden", "hidden");
    }
    //行動裝置畫面轉向時(直立轉橫)
    $(window).resize(function () {
        if ($(window).width() < 768) {
            $("#nav_mobile").removeAttr("hidden");
            $("#nav_major, #nav_sub").attr("hidden", "hidden");
            $(".btn-print.xs").removeAttr("hidden");
            $(".btn-print.md").attr("hidden", "hidden");
            $("#myModal2 .md").attr("hidden", "hidden");
            $("#myModal2 .xs").removeAttr("hidden");
        }
        else {
            $("#nav_mobile").attr("hidden", "hidden");
            $("#nav_major, #nav_sub").removeAttr("hidden");
            $(".btn-print.xs").attr("hidden", "hidden");
            $(".btn-print.md").removeAttr("hidden");
            $("#myModal2 .md").removeAttr("hidden");
            $("#myModal2 .xs").attr("hidden", "hidden");
        }
    });
});

//呼叫PartialView局部更新、光棒條標示
function Authority_RenderAjax(href) {
    //開啟Loading遮罩
    ajaxStart();

    post = {};  //清空選擇條件
    var ActionName;
    if (href.indexOf("AccountMa") !== -1) ActionName = "AccountMa";
    else if (href.indexOf("AuthGroupMa") !== -1) ActionName = "AuthGroupMa";

    var url = href;
    $.ajax({
        url: url,
        success: function (result) {
            $("#div_Authority_content").html(result);
            //Authority_RenderAjax_LightStickChange(ActionName);
        },
        error: function (msg) {
            alert("取得畫面資料失敗！");
        },
        complete: function () {
            //關閉Loading遮罩
            ajaxStop();
        }
    });
}

function Authority_RenderAjax_LightStickChange(ActionName) {
    //$("#div_SystemMa a[id$='" + ActionName + "']").addClass("font-weight-bold");
    //$("#div_SystemMa a:not([id$='" + ActionName + "'])").removeClass("font-weight-bold");
    $("#div_SystemMa a div[id$='" + ActionName + "']").removeClass("reset").addClass("LightStick");
    $("#div_SystemMa a :not(div[id$='" + ActionName + "'])").removeClass("LightStick").addClass("reset");
}

//分頁Ajax處理
function AjaxPagination(total, current, url, postdata) {
    if (total > 1) {
        $('#page-selection').bootpag({
            total: total,
            page: current,
            maxVisible: 5,
            firstLastUse: total > 5,
            first: '««',
            last: '»»'
        }).on("page", function (event, /* page number here */ num) {
            ajaxStart();
            $.ajax({
                url: url + "/" + num,
                data: postdata === undefined ? post : postdata,
                success: function (result) {
                    if (url.indexOf("AccountMa") !== -1 || url.indexOf("AuthGroupMa") !== -1) {
                        $("#div_Authority_content").empty().html(result);  //子頁籤控制，統一整頁更新
                    }
                    else {
                        $("#div_" + ActionName + "_table").empty().html(result);
                    }
                },
                error: function (msg) {
                    alert("取得畫面資料失敗！");
                },
                complete: function () {
                    //關閉Loading遮罩
                    ajaxStop();
                }
            });
        });
    }
    else {
        $('#page-selection').empty();
    }
}

post = {};  //[全域]搜尋條件
post_modal = {};  //[全域]搜尋條件 for modal right fade
//搜尋
function Search(url, postdata) {
    ajaxStart();
    $.ajax({
        url: url + "/1",
        data: postdata,
        success: function (result) {
            if (url.indexOf("AccountMa") !== -1 || url.indexOf("AuthGroupMa") !== -1) {
                $("#div_Authority_content").empty().html(result);  //子頁籤控制，統一整頁更新
            }
            else {
                $("#div_" + ActionName + "_table").empty().html(result);
            }
            post = postdata;
            AjaxPagination($("#hf_PageTotal").val(), 1, url, post);  //重新綁定分頁控制項
        },
        error: function (msg) {
            alert("取得畫面資料失敗！");
        },
        complete: function () {
            //關閉Loading遮罩
            ajaxStop();
        }
    });
}

//modal right fade資料初始化
function InitialHistoryDetail(url, postdata) {
    ajaxStart();
    $.ajax({
        url: url + "/1",
        data: postdata,
        async: false,
        success: function (result) {
            //$("[name^=startdate]:not([hidden])").val("");
            //$("[name^=enddate]:not([hidden])").val("");
            $("#div_HistoryDetail").empty().html(result);
            post_modal = postdata;
            AjaxPagination2($("#hf_PageTotal_Modal").val(), 1, url, post_modal);
            //if (postdata.IsExport !== undefined && postdata.IsExport) {
            //    window.location.href = location.href;
            //    alert("資料匯出成功！");
            //}
        },
        error: function (msg) {
            alert("取得畫面資料失敗！");
        },
        complete: function () {
            //關閉Loading遮罩
            ajaxStop();
        }
    });
}

function Export(url, postdata) {
    ajaxStart();
    $.ajax({
        url: url,
        data: postdata,
        success: function (result) {
            if (result.Status !== undefined && !result.Status) {
                alert(result.Message);
            }
            else {
                window.location.href = this.url;
                //alert("資料匯出成功！");
            }
        },
        error: function (msg) {
            alert("取得畫面資料失敗！");
        },
        complete: function () {
            //關閉Loading遮罩
            ajaxStop();
        }
    });
}

//分頁Ajax處理(for modal right fade)
function AjaxPagination2(total, current, url, postdata) {
    if (total > 1) {
        $('#page-selection2').bootpag({
            total: total,
            page: current,
            maxVisible: 5,
            firstLastUse: total > 5,
            first: '««',
            last: '»»'
        }).on("page", function (event, /* page number here */ num) {
            ajaxStart();
            $.ajax({
                url: url + "/" + num,
                data: postdata === undefined ? post_modal : postdata,
                success: function (result) {
                    $("#div_HistoryDetail").html(result);
                },
                error: function (msg) {
                    alert("取得畫面資料失敗！");
                },
                complete: function () {
                    //關閉Loading遮罩
                    ajaxStop();
                }
            });
        });
    }
    else {
        $('#page-selection2').empty();
    }
}

//產生bootstrap日期選擇器(需指定屬性id、class、data-toggle、data-target)
function RenderBsDatepicker() {
    $("#startdate.datepicker,#startdate2.datepicker,#enddate.datepicker,#enddate2.datepicker").datetimepicker({
        locale: "zh-tw",
        format: 'yyyy-MM-DD',
        //timepicker: false,
        buttons: {
            showToday: false
        }
    });

    $("#startdate, #startdate2").blur(function () {
        $("#enddate, #enddate2").datetimepicker("minDate", $(this).val());
        $(this).datetimepicker('hide');
    });

    $("#enddate, #enddate2").blur(function () {
        $("#startdate, #startdate2").datetimepicker("maxDate", $(this).val());
        $(this).datetimepicker('hide');
    });

    $("#startdate_history.datepicker, #enddate_history.datepicker").datetimepicker({

        sideBySide: true,
        locale: "zh-tw",
        format: 'yyyy-MM-DD HH:mm:ss',
        //timepicker: false,        
    });

    $("#startdate_history").blur(function () {
        $("#enddate_history").datetimepicker("minDate", $(this).val());
        $(this).datetimepicker('hide');
    });

    $("#enddate_history").blur(function () {
        $("#startdate_history").datetimepicker("maxDate", $(this).val());
        $(this).datetimepicker('hide');
    });

    $("#estStartDate.datepicker").datetimepicker({

        sideBySide: true,
        locale: "zh-tw",
        format: 'yyyy-MM-DD HH:mm',
        defaultDate: moment().subtract(7, 'd').format('yyyy-MM-DD 00:00')
        //timepicker: false
    });

    $("#estEndDate.datepicker").datetimepicker({

        sideBySide: true,
        locale: "zh-tw",
        format: 'yyyy-MM-DD HH:mm',
        defaultDate: moment().format('yyyy-MM-DD HH:mm')
        //timepicker: false
    });

    $("#estStartDate").blur(function () {
        $("#estEndDate").datetimepicker("minDate", $(this).val());
        $(this).datetimepicker('hide');
    });

    $("#estEndDate").blur(function () {
        $("#estStartDate").datetimepicker("maxDate", $(this).val());
        $(this).datetimepicker('hide');
    });



    //Ajax重複執行會異常，註解
    //$.fn.datetimepicker.Constructor.Default = $.extend({},
    //    $.fn.datetimepicker.Constructor.Default,
    //    {
    //        icons:
    //        {
    //            time: 'fas fa-clock',
    //            date: 'fas fa-calendar',
    //            up: 'fas fa-arrow-up',
    //            down: 'fas fa-arrow-down',
    //            previous: 'fas fa-arrow-circle-left',
    //            next: 'fas fa-arrow-circle-right',
    //            today: 'far fa-calendar-check-o',
    //            clear: 'fas fa-trash',
    //            close: 'far fa-times'
    //        }
    //    });
}

//行動裝置導覽列切換顯示子項目、背景變色
function toogleMobileSubItem(type, _this) {
    let item = $("." + type + "-item");
    if (item.hasClass("d-none")) {
        item.removeClass("d-none");
        $(_this).addClass("custom-bgcolor-expansion");
    }
    else {
        item.addClass("d-none");
        $(_this).removeClass("custom-bgcolor-expansion");
    }
}

//開啟Loading遮罩
function ajaxStart() {
    $.blockUI({
        message: "讀取中...",
        css: {
            fontSize: '20px',
            fontWeight: 'bold',
            border: 'none',
            padding: '15px',
            backgroundColor: '#4C7DA2',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .8,
            color: '#fff'
        }
    });
}

//關閉Loading遮罩
function ajaxStop() {
    $.unblockUI();
}

function SwitchMobileSystemMenu() {
    if ($("div.MobilePopupFunctionMenu").is(":visible")) {
        $("div.MobilePopupFunctionMenu").hide();
        $("a.MobileSystemMenu").find("img").prop("src", "images/Close.svg");
    } else {
        $("div.MobilePopupFunctionMenu").show();
        $("a.MobileSystemMenu").find("img").prop("src", "images/Mobile/SystemMenu.svg");
    }
}