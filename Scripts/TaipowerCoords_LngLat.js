/*
 * 座標點
 */
function Coords(xval, yval, zval) {
    /**
     * X軸值
     * */
    this.X = xval;
    /**
     * Y軸值
     * */
    this.Y = yval;
    /**
     * Z軸值
     * */
    this.Z = (zval != undefined ? zval : 0)
}
/*
 * 台電圖號座標轉換
 */
function TaipowerCoordinateTransform() {
    /**
     * X分割線(TWD67坐標系統)
     * */
    var XSections = [90000, 170000, 250000, 330000];
    /**
     * Y分割線(TWD67坐標系統)
     * */
    var YSections = [2400000, 2450000, 2500000, 2550000, 2600000, 2650000, 2700000, 2750000];
    /**
     * 大區索引
     * */
    var BigAreas = [
        { area: "A", x: 1, y: 7 },//x:1,y:7的意思是A左下角會是[170000,2750000]以下類推
        { area: "B", x: 2, y: 7 },
        { area: "C", x: 3, y: 7 },
        { area: "D", x: 1, y: 6 },
        { area: "E", x: 2, y: 6 },
        { area: "F", x: 3, y: 6 },
        { area: "G", x: 1, y: 5 },
        { area: "H", x: 2, y: 5 },
        { area: "J", x: 0, y: 4 },
        { area: "K", x: 1, y: 4 },
        { area: "L", x: 2, y: 4 },
        { area: "M", x: 0, y: 3 },
        { area: "N", x: 1, y: 3 },
        { area: "O", x: 2, y: 3 },
        { area: "P", x: 0, y: 2 },
        { area: "Q", x: 1, y: 2 },
        { area: "R", x: 2, y: 2 },
        { area: "T", x: 1, y: 1 },
        { area: "U", x: 2, y: 1 },
        { area: "V", x: 1, y: 0 },
        { area: "W", x: 2, y: 0 }
    ];
    var SR_3857 = EPSG.CreateSpatialReference(3857);
    var SR_4326 = EPSG.CreateSpatialReference(4326);
    var wgs84 = SpatialReference.ImportFromWKT('GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]');
    var twd97 = SpatialReference.ImportFromWKT('PROJCS["TWD97 / TM2 zone 121",GEOGCS["TWD97",DATUM["Taiwan_Datum_1997",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","1026"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","3824"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",121],PARAMETER["scale_factor",0.9999],PARAMETER["false_easting",250000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],AUTHORITY["EPSG","3826"]]');
    var twd67 = SpatialReference.ImportFromWKT('PROJCS["TWD67 / TM2 zone 121",GEOGCS["TWD67",DATUM["Taiwan_Datum_1967",SPHEROID["GRS 1967 Modified",6378160,298.25,AUTHORITY["EPSG","7050"]],AUTHORITY["EPSG","1025"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","3821"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",121],PARAMETER["scale_factor",0.9999],PARAMETER["false_easting",250000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],AUTHORITY["EPSG","3828"]]');
    var TWD67ToWGS84 = new SpatialReference.Transform(twd67, wgs84, new SpatialReference.GeographicTransform(-730.160, -346.212, -472.186, -0.00003863, -0.00001721, -0.00000197, 0.0000182));
    var TWD67ToTWD97 = new SpatialReference.Transform(twd67, twd97, new SpatialReference.GeographicTransform(-730.160, -346.212, -472.186, -0.00003863, -0.00001721, -0.00000197, 0.0000182));
    var TWD97ToWGS84 = new SpatialReference.Transform(twd97, wgs84, new SpatialReference.GeographicTransform(0, 0, 0, 0, 0, 0, 0));
    /**
     * TWD67座標 to 台電圖號座標
     * @param {Coords} TWD67Point TWD67座標(X,Y)格式
     */
    this.TWD67ToTPC = function (TWD67Point) {
        var i;  //LOOP專用
        var TPCResult;
        var TWD67X = TWD67Point.X;
        var TWD67Y = TWD67Point.Y;
        //先取100的餘數(這樣可以決定台電圖號座標的最後四個字了)
        //算出來的餘數若分別是35 & 14,結果的台電圖號座標末尾為3154
        /**
         * 算餘數後四捨五入到整數(測試時測到餘數不足10結果抓第二個字元抓到小數點)(傳進來的TWD67座標幾乎都有小數部分)
         * */
        var TWD67XMod100 = TWD67X % 100;
        var TWD67YMod100 = TWD67Y % 100;
        var intModX = Math.round(TWD67XMod100).toString().padStart(2, '0');
        var intModY = Math.round(TWD67YMod100).toString().padStart(2, '0');
        var TPCResultLast4 = intModX.substr(0, 1) + intModY.substr(0, 1) + intModX.substr(1, 1) + intModY.substr(1, 1);
        /**
         * 但不能拿四捨五入後的整數來減(否則百位數以上有變 區域就會變 結果就會錯得比較大)
         */
        TWD67X -= TWD67XMod100;
        TWD67Y -= TWD67YMod100;
        //找索引
        var ix = -1;
        var iy = -1;
        for (i = 0; (i < XSections.length && ix == -1); i += 1) {
            if (XSections[i] < TWD67X && TWD67X < (i + 1 >= XSections.length ? Number.POSITIVE_INFINITY : XSections[i + 1])) {
                ix = i;
            }
        }
        for (i = 0; (i < YSections.length && iy == -1); i += 1) {
            if (YSections[i] < TWD67Y && TWD67Y < (i + 1 >= YSections.length ? Number.POSITIVE_INFINITY : YSections[i + 1])) {
                iy = i;
            }
        }
        //到這裡可以確定ix,iy落點在哪裡 然後去找大區
        var c1 = "";
        for (i = 0; (i < BigAreas.length && c1 == ""); i += 1) {
            if (BigAreas[i].x == ix && BigAreas[i].y == iy) {
                c1 = BigAreas[i].area;
            }
        }
        //c1值(傳入座標所屬大區,結果的台電圖號座標第一個字)就位
        //接著要算800m*500m區域編號
        TWD67X -= XSections[ix];
        TWD67Y -= YSections[iy];
        var ix1 = Math.floor(TWD67X / 800);
        var iy1 = Math.floor(TWD67Y / 500);
        if (ix == -1 || iy == -1 || c1 == "" || ix1 >= 100 || iy1 >= 100) {
            /*
             * 計算出來的資料是有問題的
             * 找不到大區、子區域超出範圍都算此類
             */
            return "";
        }
        TPCResult = c1 + ix1.toString().padStart(2, '0') + iy1.toString().padStart(2, '0');
        //TPCResult到這裡已經儲存好第一段座標資料
        TWD67X = TWD67X % 800;
        TWD67Y = TWD67Y % 500;
        //接著算在這個800m*500m區域內又是位在哪個100m*100m子區域內
        //TWD67X & TWD67Y到這裡絕對只會是100的倍數,因為餘數早在算大區之前就被處理掉了
        var HundredMeterAreaID = String.fromCharCode(65 + TWD67X / 100) + String.fromCharCode(65 + TWD67Y / 100);
        if (TPCResultLast4.endsWith("00")) {
            //末尾是00就去掉
            TPCResultLast4 = TPCResultLast4.substring(0, TPCResultLast4.length - 2);
        }
        TPCResult = TPCResult + HundredMeterAreaID + TPCResultLast4;
        return TPCResult;
    };
    /**
     * 檢查輸入台電圖號座標,輸出檢查錯誤訊息(沒有訊息就是檢查通過)。
     * @param {string} InputTPCPoint 輸入台電圖號座標
     */
    this.TPCPointIsValid = function (InputTPCPoint) {
        //轉大寫
        InputTPCPoint = InputTPCPoint.toUpperCase();
        var Alphabets = "QWERTYUIOPASDFGHJKLZXCVBNM";//只用來判斷是不是英文字母by string.includes方法,這串英文字母怎麼排不是重點
        var Nums = "1234567890";
        var Errors = [];
        if (InputTPCPoint.length != 9 && InputTPCPoint.length != 11) {
            Errors.push("輸入資料長度不正確。");
        } else {
            var c1 = InputTPCPoint.substr(0, 1);
            if (c1 == "I") {
                Errors.push("開頭字元不可能為I。");
            } else if ("SXYZ".includes(c1)) {
                Errors.push("目前不支援外島資料。");
            }
            if (!Alphabets.includes(InputTPCPoint.substr(0, 1)) || !Alphabets.includes(InputTPCPoint.substr(5, 1)) || !Alphabets.includes(InputTPCPoint.substr(6, 1))) {
                Errors.push("第1,6,7個字元必須是英文字母。");
            }
            if (InputTPCPoint.length == 9) {
                InputTPCPoint += "00";
            }
            for (var i = 0; i < InputTPCPoint.length; i += 1) {
                if (i != 0 && i != 5 && i != 6) {
                    if (!Nums.includes(InputTPCPoint.substr(i, 1))) {
                        Errors.push("第2~5與8~11必須是數字字元。若第10~11字元是'0'可省略。");
                        i = InputTPCPoint.length;
                    }
                }
            }
        }
        return (Errors.length > 0) ? Errors.join("\r\n") : undefined;
    };
    /**
     * 台電圖號座標 to TWD67座標
     * @param {string} TPCPoint 台電圖號座標
     */
    this.TPCToTWD67 = function (TPCPoint) {
        //輸入台電圖號座標先切兩段:前五個字第一段，剩下來是第二段
        var TPCPoint1 = TPCPoint.toUpperCase().substr(0, 5);
        var TPCPoint2 = TPCPoint.toUpperCase().substr(5);
        var XX, YY;
        //第一個字
        var c1 = TPCPoint1.substr(0, 1).toUpperCase();
        /*
         * 原本寫法參照 https://www.mobile01.com/topicdetail.php?f=130&t=28495
         * 但是考量到有逆向,所以重造
         */
        var idx = -1;
        for (var i = 0; (idx == -1 && i < BigAreas.length); i += 1) {
            if (BigAreas[i].area == c1) {
                idx = i;
            }
        }
        XX = XSections[BigAreas[idx].x];
        YY = YSections[BigAreas[idx].y];
        //若無意外,第一個字母的大區的左下角座標點確定了
        //第一段第一個字母後兩個二位數決定是在哪個800m*500m方塊
        XX += parseInt(TPCPoint1.substr(1, 2), 10) * 800;
        YY += parseInt(TPCPoint1.substr(3, 2), 10) * 500;
        //各個800m*500m方塊分割成40個100m*100m方塊,編號為最左下角為AA開始往上往右
        //(就是台電圖號座標第二段的開頭兩個字母的意義)
        var xsymbol = TPCPoint2.charCodeAt(0) - 65;
        var ysymbol = TPCPoint2.charCodeAt(1) - 65;
        XX += xsymbol * 100;
        YY += ysymbol * 100;
        var a = parseInt(TPCPoint2.substr(2, 1), 10) * 10;
        var b = parseInt(TPCPoint2.substr(3, 1), 10) * 10;
        if (TPCPoint2.length > 4) {
            a += parseInt(TPCPoint2.substr(4, 1), 10);
            b += parseInt(TPCPoint2.substr(5, 1), 10);
        }
        XX += a;
        YY += b;
        return new Coords(XX, YY);
    };
    //----------------FROM TWD67------------------------
    /**
     * TWD67座標 to 經緯度
     * @param {any} InputPoint TWD67座標
     */
    this.TWD67ToLngLat = function (InputPoint) {
        return TWD67ToWGS84.Forward(InputPoint);
    };
    //----------------FROM TWD67(END)-------------------
    //----------------FROM TWD97------------------------
        /**
     * TWD97座標 TO 台電圖號座標
     * @param {any} InputPoint TWD97座標點(X,Y)格式
     */
    this.TWD97ToTPCPoint = function (InputPoint) {
        var TWD67Point = TWD67ToTWD97.Inverse(InputPoint);
        return this.TWD67ToTPC(TWD67Point);
    };
    /**
     * TWD97座標 TO 經緯度
     * @param {any} InputPoint TWD97座標
     */
    this.TWD97ToLngLat = function (InputPoint) {
        return TWD97ToWGS84.Forward(InputPoint);
    };
    //----------------FROM TWD97(END)-------------------
    //----------------FROM 經緯度------------------------
    /**
     * 經緯度 to 台電圖號座標
     * @param {Coords} InputPoint 經緯度座標點(X,Y)格式
     */
    this.LngLatToTPCPoint = function (InputPoint) {
        //經緯度轉成TWD67後再轉
        var TWD67Point = TWD67ToWGS84.Inverse(InputPoint);
        return this.TWD67ToTPC(TWD67Point);
    };
    /**
     * 經緯度 TO TWD97座標
     * @param {any} InputPoint 經緯度
     */
    this.LngLatToTWD97 = function (InputPoint) {
        return TWD97ToWGS84.Inverse(InputPoint);
    };
    /**
     * 經緯度 TO EPSG3857座標
     * @param {any} InputPoint
     */
    this.LngLatToEPSG3857 = function (InputPoint) {
        return SpatialReference.CoordinateTransform(SR_4326, SR_3857, null, new Coords(InputPoint.X, InputPoint.Y, 0));
    };
    //----------------FROM 經緯度(END)-------------------
    //----------------FROM 台電圖號坐標-------------------
    /**
     * 台電圖號座標 to 經緯度
     * @param {string} TPCPoint 輸入台電圖號座標
     */
    this.TPCPointToLngLat = function (TPCPoint) {
        return TWD67ToWGS84.Forward(this.TPCToTWD67(TPCPoint));
    };
    /**
     * 台電圖號座標 to  TWD97座標
     * @param {string} TPCPoint 輸入台電圖號座標
     */
    this.TPCPointToTWD97 = function (TPCPoint) {
        return TWD67ToTWD97.Forward(this.TPCToTWD67(TPCPoint));
    };
    /**
     * 台電圖號座標 TO EPSG3857
     * @param {any} TPCPoint
     */
    this.TPCPointToEPSG3857 = function (TPCPoint) {
        return this.LngLatToEPSG3857(this.TPCPointToLngLat(TPCPoint));
    };
    //----------------FROM 台電圖號坐標(END)--------------
    /**
     * EPSG3857座標 TO 經緯度
     * @param {any} InputPoint
     */
    this.EPSG3857ToLngLat = function (InputPoint) {
        return SpatialReference.CoordinateTransform(SR_3857, SR_4326, null, new Coords(InputPoint.X, InputPoint.Y, 0));
    };
}