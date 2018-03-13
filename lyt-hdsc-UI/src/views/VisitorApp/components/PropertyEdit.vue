<template>
  <el-dialog :visible.sync="dialogFormVisible" width="880px" :before-close="handleClose" :modal-append-to-body="false">
    <div slot="title">
      <span>{{form.code?'物业人员记录查看':'物业人员录入'}}</span>
    </div>
    <el-form ref="form" :model="form" label-width="100px" :rules="rules">
      <el-row>
        <el-col :span="16">
          <el-row>
            <el-col :span="12">
              <el-form-item label="人员姓名" prop="name">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
              <el-form-item label="证件类型" prop="idenType">
                <el-select v-model="form.idenType" placeholder="请选择证件类型">
                  <el-option v-for="item in idenType" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="民族" prop="nation">
                <el-select v-model="form.nation" placeholder="请选择民族">
                  <el-option v-for="item in list.nation" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="联系方式" prop="phone">
                <el-input v-model="form.phone"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email"></el-input>
              </el-form-item>
              <el-form-item label="公司" prop="company">
                <el-input v-model="form.company"></el-input>
              </el-form-item>
              <el-form-item label="部门" prop="department">
                <el-select v-model="form.department" placeholder="请选择部门" @change="getPosition(form.department, 1)">
                  <el-option v-for="item in list.department" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="密码" prop="passCode">
                <el-input v-model="form.passCode"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="sex">
                <el-select v-model="form.sex" placeholder="请选择性别">
                  <el-option v-for="item in list.sex" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="证件号码" prop="idenNum">
                <el-input v-model="form.idenNum"></el-input>
              </el-form-item>
              <el-form-item label="生日" prop="birth">
                <el-date-picker style="width:auto" v-model="form.birth" align="right" type="date" :editable="false" placeholder="选择生日" format="yyyy年MM月dd日" value-format="yyyy-MM-dd" :picker-options="birthPickerOption">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="籍贯" prop="origin">
                <el-input v-model="form.origin"></el-input>
              </el-form-item>
              <el-form-item label="车牌号" prop="plateNum">
                <el-input v-model="form.plateNum"></el-input>
              </el-form-item>
              <el-form-item label="项目" prop="project">
                <el-input v-model="form.project"></el-input>
              </el-form-item>
              <el-form-item label="岗位" prop="position">
                <el-select v-model="form.position" placeholder="请选择岗位">
                  <el-option v-for="item in positionList" :key="item.id" :label="item.itemName" :value="item.itemCode"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="确认密码" prop="repassCode">
                <el-input v-model="form.repassCode"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-form-item label="居住地址" prop="address">
              <el-input v-model="form.address"></el-input>
            </el-form-item>
          </el-row>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="facePic" label-width="0">
            <div class="upload-con">
              <div class="facePic-con">
                <async-img width=260 :src="defaultPic"></async-img>
              </div>
              <el-button type="primary" @click="uploadFacePic" style="margin-left:25px;">本地上传</el-button>
              <el-button type="primary" @click="CameraPhoto">拍照上传</el-button>
              <input @change="readFacePic" class="upload-pic" ref="uploadFacePicInput" type="file" accept="image/jpeg,image/png,image/gif">
              <camera-photo ref="CameraPhoto" :uploadImg="uploadImg" @changeImg="changeImg"></camera-photo>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onPropertySave" :disabled="disabledButton" v-if="deleteButton">保 存</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import CameraPhoto from '@/components/CameraPhoto/CameraPhoto'
import imgurl from '@/views/VisitorApp/assets/images/default_picture.png'
import AsyncImg from './AsyncImg'
import { insertProperty, updateProperty, positionList } from '@/views/VisitorApp/apis/index.js'
import { phoneVerification, nameValidator, originValidator, emailValidator, typeValidator, passValidator } from '@/views/VisitorApp/assets/js/validate.js'
export default {
  components: {
    AsyncImg,
    CameraPhoto
  },
  props: {
    list: {
      value: Object
    },
    deleteButton: {
      default: true,
      type: Boolean
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
      } else {
        callback()
      }
    }
    var repassValidate = (rule, value, callback) => {
      if (value !== that.form.passCode) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      form: {
        id: '', // 物业人员id
        qrCode: '', // 二维码
        name: '', // 物业人员姓名
        sex: '', // 性别
        plateNum: '', // 物业人员车牌号
        nation: '', // 民族
        phone: '', // 电话
        position: '',
        passCode: '',
        repassCode: '',
        company: '', // 物业单位
        idenType: '', // 证件类型，默认0身份证，1军人证，2护照，3学生证，4工作证件，5其他'
        department: '', // 部门
        idenNum: '', // 证件号码
        origin: '', // 籍贯
        email: '', // 电子邮件
        personType: '', // 人员类型--保安、清洁等
        address: '', // 居住地址
        birth: '', // 生日
        description: '', // 描述
        facePic: '', // 物业人脸信息
        createTime: '', // 创建时间
        cardId: '', // 物业卡号
        fingerPrint: '', // 指纹信息
        starTtime: '', // 授权起始时间
        endTime: '', // 授权结束时间
        status: '' // 状态 1：在岗0：离岗';
      },
      idenType: [
        {
          id: 5,
          itemName: '身份证',
          itemCode: '1'
        }
      ],
      uploadImg: {
        imgName: 'cameraPhote.jpg',
        imgBase64: ''
      },
      dialogFormVisible: false,
      disabledButton: false,
      positionList: '',
      rules: {
        name: [
          { required: true, min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' },
          { validator: nameValidator, message: '姓名格式输入不正确', trigger: 'blur' }
        ],
        company: [
          { required: true, min: 2, max: 32, message: '请输入公司,长度在32个字符内', trigger: 'blur' },
          { validator: typeValidator, message: '不能输入特殊字符', trigger: 'blur' }
        ],
        idenNum: [
          { required: true, min: 2, max: 18, message: '请输入证件号码', trigger: 'blur' },
          { validator: validatePassport, message: '证件号码输入不正确', trigger: 'blur' },
          { validator: typeValidator, message: '不能输入特殊字符', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '性别不能为空', trigger: 'change' }
        ],
        origin: [
          { required: true, min: 1, max: 15, message: '籍贯不能为空,长度15 个字符内', trigger: 'blur' },
          { validator: originValidator, message: '不能输入特殊字符和数字', trigger: 'blur' }
        ],
        plateNum: [
          { max: 8, message: '长度不超过 8 个字符', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '部门不能为空', trigger: 'change' }
        ],
        nation: [
          { required: true, message: '民族不能为空', trigger: 'change' }
        ],
        idenType: [
          { required: true, message: '证件类型不能为空', trigger: 'change' }
        ],
        email: [
          { validator: emailValidator, message: '邮箱输入不正确', trigger: 'blur' }
        ],
        position: [
          { required: true, message: '岗位不能为空', trigger: 'change' }
        ],
        passCode: [
          { required: true, message: '密码不能为空', trigger: 'change' },
          { validator: passValidator, message: '请输入6位数字密码', trigger: 'blur' }
        ],
        repassCode: [
          { required: true, message: '确认密码不能为空', trigger: 'change' },
          { validator: repassValidate, message: '两次输入密码不一致', trigger: 'blur' }
        ],
        project: [
          { required: true, min: 1, max: 32, message: '请输入项目,长度在32个字符内', trigger: 'blur' },
          { validator: typeValidator, message: '不能输入特殊字符', trigger: 'blur' }
        ],
        address: [
          { required: true, min: 2, max: 32, message: '请输入住址,长度在32个字符内', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: phoneVerification, message: '请输入手机号码', trigger: 'blur' }
        ],
        facePic: [
          { required: true, message: '请上传物业人员头像', trigger: 'blur' }
        ]
      },
      restaurants: [
      ],
      loading: false,
      birthPickerOption: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  methods: {
    /**
     * @description 打开编辑物业页面
     * @param  Object personInfo 表格中物业信息
     */
    propertyEdit: function (personInfo) {
      this.form = Object.assign({}, this.form, personInfo)
      this.dialogFormVisible = true
      this.disabledButton = false
      // 点击编辑后res.data.position存在调用岗位联动获取岗位
      if (this.form.position) {
        let params = this.form.department
        this.getPosition(params)
      }
    },
    /**
     * @description 请求物业部门岗位联动下拉数据
     * @param Num params 物业部门信息
     * @param Num key  自定义参数数字1
     */
    getPosition: function (params, key) {
      if (key) {
        this.form.position = ''
      }
      positionList(params).then(res => {
        this.positionList = res.data
      }).catch(err => {
        console.warn({
          message: err,
          type: 'warning'
        })
      })
    },
    // 保存物业编辑页面信息
    onPropertySave: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.disabledButton = true
          if (this.form.uuid) {
            // 如果this.form.uuid存在则更新物业  不存在则新增物业
            updateProperty(Object.assign({}, this.form)).then(res => {
              if (res.data.code === '00000') {
                this.$emit('reflushData') // 保存数据成功后，用事件通知父组件，刷新物业数据表格
                this.cancel()    // 重置表单
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
            insertProperty(Object.assign({}, this.form)).then(res => {     // 新增物业
              if (res.data.code === '00000') {
                this.$emit('reflushData') // 保存数据成功后，用事件通知父组件，刷新物业数据表格
                this.cancel()  // 重置表单
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
          }
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
      this.$refs['form'].resetFields()
      this.$refs.uploadFacePicInput.value = ''
      this.form = {}
      this.form.facePic = imgurl
    },
    // 点击关闭重置表单
    handleClose: function () {
      this.dialogFormVisible = false
      this.$refs['form'].resetFields()
      this.$refs.uploadFacePicInput.value = ''
      this.form = {}
      this.form.facePic = imgurl
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
    }
  },
  computed: {
    defaultPic: function () {
      return this.form.facePic === '' ? imgurl : this.form.facePic
    }
  }
}
</script>
<style lang="less" scoped>
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
