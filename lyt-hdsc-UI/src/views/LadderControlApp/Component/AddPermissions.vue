<template>
  <div>
    <el-dialog :title="modifyMessege?'修改权限':'添加权限'" :visible="show" @close="onCloseEvent('form')" width="560px">
      <el-row class="permissions-content">
        <el-form ref="form" :model="form" label-width="100px" :rules="rules" class="demo-ruleForm addPermissionForm">
          <el-row v-if="modifyMessege" class="permissions-row">
            <el-form-item label="姓名:" prop="personName">
              <el-input type="text" v-model="form.personName" :disabled="true" :readonly="true" class="permissions-input"></el-input>
            </el-form-item>
          </el-row>
          <el-row v-else class="permissions-row">
            <el-form-item label="选择人员:" prop="holder">
              <el-input type="textarea" :rows="2" placeholder="请选择人员" v-model="form.holder" @click.native.prevent="onPerson" :readonly="true" class="permissions-input"></el-input>
            </el-form-item>
          </el-row>
          <el-row class="permissions-row" v-if="modifyMessege">
            <el-form-item label="设备:" prop="deviceName">
              <el-input type="text" :disabled="true" v-model="form.deviceName" :readonly="true" class="permissions-input"></el-input>
            </el-form-item>
          </el-row>
          <el-row v-else class="permissions-row">
            <el-form-item label="选择设备:" prop="org">
              <el-input type="textarea" :rows="2" placeholder="请选择设备" v-model="form.org" @click.native.prevent="onEquiment" :readonly="true" class="permissions-input"></el-input>
            </el-form-item>
          </el-row>
          <el-row class="permissions-row" v-if="modifyMessege">
            <el-form-item label="卡号:" prop="cardId">
              <el-input type="text" :disabled="true" v-model="form.cardId" :readonly="true" class="permissions-input"></el-input>
            </el-form-item>
          </el-row>
          <el-row class="permissions-row" v-if="modifyMessege">
            <el-form-item label="选择楼层:" prop="floors">
              <el-select v-model="form.floors" multiple placeholder="请选择" align="left" class="permissions-input">
                <el-option v-for="item in getFloorOptions(startFloor,endFloor)" :key="item.value" :label="item.label" :value="item.value">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-row>
          <el-row class="permissions-row">
            <el-form-item label="开始时间:" prop="startTime">
              <el-date-picker ref="startTime" v-model="form.startTime" value-format="yyyy-MM-dd HH:mm:ss" :editable="false" type="datetime" class="permissions-input">
              </el-date-picker>
            </el-form-item>
          </el-row>
          <el-row class="permissions-row">
            <el-form-item label="结束时间:" prop="endTime">
              <el-date-picker ref="endTime" v-model="form.endTime" value-format="yyyy-MM-dd HH:mm:ss" :editable="false" type="datetime" class="permissions-input">
              </el-date-picker>
            </el-form-item>
          </el-row>
          <el-row class="permissions-row">
            <el-form-item class="form-btn">
              <el-button @click="onCloseEvent('form')">取 消</el-button>
              <el-button type="primary" class="save-btn" :disabled="disButton" @click="saveEpuipment('form')">确 定</el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </el-row>
    </el-dialog>
    <add-equipment :show="showEquipment" :selectedData="selectedData" @selectedEquipments="getEquipments" @closeEquipment="closeEquipment"></add-equipment>
    <choose-person :show="showPerson" :selectPerson='selectPerson' @onSavePerson="doSavePerson" @closePerson="closePerson"></choose-person>
  </div>
</template>
<script>
import AddEquipment from './AddEquipment'
import ChoosePerson from './ChoosePerson'
import { postAddPermissionsData, getPermissionData, postUpdatePermissionData } from '../apis/index'
const ERROK = '00000'
export default {
  components: {
    AddEquipment,
    ChoosePerson
  },
  props: {
    show: {
      required: true,
      type: Boolean,
      default () {
        return false
      }
    },
    modifyMessege: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      startFloor: '',
      endFloor: '',
      form: {
        holder: '',
        org: '',
        personName: '',
        deviceName: '',
        cardId: '',
        floors: [],
        startTime: '',
        endTime: ''
      },
      rules: {
        holder: [{ required: true, message: '请选择人员', trigger: 'change' }],
        org: [{ required: true, message: '请选择设备', trigger: 'change' }],
        floors: [{ required: true, message: '请选择楼层', trigger: 'change' }],
        startTime: [{ required: true, validator: this.checkstartTime, trigger: 'blur' }],
        endTime: [{ required: true, validator: this.checkendTime, trigger: 'change' }]
      },
      deviceIDs: '',
      holderId: [],
      uuid: '',
      selectedData: [],
      selectPerson: [],
      showEquipment: false,
      showPerson: false,
      disButton: false
    }
  },
  methods: {
    // 获取设备数据
    getEquipments (equipments) {
      let getDeviceName = []
      if (equipments.selectedEquipments && equipments.selectedEquipments.length > 0) {
        for (let i = 0; i < equipments.selectedEquipments.length; i++) {
          getDeviceName.push(equipments.selectedEquipments[i].deviceName)
          delete equipments.selectedEquipments[i].deviceName
        }
      }
      this.form.org = getDeviceName.join('、')
      this.deviceIDs = equipments.selectedEquipments
      this.selectData = equipments.selectedEquipments.selectData
      this.selectedData = equipments.selectData
      this.showEquipment = false
    },
    // 查询权限信息
    getPermission () {
      getPermissionData({
        uuid: this.uuid
      }).then(res => {
        if (res.data.code === ERROK) {
          this.form.personName = res.data.data.personName
          this.form.deviceName = res.data.data.deviceName
          this.form.cardId = res.data.data.cardId ? res.data.data.cardId : ''
          this.form.floors = res.data.data.floors ? JSON.parse(res.data.data.floors) : []
          this.form.startTime = new Date(res.data.data.startTime)
          this.form.endTime = new Date(res.data.data.endTime)
          this.endFloor = res.data.data.endFloor
          this.startFloor = res.data.data.startFloor
        } else {
          this.disButton = true
          this.$message({
            message: res.data.message ? res.data.message : '获取权限信息失败',
            type: 'error'
          })
        }
      }).catch(err => {
        this.disButton = true
        console.log(err)
      })
    },
    // 获取楼层数
    getFloorOptions (startFloor, endFloor) {
      let start = parseInt(startFloor)
      let end = parseInt(endFloor)
      let floorArrs = []
      for (; start < end + 1; start++) {
        if (start === 0) {
          start = 1
        }
        floorArrs.push({ label: start + '楼', value: start })
      }
      return floorArrs
    },
    // 打开添加人员弹框
    onPerson () {
      this.showPerson = true
    },
    // 打开添加人员弹框
    onEquiment () {
      this.showEquipment = true
    },
    // 添加、修改权限
    saveEpuipment (fromName) {
      this.$refs[fromName].validate((valid) => {
        if (valid) {
          this.disButton = true
          if (this.modifyMessege) {
            this.updetePermissionFuc()
          } else {
            this.addPermissionsFuc()
          }
        } else {
          this.disButton = false
          return false
        }
      })
    },
    // 添加权限接口
    addPermissionsFuc () {
      postAddPermissionsData({
        deviceIDs: this.deviceIDs ? this.deviceIDs : null,
        holderId: this.holderId.join(','),
        startTime: this.form.startTime,
        endTime: this.form.endTime
      }).then(res => {
        if (res.data.code === ERROK) {
          this.$refs['form'].resetFields()
          this.disButton = false
          this.selectedData = []
          this.$emit('addpermissions')
          this.$message({
            message: '添加人员权限成功',
            type: 'success'
          })
        } else {
          this.disButton = false
          this.$message({
            message: res.data.message ? res.data.message : '添加权限失败',
            type: 'error'
          })
        }
      }).catch(err => {
        this.disButton = false
        console.log(err)
      })
    },
    // 修改权限接口
    updetePermissionFuc () {
      postUpdatePermissionData({
        id: this.uuid,
        floors: this.systemSort(this.form.floors).join(','),
        startTime: this.form.startTime.length ? this.form.startTime : this.formatDate(this.form.startTime),
        endTime: this.form.endTime.length ? this.form.endTime : this.formatDate(this.form.endTime)
      }).then(res => {
        if (res.data.code === ERROK) {
          this.$refs['form'].resetFields()
          this.disButton = false
          this.startFloor = ''
          this.endFloor = ''
          this.$emit('addpermissions')
          this.$message({
            message: '修改人员权限成功',
            type: 'success'
          })
        } else {
          this.disButton = false
          this.$message({
            message: res.data.message ? res.data.message : '修改权限失败',
            type: 'error'
          })
        }
      }).catch(err => {
        this.disButton = false
        console.log(err)
      })
    },
    // 开始时间规则
    checkstartTime (rule, value, callback) {
      if (!value) {
        return callback(new Error('开始时间不能为空'))
      }
      if (this.form.startTime > this.form.endTime) {
        callback(new Error('开始时间不能大于结束时间'))
      } else {
        callback()
      }
    },
    // 结束时间规则
    checkendTime (rule, value, callback) {
      if (!value) {
        return callback(new Error('结束时间不能为空'))
      }
      if (this.form.startTime > this.form.endTime) {
        callback(new Error('结束时间不能小于开始时间'))
      } else {
        callback()
      }
    },
    // 获取人员信息
    doSavePerson (chosePerson) {
      this.form.holder = chosePerson.holderNames.join(',')
      this.holderId = chosePerson.uuIds
      this.selectPerson = chosePerson.selectPerson
      this.showPerson = false
    },
    // 关闭设备
    closeEquipment (isStated) {
      if (isStated.isStated) {
        this.form.org = ''
        this.deviceIDs = ''
        this.selectedData = []
      }
      this.showEquipment = false
    },
    // 关闭人员
    closePerson (isStated) {
      if (isStated.isStated) {
        this.form.holder = ''
        this.holderId = []
        this.selectPerson = []
      }
      this.showPerson = false
    },
    // 关闭弹框
    onCloseEvent (fromName) {
      this.$refs['form'].resetFields()
      this.disButton = false
      this.selectedData = []
      this.selectPerson = []
      this.form.holder = ''
      this.form.org = ''
      this.form.personName = ''
      this.form.deviceName = ''
      this.form.cardId = ''
      this.form.startTime = ''
      this.form.endTime = ''
      this.form.floors = []
      this.startFloor = ''
      this.endFloor = ''
      this.$emit('closeDialog')
    },
    // 时间格式化
    formatDate (now) {
      let newDate = new Date(now)
      let year = newDate.getFullYear()
      let month = newDate.getMonth() + 1
      if (month < 10) {
        month = '0' + month
      }
      let date = newDate.getDate()
      if (date < 10) {
        date = '0' + date
      }
      let hour = newDate.getHours()
      if (hour < 10) {
        hour = '0' + hour
      }
      let minute = newDate.getMinutes()
      if (minute < 10) {
        minute = '0' + minute
      }
      let second = newDate.getSeconds()
      if (second < 10) {
        second = '0' + second
      }
      return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
    },
    // 排序
    systemSort (array) {
      return array.sort(function (a, b) { return a - b })
    }
  },
  watch: {
    show (val) {
      if (this.modifyMessege) {
        // 修改权限
        this.uuid = this.modifyMessege
        this.getPermission()
      } else {
        // 增加权限
        this.form.startTime = this.formatDate(new Date())
        this.form.endTime = this.formatDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
      }
    }
  }
}
</script>
<style lang="less" scoped>
.permissions-content {
  text-align: center;
  .permissions-row {
    width: 100%;
    margin-bottom: 30px;
    .permissions-input {
      margin-left: -100px;
      width: 300px;
    }
    .form-btn {
      margin-left: -100px;
    }
    .save-btn {
      margin-left: 20px;
    }
  }
}
</style>
<style lang="less">
.permissions-row {
  .el-form-item {
    margin: 0 auto;
  }
}
</style>

