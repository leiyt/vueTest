import Axios from '@/assets/js/AxiosPlugin'

// 分页查询二维码
export const getUserListByPage = (listQuery) => {
  var trs = JSON.stringify(listQuery)
  return Axios.get('/scp-cardmgmtapp/cardMgmt/listQrCodesByPage?params=' + encodeURI(trs)).then(res => res.data)
}

// 查询卡片列表
export const queryCardList = (listQuery) => {
  var trs = JSON.stringify(listQuery)
  return Axios.get('/scp-cardmgmtapp/cardMgmt/listCardByPage?params=' + encodeURI(trs)).then(res => res.data)
}

// 卡片入库
export const storeCards = condition => {
  console.log(JSON.stringify(condition))
  return Axios.post('/scp-cardmgmtapp/cardMgmt/addCard', condition).then(res => res.data)
}

// 住户查询
export const queryUsers = (userCondition) => {
  console.log(JSON.stringify(userCondition))
  var trs = JSON.stringify(userCondition)
  return Axios.get('/scp-cardmgmtapp/cardMgmt/listResidentsByName?params=' + encodeURI(trs)).then(res => res.data)
}

// 物业人员查询
export const queryManagersByName = (userCondition) => {
  console.log(JSON.stringify(userCondition))
  return Axios.get('/scp-cardmgmtapp/cardMgmt/listManagersByName?pageSize=' + userCondition.pageSize + '&currentPage=' + userCondition.currentPage + '&name=' + userCondition.name).then(res => res.data)
}

// 查询卡务流水
export const queryCardOperateList = (listQuery) => {
  var trs = JSON.stringify(listQuery)
  return Axios.get('/scp-cardmgmtapp/cardMgmt/listCardOperationsPage?params=' + encodeURI(trs)).then(res => res.data)
}

// 查询挂失卡片信息
export const queryCardBindInfo = (condition) => {
  return Axios.post('/scp-cardmgmtapp/cardMgmt/getBindedUser', condition).then(res => res.data)
}

// 卡片挂失
export const handleCardLost = (condition) => {
  return Axios.post('/scp-cardmgmtapp/cardMgmt/loseCard', condition).then(res => res.data)
}

// 卡片解挂
export const handleRecovery = (condition) => {
  return Axios.post('/scp-cardmgmtapp/cardMgmt/disLoseCard', condition).then(res => res.data)
}

// 卡片注销
export const handleCancellation = (condition) => {
  return Axios.post('/scp-cardmgmtapp/cardMgmt/discardCard', condition).then(res => res.data)
}

// 卡片退卡
export const handleBackCard = (condition) => {
  return Axios.post('/scp-cardmgmtapp/cardMgmt/returnCard', condition).then(res => res.data)
}
