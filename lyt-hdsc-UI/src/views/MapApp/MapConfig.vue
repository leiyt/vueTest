
<template>
  <!--外层容器-->
  <div class="map-config">
    <!--信息区域-->
    <div class="map-content">
      <div class="map-part">
        <el-form ref="form" :model="form" label-width="130px" :rules="rules" class="map-form">
          <!--地图类型模块-->
          <el-form-item label="*地图类型" class="el-chiose-map-style">
            <div class="block">
              <el-select v-model="form.mapType" placeholder="请选择">
                <el-option label="百度地图" value="baidu"></el-option>
              </el-select>
            </div>
          </el-form-item>
          <!--经度模块--> 
          <el-form-item label="中心点经度" class="el-center-longitude" prop="mapCenterLongitude">
            <div class="block">
              <el-input v-model.trim="form.mapCenterLongitude" class="center-longitude" ref="input" prop="longitude" :maxlength="10" v-on:blur="blur()"></el-input>
            </div>
          </el-form-item>
          <!--纬度模块-->
          <el-form-item label="中心点纬度" class="el-center-lat" prop="mapCenterLatitude">
            <div class="block">
              <el-input v-model.trim="form.mapCenterLatitude" class="center-lat" ref="input" prop="lat" :maxlength="10" v-on:blur="blur()"></el-input>
            </div>
          </el-form-item>
          <!--滑块-->
          <el-form-item label="*放大等级" class="el-upstep-multiple">
            <div class="block">
              <el-slider v-model="form.mapZLevel" :min="3" :max="18" @change="onChange()">
              </el-slider>
            </div>
          </el-form-item>
          <el-form-item label="*是否使用卫星地图" v-model="form.sat">
            <div class="block">
              <el-radio v-model="form.sat" label="1" @change="onChangeMap()">是</el-radio>
              <el-radio v-model="form.sat" label="0" @change="onChangeMap()">否</el-radio>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <!-- 图片上传 -->
      <div class="map-part">
        <div class="map-upload">
          <div id="mapDiv" class="upload-content"></div>
        </div>
      </div>
    </div>
    <!--底部-->
    <div class="footer-btn">
      <div class="block">
        <el-button type="primary" plain @click="onSubmit">确定</el-button>
        <el-button type="primary" plain @click="onReset">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { setMapSetting, getMapSetting } from '@/views/MapApp/apis/index.js'
import hdmap from 'hdmap'
import { LOG_TAG } from '@/views/MapApp/assets/js/index.js'
export default {
  data () {
    var mapCenterLongitudeNum = (rule, value, callback) => {
      if (Math.abs(value) > 180) {
        callback(new Error('经度值超出范围-180~180，请重新输入!'))
      } else if (!((/^(-?\d+)(\.\d+)?/).test(value))) {
        this.form.mapCenterLongitude = ''
        callback(new Error('请输入数值!'))
      }
    }
    var mapCenterLatNum = (rule, value, callback) => {
      if (Math.abs(value) > 90) {
        callback(new Error('经度值超出范围-90~90，请重新输入!'))
      } else if (!((/^(-?\d+)(\.\d+)?/).test(value))) {
        this.form.mapCenterLatitude = ''
        callback(new Error('请输入数值!'))
      }
    }
    return {
      form: {
        mapType: '',
        // 纬度
        mapCenterLatitude: 39.914935,
        // 经度
        mapCenterLongitude: 116.401969,
        mapZLevel: 8,
        sat: '1'
      },
      data: [],
      rules: {
        mapCenterLatitude: [
          { required: true, message: '请输入纬度值', trigger: 'blur' },
          { min: 2, max: 10, message: '请输入正确的纬度值', trigger: 'blur' },
          { validator: mapCenterLatNum, trigger: 'blur' }
        ],
        mapCenterLongitude: [
          { required: true, message: '请输入经度值', trigger: 'blur' },
          { min: 2, max: 10, message: '请输入正确的经度值', trigger: 'blur' },
          { validator: mapCenterLongitudeNum, trigger: 'blur' }
        ]
      },
      mapObj: {},
      mapObjGPS: {}
    }
  },
  // 页面加载完成后立即定位当前地点信息
  mounted: function () {
    this.initPage()
  },
  methods: {
    /**
    *@description 焦点离开输入框时，数据校验
    */
    blur: function () {
      if ((/^(-?\d+)(\.\d+)?/).test(this.form.mapCenterLongitude)) {
        this.form.mapCenterLongitude = Number(this.form.mapCenterLongitude).toFixed(6)
      }
      if ((/^(-?\d+)(\.\d+)?/).test(this.form.mapCenterLatitude)) {
        this.form.mapCenterLatitude = Number(this.form.mapCenterLatitude).toFixed(6)
      }
      if ((this.form.mapCenterLatitude) && (this.form.mapCenterLongitude)) {
        // 经纬度坐标转化为坐标系坐标
        let tran = this.mapObj.translate_4326_to_3857([Number(this.form.mapCenterLongitude), Number(this.form.mapCenterLatitude)])
        if (this.form.sat === '1') {
          // 判断坐标是否在国内
          if (hdmap.utils.outOfChina(Number(this.form.mapCenterLongitude), Number(this.form.mapCenterLatitude))) {
            // 中心点设置为北京
            this.mapObjGPS.setCenter(this.mapObj.translate_4326_to_3857([116.46, 39.92]), this.form.mapZLevel)
            // 弹窗提示
            const h = this.$createElement
            this.$message({
              message: h('p', null, [
                h('span', null, ''),
                h('i', { style: 'color: red' }, '坐标不在国内，请重新输入！')
              ])
            })
          } else { this.mapObjGPS.setCenter(tran, this.form.mapZLevel) }
        } else {
          if (hdmap.utils.outOfChina(Number(this.form.mapCenterLongitude), Number(this.form.mapCenterLatitude))) {
            this.mapObj.setCenter(this.mapObj.translate_4326_to_3857([116.46, 39.92]), this.form.mapZLevel)
            const h = this.$createElement
            this.$message({
              message: h('p', null, [
                h('span', null, ''),
                h('i', { style: 'color: red' }, '坐标不在国内，请重新输入！')
              ])
            })
          } else {
            this.mapObj.setCenter(tran, this.form.mapZLevel)
          }
        }
      }
    },
    /**
   *@description 取消操作，地图信息恢复原有状态值
   */
    onReset: function () {
      getMapSetting().then(res => {
        this.form.mapType = res.data.data.mapType
        this.form.mapCenterLatitude = res.data.data.mapCenterLatitude
        this.form.mapCenterLongitude = res.data.data.mapCenterLongitude
        this.form.mapZLevel = parseInt(res.data.data.mapZLevel)
        this.form.sat = res.data.data.sat
      }).catch(err => {
        console.warn(LOG_TAG + 'getMapSetting接口调用err')
        console.warn(err)
      })
    },
    /**
   *@description 确定操作，提交地图信息
   */
    onSubmit: function () {
      setMapSetting(this.form).then(res => {
      }).catch(err => {
        console.warn(LOG_TAG + 'setMapSetting接口调用err')
        console.warn(err)
      })
    },
    /**
    *@description 地图放大等级
    */
    onChange: function () {
      if (this.form.sat === '1') {
        this.mapObjGPS._map.getView().setZoom(this.form.mapZLevel)
      } else {
        this.mapObj._map.getView().setZoom(this.form.mapZLevel)
      }
    },
    /**
    *@description 地图类型切换，1代表光栅图，2代表卫星地图
    */
    onChangeMap: function () {
      if ((/^(-?\d+)(\.\d+)?/).test(this.form.mapCenterLongitude)) {
        this.form.mapCenterLongitude = Number(this.form.mapCenterLongitude).toFixed(6)
      }
      if ((/^(-?\d+)(\.\d+)?/).test(this.form.mapCenterLatitude)) {
        this.form.mapCenterLatitude = Number(this.form.mapCenterLatitude).toFixed(6)
      }
      // 如果是光栅图
      if (this.form.sat === '1') {
        this.mapObj.getMap().setTarget(null)
        this.mapObjGPS.getMap().setTarget('mapDiv')
        // 判断坐标是否在国内
        if (hdmap.utils.outOfChina(Number(this.form.mapCenterLongitude), Number(this.form.mapCenterLatitude))) {
          let tran = this.mapObj.translate_4326_to_3857([116.417983, 39.912032])
          this.mapObjGPS.setCenter(tran, this.form.mapZLevel)
        } else {
          let tran = this.mapObj.translate_4326_to_3857([Number(this.form.mapCenterLongitude), Number(this.form.mapCenterLatitude)])
          this.mapObjGPS.setCenter(tran, this.form.mapZLevel)
        }
      } else {
        // 如果是卫星地图
        this.mapObjGPS.getMap().setTarget(null)
        this.mapObj.getMap().setTarget('mapDiv')
        // 判断坐标是否在国内
        if (hdmap.utils.outOfChina(Number(this.form.mapCenterLongitude), Number(this.form.mapCenterLatitude))) {
          let tran = this.mapObj.translate_4326_to_3857([116.417983, 39.912032])
          this.mapObj.setCenter(tran, this.form.mapZLevel)
        } else {
          let tran = this.mapObj.translate_4326_to_3857([Number(this.form.mapCenterLongitude), Number(this.form.mapCenterLatitude)])
          this.mapObj.setCenter(tran, this.form.mapZLevel)
        }
      }
    },
    /**
    *@description 地图初始化
    */
    mapInit: function () {
      let that = this
      try {
        // eslint-disable-next-line
        this.mapObj = new hdmap.initMap({
          gisEngine: 'baidu',
          maxZoom: 18,
          minZoom: 3,
          sat: 0,
          center: [this.form.mapCenterLongitude, this.form.mapCenterLatitude],
          popupDom: {
            popup: 'popup',
            popupcloser: 'popup-closer',
            popupcontent: 'popup-content'
          }
        })
        this.mapObj.getMap().getView().on('change:resolution', function (e) {
          var zoom = that.mapObj.getZoom()
          if (Number(zoom).toString().indexOf('.') === -1) {
            that.form.mapZLevel = zoom
          }
        })
      } catch (err) {
        console.log(LOG_TAG + '获取地图放大缩小事件getView() err')
        console.log(err)
      }
      try {
        // eslint-disable-next-line
        this.mapObjGPS = new hdmap.initMap({
          gisEngine: 'baidu',
          maxZoom: 18,
          minZoom: 3,
          sat: 1,
          center: [this.form.mapCenterLongitude, this.form.mapCenterLatitude],
          popupDom: {
            popup: 'popup',
            popupcloser: 'popup-closer',
            popupcontent: 'popup-content'
          }
        })
        this.mapObjGPS.getMap().getView().on('change:resolution', function (e) {
          var zoom = that.mapObjGPS.getZoom()
          if (Number(zoom).toString().indexOf('.') === -1) {
            that.form.mapZLevel = zoom
          }
        })
      } catch (err) {
        console.log(LOG_TAG + 'err')
        console.log(err)
      }
      this.onChangeMap()
    },
    /**
    *@description 页面初始化
    */
    initPage: function () {
      getMapSetting().then(res => {
        this.form.mapType = res.data.data.mapType
        this.form.mapCenterLatitude = res.data.data.mapCenterLatitude
        this.form.mapCenterLongitude = res.data.data.mapCenterLongitude
        this.form.mapZLevel = parseInt(res.data.data.mapZLevel)
        this.form.sat = res.data.data.sat
        this.mapInit()
        this.mapObj._map.getView().setZoom(Number(this.form.mapZLevel))
      }).catch(err => {
        console.warn(LOG_TAG + 'getMapSetting接口调用err')
        console.warn(err)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.map-config {
  box-sizing: border-box;
  position: absolute;
  top: 90px;
  bottom: 20px;
  left: 225px;
  right: 20px;
  display: flex;
  align-content: center;
  flex-direction: column;
  margin-top: 120px;
  .map-content {
    display: flex;
    align-items: center;
    justify-content: space-around;
    .map-form {
      width: 380px;
    }
    .map-upload {
      width: 400px;
      height: 400px;
      border: 10px solid #ccc;
      text-align: center;
      line-height: 300px;
      width: 400px;
      .upload-content {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.el-chiose-map-style,
.el-center-lat,
.el-center-longitude,
.el-upstep-multiple {
  width: 90%;
}
.block {
  width: 200px;
  margin: 0 auto;
}
.img-upload > div {
  width: 100%;
}
.footer-btn {
  margin-top: 100px;
  box-sizing: border-box;
}
.el-button + .el-button {
  margin-left: 50px;
}
</style>
