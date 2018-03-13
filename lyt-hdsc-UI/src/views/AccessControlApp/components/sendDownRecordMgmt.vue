<template>
  <div>
		<template>
      <el-form :inline="true" :model="queryForm" ref="queryForm">
         <el-form-item label="姓名" prop="name">
          <el-input placeholder="请输入姓名" v-model="queryForm.name" clearable></el-input>
        </el-form-item>
        <el-form-item label="证件号码" prop="idenNum">
          <el-input placeholder="请输入证件号码" v-model="queryForm.idenNum" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备编号" prop="deviceCode">
          <el-input placeholder="请输入父或子设备编号" v-model="queryForm.deviceCode" clearable></el-input>
        </el-form-item>
        <el-form-item label="子设备名称" prop="subDeviceName">
          <el-input placeholder="请输入子设备名称" v-model="queryForm.subDeviceName" clearable></el-input>
        </el-form-item>
        <el-form-item label="凭证编号" prop="credenceNo">
          <el-input placeholder="请输入凭证编号" v-model="queryForm.credenceNo" clearable></el-input>
        </el-form-item>
        <el-form-item label="下发状态" prop="status">
          <el-select v-model="queryForm.status">
            <el-option v-for="item in statusOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetForm('queryForm')">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="handleBatchDelete()" :disabled="this.sels.length === 0">批量删除</el-button>
        </el-form-item>
      </el-form>
		</template>
    <!-- 表格渲染 -->
		<el-table ref="tableData" max-height="700" :data="tableData" highlight-current-row @selection-change="handleSelsChange">
			<el-table-column type="selection" prop="messageId"></el-table-column>
			<el-table-column prop="name" label="姓名" width="100"></el-table-column>
			<el-table-column prop="userType" label="人员类型" width="80"></el-table-column>
			<el-table-column prop="idenType" label="证件类型" width="90"></el-table-column>
			<el-table-column prop="idenNum" label="证件号"></el-table-column>
			<el-table-column prop="deviceCode" label="父设备编号" width="190"></el-table-column>
      <el-table-column prop="subDeviceCode" label="子设备编号" width="190"></el-table-column>
			<el-table-column prop="subDeviceName" label="子设备名称" width="120"></el-table-column>
			<el-table-column prop="credenceType" label="凭证类型" width="120" :formatter="formatCredenceType"></el-table-column>
			<el-table-column prop="credenceNo" label="凭证编号" width="310"></el-table-column>
			<el-table-column prop="status" label="下发状态" :formatter="formatStatus" width="80"></el-table-column>
			<el-table-column prop="failReason" label="失败原因"></el-table-column>
      <el-table-column label="操作" header-align="center" align="center">
        <template slot-scope="scope" style="width:100px">
          <el-button size="medium" type="text" @click="handleResend(scope.$index,scope.row)" :disabled="scope.row.sendDownVisible">重发</el-button>
          <el-button size="medium" type="text" @click="handleDeleteRecord(scope.$index,scope.row)">删除</el-button>
        </template>
      </el-table-column>
		</el-table>

  <el-row class="page-row">
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </el-row>

  </div>
</template>

<script>
import { listSendDownRecords, deleteRecord, resend, batchDelete } from '@/views/AccessControlApp/apis'
// 凭证类型map
const credenceTypeMap = {
  1: 'ID卡',
  2: 'IC卡（TypeA）',
  3: 'ID卡（TypeB）',
  4: 'CPU卡',
  5: '车牌',
  6: '指纹',
  7: '人脸',
  8: '纸票/二维码',
  9: '蓝牙',
  10: '密码'
}
export default {
  data () {
    return {
      tableData: [],
      statusOpt: [{'value': undefined, 'label': '全部'}, {'value': 0, 'label': '成功'}, {'value': 1, 'label': '失败'}],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      sels: [],
      queryForm: {
        idenNum: undefined,
        deviceCode: undefined,
        subDeviceName: undefined,
        credenceNo: undefined,
        status: 1,
        name: undefined
      }
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    loadData () {
      this.queryForm.currentPage = this.currentPage
      this.queryForm.pageSize = this.pageSize
      listSendDownRecords(JSON.stringify(this.queryForm))
      .then(res => {
        this.total = res.data.total
        this.tableData = res.data.data
        if (this.tableData !== null && this.tableData.length > 0) {
          for (let data of this.tableData) {
            data.sendDownVisible = false
            if (data.status === 0) {
              data.sendDownVisible = true
            }
            if (data.credenceType === 7) {
              data.credenceNo = 'http://192.168.0.246:8888/' + data.credenceNo
            }
          }
        }
      })
    },
    handleSearch () {
      this.loadData()
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    // 跳转页数
    handleCurrentChange (val) {
      this.currentPage = val
      this.loadData(this.queryForm)
    },
    // 改变分页大小
    handleSizeChange (val) {
      this.pageSize = val
      this.loadData(this.queryForm)
    },
    // 格式化凭证类型
    formatCredenceType (row, column, cellValue) {
      return credenceTypeMap[cellValue]
    },
    formatStatus (row, column, cellValue) {
      if (cellValue === 0) {
        return '成功'
      } else {
        return '失败'
      }
    },
    handleDeleteRecord (index, row) {
      this.$confirm('确定要删除该条下发记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRecord(row.messageId)
        .then(res => {
          if (res.errorcode === '00000') {
            this.$message({
              type: 'success',
              message: '删除成功！'
            })
            this.loadData()
          } else {
            this.$message({
              type: 'warning',
              message: '删除失败' + res.errormsg
            })
          }
        })
      })
    },
    handleResend (row) {
      resend(row.messageId)
      .then(res => {
        if (res.errorcode === '00000') {
          this.$message({
            type: 'success',
            message: '操作成功，稍后更新下发状态！'
          })
          this.loadData()
        } else {
          this.$message({
            type: 'error',
            message: '重发失败，请稍后再试！' + res.errormsg
          })
        }
      })
    },
    handleSelsChange (sels) {
      this.sels = []
      for (let sel of sels) {
        this.sels.push(sel.messageId)
      }
    },
    handleBatchDelete (row) {
      this.$confirm('确定要删除选中的下发记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchDelete(this.sels)
        .then(res => {
          if (res.errorcode === '00000') {
            this.$message({
              type: 'success',
              message: '删除成功！'
            })
            this.loadData()
          } else {
            this.$message({
              type: 'error',
              message: '删除失败，请稍后再试！' + res.errormsg
            })
          }
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-input {
    width: 200px
  }
  .el-select {
    width: 150px
  }
  .page-row {
    text-align: right;
    margin-top: 5px
  }
</style>
