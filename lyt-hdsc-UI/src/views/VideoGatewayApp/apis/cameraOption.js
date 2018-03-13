import { request, cmd } from '@/views/VideoGatewayApp/apis/common.js'

export const getCameraListData = (data) => {
  return request(cmd['camera_option_list'], data, 'get')
}
