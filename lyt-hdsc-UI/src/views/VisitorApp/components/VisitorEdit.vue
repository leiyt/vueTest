<template>
  <el-dialog :visible.sync="dialogFormVisible" width="880px" :before-close="handleClose" :modal-append-to-body="false">
    <div slot="title">
      <span>访客授权</span>
    </div>
    <el-form ref="form" :model="form" label-width="100px" :rules="rules">
      <el-row>
        <el-col :span="16">
          <el-row>
            <el-col :span="12">
              <el-form-item label="访客姓名" prop="name">
                <el-autocomplete v-model="form.name" :fetch-suggestions="querySearchAsync" placeholder="请输入内容" @select="handleSelectVisitor"></el-autocomplete>
              </el-form-item>
              <el-form-item label="访客单位" prop="company">
                <el-input v-model="form.company" :readonly="isCan"></el-input>
              </el-form-item>
              <el-form-item label="证件类型" prop="idenType">
                <el-select v-model="form.idenType" placeholder="请选择证件类型">
                  <el-option v-for="item in list.idenType" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="重点关注" prop="focusOnPersonnel">
                <el-select v-model="form.focusOnPersonnel" placeholder="请选择">
                  <el-option v-for="item in list.focusOnPersonnel" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="拜访原由" prop="reasonType">
                <el-input v-model="form.reasonType" :readonly="isCan"></el-input>
              </el-form-item>
              <el-form-item label="被访者姓名" prop="personName">
                <el-autocomplete v-model="form.personName" :fetch-suggestions="querySearchPerson" placeholder="请输入被访者姓名" @select="handleSelectPerson" popper-class="my-autocomplete">
                  <template slot-scope="props">
                    <div class="person-name">{{ props.item.name }}</div>
                    <span class="person-addr">{{ props.item.houseName }}</span>
                  </template>
                </el-autocomplete>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="sex">
                <el-select v-model="form.sex" placeholder="请选择性别">
                  <el-option v-for="item in list.sex" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="联系方式" prop="phone">
                <el-input v-model="form.phone" :readonly="isCan"></el-input>
              </el-form-item>
              <el-form-item label="证件号码" prop="idenNum">
                <el-input v-model="form.idenNum" :readonly="isCan"></el-input>
              </el-form-item>
              <el-form-item label="人员类型" prop="visitorType">
                <el-select v-model="form.visitorType" placeholder="请选择人员类型">
                  <el-option v-for="item in list.visitorType" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="拜访人数" prop="visitorCnt">
                <el-input v-model="form.visitorCnt" :readonly="isCan"></el-input>
              </el-form-item>
              <el-form-item label="来访车牌" prop="plateNum">
                <el-input v-model="form.plateNum" :readonly="isCan"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-form-item label="被访房屋地址" prop="houseAddr">
              <el-input :offset="23" v-model="form.houseAddr" readonly></el-input>
            </el-form-item>
            <el-form-item label="有效日期">
              <el-date-picker style="width:100%" v-model="effectDate" @change="changeDate" :readonly="isCan" value-format="yyyy-MM-dd HH:mm:ss" align="center" type="datetimerange" :editable="false" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss" :picker-options="birthPickerOption">
              </el-date-picker>
            </el-form-item>
          </el-row>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="facePic" label-width="0">
            <div class="upload-con">
              <div class="facePic-con">
                <async-img width=260 :src="defaultPic"></async-img>
              </div>
              <el-button type="primary" @click="uploadFacePic" v-show="isShow" style="margin-left:25px;">选择文件</el-button>
              <el-button type="primary" @click="CameraPhoto" v-show="isShow">拍照上传</el-button>
              <input @change="readFacePic" class="upload-pic" ref="uploadFacePicInput" type="file" accept="image/jpeg,image/png,image/gif">
              <camera-photo ref="CameraPhoto" :uploadImg="uploadImg" @changeImg="changeImg"></camera-photo>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row style="height:20px;"><hr/></el-row>
      <el-row>
        <el-col :span="8" :offset="2">授权方式:
          <span style="color:red;">{{form.info}}</span>
        </el-col>
      </el-row>
      <el-row class="authority-row">
        <el-col :span="6" :offset="4">
          <input type="checkbox" v-model="form.facePicType" :true-value="1" @change="checkedFace" />人 脸
        </el-col>
        <el-col :span="12">
          <el-button size="mini" type="success" v-if="currentFacePic">成功</el-button>
          <div v-else>
            <el-button size="mini" type="info">未授权</el-button>
          </div>
        </el-col>
      </el-row>
      <el-row class="authority-row">
        <el-col :span="6" :offset="4">
          <input type="checkbox" v-model="form.qrType" :true-value="1" />二维码
        </el-col>
        <el-col :span="12">
          <div v-if="qrCode">
            <el-button size="mini" type="success">成功</el-button>
            <!-- 点击查看二维码图片 -->
            <el-popover ref="popover" placement="right" width="250" trigger="click" v-model="isShowPopover">
              <template>
                <div id='code'>{{qrCode}}</div>
                <canvas id="canvas"></canvas>
              </template>
            </el-popover>
            <el-button v-popover:popover size="mini" type="success">查看</el-button>
          </div>
          <div v-else>
            <el-button size="mini" type="info">未授权</el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 注释部分代码可能后面会有需求 -->
      <!-- <el-row class="authority-row">
        <el-col :span="6" :offset="4">
          <input type="checkbox" v-model="form.ladderType" :true-value="1" />梯 控
        </el-col>
        <el-col :span="12">
          <el-button size="mini" type="success" v-if="currentLadderFlag">成功</el-button>
          <div v-else>
            <el-button size="mini" type="primary" @click="getLadderFlag(form.ladderType)">重新授权</el-button>
          </div>
        </el-col>
      </el-row>
      <el-row class="authority-row">
        <el-col :span="6" :offset="4">
          <input type="checkbox" v-model="form.passCodeType" :true-value="1" />密 码
        </el-col>
        <el-col :span="12">
          <div v-if="passCode">
            <el-button size="mini" type="success">成功</el-button>
            <span style="margin-left:10px;">{{passCode}}</span>
          </div>
          <div v-else>
            <el-button size="mini" type="primary" @click="getPassCode(form.passCode)">重新授权</el-button>
          </div>
        </el-col>
      </el-row> -->
      <el-row class="authority-row">
        <el-col :span="2" :offset="4">
          <input v-model="form.card" :true-value="1" type="checkbox" @change="checkedCard" />门禁刷卡
        </el-col>
        <el-col :span="6" :offset="4">
          <div v-if="cardId">
            <el-button size="mini" type="success">成功</el-button>
            <el-button size="mini" type="danger" @click="returnCard" v-if="!form.returnCardFlag">退卡</el-button>
            <el-button size="mini" type="danger" v-else>已退卡</el-button>
          </div>
          <div v-else>
            <el-button size="mini" type="info">未授权</el-button>
          </div>
        </el-col>
        <el-col :span="6" v-show="form.card||form.cardId">
          卡号：
          <el-input v-model="form.cardId" placeholder="请输入卡号" prop="cardId" style="width:130px;" size="mini"></el-input>
        </el-col>
      </el-row>
      <!-- 读卡设备串口列表 -->
      <div style="height:110px;" v-show="form.card">
        <el-col :span="6" :offset="4">
          <el-table ref="portList" :data="cardNum" highlight-current-row @current-change="selectPort" size="mini" height="110" style="width:150px">
            <el-table-column prop="port" label="读卡器串口设置"></el-table-column>
          </el-table>
        </el-col>
        <el-col :span="6" :offset="2" style="padding-top:50px;">
          <el-button @click="openCardPort" :disabled="openPort" size="mini">打开</el-button>
          <el-button @click="closeCardPort" :disabled="closePort" size="mini">关闭</el-button>
          <el-alert v-bind:title="portMsg" :type="elAlertType" left :closable="false" style="background-color:#FFFFFF"></el-alert>
        </el-col>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onVisitorSave" :disabled="disabledButton">保 存</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import Vue from 'vue'
import CameraPhoto from '@/components/CameraPhoto/CameraPhoto'
import imgurl from '@/views/VisitorApp/assets/images/default_picture.png'
import AsyncImg from './AsyncImg'
import { getTypeNodeMap, addVisitorInfoTest, listByName, searchVisitorInfo, returnCard } from '@/views/VisitorApp/apis/index.js'
import { phoneVerification, nameValidator, typeValidator } from '@/views/VisitorApp/assets/js/validate.js'
import QRCode from 'qrcode'
Vue.use(QRCode)
export default {
  components: {
    AsyncImg,
    CameraPhoto
  },
  props: {
    cardNum: {
      default: [],
      type: Array
    },
    iccardObj: {
      default: null,
      type: Object
    }
  },
  data () {
    let that = this // 暂时去掉输入验证
    // 校验证件号是否输入正确
    var validatePassport = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入证件号码'))
      } else if (that.form.idenType === '1') {
        // 身份证验证
        if (!/^[1-9]\d{5}(19|20)*[0-99]{2}(0[1-9]{1}|10|11|12)(0[1-9]{1}|1[0-9]|2[0-9]|30|31)(\d{3})([0-9]|X|x)$/.test(value)) {
          callback(new Error('请输入正确的身份证号码!'))
        } else {
          callback()
        }
      } else if (that.form.idenType === '5') {
        // 护照验证
        if (
          !/(^1[45][0-9]{7}$)|(^(P|p|S|s)\d{8}$)|(^(S|s|G|g)\d{8}$)|(^(Gg|Tt|Ss|Ll|Qq|Dd|Aa|Ff)\d{8}$)|(^(H|h|M|m)\d{8,10}$)/.test(
            value
          )
        ) {
          callback(new Error('请输入正确的护照号码!'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      isInited: false,
      isShowPopover: false,
      form: {
        name: '',
        company: '',
        sex: '',
        idenType: '',
        focusOnPersonnel: '',
        phone: '',
        idenNum: '',
        visitorUuid: '',
        facePic: '',
        faceId: '',
        fileName: '',
        reasonType: '',
        visitorCnt: 1,
        plateNum: '',
        personName: '',
        status: 0,
        houseAddr: '',
        uuid: '',
        personType: '',
        personId: '',
        houseId: '',
        startTime: '',
        endTime: '',
        // 授权信息
        cardId: '',
        qrType: '',
        facePicType: 1,
        ladderType: '',
        passCodeType: '',
        card: '',
        visitorType: '',
        info: '',
        returnCardFlag: ''
      },
      cardId: '',
      qrCode: '',
      currentFacePic: '',
      currentLadderFlag: '',
      passCode: '',
      effectDate: [],
      uploadImg: {
        imgName: 'cameraPhote.jpg',
        imgBase64: ''
      },
      dialogFormVisible: false,
      disabledButton: false,
      list: '',
      birthPickerOption: {    // 有效日期
        disabledDate (time) {
          return time.getTime() < Date.now() - 3600 * 1000 * 24
        }
      },
      rules: {
        name: [
          { required: true, min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' },
          { validator: nameValidator, message: '姓名格式输入不正确', trigger: 'blur' }
        ],
        idenNum: [
          { required: true, min: 2, max: 18, message: '请输入证件号码', trigger: 'blur' },
          { validator: validatePassport, message: '证件号码输入不正确', trigger: 'blur' },
          { validator: typeValidator, message: '不能输入特殊字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: phoneVerification, message: '手机号码输入不正确', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '性别不能为空', trigger: 'change' }
        ],
        visitorType: [
          { required: true, message: '访客类型不能为空', trigger: 'change' }
        ],
        idenType: [
          { required: true, message: '证件类型不能为空', trigger: 'change' }
        ],
        company: [
          { max: 32, message: '长度不超过 32 个字符', trigger: 'blur' }
        ],
        facePic: [
          { required: true, message: '请上传访客头像', trigger: 'blur' }
        ],
        personName: [
          { required: true, message: '请输入被访者姓名', trigger: 'blur' }
        ],
        reasonType: [
          { required: true, min: 1, max: 32, message: '原由不能为空,不超过32个字符', trigger: 'blur' },
          { validator: typeValidator, message: '不能输入特殊字符', trigger: 'blur' }
        ],
        plateNum: [
          { max: 8, message: '长度不超过 8 个字符', trigger: 'blur' }
        ],
        cardId: [
          { max: 15, message: '长度不超过 15 个字符', trigger: 'blur' }
        ]
      },
      isCan: true,
      isShow: true,
      restaurantVisitor: [],
      restaurants: [],
      loading: false,
      currentPort: null,   // 当前选中串口
      openPort: false, // 串口打开按钮disabled
      closePort: true, // 串口关闭按钮disabled
      cardNo: '', // 当前暂存的卡号
      portMsg: '', // 串口相关信息
      elAlertType: 'error' // 警告标签类型
    }
  },
  methods: {
    /**
     * @description 打开编辑访客页面
     * @param  Object personInfo 表格中访客信息
     */
    visitorEdit: function (personInfo) {
      this.restaurants = []
      this.isCan = Boolean(personInfo.name)
      this.isShow = Boolean(!personInfo.name)
      this.disabledButton = false
      this.form = Object.assign({}, this.form, personInfo)
      this.dialogFormVisible = true
      // 请求访客下拉数据
      getTypeNodeMap(Object.assign({}, personInfo)).then(res => {
        this.list = res.data
      }).catch(err => {
        console.warn({
          message: err,
          type: 'warning'
        })
      })
      // 服务器端返回的多选框的值  存在显示成功  不存在显示失败
      this.currentFacePic = personInfo.currentFacePic
      this.qrCode = personInfo.qrCode
      // 执行二维码生成事件
      this.isInited && this.openQrCode()
      this.cardId = personInfo.cardId
      this.currentLadderFlag = personInfo.currentLadderFlag
      this.passCode = personInfo.passCode
      // 让多选框为空
      if (personInfo.name) {
        this.form.facePicType = ''
      } else {
        this.form.facePicType = 1
      }
      this.form.card = ''
      this.form.qrType = ''
      this.form.ladderType = ''
      this.form.passCodeType = ''
      // 有效日期设置
      if (personInfo.startTime === undefined || (personInfo.startTime === '' && personInfo.endTime === '')) {
        let startd = new Date()
        let endd = new Date()
        endd.setTime(startd.getTime() + 3600 * 1000 * 24)
        this.effectDate = [startd, endd]
      }
      if (personInfo.startTime !== '' && personInfo.startTime !== undefined) {
        this.effectDate = [personInfo.startTime, personInfo.endTime]
      } else {
        this.form.startTime = this.formatDateTime(this.effectDate[0])
        this.form.endTime = this.formatDateTime(this.effectDate[1])
      }
      // 判断日期是否失效
      if (new Date().getTime() > new Date(personInfo.endTime).getTime()) {
        this.form.info = '授权信息已过期'
        this.disabledButton = true
      }
    },
    // 日期格式化
    formatDateTime: function (date) {
      let y = date.getFullYear()
      let m = date.getMonth() + 1
      m = m < 10 ? ('0' + m) : m
      let d = date.getDate()
      d = d < 10 ? ('0' + d) : d
      let h = date.getHours()
      h = h < 10 ? ('0' + h) : h
      let minute = date.getMinutes()
      minute = minute < 10 ? ('0' + minute) : minute
      let second = date.getSeconds()
      second = second < 10 ? ('0' + second) : second
      return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
    },
    // 保存访客编辑页面信息
    onVisitorSave: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.disabledButton = true
          addVisitorInfoTest(Object.assign({}, this.form)).then(res => {
            this.qrCode = res.data.data[0].qrCode
            this.currentFacePic = res.data.data[0].currentFacePic
            this.cardId = res.data.data[0].cardId
            this.currentLadderFlag = res.data.data[0].currentLadderFlag
            this.passCode = res.data.data[0].passCode
            this.form.uuid = res.data.data[0].uuid
            if (res.data.code === '00000') {
              this.form.faceId = res.data.data[0].faceId
              this.form.visitorUuid = res.data.data[0].uuid
              this.form.facePic = res.data.data[0].facePic
              this.qrCode = ''               // 让多选框值都为空
              this.currentFacePic = ''
              this.cardId = ''
              this.currentLadderFlag = ''
              this.passCode = ''
              this.$emit('refData') // 保存数据成功后，用事件通知父组件刷新页面
              // this.dialogFormVisible = false
              // this.$refs.uploadFacePicInput.value = ''
              this.cancel()
              this.$message({
                message: '保存成功',
                type: 'success'
              })
            } else {
              this.disabledButton = false
              this.$message({
                message: res.data.message,
                type: 'warning'
              })
            }
          }).catch(err => {
            this.disabledButton = false
            console.warn({
              message: err,
              type: 'warning'
            })
          })
        } else {
          this.$message({
            message: '内容未填写完整',
            type: 'warning'
          })
          return false
        }
      })
    },
    // 点击取消重置表单
    cancel: function () {
      this.dialogFormVisible = false
      this.isInited = false
      this.$refs['form'].resetFields()
      this.$refs.uploadFacePicInput.value = ''
      this.form = { facePic: '', card: '', passCodeType: '', facePicType: 1, visitorCnt: 1 }
      this.closeCard()
    },
    // 点击关闭重置表单
    handleClose: function () {
      this.dialogFormVisible = false
      this.isInited = false
      this.$refs['form'].resetFields()
      this.$refs.uploadFacePicInput.value = ''
      this.form = { facePic: '', card: '', passCodeType: '', facePicType: 1, visitorCnt: 1 }
      this.closeCard()
    },
    // 读卡设备重置
    closeCard: function () {
      this.openPort = false
      this.closePort = true
      this.currentPort = null
      this.cardNo = ''
      this.portMsg = ''
    },
    /**
     * @description 有效日期改变时的事件
     * @param Array date 日期
     */
    changeDate: function (date) {
      this.form.startTime = this.effectDate[0]
      this.form.endTime = this.effectDate[1]
    },
    // 触发file类型的input的默认事件
    uploadFacePic: function () {
      this.$refs.uploadFacePicInput.click()
    },
    // 读取上传图片的base64编码
    readFacePic: function () {
      const file = this.$refs.uploadFacePicInput.files[0]
      if (file.size <= 204800) {
        if (file.type === 'image/jpeg') {
          const self = this
          var reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = function (e) {
            const base64Code = this.result
            self.form.fileName = file.name
            self.form.facePic = base64Code
          }
        } else {
          this.$message({
            message: '图片格式只能为jpg',
            type: 'warning'
          })
          return false
        }
      } else {
        this.$message({
          message: '照片不能大于200kb',
          type: 'warning'
        })
        return false
      }
    },
    // 拍照上传
    CameraPhoto: function () {
      this.$refs.CameraPhoto.OpenCamera()
    },
    changeImg: function () {
      this.form.fileName = this.uploadImg.imgName
      this.form.facePic = this.uploadImg.imgBase64
      this.defaultPic = this.uploadImg.imgBase64
    },
    /**
     *根据访客名字匹配信息
     */
    querySearchAsync (queryString, cb) {
      listByName({ 'name': queryString }).then(res => {
        for (let i of res.data.data) {
          i.value = i.name + i.phone
        }
        this.restaurantVisitor = res.data.data
        cb(this.restaurantVisitor)
        this.form = { 'name': queryString, facePic: this.form.facePic, facePicType: 1, visitorCnt: 1, card: '', passCodeType: '', startTime: this.form.startTime, endTime: this.form.endTime }
      })
        .catch(err => {
          console.warn({
            message: err,
            type: 'warning'
          })
        })
    },
    /**
     * @description 根据访客名字匹配输入建议信息
     * @param Object item 匹配出来的建议信息列表
     */
    handleSelectVisitor (item) {
      this.form.name = item.name
      this.form.phone = item.phone
      this.form.uuid = item.uuid
      this.form.sex = item.sex
      this.form.idenNum = item.idenNum
      this.form.idenType = item.idenType
      this.form.focusOnPersonnel = item.focusOnPersonnel
      this.form.company = item.company
      this.form.visitorType = item.visitorType
      this.form.facePic = item.facePic
    },
    /**
     * 输入被访者姓名时，查询与此被访者相关的信息：房屋地址、房屋id
     */
    querySearchPerson (queryString, cb) {
      if (queryString === '' || queryString === undefined) {
        const emptyArr = []
        cb(emptyArr)
      } else {
        searchVisitorInfo({ 'personName': queryString }).then(res => {
          this.restaurants = res.data.data
          cb(this.restaurants)
        })
          .catch(err => {
            console.warn({
              message: err,
              type: 'warning'
            })
          })
      }
    },
    /**
     * @description 根据被访客名字匹配输入建议信息
     * @param Object item 匹配出来的建议信息列表
     */
    handleSelectPerson (item) {
      this.form.personName = item.name
      this.form.houseAddr = item.houseName
      this.form.personId = item.uuid
      this.form.houseId = item.houseUuid
      this.form.personType = item.personType
    },
    // 选中门禁卡或者人脸   带选梯控
    checkedCard: function () {
      if (this.form.card || this.form.facePicType) {
        if (this.currentLadderFlag) {
          this.form.ladderType = ''
        } else {
          this.form.ladderType = '1'
        }
      } else {
        this.form.ladderType = ''
      }
    },
    // 选中门禁卡或者人脸   带选梯控
    checkedFace: function () {
      if (this.form.facePicType || this.form.card) {
        if (this.currentLadderFlag) {
          this.form.ladderType = ''
        } else {
          this.form.ladderType = '1'
        }
      } else {
        this.form.ladderType = ''
      }
    },
    // 退卡
    returnCard: function () {
      returnCard({ uuid: this.form.uuid, cardId: this.form.cardId }).then(res => {
        this.form.returnCardFlag = res.data.returnCardFlag
        this.form.endTime = res.data.endTime
        this.effectDate[1] = res.data.endTime
        if (res.data.returnCardFlag === 1) {
          this.$message({
            message: '退卡成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '退卡失败',
            type: 'success'
          })
        }
      }).catch(err => {
        console.warn({
          message: err,
          type: 'warning'
        })
      })
    },
    // 选择串口
    openCardPort () {
      if (this.currentPort == null) {
        this.portMsg = '请先选择串口'
        return
      }
      try {
        var result = this.iccardObj.openSerial(this.currentPort.port)
        if (result) {
          this.portMsg = '串口打开成功'
          this.elAlertType = 'success'
          this.openPort = true
          this.closePort = false
        } else {
          this.elAlertType = 'error'
          this.portMsg = '串口打开失败'
        }
      } catch (e) {
        console.log(e.name + ': ' + e.message)
        this.$alert('读卡器控件错误，请联系管理员', '提示', {
          confirmButtonText: '确定'
        })
      }
    },
    // 关闭串口
    closeCardPort () {
      try {
        var result = this.iccardObj.closeSerial()
        if (result) {
          this.portMsg = '串口关闭成功'
          this.elAlertType = 'success'
          this.openPort = false
          this.closePort = true
        } else {
          this.elAlertType = 'error'
          this.portMsg = '串口关闭失败'
        }
      } catch (e) {
        console.log(e.name + ': ' + e.message)
        this.$alert('读卡器控件错误，请联系管理员', '提示', {
          confirmButtonText: '确定'
        })
      }
    },
    /**
     * @description 读卡器串口选择
     * @param String val 日期
     */
    selectPort: function (val) {
      this.currentPort = val
    },
    // 定时读卡
    readCard () {
      let that = this
      let temp = that.iccardObj.getCardNo()
      if (that.cardNo !== temp) {
        that.cardNo = temp
        if (that.cardNo !== '') {
          that.form.cardId = that.cardNo
        }
      }
    },
    // 查看二维码
    openQrCode: function () {
      var canvas = document.getElementById('canvas')
      QRCode.toCanvas(canvas, this.qrCode, function (error) {
        if (error) {
          console.log(error)
        } else {
          console.log('success!')
        }
      })
    }
  },
  computed: {
    defaultPic: function () {
      return this.form.facePic === '' ? imgurl : this.form.facePic
    }
  },
  watch: {
    // 监听二维码popover里canvas的dom,执行二维码生成事件
    isShowPopover (newVal, oldVal) {
      if (!this.isInited) {
        this.isInited = true
        this.openQrCode()
      }
    }
  }
}
</script>
<style lang="less" scoped>
.authority-row {
  height: 40px;
}
.my-autocomplete {
  li {
    line-height: normal;
    padding: 5px;
    .person-name {
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .person-addr {
      font-size: 14px;
      color: #b4b4b4;
    }
    .highlighted .person-addr {
      color: #ddd;
    }
  }
}
.el-form-item {
  margin-bottom: 17px;
}
.upload-pic {
  display: none;
}
.upload-con {
  margin-left: 20px;
  .facePic-con {
    width: 260px;
    height: 240px;
    overflow: hidden;
    margin-bottom: 10px;
  }
}
</style>


