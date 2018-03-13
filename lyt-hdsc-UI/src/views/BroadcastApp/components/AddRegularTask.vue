<template>
  <el-dialog :visible.sync="dialogFormVisible" width="950px" :before-close="onCancel">
    <div slot="title">
      <span>定时任务添加</span>
    </div>
    <el-form ref="taskForm" :model="taskForm" :rules="rules" label-width="90px">
      <el-row>
        <el-col :span="10">
          <el-form-item label="任务名称" prop="broadcastName">
            <el-input v-model.trim="taskForm.broadcastName" auto-complete="off" :maxlength="20"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="重复次数" prop="repetitions">
            <el-input v-model.trim="taskForm.repetitions" auto-complete="off" :maxlength="10"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="任务等级" prop="taskLevel">
            <el-input v-model.trim="taskForm.taskLevel" auto-complete="off" :maxlength="2" placeholder="请输入1~20,数字越小代表等级越高"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 中间媒体选择区域 -->
      <el-row>
        <div class="ca-container clearfix">
          <div class="left-con">
            <el-tree ref="tree" node-key="id" :data="treeData" :props="defaultProps" default-expand-all :expand-on-click-node="true" show-checkbox>
            </el-tree>
          </div>
          <div class="right-con">
            <el-table ref="multipleTable" :data="sceneList" tooltip-effect="dark" max-height="200" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55">
              </el-table-column>
              <el-table-column label="场景名称" width="140" prop="sceneName">
                <template slot-scope="scope">{{ scope.row.sceneName }}</template>
              </el-table-column>
              <el-table-column label="创建日期" width="190" prop="createTime">
                <template slot-scope="scope">{{ scope.row.createTime }}</template>
              </el-table-column>
            </el-table>
            <div class="pagination-con">
              <el-pagination class="page-bar" @size-change="handleSizeChange" :current-page="currentPage" @current-change="handleCurrentChange" :total="sceneTotal" :page-size="pageSize" layout="total,prev,pager,next">
              </el-pagination>
            </div>
          </div>
        </div>
      </el-row>
      <el-row>
        <el-col :span="10" v-show="false">
          <el-form-item label="结束日期" prop="endTime">
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="启动时间" prop="dailyStartTime">
            <el-time-picker class="datepick" v-model="taskForm.dailyStartTime" :editable="false" placeholder="选择启动时间" value-format="HH:mm:ss">
            </el-time-picker>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="终止时间" prop="dailyEndTime">
            <el-time-picker class="datepick" v-model="taskForm.dailyEndTime" :editable="false" placeholder="选择终止时间" value-format="HH:mm:ss">
            </el-time-picker>
          </el-form-item>
        </el-col>
        <el-col :span="20" v-show="false">
          <el-form-item label="单次播放" prop="startupTime">
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="重复周期" prop="duplicateIds">
          <el-checkbox-group v-model="taskForm.duplicateIds" @change="duplicateChange" :disabled="checkboxGroupDisable">
            <el-checkbox label="0" name="type" ref="everyday" :checked="everyDayChecked" @change="handleEvdchange">每天</el-checkbox>
            <el-checkbox label="7" name="type" :disabled="weekDaydisabled">星期日</el-checkbox>
            <el-checkbox label="1" name="type" :disabled="weekDaydisabled">星期一</el-checkbox>
            <el-checkbox label="2" name="type" :disabled="weekDaydisabled">星期二</el-checkbox>
            <el-checkbox label="3" name="type" :disabled="weekDaydisabled">星期三</el-checkbox>
            <el-checkbox label="4" name="type" :disabled="weekDaydisabled">星期四</el-checkbox>
            <el-checkbox label="5" name="type" :disabled="weekDaydisabled">星期五</el-checkbox>
            <el-checkbox label="6" name="type" :disabled="weekDaydisabled">星期六</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-row>
    </el-form>
    <div slot="footer">
      <el-button type="primary" @click="onSave">保 存</el-button>
      <el-button @click="onCancel">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>

import { addTimingTask, getSceneList } from '@/views/BroadcastApp/apis/index.js'
import { formatDateTime, validPositiveInt, validTaskName } from '@/views/BroadcastApp/assets/js/validate.js'
import { listDeviceList } from '@/views/BroadcastApp/assets/js/list_devices.js'
import { LOG_TAG } from '@/views/BroadcastApp/assets/js/index.js'
export default {
  data () {
    let taskLevelPass = (rule, value, callback) => {
      if (value === '' || value === null) {
        callback(new Error('请输入等级数字'))
      } else {
        if (!validPositiveInt(value)) {
          callback(new Error('请输入正整数'))
        } else if (value > 20) {
          callback(new Error('等级不能大于20'))
        } else {
          callback()
        }
      }
    }
    let repetitionsPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入重复次数'))
      } else {
        if (!validPositiveInt(value)) {
          callback(new Error('请输入正整数'))
        } else {
          callback()
        }
      }
    }
    let broadcastNamePass = (rule, value, callback) => {
      if (!validTaskName(value)) {
        callback(new Error('请输入正确的任务名称'))
      } else {
        callback()
      }
    }
    return {
      pageSize: 10,
      currentPage: 1,
      taskForm: {
        broadcastName: '',
        repetitions: '',
        taskLevel: '',
        broadcastType: 1,
        startupTime: '',
        endTime: '',
        dailyStartTime: '',
        dailyEndTime: '',
        duplicateIds: [],
        sceneIds: [],
        recovery: 1,
        createUser: 'xxx',
        sendIotMsg: true
      },
      searchKey: '',
      loadable: true,
      defaultOpenKeys: [1, 2],
      startupTimeDisable: false,
      checkboxGroupDisable: false,
      treeData: [],
      defaultProps: {
        id: 'id',
        children: 'children',
        label: 'label'
      },
      chooseScene: [],
      sceneList: [
      ],
      sceneTotal: 0,
      dialogFormVisible: false,
      rules: {
        broadcastName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
          { validator: broadcastNamePass, trigger: 'blur' }
        ],
        repetitions: [
          { required: true, message: '请输入重复次数', trigger: 'blur' },
          { validator: repetitionsPass, trigger: 'blur' }
        ],
        taskLevel: [
          { required: true, message: '请输入整数1~20 (数字越小代表等级越高)', trigger: 'blur' },
          { validator: taskLevelPass, trigger: 'blur' }
        ],
        dailyStartTime: [
          { required: true, message: '请输入启动时间', trigger: 'blur' }
        ],
        dailyEndTime: [
          { required: true, message: '请输入终止时间', trigger: 'blur' }
        ],
        duplicateIds: [
          { required: true, message: '请选择重复周期', trigger: 'blur' }
        ]
      },
      chooseTasks: [],
      taskDatas: [],
      chooseTasks2: [],
      isIndeterminate: true,
      checkAll: false,
      everyDayChecked: false,
      weekDaydisabled: false
    }
  },
  mounted: function () {
    this.getSceneData()
    this.getDeviList()
  },
  methods: {
    /**
     * @description 获取场景列表
     */
    getSceneData: function () {
      let condition = {}
      condition.pageNo = this.currentPage
      condition.pageSize = this.pageSize
      condition.searchKey = this.searchKey
      getSceneList(Object.assign({}, condition))
        .then(res => {
          if (res.data.code === '00000') {
            this.sceneTotal = res.data.data.total
            let tableD = res.data.data.scene
            tableD.forEach((item, index) => {
              let d = new Date(item.createTime)
              item.createTime = formatDateTime(d, 'dateTime')
            })
            this.sceneList = tableD
          }
        }).catch(err => {
          console.warn(LOG_TAG + err)
        })
    },
    /**
     * @description 分页组件单页总数变化
     * @param {Number} params 选择的单页总数的值
     */
    handleSizeChange: function (params) {
      this.pageSize = params
      this.currentPage = 1
      this.getSceneData()
    },
    /**
     * @description 分页组件当前页变化
     * @param {Number} params 选择当前页的值
     */
    handleCurrentChange: function (params) {
      this.currentPage = params
      this.getSceneData()
    },
    /**
     * @description 打开对话框
     */
    openDialog: function () {
      this.dialogFormVisible = true
    },
    /**
     * @description 重置form并关闭对话
     */
    closeDialog: function () {
      this.weekDaydisabled = false
      this.everyDayChecked = false
      this.$refs['taskForm'].resetFields()
      this.$refs['tree'].setCheckedNodes([])
      this.$refs['multipleTable'].clearSelection()
      this.dialogFormVisible = false
    },
    /**
     * @description 获取设备列表
     */
    getDeviList: listDeviceList,
    /**
     * @description 场景列表选项监听
     */
    handleSelectionChange (val) {
      this.multipleSelection = val
      this.chooseScene = val
    },
    /**
     * @description 验证时间合理性
     */
    validDailyTime: function () {
      let dailyStartTime = new Date('January 20,2018' + ' ' + this.taskForm.dailyStartTime).getTime()
      let dailyEndTime = new Date('January 20,2018' + ' ' + this.taskForm.dailyEndTime).getTime()
      if (dailyEndTime - dailyStartTime < 60000 * 5) { // 时间差至少5分钟
        this.$message({
          message: '终止时间必须大于启动时间5分钟以上',
          type: 'warning'
        })
        return false
      } else {
        return true
      }
    },
    /**
     * @description 新增任务保存
     */
    onSave: function () {
      let treeChecked = [].concat(this.$refs['tree'].getCheckedNodes(true))
      let newPlayAreaIds = []
      let parentIds = []
      let deciIdx = 0
      // 将已选的树节点信息转化为接口参数规定的数据结构
      treeChecked.forEach((item, index) => {
        if (parentIds.indexOf(item.parentId) === -1) {
          if (parentIds.length === 0) {
            deciIdx = 0
          } else {
            deciIdx = deciIdx + 1
          }
          newPlayAreaIds[deciIdx] = {}
          newPlayAreaIds[deciIdx].controllerId = item.parentId
          newPlayAreaIds[deciIdx].controllerName = item.parentName
          newPlayAreaIds[deciIdx].playAreaId = []
          newPlayAreaIds[deciIdx].subDeviceInfo = []
          newPlayAreaIds[deciIdx].playAreaId.push(item.subDeviceInstallAddress)
          newPlayAreaIds[deciIdx].subDeviceInfo.push(item.subDeviceInfo)
          parentIds.push(item.parentId)
        } else {
          newPlayAreaIds[deciIdx].playAreaId.push(item.subDeviceInstallAddress)
          newPlayAreaIds[deciIdx].subDeviceInfo.push(item.subDeviceInfo)
        }
      })
      this.taskForm.deviceInfo = newPlayAreaIds
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          if (treeChecked.length < 1) {
            this.$message({
              type: 'warning',
              message: '请选择播放区域'
            })
            return false
          } else if (!this.validDailyTime()) {
            return false
          } else if (this.taskForm.duplicateIds.length < 1) {
            this.$message({
              type: 'warning',
              message: '请选择重复周期'
            })
            return false
          } else {
            let chooseScene = this.chooseScene
            if (chooseScene.length < 1) {
              this.$message({
                type: 'warning',
                message: '请选择场景'
              })
              return false
            } else {
              let params = Object.assign({}, this.taskForm)
              params.sendIotMsg = true
              let dateT = formatDateTime(new Date(), 'date')
              // 格式化日期字段
              if (typeof params.dailyStartTime === 'object') {
                params.dailyStartTime = formatDateTime(params.dailyStartTime, 'time')
              }
              if (typeof params.dailyEndTime === 'object') {
                params.dailyEndTime = formatDateTime(params.dailyEndTime, 'time')
              }
              if (params.dailyStartTime.length < 10) {
                params.dailyStartTime = dateT + ' ' + params.dailyStartTime
              }
              if (params.dailyEndTime.length < 10) {
                params.dailyEndTime = dateT + ' ' + params.dailyEndTime
              }
              params.endTime = params.dailyEndTime
              params.startupTime = params.dailyStartTime
              chooseScene.forEach((item, index) => {
                params.sceneIds.push(item.uuid)
              })
              params.repetitions = parseInt(this.taskForm.repetitions)
              params.taskLevel = parseInt(this.taskForm.taskLevel)
              if (params.duplicateIds[0] === '0') {
                params.duplicateIds = ['1', '2', '3', '4', '5', '6', '7']
              }
              // 调用任务新增接口
              addTimingTask(Object.assign({}, params)).then(res => {
                if (res.data.code === '00000') {
                  this.$emit('reflushData')
                  this.$message({
                    message: '新增任务成功',
                    type: 'success'
                  })
                  this.closeDialog()
                } else {
                  this.$message({
                    message: res.data.data,
                    type: 'warning'
                  })
                }
              }).catch(err => {
                console.warn(LOG_TAG + err.response.data.message)
              })
            }
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
    /**
     * @description 取消按钮
     */
    onCancel: function () {
      this.dialogFormVisible = false
    },
    /**
     * @description 复选框  全选
     * @param {Array} val
     */
    checkAllChange: function (val) {
      this.chooseTasks = val ? this.taskDatas : []
      this.isIndeterminate = false
    },
    /**
     * @description 选择每天或者星期几
     */
    handleEvdchange: function () {
      this.taskForm.duplicateIds = []
      this.everyDayChecked = !this.everyDayChecked
    },
    /**
     * @description 重复周期选项发生变化
     */
    duplicateChange: function () {
      if (this.everyDayChecked === true) {
        this.weekDaydisabled = true
        this.taskForm.duplicateIds = ['0']
      } else {
        this.weekDaydisabled = false
      }
    }
  }
}
</script>
<style scoped>
.clearfix:before,
.clearfix:after {
  content: "";
  display: table;
  clear: both;
}
.clearfix {
  zoom: 1;
}
.ca-container {
  position: relative;
  width: 100%;
  height: 100%;
  margin-bottom: 20px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #dddee1;
}
.left-con {
  float: left;
  width: 50%;
  height: 248px;
  display: flex;
  flex-flow: column;
  overflow-y: auto;
  border-right: 1px solid #dddee1;
}
.right-con {
  display: flex;
  flex-flow: column;
  float: right;
  width: 46%;
  height: 234px;
  overflow-y: auto;
  box-sizing: border-box;
  border: 1px solid #dddee1;
  margin-top: 14px;
}
.pagination-con {
  padding-left: 10px;
}
</style>