//共用狀態
var stateData = {
    isload: 0,
    isXmlload: 0,
    AiDiList: [],
    SETList: [],
    isAutoList: ['35', '38', '39', '40', '41', '42'],
    isCheck: {},
    SETTransfer: {},
    userName: "",
    LogicList: {},
    searchData: {},
    xmlFile:"",
}
//共用狀態改變方法
var mutation = {
    toggleIsLoad : (stateData,payload)=>{
        stateData[payload.item] = payload.value;
    },
    toggleIsXmlLoad : (stateData,payload)=>{
        stateData[payload.item] = payload.value;
    },
    setAiDiList : (stateData,payload)=>{
        stateData[payload.item] = payload.value;
    },
    setSETList : (stateData,payload)=>{
        stateData[payload.item] = payload.value;
    },
    setAllCheck : (stateData,payload)=>{
        stateData.isCheck[payload.obj] = payload.value;
    },
    setSETTransfer : (stateData,payload)=>{
        stateData[payload.item] = payload.value;
    },
    setUserName : (stateData,payload)=>{
        stateData[payload.item] = payload.value;
    },
    setLogicList : (stateData,payload)=>{
        stateData.LogicList[payload.item] = payload.value;
    },
    setSearchData : (stateData,payload)=>{
        stateData[payload.item] = payload.value;
    },
    setXMLFileData : (stateData,payload)=>{
        stateData[payload.item] = payload.value;
    }
}