// 引用pages
// import demoindex from '@/views/demo/index'
import deviceGroupMgmt from '@/views/AccessControlApp/components/DeviceGroupMgmt'
import auth from '@/views/AccessControlApp/components/Auth'
import sendDownRecord from '@/views/AccessControlApp/components/sendDownRecordMgmt'

import authMgmt from '@/views/AccessControlApp/views/authMgmt/auth'

// 定义路由路径数组列表
export default[
  {
    path: '/accesscontrolapp/deviceGroupMgmt',
    name: 'deviceGroupMgmt',
    component: deviceGroupMgmt
  },
  {
    path: '/accesscontrolapp/auth',
    name: 'auth',
    component: auth
  },
  {
    path: '/authMgmt',
    name: 'authMgmt',
    component: authMgmt
  },
  {
    path: '/accesscontrolapp/sendDownRecordMgmt',
    name: 'sendDownRecordMgmt',
    component: sendDownRecord
  }
]
