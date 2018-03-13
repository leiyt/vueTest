<template>
  <div class="inoutControl">
    <section>
      <el-button type="primary" @click="artificRel('in')">人工放行-进场</el-button>
      <el-button type="primary" @click="artificRel('out')">人工放行-出场</el-button>
      <el-button type="primary" @click="anomalyDis" ref='anomalyDis'>场内车辆</el-button>
      <el-dialog :visible.sync="dialogVisibleExcep" class="in-record" title="场内车辆" :before-close = 'closeExcp'>
        <div class="filter-back">  
          <iframe id='iframebar0' src="about:blank" frameBorder=0 marginHeight=0 marginWidth=0 class="filter-iframe"></iframe>
        </div>
        <car-in-record ref="CarInRecord" :CarInRecord = "inoutData" :inCarLoad = "inCarLoad"></car-in-record>
        <div style="text-align:center;width:100%; position: relative; z-index:999">
          <el-button @click="closeExcp">关闭</el-button>
        </div>
      </el-dialog>
    </section>
    <section class="inout-cont">
      <div class="left-cont">
        <section class="img-inout">
          <div style="width:100%;height:100%;position:absolute; top:0;left:0;z-index:-1;">
            <object v-for="(item, index) in rtspData" :key="item.id" class="obj-style" ref = "PlayOcx" 
            :id="'PlayOcx'+index" classid="clsid:{E3C9EE5C-D51A-4743-AD60-36CC82816A18}" 
              onerror="Load Error!"> 
              <param name="wmode" value="opaque" />
            </object> 
          </div>       
        </section>
        <section class="table-cont">
          <el-table :data="inoutData" border>
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column prop="carNum" label="车牌号码" width="100"></el-table-column>
            <el-table-column prop="direct" label="进出口类型" :formatter="typeFormat"></el-table-column>
            <el-table-column prop="channelName" label="出入口通道" width="100" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="ownerName" label="业主姓名" width="80" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="cardNo" label="卡号" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="inTime" label="入场时间" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="outTime" label="出场时间" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="ruleName" label="规则" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="cash" label="收费金额"></el-table-column>
            <!-- <el-table-column prop="inImg" label="入场图片">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="handleCheck(scope.$index, scope.row, 'in')">查看图片</el-button>
              </template>
            </el-table-column>
            <el-table-column
              prop="outImg"
              label="出场图片">
              <template slot-scope="scope">
                <el-button v-show="scope.row.direct === 1" size="mini" type="primary" @click="handleCheck(scope.$index, scope.row, 'out')">查看图片</el-button>
              </template>
            </el-table-column> -->
            <el-table-column prop="remark" label="备注"></el-table-column>
          </el-table>
        </section>
      </div>
      <div class="right-cont">
        <article class="device-img">
          <div v-for="channel in channelData" :key="channel.id">
            <p>
              <img src="../assets/images/img003.png" v-if="channel.isOnLine === 'false'">
              <img src="../assets/images/imgOnline.png" v-else>
            </p>
            <p v-text="channel.deviceName"></p>
          </div>
        </article>
        <article class="park-right">
          <el-table :data="parkData" border style="width: 100%; ">
            <el-table-column prop="parkName" label="车场名称" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="totalParkSeat" label="总车位数"></el-table-column>
            <el-table-column prop="surplusParkSeat" label="剩余临停车位数"></el-table-column>
          </el-table>
        </article>
      </div>
    </section>
    <el-dialog :visible.sync="dialogCutOfVisible" :close-on-click-modal="false" :show-close = "false" 
      :close-on-press-escape = "false" class="detail-main" :title="cutOfTitle">
      <div class="filter-back">  
        <iframe id='iframebar' src="about:blank" frameBorder=0 marginHeight=0 marginWidth=0 class="filter-iframe"></iframe>
      </div>
      <div class="filterMain">
      <el-tabs type="border-card" v-model="tabIndexVal" @tab-click="tabChangeClick">  <!-- // v-if="isOutPark" v-show="detailForm.length > 0" -->
        <el-tab-pane v-for="(item, index) in detailForm" :key="index" :label="item.channelName" :name="item.channelId">
          <el-form ref="item" :model="item" label-width="120px">
            <div class="img-cutoff">
              <img :src="item.fastdfsHttpAddress+item.recordInImage" alt="入场图片" />
              <img :src="item.fastdfsHttpAddress+item.recordOutImage" v-show="item.direct==1" alt="出场图片" />
            </div>
            <ul>
              <li v-if="item.cardNo"><label>卡号</label><span v-text="item.cardNo" ></span></li>
              <li v-else><label>车牌号</label><input v-model="item.carNum"><el-button :disabled="cutOffDiab" size="small" @click="editCarNum(index)" type="primary">车牌矫正</el-button></li>
              <li class="list-inline"><label>车辆类型</label>
                <span v-if="item.carMode === '0'" >小车</span><span v-else-if="item.carMode === '1'" >大车</span>
                <span v-if="item.carMode === '2'" >超大车</span><span v-else-if="item.carMode === '3'" >摩托</span>
              </li>
              <li class="list-inline"><label>规则</label><span v-text="item.ruleName"></span></li>
              <li class="list-inline"><label>进场时间</label><span v-text="item.inTime"></span></li>
              <li class="list-inline" v-show="item.direct==1"><label>出场时间</label><span v-text="item.outTime" ></span></li>
              <li v-show="item.direct==1"><label>停车时长</label><span v-text="item.timeLength" ></span></li>
              <li v-show="item.direct==1" ><label>应缴金额</label><span v-text="item.cash"></span>元</li>
              <li v-show="item.direct==1"><label>实缴金额</label><input v-model="item.amountCash" class="cash-price" @input="changePrice(index)" />元
                <!-- <span v-show="priceTips" class="price-tips">请输入正确的金额</span> -->
              </li>
              <li v-show="item.direct==1"><label>找零</label><span v-text="item.billChange"></span></li>
              <li><label>备注</label><textarea v-model="item.remark"></textarea></li>
            </ul>
            <el-form-item>
              <el-button size="small" type="primary" :disabled="cutOffDiab" @click="getCutOff(index)">开 闸</el-button>
              <el-button size="small" :disabled="cutOffDiab" @click="channelCutOff(index, item.channelId)">取消</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible" :title="artRelTitle" :before-close="closeDialog">
      <div class="filter-back">  
        <iframe id='iframebar' src="about:blank" frameBorder=0 marginHeight=0 marginWidth=0 class="filter-iframe"></iframe>
      </div>
      <div class="filterMain">
      <el-form ref="artRelForm" :model="artRelForm" :rules="formRules" label-width="120px">
        <el-form-item label="放行类别" prop = "carType" >
          <el-select v-model="artRelForm.passType" placeholder="请选择" style="width:50%" @change="choiseStyle">
            <el-option label="非机动车" value="0"></el-option>
            <el-option label="机动车" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="车牌号" v-show="isPriveCar">
          <el-input v-model="artRelForm.carNum" style="width:50%"></el-input>
        </el-form-item>
        <el-form-item label="车辆类型" prop = "carType"  v-show="isPriveCar">
          <el-select v-model="artRelForm.carType" placeholder="车辆类型" style="width:50%">
            <el-option label="小车" value="0"></el-option>
            <el-option label="大车" value="1"></el-option>
            <el-option label="超大车" value="2"></el-option>
            <el-option label="摩托车" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="通道" prop="channel">
          <el-select v-model="artRelForm.channel" placeholder="通道" style="width:50%" v-if="isDirect===0">
            <el-option v-for="item in channelInOpt" :key="item.key" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-select v-model="artRelForm.channel" placeholder="通道" style="width:50%" v-else>
            <el-option v-for="item in channelOutOpt" :key="item.key" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="artRelForm.remark" style="width:50%"></el-input>
        </el-form-item>
        <el-form-item style="text-align:right;width:100%">
          <el-button @click="cannelBtn">取 消</el-button>
          <el-button type="primary" @click="saveData('artRelForm')">确认</el-button>
        </el-form-item>
      </el-form>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogImgVisible" title="查看图片" >
      <div class="filter-back">  
        <iframe src="about:blank" frameBorder=0 marginHeight=0 marginWidth=0 class="filter-iframe"></iframe>
      </div>
      <div class="filterMain">
        <div class="check-img"><img :src="imgUrl"/></div>
        <div style="text-align:center;width:100%">
          <el-button @click="dialogImgVisible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CarInRecord from './CarInRecord'
import {
  queryParkAndParkSeatInfo,
  getParkDeviceByLocalIp,
  getArtificialRelease,
  getChannelByIp,
  getCutOffData,
  updataCarNum,
  updateOutCarNum,
  getParkinglotAppWebSocketUrl,
  getStreaming,
  getHeartbeat
} from '@/views/ParkingLotApp/apis'
export default {
  data () {
    return {
      currentPage: 1,
      total: 0,
      pageSize: '10',
      showLen: 100,
      // loading2: true,
      tempCar: '',
      dialogVisible: false,
      dialogVisibleExcep: false,
      dialogImgVisible: false,
      dialogCutOfVisible: false,
      isOutPark: false,
      isPriveCar: false,
      ocxShow: true,
      ocxPreviewShow: false,
      deviceId: '',
      // isOutContral: false,
      isDirect: 0,
      inoutData: [],
      chanCarNo: [],
      inCarLoad: 1,
      currChnCar: '',
      parkData: [],
      channelData: [], // 通道设备
      monitDevice: [], // 监控设备
      cutOfTitle: '进场-车牌或卡号',
      artRelTitle: '人工放行-进场',
      cutOffDiab: false,
      // imgUrl: '',
      detailForm: [],
      rtspData: ['rtsp://192.168.199.53/11', 'rtsp://192.168.0.24/11'],  // 视频IP地址
      tabIndexVal: '',
      artRelForm: {
        carNum: '',
        passType: '',
        carType: '0',
        direct: '',
        channel: '',
        remark: ''
      },
      formRules: {
        carType: [
          { required: true, message: '请选择车辆类型', trigger: 'change' }
        ],
        channel: [
          { required: true, message: '请选择通道', trigger: 'change' }
        ]
      },
      channelInOpt: [],
      channelOutOpt: [],
      websocket: '',
      localIp: '',
      computerName: '',
      webSocketServerUrl: ''
    }
  },
  components: {
    CarInRecord
  },
  mounted () {
    let _this = this
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      var WshShell = new window.ActiveXObject('WScript.Shell')
      var computerName = WshShell.ExpandEnvironmentStrings('%COMPUTERNAME%')
      this.computerName = computerName
      console.info('computerName:' + computerName)
      this.startWebSockt()
      this.getChannel(0)
      this.getChannel(1)
      this.loadDevice()
      this.loadParkSeat()
    } else {
      this.$message({
        message: '出入口管控请用IE浏览器打开',
        type: 'warning'
      })
    }
    _this.getStreaming()
    _this.BtnPlay()
    window.setInterval(function () {
      _this.getHeartbeat()
    }, 10000)
  },
  beforeDestroy () {
    this.websocket && this.websocket.close()
  },
  methods: {
    changeOcxPreviewShow () {
      this.ocxPreviewShow = false
    },
    BtnPlay () {
      for (let i = 0; i < this.rtspData.length; i++) {
        document.getElementById('PlayOcx' + i).PlayVideo(this.rtspData[i])
      }
    },
    // 获取类型
    getCamareKind (data) {
      console.log(data)
      this.cameraKind = data.cameraKind
      switch (this.cameraKind) {
        case 2001:
          this.videoWidth = '1160px'
          this.captureShow = false
          break
        case 2004:
          this.cameraData = {
            cameraId: data.parentId,
            deviceId: this.deviceId
          }
          this.videoWidth = '1290px'
          this.captureShow = true
          this.faceRecognitionShow = true
          this.$nextTick(() => {
            this.$refs.facePicture.onDialogOpen() // 获取人脸抓拍图片
          })
          break
        case 2003:
          this.cameraData = {
            cameraId: data.parentId,
            deviceId: this.deviceId
          }
          this.videoWidth = '1290px'
          this.captureShow = true
          this.faceRecognitionShow = false
          this.$nextTick(() => {
            this.$refs.preset.fnGetPreset() // 获取预置点
            this.$refs.preset.fnGetCruise() // 获取巡航点
          })
          break
      }
    },
    getHeartbeat () {
      getHeartbeat()
        .then(function (response) {
          // console.log('getHeartbeat response ' + JSON.stringify(response))
        })
        .catch(
          function (error) {
            console.log(error)
          }
        )
    },
    getStreaming () {
      let _this = this
      getStreaming()
        .then(function (response) {
          // console.log('getStreaming response ' + JSON.stringify(response))
          _this.BtnPlay()
          _this.getHeartbeat()
        })
        .catch(
          function (error) {
            console.log(error)
          }
        )
    },
    loadParkSeat () {
      var _this = this
      // _this.loading2 = true
      queryParkAndParkSeatInfo()
        .then(function (response) {
          // _this.loading2 = false
          _this.parkData = response.data
        })
        .catch(
          function (error) {
            // this.loading2 = false
            console.log(error)
          }
        )
    },
    loadDevice () {
      var _this = this
      _this.channelData = []
      getParkDeviceByLocalIp(_this.computerName)
      .then(function (response) {
        if (response.code === '0') {
          for (let i = 0; i < response.data.length; i++) {
            if (response.data[i].deviceTypeCode === '2005') {
              _this.channelData.push(response.data[i])
            } else {
              _this.monitDevice.push(response.data[i])
            }
          }
        }
      })
      .catch(
        function (error) {
          console.log(error)
        }
      )
    },
    getChannel (direct) {
      let _this = this
      getChannelByIp(direct, this.computerName)
      .then(function (response) {
        if (response.code === '0') {
          let len = response.data.length
          if (direct === 0) {
            _this.isDirect = 0
            for (let i = 0; i < len; i++) {
              _this.channelInOpt.push({'value': response.data[i].uuid + response.data[i].direct, 'label': response.data[i].name})
            }
          } else if (direct === 1) {
            _this.isDirect = 1
            for (let i = 0; i < len; i++) {
              _this.channelOutOpt.push({'value': response.data[i].uuid + response.data[i].direct, 'label': response.data[i].name})
            }
          }
        }
      })
      .catch(
        function (error) {
          console.log(error)
        }
      )
    },
    artificRel (val) {
      this.artRelForm.passType = ''
      this.isPriveCar = false
      this.artRelForm.channel = ''
      if (val === 'in') {
        this.artRelTitle = '人工放行-进场'
        this.artRelForm.direct = 0
        this.isDirect = 0
      } else {
        this.artRelTitle = '人工放行-出场'
        this.artRelForm.direct = 1
        this.isDirect = 1
      }
      this.artRelForm.carNum = ''
      this.artRelForm.carType = '0'
      this.artRelForm.channel = ''
      this.artRelForm.remark = ''
      this.dialogVisible = true
      // this.getChannel(this.artRelForm.direct)
    },
    anomalyDis () {
      var _this = this
      _this.inCarLoad = _this.inCarLoad + 1
      _this.dialogVisibleExcep = true
    },
    closeExcp () {
      this.dialogVisibleExcep = false
    },
    // handleCheck (index, row, type) {
    //   this.dialogImgVisible = true
    //   if (type === 'in' && row.recordInImage) {
    //     this.imgUrl = row.fastdfsHttpAddress + row.recordInImage
    //   }
    //   if (type === 'out' && row.recordOutImage) {
    //     this.imgUrl = row.fastdfsHttpAddress + row.recordOutImage
    //   }
    // },
    saveData (formData) {
      var _this = this
      var _parmas = {
        passType: _this.artRelForm.passType,
        category: _this.artRelForm.category,
        carNum: _this.artRelForm.carNum,
        carType: _this.artRelForm.carStyle,
        channelId: _this.artRelForm.channel.substr(0, _this.artRelForm.channel.length - 1),
        direct: _this.artRelForm.channel.substr(_this.artRelForm.channel.length - 1),
        remark: _this.artRelForm.remark
      }
      this.$refs[formData].validate((valid) => {
        if (valid) {
          getArtificialRelease({
            params: JSON.stringify(_parmas)
          }).then(function (response) {
            if (response.code === '0') {
              _this.$message({
                message: '人工放行成功！',
                type: 'success'
              })
            } else {
              _this.$message({
                message: '人工放行失败！',
                type: 'fail'
              })
            }
            _this.dialogVisible = false
          })
        }
      })
    },
    typeFormat (row) {
      let recordType = row.direct
      if (recordType === 0) {
        // this.isOutContral = true
        return '入场'
      } else if (recordType === 1) {
        // this.isOutContral = false
        return '出场'
      }
    },
    startWebSockt () {  // 进出口信息推送
      var _this = this
      let websocketUrl = getParkinglotAppWebSocketUrl()
      _this.webSocketServerUrl = 'ws://' + websocketUrl + '/webSocket/egsc_scp_parkinglotapp/readData' + '?' + _this.computerName
      //  console.info(_this.webSocketServerUrl)
      _this.websocket && _this.websocket.close()
      _this.websocket = new WebSocket(_this.webSocketServerUrl)
      _this.websocket.onopen = function () {
        var message = {
          test: 'hello'
        }
        _this.websocket.send(JSON.stringify(message))
      }
      _this.websocket.onmessage = function (event) {
        let eventData = JSON.parse(event.data)
        let dataArr = ''
        let seatArr = ''
        let deviceArr = ''
        let len = _this.inoutData.length
        let formLen = _this.detailForm.length
        if (eventData.park_inout_record_message) {
          dataArr = JSON.parse(eventData.park_inout_record_message)
          _this.chanCarNo = []
          console.info('弹出: ' + JSON.stringify(_this.detailForm))
          if (_this.detailForm.length > 0) {
            for (let i = 0; i < formLen; i++) {
              if (_this.detailForm[i].cardNo && _this.detailForm[formLen - 1].cardNo !== '') {
                _this.chanCarNo.push(_this.detailForm[i].cardNo + _this.detailForm[i].channelId)
              } else {
                _this.chanCarNo.push(_this.detailForm[i].carNum + _this.detailForm[i].channelId)
              }
            }
            _this.chanCarNo = Array.from(new Set(_this.chanCarNo))
          }
          if (dataArr.cardNo && dataArr.cardNo !== '') {
            _this.currChnCar = dataArr.cardNo + dataArr.channelId
          } else {
            _this.currChnCar = dataArr.carNum + dataArr.channelId
          }
          console.info('上一个通道: ' + _this.chanCarNo)
          console.info('当前牌通道: ' + _this.currChnCar)
          if ((dataArr.openWay === 2 || dataArr.openWay === 3) && _this.chanCarNo.indexOf(_this.currChnCar) === -1) {
            _this.dialogCutOfVisible = true
            console.log(JSON.stringify(dataArr))
            _this.setDialogTitle(dataArr)
            // if (dataArr.direct === 0) {
            //   if (dataArr.carNum && dataArr.carNum !== '') {
            //     _this.cutOfTitle = '入场-' + dataArr.carNum
            //     _this.tempCar = dataArr.carNum
            //   } else if (dataArr.cardNo !== '') {
            //     _this.cutOfTitle = '入场-' + dataArr.cardNo
            //   } else {
            //     _this.cutOfTitle = '入场-无牌车'
            //   }
            //   _this.isOutPark = false
            // } else if (dataArr.direct === 1) {
            //   _this.isOutPark = true
            //   if (dataArr.carNum && dataArr.carNum !== '') {
            //     _this.cutOfTitle = '出场-' + dataArr.carNum
            //     _this.tempCar = dataArr.carNum
            //   } else if (dataArr.cardNo !== '') {
            //     _this.cutOfTitle = '出场-' + dataArr.cardNo
            //   } else {
            //     _this.cutOfTitle = '出场-无牌车'
            //   }
            // }
            _this.detailForm.push(dataArr)
            _this.tabIndexVal = dataArr.channelId
          }
        }
        if (eventData.park_seat_idle_change_message) {
          seatArr = JSON.parse(eventData.park_seat_idle_change_message)
        }
        if (eventData.park_device_status_message) {
          deviceArr = JSON.parse(eventData.park_device_status_message)
        }
        if (seatArr !== '') {
          _this.loadParkSeat()
        }
        if (deviceArr !== '') {
          _this.loadDevice()
        }
        // console.log('eventData' + JSON.stringify(eventData))
        // console.log('dataArr ' + JSON.stringify(dataArr))
        // console.log(seatArr)
        if (dataArr !== '' && _this.chanCarNo.indexOf(_this.currChnCar) === -1) {
          _this.inoutData.unshift(dataArr)
        }
        if (len > _this.showLen) {
          _this.inoutData.splice(_this.showLen, 1)
        }
      }
      _this.websocket.onerror = function (event) {
        console.log(event)
      }
    },
    getCutOff (index) {  // 开闸
      console.log('index : ' + index)
      let _this = this
      let params_ = _this.detailForm[index]
      console.log('detailForm ' + JSON.stringify(params_))
      if ((params_.billChange && params_.billChange !== '') || params_.direct === 0 || params_.cash === 0) {
        _this.cutOffDiab = true
        getCutOffData({
          params: JSON.stringify(params_)
        }).then(function (response) {
          let errorcode = response.code
          _this.cutOffDiab = false
          if (errorcode === '0') {
            _this.$message({
              message: '开闸成功',
              type: 'success'
            })
            _this.channelCutOff(index, params_.channelId)
          } else {
            _this.$message({
              message: '开闸失败',
              type: 'error'
            })
          }
        })
        .catch(() => {
          _this.cutOffDiab = false
        })
      } else {
        this.$message.error('请输入正确的金额')
      }
    },
    editCarNum (index) { // 矫正车牌
      console.log('index : ' + index)
      let _this = this
      console.log('tempCar : ' + _this.tempCar)
      let params_ = _this.detailForm[index]
      console.log(params_.direct)
      console.log('detailForm ' + JSON.stringify(params_))
      if (params_.direct === 1) { // 出场矫正车牌
        updateOutCarNum({
          params: JSON.stringify(params_)
        }).then(function (response) {
          let errorcode = response.code
          if (errorcode === '0') {
            _this.detailForm[index] = response.data
            _this.tabChangeClick(index)
            _this.$message({
              message: '车牌矫正成功',
              type: 'success'
            })
          } else {
            _this.detailForm[index].carNum = _this.tempCar
            _this.tabChangeClick(index)
            _this.$message({
              message: '请输入正确的车牌',
              type: 'error'
            })
          }
        })
      } else if (params_.direct === 0) {
        updataCarNum({
          params: JSON.stringify(params_)
        }).then(function (response) {
          let errorcode = response.code
          _this.detailForm[index] = response.data
          if (errorcode === '0') {
            _this.tabChangeClick(index)
            _this.$message({
              message: '车牌矫正成功',
              type: 'success'
            })
          } else {
            _this.detailForm[index].carNum = _this.tempCar
          }
        })
      }
    },
    cannelBtn () {
      this.dialogVisible = false
      this.$refs['artRelForm'].resetFields()
    },
    closeDialog (done) {
      done()
      this.$refs['artRelForm'].resetFields()
    },
    choiseStyle (val) {
      if (val === '0') {
        this.isPriveCar = false
      } else if (val === '1') {
        this.isPriveCar = true
      }
    },
    channelCutOff (i, targetName) {
      if (this.detailForm.length === 1) {
        this.detailForm.splice(i, 1)
        this.dialogCutOfVisible = false
      } else {
        console.log('i : ' + i)
        console.log('targetName : ' + targetName)
        let tabs = this.detailForm
        let activeName = this.tabIndexVal
        // console.log(tabs)
        console.log('activeName : ' + activeName)
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.channelId === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.channelId
              }
              this.setDialogTitle(nextTab)
              // console.log('nextTab' + JSON.stringify(nextTab))
            }
          })
        }
        this.tabIndexVal = activeName
        this.detailForm = tabs.filter(tab => tab.name !== targetName)
        this.detailForm.splice(i, 1)
      }
    },
    tabChangeClick (tab, event) {
      let index
      if (tab.index) {
        index = tab.index
      } else {
        index = tab
      }
      this.setDialogTitle(this.detailForm[index])
    },
    changePrice (index) {
      let regexp = /^((?!0[0-9])\d+(\.\d{1,2})?)$/
      if (regexp.test(this.detailForm[index].amountCash)) {
        if (this.detailForm[index].amountCash >= 0 && (this.detailForm[index].amountCash >= this.detailForm[index].cash)) {
          this.detailForm[index].billChange = (this.detailForm[index].amountCash - this.detailForm[index].cash).toFixed(2) + ' 元'
        } else {
          this.detailForm[index].billChange = ''
        }
      } else {
        this.$message.error('请输入正确的金额')
      }
    },
    setDialogTitle (setDialogData) {
      if (setDialogData.direct === 1) {
        this.isOutPark = true
        if (setDialogData.carNum && setDialogData.carNum !== '') {
          this.cutOfTitle = '出场-' + setDialogData.carNum
          this.tempCar = setDialogData.carNum
        } else if (setDialogData.cardNo !== '') {
          this.cutOfTitle = '出场-' + setDialogData.cardNo
        } else {
          this.cutOfTitle = '出场-无牌车'
        }
      } else {
        this.isOutPark = false
        if (setDialogData.carNum && setDialogData.carNum !== '') {
          this.cutOfTitle = '入场-' + setDialogData.carNum
          this.tempCar = setDialogData.carNum
        } else if (setDialogData.cardNo !== '') {
          this.cutOfTitle = '入场-' + setDialogData.cardNo
        } else {
          this.cutOfTitle = '入场-无牌车'
        }
      }
    },
    getHostName () {
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        var WshShell = new window.ActiveXObject('WScript.Shell')
        var computerName = WshShell.ExpandEnvironmentStrings('%COMPUTERNAME%')
        this.computerName = computerName
        console.info('computerName:' + computerName)
      }
    }
  }
}
</script>
<style lang="less" scoped>
@border: 1px solid #dcdfe6;
.inout-cont {
  margin-top:20px;
  overflow: hidden;
  .left-cont{
    float:left;
    width:calc(~"100% - 500px");
    .img-inout{
      height: 500px;
      position: relative;
    }
    .table-cont{
      height: 360px;
      overflow-y: auto;
    }
  }
  .right-cont{
    float:right;
    width:500px;
    padding-left: 50px;
    box-sizing: border-box;
    .device-img{
      overflow: hidden;
      margin-bottom: 30px;
      div{
        float: left;
        text-align: center;
        width: 50%;
        p{
          padding: 5px;
        }
      }
    }
    .park-right{
      max-height:500px; 
      overflow-y:auto;
    }
  }
  .el-table>.el-table__body-wrapper{
    overflow: auto;
  }
}
 .check-img{
    padding: 15px;
    text-align:center;
    img{
      width: 640px;
      height: 480px;
    }
  }

.detail-main{
  .img-cutoff{
    text-align: center;
    min-height: 100px;
    img{
      width: 480px;
      height: 360px;
      margin: 0 10px;
    }
  }
  margin-top: 20px;
  .el-tabs--border-card>.el-tabs__header .el-tabs__item{
    width: 80px;
    padding: 0 10px;
  }
  ul{
    li{
      list-style: none;
      margin-bottom: 15px;
      min-height: 21px;
      input{
        height: 30px;
        line-height: 30px;
        border: @border;
        padding-left: 10px;
        width: 120px;
        margin-right: 10px;
      }
      .cash-price{
        width: 60px;
      }
      label{
        display: inline-block;
        width: 120px;
        text-align: right;
        margin-right: 15px;
      }
      textarea{
        vertical-align: middle;
        border: @border;
      }
    }
    .list-inline{
      display: inline-block;
      width: 500px;
    }
  }
}
.filterMain{
  position: relative;
  z-index: 999;
}
.obj-style{
  width:280px;
  height:250px; 
  background:#f2f2f2;filter:alpha(opacity=30);
  margin-right:4px;
}
.filter-back{
  width:100%;
  height:100%;
  z-index:99;
  pointer-events:none;
  position: absolute;top:0;left:0;filter:alpha(opacity=30);
}
.filter-iframe{
  position:absolute; 
  visibility:inherit; 
  top:0px;left:0;height:100%;width:100%; 
  z-Index:55; 
  filter:alpha(opacity=30);
}
.price-tips{
  color: #f56c6c;
  margin-left: 20px;
}
</style>
<style lang="less">
.detail-main{
  top:0!important;
  margin-top:0px!important;
  .el-dialog{
    margin-top:20px!important;
    width:60%;
  }
}
</style>




