<template>
  <div>
    <!-- 头部 -->
    <div>
      <el-select v-model="sceneId" @change='mapChange' placeholder="请选择地图">
        <el-option-group v-for="group in mapOptions" :key="group.sceneType" :label="group.sceneType==='1'?'园区场景':'停车场场景'">
          <el-option v-for="item in group.options" :key="item.id" :label="item.sceneName" :value="item.id"></el-option>
        </el-option-group>
      </el-select>
      <el-button v-if="addBtnShow" type="primary" @click="startAdd" style="margin-left:10px">添加巡查点</el-button>
      <el-button v-else type="danger" @click="finishAdd" style="margin-left:10px">结束添加</el-button>
    </div>
    <el-row>
      <el-col class="con-left">
        <div id="bitmap" class="patrol-point-map">
          <h3 v-if="isInitMapFail" class="initMapFail">地图加载失败……</h3>
        </div>
        <!-- 点位信息弹框 -->
        <div id="pointMsgPopup" class="point-msg-popup" style="height:200px;width:300px;">
          <div class="mPP-header" :title="pointInfo.pointName">{{pointInfo.pointName}}</div>
          <div class="mPP-mid">{{pointInfo.remark}}</div>
          <el-button type="primary" @click="modifyBtn" plain>修改</el-button>
          <el-button type="danger" @click="delButton" plain>删除</el-button>
        </div>
        <!-- 新增巡查点弹框 -->
        <el-dialog :visible="addDioShow" :modal-append-to-body="false" width="480px" @close="closeAddDialog">
          <el-row>
            <el-radio v-model="formFlag" label="NFC">NFC</el-radio>
            <el-radio v-model="formFlag" label="GPS">GPS</el-radio>
          </el-row>
          <div label="NFC" v-show="formFlag === 'NFC'">
            <el-form label-width="80px" class="point-form" :model="formNFC" :rules="rules" ref="formNFC">
              <el-form-item label="卡号：" prop="card">
                <el-input style="width:320px" v-model.trim="formNFC.card"></el-input>
              </el-form-item>
              <el-form-item label="名称：" prop="name">
                <el-input style="width:320px" v-model.trim="formNFC.name" @blur="checkRepeat"></el-input>
              </el-form-item>
              <el-form-item label="备注：" prop="remark">
                <el-input style="width:320px" v-model="formNFC.remark"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div label="GPS" v-show="formFlag === 'GPS'">
            <el-form label-width="80px" class="point-form" :model="formGPS" :rules="rules" ref="formGPS">
              <el-form-item label="名称：" prop="nameGPS">
                <el-input style="width:320px" v-model.trim="formGPS.nameGPS" @blur="checkRepeat"></el-input>
              </el-form-item>
              <el-form-item label="备注：" prop="remark">
                <el-input style="width:320px" v-model="formGPS.remark"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <span slot="footer">
            <el-button @click="closeAddDialog">取 消</el-button>
            <el-button type="primary" @click="submitAdd">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改巡查点弹窗 -->
        <el-dialog :visible="modifyDioShow" :modal-append-to-body="false" @close="closeModifyDialog" width="480px">
          <el-row>
            <el-radio v-model="formFlag" label="NFC">NFC</el-radio>
            <el-radio v-model="formFlag" label="GPS">GPS</el-radio>
          </el-row>
          <div label="NFC" v-show="formFlag === 'NFC'">
            <el-form label-width="80px" class="point-form" :model="formNFC" :rules="rules" ref="formNFC">
              <el-form-item label="卡号：" prop="card">
                <el-input style="width:320px" v-model.trim="formNFC.card"></el-input>
              </el-form-item>
              <el-form-item label="名称：" prop="name">
                <el-input style="width:320px" v-model.trim="formNFC.name" @blur="checkRepeat"></el-input>
              </el-form-item>
              <el-form-item label="备注：" prop="remark">
                <el-input style="width:320px" v-model="formNFC.remark"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div label="GPS" v-show="formFlag === 'GPS'">
            <el-form label-width="80px" class="point-form" :model="formGPS" :rules="rules" ref="formGPS">
              <el-form-item label="名称：" prop="nameGPS">
                <el-input style="width:320px" v-model.trim="formGPS.nameGPS" @blur="checkRepeat"></el-input>
              </el-form-item>
              <el-form-item label="备注：" prop="remark">
                <el-input style="width:320px" v-model="formGPS.remark"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <span slot="footer">
            <el-button @click="closeModifyDialog">取 消</el-button>
            <el-button type="primary" @click="submitModify">确 定</el-button>
          </span>
        </el-dialog>
      </el-col>
      <!-- 右侧巡查点列表 -->
      <el-col class="con-right">
        <div class="list-head">
          <p style="font-size:20px;color:white">巡查点列表</p>
        </div>
        <ul class="list-ul">
          <li v-for="item in messegeList" :key="item.uuid" @click="openPopup(item)">
            <div>
              <span><img src="./assets/images/pointListIcon.png"> </span>
              <span>{{item.pointName}}</span>
            </div>
          </li>
        </ul>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { extendObj } from './assets/js/index'
import markerImg from '@/views/PatrolApp/assets/images/point.png'
import { getPatrolPointMessegeData, getPatrolPointSelectData, postInsertPatrolPointData, postDeletePatrolPointData, postUpdatePatrolPointData, getPatrolPointRepeatData } from './apis/patrolpointapp'
export default {
  data () {
    var checkCard = (rule, value, callback) => {
      if (this.formNFC.card.trim() && !/^[0-9A-Za-z]+$/.test(this.formNFC.card.trim())) {
        callback(new Error('卡号必须为数字或者字母且不包含空格'))
      } else {
        callback()
      }
    }
    // 验证NFC名称
    var checkNameNFC = (rule, value, callback) => {
      if (this.formNFC.name.trim() && !/^[\u4e00-\u9fa50-9A-Za-z]+$/.test(this.formNFC.name.trim())) {
        callback(new Error('名称不能含有特殊字符和空格'))
      } else {
        callback()
      }
    }
    // 验证GPS名称
    var checkNameGPS = (rule, value, callback) => {
      if (this.formGPS.nameGPS.trim() && !/^[\u4e00-\u9fa50-9A-Za-z]+$/.test(this.formGPS.nameGPS.trim())) {
        callback(new Error('名称不能含有特殊字符和空格'))
      } else {
        callback()
      }
    }
    return {
      flagReapeatNFC: false,
      flagReapeatGPS: false,
      rules: {
        card: [
          { required: true, message: '请输入卡号', trigger: 'blur' },
          { min: 8, max: 32, message: '长度在 8 到 32 个字符', trigger: 'blur' },
          { validator: checkCard, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 1, max: 32, message: '长度不能超过32个字符', trigger: 'blur' },
          { validator: checkNameNFC, trigger: 'blur' }
        ],
        nameGPS: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 1, max: 32, message: '长度不能超过32个字符', trigger: 'blur' },
          { validator: checkNameGPS, trigger: 'blur' }
        ],
        remark: [
          { min: 0, max: 60, message: '长度不能超过60个字符', trigger: 'blur' }
        ]
      },
      isInitMapFail: false,
      formFlag: 'NFC',
      addDioShow: false,
      modifyDioShow: false,
      Dio3Show: false,
      value2: true,
      messegeList: [],
      formNFC: {
        card: '',
        name: '',
        remark: ''
      },
      formGPS: {
        nameGPS: '',
        remark: ''
      },
      tmpData: [],
      addBtnShow: true,
      modifyShow: true,
      xyCoo: [],
      xValue: '',
      yValue: '',
      pointLng: '',
      pointLat: '',
      gpsCoo: [],
      mapOptions: [],
      sceneId: '',
      selectInfo: {},
      pointId: '',
      addFlag: false,
      popupType: '1',
      coordinate: [],
      pointInfo: {},
      // 当前的地图对象
      mapObj: null,
      cacheMapList: {}
    }
  },
  watch: {
    messegeList (val) {
      if (val) {
        this.messegeList.forEach(item => {
          if (item.uuid === this.pointId) {
            this.pointInfo = item
          }
        })
      }
    }
  },
  mounted () {
    this.querySelect()
  },
  methods: {
    // 重复检测
    checkRepeat () {
      let param = {}
      if (this.formFlag === 'NFC') {
        param.pointName = this.formNFC.name
        if (this.formNFC.name && (this.formNFC.name !== this.pointInfo.pointName)) {
          getPatrolPointRepeatData(param).then(res => {
            if (res.data.data === 1) {
              this.$message({
                message: '名称不能重复',
                type: 'error'
              })
              this.formNFC.name = ''
            }
          })
        }
      } else if (this.formFlag === 'GPS') {
        param.pointName = this.formGPS.nameGPS
        if (this.formGPS.nameGPS && (this.formGPS.nameGPS !== this.pointInfo.pointName)) {
          getPatrolPointRepeatData(param).then(res => {
            if (res.data.data === 1) {
              this.$message({
                message: '名称不能重复',
                type: 'error'
              })
              this.formGPS.nameGPS = ''
            }
          })
        }
      }
    },
    // 清除表单
    clearData () {
      this.formNFC.card = ''
      this.formNFC.name = ''
      this.formNFC.remark = ''
      this.formGPS.nameGPS = ''
      this.formGPS.remark = ''
    },
    // 渲染下拉框
    querySelect () {
      getPatrolPointSelectData().then(res => {
        if (res.data.code === '00000') {
          this.mapOptions = res.data.data
          this.createMap(this.mapOptions[0].options[0])
          this.sceneId = res.data.data[0].options[0].id
          this.selectInfo = this.mapOptions[0].options[0]
          this.queryPoint()
        }
      }).catch(err => {
        console.warn(err)
        this.isInitMapFail = true
      })
    },
    // 下拉框切换地图
    mapChange () {
      this.mapOptions.forEach(item => {
        item.options.forEach(i => {
          if (i.id === this.sceneId) {
            this.createMap(i)
            this.sceneId = i.id
            this.selectInfo = i
            this.queryPoint()
          }
        })
      })
    },
    // 渲染巡查点列表
    queryPoint () {
      getPatrolPointMessegeData(
        { 'mapId': this.sceneId }
      ).then(res => {
        let arr = []
        if (res.data.code === '00000') {
          this.messegeList = res.data.data
          this.messegeList.map(item => {
            let obj = {
              position: [item.xValue, item.yValue],
              imgUrl: markerImg,
              size: [29, 41],
              id: item.uuid
            }
            arr.push(obj)
          })
          this.mapObj.addMarkers(arr)
        }
      })
    },
    // 新增点位弹框的确定按钮 & 表单验证
    submitAdd () {
      if (this.formFlag === 'NFC') {
        this.$refs['formNFC'].validate((valid) => {
          if (valid) {
            this.addPoint()
          } else {
            return false
          }
        })
      } else if (this.formFlag === 'GPS') {
        this.$refs['formGPS'].validate((valid) => {
          if (valid) {
            this.addPoint()
          } else {
            return false
          }
        })
      }
    },
    // 添加点位功能
    addPoint () {
      let params = {
        'mapId': this.sceneId,
        'xValue': this.xValue,
        'yValue': this.yValue,
        'lng': this.pointLng,
        'lat': this.pointLat
      }
      if (this.formFlag === 'NFC') {
        params.cardNumber = this.formNFC.card
        params.pointName = this.formNFC.name
        params.remark = this.formNFC.remark
      } else {
        params.pointName = this.formGPS.nameGPS
        params.remark = this.formGPS.remark
      }
      postInsertPatrolPointData(params).then(rs => {
        if (rs.data.code === '00000') {
          this.clearData()
          this.queryPoint()
          this.closeAddDialog()
          this.$message({
            message: rs.data.message,
            type: 'success'
          })
        } else {
          this.$message({
            message: rs.data.message,
            type: 'warning'
          })
        }
      }).catch(err => {
        this.$message.error(err)
      })
    },
    // 添加巡查点按钮
    startAdd () {
      this.addFlag = true
      this.addBtnShow = false
    },
    // 结束添加按钮
    finishAdd () {
      this.addFlag = false
      this.addBtnShow = true
    },
    // 关闭添加弹框
    closeAddDialog () {
      this.$refs['formNFC'].resetFields()
      this.$refs['formGPS'].resetFields()
      this.clearData()
      this.addDioShow = false
    },
    // 关闭修改弹框
    closeModifyDialog () {
      this.$refs['formNFC'].resetFields()
      this.$refs['formGPS'].resetFields()
      this.clearData()
      this.modifyDioShow = false
    },
    // 删除点位功能
    delatePoint () {
      let params = {
        patrolPointId: this.pointId
      }
      postDeletePatrolPointData(params).then(rs => {
        if (rs.data.code === '00000') {
          this.$message({
            message: rs.data.message,
            type: 'success'
          })
          this.mapObj.removeMarkerBylayerKey(this.pointId, 'commonLayer')
          this.mapObj.closePopup('pointMsgPopup')
          this.queryPoint()
        } else {
          this.$message({
            message: rs.data.message,
            type: 'warning'
          })
        }
      })
    },
    // 删除点位按钮
    delButton () {
      this.$confirm('此操作将删除该巡查点, 是否继续?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.delatePoint()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 开始修改按钮
    modifyBtn () {
      if (this.formFlag === 'NFC') {
        this.formNFC.card = this.pointInfo.cardNumber
        this.formNFC.name = this.pointInfo.pointName
        this.formNFC.remark = this.pointInfo.remark
      } else if (this.formFlag === 'GPS') {
        this.formGPS.nameGPS = this.pointInfo.pointName
        this.formGPS.remark = this.pointInfo.remark
      }
      this.modifyDioShow = true
    },
    // 提交修改 & 表单验证
    submitModify () {
      if (this.formFlag === 'NFC') {
        this.$refs['formNFC'].validate((valid) => {
          if (valid) {
            this.modifyPoint()
          } else {
            return false
          }
        })
      } else if (this.formFlag === 'GPS') {
        this.$refs['formGPS'].validate((valid) => {
          if (valid) {
            this.modifyPoint()
          } else {
            return false
          }
        })
      }
    },
    // 修改功能
    modifyPoint () {
      let params = {
        'mapId': this.sceneId,
        'uuid': this.pointId,
        'xValue': this.xValue,
        'yValue': this.yValue,
        'lng': this.pointLng,
        'lat': this.pointLat
      }
      if (this.formFlag === 'NFC') {
        params.cardNumber = this.formNFC.card
        params.pointName = this.formNFC.name
        params.remark = this.formNFC.remark
      } else {
        params.pointName = this.formGPS.nameGPS
        params.remark = this.formGPS.remark
      }
      postUpdatePatrolPointData(params).then(rs => {
        if (rs.data.code === '00000') {
          this.$message({
            message: rs.data.message,
            type: 'success'
          })
          this.queryPoint()
          this.clearData()
          this.closeModifyDialog()
        } else {
          this.$message({
            message: rs.data.message,
            type: 'warning'
          })
        }
      })
    },
    // 点击li弹出编辑弹窗
    openPopup (item) {
      let info = item
      this.pointInfo = item
      this.pointId = item.uuid
      if (item.cardNumber === null) {
        this.formFlag = 'GPS'
        this.formNFC.card = ''
        this.formNFC.name = ''
        this.formNFC.remark = ''
      } else {
        this.formFlag = 'NFC'
        this.formGPS.nameGPS = ''
        this.formGPS.remark = ''
      }
      this.mapObj.showPopup('pointMsgPopup', [info.xValue, info.yValue])
    },
    // 注册点击事件
    regListener () {
      this.mapObj.regEventListener('singleclick', (e) => {
        console.log(e)
        this.coordinate = e.coordinate
        if (e.feature) {
          // 弹出点位信息弹框
          console.log(this.coordinate)
          this.mapObj.showPopup('pointMsgPopup', this.coordinate)
          this.pointId = e.feature.id
          this.messegeList.forEach(item => {
            if (item.uuid === this.pointId) {
              this.pointInfo = item
              if (item.cardNumber === null) {
                this.formFlag = 'GPS'
                this.formNFC.card = ''
                this.formNFC.name = ''
                this.formNFC.remark = ''
              } else {
                this.formFlag = 'NFC'
                this.formGPS.nameGPS = ''
                this.formGPS.remark = ''
              }
            }
          })
        } else {
          if (this.addFlag) {
            this.formFlag = 'NFC'
            this.addDioShow = true
          }
        }
        this.xValue = this.coordinate[0]
        this.yValue = this.coordinate[1]
        if (this.selectInfo.sceneType === 1) {
          let gps = this.mapObj.transBitmapToWGS(e.coordinate)
          this.pointLng = gps[0]
          this.pointLat = gps[1]
        } else if (this.selectInfo.sceneType === 4) {
          this.pointLng = ''
          this.pointLat = ''
        }
      })
    },
    // 初始化地图
    createMap (option) {
      // 获取小区真实地图图片
      let mapImageUrl = option.url
      option.mapUrl = option.url
      option.sizeW = option.width
      option.sizeH = option.height
      option.center = [0, 0]
      option.centerGPS = [option.centerLon, option.centerLat]
      // 如果没有初始化过，进行地图的初始化
      let mapOption = extendObj({
        gisEngine: 'bitmap',
        domId: 'bitmap',
        mapUrl: mapImageUrl,
        sizeW: 1920,
        sizeH: 1080,
        maxZoom: 5,
        minZoom: 2,
        scaleType: 1,
        scale: 2,
        center: [113.26, 23.15],
        centerGPS: [113.26, 23.15]
      }, option)
      if (this.mapObj) {
        this.mapObj.saveOutterPopup(['pointMsgPopup'])
        this.mapObj.getMap().setTarget(null)
      }
      // 如果是第一次加载
      if (!this.cacheMapList[option.id]) {
        // eslint-disable-next-line
        this.mapObj = this.cacheMapList[option.id] = new hdmap.initMap(mapOption)
      } else {
        this.mapObj = this.cacheMapList[option.id]
      }
      this.mapObj.getMap().setTarget('bitmap')
      this.regListener()
      this.mapObj.addPopup('pointMsgPopup')
    }
  }
}
</script>
<style scoped lang='less'>
.con-left {
  background-color: #55616d;
  width: 84%;
  margin-top: 20px;
  border: 1px solid #999;
  .point-form {
    width: 300px;
    margin-top: 10px;
  }
  .patrol-point-map {
    // width: 100%;
    height: 718px;
    .initMapFail {
      color: #fff;
      text-align: center;
      margin: 30px 0;
    }
  }
  .point-msg-popup {
    border-radius: 10px;
    background: #fff;
    text-align: center;
    .mPP-header {
      border-radius: 10px 10px 0 0;
      height: 50px;
      line-height: 50px;
      background-color: #409eff;
      color: #fff;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .mPP-mid {
      text-align: left;
      height: 90px;
      margin: 10px 10px 0 10px;
    }
  }
}
.con-right {
  width: 14%;
  box-sizing: border-box;
  height: 720px;
  border: 1px solid #ccc;
  margin-left: 20px;
  margin-top: 20px;
  .list-head {
    height: 70px;
    line-height: 70px;
    text-align: center;
    background-color: #409eff;
  }
  .list-ul {
    height: 650px;
    overflow-y: auto;
    li {
      padding: 0 20px;
      box-sizing: border-box;
      width: 100%;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      color: #409eff;
      div {
        width: 100%;
        border-bottom: 1px solid #ccc;
        white-space: nowrap;
      }
      span {
        display: inline-block;
        margin-left: 6px;
        vertical-align: middle;
        height: 20px;
        line-height: 20px;
        img {
          height: 18px;
        }
      }
    }
  }
}
</style>

