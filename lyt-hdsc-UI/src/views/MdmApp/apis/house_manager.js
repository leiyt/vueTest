import Axios from '@/assets/js/AxiosPlugin'
// 获取房屋列表
export function getHouseList (data) {
  return Axios({
    url: '/scp-mdmapp/house/getHousesByConditions',
    method: 'get',
    params: data
  })
}
// 删除房屋
export function deleteHouse (data) {
  return Axios({
    url: '/scp-mdmapp/house/deleteHouse',
    method: 'POST',
    data: data
  })
}
// 批量删除
export function batchDeleteHouse (data) {
  return Axios({
    url: '/scp-mdmapp/house/batchDeleteHouse',
    method: 'POST',
    data
  })
}
// 添加房屋
export function insertHouse (data) {
  return Axios({
    url: '/scp-mdmapp/house/insertHouse',
    method: 'POST',
    data
  })
}
// 更新房屋
export function updateHouse (data) {
  return Axios({
    url: '/scp-mdmapp/house/updateHouse',
    method: 'POST',
    data
  })
}
// 支付方式，入住方式
export function getHouseType (data) {
  return Axios({
    url: '/scp-mdmapp/dict/getDictItem',
    method: 'GET',
    params: data
  })
}
// 下载excel 模板
export const downloadExcelTemplate = (type, URL) => {
  return Axios.get(URL, {responseType: 'arraybuffer'}
  ).then(res => {
    if (type === 2) {
      var fileName = '房屋表.xlsx'
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
