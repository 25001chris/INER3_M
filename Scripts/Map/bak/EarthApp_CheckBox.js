/**
 * 自定義CheckBox
 * @param {string} IMGElementID 作為CheckBox勾選和不勾選的標示的IMG元件ID
 * @param {string} LabelElementID 作為CheckBox後面文字顯示用的Label元件ID
 * @param {any} InitCallback 初始化時要執行的流程
 * @param {any} CheckChangedCallBack 勾選狀態變了之後要執行的流程
 */
var EarthAppCheckBox = function (IMGElementID, LabelElementID, InitCallback, CheckChangedCallBack) {
    var that = this;
    /**
     * 作為CheckBox勾選和不勾選的標示的IMG元件ID
     * */
    this.TargetImg = IMGElementID;
    /**
     * 作為CheckBox勾選和不勾選的標示的文字標示Label元件ID
     * */
    this.TargetLabel = LabelElementID;
    /**
     * 目前是否被勾選
     * */
    this.Checked = function () {
        return ($("#" + this.TargetImg).attr("src").toUpperCase().endsWith("Y.SVG"));
    };
    var that = this;
    /***************************************************************************
     * 下方是必經流程
     * ************************************************************************/
    $("#" + this.TargetImg).click(function () {
        if (!that.Checked()) {
            $(this).prop("src", "../images/InputReplacement/Checkbox/Y.svg");
        } else {
            $(this).prop("src", "../images/InputReplacement/Checkbox/N.svg");
        }
        if (CheckChangedCallBack) {
            CheckChangedCallBack();
        }
    });
    if (this.TargetLabel != null) {
        $("#"+this.TargetLabel).click(function () {
            $("#" + that.TargetImg).trigger("click");
        });
    }
    $("#" + this.TargetImg).prop("src", "../images/InputReplacement/Checkbox/N.svg");
    if (InitCallback) {
        InitCallback();
    }
};