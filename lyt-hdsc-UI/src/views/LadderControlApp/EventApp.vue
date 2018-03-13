<template>
  <div>
    <div class="event-app">
      <div class="event-form">
        <el-form ref="eventForm" class="el-form" :model="eventForm" label-width="80px">
          <el-row>
            <el-form-item label="事件类型" prop="eventType" class="form-item">
              <el-select v-model="eventForm.eventType" placeholder="请选择事件类型" @change="doChange" class="item">
                <el-option label="刷卡事件" :value="3">刷卡事件</el-option>
                <el-option label="呼梯事件" :value="4">呼梯事件</el-option>
                <el-option label="异常事件" :value="5">异常事件</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="卡号" prop="cardId" class="form-item">
              <el-input v-model.trim="eventForm.cardId" :disabled="isdisabled" class="item" :maxlength="32" placeholder="输入内容不能超过32个字符"></el-input>
            </el-form-item>
            <el-form-item label="持卡人" prop="holderName" class="form-item">
              <el-input v-model.trim="eventForm.holderName" :disabled="holderDisabled" placeholder="输入内容不能超过20个字符" :maxlength="20" class="item"></el-input>
            </el-form-item>
            <el-form-item class="form-item">
              <el-button type="primary " @click.stop="submitForm('eventForm')">查询</el-button>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="梯控设备" prop="machineName" class="form-item">
              <el-input v-model.trim="eventForm.machineName" class="item" placeholder="输入内容不能超过20个字符" :maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="开始时间 " prop="createTime" class="form-item">
              <el-date-picker v-model="eventForm.createTime" :editable="false" type="datetime" placeholder="选择开始时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间 " prop="stopTime" class="form-item">
              <el-date-picker v-model="eventForm.stopTime" :editable="false" type="datetime" placeholder="选择结束时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item class="form-item">
              <el-button type="primary" @click="resetForm('eventForm')">重置</el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </div>
      <el-table class="event-table" :data="tableData" tooltip-effect="light" border>
        <el-table-column type="index" label="序号" width="50" :resizable="false" align="center">
        </el-table-column>
        <el-table-column prop="eventType" label="事件类型" width="120" :resizable="false" :formatter="formatEventType" align="center">
        </el-table-column>
        <el-table-column prop="createTime" label="开始时间" :resizable="false" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="stopTime" v-if="eventForm.eventType===4" label="结束时间" :resizable="false" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="cardId" v-if="eventForm.eventType===3" label="卡号" :resizable="false" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="holderName" v-if="eventForm.eventType===3 || eventForm.eventType===4 " label="持卡人" :resizable="false" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="machineName" label="梯控设备名称" :resizable="false" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="entranceName" v-if="eventForm.eventType===4" label="门禁设备名称" :resizable="false" show-overflow-tooltip align="center">
        </el-table-column>
      </el-table>
      <div class='event-pagination' v-show="tableData && tableData.length">
        <el-pagination class="el-page" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="pageNo" :page-sizes="[10, 15, 30, 50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import { postLadderLogData } from './apis/index'
const ERROK = '00000'
export default {
  data () {
    return {
      tableData: [],
      eventForm: {
        eventType: 3,
        cardId: '',
        holderName: '',
        machineName: '',
        createTime: '',
        stopTime: ''
      },
      options: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      isdisabled: false,
      holderDisabled: false
    }
  },
  mounted () {
    this.queryList()
  },
  methods: {
    // 获取权限事件数据
    queryList () {
      postLadderLogData({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        eventType: this.eventForm.eventType,
        cardId: this.eventForm.cardId,
        holderName: this.eventForm.holderName,
        machineName: this.eventForm.machineName,
        startTime: this.eventForm.createTime,
        endTime: this.eventForm.stopTime
      })
        .then(res => {
          // 判断结果是否不为空
          if (res.data.code === ERROK) {
            if (res.data.data.ladderEventLogVos && res.data.data.ladderEventLogVos.length) {
              this.tableData = res.data.data.ladderEventLogVos
              this.total = res.data.data.totalCount
            } else {
              this.tableData = []
              this.total = 0
              this.$message({
                message: '暂无数据',
                type: 'info'
              })
            }
          } else {
            this.$message({
              message: res.data.message ? res.data.message : '请求数据失败',
              type: 'error'
            })
            this.tableData = []
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    // 选择异常事件禁止卡号输入并且清空
    doChange () {
      if (this.eventForm.eventType === 5) {
        this.eventForm.cardId = ''
        this.eventForm.holderName = ''
        this.isdisabled = true
        this.holderDisabled = true
      } else if (this.eventForm.eventType === 4) {
        this.eventForm.cardId = ''
        this.isdisabled = true
        this.holderDisabled = false
      } else {
        this.isdisabled = false
        this.holderDisabled = false
      }
      this.tableData = []
      this.pageNo = 1
      this.queryList()
    },
    // 搜索
    submitForm (formName) {
      if (this.eventForm.stopTime && (this.eventForm.createTime > this.eventForm.stopTime)) {
        this.eventForm.stopTime = ''
        this.$message({
          message: '开始时间不能大于结束时间',
          type: 'warning'
        })
      } else if (this.eventForm.machineName.trim().length > 20) {
        this.$message({
          message: '输入梯控设备不能超多20个字符',
          type: 'warning'
        })
      } else if (this.eventForm.machineName.trim() && !/^[\u4e00-\u9fa5_a-zA-Z0-9\s]+$/.test(this.eventForm.machineName.trim())) {
        this.$message({
          message: '输入梯控设备只能为中文、英文、数字和下划线',
          type: 'warning'
        })
      } else if (this.eventForm.cardId.trim().length > 32) {
        this.$message({
          message: '输入的卡号不能超多32个字符',
          type: 'warning'
        })
      } else if (this.eventForm.cardId.trim() && !/^[0-9a-zA-Z]+$/.test(this.eventForm.cardId.trim())) {
        this.$message({
          message: '输入的卡号只能是英文和数字',
          type: 'warning'
        })
      } else if (this.eventForm.holderName.trim() && !/^[\u4e00-\u9fa50-9A-Za-z]+$/.test(this.eventForm.holderName.trim())) {
        this.$message({
          message: '输入持卡人只能为中文、英文和数字',
          type: 'warning'
        })
      } else {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.pageNo = 1
            this.queryList()
          } else {
            return false
          }
        })
      }
    },
    // 事件类型显示转化
    formatEventType (row, column) {
      return row.eventType === 3 ? '刷卡事件' : row.eventType === 4 ? '呼梯事件' : '异常事件'
    },
    // 重置
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.tableData = []
      this.eventForm.cardId = ''
      this.eventForm.machineName = ''
      this.eventForm.createTime = ''
      this.eventForm.stopTime = ''
      this.pageNo = 1
      this.pageSize = 10
      this.queryList()
    },
    // 通过每页的条数向后端获取数据
    handleSizeChange (val) {
      this.pageSize = val
      this.queryList()
    },
    // 显示当前页数
    handleCurrentChange (val) {
      this.pageNo = val
      this.queryList()
    }
  }
}
</script>
<style lang="less" scoped>
.event-app {
  .event-form {
    width: 100%;
    height: 100%;
    margin-top: 30px;
    .el-form {
      overflow: hidden;
    }
    .form-item {
      float: left;
      width: 25%;
    }
    .item {
      width: 220px;
    }
  }
  .event-table {
    width: 100%;
  }
  .event-pagination {
    margin-top: 20px;
    .el-page {
      text-align: center;
    }
  }
}
</style>
<style lang="less">
.event-app {
  input:-ms-input-placeholder.el-input__inner {
    color: #c0c4cc;
  }
  .el-table__body-wrapper {
    overflow-x: hidden;
  }
}
</style>


