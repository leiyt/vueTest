import Axios from '@/assets/js/AxiosPlugin'
export const cmd = {
  'streamMedia_list': 'streamMedia/list', // 获取流媒体服务配置
  'streamMedia_update': 'streamMedia/update', // 设置流媒体服务配置
  'streamMedia_save': 'streamMedia/save', // 添加流媒体服务
  'streamMedia_delete': 'streamMedia/delete', // 删除流媒体服务
  'streamMedia_search': 'streamMedia/getByOrgId', // 查询流媒体服务
  'streamMedia_edit': 'streamMedia/getAllByUuid', // 编辑流媒体服务
  'streamMedia_getAddedStreamMediaOrg': 'streamMedia/getAddedStreamMediaOrg', // 获取添加修改的流媒体组织树信息
  'device_save': 'video/device/insertVideoDevice', // 添加视频设备
  'device_list': 'video/device/listVideoDevices', // 查询视频设备
  'device_delete': 'video/device/deleteVideoDevice', // 删除视频设备
  'device_update': 'video/device/updateVideoDevice', // 编辑视频设备
  'listVideoDeviceChannelInfo': 'video/device/listVideoDeviceChannelInfo', // 视频设备查看功能
  'updateVideoDeviceChannelInfo': 'video/device/updateVideoDeviceChannelInfo', // 视频设备刷新功能
  'template_list': 'recordPlanTemplate/list', // 查询录像计划模板
  'template_update': 'recordPlanTemplate/update', // 配置录像计划模板
  'plan_list': 'organization/device/getCameraPageByOrgId', // 查询录像计划
  'plan_save': 'recordPlan/update', // 保存录像计划
  'plan_delete': 'recordPlan/delete', // 清除录像计划
  'getHumanFaceCaptureInfo': 'getHumanFaceCaptureInfo', // 获取人脸抓拍图片
  'parameter_get': 'video/parameter/getVideoParameter', // 获取视频参数
  'parameter_save': 'video/parameter/updateVideoParameter', // 保存视频参数
  'parameter_captureformat_list': 'api/dropList/listCaptureFormats', // 查询抓图保存格式列表
  'parameter_recordpackagesize_list': 'api/dropList/listRecordPackageSizes', // 查询录像打包大小列表
  'get_organizations': 'organization/device/getOrganizations', // 获取组织树
  'customgroup_delete': 'custom/group/delete', // 删除组
  'customgroup_get': 'custom/group/get', // 获取自定义组下的摄像头
  'customgroup_list': 'custom/group/list', // 根据名称查询自定义组
  'customgroup_insert': 'custom/group/insert', // 添加自定义组
  'customgroup_update': 'custom/group/update', // 修改自定义组
  'cameraTree_get': 'organization/device/getRootOrgDto', // 获取组织下的摄像头
  'cameraTree_node_get': 'organization/device/getChildOrgDto', // 根据组织uuid获取组织下的摄像头
  'camera_option_list': 'organization/device/getDomeDevicePageList' // 获取到球机列表
}

const isMock = false // 是否mock调试
export const prePath = '/scp-videogatewayapp/'
export const request = (path, data, type) => {
  // console.log({ 'path': path, 'data': JSON.stringify(data) })
  data = data || {}
  if (isMock && type === 'get') data = {}
  var promise = new Promise((resolve, reject) => {
    Axios({
      method: type || 'post',
      url: prePath + path,
      params: type === 'get' ? data : {}, // get 传的参数
      data: type !== 'get' ? data : {}, // post 传的参数
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(
      res => {
        // console.log(res)
        if (res.data.code === '200') {
          resolve(res.data.data)
        } else {
          if (res.data) res.data.fromService = true // 错误来自服务器，非axios
          reject(res.data)
        }
      }).catch(
      error => {
        reject(error)
      }
      )
  })
  return promise
}

export const confirmDelete = function (text, fnOk, fnCancel) {
  this.$confirm(text, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (fnOk) fnOk()
  }).catch(() => {
    if (fnCancel) fnCancel()
  })
}

export const serviceTypeArr = {
  '1': '流媒体',
  '2': '其它'
}

export const isValidIP = (ip) => {
  var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  return reg.test(ip)
}
export const emptyObj = (obj) => {
  for (var key in obj) {
    obj[key] = ''
  }
}
export const isArray = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Array]'
}
