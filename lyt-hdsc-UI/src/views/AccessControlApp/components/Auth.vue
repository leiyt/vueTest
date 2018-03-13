<template>

<div>
  <el-row>
    <!-- 工具条 -->
    <el-col :span="24" class="toolbar">    
      <el-form :inline="true" :model="form">
        <el-form-item label="人员类型" >
          <el-select v-model="personType"  @change="handleChangePersonType" placeholder="请选择">
            <el-option
              v-for="item in personTypeItems"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" >
          <el-input v-model.trim="form.userName" placeholder="请输入人员姓名"></el-input>
        </el-form-item>
        <el-form-item label="证件号" v-if="false">
          <el-input v-model.trim="form.cardNo" placeholder="请输入证件号"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="queryOwner(form)">查询</el-button>
        </el-form-item>
      </el-form>      
    </el-col>
    <!-- 列表 -->
    <el-col>
      <el-table :data="tableUsers" max-height='700' highlight-current-row>
        <el-table-column width="50" type="index"></el-table-column>
        <el-table-column label="人员编号" prop="userId" v-if="false"></el-table-column>

        <el-table-column label="姓名" prop="userName"></el-table-column>
        <el-table-column label="证件类型" prop="idenType"></el-table-column>
        <el-table-column label="证件号码" prop="idenNum"></el-table-column>
        <!-- <el-table-column label="住址" prop="userAddress" show-overflow-tooltip></el-table-column> -->
        <el-table-column label="指纹" prop="finger" :formatter="fingerFaceFormat"  v-if="false"></el-table-column>
        <el-table-column label="人脸" prop="facePic" :formatter="fingerFaceFormat"></el-table-column>
        <el-table-column label="密码" prop="password" :formatter="fingerFaceFormat"></el-table-column>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
            <div>
              <el-button type="text" @click="handleView($event, scope.$index, scope.row)">查看</el-button>
              <el-button type="text" @click="handleEdit($event, scope.$index, scope.row)">授权</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
  <el-row class="page-row">
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </el-row>
  <doorauthorityview v-if="viewDialogVisible" :viewDialogVisible="viewDialogVisible" :userRowData="userRowData" @dialogClose="noticeDialogClose"></doorauthorityview>
  <doorauthorityedit v-if="editDialogVisible" :editDialogVisible="editDialogVisible" :userRowData="userRowData" @dialogClose="noticeDialogClose"></doorauthorityedit>
</div>

</template>

<script>

import DoorAuthorityView from '@/views/AccessControlApp/components/DoorAuthorityView'
import DoorAuthorityEdit from '@/views/AccessControlApp/components/DoorAuthorityEdit'

import { getOwners, getAuthById } from '@/views/AccessControlApp/apis/authMgmt'

export default {
  data () {
    return {
      viewDialogVisible: false,
      editDialogVisible: false,
      userRowData: {
        authorStatus: '',
        authorPeriod: {
          startDate: '',
          endDate: ''
        },
        userId: ''
      },
      svalue: '',
      evalue: '',

      form: {
        userName: '',
        cardNo: ''
      },
      personType: 'USER',
      personTypeItems: [
        {value: 'USER', label: '住户'},
        // {value: 'VISITOR', label: '访客'}
        {value: 'PROPERTY', label: '物业人员'}
      ],
      tableUsers: [],
      // dialogVisible:false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false
    }
  },
  mounted () {
    this.loadData(this.personType)
  },
  components: {
    doorauthorityview: DoorAuthorityView,
    doorauthorityedit: DoorAuthorityEdit
  },
  methods: {
    handleView: function (event, index, row) {
      var _this = this
      getAuthById(row.userId)
      .then(function (response) {
        var errorcode = response.errorcode
        if (errorcode === '00000') {
          _this.viewDialogVisible = true
        } else {
          _this.$message('该用户暂未授权')
        }
      })
      _this.userRowData = row
    },
    handleEdit: function (event, index, row) {
      this.userRowData = row
      this.editDialogVisible = true
    },
    noticeDialogClose: function (event, value) {
      this.viewDialogVisible = value
      this.editDialogVisible = value
    },

    // 加载数据
    loadData (type) {
      var _this = this
      this.loading = true
      getOwners(this.currentPage, this.pageSize, type, this.form)
      // getOwners()
        .then(
          function (response) {
            _this.total = response.total
            _this.tableUsers = response.rows
          }
        )
        .catch(
          function (error) {
            this.loading = false
            console.log(error)
          }.bind(this)
        )
    },
    // 格式化指纹人脸显示
    fingerFaceFormat: function (row, column) {
      var fingerFace = row[column.property]
      if (fingerFace === undefined || fingerFace === null || fingerFace === '') {
        return '无'
      }
      return '有'
    },
    /**
     * @description 查看授权信息
     *
     * @param {Object} auth @default {} 授权信息
     */
    queryOwner: function (form) {
      console.log('查询人员信息...')
      this.loadData(this.personType)
    },
    // 改变分页大小
    handleSizeChange (val) {
      this.pageSize = val
      this.loadData(this.personType)
    },
    // 跳转页数
    handleCurrentChange (val) {
      this.currentPage = val
      this.loadData(this.personType)
    },
    // 处理选择人员类型
    handleChangePersonType: function (value) {
      this.form = {}
      this.tableUsers = []
      this.loadData(this.personType)
    }
  }
}
</script>

<style scoped="">
.page-row {
  text-align: right;
  margin-top: 5px;
}
.toolbar{background:#f2f2f2;padding:10px;margin:10px 0px}
.toolbar .el-form-item{margin-bottom:10px}
</style>