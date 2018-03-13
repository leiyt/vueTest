<template>
  <el-dialog :visible.sync="dialogFormVisible" width="1000px" :before-close="handleClose">
    <div slot="title">
      <span>{{form.uuid?'人员编辑':'人员新增'}}</span>
    </div>
    <el-form ref="form" :model="form" label-width="100px" :rules="rules">
      <el-row>
        <el-col :span="16">
          <el-row>
            <el-col :span="12">
              <el-form-item label="人员姓名" prop="name">
                <el-input v-model.trim="form.name" auto-complete="off" :maxlength="64"></el-input>
              </el-form-item>
              <el-form-item required label="性别类型">
                <el-select v-model="form.sex" placeholder="请选择性别">
                  <el-option v-for="item in dictItem.sexList" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item required label="证件类型">
                <el-select v-model="form.idenType" placeholder="请选择证件类型" @change="onResestIdenNum">
                  <el-option v-for="item in dictItem.idenTypeList" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item required label="生日" prop="birth">
                <el-date-picker style="width:auto" v-model="form.birth" align="right" type="date" :editable="false" placeholder="选择生日" format="yyyy年MM月dd日" :picker-options="birthPickerOption" @change="autoAge">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="电话" prop="phone">
                <el-input v-model.trim="form.phone" :maxlength="18"></el-input>
              </el-form-item>
              <el-form-item label="单位" prop="company">
                <el-input v-model.trim="form.company" :maxlength="64"></el-input>
              </el-form-item>
              <el-form-item label="部门" prop="dept">
                <el-input v-model.trim="form.dept" :maxlength="64"></el-input>
              </el-form-item>
              <el-form-item label="岗位" prop="station">
                <el-input v-model.trim="form.station" :maxlength="64"></el-input>
              </el-form-item>
              <el-form-item required label="重点关注">
                <el-select v-model="form.focusOnPersonnel" placeholder="请选择类型">
                  <el-option v-for="item in dictItem.focusOnPersonnelList" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item required label="人员类型">
                <el-select v-model="form.userType" placeholder="请选择人员类型">
                  <el-option v-for="item in dictItem.userTypeList" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item required label="民族">
                <el-select clearable v-model="form.nation" placeholder="请选择民族">
                  <el-option v-for="item in dictItem.nationList" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="证件号码" prop="idenNum">
                <el-input v-model.trim="form.idenNum" :maxlength="64"></el-input>
              </el-form-item>
              <el-form-item label="年龄" prop="age">
                <el-input v-model="age" :readonly="true">{{age}}</el-input>
              </el-form-item>
              <el-form-item label="籍贯" prop="origin">
                <el-input v-model.trim="form.origin" auto-complete="off" clearable :maxlength="64"></el-input>
              </el-form-item>
              <el-form-item label="邮件" prop="email">
                <el-input v-model.trim="form.email" :maxlength="256"></el-input>
              </el-form-item>
              <el-form-item label="旧密码" v-if="this.isPassword">
                <el-col :span="13">
                  <el-form-item prop="oldPassword1">
                    <el-input v-model.trim="form.oldPassword1" :maxlength="8" placeholder="楼栋单元房号"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <el-form-item>
                    —
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item prop="oldPassword2">
                    <el-input v-model.trim="form.oldPassword2" :maxlength="4" type="password" placeholder="用户密码"></el-input>
                  </el-form-item>
                </el-col>
              </el-form-item>
              <el-form-item label="新密码">
                <el-col :span="13">
                  <el-form-item prop="newPassword1">
                    <el-input v-model.trim="form.newPassword1" :maxlength="8" placeholder="楼栋单元房号"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <el-form-item>
                    —
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item prop="newPassword2">
                    <el-input v-model.trim="form.newPassword2" :maxlength="4" type="password" placeholder="用户密码"></el-input>
                  </el-form-item>
                </el-col>
              </el-form-item>
              <el-form-item label="确认密码">
                <el-col :span="13">
                  <el-form-item prop="newPassword1">
                    <el-input v-model.trim="form.newPassword1" :maxlength="8" :readonly="true" placeholder="楼栋单元房号"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <el-form-item>
                    —
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item prop="newPassword3">
                    <el-input v-model.trim="form.newPassword3" :maxlength="4" type="password" placeholder="用户密码"></el-input>
                  </el-form-item>
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-popover ref="housePopover" placement="right-start" width="303" trigger="click" v-model="modalFrame">
              <div class="house-select-popover">
                <el-tree :data="houseSelectData" :props="houseSelectProps" ref="tree" @node-click="onHouseSelectClick" @node-expand="nodeExpand"></el-tree>
              </div>
            </el-popover>
            <el-form-item label="入住房屋" prop="houseName">
              <el-input :offset="23" v-model="form.houseName" readonly v-popover:housePopover></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="description">
              <el-input resize="none" type="textarea" v-model="form.description" :rows="4" :maxlength="256"></el-input>
            </el-form-item>
          </el-row>
        </el-col>
        <el-col :span="8" >
          <div class="face-pic-preview">
            <async-img :src="faceImg" ref="img"></async-img>
          </div>
          <input @change="readFacePic" class="upload-pic-input" ref="uploadFacePicInput" type="file" accept="image/jpeg">
          <div class="face-pic-operation">
            <el-button type="primary" @click="onAddPhoto" size="mini">本地上传</el-button>
            <el-button type="success" @click="onCameraPhoto" size="mini">拍照上传</el-button>
            <camera-photo ref="CameraPhoto" :uploadImg="uploadImg" @changeImg="changeImg"></camera-photo>
          </div>
          <div class="tips">
            <span >上传说明：</span>
            <p>图片应保持五官端正，面部清晰可见</P>
            <p>图片推荐尺寸206*206</p>
            <p>只支持JPG格式，文件大小200Kb以内</P>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onSave" :loading="isLoading">确 定</el-button>
      <el-button @click="onCancel">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import AsyncImg from '../../components/AsyncImg'
import CameraPhoto from '@/components/CameraPhoto/CameraPhoto'
import defaultPicture from '@/views/MdmApp/assets/img/default_picture.png'
import { insertPerson, updatePerson, getPic, obtainOrganization } from '../../apis/person_manager'
import CryptoJS from 'crypto-js'                                                                        // 密码加密
import { LOG_TAG } from '@/views/MdmApp/assets/js/index.js'
export default {
  props: {
    search: {
      type: Function
    },
    exportHouseNode: {
      type: Object
    },
    dictItem: {
      type: Object
    }
  },
  components: {
    AsyncImg,
    CameraPhoto
  },
  data () {
    // 姓名/籍贯中英文名验证
    var nameCheck = (rule, value, callback) => {
      if (!/^[\u4e00-\u9fa5A-Za-z0-9·]+$/.test(value)) {
        callback(new Error('请输入正确中英文'))
      } else {
        callback()
      }
    }
    // 证件号验证
    var IdenNum = (rule, value, callback) => {
      // 身份证验证
      if (this.form.idenType === this.dictItem.idenTypeList[0].itemCode) {
        if (!/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)) {
          callback(new Error('请输入正确身份证号码'))
        } else {
          callback()
        }
      } else {
        if (value !== '') {
          callback()
        } else {
          callback(new Error('证件号码不能为空'))
        }
      }
    }
    // 电话号码验证
    var phone = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else {
        if (!/^1\d{10}$/.test(value)) {
          callback(new Error('请输入正确的手机号码'))
        } else {
          callback()
        }
      }
    }
    // 邮箱验证
    var CEmail = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else {
        if (!/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,32}$/.test(value)) {
          callback(new Error('请输入正确的邮箱地址'))
        } else {
          callback()
        }
      }
    }
    // 验证是否选择的是houseUuid(房屋)
    var isHouseNode = (rule, value, callback) => {
      if (this.isHouseUUid) {
        callback()
      } else {
        callback(new Error('请选择房屋'))
      }
    }
    // 8密码验证
    var password8 = (rule, value, callback) => {
      if (value === '' || value === null) {
        callback()
      } else {
        if (!/^\d{8}$/.test(value)) {
          callback(new Error('楼栋单元房号8位数字'))
        } else {
          callback()
        }
      }
    }
    // 4密码验证
    var password4 = (rule, value, callback) => {
      if (value === '' || value === null) {
        callback()
      } else {
        if (!/^\d{4}$/.test(value)) {
          callback(new Error('密码为4位数字'))
        } else {
          callback()
        }
      }
    }
    // 公司/部门/岗位/特殊字符验证
    var max64Chinese = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else {
        if (value.length > 64) {
          callback(new Error('超出最大字符长度64字符!'))
        } else {
          if (!/^[\u4e00-\u9fa5A-Za-z\s]+$/.test(value)) {
            callback(new Error('只能输入中英文'))
          } else {
            callback()
          }
        }
      }
    }
    // 备注
    var max256Chinese = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else {
        if (value.length > 256) {
          callback(new Error('超出最大字符长度256字符'))
        } else {
          callback()
        }
      }
    }
    return {
      uploadImg: {
        imgName: 'cameraPhote.jpg',
        imgBase64: ''
      },
      faceImg: '',                    // 人员新增编辑照片展示src
      age: 0,                         // 年龄初始化
      modalFrame: false,              // 是否展开房屋组织表
      isHouseUUid: false,             // 判定房屋地址当前类型
      houseSelectData: [],
      houseSelectProps: {
        children: 'children',
        label: 'name'
      },
      isPassword: '',
      form: {
        name: '',                     // 人员姓名
        userType: '',                 // 用户类型
        sex: '',                      // 性别
        idenType: '',                 // 证件类型
        birth: '',                    // 生日
        idenNum: '',                  // 证件号码
        nation: '',                   // 名族
        origin: '',                   // 籍贯
        phone: '',                    // 手机号码
        email: '',                    // 邮件
        company: '',                  // 公司
        dept: '',                     // 部门
        station: '',                  // 岗位
        focusOnPersonnel: '',         // 黑名单
        passwordBeforeModify: '',     // 旧密码
        password: '',                 // 新密码
        oldPassword1: '',             // 旧密码分块1
        oldPassword2: '',             // 旧密码分块2
        newPassword1: '',             // 新密码分块1
        newPassword2: '',             // 新密码分块2
        newPassword3: '',             // 确认密码分块
        houseName: '',                // 房屋地址
        description: '',              // 人员备注
        houseUuid: '',                // 旧的房屋id
        houseUuidBeforeModify: '',    // 新的房屋id
        userUuid: '',
        fileName: '',                 // 照片名称
        facePicBase64: ''             // 照片base64
      },
      dialogFormVisible: false,       // 页面显隐
      isLoading: false,               // 按钮加载中
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' },
          { validator: nameCheck, trigger: 'blur' }
        ],
        idenNum: [
          { validator: IdenNum, required: true, message: '请输入证件号码', trigger: 'blur' }
        ],
        birth: [
          { required: true, message: '请选择生日', trigger: 'blur' }
        ],
        email: [
          { validator: CEmail, message: '请输入正确邮箱', trigger: 'blur' }
        ],
        phone: [
          { validator: phone, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        origin: [
          { required: true, message: '请输入籍贯', trigger: 'blur' },
          { validator: nameCheck, trigger: 'blur' }
        ],
        houseName: [
          { required: true, validator: isHouseNode, message: '请选择正确的房屋地址', trigger: 'change' }
        ],
        oldPassword1: [
          { validator: password8, trigger: 'blur' }
        ],
        oldPassword2: [
          { validator: password4, trigger: 'blur' }
        ],
        newPassword1: [
          { validator: password8, trigger: 'change' }
        ],
        newPassword2: [
          { validator: password4, trigger: 'blur' }
        ],
        newPassword3: [
          { validator: password4, trigger: 'blur' }
        ],
        company: [
          { validator: max64Chinese, trigger: 'change' }
        ],
        dept: [
          { validator: max64Chinese, trigger: 'change' }
        ],
        station: [
          { validator: max64Chinese, trigger: 'change' }
        ],
        description: [
          { validator: max256Chinese, trigger: 'change' }
        ]
      },
    /**
     * @description 生日日期选择器 超出当前日期不可选 element-UI官方函数
     * @return 超出当前日期不可选
     */
      birthPickerOption: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  methods: {
    /**
     * @description 开始人员添加/编辑
     * 添加初始化内容，编辑将内容赋值
     * @param {Object} personInfo @default {}
     */
    personEdit: function (personInfo = {}) {
      this.dialogFormVisible = true
      this.form.birth = personInfo.birth || ''           // 生日提前处理  便于年龄自动生成函数使用
      if (personInfo.uuid) {
        // 人员编辑                                       // 新增页面影藏旧密码窗口
        if (personInfo.facePic) {
          getPic({ facePic: personInfo.facePic }).then(res => {
            this.faceImg = res.data
          })
        } else {
          this.faceImg = defaultPicture
        }
        this.isHouseUUid = true
        this.form.houseName = personInfo.houseName
        this.form.houseUuid = personInfo.houseUuid
        this.autoAge()
      } else {
        // 人员新增
        this.form.facePicBase64 = defaultPicture                    // 照片base64重置
        this.faceImg = this.form.facePicBase64
        this.form.houseName = this.exportHouseNode.houseOrOrgName
        if (this.exportHouseNode.type === 'house') {
          this.form.houseUuid = this.exportHouseNode.houseUuid
          this.isHouseUUid = true
        } else {
          this.isHouseUUid = false
        }
      }
      this.form.uuid = personInfo.uuid || null
      this.form.name = personInfo.name || null                                                                        // 人员姓名
      this.form.userType = personInfo.userType || this.dictItem.userTypeList[0].itemCode                              // 用户类型
      this.form.sex = personInfo.sex || this.dictItem.sexList[0].itemCode                                             // 性别
      this.form.idenType = personInfo.idenType || this.dictItem.idenTypeList[0].itemCode                              // 证件类型
      this.form.idenNum = personInfo.idenNum || ''                                                                    // 证件号码
      this.form.nation = personInfo.nation || this.dictItem.nationList[0].itemCode                                    // 民族
      this.form.origin = personInfo.origin || ''                                                                      // 籍贯
      this.form.phone = personInfo.phone || ''                                                                        // 手机号码
      this.form.email = personInfo.email || ''                                                                        // 邮件
      this.form.company = personInfo.company || ''                                                                    // 公司
      this.form.dept = personInfo.dept || ''                                                                          // 部门
      this.form.station = personInfo.station || ''                                                                    // 岗位
      this.form.focusOnPersonnel = personInfo.focusOnPersonnel || this.dictItem.focusOnPersonnelList[0].itemCode
      this.form.houseUuidBeforeModify = personInfo.houseUuid || ''                                                    // 旧房屋uuid
      this.form.description = personInfo.description || ''
      this.form.oldPassword1 = ''
      this.form.oldPassword2 = ''
      this.form.newPassword1 = ''
      this.form.newPassword2 = ''
      this.form.newPassword3 = ''
      this.isPassword = personInfo.password || ''
    },
    /**
     * @description 自动生成年龄
     */
    autoAge: function () {
      this.age = new Date().getYear() - new Date(this.form.birth).getYear() || 0
    },
    /**
     * @description 改变证件类型重置证件号
     */
    onResestIdenNum: function () {
      this.form.idenNum = ''
    },
    /**
     * @description 人员数据 新增/编辑保存
     */
    onSave: function () {
      // 正则验证
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // 合并密码
          var pwd = this.form.oldPassword1 + this.form.oldPassword2
          var pwd1 = this.form.newPassword1 + this.form.newPassword2
          var pwd2 = this.form.newPassword1 + this.form.newPassword3
          // 旧密码长度校验
          if (pwd.length === 12 || pwd.length === 0) {
            var word1 = CryptoJS.enc.Utf8.parse(pwd)
            this.form.passwordBeforeModify = CryptoJS.enc.Base64.stringify(word1)
          } else {
            // 旧密码长度错误提示
            console.warn(LOG_TAG + '人员数据保存密码err')
            this.$message({
              message: '旧密码为12位数字',
              type: 'warning'
            })
            return
          }
          // 新密码长度校验 密码为空或者长度正确通过
          if ((pwd1.length === 12 && pwd2.length === 12) || (pwd1.length === 0 && pwd2.length === 0)) {
            if (pwd1 === pwd2) {
              var word2 = CryptoJS.enc.Utf8.parse(pwd2)
              this.form.password = CryptoJS.enc.Base64.stringify(word2)
            } else {
              console.warn(LOG_TAG + '人员数据保存密码err')
              this.$message({
                message: '新密码两次输入不一致',
                type: 'warning'
              })
              return
            }
          } else {
            console.warn(LOG_TAG + '人员数据保存密码err')
            this.$message({
              message: '新密码为12位数字',
              type: 'warning'
            })
            return
          }
          this.form.oldPassword1 = ''
          this.form.oldPassword2 = ''
          this.form.newPassword1 = ''
          this.form.newPassword2 = ''
          this.form.newPassword3 = ''
          // 禁用按钮 防止重复提交
          this.isLoading = true
          var func
          func = this.form.uuid ? updatePerson : insertPerson
          func(Object.assign({}, this.form)).then(res => {
            if (res.data.code === '00000') {
              this.$message({
                message: res.data.data,
                type: 'success'
              })
              // 刷新类型
              this.form.uuid ? this.search({}, false) : this.search({}, true)
              this.dialogFormVisible = false
              this.reset()
            } else {
              this.$message({
                message: res.data.data,
                type: 'warning'
              })
            }
            this.isLoading = false
          }).catch(err => {
            // 服务器异常 按键解锁
            console.log(err)
            this.$message({
              message: '服务器连接异常',
              type: 'warning'
            })
            this.isLoading = false
          })
        } else {
          this.isLoading = false
          this.$message({
            message: '内容未填写正确',
            type: 'warning'
          })
          return false
        }
      })
    },
    /**
     * @description 人员数据 取消按钮
     */
    onCancel: function () {
      // 隐藏对话框
      this.dialogFormVisible = false
      // 初始化
      this.reset()
    },
    /**
     * @description 人员数据 表单重置
     */
    reset: function () {
      // 初始化表格、验证提示
      this.$refs['form'].resetFields()
      // 初始化图片显示
      this.age = 0
      this.form.facePicBase64 = defaultPicture
      this.faceImg = defaultPicture
      this.$refs.uploadFacePicInput.value = ''
    },
    /**
     * @description 关闭页面
     */
    handleClose: function () {
      this.dialogFormVisible = false
      this.reset()
    },
    /**
     * @description 房屋组织树
     */
    onHouseSelectClick: function (data, node) {
      let personName = ''
      // 组装上级组织名称
      const getName = (node) => {
        personName = node.label + personName
        if (node.parent && node.parent.data.$treeNodeId) {
          getName(node.parent)
        } else {
          this.form.houseName = personName
        }
      }
      getName(node)
      this.form.orgParentUuid = data.$treeNodeId
      this.orgPopoverVisible = false
      // 判断是否选中的是房屋
      if (data.type === 'house') {
        this.form.houseUuid = data.uuid
        this.isHouseUUid = true
      } else {
        this.isHouseUUid = false
      }
    },
    /**
     * @description 打开照片上传页面
     */
    onAddPhoto: function () {
      this.$refs.uploadFacePicInput.click()
    },
    /**
     * @description 打开拍照页面
     */
    onCameraPhoto: function () {
      this.$refs.CameraPhoto.OpenCamera()
    },
    /**
     * @description 拍照结束通知父组件同步照片
     */
    changeImg: function () {
      this.form.fileName = this.uploadImg.imgName
      this.form.facePicBase64 = this.uploadImg.imgBase64
      this.faceImg = this.uploadImg.imgBase64
    },
    /**
     * @description 读取上传图片的base64编码
     */
    readFacePic: function () {
      var file = this.$refs.uploadFacePicInput.files[0]
      // 判断上传文件类型
      if (file.type === 'image/jpeg') {
        this.form.fileName = file.name
        // 判断图片是否大于200K
        if (file.size < 1024 * 200) {
          const self = this
          var reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = function (e) {
            var base64Code = this.result
            self.form.facePicBase64 = base64Code
            self.faceImg = base64Code
          }
        } else {
          this.$message({
            message: '请选择小于200K的图片',
            type: 'warning'
          })
        }
      } else {
        this.$message.error('文件格式错误、请上传JPG图片')
        return false
      }
    },
    /**
     * @description 组织房屋树处理
     * @param {Object} data 当前节点房屋组织树信息
     */
    formatTree: function (data) {
      const defaultNode = {
        name: ''
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i].isParent === true) {
          data[i].children = []
          data[i].children.push(defaultNode)
        }
      }
      return data
    },
    /**
     * @description 点击房屋组织树节点
     * @param {Object} data 当前节点房屋组织树属性信息
     * @param {Object} node 当前节点房屋组织树下级目录信息
     */
    nodeExpand: function (data, node) {
      if (data.hasExpanded) {
        return false
      }
      this.orgData = {
        isParent: data.isParent,
        type: data.type,
        uuid: data.uuid
      }
      obtainOrganization(this.orgData).then(res => {
        data.children = this.formatTree(res.data.data.children)
        data.hasExpanded = true
      })
    }
  },
  mounted: function () {
    obtainOrganization().then(res => {
      this.houseSelectData.push(res.data.data)
    })
  }
}
</script>
<style scoped>
.upload-pic-input {
  display: none;
}

.house-select-popover {
  height: 150px;
  overflow: auto;
}

.face-pic-preview {
  width: 206px;
  height: 206px;
  margin: 0 auto;
  border: 1px solid #ccc;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.face-pic-preview img {
  width: 206px;
}

.face-pic-operation {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
}

.tips{
  width: 215px;
  margin: 10px auto;
  font-size: 10px;
}
.el-tree {
  width: 900px;
}
</style>
