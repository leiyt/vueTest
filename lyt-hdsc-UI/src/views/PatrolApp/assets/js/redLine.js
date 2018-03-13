// 初始化地图数据结构转换
export const extendObj = (option, object) => {
  for (let key in object) {
    option[key] = object[key]
  }
  return option
}

/**
 *转换gps，格式化点位对象
 * @param {Array} 需要转换的点位数组
 * @param {mapObject} 地图对象
 * @param {pointType} 点的类型
 * @return {Array} 转换后点位的数组
 */
export const sendHttpPoint = (Array, mapObject, pointType) => {
  let count
  Array.forEach((points, i) => {
    count = i + 1
    let pointX, pointY, gpsLongitude, gpsLatitude, borderPoint
    pointX = points[0]
    pointY = points[1]
    gpsLongitude = null
    gpsLatitude = null
    if (mapObject.mapConfig.sceneType === 1) {
      gpsLongitude = mapObject.transBitmapToWGS(points)[0]
      gpsLatitude = mapObject.transBitmapToWGS(points)[1]
    }
    borderPoint = {
      'pointX': pointX,
      'pointY': pointY,
      'gpsLongitude': gpsLongitude,
      'gpsLatitude': gpsLatitude,
      'pointOrder': count,
      'pointType': pointType,
      'sceneId': mapObject.mapConfig.id
    }
    Array.push(borderPoint)
  })
  Array.splice(0, count)
  return Array
}

/**
 * 转换坐标xy
 * @param {Array} 坐标数组
 * @returns {Array} 转换后的坐标数组
 */
export const showLinePoint = (Array) => {
  let count
  Array.forEach((element, i) => {
    count = i + 1
    let borderPoint = [element.pointX, element.pointY]
    Array.push(borderPoint)
  })
  Array.splice(0, count)
  return Array
}
