<template>
  <div class="map-app-add">
    <!--场景基本信息配置页-->
    <div v-if="step===1" class="base-info">
      <div class="row-flow">
        <el-steps :active="1" finish-status="success" simple style="margin-top: 10px;">
          <el-step title="场景基本信息"></el-step>
          <el-step title="场景地图定位信息"></el-step>
        </el-steps>
      </div>
      <div class="row-flow base-info-content">
        <el-form label-width="80px" ref="form" :model="form" :rules="rules">
          <el-row>
            <el-col :span="12">
              <div class="form-content">
                <!--场景名称模块-->
                <el-form-item required label="场景名称" class="common-input form-item" prop='sceneName'>
                  <div class="block">
                    <el-input placeholder="请输入场景名称" class="el-input" v-model="form.sceneName" :maxlength="30"></el-input>
                  </div>
                </el-form-item>
                <!--场景类型模块-->
                <el-form-item required label="场景类型" class='common-input form-item'>
                  <el-select class='small-input' v-model="form.sceneType">
                    <el-option :label="item.itemName" :value="item.itemCode" v-for="item in selectList" :key="item.itemCode">{{item.itemName}}</el-option>
                  </el-select>
                </el-form-item>
                <!--组织树模块-->
                <el-popover ref="orgPopover" placement="top-end" width="174" v-model="isShowPopover">
                  <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
                  <el-tree class="filter-tree" :data="OrgTree" :props="defaultProps" default-expand-all :filter-node-method="filterNode" @node-click="handleNodeClick" ref="tree"></el-tree>
                </el-popover>
                <el-form-item required label="所属组织" label-width="80px" class="common-input form-item">
                  <el-input v-model="form.orgName" placeholder="请选择组织" readonly v-popover:orgPopover></el-input>
                </el-form-item>
              </div>
            </el-col>
            <!--图片上传模块-->
            <el-col :span="12">
              <div class="upload-content">
                <async-img height="320" :src="form.mapImage" class="scene-img"></async-img>
                <div class="face-pic-operation">
                  <input @change="onReadFacePic" ref="uploadFacePicInput" type="file" accept="image/jpeg,image/png,image/gif">
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="row-flow btn-group">
        <el-button @click="onCanclePage" class="btn-item">取消</el-button>
        <el-button @click="onToNext" class="btn-item" :loading="isLoading">下一步</el-button>
        <el-button v-if="this.isAdd==false" @click="onJumpPage" class="btn-item">跳过</el-button>
      </div>
    </div>
    <!--场景比例尺计算页-->
    <div v-else class="location-info">
      <div class="row-flow">
        <el-steps :active="2" finish-status="success" simple style="margin-top: 20px;">
          <el-step title="场景基本信息"></el-step>
          <el-step title="场景地图定位信息"></el-step>
        </el-steps>
      </div>
      <div class="row-flow edit-content">
        <div class="form-area">
          <div class="info-item">比例尺:&nbsp;&nbsp;
            <span>{{formSceneInfo.scale}}</span>
          </div>
          <div class="info-item" v-if="formSceneInfo.scaleType===1">
            <span class="color-style">说明：经度范围: -180 到 180, 纬度范围: -90 到 90</span>
          </div>
          <!--计算方式切换模块-->
          <div class="info-item">
            比例尺计算：
            <el-radio-group ref="formSceneInfo" v-model="formSceneInfo.scaleType" @change="onChangeHandler">
              <el-radio :label="1">取点计算</el-radio>
              <el-radio :label="2">宽度计算</el-radio>
            </el-radio-group>
          </div>
          <!-- 取点计算模块 -->
          <el-form ref="formGPS" :rules="rules" :model="formGPS" label-width="80px" v-if="formSceneInfo.scaleType===1" class="form-calculate-coordinate">
            <el-form-item label="实际位置1:">
              <el-input v-model="formGPS.reallongitude1" prop="reallongitude1" class="input-small right-child" v-on:blur="blur1()" placeholder="输入经度值"></el-input>
              <el-input v-model="formGPS.reallat1" prop="reallat1" class="input-small left-child" v-on:blur="blur1()" placeholder="输入纬度值"></el-input>
            </el-form-item>
            <el-form-item label="点位坐标1:" @click.native="onPoint(1,$event)" ref="shuru">
              <el-input v-model="formGPS.ptlongitude1" prop='ptlongitude1' class="input-small right-child"></el-input>
              <el-input v-model="formGPS.ptlat1" prop='ptlat1' class="input-small left-child"></el-input>
              <div class="position-btn" @click.native="onPoint(5,$event)">
                <i class="el-icon-location pick-ico" title="点击我,再点击地图可获取点位坐标"></i>
              </div>
            </el-form-item>
            <el-form-item label="实际位置2:">
              <el-input v-model="formGPS.reallongitude2" prop="reallongitude2" class="input-small right-child" :maxlength="10" v-on:blur="blur2()" placeholder="输入经度值"></el-input>
              <el-input v-model="formGPS.reallat2" prop='reallat2' class="input-small left-child" :maxlength="10" v-on:blur="blur2()" placeholder="输入纬度值"></el-input>
            </el-form-item>
            <el-form-item label="点位坐标2:" ref="shuru" @click.native="onPoint(3,$event)">
              <el-input v-model="formGPS.ptlongitude2" prop="ptlongitude2" class="input-small right-child"></el-input>
              <el-input v-model="formGPS.ptlat2" prop='ptlat2' class="input-small left-child"></el-input>
              <div class="position-btn" @click.native="onPoint(3,$event)">
                <i class="el-icon-location pick-ico" title="点击我,再点击地图可获取点位坐标"></i>
              </div>
            </el-form-item>
            <el-form-item label="实际位置3:">
              <el-input v-model="formGPS.reallongitude3" prop="reallongitude3" class="input-small right-child" :maxlength="10" v-on:blur="blur3()" placeholder="输入经度值"></el-input>
              <el-input v-model="formGPS.reallat3" prop='reallat3' class="input-small left-child" :maxlength="10" v-on:blur="blur3()" placeholder="输入纬度值"></el-input>
            </el-form-item>
            <el-form-item label="点位坐标3:" ref="shuru" @click.native="onPoint(5,$event)">
              <el-input v-model="formGPS.ptlongitude3" prop='ptlongitude3' class="input-small right-child"></el-input>
              <el-input v-model="formGPS.ptlat3" prop='ptlat3' class="input-small left-child"></el-input>
              <div class="position-btn" @click.native="onPoint(5,$event)">
                <i class="el-icon-location pick-ico" title="点击我,再点击地图可获取点位坐标"></i>
              </div>
            </el-form-item>
          </el-form>
          <!-- 宽度计算模块 -->
          <el-form ref="formGPSBySize" label-width="80px" v-else class="form-calculate-length">
            <el-form-item label="场景大小" class="label">
              <el-input v-model="formGPSBySize.realWidth" class="input-smaller left-child"></el-input> *
              <el-input v-model="formGPSBySize.realHeight" class="input-smaller right-child"></el-input>
            </el-form-item>
          </el-form>
          <div>
            <el-button type="primary pull-right" @click="onCalScale">计算</el-button>
          </div>
        </div>
        <!--图片显示区域-->
        <div class="map-area">
          <div id="mapDiv"></div>
        </div>
      </div>
      <div class="row-flow btn-group">
        <el-button @click="onCanclePage" class="btn-item">取消</el-button>
        <el-button @click="onSavePage" class="btn-item" :loading="isLoading">保存</el-button>
        <el-button @click="onBackPage" class="btn-item">返回</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { addScene, setSceneScaleByReal, setSceneScaleByGPS, updateScene, getDictionary, getOrgTree, getSceneInfo, getScenePageList } from '@/views/MapApp/apis/index.js'
import AsyncImg from '@/views/MapApp/components/AsyncImg'
import { LOG_TAG } from '@/views/MapApp/assets/js/index.js'
import markerImage1 from '@/views/MapApp/assets/images/icon1.png'
import markerImage2 from '@/views/MapApp/assets/images/icon2.png'
import markerImage3 from '@/views/MapApp/assets/images/icon3.png'
import hdmap from 'hdmap'
let vueObj = null
export default {
  components: {
    AsyncImg
  },
  props: ['currentParams'],
  data () {
    var GPSNum = (rule, value, callback) => {
      if (!/^(-?\d+)(\.\d+)?$/.test(value)) {
        callback(new Error('请输入正确的数据！'))
      } else {
        callback()
      }
    }
    return {
      locationPoints: [],
      scaleType: 1,
      markerObj1: {},
      markerObj2: {},
      markerObj3: {},
      isLoading: false,
      isAdd: true,
      filterParams: {
        orgId: '',
        sceneName: '',
        sceneType: null
      },
      defaultSceneBase: {
        orgCode: '',
        orgName: '',
        sceneName: '',
        sceneType: null,
        mapImage: '',
        id: '',
        height: null,
        width: null
      },
      defaultScene: {
        sceneId: null,
        scaleType: 1
      },
      defaultSceneGPS: {
        reallongitude1: null,
        reallat1: null,
        ptlongitude1: null,
        ptlat1: null,
        reallongitude2: null,
        reallat2: null,
        ptlongitude2: null,
        ptlat2: null,
        reallongitude3: null,
        reallat3: null,
        ptlongitude3: null,
        ptlat3: null,
        centerLon: 0,
        centerLat: 0,
        scale: null
      },
      sizeWidth: null,
      sizeHeight: null,
      defaultSceneGPSBySize: {
        realWidth: null,
        realHeight: null,
        scale: null
      },
      selectList: [],
      OrgTree: [],
      exportOrgNode: {},
      isShowPopover: false,
      filterText: '',
      OrgName: '',
      slectedCode: '',
      mapObj: {},
      mapUrl: '',
      currentSelect: 0,
      sceneId: '',
      isShow: false,
      base64Code: '',
      dialogImageUrl: '',
      dialogVisible: false,
      step: 1,
      imageUrl: 'testUrl',
      active: 1,
      formSceneInfo: {
        sceneId: null,
        scaleType: 1,
        scale: null
      },
      formGPS: {
        reallongitude1: null,
        reallat1: null,
        ptlongitude1: null,
        ptlat1: null,
        reallongitude2: null,
        reallat2: null,
        ptlongitude2: null,
        ptlat2: null,
        reallongitude3: null,
        reallat3: null,
        ptlongitude3: null,
        ptlat3: null,
        centerLon: null,
        centerLat: null
      },
      formGPSBySize: {
        realWidth: null,
        realHeight: null
      },
      form: {
        id: '',
        orgCode: '',
        orgName: '',
        sceneName: '',
        sceneType: null,
        mapImage: '',
        fileName: '',
        height: null,
        width: null
      },
      sceneInfo: {},
      paramsGPS: {
        sceneId: '',
        scale: 0,
        scaleType: 1,
        centerLon: null,
        centerLat: null,
        locationPoints: [
          {
            sceneId: '',
            gpsLongitude: 110.123332,
            gpsLatitude: 45.123343,
            pointX: 100,
            pointY: 200,
            pointType: 3
          }, {
            sceneId: '',
            gpsLongitude: 110.123332,
            gpsLatitude: 45.934343,
            pointX: 300,
            pointY: 200,
            pointType: 3
          }, {
            sceneId: '',
            gpsLongitude: 110.571332,
            gpsLatitude: 45.132343,
            pointX: -100,
            pointY: -300,
            pointType: 3
          }
        ]
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      rules: {
        reallat1: [
          { validator: GPSNum, required: true, min: 0, max: 9, message: '请输入有效的数值', trigger: 'blur' }
        ],
        reallongitude1: [
          { validator: GPSNum, required: true, min: 2, max: 9, message: '请输入有效的数值', trigger: 'blur' }
        ],
        sceneName: [
          { required: true, message: '请输入场景名称', trigger: 'blur' }
        ]
      }
    }
  },
  created: function () {
    // 编辑状态下数据初始化
    if (this.isAdd === false) {
      if (this.editInfo !== null) {
        this.form.orgCode = this.editInfo.orgCode
        this.form.orgName = this.editInfo.orgName
        this.form.sceneName = this.editInfo.sceneName
        this.form.sceneType = this.editInfo.sceneType
        this.form.mapImage = this.editInfo.url
      }
      let currentId = this.editInfo.id
      getSceneInfo({ sceneId: currentId }).then(res => {
        if (res.data.data.url) {
          this.form.mapImage = res.data.data.url
        }
      }).catch(err => {
        console.warn(err)
      })
    }
  },
  mounted: function () {
    vueObj = this
    let that = this
    getOrgTree().then(res => {
      that.exportOrgNode.rootUuid = res.data.data.uuid
      that.OrgTree.splice(0, this.OrgTree.length)
      that.OrgTree.push(res.data.data)
    }).catch(err => {
      console.warn(LOG_TAG + 'getOrgTree接口调用err')
      console.warn(err)
    })
    getDictionary().then((res) => {
      let dictionary = res.data.data
      let sceneTypes = dictionary.dictCodeType.sceneType
      var len = sceneTypes.length
      for (var i = 0; i < len; i++) {
        sceneTypes[i].itemCode = parseInt(sceneTypes[i].itemCode)
      }
      this.selectList = sceneTypes
    }).catch(err => {
      console.warn(LOG_TAG + 'getDictionary接口调用err')
      console.warn(err)
    })
  },
  methods: {
    /**
    *@description Form表单参数重置
    */
    resetForm () {
      this.$refs['form'].resetFields()
    },
    /**
    *@description 获取场景信息
    *@param {string} sceneId 场景ID
    */
    getSceneForGPS: function (sceneId) {
      getSceneInfo({ sceneId: sceneId }).then(res => {
        if ((res.data.code === '00001') || (res.data.code === '00000')) {
          this.step = 2
          this.active = 2
          this.mapInit(res.data.data.url)
          this.initsceneGPS(res.data.data)
        } else {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '网络忙，请重新尝试！')
            ])
          })
        }
      }).catch(err => {
        console.warn(LOG_TAG + 'getSceneInfo接口调用err')
        console.warn(err)
      })
    },
    /**
    *@description 初始化点位计算界面,1代表点位计算，2代表宽度计算
    *@param {obj} val 点位信息
    */
    initsceneGPS: function (val) {
      if (!val) {
        this.formSceneInfo = Object.assign({}, this.defaultScene)
        this.formSceneInfo.scaleType = 1
        this.formGPSBySize = Object.assign({}, this.defaultSceneGPSBySize)
        this.formGPS = Object.assign({}, this.defaultSceneGPS)
      } else if (parseInt(val.scaleType) === 1) {
        this.formSceneInfo.scaleType = val.scaleType
        this.formSceneInfo.scale = val.scale
        this.formSceneInfo.sceneId = val.id
        this.formGPSBySize = Object.assign({}, this.defaultSceneGPSBySize)
        this.formGPS.reallongitude1 = val.locationPoints[0].gpsLongitude
        this.formGPS.reallat1 = val.locationPoints[0].gpsLatitude
        this.formGPS.ptlongitude1 = val.locationPoints[0].pointX
        this.formGPS.ptlat1 = val.locationPoints[0].pointY
        this.formGPS.reallongitude2 = val.locationPoints[1].gpsLongitude
        this.formGPS.reallat2 = val.locationPoints[1].gpsLatitude
        this.formGPS.ptlongitude2 = val.locationPoints[1].pointX
        this.formGPS.ptlat2 = val.locationPoints[1].pointY
        this.formGPS.reallongitude3 = val.locationPoints[2].gpsLongitude
        this.formGPS.reallat3 = val.locationPoints[2].gpsLatitude
        this.formGPS.ptlongitude3 = val.locationPoints[2].pointX
        this.formGPS.ptlat3 = val.locationPoints[2].pointY
        this.formGPS.ptlat3 = val.locationPoints[2].pointY
        this.formGPS.centerLon = val.centerLon
        this.formGPS.centerLat = val.centerLat
      } else if (parseInt(val.scaleType) === 2) {
        this.formSceneInfo.scaleType = val.scaleType
        this.formSceneInfo.scale = val.scale
        this.formSceneInfo.sceneId = val.id
        this.formGPS = Object.assign({}, this.defaultSceneGPS)
        this.formGPSBySize.realWidth = val.realWidth
        this.formGPSBySize.realHeight = val.realHeight
      } else {
        this.formGPS = Object.assign({}, this.defaultSceneGPS)
        this.formGPSBySize = Object.assign({}, this.defaultSceneGPSBySize)
        this.formSceneInfo.scaleType = 1
        this.formSceneInfo.scale = val.scale
        this.formSceneInfo.sceneId = val.id
      }
      this.sizeWidth = val.width
      this.sizeHeight = val.height
    },
    addSceneInfo: function () {
      this.isAdd = true
      this.form = Object.assign({}, this.defaultSceneBase)
    },
     /**
    *@description 初始化场景基本信息配置页
    *@param {obj} sceneInfo 场景信息
    */
    editSceneInfo: function (sceneInfo) {
      this.scaleType = sceneInfo.scaleType
      this.locationPoints = sceneInfo.locationPoints
      this.sceneId = sceneInfo.id
      this.isAdd = false
      this.form = Object.assign({}, this.defaultSceneBase)
      this.form.sceneId = sceneInfo.id
      this.form.orgName = sceneInfo.orgName
      this.form.orgCode = sceneInfo.orgCode
      this.form.sceneType = sceneInfo.sceneType
      this.form.sceneName = sceneInfo.sceneName
      this.form.mapImage = sceneInfo.url
      this.form.width = sceneInfo.width
      this.form.height = sceneInfo.height
    },
     /**
    *@description 组织查询
    *@param {obj} data 组织数据
    */
    handleNodeClick (data) {
      this.OrgName = data.name
      this.form.orgName = data.name
      this.slectedCode = data.uuid
      this.form.orgCode = data.uuid
      this.isShowPopover = false
      this.filterText = ''
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    /**
    *@description GPS1坐标的数据校验
    */
    blur1 () {
      if ((Math.abs(this.formGPS.reallongitude1) > 180) || (this.formGPS.reallongitude1 === '') || (Math.abs(this.formGPS.reallat1) > 90) || (this.formGPS.reallat1 === '')) {
        const h = this.$createElement
        this.$message({
          message: h('p', null, [
            h('span', null, ''),
            h('i', { style: 'color: red' }, '请检查实际位置1输入的经纬度是否正确！')
          ])
        })
      }
    },
    /**
    *@description GPS2坐标的数据校验
    */
    blur2 () {
      if ((Math.abs(this.formGPS.reallongitude2) > 180) || (this.formGPS.reallongitude2 === '') || (Math.abs(this.formGPS.reallat2) > 90) || (this.formGPS.reallat2 === '')) {
        const h = this.$createElement
        this.$message({
          message: h('p', null, [
            h('span', null, ''),
            h('i', { style: 'color: red' }, '请检查实际位置2输入的经纬度是否正确！')
          ])
        })
      }
    },
    /**
    *@description GPS3坐标的数据校验
    */
    blur3 () {
      if ((Math.abs(this.formGPS.reallongitude3) > 180) || (this.formGPS.reallongitude3 === '') || (Math.abs(this.formGPS.reallat3) > 90) || (this.formGPS.reallat3 === '')) {
        const h = this.$createElement
        this.$message({
          message: h('p', null, [
            h('span', null, ''),
            h('i', { style: 'color: red' }, '请检查实际位置3输入的经纬度是否正确！')
          ])
        })
      }
    },
    /**
    *@description 获取描点事件
    *@param {number} num 点位序号
    *@param $event  event事件
    */
    onPoint: function (num, $event) {
      this.currentSelect = num
      for (var i = 1; i <= 5; i += 2) {
        if (parseInt(i) === parseInt(num)) {
          this.$refs.formGPS.$children[i].$el.childNodes[0].style.color = 'blue'
        } else {
          this.$refs.formGPS.$children[i].$el.childNodes[0].style.color = '#606266'
        }
      }
    },
    handlePictureCardPreview (file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    openDialog: function () {
      this.dialogFormVisible = true
    },
    /**
    *@description 基本信息提交，跳转到下一页
    */
    onToNext: function () {
      if (this.slectedCode) {
        this.form.orgCode = this.slectedCode
      }
      // 场景名称、场景类型、组织名非空
      if (!this.form.sceneName.trim()) {
        const h = this.$createElement
        this.$message({
          message: h('p', null, [
            h('span', null, ''),
            h('i', { style: 'color: red' }, '场景名称不能全为空格！')
          ])
        })
        return
      } else if ((!this.form.sceneType) || (!this.form.orgCode)) {
        const h = this.$createElement
        this.$message({
          message: h('p', null, [
            h('span', null, ''),
            h('i', { style: 'color: red' }, '请将信息填写完整！')
          ])
        })
        return
      }
      // addScene模块
      if (this.isAdd === true) {
        this.form.mapImage = vueObj.base64Code
        let newImage = new Image()
        if (this.form.mapImage) {
          newImage.src = this.form.mapImage
          this.form.height = newImage.height
          this.form.width = newImage.width
        } else {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '图片未上传！')
            ])
          })
          return
        }
        this.isLoading = true
        this.form.sceneName = this.form.sceneName.trim()
        addScene(this.form).then(res => {
          if (res.data.code === '00001') {
            const h = this.$createElement
            this.$message({
              message: h('p', null, [
                h('span', null, ''),
                h('i', { style: 'color: red' }, '小区全图已存在！')
              ])
            })
          } else {
            this.getSceneForGPS(res.data.data.sceneId)
            this.isLoading = false
          }
        }).catch(err => {
          console.warn(LOG_TAG + 'addScene接口调用err')
          this.isLoading = false
          console.warn(err)
        })
      } else {
        // updateScene模块
        this.form.mapImage = vueObj.base64Code
        this.isLoading = true
        this.form.sceneName = this.form.sceneName.trim()
        updateScene(this.form).then(res => {
          if (res.data.code === '00001') {
            this.$message('小区全图已存在')
          } else {
            const h = this.$createElement
            this.$message({
              message: h('p', null, [
                h('span', null, ''),
                h('i', { style: 'color: blue' }, '保存成功！')
              ])
            })
            this.getSceneForGPS(this.form.sceneId)
            this.isLoading = false
          }
        }).catch(err => {
          console.warn(LOG_TAG + 'updateScene接口调用err')
          this.isLoading = false
          console.warn(err)
        })
      }
    },
    /**
    *@description 跳过
    */
    onJumpPage: function () {
      this.step = 2
      this.active = 2
      this.getSceneForGPS(this.form.sceneId)
    },
    /**
    *@description 计算方式切换
    */
    onChangeHandler () {
      if (parseInt(this.formSceneInfo.scaleType) === 1) {
        this.formGPSBySize = Object.assign({}, this.defaultSceneGPSBySize)
        this.formSceneInfo.scale = this.formGPSBySize.scale
      } else {
        this.formGPS = Object.assign({}, this.defaultSceneGPS)
        this.formSceneInfo.scale = this.formGPS.scale
      }
    },
    /**
    *@description 触发file类型的input的默认事件
    */
    uploadFacePic: function () {
      this.$refs.uploadFacePicInput.click()
    },
    /**
    *@description 读取上传图片的base64编码
    */
    onReadFacePic: function () {
      const file = this.$refs.uploadFacePicInput.files[0]
      let fileExt = ''
      if (file) {
        fileExt = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length)
      }
      if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'bpm' || fileExt === 'gif' || fileExt === 'png') {
        this.form.fileName = file.name
        if (file.size < 1024 * 1024 * 5) {
          let that = this
          var reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = function (e) {
            vueObj.base64Code = this.result
            vueObj.form.mapImage = this.result
            let newImg = new Image()
            newImg.onload = function () {
              that.form.width = newImg.width
              that.form.height = newImg.height
            }
            newImg.src = vueObj.form.mapImage
          }
        } else {
          this.$message({
            message: '请选择小于5M的图片',
            type: 'warning'
          })
        }
      } else if (fileExt) {
        this.$message.error('文件格式错误、请上传图片')
        return false
      }
    },
    /**
    *@description 页面数据保存
    */
    onSavePage () {
      // 计算方式选择，调用点位
      if (parseInt(this.formSceneInfo.scaleType) === 1) {
        let params = Object.assign({}, this.formSceneInfo)
        let sceneInfoGPS = Object.assign({}, this.formGPS)
        params.locationPoints = []
        params.locationPoints[0] = {}
        params.locationPoints[1] = {}
        params.locationPoints[2] = {}
        params.locationPoints[0].sceneId = this.formSceneInfo.sceneId
        params.locationPoints[0].gpsLongitude = sceneInfoGPS.reallongitude1
        params.locationPoints[0].gpsLatitude = sceneInfoGPS.reallat1
        params.locationPoints[0].pointX = sceneInfoGPS.ptlongitude1
        params.locationPoints[0].pointY = sceneInfoGPS.ptlat1
        params.locationPoints[0].pointType = 3

        params.locationPoints[1].sceneId = this.formSceneInfo.sceneId
        params.locationPoints[1].gpsLongitude = sceneInfoGPS.reallongitude2
        params.locationPoints[1].gpsLatitude = sceneInfoGPS.reallat2
        params.locationPoints[1].pointX = sceneInfoGPS.ptlongitude2
        params.locationPoints[1].pointY = sceneInfoGPS.ptlat2
        params.locationPoints[1].pointType = 3

        params.locationPoints[2].sceneId = this.formSceneInfo.sceneId
        params.locationPoints[2].gpsLongitude = sceneInfoGPS.reallongitude3
        params.locationPoints[2].gpsLatitude = sceneInfoGPS.reallat3
        params.locationPoints[2].pointX = sceneInfoGPS.ptlongitude3
        params.locationPoints[2].pointY = sceneInfoGPS.ptlat3
        params.locationPoints[2].pointType = 3
        params.centerLon = sceneInfoGPS.centerLon || this.paramsGPS.centerLon
        params.centerLat = sceneInfoGPS.centerLat || this.paramsGPS.centerLat
        // 校验点位1
        if (!this.formGPS.ptlongitude1 || !this.formGPS.ptlat1 || !this.formGPS.reallat1 || !this.formGPS.reallongitude1) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查点位1的信息是否录入完整！')
            ])
          })
          return
        }
        if (this.formSceneInfo.scale <= 0) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查数据是否正确，比例尺必须大于0！')
            ])
          })
          return
        }
        // 校验点位2
        if (!this.formGPS.ptlongitude2 || !this.formGPS.reallongitude2 || !this.formGPS.ptlongitude2 || !this.formGPS.ptlat2) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查点位2的信息是否录入完整！')
            ])
          })
          return
        }
        // 校验点位3
        if (!this.formGPS.ptlongitude3 || !this.formGPS.reallongitude3 || !this.formGPS.ptlongitude3 || !this.formGPS.ptlat3) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查点位3的信息是否录入完整！')
            ])
          })
          return
        }
        params.scaleType = Number(params.scaleType)
        params.scale = Number(params.scale)
        // setSceneByGPS接口
        setSceneScaleByGPS(params).then(res => {
          if (res.data.code === '00000') {
            const h = this.$createElement
            this.$message({
              message: h('p', null, [
                h('span', null, ''),
                h('i', { style: 'color: blue' }, '保存成功！')
              ])
            })
          }
          this.isLoading = false
          // 调用getScenePageList接口
          getScenePageList(1, 10, {}).then((res) => {
            for (let i = 0; i < res.data.data.pageData.length; i++) {
              if (Number(res.data.data.pageData[i].scaleType) === 1) {
                res.data.data.pageData[i].scaleType = '三点定位'
              } else {
                res.data.data.pageData[i].scaleType = '宽高计算'
              }
            }
            this.$parent.tableData = res.data.data.pageData
            this.$parent.currentPage = 1
            this.$parent.total = res.data.data.total
          }).catch(err => {
            console.warn(LOG_TAG + 'getScenePageList接口调用err')
            console.warn(err)
          })
        }).catch(err => {
          this.isLoading = false
          console.warn(err)
        })
        this.step = 1
        this.$parent.status = '0'
      } else {
        // setSceneByReal接口
        let param = Object.assign({}, this.formGPSBySize, this.formSceneInfo)
        param.realHeight = parseInt(param.realHeight)
        param.realWidth = parseInt(param.realWidth)
        if (this.formSceneInfo.scale <= 0 || !this.formGPSBySize.realHeight || !this.formGPSBySize.realWidth || Number(this.formGPSBySize.realHeight) <= 0 || Number(this.formGPSBySize.realWidth) <= 0) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '您选择的宽度计算方式录入的数据是否完整或者正确！')
            ])
          })
          return
        }
        param.scaleType = Number(param.scaleType)
        param.scale = Number(param.scale)
        setSceneScaleByReal(param).then(res => {
          if (res.data.code === '00000') {
            const h = this.$createElement
            this.$message({
              message: h('p', null, [
                h('span', null, ''),
                h('i', { style: 'color: blue' }, '保存成功！')
              ])
            })
          }
        }).catch(err => {
          console.warn(err)
        })
        this.step = 1
        this.$parent.status = '0'
        getScenePageList(1, 10, {}).then((res) => {
          // 接口
          for (let i = 0; i < res.data.data.pageData.length; i++) {
            if (Number(res.data.data.pageData[i].scaleType) === 1) {
              res.data.data.pageData[i].scaleType = '三点定位'
            } else {
              res.data.data.pageData[i].scaleType = '宽高计算'
            }
          }
          this.$parent.tableData = res.data.data.pageData
          this.$parent.currentPage = 1
          this.$parent.total = res.data.data.total
        }).catch(err => {
          console.warn(err)
        })
      }
    },
    /**
    *@description 返回事件
    */
    onBackPage () {
      this.isLoading = false
      let currentId = this.formSceneInfo.sceneId
      getSceneInfo({ sceneId: currentId }).then(res => {
        if ((res.data.code === '00000') || (res.data.code === '00001')) {
          this.step = 1
          this.isAdd = false
          this.editSceneInfo(res.data.data)
        }
      }).catch(err => {
        console.warn(LOG_TAG + 'getSceneInfo接口调用err')
        console.warn(err)
        const h = this.$createElement
        this.$message({
          message: h('p', null, [
            h('span', null, ''),
            h('i', { style: 'color: red' }, '网络请求超时，请重试！')
          ])
        })
      })
    },
    /**
    *@description 取消事件
    */
    onCanclePage () {
      if (this.step === 1) {
        this.$refs.uploadFacePicInput.value = ''
        this.form.mapImage = ''
        vueObj.base64Code = ''
      }
      this.step = 1
      this.$parent.status = '0'
      this.filterParams.orgId = this.currentParams.orgId
      this.filterParams.sceneName = this.currentParams.sceneName
      this.filterParams.sceneType = this.currentParams.sceneType
      let pageParams = this.filterParams
      getScenePageList(1, 10, { pageParams }).then((res) => {
        // 接口
        for (let i = 0; i < res.data.data.pageData.length; i++) {
          if (Number(res.data.data.pageData[i].scaleType) === 1) {
            res.data.data.pageData[i].scaleType = '三点定位'
          } else {
            res.data.data.pageData[i].scaleType = '宽高计算'
          }
        }
        this.$parent.tableData = res.data.data.pageData
        this.$parent.currentPage = 1
        this.$parent.total = res.data.data.total
      }).catch(err => {
        console.warn(LOG_TAG + 'getScenePageList接口调用err')
        console.warn(err)
      })
    },
    /**
    *@description 比例尺计算,比例尺数据类型Num(12，6)
    */
    onCalScale () {
      let dotArr = []
      if (Number(this.formSceneInfo.scaleType) === 1) {
        // 点位1的校验
        if (!this.formGPS.reallongitude1 || !this.formGPS.reallat1 || !this.formGPS.ptlongitude1 || !this.formGPS.ptlat1) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查点位1信息是否输入完整！')
            ])
          })
          return
        }
        // 点位2的校验
        if (!this.formGPS.reallongitude2 || !this.formGPS.reallat2 || !this.formGPS.ptlongitude2 || !this.formGPS.ptlat2) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查点位2信息是否输入完整！')
            ])
          })
          return
        }
        // 点位3的校验
        if (!this.formGPS.reallongitude3 || !this.formGPS.reallat3 || !this.formGPS.ptlongitude3 || !this.formGPS.ptlat3) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查点位3信息是否输入完整！')
            ])
          })
          return
        }
        var lonlats = {}
        lonlats.lonlatA = [Number(this.formGPS.reallongitude1), Number(this.formGPS.reallat1)]
        lonlats.lonlatB = [Number(this.formGPS.reallongitude2), Number(this.formGPS.reallat2)]
        lonlats.lonlatC = [Number(this.formGPS.reallongitude3), Number(this.formGPS.reallat3)]
        // 点位坐标
        var points = {}
        points.pointA = [Number(this.formGPS.ptlongitude1), Number(this.formGPS.ptlat1)]
        points.pointB = [Number(this.formGPS.ptlongitude2), Number(this.formGPS.ptlat2)]
        points.pointC = [Number(this.formGPS.ptlongitude3), Number(this.formGPS.ptlat3)]
        // 获取中心点
        if (hdmap.utils.getCenterGPS(lonlats, points)) {
          this.paramsGPS.centerLon = Number(hdmap.utils.getCenterGPS(lonlats, points)[0]).toFixed(6)
          this.paramsGPS.centerLat = Number(hdmap.utils.getCenterGPS(lonlats, points)[1]).toFixed(6)
        } else {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查录入的坐标数据是否正确！')
            ])
          })
          return
        }
        // 计算比例尺
        if ((hdmap.utils.getScaleByGPS(this.mapObj, lonlats, points) && (hdmap.utils.getScaleByGPS(this.mapObj, lonlats, points) > 0))) {
          let GPSScale = hdmap.utils.getScaleByGPS(this.mapObj, lonlats, points)
          if (GPSScale % 2 === 0 || GPSScale % 2 === 1) {
            this.formSceneInfo.scale = GPSScale
          } else {
            dotArr = (hdmap.utils.getScaleByGPS(this.mapObj, lonlats, points) + '').split('.')
            this.formSceneInfo.scale = dotArr[1].length > 6 ? Number(GPSScale).toFixed(6) : GPSScale
          }
        } else {
          this.$message('请检查录入的数据是否正确！')
        }
      } else if (Number(this.formSceneInfo.scaleType) === 2) {
        this.formSceneInfo.realHeight = this.formGPSBySize.realHeight
        this.formSceneInfo.realWidth = this.formGPSBySize.realWidth
        if (!this.formGPSBySize.realWidth || !this.formGPSBySize.realHeight || Number(this.formGPSBySize.realWidth) <= 0 || Number(this.formGPSBySize.realHeight) <= 0) {
          const h = this.$createElement
          this.$message({
            message: h('p', null, [
              h('span', null, ''),
              h('i', { style: 'color: red' }, '请检查数据是否输入完整！')
            ])
          })
          return
        }
        let sizeScale = hdmap.utils.getScaleBySize(this.form.width, this.form.height, this.formSceneInfo.realHeight, this.formSceneInfo.realWidth)
        if (sizeScale % 2 === 0 || sizeScale % 2 === 1) {
          this.formSceneInfo.scale = sizeScale
        } else {
          dotArr = (sizeScale + '').split('.')
          this.formSceneInfo.scale = dotArr[1].length > 6 ? Number(sizeScale).toFixed(6) : sizeScale
        }
      }
    },
    /**
    *@description 地图初始化
    */
    mapInit: function (mapUrl) {
      let that = this
      let callback = function (args1, eventType) {
        if (args1.eventType === 'singleclick') {
          if (that.currentSelect === 0) {
            that.$message('请选择点位')
          } else {
            var num = that.currentSelect
            var px = Number(args1.coordinate[0]).toFixed(6)
            var py = Number(args1.coordinate[1]).toFixed(6)
            if (num === 1) {
              that.formGPS.ptlongitude1 = px
              that.formGPS.ptlat1 = py
              that.markerObj1 = {
                position: [px, py],
                markerName: '点位1',
                imgUrl: markerImage1,
                id: '111',
                size: [34, 41],
                markerType: 'camera'
              }
              // 点击取点时判断，如果已经去过点，再次点击取点时就更新点位；如果没有取过点位，则点击时新增点位
              if (that.mapObj.getMarkerById(that.markerObj1.id)) {
                that.mapObj.updateMarker(that.markerObj1)
              } else {
                that.mapObj.addMarker(that.markerObj1)
              }
            } else if (num === 3) {
              that.formGPS.ptlongitude2 = px
              that.formGPS.ptlat2 = py
              that.markerObj2 = {
                position: [px, py],
                markerName: '点位2',
                imgUrl: markerImage2,
                id: '222',
                size: [34, 41],
                markerType: 'camera'
              }
              if (that.mapObj.getMarkerById(that.markerObj2.id)) {
                that.mapObj.updateMarker(that.markerObj2)
              } else {
                that.mapObj.addMarker(that.markerObj2)
              }
            } else {
              that.formGPS.ptlongitude3 = px
              that.formGPS.ptlat3 = py
              that.markerObj3 = {
                position: [px, py],
                markerName: '点位3',
                imgUrl: markerImage3,
                id: '333',
                size: [34, 41],
                markerType: 'camera'
              }
              if (that.mapObj.getMarkerById(that.markerObj3.id)) {
                that.mapObj.updateMarker(that.markerObj3)
              } else {
                that.mapObj.addMarker(that.markerObj3)
              }
            }
          }
        } else {
          this.$message('map clicked')
        }
      }
      // 图片加载完成后初始化地图
      try {
        let image = new Image()
        image.src = mapUrl
        image.onload = function () {
          // eslint-disable-next-line
          that.mapObj = new hdmap.initMap({
            gisEngine: 'bitmap',
            sizeW: 1920,
            sizeH: 1080,
            domId: 'mapDiv',
            mapUrl: mapUrl,
            maxZoom: 6,
            minZoom: 1,
            zoom: 2,
            center: [0, 0]
          })
          // 场景新增时，无点位；场景编辑并且比例尺计算方式是点位计算时，显示三个点位
          if (that.isAdd === false) {
            if (that.scaleType === 1) {
              that.markerObj1 = {
                position: [that.locationPoints[0].pointX, that.locationPoints[0].pointY],
                markerName: '点位1',
                imgUrl: markerImage1,
                id: '111',
                size: [34, 41],
                markerType: 'camera'
              }
              that.markerObj2 = {
                position: [that.locationPoints[1].pointX, that.locationPoints[1].pointY],
                markerName: '点位2',
                imgUrl: markerImage2,
                id: '222',
                size: [34, 41],
                markerType: 'camera'
              }
              that.markerObj3 = {
                position: [that.locationPoints[2].pointX, that.locationPoints[2].pointY],
                markerName: '点位3',
                imgUrl: markerImage3,
                id: '333',
                size: [34, 41],
                markerType: 'camera'
              }
              that.mapObj.addMarker(that.markerObj1)
              that.mapObj.addMarker(that.markerObj2)
              that.mapObj.addMarker(that.markerObj3)
            }
          }
          // 注册地图单击事件
          that.mapObj.regEventListener('singleclick', callback)
        }
      } catch (err) {
        console.log(LOG_TAG + ' image.onload图片加载事件err')
        console.log(err)
      }
    }
  },
  watch: {
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
.map-app-add {
  margin: 0 auto;
  padding-top: 40px;
  padding-bottom: 40px;
}
.btn-group {
  .btn-item {
    width: 84px;
    float: right;
    margin: 0 20px 0 0;
  }
}
.color-style {
  color: red;
}
/* 场景基本信息 */
.base-info {
  .form-content {
    padding: 60px 0;
    display: flex;
    flex-direction: column;
    height: 280px;
    justify-items: center;
    align-items: center;
    .form-item {
      margin: 22px 0;
    }
  }
  .base-info-content {
    height: 600px;
  }
  .scene-img {
    margin: 60px 0 40px;
    border: 1px solid #ccc;
  }
  .upload-content {
    height: 480px;
    width: 100%;
    text-align: center;
    overflow: auto;
    .face-pic-operation {
      height: 36px;
    }
  }
}

/* 场景定位信息 */
.location-info {
  .edit-content {
    display: flex;
    .form-area {
      padding-top: 20px;
      height: 100%;
      flex: 0 0 340px;
      overflow: auto;
      order: -1;
      .info-item {
        line-height: 30px;
        margin-bottom: 22px;
        font-size: 14px;
        color: #606266;
      }
      .form-calculate-coordinate {
        width: 340px;
        .position-btn {
          float: left;
          width: 20px;
          .pick-ico {
            font-size: 20px;
            color: #e6a23c;
            cursor: pointer;
            &:hover {
              color: darken(#e6a23c, 10%);
            }
          }
        }
        .input-small {
          float: left;
          width: 110px;
          margin: 0 7px 10px 0;
        }
        .input-smaller {
          width: 100px;
          margin-bottom: 10px;
          &.left-child {
            margin: 0 7px 0 0;
          }
          &.right-child {
            margin: 0 0 0 7px;
          }
        }
      }
      .form-calculate-length {
        .input-small {
          width: 110px;
          margin-bottom: 10px;
          &.left-child {
            margin: 0 7px 0 0;
          }
          &.right-child {
            margin: 0 0 0 7px;
          }
        }
        .input-smaller {
          width: 100px;
          margin-bottom: 10px;
          &.left-child {
            margin: 0 7px 0 0;
          }
          &.right-child {
            margin: 0 0 0 7px;
          }
        }
      }
    }
    .map-area {
      flex: 1;
      box-sizing: border-box;
      padding: 20px;
      height: 600px;
      #mapDiv {
        width: 100%;
        height: 100%;
        background: #ccc;
      }
    }
  }
}
</style>