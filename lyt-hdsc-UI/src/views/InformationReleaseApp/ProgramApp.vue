<template>

  <div class="program-app">
    <div class="add-button">
      <el-button @click="onShowAdd" type="primary">添加节目</el-button>
      <el-button @click="onBatchDelete" type="danger">批量删除节目</el-button>
    </div>
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" ref="filters">
        <el-form-item label="节目名称" prop="name">
          <el-input v-model.trim="filters.name" placeholder="字符长度不能超过32个" :maxlength="32"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select clearable v-model="filters.state" placeholder="请选择状态">
            <el-option label="添加成功" value="0"></el-option>
            <el-option label="添加中" value="1"></el-option>
            <el-option label="修改成功" value="2"></el-option>
            <el-option label="修改中" value="3"></el-option>
            <el-option label="删除失败" value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker v-model="filters.createTime" :editable='false' value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="创建人" prop="creater">
          <el-input v-model.trim="filters.creater" placeholder="字符长度不能超过32个" :maxlength="32"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="addtionMaterial">查询</el-button>
          <el-button type="primary" @click="resetForm('filters')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <div class="content">
      <el-table :data="data" border style="width: 100%" @selection-change="onHandleSelectionChange">
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column type="index" label="序号" width="100">
        </el-table-column>
        <el-table-column prop="programName" label="节目名称">
        </el-table-column>
        <el-table-column prop="playTime" label="播放时间(单位/秒)">
        </el-table-column>
        <el-table-column prop="status" label="状态">
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间">
        </el-table-column>
        <el-table-column prop="createUser" label="创建人">
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="editorProgram(scope.$index,scope.row)" size="small">编辑</el-button>
            <el-button type="text" @click="delProgram(scope.$index,scope.row)" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-bar" v-show="data&&data.length">
        <el-pagination style="text-align:center;margin-top:15px" small @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[10]" :current-page.sync="pageData.pageNo" :page-size="pageData.pageSize" layout="total, sizes,prev, pager, next, jumper" :total="pageData.total">
        </el-pagination>
      </div>
    </div>
    <add :show="showaddDialog" :senMessage="fatherId" @showstate='showstate' @closeDialog="closeDialog" :isAdd="isAdd"></add>
  </div>
</template>
<script>
import { postPagingQueryData, getItemDeleteData, postItemBatchDeleteData } from './apis/index'// programList//pagingquery
import add from './dialogs/Add'
export default {
  name: 'material',
  components: { add },
  data () {
    return {
      elementObject: '',
      deletes: [],
      fatherId: '',
      filters: {
        name: '',
        state: '',
        createTime: '',
        creater: ''
      },
      data: [],
      showaddDialog: false,
      pageData: {
        pageSize: 10,
        pageNo: 1,
        total: 0
      },
      isAdd: false
    }
  },
  mounted () {
    this.addtionMaterial()
  },
  methods: {
    // 加载节目菜单//查询按钮
    addtionMaterial () {
      if (this.filters.createTime === null) {
        this.filters.createTime = ''
      }
      let param = {
        itemName: this.filters.name,
        pageNo: this.pageData.pageNo,
        pageSize: this.pageData.pageSize,
        startTime: this.filters.createTime[0],
        endTime: this.filters.createTime[1],
        creater: this.filters.creater,
        status: this.filters.state
      }
      postPagingQueryData(param).then(rs => {
        if (rs.data.code === '00000') {
          if (rs.data.data.data && rs.data.data.data.length) {
            this.data = rs.data.data.data
            this.pageData.total = rs.data.data.total
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
      })
        .catch(err => {
          console.log(err)
        })
    },
    // 重置按钮
    resetForm (formNameadd) {
      this.$refs['filters'].resetFields()
      this.addtionMaterial()
    },
    // 删除单个节目
    delProgram (index, rowData) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        getItemDeleteData({ id: rowData.id }).then(rs => {
          if (rs.data.code === '00000') {
            this.addtionMaterial()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          } else {
            this.$message({
              type: 'error',
              message: rs.data.message ? rs.data.message : '删除失败!'
            })
          }
        }).catch(() => {
        })
      }).catch(() => {
      })
    },
    // 编辑节目
    editorProgram (index, row) {
      this.fatherId = row.id
      this.showaddDialog = true
      this.isAdd = false
    },
    // 添加节目触发弹窗
    onShowAdd () {
      this.showaddDialog = true
      this.isAdd = true
    },
    // 关闭节目屏幕配置页
    closeDialog () {
      this.showaddDialog = false
      this.fatherId = ''
    },
    // pageSize 改变时会触发
    handleSizeChange (val) {
      this.addtionMaterial()
      this.pageData.pageSize = val
    },
    // currentPage 改变时会触发
    handleCurrentChange (val) {
      this.addtionMaterial()
      this.pageData.pageNo = val
    },
    // 关闭节目屏幕配置页并刷新节目管理页列表
    showstate (mstate) {
      this.filters.name = ''
      this.filters.creater = ''
      this.filters.createTime = ''
      this.pageData.pageNo = 1
      this.addtionMaterial()
    },
    // 选中列表里的所有文件
    onHandleSelectionChange (val) {
      this.deletes = []
      val.forEach((element, index) => {
        this.deletes.push(element.id)
      })
    },
    // 批量删除节目
    onBatchDelete () {
      if (this.deletes.length === 0) {
        this.$message({
          type: 'error',
          message: '您还没有选中需要删除的节目内容!'
        })
      } else {
        this.$confirm('批量选中的数据将作永久删除，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          postItemBatchDeleteData({ ids: this.deletes }).then(rs => {
            if (rs.data.code === '00000') {
              this.addtionMaterial()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'error',
                message: rs.data.message ? rs.data.message : '删除失败!'
              })
            }
          })
            .catch(err => {
              console.log(err)
            })
        }).catch(() => {
        })
      }
    }
  },
  updated () {
  }
}
</script>
<style scoped>
.add-button {
  margin-bottom: 20px;
}
</style>
<style lang="less">
.program-app {
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
