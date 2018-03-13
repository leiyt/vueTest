<template>
  <div class="auth">
    <el-form ref="authForm" :model="authForm" label-width="80px">
      <el-form-item class="auth-btn">
        <template slot-scope="scope">
          <el-button type="primary" @click.native.prevent="authAddClick">添加权限</el-button>
          <el-button type="primary" @click="deletePermisson(data)">删除权限</el-button>
          <el-button type="primary" @click="downloadAuth(data)">权限下载</el-button>
        </template>
      </el-form-item>
      <div class="auth-form">
        <el-row>
          <el-form-item label="姓名" class="search-item" prop="personName">
            <el-input v-model.trim="authForm.personName" class="item" placeholder="输入内容不能超过20个字符" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="梯控设备" class="search-item" prop="elevatorName">
            <el-input v-model.trim="authForm.elevatorName" class="item" placeholder="输入内容不能超过20个字符" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="卡号" class="search-item" prop="cardId">
            <el-input v-model.trim="authForm.cardId" class="item" :maxlength="32" placeholder="输入内容不能超过32个字符"></el-input>
          </el-form-item>
          <el-form-item class="search-item">
            <el-button type="primary" @click="searchAuth">查询</el-button>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="状态" class="search-item" prop="status">
            <el-select v-model="authForm.status" placeholder="请选择状态" class="item">
              <el-option label="全部" :value="3">全部</el-option>
              <el-option label="未下载" :value="0">未下载</el-option>
              <el-option label="已下载" :value="1">已下载</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" class="search-item" style="width:50%">
            <el-date-picker v-model="authForm.createTime" :editable='false' value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item class="search-item">
            <el-button type="primary" @click="resetAuthForm('authForm')">重置</el-button>
          </el-form-item>
        </el-row>
      </div>
    </el-form>
    <el-table :data="data" :border="true" class="auth-table" tooltip-effect="light" @selection-change="handleSelectionChange" ref="hasSelected">
      <el-table-column type="selection" width="55" :resizable="false" align="center">
      </el-table-column>
      <el-table-column type="index" label="序号" :resizable="false" width="80" align="center"></el-table-column>
      <el-table-column prop="personName" :resizable="false" label="姓名" show-overflow-tooltip width="100" align="center"></el-table-column>
      <el-table-column prop="elevatorName" :resizable="false" label="电梯" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="floorNo" :resizable="false" label="关联楼层号" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="cardId" :resizable="false" label="卡号" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="startTime" :resizable="false" label="开始时间" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="expireTime" :resizable="false" label="结束时间" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="createTime" :resizable="false" label="创建时间" show-overflow-tooltip align="center"></el-table-column>
      <el-table-column prop="creator" :resizable="false" label="创建人" width="100" align="center"></el-table-column>
      <el-table-column prop="statues" :resizable="false" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-col v-if="scope.row.statues ===0">未下载</el-col>
          <el-col v-else class="down">已下载</el-col>
        </template>
      </el-table-column>
      <el-table-column prop="modify" :resizable="false" label="操作" width="100" align="center">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="auth-pagination" v-show="data&&data.length">
      <el-pagination small @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageData.currentPage" :page-sizes="[10, 15, 30, 50]" :page-size="pageData.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="pageData.totalCount">
      </el-pagination>
    </div>
    <add-permissions :modifyMessege="modifyMessege" :show="showDialog" @addpermissions="closePermission" @closeDialog="closeDialog"></add-permissions>
  </div>
</template>
<script>
import AddPermissions from './component/AddPermissions'
import { postAuthTableData, postDownloadAuthData, PostDeletePermissionsData } from './apis/index'
const ERROK = '00000'
export default {
  components: {
    AddPermissions
  },
  data () {
    return {
      data: [],
      hasSelected: [],
      modifyMessege: '',
      id: [],
      downloadId: [],
      authForm: {
        personName: '',
        elevatorName: '',
        cardId: '',
        status: 3,
        createTime: []
      },
      pageData: {
        pageSize: 10,
        currentPage: 1,
        totalCount: 0
      },
      showDialog: false
    }
  },
  mounted () {
    this.addtionAuth()
  },
  methods: {
    // 获取权限数据
    addtionAuth () {
      postAuthTableData({
        personName: this.authForm.personName ? this.authForm.personName : '',
        elevatorName: this.authForm.elevatorName ? this.authForm.elevatorName : '',
        cardId: this.authForm.cardId ? this.authForm.cardId : '',
        startTime: (this.authForm.createTime && this.authForm.createTime.length > 0) ? this.authForm.createTime[0] : '',
        endTime: (this.authForm.createTime && this.authForm.createTime.length > 0) ? this.authForm.createTime[1] : '',
        status: this.authForm.status === 3 ? '' : this.authForm.status,
        currentPage: this.pageData.currentPage,
        pageSize: this.pageData.pageSize
      }).then((res) => {
        if (res.data.code === ERROK) {
          if (res.data.data.permissionList && res.data.data.permissionList.length) {
            this.pageData.totalCount = res.data.data.totalCount
            this.data = res.data.data.permissionList
          } else {
            this.pageData.totalCount = 0
            this.data = []
            this.$message({
              message: '暂无数据',
              type: 'info'
            })
          }
        } else {
          this.data = []
          this.$message({
            message: res.data.message ? res.data.message : '请求数据失败',
            type: 'error'
          })
        }
      })
        .catch(err => {
          console.log(err)
        })
    },
    // 修改
    handleClick (row) {
      this.modifyMessege = row.id
      this.showDialog = true
    },
    // 删除权限
    deletePermisson (rows) {
      if (this.hasSelected && this.hasSelected.length) {
        this.$confirm('确定删除该权限吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.hasSelected.forEach((select, index) => {
            this.id.push(select.id)
          })
          PostDeletePermissionsData({
            ids: this.id.join(',')
          }).then((res) => {
            if (res.data.code === ERROK) {
              this.hasSelected = []
              this.id = []
              this.addtionAuth()
              this.$refs.hasSelected.clearSelection()
              this.$message({
                message: '删除成功',
                type: 'success'
              })
            } else {
              this.$refs.hasSelected.clearSelection()
              this.hasSelected = []
              this.id = []
              this.$message({
                message: res.data.message ? res.data.message : '删除失败',
                type: 'error'
              })
            }
          }).catch(err => {
            console.log(err)
          })
        }).catch(() => {
          this.$message({
            type: 'warning',
            message: '已取消删除'
          })
        })
      } else {
        this.$message({
          message: '您还没选中删除权限',
          type: 'warning'
        })
      }
    },
    // 关闭窗口
    closePermission (removeData) {
      this.showDialog = false
      this.modifyMessege = ''
      this.authForm.personName = ''
      this.authForm.elevatorName = ''
      this.authForm.createTime = []
      this.authForm.cardId = ''
      this.authForm.status = 3
      this.pageData.currentPage = 1
      this.addtionAuth()
    },
    // 通过每页的条数向后端获取数据
    handleSizeChange (val) {
      this.pageData.pageSize = val
      this.addtionAuth()
    },
    // 显示当前页数
    handleCurrentChange (val) {
      this.pageData.currentPage = val
      this.addtionAuth()
    },
    // 打开添加权限弹框
    authAddClick () {
      this.showDialog = true
    },
    // 关闭弹框
    closeDialog () {
      this.modifyMessege = ''
      this.showDialog = false
    },
    // 选中行的数据
    handleSelectionChange (val) {
      this.hasSelected = val
    },
    // 搜索
    searchAuth () {
      if (this.authForm.personName.trim().length > 20) {
        this.$message({
          message: '输入姓名不能超多20个字符',
          type: 'warning'
        })
      } else if (this.authForm.personName.trim() && !/^[\u4e00-\u9fa50-9A-Za-z]+$/.test(this.authForm.personName.trim())) {
        this.$message({
          message: '输入姓名只能为中文、英文和数字',
          type: 'warning'
        })
      } else if (this.authForm.elevatorName.trim().length > 20) {
        this.$message({
          message: '输入梯控设备不能超多20个字符',
          type: 'warning'
        })
      } else if (this.authForm.elevatorName.trim() && !/^[\u4e00-\u9fa5_0-9a-zA-Z\s]+$/.test(this.authForm.elevatorName.trim())) {
        this.$message({
          message: '输入梯控设备只能为中文、英文、数字和下划线',
          type: 'warning'
        })
      } else if (this.authForm.cardId.trim() && !/^[0-9a-zA-Z]+$/.test(this.authForm.cardId.trim())) {
        this.$message({
          message: '输入的卡号只能是英文和数字',
          type: 'warning'
        })
      } else if ((this.authForm.createTime && this.authForm.createTime.length) && (this.authForm.createTime[0] > this.authForm.createTime[1])) {
        this.authForm.createTime = []
        this.$message({
          message: '开始时间不能大于结束时间',
          type: 'warning'
        })
      } else {
        this.pageData.currentPage = 1
        this.addtionAuth()
      }
    },
    // 重置
    resetAuthForm (formName) {
      this.$refs['authForm'].resetFields()
      this.data = []
      this.authForm.createTime = []
      this.pageData.currentPage = 1
      this.pageData.pageSize = 10
      this.addtionAuth()
    },
    // 下载
    downloadAuth (permissionList) {
      if (this.hasSelected && this.hasSelected.length) {
        this.$confirm('确定下载该权限吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.hasSelected.forEach((select, index) => {
            this.downloadId.push(select.id)
          })
          postDownloadAuthData({
            ids: this.downloadId.join(',')
          }).then(res => {
            if (res.data.code === ERROK) {
              this.hasSelected = []
              this.downloadId = []
              this.addtionAuth()
              this.$refs.hasSelected.clearSelection()
              this.$message({
                message: '下载成功',
                type: 'success'
              })
            } else {
              this.hasSelected = []
              this.downloadId = []
              this.$refs.hasSelected.clearSelection()
              this.$message({
                message: res.data.message ? res.data.message : '下载失败',
                type: 'error'
              })
            }
          }).catch(err => {
            console.log(err)
          })
        }).catch(() => {
          this.$message({
            type: 'warning',
            message: '已取消下载'
          })
        })
      } else {
        this.$message({
          message: '您还没选中下载权限',
          type: 'warning'
        })
      }
    }
  }
}
</script>
<style lang='less' scoped>
.auth {
  .auth-btn {
    margin-top: 30px;
  }
  .auth-form {
    margin-top: 10px;
    overflow: hidden;
    .search-item {
      width: 25%;
      float: left;
    }
  }
  .item {
    width: 220px;
  }
  .auth-table {
    margin-top: 10px;
    width: 100%;
  }
  .auth-pagination {
    margin-top: 20px;
    text-align: center;
  }
  .down {
    color: #409eff;
  }
}
</style>
<style lang="less">
.auth {
  input:-ms-input-placeholder.el-input__inner,
  textarea:-ms-input-placeholder.el-textarea__inner,
  .el-date-editor :-ms-input-placeholder.el-range-input {
    color: #c0c4cc;
  }
  .el-table__body-wrapper {
    overflow-x: hidden;
  }
}
</style>
