<template>
  <div class="HistoryTask">
    <div class="HistoryTask-one">
      <el-form label-width="80px " class="form-one">
        <el-form-item label="路线 ">
          <el-select placeholder="请选择巡查路线" v-model="paramName" @change='getValue'>
            <el-option v-for="item in partolParams" :key="item.uuid" :label="item.paramName" :value="item.uuid"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form label-width="80px " class="form-two">
        <el-form-item label="结果 ">
          <el-select v-model="detailInfo.taskStatus" placeholder="请选择结果">
            <el-option label="正常" value="0"></el-option>
            <el-option label="异常" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" class="button-one" @click="queryList">查询</el-button>
    </div>
    <div class="HistoryTask-two">
      <el-form label-width="80px " class="form-three">
        <el-form-item label="保安">
          <el-select v-model="userId" placeholder="请选择保安" @focus="securityFoucus">
            <el-option v-for="item in securityList" :key="item.uuid" :label="item.name" :value="item.uuid">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form label-width="120px " class="form-four">
        <el-form-item label="开始时间 从  ">
          <el-date-picker v-model="beginDate" value-format="yyyy-MM-dd" type="date" :placeholder='staticData' :editable="false" @change="getBegintTime">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <el-form label-width="40px " class="form-five">
        <el-form-item label="到 ">
          <el-date-picker v-model="endDate" value-format="yyyy-MM-dd" align="right" type="date" :placeholder="staticData" :editable="false" @change="getEndTime">
          </el-date-picker>
        </el-form-item>
      </el-form>    
      <el-button type="primary" class="button-two" @click="resetPerson">重置</el-button>
    </div>
    <div class="HistoryTask-three">
      <el-table ref="multipleTable" :data="data" tooltip-effect="dark" class="table" :border="true">
        <el-table-column type="index" prop="date" label="序号" width="120" align="center">
        </el-table-column>
        <el-table-column prop="startTime" label="计划开始时间" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="patrolParam.paramName" label="路线" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="deviceName" label="设备" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="username" label="保安" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column label="结果" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <span :class="getChangeColor(scope.$index, scope.row)" @click="CheckResult(scope.$index,scope.row)" style=" cursor:pointer">
              {{formatStatus(scope.$index, scope.row)}}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class='pages-crew' v-show="data.length">
      <el-pagination small @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageData.pageNo" :page-sizes="[10, 20, 30]" :page-size="pageData.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="pageData.total">
      </el-pagination>
    </div>
    <CheckResultStatus :show="showaddDialog" :selectMessege="propData" :dialogtext="dialogtext" @closePlan='closePlan'></CheckResultStatus>
  </div>
</template>
<script>
import { getTaskPlanData, getPatrolPiontIdData, getSecurityData } from './apis/planChannel'
import CheckResultStatus from './components/dialogs/CheckResultStatus'
export default {
  components: { CheckResultStatus },
  data () {
    return {
      staticData: 'staticData',
      propData: {},
      optionValue: '',
      paramName: '',
      data: [],
      abnormalReason: '',
      showaddDialog: false,
      options: [{
        ParamsId: '选项1',
        label: '正常'
      }, {
        ParamsId: '选项2',
        label: '异常'
      }],
      value: '',
      pageData: {
        pageSize: 10,
        pageNo: 1,
        total: 0
      },
      dialogtext: {
      },
      userId: '',
      beginDate: new Date(),
      endDate: new Date(),
      deviceName: '',
      detailInfo: {
        taskStatus: ''
      },
      startTime: '',
      paramId: '',
      securityList: [],
      pointList: [],
      partolParams: []
    }
  },
  updated () {
    this.staticData = '选择日期'
  },
  mounted () {
    this.queryList()
    this.pointId()
  },
  methods: {
    getValue (value) {
      this.optionValue = value
      this.partolParams.forEach(value => {
        // 获取巡查参数的时间段
        if (this.optionValue === value.uuid) {
          this.timeLong = value.timeLong
        }
      })
    },
    // 结束时间不能小于开始时间，请重新选择
    getBegintTime (value) {
      if (this.endDate && new Date(this.endDate) < new Date(value)) {
        this.$message({
          message: '开始时间不能大于结束时间，请重新选择',
          type: 'warning'
        })
        this.endDate = ''
      }
    },
    // 开始时间不能大于结束时间，请重新选择
    getEndTime (value) {
      console.log('beginDate:', this.beginDate)
      if (this.beginDate && new Date(this.beginDate) > new Date(value)) {
        this.$message({
          message: '开始时间不能大于结束时间，请重新选择',
          type: 'warning'
        })
        this.beginDate = ''
      }
    },
    // 查询
    queryList () {
      if (this.beginDate > this.endDate) {
        this.$message({
          message: '开始时间不能大于结束时间',
          type: 'warning'
        })
        this.endDate = ''
      }
      let params = {
        'pageNo': this.pageData.pageNo,
        'pageSize': this.pageData.pageSize,
        'carryStatus': this.detailInfo.taskStatus,
        'planName': this.planName,
        'beginDate': this.beginDate,
        'endDate': this.endDate,
        'paramId': this.paramName,
        'username': this.username,
        'userId': this.userId
      }
      // 获取排班信息
      getTaskPlanData(params).then(rs => {
        if (rs.data.code === '00000') {
          this.data = rs.data.data.rows
          this.pageData.total = rs.data.data.total
        } else {
          this.data = []
        }
      })
    },
    // 重置
    resetPerson () {
      this.pageData.pageNo = 1
      this.paramName = ''
      this.detailInfo.taskStatus = ''
      this.beginDate = ''
      this.endDate = ''
      this.name = ''
      this.userId = ''
      this.staticData = '选择日期'
    },
    // 保安
    securityFoucus () {
      getSecurityData().then(res => {
        this.securityList = res.data.data
      })
    },
    // 巡查点参数
    pointId () {
      let params = {
        'paramName': ''
      }
      getPatrolPiontIdData(params).then(res => {
        if (res.data.code === '00000') {
          this.partolParams = res.data.data
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 后台数据对应显示对应汉字
    formatStatus (index, row) {
      let statusText = ['正常', '异常']
      return statusText[parseInt(row.carryStatus)]
    },
    // 巡查结果条件内的变色
    getChangeColor (index, row) { // row, column, rowIndex, columnIndex
      let status = row.carryStatus
      if (status === '1') {
        return 'clickStyle'
      }
    },
    // 巡查结果
    CheckResult (index, row) {
      let tempObj = {}
      tempObj.uuid = row.uuid
      tempObj.abnormalReason = row.abnormalReason ? row.abnormalReason : ''
      tempObj.carryStatus = row.carryStatus
      this.propData = tempObj
      this.dialogtext = ''
      this.showaddDialog = true
    },
    closePlan () {
      this.showaddDialog = false
    },
    handleSizeChange (val) {
      this.pageData.pageSize = val
      this.queryList()
    },
    handleCurrentChange (val) {
      this.pageData.pageNo = val
      this.queryList()
    },
    showstate (mstate) {
    },
    updated () {
    }
  }
}
</script>

<style scoped lang='less'>
.HistoryTask {
  margin-left: 50px;
  margin-top: 20px;
  padding-bottom: 30px;
  .form-one {
    display: inline-block;
    margin-left: 2.5%;
    margin-right: 7%;
  }
  .form-two {
    display: inline-block;
    margin-right: 20%;
  }
  .form-three {
    display: inline-block;
    margin-left: 2.5%;
    margin-right: 4.5%;
  }
  .form-four {
    display: inline-block;
  }
  .form-five {
    display: inline-block;
    margin-right: 2.5%;
  }
  .HistoryTask-two {
    padding-bottom: 1%;
  }
  .HistoryTask-three {
    margin-top: 1%;
  }
  .pages-crew {
    text-align: center;
    padding-top: 1%;
  }
  .button-one {
    margin-right: 3%;
  }
  .clickStyle {
    color: red;
  }
}
</style>
<style lang='less'>
.HistoryTask {
  .el-table__body-wrapper {
    overflow-x: hidden;
  }
}
@import url("./assets/css/common.less");
</style>

