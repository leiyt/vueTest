<template>
  <div>
    <el-form ref='user' :inline="true" :rules="rules" :model="user">
      <div>
        <el-form-item label="用户类型" :label-width="formLabelWidth" prop="userType">
          <el-select v-model="user.userType" placeholder="请选择" class="user_el-select" @change="changeUserType">
            <el-option v-for="userType in userTypeSelect" :key="userType.itemCode" :label="userType.itemName" :value="userType.itemCode"> </el-option>
          </el-select>
        </el-form-item>
      </div>
      <el-form-item label="登录 ID" :label-width="formLabelWidth" prop="userName">
        <el-input v-model="user.userName" auto-complete="off" placeholder="请输入登录 ID" class="user_el-input"></el-input>
      </el-form-item>
      <el-form-item label="姓名" :label-width="formLabelWidth" prop="fullName">
        <el-input v-model="user.fullName" auto-complete="off" placeholder="请输入姓名" class="user_el-input"></el-input>
      </el-form-item>
      <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
        <el-input type="password" v-model="user.password" auto-complete="off" placeholder="请输入密码" class="user_el-input"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" :label-width="formLabelWidth" prop="checkPass">
        <el-input type="password" v-model="user.checkPass" auto-complete="off" placeholder="再次输入密码" class="user_el-input"></el-input>
      </el-form-item>
      <el-form-item label="手机号" :label-width="formLabelWidth" prop="primaryPhone">
        <el-input v-model="user.primaryPhone" auto-complete="off" placeholder="请输入手机号" class="user_el-input"></el-input>
      </el-form-item>
      <el-form-item label="身份证号码" :label-width="formLabelWidth" prop="idenNum">
        <el-input v-model="user.idenNum" auto-complete="off" placeholder="请输入有效身份证号码" class="user_el-input"></el-input>
      </el-form-item>
      <el-form-item label="电子邮件" :label-width="formLabelWidth" prop="primaryEmail">
        <el-input v-model="user.primaryEmail" auto-complete="off" placeholder="请输入有效电子邮件" class="user_el-input"></el-input>
      </el-form-item>
      <el-form-item label="部门" :label-width="formLabelWidth">
        <el-select v-model="user.departmentUuid" placeholder="请选择" class="user_el-select">
          <el-option v-for="department in departmentSelect" :key="department.uuid" :label="department.departmentName" :value="department.uuid"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="职务" :label-width="formLabelWidth" prop="position">
        <el-input v-model="user.position" auto-complete="off" placeholder="请输入职务名称" class="user_el-select"></el-input>
      </el-form-item>
      <el-form-item label="状态" :label-width="formLabelWidth">
        <el-select v-model="user.userAccStatus" placeholder="请选择" class="user_el-select" disabled>
          <el-option v-for="userStatus in userAccStatusSelect" :key="userStatus.itemCode" :label="userStatus.itemName" :value="userStatus.itemCode"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="生效日期" :label-width="formLabelWidth" prop="effectiveDate">
        <el-date-picker
          v-model="user.effectiveDate"
          type="date"
          placeholder="选择日期"
          @change="changeDate"
          :editable="false"
          :picker-options="pickerOptionsStart" style="width: 280px">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="失效日期" label-width="120px">
        <el-date-picker
          v-model="user.expiryDate"
          type="date"
          placeholder="选择日期"
          :editable="false"
          :picker-options="pickerOptionsEnd" style="width: 280px;">
        </el-date-picker>
      </el-form-item>
      <div class="user-button" align="center">
        <el-row>
          <el-col>
            <span class="dialog-footer">
              <el-button class='cancel-btn' @click="cancelEvent('user')" type='primary'>取消</el-button>
              <el-button type="primary" @click="create('user')" class='action-btn'>保 存</el-button>
            </span>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>
<script>
import {
  checkUserName,
  getDepartmentOptions
} from '@/views/UserMgmt/userManagement/apis'
export default {
  props: {
    userAccStatusSelect: undefined,
    userTypeSelect: undefined
  },
  mounted () {
    this.initUserInfo()
  },
  data () {
    let that = this
    // 密码校验是否一致
    var validatePass = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        callback(new Error('请输入密码'))
      } else if (value !== this.user.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    // 用户名的唯一性
    var validateUserName = (rule, value, callback) => {
      // let userUuid = this.user.uuid
      if (value === '' || value === undefined) {
        callback(new Error('登录 ID不能为空'))
      } else {
        let userType = this.user.userType
        checkUserName('', value, userType)
        .then(
          function (result) {
            if (!result) {
              callback(new Error('登录 ID已存在'))
            } else {
              callback()
            }
          }
        )
      }
    }
    // 身份证有效验证
    var validateIdenNum = (rule, value, callback) => {
      // 15位
      var isIDCard1 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/
      // 18位
      var isIDCard2 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
      if (value !== '' && value !== null && value !== undefined) {
        if (value.length === 15) {
          if (!isIDCard1.test(value)) {
            callback(new Error('请输入有效的身份证号码'))
          } else {
            callback()
          }
        } else {
          if (!isIDCard2.test(value)) {
            callback(new Error('请输入有效的身份证号码'))
          } else {
            callback()
          }
        }
      } else {
        callback()
      }
    }
    return {
      subActiveName: '0',
      formLabelWidth: '120px',
      departmentSelect: undefined,
      user: {
        fullName: '',
        userName: '',
        position: '',
        departmentUuid: '',
        primaryPhone: '',
        idenNum: '',
        password: '',
        checkPass: '',
        primaryEmail: '',
        effectiveDate: '',
        expiryDate: '',
        userAccStatus: '2',
        uuid: '',
        userType: ''
      },
      // 生效日期选择
      pickerOptionsStart: {
        disabledDate (time) {
          return time.getTime() < new Date() - 3600 * 1000 * 24
        }
      },
      // 失效日期选择
      pickerOptionsEnd: {
        disabledDate (time) {
          return time.getTime() < new Date(that.user.effectiveDate).getTime()
        }
      },
      rules: {
        fullName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        userName: [
          { required: true, validator: validateUserName, trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符' },
          { pattern: /^[A-Za-z0-9]+$/, message: '登录 ID只能为字母和数字' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, max: 20, message: '长度在 8 到 20 个字符' },
          { pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, message: '必须包括数字、字母以及 <! # & $ %> 等特殊符号' }
        ],
        checkPass: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        idenNum: [
          { validator: validateIdenNum, trigger: 'blur,change' }
        ],
        primaryEmail: [
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur,change' },
          { max: 128, message: '长度不能超过128个字符' }
        ],
        primaryPhone: [
          { pattern: /^1[34578]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
        ],
        effectiveDate: [
          { required: true, message: '请选择生效日期', trigger: 'change' }
        ],
        position: [
          { max: 16, message: '长度不能超过16个字符', trigger: 'blur' }
        ],
        userType: [
          { required: true, message: '请选择用户类型', trigger: 'change' }
        ]
      },
      listQueryUserEditVue: {
        page: 1,
        limit: 5,
        userUuid: ''
      }
    }
  },
  methods: {
    create (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$emit('gridCreateEvent', this.user)
        } else {
          return false
        }
      })
    },
    changeDate () {
      this.user.expiryDate = ''
    },
    cancelEvent (user) {
      this.$refs[user].clearValidate()
      this.$refs[user].resetFields()
      this.$emit('canelDialogEvent')
    },
    // 初始新增用户信息
    initUserInfo () {
      this.user = {
        fullName: '',
        userName: '',
        position: '',
        departmentUuid: '',
        primaryPhone: '',
        idenNum: '',
        password: '',
        checkPass: '',
        primaryEmail: '',
        effectiveDate: '',
        expiryDate: '',
        userAccStatus: '2',
        uuid: ''
      }
    },
    reset () {
      this.user.expiryDate = ''
      this.user.effectiveDate = ''
    },
    changeUserType (userType) {
      this.departmentSelect = []
      this.user.departmentUuid = ''
      this.getDepartmentSelect(userType)
    },
    getDepartmentSelect (userType) {
      // 获取部门信息
      getDepartmentOptions(userType)
        .then(
            function (result) {
              this.departmentSelect = result
            }.bind(this)
          )
        .catch(
          function (error) {
            console.log(error)
          }
        )
    }
  }
}
</script>
