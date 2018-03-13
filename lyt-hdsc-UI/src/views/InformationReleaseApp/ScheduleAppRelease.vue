<template>
  <div class="schedule-app-release">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" ref="filters">
        <el-form-item label="日程名称" prop="name" class="item-spacing">
          <el-input style="width:180px" v-model.trim="filters.name" placeholder="字符长度不能超过32个" :maxlength="32"></el-input>
        </el-form-item>
        <el-form-item label="信息屏名称" prop="screenName" class="item-spacing">
          <el-input style="width:180px" v-model.trim="filters.screenName" placeholder="字符长度不能超过32个" :maxlength="32"></el-input>
        </el-form-item>
        <el-form-item label="发布人" prop="creater" class="item-spacing">
          <el-input style="width:180px" v-model.trim="filters.creater" placeholder="字符长度不能超过32个" :maxlength="32"></el-input>
        </el-form-item>
        <el-form-item label="发布状态" prop="publishState">
          <el-select style="width:180px" v-model="filters.publishState" placeholder="请选择发布状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="发布成功" value="publishSuccess"></el-option>
            <el-option label="发布中" value="publishing"></el-option>
            <el-option label="发布失败" value="publishFailed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime" style="display:block">
          <el-date-picker v-model="filters.createTime" :editable='false' value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="display:block">
          <el-button type="primary" v-on:click="queryData">查询</el-button>
          <el-button type="primary" @click="resetForm('filters')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-table :data="data" border style="width: 100%">
      <el-table-column type="index" label="序号" width="100">
      </el-table-column>
      <el-table-column prop="scheduleName" label="日程名称" width="200">
      </el-table-column>
      <el-table-column prop="deviceName" label="信息屏名称">
        <template slot-scope="props">
          <p v-for="(item,index) in props.row.deviceName" :key="index">
            {{item}}
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="deviceAddress" label="发布位置">
        <template slot-scope="props">
          <p style="min-height:23px" v-for="(it,index) in props.row.deviceAddress" :key="index">
            {{it}}
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="createUser" label="发布人">
      </el-table-column>
      <el-table-column prop="publishState" label="发布状态">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
      </el-table-column>
    </el-table>
    <div class='page-bar' v-show="data&&data.length">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="pageData.pageNo" :page-sizes="[10]" :page-size="pageData.pageSize" layout=" total, sizes,prev, pager, next, jumper" :total="pageData.total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import { postScheduleReleasesQueriesData } from './apis/index'
export default {
  name: 'material',
  data () {
    return {
      filters: {
        name: '',
        screenName: '',
        creater: '',
        publishState: '',
        createTime: ''
      },
      data: [],
      pageData: {
        pageSize: 10,
        pageNo: 1,
        total: 0
      }
    }
  },
  mounted () {
    this.queryData()
  },
  methods: {
    // 加载素材列表//查询按钮
    queryData () {
      if (this.filters.createTime === null) {
        this.filters.createTime = ''
      }
      let param = {
        pageSize: this.pageData.pageSize,
        pageNo: this.pageData.pageNo,
        scheduleName: this.filters.name,
        createUser: this.filters.creater,
        startTime: this.filters.createTime[0],
        endTime: this.filters.createTime[1],
        deviceName: this.filters.screenName,
        publishState: this.filters.publishState
      }
      postScheduleReleasesQueriesData(param).then(res => {
        if (res.data.code === '00000') {
          if (res.data.data.data && res.data.data.data.length) {
            res.data.data.data.forEach(el => {
              if (el.deviceName) {
                el.deviceName = el.deviceName.split(',')
              }
              if (el.deviceAddress) {
                el.deviceAddress = el.deviceAddress.split(',')
              }
            })
            this.data = res.data.data.data
            this.pageData.total = res.data.data.total
          } else {
            this.data = []
            this.pageData.total = 0
            // this.$message({
            //   showClose: true,
            //   message: '暂无数据',
            //   type: 'error'
            // })
          }
        } else {
          this.data = []
          this.pageData.total = 0
          this.$message({
            showClose: true,
            message: '数据加载失败',
            type: 'error'
          })
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 重置按钮
    resetForm (formNameadd) {
      this.$refs['filters'].resetFields()
      this.queryData()
    },
    // pageSize 改变时会触发
    handleSizeChange (val) {
      this.pageData.pageSize = val
      this.queryData()
    },
    // currentPage 改变时会触发
    handleCurrentChange (val) {
      this.pageData.pageNo = val
      this.queryData()
    }
  }
}
</script>
<style scoped>
.page-bar {
  margin-top: 10px;
  text-align: center;
}
.item-spacing {
  margin-right: 60px;
}
</style>
<style lang="less">
.schedule-app-release {
  input:-ms-input-placeholder.el-input__inner {
    color: #c0c4cc;
  }
  .el-date-editor :-ms-input-placeholder.el-range-input {
    color: #c0c4cc;
  }
  .el-table__body-wrapper {
    overflow: hidden;
  }
}
</style>
