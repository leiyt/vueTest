
/**
 * @description 把日期对象转成 yyyy-MM-dd hh:mm:ss 显示格式
 * @param {Object} date Date对象
 * @param {String} res 输出的形式
 */
export function formatDateTime (date, res) {
  let type = '-'
  let y = date.getFullYear()
  let m = date.getMonth() + 1
  m = m < 10 ? '0' + m : m
  let d = date.getDate()
  d = d < 10 ? '0' + d : d
  let h = date.getHours()
  h = h < 10 ? '0' + h : h
  let minute = date.getMinutes()
  minute = minute < 10 ? '0' + minute : minute
  let second = date.getSeconds()
  second = second < 10 ? '0' + second : second
  if (res === 'dateTime') {
    return y + type + m + type + d + ' ' + h + ':' + minute + ':' + second
  } else if (res === 'date') {
    return y + type + m + type + d + ''
  } else {
    return h + ':' + minute + ':' + second
  }
}

/**
 * @description 验证正整数
 * @param {String} value
 */
export function validPositiveInt (value) {
  let g = /^[1-9]*[1-9][0-9]*$/
  return g.test(value)
}
/**
 * @description验证任务名称 过滤空格符
 * @param {String} value
 */
export function validTaskName (value) {
  let g = value.indexOf(' ') >= 0 || value == null
  return !g
}
