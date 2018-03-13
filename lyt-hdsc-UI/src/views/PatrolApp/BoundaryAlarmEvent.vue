<template>
  <div class="boundaryAlarm">
    <!-- 横线 + 上半 -->
    <div>
      <el-form :inline="true" :model="BoundaryQuery" class="demo-form-inline">
        <!-- 第一行 -->
        <el-row class="headStyle">
          <!-- 第一列 -->
          <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7">
            <el-form-item label="人 员" label-width="70px" class="security-select">
              <el-select v-model="BoundaryQuery.userId" filterable placeholder="请选择人员" popper-class="select_box" @focus="addGetName">
                <el-option v-for="item in users" :key="item.uuid" :label="item.name" :value="item.uuid">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 第二列 -->
          <el-col :xs="9" :sm="9" :md="9" :lg="9" :xl="9">
            <el-form-item label="任 务" label-width="70px">
              <el-input v-model="BoundaryQuery.taskName" placeholder="请输入任务"></el-input>
            </el-form-item>
          </el-col>
          <!-- 第三列 -->
          <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
            <el-form-item>
              <el-button type="primary" @click="closeQuery">重 置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第二行 -->
        <el-row class="twoHeadStyle">
          <!-- 第一列 -->
          <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="7">
            <el-form-item label="设 备" label-width="70px">
              <el-select v-model="BoundaryQuery.deviceId" filterable placeholder="请选择设备" popper-class="select_box" @focus="addTaskName">
                <el-option v-for="item in taskList" :key="item.deviceID" :label="item.deviceName" :value="item.deviceID">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 第二列 -->
          <el-col :xs="9" :sm="9" :md="9" :lg="9" :xl="9">
            <el-form-item label="报警时间" label-width="70px">
              <el-date-picker v-model="BoundaryQuery.beginTime" type="date" value-format="yyyy-MM-dd" @change="getBegintTime" placeholder="开始日期" :editable="false">
              </el-date-picker>
            </el-form-item>
            <el-form-item label='到' label-width="26px">
              <el-date-picker v-model="BoundaryQuery.endTime" type="date" value-format="yyyy-MM-dd" placeholder="结束日期" @change="getEndTime" :editable="false">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <!-- 第三列 -->
          <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
            <el-form-item>
              <el-button type="primary" @click="addBoundaryAlarmEvent">查 询</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!-- END -->
    <!-- 表格 -->
    <div>
      <el-table ref="multipleTable" :data="BoundaryData" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange" border>
        <el-table-column label="序号" prop="index" type="index" align="center" header-align="center" width="50"></el-table-column>
        <el-table-column label="报警时间" prop="happenTime" align="center" header-align="center"></el-table-column>
        <el-table-column label="人员" prop="userName" align="center" header-align="center"> </el-table-column>
        <el-table-column label="设备" prop="deviceName" align="center" header-align="center"> </el-table-column>
        <el-table-column label="任务" prop="taskName" align="center" header-align="center"></el-table-column>
        <el-table-column label="原因" prop="reason" align="center" show-overflow-tooltip header-align="center"></el-table-column>
        <el-table-column label="预警" prop="alarmStatusDetail" align="center" header-align="center" type="text">
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div v-show="BoundaryData.length">
        <el-pagination @size-change="handleSizeChange" background @current-change="handleCurrentChange" align='center' :current-page="current.pageNo" :page-sizes="[10,20,30,40,50,60]" :page-size="current.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="current.total" style="margin-top:15px"></el-pagination>
      </div>
      <!-- 分页 END -->
    </div>
    <!-- 弹框 -->
    <describe :visible="showaddDialog" v-on:child="listenToMyBoy" :child-msg="msg" :times='time' :deviceId='deviceId' :person='person' :diffserv='diffserv' :uuidNumber='uuidNumber' @closeDialog="closeDialog"></describe>
    <!-- END 弹框 -->
    <!-- END 表格 -->
  </div>
</template>
<script>
// 引入ajax请求的index
import { getBoundaryAlarmEventData, getNameData, getTaskNameData } from './apis/eventHandler'
// 引入弹框--组件
import describe from './components/dialogs/BoundaryViolationAlarm.vue'
// 定义组件
export default {
  components: {
    describe
  },
  // 注册数据
  data () {
    return {
      msg: '',
      time: '',
      users: [],
      person: '',
      deviceId: '',
      diffserv: '',
      restaurants: [],
      uuidNumber: '',
      showaddDialog: false,
      personList: [],
      taskList: [],
      BoundaryQuery: {
        taskName: '',
        userId: '',
        // 定义时段
        beginTime: '',
        endTime: '',
        deviceId: ''
      },
      current: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      multipleSelection: [],
      BoundaryData: [],
      timeoutAlarmEvent: 'boundaryAlermEvent'
    }
  },
  // 页面加载执行
  mounted () {
    this.addBoundaryAlarmEvent()
  },
  methods: {
    /*
     * 页面加载ajax 请求
     */
    addBoundaryAlarmEvent () {
      // 参数：当前页  下一页 任务名 用户ID 开始时间 结束时间 设备ID
      let params = {
        'pageSize': this.current.pageSize,
        'pageNo': this.current.pageNo,
        'taskName': this.BoundaryQuery.taskName,
        'userId': this.BoundaryQuery.userId,
        'beginDate': this.BoundaryQuery.beginTime,
        'endDate': this.BoundaryQuery.endTime,
        'deviceId': this.BoundaryQuery.deviceId
      }
      getBoundaryAlarmEventData(params).then(rs => {
        if (rs.status === 200) {
          this.BoundaryData = rs.data.data.rows
          this.current.total = rs.data.data.total
        } else {
          this.data = []
        }
      })
    },
    // 结束时间不能小于开始时间，请重新选择
    getBegintTime (value) {
      if (this.BoundaryQuery.endTime && this.BoundaryQuery.endTime < value) {
        this.$message({
          message: '开始时间不能大于结束时间，请重新选择',
          time: 3,
          type: 'warning'
        })
        this.BoundaryQuery.endTime = ''
      }
    },
    // 开始时间不能大于结束时间，请重新选择
    getEndTime (value) {
      if (this.BoundaryQuery.beginTime && this.BoundaryQuery.beginTime > value) {
        this.$message({
          message: '开始时间不能大于结束时间，请重新选择',
          time: 3,
          type: 'warning'
        })
        this.BoundaryQuery.beginTime = ''
      }
    },
    // 预警项条件内的变色
    getPoinStatusClass (index, row) {
      let status = row.alarmStatus
      if ((status === '3' || status === '4') && (row.reason === null)) {
        return 'clickStyle'
      }
    },
    // 预警点击事件
    statusClick (index, row) {
      let status = row.alarmStatus
      if ((status === '3' || status === '4') && (row.reason === null)) {
        this.showaddDialog = true
        this.msg = row.taskName
        this.time = row.happenTime
        this.person = row.userId
        this.diffserv = this.timeoutAlarmEvent
        this.uuidNumber = row.uuid
        this.deviceId = row.deviceId
      }
    },
    // 对应显示逻辑
    formatStatus (index, row) {
      let statusText = ['未查巡', '已查巡', '越界未查巡', '越界已查巡', '越界预警中', '越界预警已解除', '预警中', '预警已解除']
      return statusText[parseInt(row.alarmStatus)]
    },
    // list
    toggleSelection (rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    /*
     *每页显示几条
     */
    handleSizeChange (val) {
      this.current.pageSize = val
      this.addBoundaryAlarmEvent()
    },
    /*
     *当前页数
     */
    handleCurrentChange (val) {
      this.current.pageNo = val
      this.addBoundaryAlarmEvent()
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    // 显示弹框
    dialogFormVisible () {
      this.showaddDialog = true
    },
    // 关闭弹框
    closeDialog () {
      this.showaddDialog = false
    },
    //  重置按钮
    closeQuery () {
      this.BoundaryQuery.taskName = ''
      this.BoundaryQuery.userId = ''
      this.BoundaryQuery.beginTime = ''
      this.BoundaryQuery.endTime = ''
      this.BoundaryQuery.deviceId = ''
    },
    // 人员姓名下拉框
    addGetName () {
      getNameData().then(rs => {
        if (rs.data.code === '00000') {
          this.users = rs.data.data
        } else {
          this.data = []
        }
      })
    },
    // 设备选择下拉框
    addTaskName () {
      getTaskNameData().then(rs => {
        if (rs.data.code === '00000') {
          this.taskList = rs.data.data
        } else {
          this.data = []
        }
      })
    },
    // 子组件反馈信息
    listenToMyBoy: function (somedata, ros) {
      for (var i = 0; i < this.current.total; i++) {
        if (this.BoundaryData[i].uuid === ros) {
          this.BoundaryData[i].reason = somedata
          this.BoundaryData[i].alarmStatus = 7
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.headStyle {
  margin-top: 30px;
  margin-bottom: 20px;
}
.twoHeadStyle {
  margin-top: 20px;
  margin-bottom: 20px;
}
.clickStyle {
  color: blue;
  cursor: pointer;
}
</style>
<style lang="less">
.boundaryAlarm {
  .el-table > .el-table__body-wrapper {
    overflow-x: hidden !important;
  }
}
.select_box {
  max-height: 160px;
  overflow-y: auto;
}
</style>