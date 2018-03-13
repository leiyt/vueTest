import Axios from '@/assets/js/AxiosPlugin'

// export const getOwners = () => {
//   return Axios.post('/scp-accesscontrolapp/auths/list').then(res => res.data)
// }
export const getOwners = (page, pageSize, personType, form) => {
  return Axios.post('/scp-accesscontrolapp/auths/list?currentPage=' + page + '&pageSize=' + pageSize + '&personType=' + personType, form).then(res => res.data)
}

// 根据住户ID获取授权信息
export const getAuthById = userId => {
  return Axios.get('/scp-accesscontrolapp/auths/isUserAuthorized?userId=' + userId).then(res => res.data)
}
