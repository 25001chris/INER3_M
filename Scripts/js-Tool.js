$(document).ready(function () {
    //Email
    $("#modal_user_mail").change(function () { jsTool_Email(this); });
});

/*判斷Email格式*/
function jsTool_Email(_this) {
    emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    let msg = "";

    if (_this.val() !== '') {
        if (_this.val().search(emailRule) === -1) {
            msg = "請輸入正確格式e-mail";
            RenderBootstrapTooltip(_this, msg);
        }
    }

    return msg;
}

/* 判斷必填
 * 需判斷必填之欄位需註冊 CusRequired Class
 * 並設定 data-CusRequired 訊息欄位名稱
 */
function jsTool_CusRequired() {
    var msg = "";
    var chk = [];

    $('.CusRequired').each(function (index, item) {
        if ($(this).val() === "" && !chk.some(e => e === $(this).data('cusrequired'))) {
            msg = '『' + $(this).data('cusrequired') + '』不得為空!' + " <br />";
            $(this).siblings(".icon").removeClass("closed");
            RenderBootstrapTooltip(item, msg);
            chk.push($(this).data('cusrequired'));
        }else{
            $(this).siblings(".icon").addClass("closed");
        }
    });

    return msg;
}

/* 驗證日期
 * 需判斷之欄位需註冊 CusValidateDate Class
 * 並設定 data-CusRequired 訊息欄位名稱
 */
function jsTool_ValidateDate() {
    var msg = "";
    var val;

    $('.CusValidateDate').each(function () {
        val = $(this).val();
        if (!/^[1-9]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$/.test(val)) {
            var newValue = /^[1-9]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$/.exec(val);
            if (newValue !== null) {
                $(this).val(newValue);
            }
            else {
                if (val !== "") {
                    $(this).css("color", "red");
                    msg += '『' + $(this).data('cusrequired') + '』日期格式不正確，必須為yyyy/MM/dd!' + " <br />";
                }
            }
        }
    });

    return msg;
}

/* 驗證手機號碼
 * 需判斷之欄位需註冊 CusValidatePhoneNum Class
 * 並設定 data-CusRequired 訊息欄位名稱
 */
function jsTool_ValidatePhoneNum() {
    var msg = "";
    var val;

    $('.CusValidatePhoneNum').each(function () {
        val = $(this).val();
        if (!/^(([0-9]{4}-[0-9]{3}-[0-9]{3})|([0-9]{10}))$/.test(val)) {
            var newValue = /^(([0-9]{4}-[0-9]{3}-[0-9]{3})|([0-9]{10}))$/.exec(val);
            if (newValue !== null) {
                $(this).val(newValue);
            }
            else {
                if (val !== "") {
                    //$(this).css("color", "red");
                    msg = '『' + $(this).data('cusrequired') + '』手機號碼格式必須為十碼 0123-456-789 或 0123456789 !' + " <br />";
                    RenderBootstrapTooltip($(this), msg);
                }
            }
        }
    });

    return msg;
}

/* 驗證帳號英數字
 * 需判斷之欄位需註冊 CusValidateAccount Class
 * 並設定 data-CusRequired 訊息欄位名稱
 */
function jsTool_ValidateAccount() {
    let msg = "";

    $('.CusValidateAccount').each(function (index, item) {
        let val = $(item).val();
        if (!/^[A-Za-z0-9]+$/.test(val)) {
            var newValue = /^[A-Za-z0-9]+$/.exec(val);
            if (newValue !== null) {
                $(item).val(newValue);
            }
            else {
                if (val !== "") {
                    //$(item).css("color", "red");
                    msg = "請輸入英數字";
                    RenderBootstrapTooltip(item, msg);
                }
            }
        }
    });

    return msg;
}

/* 驗證密碼長度、英數字
 * 需判斷之欄位需註冊 CusValidatePWD Class
 * 並設定 data-CusRequired 訊息欄位名稱
 */
function jsTool_ValidatePWD() {
    let msg = "";

    $('.CusValidatePWD:not([readonly])').each(function (index, item) {
        if ($(item).val().length < 8 || $(item).val().length > 15) {
            //$(item).css("color", "red");
            msg = "長度需介於 8-15 位";
            $(this).siblings(".icon").removeClass("closed");
            RenderBootstrapTooltip(item, msg);
        }
        else {
            let val = $(item).val();
            $(this).siblings(".icon").addClass("closed");
            if (!/^[A-Za-z0-9]+$/.test(val)) {
                var newValue = /^[A-Za-z0-9]+$/.exec(val);
                if (newValue !== null) {
                    $(item).val(newValue);
                }
                else {
                    if (val !== "") {
                        //$(item).css("color", "red");
                        msg = "請輸入英數字";
                        RenderBootstrapTooltip(item, msg);
                    }
                }
            }
        }
    });

    return msg;
}

var queryString = window.location.search.replace("?", "");

//接取網頁參數
function jsTool_request(name) {
    var a = queryString.indexOf(name + "=");	//找參數開頭
    var b = queryString.indexOf("&", a);	//找參數結尾
    if (a === -1) return null;
    else if (b === -1) return queryString.substring(a).replace(name + "=", "");  //表示是最後的參數
    else return queryString.substring(a, b).replace(name + "=", "");
}

//組參數
function jsTool_loadRequsetParaByPage(data) {
    let requsetParaByPage = '';
    for (let k in data) {
        if (data[k] !== null && data[k] !== '') {
            if (requsetParaByPage === '') {
                requsetParaByPage += '?' + k + '=' + data[k];
            } else {
                requsetParaByPage += '&' + k + '=' + data[k];
            }
        }
    }
    return requsetParaByPage;
}

//bootstrap tooltip顯出卡控驗證訊息，需設定屬性data-toggle='tooltip'、title
function RenderBootstrapTooltip(_this, msg) {
    $(_this).tooltip("show");
    //需待CSS過渡完畢tooltip才可以改變樣式
    $(_this).on('shown.bs.tooltip', function () {
        let id = $(_this).attr("aria-describedby");  //取得該元素的tooltip id
        //$("#" + id).css("left", "60px");
        document.styleSheets[0].addRule('#' + id + ' .arrow::before', 'border-bottom-color: #D0EAEC !important');
        document.styleSheets[0].addRule('#' + id + ' .arrow::before', 'border-top-color: #D0EAEC !important');
        $("#" + id + " .tooltip-inner").css("color", "#000000");
        $("#" + id + " .tooltip-inner").css("background-color", "#D0EAEC");
        $("#" + id + " .tooltip-inner").html(msg);
    });
}