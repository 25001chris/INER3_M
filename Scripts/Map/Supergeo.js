/**
 * 通用函數列表
 * */
var Supergeo = {
    /**
     * a如果不是NULL就用a值，否則用b值。
     * @param {any} a
     * @param {any} b
     */
    IfNull: function (a, b) { return (a != null) ? a : b; }
    ,
    /**
     * 回傳結果: pGeos 為 x, y, z 坐標陣列; nParts 為每個 part 的點數
     * @param {any} sWKT WKT格式字串
     */
    ProcessGeometryFromWKT: function (sWKT) {
        //Leon 20201111初完成轉給Gary Lu
        //Gary Lu 20201116:補一下WKT若空的時候的狀況:回傳空字串
        //不然喔,下面indexOf函數執行可能取到複數，之後slice就可能完蛋了
        if (sWKT == null || sWKT == "") {
            return [];
        }
        var SGs = [];
        var m_minX, m_maxX, m_minY, m_maxY;//Gary Lu 20201111補:不補下場就是這些變數is not defined
        var pos = sWKT.indexOf('(');
        var type = sWKT.slice(0, pos);
        sWKT = sWKT.trim();
        if (type == "POINT") {
            var pGeos = [];
            var nParts = [];

            var pair = sWKT.slice(pos + 1, sWKT.indexOf(')'));
            var xyz = pair.trim().split(' ');
            var x = parseFloat(xyz[0]);
            var y = parseFloat(xyz[1]);
            var z = (xyz.length > 2) ? parseFloat(xyz[2]) : 0;
            pGeos.push(x, y, z);
            if (m_minX == null || x < m_minX) m_minX = x;
            if (m_maxX == null || x > m_maxX) m_maxX = x;
            if (m_minY == null || y < m_minY) m_minY = y;
            if (m_maxY == null || y > m_maxY) m_maxY = y;
            nParts.push(1);
            SGs.push({ pGeoArr: pGeos, pPartArr: nParts });
            //pThis.GeoType = 0;
        }
        else if (type == "MULTIPOINT") {
            var pGeos = [];
            var nParts = [];

            var ring = sWKT.slice(pos + 1, sWKT.indexOf(')'));
            var pairs = ring.trim().split(',');
            for (var i in pairs) {
                var pair = pairs[i];
                var xyz = pair.trim().split(' ');
                var x = parseFloat(xyz[0]);
                var y = parseFloat(xyz[1]);
                var z = (xyz.length > 2) ? parseFloat(xyz[2]) : 0;
                pGeos.push(x, y, z);
                if (m_minX == null || x < m_minX) m_minX = x;
                if (m_maxX == null || x > m_maxX) m_maxX = x;
                if (m_minY == null || y < m_minY) m_minY = y;
                if (m_maxY == null || y > m_maxY) m_maxY = y;
            }
            nParts.push(pairs.length);
            SGs.push({ pGeoArr: pGeos, pPartArr: nParts });
            //pThis.GeoType = 0;
        }
        else if (type == "LINESTRING") {
            var pGeos = [];
            var nParts = [];

            var ring = sWKT.slice(pos + 1, sWKT.indexOf(')'));
            var pairs = ring.trim().split(',');
            for (var i in pairs) {
                var pair = pairs[i];
                var xyz = pair.trim().split(' ');
                var x = parseFloat(xyz[0]);
                var y = parseFloat(xyz[1]);
                var z = (xyz.length > 2) ? parseFloat(xyz[2]) : 0;

                pGeos.push(x, y, z);

                if (m_minX == null || x < m_minX) m_minX = x;
                if (m_maxX == null || x > m_maxX) m_maxX = x;
                if (m_minY == null || y < m_minY) m_minY = y;
                if (m_maxY == null || y > m_maxY) m_maxY = y;
            }
            nParts.push(pairs.length);
            SGs.push({ pGeoArr: pGeos, pPartArr: nParts });
            //pThis.GeoType = 1;
        }
        else if (type == "MULTILINESTRING") {
            var rings = sWKT.slice(pos + 1, sWKT.lastIndexOf(')'));
            rings = rings.trim().split('),');
            for (var i in rings) {
                var pGeos = [];
                var nParts = [];

                var ring = rings[i].slice(1, rings[i].length - 1);
                var pairs = ring.trim().split(',');
                for (var j in pairs) {
                    var pair = pairs[j];
                    var xyz = pair.trim().split(' ');
                    var x = parseFloat(xyz[0]);
                    var y = parseFloat(xyz[1]);
                    var z = (xyz.length > 2) ? parseFloat(xyz[2]) : 0;
                    pGeos.push(x, y, z);
                    if (m_minX == null || x < m_minX) m_minX = x;
                    if (m_maxX == null || x > m_maxX) m_maxX = x;
                    if (m_minY == null || y < m_minY) m_minY = y;
                    if (m_maxY == null || y > m_maxY) m_maxY = y;
                }
                nParts.push(pairs.length);
                SGs.push({ pGeoArr: pGeos, pPartArr: nParts });
            }
            //pThis.GeoType = 1;
        }
        else if (type == "POLYGON") {
            var pGeos = [];
            var nParts = [];

            var sWKT = sWKT.slice(pos + 1, sWKT.lastIndexOf(')'));
            var rings = sWKT.trim().split('),');
            for (var i in rings) {
                var ring = rings[i].slice(1, rings[i].length - 1);
                var pairs = ring.trim().split(',');
                for (var j in pairs) {
                    var pair = pairs[j];
                    var xyz = pair.trim().split(' ');
                    var x = parseFloat(xyz[0]);
                    var y = parseFloat(xyz[1]);
                    var z = (xyz.length > 2) ? parseFloat(xyz[2]) : 0;
                    pGeos.push(x, y, z);
                    if (m_minX == null || x < m_minX) m_minX = x;
                    if (m_maxX == null || x > m_maxX) m_maxX = x;
                    if (m_minY == null || y < m_minY) m_minY = y;
                    if (m_maxY == null || y > m_maxY) m_maxY = y;
                }
                nParts.push(pairs.length);
            }
            SGs.push({ pGeoArr: pGeos, pPartArr: nParts });
            //pThis.GeoType = 2;
        }
        else if (type == "MULTIPOLYGON") {
            sWKT = sWKT.slice(pos + 1, sWKT.length - 1);
            var polygons = sWKT.trim().split(')),');
            for (var i in polygons) {
                var polygon = polygons[i];

                var pGeos = [];
                var nParts = [];

                var rings = polygon.trim().split('),');
                for (var j in rings) {
                    var ring = rings[j].slice(1, rings[j].length - 1);
                    var pairs = ring.trim().split(',');
                    for (var k in pairs) {
                        var pair = pairs[k];
                        if (pair[0] == '(')
                            pair = pair.slice(1);
                        var xyz = pair.trim().split(' ');
                        var x = parseFloat(xyz[0]);
                        var y = parseFloat(xyz[1]);
                        var z = (xyz.length > 2) ? parseFloat(xyz[2]) : 0;
                        pGeos.push(x, y, z);
                        if (m_minX == null || x < m_minX) m_minX = x;
                        if (m_maxX == null || x > m_maxX) m_maxX = x;
                        if (m_minY == null || y < m_minY) m_minY = y;
                        if (m_maxY == null || y > m_maxY) m_maxY = y;
                    }
                    nParts.push(pairs.length);
                }
                SGs.push({ pGeoArr: pGeos, pPartArr: nParts });
                //pThis.GeoType = 2;
            }
        }

        return SGs;
    }
    ,
    /**
     * 快速排序法(適合數值或字串構成的陣列)
     * @param {Array} UnsortedArray 未排序陣列
     * @param {boolean} Ascending 是否遞增 (傳false才算要遞減,不傳入視同遞增)
     */
    QuickSort_Single: function (UnsortedArray, Ascending) {
        function ALargerThanB(a, b) {
            if (typeof (a) == "number" && typeof (b) == "number") {
                return a > b;
            }
            if (typeof (a) == "string" && typeof (b) == "string") {
                return b.localeCompare(a);
            }
        }
        if (UnsortedArray == null || UnsortedArray == [] || UnsortedArray.length < 2) {
            //傳入空陣列就吐出空陣列
            return (UnsortedArray ? UnsortedArray : []);
        }
        var Lower = [];
        var Higher = [];
        var pivot = UnsortedArray[0];
        var i = 1;
        //大的分一邊,小的另外一邊,依據開頭元素的指定屬性值
        while (i < UnsortedArray.length) {
            if (ALargerThanB(UnsortedArray[i], pivot)) {
                Higher.push(UnsortedArray[i]);
            } else {
                Lower.push(UnsortedArray[i]);
            }
            i += 1;
        }
        //兩邊都再排序後傳回
        //停止條件就是遇到最上面的null或空陣列
        var sLower = Supergeo.QuickSort_Single(Lower, Ascending);
        var sHigher = Supergeo.QuickSort_Single(Higher, Ascending);
        var ret = [];
        if (Ascending == false) {
            for (var i = 0; i < sHigher.length; i += 1) {
                ret.push(sHigher[i]);
            }
            ret.push(pivot);
            for (var i = 0; i < sLower.length; i += 1) {
                ret.push(sLower[i]);
            }
        } else {
            for (var i = 0; i < sLower.length; i += 1) {
                ret.push(sLower[i]);
            }
            ret.push(pivot);
            for (var i = 0; i < sHigher.length; i += 1) {
                ret.push(sHigher[i]);
            }
        }
        return ret;
    }
    ,
    /**
     * 快速排序法(適合JSON物件構成的陣列)
     * @param {Array} UnsortedArray 未排序陣列
     * @param {*} KeyFeature 排序依據屬性名稱
     * @param {boolean} Ascending 是否遞增 (傳false才算要遞減,不傳入視同遞增)
     */
    QuickSort: function (UnsortedArray, KeyFeature, Ascending) {
        if (UnsortedArray == null || UnsortedArray == [] || UnsortedArray.length < 2) {
            //傳入空陣列就吐出空陣列
            return (UnsortedArray ? UnsortedArray : []);
        }
        //能run到下面表示UnsortedArray至少有個東西
        var Lower = [];
        var Higher = [];
        var pivot = UnsortedArray[0];
        var i = 1;
        //大的分一邊,小的另外一邊,依據開頭元素的指定屬性值
        while (i < UnsortedArray.length) {
            if (UnsortedArray[i][KeyFeature] > pivot[KeyFeature]) {
                Higher.push(UnsortedArray[i]);
            } else {
                Lower.push(UnsortedArray[i]);
            }
            i += 1;
        }
        //兩邊都再排序後傳回
        //停止條件就是遇到最上面的null或空陣列
        var sLower = Supergeo.QuickSort(Lower, KeyFeature, Ascending);
        var sHigher = Supergeo.QuickSort(Higher, KeyFeature, Ascending);
        var ret = [];
        if (Ascending == false) {
            for (var i = 0; i < sHigher.length; i += 1) {
                ret.push(sHigher[i]);
            }
            ret.push(pivot);
            for (var i = 0; i < sLower.length; i += 1) {
                ret.push(sLower[i]);
            }
        } else {
            for (var i = 0; i < sLower.length; i += 1) {
                ret.push(sLower[i]);
            }
            ret.push(pivot);
            for (var i = 0; i < sHigher.length; i += 1) {
                ret.push(sHigher[i]);
            }
        }
        return ret;
    }
};