/* parse */
/* jsTool_parseDate
 * api日期轉換js格式
 * d -> api data /data(xxxxxxxxxxx)/
 * return date
 */
function jsTool_parseDate(d) {
    if (d) {
        return new Date(parseInt(d.substr(6)));
    }
    return null;
}

/* jsTool_parseDateStr
 * 日期轉換yyyy/MM/dd
 * d -> date
 * return date
 */
function jsTool_parseDateStr(d) {
    if (d) {
        return d.getFullYear()+'/'+jsTool_padLeft((d.getMonth() + 1).toString(), 2)+'/'+jsTool_padLeft(d.getDate().toString(), 2);
    }
    return null;
}

/* jsTool_parseDateTimeStr
 * 日期轉換yyyy/MM/dd HH:mm:ss
 * d -> date
 * return date
 */
function jsTool_parseDateTimeStr(d) {
    if (d) {
        return d.getFullYear() + '/' + jsTool_padLeft((d.getMonth() + 1).toString(), 2) + '/' + jsTool_padLeft(d.getDate().toString(), 2) + ' ' + jsTool_padLeft(d.getHours().toString(), 2)+':'+jsTool_padLeft(d.getMinutes().toString(), 2)+':'+jsTool_padLeft(d.getSeconds().toString(), 2);
    }
    return null;
}

/* jsTool_parseDate
 * api日期轉換 str
 * d -> api data /data(xxxxxxxxxxx)/
 * return date
 */
function jsTool_parseApiDateStr(d) {
    if (d) {
        return jsTool_parseDateStr(jsTool_parseDate(d));
    }
    return null;
}

/* jsTool_parseDate
 * api日期轉換 str
 * d -> api data /data(xxxxxxxxxxx)/
 * return date
 */
function jsTool_parseApiDateTimeStr(d) {
    if (d) {
        return jsTool_parseDateTimeStr(jsTool_parseDate(d));
    }
    return null;
}

/* padLeft
 * str -> string
 * length -> int
 * retrun 左側補滿長度 length 0 之 str
 */
function jsTool_padLeft(str, length) {
    if (str.length >= length)
        return str;
    else
        return jsTool_padLeft("0" + str, length);
}

function jsTool_getCalPage(count) {
    
    var page = Math.ceil(count / 10);
    

    return page;
}

function jsTool_parseListVal(val, type) {
    switch (type) {
        case "aset_con":
            switch (val) {
                case 1:
                    return ">";
                    break;
                case 2:
                    return "<";
                    break;
                case 3:
                    return "=";
                    break;
                case 4:
                    return "!=";
                    break;
            }
            break;
        case "alert_res":
            switch (val) {
                case 1:
                    return "GIS";
                    break;
                case 2:
                    return "SCADA";
                    break;                
            }
            break;
    }
}