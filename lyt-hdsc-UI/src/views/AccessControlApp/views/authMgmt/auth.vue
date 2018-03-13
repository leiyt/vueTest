<template>
  <el-row>
    <!-- 工具条 -->
    <el-col :span="24"><div class="grid-content bg-purple-dark"></div>
      <el-form :inline="true" :model="form" class="demo-form-inline">
        <el-input v-model="form.keyword" placeholder="请输入人员姓名或证件号码查询"></el-input>
        <el-form-item>
          <el-button type="primary" @click="queryOwner(form.keyword)">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!-- 列表 -->
    <el-table :data="tableOweners" border style="margin-top:1.5cm">
      <el-table-column label="人员编号" prop="id"></el-table-column>
      <el-table-column label="姓名" prop="name"></el-table-column>
      <el-table-column label="证件类型" prop="cardType"></el-table-column>
      <el-table-column label="证件号码" prop="cardNo"></el-table-column>
      <el-table-column label="住址" prop="address"></el-table-column>
      <el-table-column label="指纹" prop="remark"></el-table-column>
      <el-table-column label="人脸" prop="remark"></el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <div>
            <el-button @click="authView(scope.row)" type="text" size="small">查看</el-button>
            <el-button @click="authEdit(scope.row)" type="text" size="small">授权</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="block">
    <div class="r_page">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
  </div>
  </el-row>
</template>

<script>
import { getOwners } from '@/views/AccessControlApp/apis/authMgmt'

export default {
  data () {
    return {
      form: {
        keyword: ''
      },
      tableOweners: [],
      // dialogVisible:false,
      currentPage: 1,
      pageSize: 10,
      total: 100,
      loading2: false
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    // 加载数据
    loadData () {
      console.log('加载授权人员数据...')
      var _this = this
      this.loading2 = true
      getOwners()
      // getOwners(this.currentPage, this.pageSize)
        .then(
          function (response) {
            _this.tableOweners = response.rows
          }
        )
        .catch(
          function (error) {
            this.loading2 = false
            console.log(error)
          }.bind(this)
        )
    },
    /**
     * @description 查看授权信息
     *
     * @param {Object} auth @default {} 授权信息
     */
    queryOwner: function (keyword) {
      console.log('查询人员信息...')
    },

    // 改变分页大小
    handleSizeChange (val) {
      this.pageSize = val
    },
    // 跳转页数
    handleCurrentChange (val) {
      this.currentPage = val
      this.loadData()
    }
  }
}
</script>
