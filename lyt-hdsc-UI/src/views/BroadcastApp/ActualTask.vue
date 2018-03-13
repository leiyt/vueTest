<template>
  <div class="container">
    <div class="clearfix">
      <el-button type="primary" @click="onAddTask">添加</el-button>
      <el-button type="danger" @click="onDelBatchTask">批量删除</el-button>
      <add-edit-actual-task ref="addEditActualTask" @reflushData="getTaskData" :title="propTitle"></add-edit-actual-task>
      <div class="search-bar">
        <el-input placeholder="按即时任务名称模糊查询" :maxlength="20" prefix-icon="el-icon-search" v-model.trim="searchKey" class="audio-search" @keyup.enter.native="getTaskData()">
        </el-input>
      </div>
    </div>
    <div class="table-con">
      <el-table class="audio-table" :data="tableData" height="100%" stripe border header-cell-class-name="text-align-center" @selection-change="handleSelectionChange" style="width: 100%;">
        <el-table-column fixed="left" v-if="hasSelect" type="selection" width="55">
        </el-table-column>
        <el-table-column label="任务名称" prop="broadcastName">
        </el-table-column>
        <el-table-column label="重复次数" prop="repetitions">
        </el-table-column>
        <el-table-column label="任务等级" prop="taskLevel">
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="300">
          <template slot-scope="scope">
            <el-button class="control-btn" type="primary" @click="onPlayAudio(scope.row)" :disabled="scope.row.playBtnState">播放</el-button>
            <el-button class="control-btn" type="primary" @click="onPauseAudio(scope.row)" :disabled="scope.row.pauseBtnState">暂停</el-button>
            <el-button class="control-btn" type="primary" @click="onStopAudio(scope.row)" :disabled="scope.row.stopBtnState">停止</el-button>
            <el-button class="control-btn" type="primary" @click="onEditTask(scope.row)">编辑</el-button>
            <el-button class="control-btn" type="danger" @click="onTaskDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination class="page-bar" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :total="total" :page-sizes="pageSizes" :page-size="pageSize" layout="total,sizes,prev,pager,next,jumper">
    </el-pagination>
  </div>
</template>

<script>
import { LOG_TAG } from '@/views/BroadcastApp/assets/js/index.js'
import AddEditActualTask from './components/AddEditActualTask'
import { getRealtimeList, delRealtimeTask, playRealtimeTask, pauseRealtimeTask } from '@/views/BroadcastApp/apis/index.js'
export default {
  components: {
    AddEditActualTask
  },
  data () {
    return {
      broadcastType: 0,
      searchKey: '',
      pageNo: 1,
      pageSize: 10,
      currentPage: 1,
      tableData: [],
      selections: [],
      total: 0,
      pageSizes: [10, 20, 30, 40, 50],
      hasSelect: {
        default: false,
        type: Boolean
      },
      propTitle: '',
      tableLoading: ''
    }
  },
  mounted: function () {
    this.getTaskData()
  },
  methods: {
    /**
     * @description 获取列表数据
     */
    getTaskData: function () {
      let condition = {}
      condition.pageNo = this.currentPage
      condition.pageSize = this.pageSize
      condition.searchKey = this.searchKey
      condition.broadcastType = this.broadcastType
      this.tableLoading = true
      getRealtimeList(Object.assign({}, condition))
        .then(res => {
          this.tableLoading = true
          if (res.data.code === '00000') {
            let TableD = res.data.data.broadcast
            TableD.forEach((item, index) => {
              item.playBtnState = false
              item.pauseBtnState = true
              item.stopBtnState = true
              item.operation = 3
            })
            this.tableData = TableD
            this.total = res.data.data.total
            this.tableLoading = false
          }
        }).catch(err => {
          console.warn(LOG_TAG + err)
          this.tableLoading = false
        })
    },
    /**
     * @description 打开新增任务对话框
     */
    onAddTask: function () {
      this.propTitle = '即时任务添加'
      this.$refs['addEditActualTask'].openDialog()
    },
    /**
     * @description 打开编辑对话框
     * @param {Object} val 所选中行的数据
     */
    onEditTask: function (params) {
      this.propTitle = '即时任务编辑'
      let taskInfo = Object.assign({}, { broadcastId: params.uuid, broadcastType: params.broadcastType })
      this.$refs['addEditActualTask'].initFormData(taskInfo)
      this.$refs['addEditActualTask'].openDialog()
    },
    /**
     * @description 封装单条记录的设备信息
     * @param {Array} devcList 列表单条数据中的设备信息
     * @return {Array} 特定数据结构的数组
     */
    encapPlayAreaMsg: function (devcList = []) {
      let deviceInfo = []
      let idx = 0
      devcList.forEach((item, index) => {
        if (item.playAreaId.length > 0) {
          deviceInfo[idx] = {}
          deviceInfo[idx].controllerId = item.controllerId
          deviceInfo[idx].controllerName = item.controllerName
          deviceInfo[idx].sessionId = item.sessionId
          deviceInfo[idx].playAreaId = []
          if (item.playAreaId !== '' && item.playAreaId !== null) {
            let playAreaIds = item.playAreaId.split(',')
            playAreaIds.forEach((cur, _idx) => {
              if (cur !== null && cur !== '') {
                deviceInfo[idx].playAreaId.push(cur)
              }
            })
            idx = idx + 1
          }
        }
      })
      return deviceInfo
    },
    /**
     * @description 点击播放单条任务
     * @param {Object} params 所有选中行数据
     */
    onPlayAudio: function (params) {
      if (params.operation === 3) {
        // 首次播放
        params.playBtnState = true
      } else if (params.operation === 2) {
        // 恢复播放
        params.operation = 2
        params.playBtnState = true
      }
      let devcList = params.broadcastAreaLink
      let deviceInfo = []
      deviceInfo = this.encapPlayAreaMsg(devcList)
      let paramsT = {}
      paramsT.broadcastIds = [params.uuid]
      paramsT.broadcastType = params.broadcastType
      paramsT.operation = params.operation
      paramsT.taskLevel = params.taskLevel
      paramsT.recovery = 1
      paramsT.repetitions = params.repetitions
      paramsT.sendIotMsg = true
      paramsT.deviceInfo = deviceInfo
      if (params.playBtnState === true) {
        playRealtimeTask(Object.assign({}, paramsT)).then(res => {
          if (res.data.code === '00000') {
            this.$message({
              type: 'success',
              message: '播放成功'
            })
            setTimeout(() => {
              params.operation = 1
              params.playBtnState = true
              params.pauseBtnState = false
              params.stopBtnState = false
            }, 1000)
          } else {
            this.$message({
              type: 'warning',
              message: res.data.data
            })
            setTimeout(() => {
              params.playBtnState = false
            }, 1000)
          }
        }).catch(err => {
          console.warn(LOG_TAG + err)
        })
      }
    },
    /**
     * @description 点击暂停单条任务
     * @param {Object} params 所有选中行数据
     */
    onPauseAudio: function (params) {
      let devcList = params.broadcastAreaLink
      let deviceInfo = []
      deviceInfo = this.encapPlayAreaMsg(devcList)
      let paramsT = {}
      paramsT.broadcastIds = [params.uuid]
      paramsT.broadcastType = params.broadcastType
      paramsT.operation = 1
      paramsT.taskLevel = params.taskLevel
      paramsT.recovery = 1
      paramsT.repetitions = params.repetitions
      paramsT.sendIotMsg = true
      paramsT.deviceInfo = deviceInfo
      pauseRealtimeTask(Object.assign({}, paramsT)).then(res => {
        if (res.data.code === '00000') {
          this.$message({
            type: 'success',
            message: '暂停操作已下发'
          })
          setTimeout(() => {
            params.playBtnState = false
            params.pauseBtnState = true
            params.stopBtnState = false
            params.operation = 2
          }, 1000)
        } else {
          this.$message({
            type: 'warning',
            message: res.data.data
          })
          params.pauseBtnState = false
        }
      }).catch(err => {
        console.warn(LOG_TAG + err)
      })
    },
    /**
     * @description 点击停止单条任务
     * @param {Object} val 所有选中行数据
     */
    onStopAudio: function (params) {
      if (params.operation !== 3) {
        let devcList = params.broadcastAreaLink
        let deviceInfo = []
        deviceInfo = this.encapPlayAreaMsg(devcList)
        let paramsT = {}
        paramsT.broadcastIds = [params.uuid]
        paramsT.broadcastType = params.broadcastType
        paramsT.operation = 0
        paramsT.taskLevel = params.taskLevel
        paramsT.recovery = 1
        paramsT.repetitions = params.repetitions
        paramsT.sendIotMsg = true
        paramsT.deviceInfo = deviceInfo
        playRealtimeTask(Object.assign({}, paramsT)).then(res => {
          if (res.data.code === '00000') {
            this.$message({
              type: 'success',
              message: '停止操作已下发'
            })
            setTimeout(() => {
              params.operation = 3
              params.playBtnState = false
              params.pauseBtnState = true
              params.stopBtnState = true
            }, 1000)
          } else {
            this.$message({
              type: 'warning',
              message: res.data.data
            })
            params.playState = false
          }
        }).catch(err => {
          console.warn(LOG_TAG + err)
        })
      }
    },
    /**
     * @description 点击table组件复选框触发
     * @param {Array} val 所有选中行数据
     */
    handleSelectionChange: function (val) {
      this.selections = val
    },
    /**
     * @description 删除单条记录
     * @param {Object} params 所选中行的数据
     */
    onTaskDelete: function (params = {}) {
      this.$confirm('确定要刪除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        delRealtimeTask(Object.assign({}, { 'broadcastIds': [params.uuid], 'broadcastType': 0, 'sendIotMsg': true, 'sessionIds': params.sessionId })).then(res => {
          if (res.data.code === '00000') {
            this.getTaskData()
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          } else {
            this.$message({
              message: res.data.data,
              type: 'warning'
            })
          }
        }).catch(err => {
          console.warn(LOG_TAG + err)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    /**
     * @description 分页组件当前页变化
     * @param {Number} params 选择当前页的值
     */
    handleCurrentChange: function (params) {
      this.currentPage = params
      this.getTaskData()
    },
    /**
     * @description 分页组件单页总数变化
     * @param {Number} params 选择的单页总数的值
     */
    handleSizeChange: function (params) {
      this.pageSize = params
      this.currentPage = 1
      this.getTaskData()
    },
    /**
     * @description 批量删除表格数据
     */
    onDelBatchTask: function () {
      if (this.selections.length <= 0) {
        this.$message({
          message: '请至少选择一项！',
          type: 'warning'
        })
        return
      }
      let str = ''
      let keys = []
      let sessionIds = []
      for (let i = 0, len = this.selections.length; i < len; i++) {
        if (this.selections[i].broadcastName && i < 3) {
          str += this.selections[i].broadcastName
          if (i < len - 1 && i < 2) {
            str += ','
          }
        }
        keys.push(this.selections[i].uuid)
        sessionIds.push(this.selections[i].sessionId)
      }
      str = this.selections.length > 3 ? (str + '等') : str
      this.$confirm('确定要刪除 ' + str + ' 的即时广播任务吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        // 调用批量删除的接口
        delRealtimeTask({ 'broadcastIds': keys, 'broadcastType': 0, 'sendIotMsg': true, 'sessionIds': sessionIds })
          .then(res => {
            if (res.data.code === '00000') {
              this.getTaskData()
              this.$message({
                message: '删除成功',
                type: 'success'
              })
            } else {
              this.$message({
                message: res.data.data,
                type: 'warning'
              })
            }
          }).catch(err => {
            console.warn(LOG_TAG + err)
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
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
.container {
  border: 1px solid #ccc;
  width: 100%;
  height: 100%;
  min-height: 800px;
  padding: 15px;
  box-sizing: border-box;
}
.search-bar {
  float: right;
}
.audio-search {
  width: 200px;
}
.table-con {
  height: 599px;
  margin-top: 15px;
}
.audio-table {
  height: 100%;
}
.control-btn {
  padding: 7px 7px;
  margin-left: 4px;
}
.page-bar {
  padding: 0;
  margin-top: 10px;
  text-align: right;
}
</style>
