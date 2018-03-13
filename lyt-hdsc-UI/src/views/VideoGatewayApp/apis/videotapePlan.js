import { request, cmd } from '@/views/VideoGatewayApp/apis/common.js'

export const postTapeDeviceData = (data) => {
  return request(cmd['plan_list'], data)
}
export const postSetTapePlanData = (data) => {
  return request(cmd['plan_save'], data)
}
export const postClearTapePlanData = (data) => {
  return request(cmd['plan_delete'], data)
}
export const getOrganizationsData = (data) => {
  return request(cmd['get_organizations'], data, 'get')
}
