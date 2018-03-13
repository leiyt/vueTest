import Axios from '@/assets/js/AxiosPlugin'

// 接口地址
// const BASE_PATH = process.env.API_URL

// 访客管理
/**
 * 录入访客信息，测试接口
 */
export const addVisitorInfoTest = data => {
  return Axios({
    method: 'post',
    url: '/scp-visitorapp/visitor/insert',
    data
  })
}

/**
 * 查询访客
 * @param {*} data 根据访客姓名或手机号、或身份证号码查询访客记录
 */
export const getVisitor = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/visitor/list',
    params: data
  })
}

/**
 * 根据被访人信息，查询其房屋信息
 * Request
 * communityName 小区名称
 * buildingName 楼宇名称
 * buildingUnit 单元名称
 * floorNumber 楼层号码
 * homeNumber 房屋号码
 * name 用户姓名
 */
export const getHomeInfoByUserInfo = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/visitor/getHomeInfoByUserInfo',
    data
  })
}

/**
 * 根据房屋信息，查询安防设备编号
 * Request
 * homeID 房屋编号
 * buildingName 楼宇名称
 * buildingUnit 单元名称
 * floorNumber 楼层号码
 */
export const getDeviceIdByHomeInfo = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/visitor/getDeviceIdByHomeInfo',
    data
  })
}

/**
 * 提交访客信息
 * Request
 * visitorName 访客姓名
 * visitorIdentity 访客身份识别信息
 * identityCode 证件号码
 * IdentityType 证件类型
 * age 访客年龄
 * origin 籍贯
 * userID 业主id
 * homeID 房间id
 * deviceID 设备id
 * devicePermissions 设备权限
 */
export const addVisitorInfo = data => {
  return Axios({
    method: 'post',
    url: '/scp-visitorapp/visitor/addVisitorInfo',
    data
  })
}

/**
 * 设备授权信息放入消息队列
 * Request
 * visitorName 访客姓名
 * visitorIdentity 访客身份识别信息
 * deviceID 设备id
 * devicePermissions 设备权限
 */
export const updateDevicePermissions = data => {
  return Axios({
    method: 'post',
    url: '/scp-visitorapp/visitor/updateDevicePermissions',
    data
  })
}

/**
 * 根据被访者姓名时，查询与此被访者相关的信息：房屋地址、房屋id
 */
export const searchVisitorInfo = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/user/list',
    params: data
  })
}

/**
 * 点击访客录入时，获取下拉表单的信息
 */
// export const getSlectedInfo = data => {
//   return Axios({
//     method: 'get',
//     url: '/scp-visitorapp/visitor/list',
//     params: data
//   })
// }

/**
 * 查询物业
 * @param {*} data
 */
export const getProperty = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/property/list',
    params: data
  })
}

/**
 * 编辑物业
 * @param {*} data
 */
export const updateProperty = data => {
  return Axios({
    method: 'post',
    url: '/scp-visitorapp/property/update',
    data
  })
}

/**
 * 删除物业
 * @param {*} data
 */
export const deleteProperty = data => {
  return Axios({
    method: 'post',
    url: '/scp-visitorapp/property/delete',
    data
  })
}

/**
 * 新增物业
 * @param {*} data
 */
export const insertProperty = data => {
  return Axios({
    method: 'post',
    url: '/scp-visitorapp/property/insert',
    data
  })
}

/**
 * 请求物业下拉
 * @param {*} data
 */
export const getTypeNodeMap = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/dictionary/getTypeNodeMap',
    params: data
  })
}

/**
 * 物业管理部门和岗位联动接口
 * @param {*} data
 */
export const positionList = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/dictionary/positionList?itemCode=' + data
  })
}

// 172.16.10.73:9044/scp-visitorapp/organization/getOrgNextLevel   获取组织树节点数据
/**
 *  获取组织树节点数据信息
 * @param {*} data
 */
export const getOrgNextLevel = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/organization/getOrgNextLevel',
    params: data
  })
}

// http://ip:port/scp-visitorapp/visitor/authorize  授权接口
/**
 授权接口 一键授权
 * @param {*} data
 */
export const authorize = data => {
  return Axios({
    method: 'post',
    url: '/scp-visitorapp/visitor/authorize',
    data
  })
}

// http://ip:port/scp-visitorapp/visitor/listByName  访客录入根据名字查询匹配接口
/**
 访客录入根据名字查询匹配接口
 * @param {*} data
 */
export const listByName = data => {
  return Axios({
    method: 'get',
    url: '/scp-visitorapp/visitor/listByName',
    params: data
  })
}

// 172.16.10.128:9044/scp-visitorapp/visitor/returnCard   退卡接口
export const returnCard = data => {
  return Axios({
    method: 'post',
    url: '/scp-visitorapp/visitor/returnCard',
    data
  })
}

// 下载设备管理excel 模板
export const personTemplate = (type, URL) => {
  return Axios.get(URL, { responseType: 'arraybuffer' }
  ).then(res => {
    if (type === 1) {
      var fileName = '模板下载.xls'
    } else if (type === 2) {
      fileName = '数据导出.xls'
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
    url: '/scp-visitorapp/visitor/exportExcel',
    method: 'get',
    params: data
  })
}
