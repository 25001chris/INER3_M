/**
* 某個點(均帶有X,Y兩個實數)與某個線段的最近距離
* @param LineEnd1 "某個線段"的一個端點
* @param LineEnd2 "某個線段"的另一個端點
* @param Pt "某個點"
*/
function PointToLineSegmentDistance(LineEnd1, LineEnd2, Pt) {
    var l2 = PointDistance(LineEnd1.X,LineEnd1.Y, LineEnd2.X,LineEnd2.Y);
    if (l2 == 0) {
        //沒有線段，根本就是同一點
        return { X1: Pt.X, Y1: Pt.Y, X2: LineEnd1.X, Y2: LineEnd1.Y, Dist: PointDistance(Pt.X, Pt.Y, LineEnd1.X, LineEnd1.Y) };
    } else {
        var t = ((Pt.X - LineEnd1.X) * (LineEnd2.X - LineEnd1.X) + (Pt.Y - LineEnd1.Y) * (LineEnd2.Y - LineEnd1.Y)) / (l2 * l2);
        t = Math.max(0, Math.min(1, t));
        var resX = LineEnd1.X + t * (LineEnd2.X - LineEnd1.X);
        var resY = LineEnd1.Y + t * (LineEnd2.Y - LineEnd1.Y);
        //(resX,resY)表示Pt離此線段最近點
        var dist = PointDistance(Pt.X, Pt.Y, resX, resY);
        return { X1: Pt.X, Y1: Pt.Y, X2: resX, Y2: resY, Dist: dist };
    }
}
/**
* 計算XY平面座標點上的距離
* @param X1 點1的座標X值
* @param Y1 點1的座標Y值
* @param X2 點2的座標X值
* @param Y2 點2的座標Y值
*/
function PointDistance(X1, Y1, X2, Y2) {
    return Math.sqrt((X1 - X2) * (X1 - X2) + (Y1 - Y2) * (Y1 - Y2));
}
/**
* 計算兩個線段是否有交點
* @param a AB線段A點x軸值
* @param b AB線段A點y軸值
* @param c AB線段B點x軸值
* @param d AB線段B點y軸值
* @param p CD線段C點x軸值
* @param q CD線段C點y軸值
* @param r CD線段D點x軸值
* @param s CD線段D點y軸值
*/
function HasIntersection(a, b, c, d, p, q, r, s) {
    var ua, ub, denom = (s - q) * (c - a) - (r - p) * (d - b);
    if (denom == 0) {
        return { x: NaN, y: NaN, result: false };
    }
    ua = ((r - p) * (b - q) - (s - q) * (a - p)) / denom;
    ub = ((c - a) * (b - q) - (d - b) * (a - p)) / denom;
    return { x: a + ua * (c - a), y: b + ub * (d - b), result: (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) };
}
/**
* 兩條線之間的最短距離
* @param arrayA 數值陣列,x,y軸座標值交錯排列
* @param arrayB 數值陣列,x,y軸座標值交錯排列
*/
function CalcNearestDistance(arrayA, arrayB) {
    var dist = Number.POSITIVE_INFINITY;
    var res = undefined;
    var i = 0, j = 0;
    var p1, p2;
    while (2 * i + 3 < arrayA.length) {
        var x1 = arrayA[2 * i];
        var y1 = arrayA[2 * i + 1];
        var x2 = arrayA[2 * i + 2];
        var y2 = arrayA[2 * i + 3];
        j = 0;
        while (2 * j + 3 < arrayB.length) {
            var x3 = arrayB[2 * j];
            var y3 = arrayB[2 * j + 1];
            var x4 = arrayB[2 * j + 2];
            var y4 = arrayB[2 * j + 3];
            var cross = HasIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
            if (cross.result) {
                //線段有交會
                return { pt1: [cross.x, cross.y], pt2: [cross.x, cross.y], dist: 0 };
            } else {
                /* https://stackoverflow.com/questions/541150/connect-two-line-segments/11427699#11427699 
                AB, CD 兩線段不相交，則計算：
                C到AB線段距離、D到AB線段距離、A到CD線段距離、B到CD線段距離
                然後四個距離當中抓值最小的
                */
                var AtoCD = PointToLineSegmentDistance({ X: x3, Y: y3 }, { X: x4, Y: y4 }, { X: x1, Y: y1 });
                if (AtoCD.Dist < dist) {
                    dist = AtoCD.Dist;
                    p1 = [x1, y1];
                    p2 = [AtoCD.X2, AtoCD.Y2];
                }
                var BtoCD = PointToLineSegmentDistance({ X: x3, Y: y3 }, { X: x4, Y: y4 }, { X: x2, Y: y2 });
                if (BtoCD.Dist < dist) {
                    dist = BtoCD.Dist;
                    p1 = [x2, y2];
                    p2 = [BtoCD.X2, BtoCD.Y2];
                }
                var CtoAB = PointToLineSegmentDistance({ X: x1, Y: y1 }, { X: x2, Y: y2 }, { X: x3, Y: y3 });
                if (CtoAB.Dist < dist) {
                    dist = CtoAB.Dist;
                    p1 = [CtoAB.X2, CtoAB.Y2];
                    p2 = [x3, y3];
                }
                var DtoAB = PointToLineSegmentDistance({ X: x1, Y: y1 }, { X: x2, Y: y2 }, { X: x4, Y: y4 });
                if (DtoAB.Dist < dist) {
                    dist = DtoAB.Dist;
                    p1 = [DtoAB.X2, DtoAB.Y2];
                    p2 = [x4, y4];
                }
            }
            j += 1;
        }
        i += 1;
    }
    return { pt1: p1, pt2: p2, dist: dist };
}