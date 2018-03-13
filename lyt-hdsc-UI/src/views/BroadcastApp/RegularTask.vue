<template>
  <div class="container">
    <div class="clearfix">
      <el-button type="primary" @click="onAddTask">添加</el-button>
      <el-button type="danger" @click="onDelBatchTask">批量删除</el-button>
      <add-regular-task ref="addRegularTask" @reflushData="getTaskData"></add-regular-task>
      <detail-regular-task ref="detailRegularTask"></detail-regular-task>
      <div class="search-bar">
        <el-input placeholder="按定时任务名称模糊查询" :maxlength="20" prefix-icon="el-icon-search" v-model.trim="searchKey" class="audio-search" @keyup.enter.native="getTaskData">
        </el-input>
      </div>
    </div>
    <div class="table-con">
      <el-table class="audio-table" :data="tableData" height="100%" stripe border header-cell-class-name="text-align-center" @selection-change="handleSelectionChange" style="width: 100%;">
        <el-table-column fixed="left" v-if="hasSelect" type="selection" width="55">
        </el-table-column>
        <el-table-column label="任务名称" prop="broadcastName">
        </el-table-column>
        <el-table-column label="启动时间" prop="dailyStartTime">
        </el-table-column>
        <el-table-column label="终止时间" prop="dailyEndTime">
        </el-table-column>
        <el-table-column label="重复次数" prop="repetitions">
        </el-table-column>
        <el-table-column label="任务等级" prop="taskLevel">
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template slot-scope="scope">
            <el-button class="control-btn" type="primary" @click="onDetailTask(scope.row)">查看</el-button>
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
import AddRegularTask from './components/AddRegularTask'
import DetailRegularTask from './components/DetailRegularTask'
import { getTimingList, delTimingTask } from '@/views/BroadcastApp/apis/index.js'
export default {
  components: {
    AddRegularTask,
    DetailRegularTask
  },
  data () {
    return {
      searchKey: '',
      broadcastType: 1,
      tableData: [],
      selections: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 30, 40, 50],
      hasSelect: {
        default: false,
        type: Boolean
      },
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
      getTimingList(Object.assign({}, condition))
        .then(res => {
          if (res.data.code === '00000') {
            let tableD = res.data.data.broadcast
            this.total = res.data.data.total
            tableD.forEach((item, index) => {
              if (typeof item.dailyStartTime === 'string') {
                item.dailyStartTime = item.dailyStartTime.substr(11, 8)
              }
              if (typeof item.dailyEndTime === 'string') {
                item.dailyEndTime = item.dailyEndTime.substr(11, 8)
              }
            })
            this.tableData = tableD
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
      this.$refs['addRegularTask'].openDialog()
    },
    /**
     * @description 查看详情
     * @param {Object} params 所选中行的数据
     */
    onDetailTask: function (params = {}) {
      let par = Object.assign({}, { broadcastId: params.uuid, broadcastType: this.broadcastType })
      this.$refs['detailRegularTask'].initFormData(par)
      this.$refs['detailRegularTask'].openDialog()
    },
    /**
     * @description 点击table组件复选框触发
     * @param Array val 所有选中行数据
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
        delTimingTask({ 'broadcastIds': [params.uuid], 'broadcastType': 1, 'sendIotMsg': true }).then(res => {
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
      for (let i = 0, len = this.selections.length; i < len; i++) {
        if (this.selections[i].broadcastName && i < 3) {
          str += this.selections[i].broadcastName
          if (i < len - 1 && i < 2) {
            str += ','
          }
        }
        keys.push(this.selections[i].uuid)
      }
      str = this.selections.length > 3 ? (str + '等') : str
      this.$confirm('确定要刪除 ' + str + ' 的定时广播任务吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        // 调用批量删除的接口
        delTimingTask({ 'broadcastIds': keys, 'broadcastType': 1, 'sendIotMsg': true })
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
