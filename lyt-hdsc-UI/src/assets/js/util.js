import Vue from 'vue'
import { Message } from 'element-ui'
Vue.component(Message.name, Message)

// getPermission
export const getPermission = function (userInfo, userResourcePermission) {
  let userRouters = ''
  let uiResources = userInfo.uiResources
  if (uiResources !== null && uiResources !== undefined) {
    uiResources.forEach(element => {
      if (element.url !== undefined && element.url !== null && element.url.length > 0) {
        userRouters = userRouters + '_' + element.url
      }
      if (element.menus !== undefined && element.menus !== null) {
        element.menus.forEach((menu2) => {
          if (menu2.url !== undefined && menu2.url !== null && menu2.url.length > 0) {
            userRouters = userRouters + '_' + menu2.url
          }
          if (menu2.items !== undefined && menu2.items !== null) {
            menu2.items.forEach(items2 => {
              // userResourcePermission.push(items2)
              userResourcePermission[items2] = true
            })
          }
          if (menu2.submenus !== undefined && menu2.submenus !== null) {
            menu2.submenus.forEach(menu3 => {
              if (menu3.url !== undefined && menu3.url !== null && menu3.url.length > 0) {
                userRouters = userRouters + '_' + menu3.url
              }
              if (menu3.items !== undefined && menu3.items !== null) {
                menu3.items.forEach(items3 => {
                  // userResourcePermission.push(items3)
                  userResourcePermission[items3] = true
                })
              }
              if (menu3.submenus !== undefined && menu3.submenus !== null) {
                menu3.submenus.forEach(menu4 => {
                  if (menu4.url !== undefined && menu4.url !== null && menu4.url.length > 0) {
                    userRouters = userRouters + '_' + menu4.url
                  }
                  if (menu4.items !== undefined && menu4.items !== null) {
                    menu4.items.forEach(items4 => {
                      userResourcePermission[items4] = true
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }
  return userRouters
}
// getfirstRouters
export const getfirstRouters = function (userInfo, title) {
  let firstRouters = ''
  let uiResources = userInfo.uiResources
  if (uiResources !== null && uiResources !== undefined) {
    uiResources.forEach(element => {
      if (element.title !== undefined && element.title !== null && element.title === title) {
        if (element.url !== undefined && element.url !== null && element.url.length > 0) {
          firstRouters = element.url
        }
        if (element.menus !== undefined && element.menus !== null) {
          element.menus.forEach((menu2, i) => {
            if (i === 0) {
              if (menu2.url !== undefined && menu2.url !== null && menu2.url.length > 0) {
                firstRouters = menu2.url
              }
              if (menu2.submenus !== undefined && menu2.submenus !== null) {
                menu2.submenus.forEach((menu3, i) => {
                  if (i === 0) {
                    if (menu3.url !== undefined && menu3.url !== null && menu3.url.length > 0) {
                      firstRouters = menu3.url
                    }
                    if (menu3.submenus !== undefined && menu3.submenus !== null) {
                      menu3.submenus.forEach((menu4, i) => {
                        if (i === 0) {
                          if (menu4.url !== undefined && menu4.url !== null && menu4.url.length > 0) {
                            firstRouters = menu4.url
                          }
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
  }
  return firstRouters
}

// getCurrentMenus
export const getCurrentMenus = function (userInfo, menuTitle) {
  let uiResources = userInfo.uiResources
  let currentMenu = null
  if (uiResources !== null && uiResources !== undefined) {
    uiResources.forEach(element => {
      if (element.title !== undefined && element.title !== null && element.title === menuTitle) {
        currentMenu = element
        return currentMenu
      }
      if (element.menus !== undefined && element.menus !== null) {
        element.menus.forEach((menu2) => {
          if (menu2.url !== undefined && menu2.url !== null && menu2.url.length > 0) {
            currentMenu = menu2
            return currentMenu
          }
        })
      }
    })
  }
  return currentMenu
}

// sessionStorage localStorage
export const session = function (key, value) {
  if (value === void (0)) {
    var lsVal = localStorage.getItem(key)
    if (lsVal && lsVal.indexOf('autostringify-') === 0) {
      return JSON.parse(lsVal.split('autostringify-')[1])
    } else {
      return lsVal
    }
  } else {
    if (typeof (value) === 'object' || Array.isArray(value)) {
      value = 'autostringify-' + JSON.stringify(value)
    }
    return localStorage.setItem(key, value)
  }
}

// 生成随机数
export const getUUID = function (len) {
  len = len || 6
  len = parseInt(len, 10)
  len = isNaN(len) ? 6 : len
  var seed = '0123456789abcdefghijklmnopqrstubwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ'
  var seedLen = seed.length - 1
  var uuid = ''
  while (len--) {
    uuid += seed[Math.round(Math.random() * seedLen)]
  }
  return uuid
}
// 深拷贝
export const deepcopy = function (source) {
  if (!source) {
    return source
  }
  let sourceCopy = source instanceof Array ? [] : {}
  for (let item in source) {
    sourceCopy[item] = typeof source[item] === 'object' ? deepcopy(source[item]) : source[item]
  }
  return sourceCopy
}
// 菜单数据组织
export const buildMenu = function (array, ckey) {
  let menuData = []
  let indexKeys = Array.isArray(array) ? array.map((e) => { return e.id }) : []
  ckey = ckey || 'parent_id'
  array.forEach(function (e, i) {
    // 一级菜单
    if (!e[ckey] || (e[ckey] === e.id)) {
      delete e[ckey]
      menuData.push(deepcopy(e)) // 深拷贝
    } else if (Array.isArray(indexKeys)) {
      // 检测ckey有效性
      let parentIndex = indexKeys.findIndex(function (id) {
        return id === e[ckey]
      })
      if (parentIndex === -1) {
        menuData.push(e)
      }
    }
  })
  let findChildren = function (parentArr) {
    if (Array.isArray(parentArr) && parentArr.length) {
      parentArr.forEach(function (parentNode) {
        array.forEach(function (node) {
          if (parentNode.id === node[ckey]) {
            if (parentNode.children) {
              parentNode.children.push(node)
            } else {
              parentNode.children = [node]
            }
          }
        })
        if (parentNode.children) {
          findChildren(parentNode.children)
        }
      })
    }
  }
  findChildren(menuData)
  return menuData
}

//  日期格式化
export const dateFormat = function (source, ignoreMinute) {
  var myDate
  var separate = '-'
  var minute = ''
  if (source === void (0)) {
    source = new Date()
  }
  if (source) {
    if (source.split) {
      source = source.replace(/\\-/g, '/')
    } else if (isNaN(parseInt(source))) {
      source = source.toString().replace(/\\-/g, '/')
    } else {
      source = new Date(source)
    }

    if (new Date(source) && (new Date(source)).getDate) {
      myDate = new Date(source)
      if (!ignoreMinute) {
        minute = (myDate.getHours() < 10 ? ' 0' : ' ') + myDate.getHours() + ':' + (myDate.getMinutes() < 10 ? '0' : '') + myDate.getMinutes()
      }
      return myDate.getFullYear() + separate + (myDate.getMonth() + 1) + separate + (myDate.getDate() < 10 ? '0' : '') + myDate.getDate() + minute
    } else {
      return source.slice(0, 16)
    }
  } else {
    return source
  }
}

// ajax错误处理
export const catchError = function (error) {
  if (error.response) {
    let messageInfo = error.response.data.message
    if (messageInfo === null || messageInfo === '' || messageInfo === undefined) {
      messageInfo = error.response.data
    }
    if (messageInfo !== undefined && (messageInfo.indexOf('499') !== -1)) {
      Vue.prototype.$message({
        message: messageInfo || '登录用户数据异常将退出系统!',
        type: 'error'
      })
      setTimeout(() => {
        window.location.href = '/login'
      }, 8000)
    }
    switch (error.response.status) {
      case 400:
        Vue.prototype.$message({
          message: messageInfo || '请求参数异常',
          type: 'error'
        })
        break
      case 401:
        // localStorage.removeItem('user')
        Vue.prototype.$message({
          message: messageInfo || '密码错误或账号不存在！',
          type: 'warning'
        })
        break
      case 403:
        Vue.prototype.$message({
          message: messageInfo || '无访问权限，请联系企业管理员',
          type: 'warning'
        })
        break
      case 404:
        Vue.prototype.$message({
          message: messageInfo || '404错误，访问路径没找到，请联系技术支持',
          type: 'error'
        })
        break
      case 500:
        Vue.prototype.$message({
          message: messageInfo || '500服务器内部错误，请联系技术支持',
          type: 'error'
        })
        break
      default:
        Vue.prototype.$message({
          message: messageInfo || '服务端异常，请联系技术支持',
          type: 'error'
        })
    }
  }
  return Promise.reject(error)
}

// 处理iE11下分页控件不能回车的事件方法
export const addEgscEventHandler = function (target, type, fn) {
  if (target.addEventListener) {
    target.addEventListener(type, fn)
  } else {
    target.attachEvent('on' + type, fn)
  }
}
