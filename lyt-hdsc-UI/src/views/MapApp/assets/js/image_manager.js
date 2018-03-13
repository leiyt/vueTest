import broadcastImg from '@/views/MapApp/assets/images/ico_local_broadcast.png'
import cameraImg from '@/views/MapApp/assets/images/ico_local_camera.png'
import ballheadImg from '@/views/MapApp/assets/images/ico_local_ballhead.png'
import defaultImg from '@/views/MapApp/assets/images/ico_local_default.png'
/*
  点位类型
  1-视频设备
  2-广播设备
  3-巡更点
  4-汽车
*/
export const getImgByType = (type) => {
  let img
  if (type === 1) {
    img = cameraImg
  } else if (type === 2) {
    img = broadcastImg
  } else if (type === 3) {
    img = cameraImg
  } else if (type === 4) {
    img = ballheadImg
  } else {
    img = defaultImg
  }
  return img
}
