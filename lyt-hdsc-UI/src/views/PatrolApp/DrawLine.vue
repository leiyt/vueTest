<template>
  <div class="drawline-app">
    <div class="controlCon">
      <el-row :gutter="20">
        <el-col :span="18">
          <el-switch v-model="flag" :warning="closeFlag" active-value="1" inactive-value="0" @change="changeDrawLine" active-text="开启画线工具" inactive-text="关闭画线工具"></el-switch>
          <el-button type="primary" @click="saveLine" :disabled="isShowSave">保存巡查路线配置图</el-button>
          <el-button type="danger" @click="deleteLine" :disabled="isCanDelete">删除巡查路线配置图</el-button>
          <el-button type="primary" @click="goBackToPatrolParam">返回巡查路线配置表</el-button>
        </el-col>
        <el-col :span="6">
          <span> 场景名称： </span>
          <el-select v-model="sceneValue" placeholder="请选择" @change="changeScene">
            <el-option-group v-for="group in sceneList" :key="group.sceneType" :label="group.sceneType === '1' ? '园区场景' : '停车场场景'">
              <el-option v-for="item in group.options" :key="item.id" :label="item.sceneName" :value="item.id">
              </el-option>
            </el-option-group>
          </el-select>
        </el-col>
      </el-row>
      <transition name="el-zoom-in-top">
        <el-alert title="双击鼠标左键完成线路绘制" type="success" :closable="false"></el-alert>
      </transition>
    </div>
    <el-container class="map">
      <div id="bitmap" class="bitmap">
        <div id="popup" class="ol-popup">
          <a href="#" id="popup-closer" class="ol-popup-closer"></a>
          <div id="popup-content"></div>
        </div>
        <h3 v-if="isLoadingMap" class="initMapFail">地图加载中，请稍等……</h3>
        <h3 v-if="isInitMapFail" class="initMapFail">地图加载失败……</h3>
      </div>
    </el-container>
  </div>
</template>
<script>
import {
  extendObj,
  sendHttpPoint,
  showLinePoint
} from '@/views/PatrolApp/assets/js/redLine.js'

import {
  getSceneListData,
  postSavePartolLineData,
  postDeltetPatrolLineData,
  getPatrolLineData
} from '@/views/PatrolApp/apis/redLineApp'

import patrolPoint from '@/views/PatrolApp/assets/images/巡查点.png'
export default {
  props: {
    showMap: {
      required: true,
      type: Boolean,
      default () {
        return false
      }
    },
    rowInfo: {},
    pointrelationInfo: {}
  },
  data () {
    return {
      sceneList: [],
      sceneValue: '',
      sceneId: '',
      areaId: '',
      sceneType: '',
      flag: false,
      closeFlag: false,
      isShowEdit: true,
      isShowSave: false,
      isCanDelete: false,
      isSaveLine: false,
      isLoadingMap: false,
      isInitMapFail: false,
      redLineInfo: {
        id: '',
        name: '',
        areaType: 4,
        borderPoints: []
      },
      // 画线操作
      optionLine: {
        id: '',
        name: '',
        markerType: 3,
        borderPoints: []
      },
      // 当前的地图对象
      mapObj: null,
      paramInfo: {},
      relationInfo: {}
    }
  },
  mounted () {
    this.isLoadingMap = true
    // 获取场景列表
    getSceneListData()
      .then(res => {
        if (res.code === '00000') {
          this.isLoadingMap = false
          this.sceneList = res.data
          this.sceneValue = res.data[0].options[0].id
          this.sceneId = this.sceneValue
          this.redLineInfo.id = this.sceneValue
          this.redLineInfo.name = res.data[0].options[0].sceneName
        }
      })
      .catch(err => {
        console.warn(err)
        this.isLoadingMap = false
        this.isInitMapFail = true
      })
  },
  methods: {
    // 创建地图
    createMap (option) {
      this.redLineInfo.id = option.id
      this.redLineInfo.name = option.sceneName
      this.sceneId = option.id
      option.mapUrl = option.url
      option.sizeW = option.width
      option.sizeH = option.height
      option.center = [0, 0]
      option.centerGPS = [option.centerLon, option.centerLat]
      if (this.mapObj) {
        this.mapObj.getMap().setTarget(null)
      }
      // 初始化地图对象
      let mapOption = extendObj({
        gisEngine: 'bitmap',
        domId: 'bitmap',
        mapUrl: '',
        sizeW: 1920,
        sizeH: 1080,
        maxZoom: 8,
        minZoom: 1,
        scaleType: 1,
        scale: 2,
        center: [0, 0],
        centerGPS: [113.26, 23.15],
        popupDom: {
          popup: 'popup',
          popupcloser: 'popup-closer',
          popupcontent: 'popup-content'
        }
      }, option)
      // eslint-disable-next-line
      this.mapObj = new hdmap.initMap(mapOption)
      this.mapObj.getMap().setTarget('bitmap')
      // 注册地图上的点击事件
      this.mapObj.regEventListener('singleclick', e => {
        if (e.feature) {
          let markerId = e.feature.markerId
          this.selectedMarker.markerId = markerId
          console.log(markerId)
          if (e.feature) {
            this.mapObj.popupDefault(e.coordinate, e.feature.name)
          } else {
            this.mapObj.closePopup()
            console.log(e.coordinate)
          }
        }
      })
      // 渲染巡查点位
      if (this.relationInfo.patrolPoints && this.relationInfo.patrolPoints.length > 0) {
        let patrolPoints = this.relationInfo.patrolPoints
        let markerPoint = {}
        patrolPoints.forEach(item => {
          if (item.mapId === this.sceneId) {
            markerPoint.id = item.uuid
            markerPoint.markerType = 3
            markerPoint.position = [item.xValue, item.yValue]
            markerPoint.markerName = item.pointName
            markerPoint.imgUrl = patrolPoint
            markerPoint.size = [40, 40]
            this.mapObj.addMarker(markerPoint)
          }
        })
      }
      // 发送查询巡查路线请求
      getPatrolLineData({ sceneId: this.sceneId, paramId: this.paramInfo.uuid })
        .then(res => {
          if (res.data.id) {
            this.closeFlag = true
            this.isCanDelete = false
            this.isShowEdit = false
            this.isShowSave = true
            this.optionLine.id = res.data.id
            this.areaId = this.optionLine.id
            this.optionLine.name = res.data.areaName
            this.optionLine.borderPoints = showLinePoint(res.data.borderPoints)
            this.mapObj.addLine(this.optionLine, { color: '#fbb134', width: 8 })
          } else {
            this.closeFlag = false
          }
        })
        .catch(res => {
          console.log(res)
        })
    },
    //  画线操作部分
    changeDrawLine (params) {
      if (this.closeFlag) {
        this.$message({ message: '请先保存或者删除该路线', type: 'warning' })
        this.isSaveLine = false
        this.flag = 0
        return
      }
      if (params === '1' && !this.closeFlag) { // 开启画线工具
        this.mapObj.openDrawLineTool({ color: '#fbb134', width: 6 }, null, null,
          e => {
            this.optionLine.borderPoints = e.feature.getGeometry().getCoordinates()
            this.isSaveLine = true
            this.isShowEdit = false
            this.closeFlag = true
          },
          e => {
            this.optionLine.borderPoints = e.features.array_[0].getGeometry().getCoordinates()
            this.isShowEdit = true
            this.isSaveLine = true
          },
          false)
      } else {
        this.mapObj.closeDrawLineTool()
      }
    },
    // 保存巡更路线
    saveLine (e) {
      this.mapObj.closeDrawLineTool()
      if (this.optionLine.borderPoints.length === 0) {
        this.$message({ message: '请完成画线后再保存', type: 'warning' })
        return
      }
      this.optionLine.id = this.paramInfo.uuid
      this.optionLine.name = this.paramInfo.paramName
      this.optionLine.borderPoints = this.mapObj.showDrawLine(this.optionLine).getGeometry().getCoordinates()
      this.mapObj.updateLine(this.optionLine, new ol.style.Style({
        stroke: new ol.style.Stroke({ color: '#fbb134', width: 8 })
      }))
      if (this.isSaveLine) {
        this.flag = 1
        this.isShowEdit = true
        this.isSaveLine = true
        this.closeFlag = true
        this.isCanDelete = false
        // 格式化参数对象
        let optionLine = {}
        optionLine.paramId = this.optionLine.id
        optionLine.paramName = this.optionLine.name
        optionLine.sceneId = this.sceneValue
        optionLine.borderPoints = this.optionLine.borderPoints
        optionLine.borderPoints = sendHttpPoint(optionLine.borderPoints, this.mapObj, 2)
        postSavePartolLineData(optionLine)
          .then(res => {
            if (res.code === '00000') {
              this.areaId = res.data
              this.isShowSave = true
              this.isSaveLine = !this.isSaveLine
              this.$message({ message: '巡更路线保存成功！', type: 'success' })
            }
            if (res.code === '00400') {
              this.$message({ message: '保存失败，该场景已存在该路线的路线地图，请先删除原路线地图再进行保存操作', type: 'warning' })
            }
          })
          .catch(res => {
            if (res.code === '00400') {
              this.$message.error('保存失败，请重试~~~~')
            }
          })
      }
    },
    // 删除路线操作
    deleteLine () {
      this.flag = 0
      this.mapObj.closeDrawLineTool()
      this.isCanDelete = false
      // // 查询巡更路线
      getPatrolLineData({ sceneId: this.sceneId, paramId: this.paramInfo.uuid })
        .then(res => {
          this.optionLine.borderPoints = res.data.borderPoints
        })
        .catch(res => {
          console.log(res)
        })
      if (this.closeFlag && this.areaId) {
        this.$confirm('确定要删除巡更路线吗?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
          .then(() => {
            postDeltetPatrolLineData({ areaId: this.areaId })
              .then(res => {
                this.areaId = ''
                this.$message({ message: '路线删除成功！', type: 'success' })
                this.mapObj.removeLine(this.optionLine)
                this.mapObj.clearDrawLine()
                this.closeFlag = false
                this.isShowEdit = false
                this.isShowSave = false
                this.isSaveLine = true
                this.optionLine.borderPoints = []
              })
              .catch(res => {
                console.log(res)
                this.isSaveLine = false
                this.$message({ message: '路线删除失败！', type: 'warning' })
              })
          })
          .catch(() => { this.$message({ type: 'info', message: '已取消删除' }) })
      } else {
        this.isSaveLine = true
        this.isShowSave = false
        this.closeFlag = false
        this.mapObj.clearDrawLine()
        this.optionLine.borderPoints = []
        this.areaId = ''
      }
    },
    // 切换场景地图
    changeScene () {
      this.areaId = ''
      this.sceneId = this.sceneValue
      this.sceneList.forEach(item => {
        item.options.forEach(i => {
          if (i.id === this.sceneValue) {
            this.createMap(i)
            this.sceneType = i.sceneType
            this.closeFlag = false
            this.isShowSave = false
          }
        })
      })
    },
    // 返回巡查路线
    goBackToPatrolParam () {
      // 触发巡查路线组件的fromDrawLine方法
      this.closeFlag = false
      this.isShowSave = false
      this.$emit('fromDrawLine')
    }
  },
  watch: {
    showMap (val) {
      if (val) {
        this.paramInfo = this.rowInfo ? this.rowInfo : {}
        this.relationInfo = this.pointrelationInfo ? this.pointrelationInfo : {}
        console.log('paramInfo', this.paramInfo)
        console.log('relationInfo', this.relationInfo)
        this.sceneValue = this.sceneList[0].options[0].id
        this.createMap(this.sceneList[0].options[0])
      }
    }
  }
}
</script>
<style scoped lang='less'>
.drawline-app {
  height: 100%;
  width: 100%;
  margin-top: -20px;

  .controlCon {
    height: 80px;

    .el-row {
      margin-bottom: 0;
    }
  }

  .map {
    box-sizing: border-box;
    width: 1640px;
    height: 770px;
    padding: 10px;
    border: 1px solid #999;
  }

  .bitmap {
    background: #55616d;
    width: 1620px;
    height: 750px;
  }

  .initMapFail {
    color: #fff;
    text-align: center;
    margin: 30px 0;
  }

  .row {
    margin-top: 4px;
  }
}
</style>
