import { request, cmd } from '@/views/VideoGatewayApp/apis/common.js'

export const getTemplateData = (param) => { return request(cmd['template_list'], param, 'get') }
export const postSaveTemplateData = (param) => { return request(cmd['template_update'], param) }
