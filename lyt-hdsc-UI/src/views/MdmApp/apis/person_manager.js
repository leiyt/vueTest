import Axios from '@/assets/js/AxiosPlugin'

// 获取人员信息
export function getPersonList (data) {
  return Axios({
    url: '/scp-mdmapp/user/getUsersByConditions',
    method: 'get',
    params: data
  })
}
// 删除人员
export function deletePerson (data) {
  return Axios({
    url: '/scp-mdmapp/user/deleteUser',
    method: 'POST',
    data: data
  })
}
// 批量删除人员
export function batchDeletePerson (data) {
  return Axios({
    url: '/scp-mdmapp/user/batchDeleteUser',
    method: 'POST',
    data
  })
}
// 添加人员信息
export function insertPerson (data) {
  return Axios({
    url: '/scp-mdmapp/user/insertUser',
    method: 'POST',
    data
  })
}
// 获取人员信息
export function getUser (data) {
  return Axios({
    url: '/scp-mdmapp/user/getUser',
    method: 'get',
    params: data
  })
}
// 更新人员信息
export function updatePerson (data) {
  return Axios({
    url: '/scp-mdmapp/user/updateUser',
    method: 'POST',
    data
  })
}
// 获取总组织树节点
export function obtainOrganization (data) {
  return Axios({
    url: '/scp-mdmapp/org/getUserOrgNextLevel',
    method: 'get',
    params: data
  })
}

// 字典查询
export function getDictItem (data) {
  return Axios({
    url: '/scp-mdmapp/dict/getDictItemMap',
    method: 'get',
    params: data
  })
}
// 图片
export function getPic (data) {
  return Axios({
    url: '/scp-mdmapp/user/getPicture',
    method: 'get',
    params: data
  })
}
// 下载设备管理excel 模板
export const personTemplate = (params, type, URL) => {
  return Axios.get(URL, { responseType: 'arraybuffer' }
  ).then(res => {
    if (type === 1 && params !== null) {
      var fileName = params + '模板.xlsx'
    } else if (type === 2 && params === null) {
      fileName = '人员列表.xlsx'
    }
    let blob = new Blob([res.data], { type: 'application/x-xls' })
    if (navigator.appVersion.toString().indexOf('.NET') > 0) {
      window.navigator.msSaveBlob(blob, fileName)
    } else {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    return res.data
  })
}
// 导出
export function downloadUsers (data) {
  return Axios({
    url: '/scp-mdmapp/user/downloadUsers',
    method: 'get',
    params: data
  })
}
