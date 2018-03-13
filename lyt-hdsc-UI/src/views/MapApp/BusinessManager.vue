<template>
  <div class="map-app">
    <div class="row-flow main">
      <div class="content-center">
        <div class="button-group">
          <el-button :type="btnType" @click="onModifyMap" :data-flag="editFlag" class="search-btn">{{msg}}</el-button>
          <el-button type="primary" @click="onDeleteFeature" class="search-btn">删除点位</el-button>
        </div>
        <div id="mapDiv" @drop="drop($event)" @dragover="allowDrop($event)">
        </div>
      </div>
      <div class="content-left">
        <div class="search-sence-area">
          <el-form ref="sceneParam" v-model="sceneParam" label-width="80px" class="search-form">
            <el-form-item label="场景类型" class="common-input">
              <el-select v-model="sceneParam.sceneType" placeholder="请选择" @change="onSceneTypeChange">
                <el-option v-for="item in SceneTypes" :label="item.itemName" :value="item.itemCode" :key="item.itemCode">{{item.itemName}}</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="场景名称" label-width="80px" class="common-input">
              <el-input v-model="sceneParam.sceneName" maxLength="" placeholder="请输入场景名称"></el-input>
            </el-form-item>
            <div class="search-toolbar">
              <el-button type="primary" @click.stop="onQuerySceneList" class="search-btn" ref="querySceneListBtn">查询</el-button>
              <el-button type="primary" @click="onResetSceneParam" class="search-btn">重置</el-button>
            </div>
          </el-form>
        </div>
        <div class="list-area">
          <ul class="data-list">
            <li v-for="(sceneItem, index) in sceneList" :key="sceneItem.id" class="list-item sceneItem" :class="{ active: index == currentScene }" @click="onShowScene(index, sceneItem.id)">
              {{ sceneItem.sceneName }}
            </li>
          </ul>
        </div>
      </div>
      <div class="content-right">
        <div class="search-device-area">
          <el-form ref="deviceParam" v-model="deviceParam" label-width="80px" class="search-form">
            <el-form-item label="设备类型" class="common-input">
              <el-select v-model="deviceParam.deviceType" placeholder="请选择" @change="onDeviceTypeChange">
                <el-option v-for="item in deviceTypes" :label="item.deviceTypeDesc" :value="item.deviceTypeCode" :key="item.deviceTypeCode">{{item.deviceTypeDesc}}</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="设备名称" label-width="80px" class="common-input">
              <el-input v-model="deviceParam.deviceName" maxLength="" placeholder="请输入设备名称"></el-input>
            </el-form-item>
            <!-- 组织树 -->
            <el-popover ref="orgPopover" placement="top-end" width="174" v-model="isShowPopover">
              <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
              <el-tree class="filter-tree" :data="OrgTree" :props="defaultProps" default-expand-all :filter-node-method="filterNode" @node-click="handleNodeClick" ref="tree"></el-tree>
            </el-popover>
            <el-form-item label="所属组织" label-width="80px" class="common-input">
              <el-input v-model="OrgName" placeholder="请选择组织" readonly v-popover:orgPopover></el-input>
            </el-form-item>
            <div class="search-toolbar">
              <el-button type="primary" @click="onQueryDeviceList" class="search-btn">查询</el-button>
              <el-button type="primary" @click="onResetDeviceParam" class="search-btn">重置</el-button>
            </div>
          </el-form>
        </div>
        <div class="list-area">
          <ul class="data-list device-list">
            <li v-for="(deviceItem, key) in deviceList" :key="key" class="list-item">
              <div @click.stop.prevent="onCheckdevice(key,$event,deviceItem.deviceId,deviceItem.deviceName)" draggable="true" @dragstart="drag($event)" :data-devicecode="deviceItem.deviceCode" :data-deviceid="deviceItem.deviceId" :data-devicename="deviceItem.deviceName" class="item-single-line">
                <div class="device-icon">
                  <i class="icon-item" :style="{background:backgroundUrl }"></i>
                </div>
                <dl class="device-text-group">
                  <dt class="device-name-text" :title="deviceItem.deviceName" :ref="deviceItem.deviceId" :data-parent="key">{{deviceItem.deviceName}}</dt>
                  <dd class="device-desc-text" :title="deviceItem.deviceDesc">{{deviceItem.deviceDesc}}</dd>
                </dl>
              </div>

              <ul class="sub-device-list" v-if="deviceItem.subDevice&&deviceItem.subDevice.length>0">
                <li v-for="(subDeviceItem,sonkey) in deviceItem.subDevice" :key="subDeviceItem.subDeviceId" class="list-item">
                  <div @click.stop.prevent="onCheckdevice(key,$event,subDeviceItem.subDeviceId,subDeviceItem.subDevicName,sonkey)" draggable="true" @dragstart="drag($event)" :data-devicecode="subDeviceItem.subDeviceCode" :data-deviceid="subDeviceItem.subDeviceId" :data-devicename="subDeviceItem.subDevicName" class="item-single-line">
                    <div class="device-icon">
                      <i class="icon-item" :style="{background:backgroundUrl }"></i>
                    </div>
                    <dl class="device-text-group sub-device">
                      <dt class="device-name-text" :title="subDeviceItem.subDevicName" :ref="subDeviceItem.subDeviceId" :data-parent="key" :data-son="sonkey">{{subDeviceItem.subDevicName}}</dt>
                      <dd class="device-desc-text" :title="subDeviceItem.subDeviceDesc">{{subDeviceItem.subDeviceDesc}}</dd>
                    </dl>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrgTree, getDeviceList, getDictionary, getMarkerList, getMarkerInfo, addMarker, updateMarker, deleteMarker, getSceneList, getSceneInfo, getDeviceInfo } from '@/views/MapApp/apis/index.js'
import { mapOptionFormat, extendObj, markerListFormat, featureToMarker, LOG_TAG } from '@/views/MapApp/assets/js/index.js'
import { getImgByType } from '@/views/MapApp/assets/js/image_manager.js'
import camerm from '@/views/MapApp/assets/images/camerm.png'
import radio from '@/views/MapApp/assets/images/radio.png'
import ballhead from '@/views/MapApp/assets/images/ballhead.png'
import hdmap from 'hdmap'
export default {
  data () {
    return {
      backgroundUrl: '#fff', // 设备图标的背景图
      imgUrl1: radio,
      imgUrl: camerm,
      imgUrl2: ballhead,
      btnType: 'primary',
      editFlag: false,
      msg: '开启地图编辑',
      SceneTypes: [
      ],
      deviceTypes: [
      ],
      isShowPopover: false,
      OrgTree: [],
      exportOrgNode: {},
      OrgName: '',
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      sceneParam: {
        sceneName: '',
        sceneType: '1'
      },
      deviceParam: {
        deviceType: '2001',
        deviceName: '',
        orgId: '',
        deviceIp: ''
      },
      sceneList: [],
      deviceList: [],
      // 当前的地图对象
      mapObj: null,
      // 加载过的地图缓存在cacheMapList中进行缓存
      cacheMapList: {},
      selFeatures: {},
      draggingDevice: {},
      currentScene: null,
      currentSceneId: 0,
      selectedMarker: {},
      // 目前默认是 commonLayer
      currentLayer: 'commonLayer'
    }
  },
  mounted: function () {
    let _this = this
    this.backgroundUrl = 'url(' + this.imgUrl + ')'
    this.onQuerySceneList()
    this.onQueryDeviceList()
    // 加载默认小区地图
    getSceneList({
      sceneName: '',
      sceneType: '1'
    }).then((res) => {
      _this.createMap(res.data.data[0])
    }).catch(err => {
      console.warn(LOG_TAG + 'getSceneList接口调用err')
      console.warn(err)
    })
    getOrgTree().then((res) => {
      this.exportOrgNode.rootUuid = res.data.data.uuid
      this.OrgTree.splice(0, this.OrgTree.length)
      this.OrgTree.push(res.data.data)
    }).catch(err => {
      console.warn(LOG_TAG + 'getOrgTree接口调用err')
      console.warn(err)
    })
    getDictionary().then(res => {
      let dictionary = res.data.data
      _this.SceneTypes = dictionary.dictCodeType.sceneType
      _this.deviceTypes = dictionary.deviceType
    }).catch(err => {
      console.warn(LOG_TAG + 'getDictionary接口调用err')
      console.warn(err)
    })
  },
  methods: {
    /**
     * @description 点位管理 初始化地图
     * @param {Object} option 地图初始化的对象参数
     */
    createMap: function (option) {
      let _this = this
      // 获取小区真实地图图片
      let mapImageUrl = option.url
      if (this.mapObj) {
        this.mapObj.getMap().setTarget(null)
      }
      // 已经初始化的地图可以直接获取地图对象，进行地图的替换即可
      if (this.cacheMapList[option.id]) {
        this.mapObj = this.cacheMapList[option.id]
        this.mapObj.getMap().setTarget('mapDiv')
        return
      }
      // 如果没有初始化过，才需要进行地图的初始化
      let formatedOption = mapOptionFormat(option)
      let mapOption = extendObj(formatedOption, {
        gisEngine: 'bitmap',
        domId: 'mapDiv',
        mapUrl: mapImageUrl,
        sizeW: 1920,
        sizeH: 1080,
        maxZoom: 6,
        minZoom: 1,
        zoom: 2,
        center: [112.334403, 39.8],
        popupDom: {
          popup: 'popup',
          popupcloser: 'popup-closer',
          popupcontent: 'popup-content'
        }
      })
      // eslint-disable-next-line
      this.cacheMapList[option.id] = new hdmap.initMap(mapOption)
      this.mapObj = this.cacheMapList[option.id]
      this.mapObj.getMap().setTarget('mapDiv')
      // 获取并显示点位
      getMarkerList({ sceneId: option.id }).then((res) => {
        let markerlist = markerListFormat(res.data.data)
        this.mapObj.addMarkers(markerlist)
      })
      // 注册地图上的点击事件
      this.mapObj.regEventListener('singleclick', function (e) {
        // 每次点击选中点位，都将当前markerId保存起来，供删除时调用
        if (e.feature) {
          if (e.feature.markerId) {
            _this.selectedMarker.markerId = e.feature.markerId
            _this.selectedMarker.id = e.feature.id
            checkDeviceName(e.feature.id, e.feature.markerId, e)
          } else {
            // 新增的点位中，如果e.feature里没有markerId，需要通过deviceId或id查询到markerId,并保存到selectedMarker
            getMarkerInfo({
              deviceId: e.feature.id
            }).then(res => {
              let markerId = res.data.data.id
              _this.selectedMarker.markerId = markerId
              _this.selectedMarker.id = e.feature.id
              checkDeviceName(e.feature.id, markerId, e)
            }).catch(err => {
              console.warn(LOG_TAG + 'getMarkerInfo接口调用err')
              console.warn(err)
            })
          }
        } else {
          // 点击点位以外的位置时关闭提示
          _this.mapObj.closePopup()
        }
      })
      /**
     * @description 点位管理 checkDeviceName函数 检查设备名
     * @param {String} deviceId 设备ID
     * @param {String} markerId 点位ID
     * @param {Object} event Event 对象
     */
      function checkDeviceName (deviceId, markerId, e) {
        getDeviceInfo({
          deviceId: deviceId
        }).then(res => {
          let newDeviceName = res.data.data.deviceName
          if (newDeviceName) {
            _this.mapObj.popupDefault(e.coordinate, newDeviceName)
          } else {
            _this.mapObj.popupDefault(e.coordinate, 'undefined')
          }
          if (newDeviceName !== e.feature.markerName) {
            // 如果有对应设备在渲染列表中，更新相应的数据
            if (_this.$refs[deviceId]) {
              let parentLevel = _this.$refs[deviceId][0].dataset.parent
              let sonLevel = _this.$refs[deviceId][0].dataset.son
              if (sonLevel === undefined) {
                // 一级设备
                _this.deviceList[parentLevel]['deviceName'] = newDeviceName
              } else {
                // 二级设备
                _this.deviceList[parentLevel]['subDevice'][sonLevel]['subDevicName'] = newDeviceName
              }
            }
            e.feature.markerName = newDeviceName
            e.feature.name = newDeviceName
            e.feature.markerId = markerId
            updateMarker(e.feature)
          }
        })
      }
    },
    /**
     * @description 点位管理 dragstart函数
     * @param {Object} event Event 对象
     */
    drag: function (event) {
      let _this = this
      this.editFlag = false
      this.msg = '开启地图编辑'
      this.btnType = 'primary'
      // 记录拖动的设备的信息
      let deviceCode = event.target.dataset.devicecode
      this.draggingDevice.deviceId = event.target.dataset.deviceid
      this.draggingDevice.deviceCode = deviceCode
      this.draggingDevice.deviceName = event.target.dataset.devicename
      if (deviceCode === '2003' || deviceCode === '3007' || deviceCode === '3008' || deviceCode === '3009') {
        this.draggingDevice.markerType = 4
      } else if (deviceCode === '2019' || deviceCode === '3022') {
        this.draggingDevice.markerType = 2
      } else {
        this.draggingDevice.markerType = 1
      }
      // 保存判断设备是否被占用的信息
      let isCoppied = false
      let relatedSceneId = null
      let relatedMarkerId = null
      getMarkerInfo({
        deviceId: event.target.dataset.deviceid
      }).then(res => {
        if (res.data.data === null) {
          isCoppied = false
          relatedSceneId = null
          relatedMarkerId = null
        } else {
          isCoppied = true
          relatedSceneId = res.data.data.sceneId
          relatedMarkerId = res.data.data.id
        }
        _this.draggingDevice.isCoppied = isCoppied
        _this.draggingDevice.relatedSceneId = relatedSceneId
        _this.draggingDevice.relatedMarkerId = relatedMarkerId
      })
      // 设置拖拽时显示的图片
      let img = new Image()
      let imgUrl = event.target.getElementsByTagName('i')[0].style.backgroundImage.replace(/^(url\(")/, '').replace(/("\))$/, '')
      if (imgUrl) {
        img.src = imgUrl
        event.dataTransfer.setDragImage(img, 10, 10)
      }
    },
    /**
     * @description 点位管理 drop函数
     * @param {Object} event Event 对象
     */
    drop: function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.mapObj.closePopup()
      let _this = this
      if (parseInt(this.sceneParam.sceneType) === 1) {
        // 如果场景类型是小区全图，则禁止条件点位
        this.$message({
          message: '小区全图不允许添加设备点位！',
          type: 'warning'
        })
      } else {
        // 判断当前地图是否已经有此设备的点位
        let marker = this.mapObj.getMarkerBylayerKey(this.draggingDevice.deviceId, 'commonLayer')
        if (this.currentScene === null) {
          this.$message({
            message: '请先在左边选中要添加场景',
            type: 'warning'
          })
        } else {
          // 鼠标释放时的坐标和经纬度
          let coordinate = this.mapObj.getMap().getEventCoordinate(event)
          let centerGPS = this.mapObj.mapConfig.centerGPS
          // 现在的地图引擎transBitmapToWGS方法调用时，会改变传入的数组参数，所以创建一个新数组接收原来的坐标值
          let temPos = []
          temPos[0] = coordinate[0]
          temPos[1] = coordinate[1]
          let gps = null
          if (centerGPS[0] >= 180 || centerGPS[0] <= -180 || centerGPS[1] >= 90 || centerGPS[1] <= -90) {
            console.log('该地图centerGPS已超出合理范围！')
          } else {
            gps = this.mapObj.transBitmapToWGS(temPos)
          }
          if (this.draggingDevice.relatedSceneId) {
            // 该点位已经被使用
            if (this.draggingDevice.relatedSceneId === this.sceneList[this.currentScene].id) {
              // 如果点位已经存在，只需要将点位更新到新的位置即可
              marker.getGeometry().setCoordinates(coordinate)
              marker.extProperties.position = coordinate
              marker.extProperties.GPS = gps
              // 获取对应的点位id
              marker.extProperties.markerId = this.draggingDevice.markerId
              this.updateMarkerInfo(marker.extProperties)
            } else {
              // 该点位已经被其他场景占用
              getSceneInfo({
                sceneId: _this.draggingDevice.relatedSceneId
              }).then(result => {
                let name = result.data.data.sceneName
                _this.$message({
                  message: '点位已被场景 [ ' + name + ' ] 占用',
                  type: 'warning'
                })
              })
            }
          } else {
            // 鼠标释放后新增点位图层
            let markerObj = {}
            markerObj.id = this.draggingDevice.deviceId
            markerObj.position = coordinate
            if (gps) {
              markerObj.GPS = gps
              markerObj.latitude = gps[0]
              markerObj.longitude = gps[1]
            } else {
              markerObj.GPS = []
            }
            markerObj.name = this.draggingDevice.deviceName
            markerObj.markerName = markerObj.name
            let type = this.draggingDevice.markerType
            markerObj.imgUrl = getImgByType(type)
            markerObj.markerType = type
            this.addDeviceMarker(markerObj)
          }
        }
      }
    },
    /**
    * @description 点位管理 dragover函数
    * @param {Object} event Event 对象
    */
    allowDrop: function (event) {
      event.preventDefault()
    },
    /**
     * @description 点位管理 获取设备列表
     */
    onQueryDeviceList: function () {
      if (this.mapObj) {
        this.mapObj.closePopup()
      }
      let _this = this
      this.editFlag = false
      this.msg = '开启地图编辑'
      this.btnType = 'primary'
      if (this.deviceParam.deviceType === '') {
        this.$message({
          message: '请先选择要查询的设备类型！',
          type: 'warning'
        })
      } else {
        getDeviceList(this.deviceParam).then((res) => {
          _this.deviceList = res.data.data
        }).catch(err => {
          console.warn(LOG_TAG + 'getDeviceList接口调用err')
          console.warn(err)
        })
      }
    },
    /**
     * @description 点位管理 获取场景列表
     */
    onQuerySceneList: function () {
      if (this.mapObj) {
        this.mapObj.closePopup()
      }
      let that = this
      this.editFlag = false
      this.msg = '开启地图编辑'
      this.btnType = 'primary'
      if (this.sceneParam.sceneType === '') {
        this.$message({
          message: '请选择场景类型！',
          type: 'warning'
        })
      } else {
        getSceneList(this.sceneParam).then((res) => {
          // 每次查询完后，把默认选中去掉
          that.currentScene = null
          that.sceneList = res.data.data
        }).catch(err => {
          console.warn(LOG_TAG + 'getSceneList接口调用err')
          console.warn(err)
        })
      }
    },
    /**
     * @description 点位管理 重置场景查询参数
     */
    onResetSceneParam: function () {
      // 不发请求，不清空场景列表，只清空参数
      this.sceneParam.sceneType = ''
      this.sceneParam.sceneName = ''
    },
    /**
     * @description 点位管理 场景类型切换
     */
    onSceneTypeChange: function () {
      let that = this
      getSceneList(this.sceneParam).then((res) => {
        that.sceneList = res.data.data
        // 列表刷新后将默认不选择任何场景
        that.currentScene = null
      }).catch(err => {
        console.warn(LOG_TAG + 'err')
        console.warn(err)
      })
    },
    /**
     * @description 点位管理 设备类型切换
     */
    onDeviceTypeChange: function () {
      let that = this
      getDeviceList(that.deviceParam).then((res) => {
        that.deviceList = res.data.data
        // 根据设备类型判断设备的图标
        if (Number(that.deviceParam.deviceType) === 2001 || Number(that.deviceParam.deviceType) === 2002 || Number(that.deviceParam.deviceType) === 2004) {
          that.backgroundUrl = 'url(' + that.imgUrl + ')'
        } else if (Number(that.deviceParam.deviceType) === 2003) {
          that.backgroundUrl = 'url(' + that.imgUrl2 + ')'
        } else if (Number(that.deviceParam.deviceType) === 2019) {
          that.backgroundUrl = 'url(' + that.imgUrl1 + ')'
        } else {
          that.backgroundUrl = '#fff'
        }
      }).catch(err => {
        that.backgroundUrl = '#fff'
        console.warn(LOG_TAG + '查询设备列表err')
        console.warn(err)
      })
    },
    /**
     * @description 点位管理 获取场景详细信息
     */
    onShowScene: function (index, sceneId) {
      this.editFlag = false
      this.msg = '开启地图编辑'
      this.btnType = 'primary'
      this.currentScene = index
      this.currentSceneId = sceneId
      let options = {}
      options.sceneId = this.sceneList[index].id
      getSceneInfo(options).then((res) => {
        // TODO 切换地图
        if (res.data.data) {
          this.createMap(res.data.data)
        }
      }).catch(err => {
        console.warn(LOG_TAG + '获取场景信息失败')
        console.warn(err)
      })
    },
    /**
     * @description ElementUI 的功能函数
     */
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    /**
     * @description ElementUI 的功能函数
     */
    handleNodeClick (data) {
      this.OrgName = data.name
      this.deviceParam.orgId = data.uuid
      this.isShowPopover = false
      this.filterText = ''
    },
    /**
     * @description 点位管理 重置设备查询参数
     */
    onResetDeviceParam: function () {
      // 清空参数（设备类型重置为2001），清空列表，发送请求
      this.deviceParam.deviceType = '2001'
      this.deviceParam.deviceName = ''
      this.deviceParam.orgId = ''
      this.OrgName = ''
      let that = this
      getDeviceList(that.deviceParam).then((res) => {
        that.deviceList = res.data.data
        this.backgroundUrl = 'url(' + this.imgUrl + ')'
      }).catch(err => {
        that.backgroundUrl = '#fff'
        console.warn(LOG_TAG + '重置查询设备列表err')
        console.warn(err)
      })
    },
    /**
     * @description 点位管理 点击设备列表的设备，使地图显示该设备的点位
     * @param {string} key 一级设备的键
     * @param {Object} e Event对象
     * @param {string} id 子设备的id
     * @param {oldname} oldname 设备的旧名称
     */
    onCheckdevice: function (key, e, id, oldname) {
      let _this = this
      let _arguments = arguments
      _this.mapObj.closePopup()
      // 查询设备名称，如果已经修改，相关的markerName也要修改
      getDeviceInfo({
        deviceId: id
      }).then(res => {
        let newDeviceName = res.data.data.deviceName
        if (newDeviceName !== oldname) {
          // 与最新设备名称同步，更新点位名称
          if (_arguments.length === 5) {
            // 二级设备
            _this.deviceList[key]['subDevice'][arguments[4]]['subDevicName'] = newDeviceName
          } else {
            // 一级设备
            _this.deviceList[key]['deviceName'] = newDeviceName
          }
        }
        testPopup(newDeviceName)
      })
      function testPopup (newDeviceName) {
        if (parseInt(_this.sceneParam.sceneType) === 1) {
          console.log('小区全图不允许加点位')
        } else {
          var deviceId = id
          var sceneIndex = _this.currentScene
          if (_this.sceneList.length === 0 || _this.currentScene === null) {
            _this.$message({
              message: '请先在左边场景列表选中一个场景！',
              type: 'warning'
            })
          } else {
            var sceneId = _this.sceneList[sceneIndex].id
            // 目前的需求是一个设备id只能存在一个场景中，通过deviceId 获取 该设备是否有对应的场景点位
            getMarkerInfo({
              deviceId: deviceId
            }).then(res => {
              if (res.data.data === null) {
                console.log('该设备可用')
              } else {
                // 该设备已经在某个场景中使用，如果这个是当前场景，则可用通过拖拽更新，否则当前场景不能再添加该设备！
                let selfMarkerInfo = res.data.data
                if (sceneId === selfMarkerInfo.sceneId) {
                  // 该设备有对应该场景的点位，可更新对应信息
                  // 获取当前场景下的所有点位
                  let posX = selfMarkerInfo.positionX
                  let posY = selfMarkerInfo.positionY
                  if (newDeviceName) {
                    _this.mapObj.popupDefault([posX, posY], newDeviceName)
                  } else {
                    _this.mapObj.popupDefault([posX, posY], 'undefined')
                  }
                  if (selfMarkerInfo.markerName !== newDeviceName) {
                    selfMarkerInfo.markerName = newDeviceName
                    selfMarkerInfo.name = newDeviceName
                    updateMarker(selfMarkerInfo)
                  }
                }
              }
            })
          }
        }
      }
    },
    /**
     * @description 点位管理 添加设备点位
     * @param {Object} markerObj 地图实例对象
     */
    addDeviceMarker: function (markerObj) {
      let _this = this
      // 添加页面点位显示
      this.mapObj.addMarker(markerObj)
      let markerType = this.draggingDevice.markerType
      // 地图应用调用增加点位信息接口
      let markerInfo = {
        sceneId: this.mapObj.mapConfig.mapId,
        deviceId: markerObj.id,
        positionX: markerObj.position[0],
        positionY: markerObj.position[1],
        markerName: markerObj.name,
        latitude: markerObj.latitude,
        longitude: markerObj.longitude,
        markerType: markerType
      }
      addMarker(markerInfo).then((res) => {
        _this.$message({
          message: '点位添加成功',
          type: 'success'
        })
      }).catch(err => {
        console.warn(err)
        _this.$message.error('服务器或网络连接错误，点位添加失败！')
      })
    },
    /**
     * @description 点位管理 更新点位信息
     * @param {Object} featureInfo 点位特征信息
     */
    updateMarkerInfo: function (featureInfo) {
      let _this = this
      // 设备名称如果被修改，点位的markerName也需要同步更新，所以每次更新点位时都要查询最新的设备信息
      getMarkerInfo({
        deviceId: featureInfo.id
      }).then(res => {
        featureInfo.markerId = res.data.data.id
        let markerInfo = featureToMarker(featureInfo)
        if (markerInfo === null) {
          return
        }
        updateMarker(markerInfo).then((res) => {
          console.log(LOG_TAG + '点位更新成功')
        }).catch(err => {
          _this.$message.error('服务器或网络连接错误，点位更新失败！')
          console.warn(err)
        })
      })
    },
    /**
     * @description 点位管理 删除点位
     */
    removeMarker: function () {
      this.mapObj.closePopup()
      let that = this
      if (this.msg === '关闭地图编辑') {
        // 删除点位后关闭地图编辑
        this.mapObj.closeDragTool()
        let selectedMarkerId = []
        let deletedId = this.selectedMarker.markerId
        // 目前暂时是单个删除
        selectedMarkerId = [deletedId]
        if (selectedMarkerId.length === 0 || !deletedId) {
          this.$message({
            message: '没获到点位信息，请点击选中点位后再删除！',
            type: 'warning'
          })
          return
        }
        deleteMarker({ markerIds: selectedMarkerId }).then(res => {
          that.mapObj.removeMarkerBylayerKey(that.selectedMarker.id, that.currentLayer)
          that.$message({
            message: '点位删除成功',
            type: 'success'
          })
          that.selectedMarker = {}
        }).catch((err) => {
          that.$message.error('服务器或网络连接错误，点位删除失败！')
          that.selectedMarker = {}
          console.warn(err)
        })
        this.selFeatures = {}
        this.editFlag = false
        this.btnType = 'primary'
        this.msg = '开启地图编辑'
      } else {
        this.$message({
          message: '请先开启地图编辑',
          type: 'warning'
        })
        this.selectedMarker = {}
      }
    },
    // 编辑地图（更新点位、删除点位）
    /**
     * @description 点位管理 地图编辑
     */
    onModifyMap () {
      let that = this
      this.mapObj.closePopup()
      // 每次点击编辑按钮，都把选中点的保存信息情况
      this.selectedMarker = {}
      if (!this.editFlag) {
        // 参数一：监听拖动开始 参数二：监听拖动结束 参数三： 监听选中
        that.mapObj.openDragTool(function (e) {
          that.mapObj.closePopup()
        }, function (e) {
          // 拖动结束
          // 获取到当前坐标
          let newPosition = e.coordinate
          let newOption = e.features.array_[0].extProperties
          newOption.position = newPosition
          let centerGPS = that.mapObj.mapConfig.centerGPS
          let temPos = []
          temPos[0] = newPosition[0]
          temPos[1] = newPosition[1]
          let gps = null
          if (centerGPS[0] >= 180 || centerGPS[0] <= -180 || centerGPS[1] >= 90 || centerGPS[1] <= -90) {
            console.log('该地图centerGPS已超出合理范围！')
          } else {
            gps = that.mapObj.transBitmapToWGS(temPos)
          }
          newOption.GPS = gps
          that.updateMarkerInfo(newOption)
        }, function (e) {
          // 将选中的markerId 保存到data
          that.selectedMarker = e.selected[0].extProperties
          if (e.selected.length > 0) {
            let feat = e.selected[0]
            // 图层的id
            that.selFeatures[feat.id_] = feat
            that.currentLayer = e.selected[0].layerKey
          }
        })
        this.editFlag = true
        this.btnType = 'success'
        this.msg = '关闭地图编辑'
      } else {
        this.mapObj.closeDragTool()
        this.selFeatures.length = 0
        this.editFlag = false
        this.btnType = 'primary'
        this.msg = '开启地图编辑'
      }
    },
    /**
     * @description 点位管理 删除点位
     */
    onDeleteFeature () {
      this.removeMarker()
    }
  },
  watch: {
    /**
     * @description 关键字过滤
     */
    filterText (val) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>
<style lang="less" scoped>
/* MapApp.less公共样式start */
@origin: 10px;
.pull-left {
  float: left;
}

.pull-right {
  float: right;
}

.row-flow {
  width: 100%;
}

.clearfix {
  clear: both;
}

.common-input {
  width: @origin*28;
}

.map-app {
  box-sizing: border-box;
  position: absolute;
  top: 90px;
  bottom: 20px;
  left: 225px;
  right: 20px;
}

.filter-tree {
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 300px;
}
/* MapApp.less公共样式end */

div {
  box-sizing: border-box;
}

.map-app {
  display: flex;
  /* 头、中部、脚纵向显示 */
  flex-direction: column;
  border: 1px solid #cccccc;
  min-width: 1000px;
  .main {
    display: flex;
    flex: 1;
    .content-center {
      border-left: 1px solid #cccccc;
      border-right: 1px solid #cccccc;
      height: 100%;
      flex: 1;
      position: relative;
      min-width: 400px;
      overflow: hidden;
      .button-group {
        width: 100%;
        height: 40px;
        margin-top: 20px;
        background: none;
        padding-left: 40px;
      }
      #mapDiv {
        width: 96%;
        height: 720px;
        margin: 25px auto;
        background: #ccc;
      }
    }
    .content-left {
      order: -1;
    }
    .content-right,
    .content-left {
      display: flex;
      flex-direction: column;
      height: 100%;
      flex: 0 0 300px;
      overflow: auto;
    }
    .list-area {
      flex: 1;
      overflow: auto;
    }
    .search-sence-area {
      flex: 0 0 200px;
      border-bottom: 1px solid #ccc;
    }
    .search-device-area {
      flex: 0 0 250px;
      border-bottom: 1px solid #ccc;
    }
  }
  .search-form {
    overflow: hidden;
    padding: @origin 0;
    .common-input {
      margin: 15px auto;
    }
  }
  .search-toolbar {
    margin-top: 20px;
    padding: 5px 15px 5px 0;
    width: 100%;
    height: 40px;
    text-align: right;
    .search-btn {
      height: 40px;
      width: 30%;
      padding: @origin*.7 @origin*1.5;
    }
  }
  .data-list {
    box-sizing: border-box;
    padding: 15px;
    width: 100%;
    height: 100%;
    line-height: 30px;
    overflow-y: auto;
    .list-item {
      list-style: none;
      padding: 0px 30px;
      text-align: left;
      border-bottom: solid 1px #aaa;
      width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }
    .list-item.sceneItem {
      height: 40px;
      line-height: 40px;
    }
    .active {
      color: white;
      background: rgba(34, 156, 255, 1);
    }
    &.device-list {
      .list-item {
        padding: 0 15px;
        width: 200px;
        .device-icon {
          flex: 0 0 30px;
          flex-direction: column;
          width: 30px;
          height: 40px;
          float: left;
          .icon-item {
            background-size: 30px 30px;
            width: 30px;
            height: 30px;
            margin-top: 8px;
            display: block;
          }
        }
        .device-text-group {
          flex: 1;
          .device-name-text {
            font-size: 14px;
            line-height: 28px;
            font-weight: 700;
            height: 28px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .device-desc-text {
            height: 12px;
            font-size: 12px;
            line-height: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        .item-single-line {
          padding: 5px 0;
        }
      }
      .sub-device-list {
        list-style: none;
        padding-left: 15px;
        width: 225px;
        .list-item {
          border-top: 1px solid #ccc;
          border-bottom: none;
          width: 190px;
        }
      }
    }
  }
  .device-list > .list-item {
    cursor: pointer;
  }
}
</style>