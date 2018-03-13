<template>
  <div class="visitor-container el-container">
    <div class="visitor-tree-container">
      <el-input placeholder="模糊查询组织" prefix-icon="el-icon-search" v-model="searchKey" class="visitor-search">
      </el-input>
      <el-tree :data="treeData" ref="tree" :props="defaultProps" node-key="uuid" :default-expanded-keys="defaultExpandKeys" :filter-node-method="filterNode" :expand-on-click-node="true" @node-click="handleNodeClick" @node-expand="nodeExpand" class="visitor-tree"></el-tree>
    </div>
    <div class="visitor-view-content">
      <el-button type="primary" @click="onVisitorEdit">访客录入</el-button>
      <visitor-edit ref="visitorEdit" :cardNum="portList" :iccardObj="iccardObj" @refData="getVisitorTableData"></visitor-edit>
      <el-button type="primary" @click="onDownLoad">导出</el-button>
      <div class="visitor-con clearfix">
        <el-form :model="visitorForm" :rules="rules" ref="visitorForm" class="visitor-form" label-width="100px">
          <el-form-item prop="name" label="访客姓名" class="form-item">
            <el-input v-model="visitorForm.name"></el-input>
          </el-form-item>
          <el-form-item prop="phone" label="联系方式" class="form-item">
            <el-input v-model="visitorForm.phone"></el-input>
          </el-form-item>
          <el-form-item prop="idenNum" label="证件号码" class="form-item">
            <el-input v-model="visitorForm.idenNum"></el-input>
          </el-form-item>
          <el-form-item prop="personName" label="被访者姓名" class="form-item">
            <el-input v-model="visitorForm.personName"></el-input>
          </el-form-item>
        </el-form>
        <div class="visitor-btnbar">
          <el-button type="primary" @click="onSearchVisitor">查询</el-button>
          <el-button type="primary" @click="onResetSearchKey">重置</el-button>
        </div>
      </div>

      <div class="visitor-table">
        <pager-table ref="pagerTable" :visitor-data="visitorData" :total="total" @turnPage="getVisitorTableData" @tableSelected="selectionVisitor" hasSelect>
          <template slot="table-column">
            <el-table-column label="访客姓名" prop="name" width="130">
            </el-table-column>
            <el-table-column label="性别" prop="sex" width="70" :formatter="filtersSex">
            </el-table-column>
            <el-table-column label="证件类型" prop="idenType" :formatter="filtersidenType" width="130">
            </el-table-column>
            <el-table-column label="证件号码" prop="idenNum">
            </el-table-column>
            <el-table-column label="联系方式" prop="phone" width="150">
            </el-table-column>
            <el-table-column label="拜访人数" prop="visitorCnt" width="70">
            </el-table-column>
            <el-table-column label="被访者姓名" prop="personName" width="130">
            </el-table-column>            
            <el-table-column label="被访房屋地址" prop="houseAddr">
            </el-table-column>           
            <el-table-column fixed="right" label="操作" width="150">
              <template slot-scope="scope">
                <el-button @click="onVisitorEdit(scope.row)" size="mini">授权</el-button>
              </template>
            </el-table-column>
          </template>
        </pager-table>
      </div>
    </div>
    <!-- object标签用于向网页中嵌入多媒体元素(例如图片、视频、activex、pdf等等)  
      clsid-注册表中某个类的id  
      codebase-对象的代码位置(如果是在注册表中注册过 则可以没有) -->
    <!-- object隐藏后事件触发不了，所以设了1px -->
    <object classid="clsid:B06B2398-0C9E-4CA9-B3DE-1FCF7A2F2FF0" id="CardMgmtAppICCardComponent" width="1px" height="1px"></object>
  </div>
</template>
<script>

import PagerTable from '@/views/VisitorApp/components/PagerTable'
import VisitorEdit from '@/views/VisitorApp/components/VisitorEdit'
import { getVisitor, getOrgNextLevel, personTemplate } from '@/views/VisitorApp/apis/index.js'

export default {
  components: {
    PagerTable,
    VisitorEdit
  },
  data () {
    return {
      visitorForm: {
        name: '',
        personName: '',
        idenNum: '',
        phone: ''
      },
      iccardObj: null, // 读卡器OCX控件
      portList: [], // 串口列表
      visitorEditForm: '',  // 访客录入信息
      intervalId: '', // 定时器id
      selections: [], // 表格选中行数据
      rules: {
        name: [
          { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
        ],
        personName: [
          { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
        ],
        idenNum: [
          { message: '请输入证件号码', trigger: 'blur' },
          { min: 1, max: 18, message: '长度在 1 到 18 个字符', trigger: 'blur' }
        ],
        phone: [
          { message: '请输入手机号码', trigger: 'blur' },
          { min: 1, max: 11, message: '长度在 1 到 11 个字符', trigger: 'blur' }
        ]
      },
      searchKey: '',
      treeData: [],
      defaultProps: {
        uuid: 'uuid',
        children: 'children',
        label: 'name'
      },
      orgData: {},
      defaultExpandKeys: [],
      visitorData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      orgId: '',
      houseId: ''
    }
  },
  mounted: function () {
    /**
    * @description 查询人员信息
    * @param Object 页数和每页条数，房子id和根节点id
    */
    this.getVisitorTableData({ 'currentPage': this.currentPage, 'pageSize': this.pageSize, 'orgId': this.orgId, 'houseId': this.houseId })
    getOrgNextLevel().then(res => {           // 组织树根节点数据
      this.treeData.push(res.data.data[0])
      this.defaultExpandKeys.push(res.data.data[0].uuid)
      this.formatTree(res.data.data[0].children)
      this.loading = false
    }).catch(err => {
      console.warn({
        message: err,
        type: 'warning'
      })
    })

    // 获取读卡串口列表
    this.getBrowserType()
    if (this.isIE) {
      this.getCardPortList()
      this.intervalId = setInterval(this.$refs.visitorEdit.readCard, 200)
    } else {
      this.$message({
        type: 'warn',
        message: '请使用IE浏览器!'
      })
    }
  },
  methods: {
    /**
     * @description  查询刷新页面
     * @param Object params 页数和每页条数，房子id和根节点id
     */
    getVisitorTableData: function (params) {
      if (params) {
        this.pageSize = params.pageSize
        this.currentPage = params.currentPage
      }
      getVisitor(Object.assign({ 'orgId': this.orgId, 'houseId': this.houseId }, this.visitorForm, params)).then(res => {
        // 访客查询接口
        if (res.data.code === '00000') {
          this.visitorData = res.data.data[0].rows
          this.currentPage = res.data.data[0].currentPage
          this.total = res.data.data[0].rowCount
        } else {
          this.visitorData = res.data.data[0].rows
        }
      }).catch(err => {
        console.warn({
          message: err,
          type: 'warning'
        })
      })
    },
    // 树节点过滤
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    formatTree: function (data) {
      const defaultNode = {
        name: ''
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i].isParent === true) {
          data[i].children = []
          data[i].children.push(defaultNode)
        }
      }
      return data
    },
    nodeExpand: function (data, node) {
      if (data.hasExpanded) {
        return false
      }
      this.orgData = {
        isParent: data.isParent,
        type: data.type,
        uuid: data.uuid
      }
      getOrgNextLevel(this.orgData).then(res => {            // 获取组织树下一个节点数据信息
        data.children = this.formatTree(res.data.data)
        data.hasExpanded = true
      })
    },
    /**
     * @description 点击树形结构node
     * @param Object params 点击的当前数据信息
     */
    handleNodeClick: function (params) {
      if (params.type === 'org') {
        this.orgId = params.uuid
        this.houseId = ''
      } else {
        this.orgId = ''
        this.houseId = params.uuid
      }
      this.getVisitorTableData({ 'currentPage': this.currentPage, 'pageSize': this.pageSize, 'orgId': this.orgId, 'houseId': this.houseId })
    },
    // 查询访客信息
    onSearchVisitor: function () {
      this.$refs['visitorForm'].validate((valid) => {
        if (valid) {
          this.getVisitorTableData({ 'currentPage': this.currentPage, 'pageSize': this.pageSize, 'orgId': this.orgId, 'houseId': this.houseId })
        }
      })
    },
    /**
     * @description 人员性别格式化
     * @param  Object row 表格中每行信息
     * @param  Object column 表格中每行信息
     * @returns 数字对应的中文
     */
    filtersSex: function (row, column) {
      var fingerFace = row.sex
      return fingerFace === '1' ? '男' : '女'
    },
    /**
     * @description 证件类型格式化
     * @param  Object row 表格中每行信息
     * @param  Object column 表格中每行信息
     * @returns 数字对应的中文
     */
    filtersidenType: function (row, column) {
      var fingerFace = row.idenType
      switch (fingerFace) {
        case '1':
          return '身份证'
        case '2':
          return '驾驶证'
        case '3':
          return '学生证'
        case '4':
          return '军官证'
        case '5':
          return '护照'
      }
    },
    // 重置查询表单
    onResetSearchKey: function () {
      for (let key in this.visitorForm) {
        this.visitorForm[key] = ''
      }
    },
    // /**
    //  * @description 点击table组件复选框触发
    //  * @param Array val 所有选中行数据
    //  */
    selectionVisitor: function (val) {
      this.selections = val
    },
    /**
     * @description 点击访客录入或编辑
     * @param  Object visitorInfo 表格中访客信息
     */
    onVisitorEdit: function (visitorInfo = {}) {
      const visitorInfoTmp = Object.assign({}, visitorInfo)
      this.$refs['visitorEdit'].visitorEdit(visitorInfoTmp)
    },
    //  导出功能
    onDownLoad: function () {
      this.$confirm('导出访客信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        personTemplate(2, '/scp-visitorapp/visitor/exportExcel?name=' + encodeURI(this.visitorForm.name) + '&phone=' + this.visitorForm.phone + '&personName=' + encodeURI(this.visitorForm.personName) + '&idenNum=' + this.visitorForm.idenNum + '&orgId=' + this.orgId + '&houseId=' + this.houseId + '&selectedIds=' +
          this.selections).then(
            this.$message({
              type: 'success',
              message: '导出成功!'
            })
          )
        this.selections = []
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消导出'
        })
      })
    },
    // 判断是否ie浏览器
    getBrowserType () {
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        this.isIE = true
      }
    },
    // 获取读卡器串口列表
    getCardPortList () {
      this.iccardObj = document.getElementById('CardMgmtAppICCardComponent')
      var portArr = this.iccardObj.getSerialList().split(';')
      for (var i = 0; i < portArr.length; i++) {
        var port = { 'port': portArr[i] }
        this.portList.push(port)
      }
    }
  },
  watch: {                        // 模糊查询
    searchKey (val) {
      this.$refs.tree.filter(val)
      if (val === '') {
        getOrgNextLevel().then(res => {           // 组织树根节点数据
          this.treeData.push(res.data.data[0])
          this.treeData.shift()
          this.defaultExpandKeys.push(res.data.data[0].uuid)
          this.formatTree(res.data.data[0].children)
          this.loading = false
        }).catch(err => {
          console.warn({
            message: err,
            type: 'warning'
          })
        })
      }
    }
  },
  // 离开页面销毁定时器
  destroyed () {
    if (this.intervalId !== '') {
      clearInterval(this.intervalId)
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
.visitor-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 850px;
  padding: 10px;
  border: 1px solid #dddee1;
}
.visitor-tree-container {
  display: flex;
  flex-flow: column;
  width: 250px;
  float: left;
  border-right: 1px solid #ccc;
  box-sizing: border-box;
  height: 830px;
  overflow: auto;
}
.visitor-search {
  margin: 10px;
  width: 85%;
}
.visitor-tree {
  width: 900px;
  flex: 1;
}
.visitor-view-content {
  position: relative;
  float: left;
  width: 100%;
  height: 100%;
  margin-left: 20px;
}
.visitor-con {
  width: 100%;
  margin-top: 15px;
  padding: 15px;
  padding-bottom: 0px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.visitor-form {
  width: 70%;
  float: left;
}
.form-item {
  width: 50%;
  float: left;
}
.visitor-btnbar {
  float: right;
}
.visitor-table {
  position: relative;
  width: 100%;
  height: 75%;
  margin-top: 10px;
}
</style>



