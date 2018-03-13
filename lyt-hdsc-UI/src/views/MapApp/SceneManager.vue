<template>
  <div class="map-app">
    <div v-show="status=='0'" class="page-content">
      <div class="row-flow normal-flex-item">
        <el-form ref="param" v-model="param" label-width="80px" class="search-form">
          <!--场景类型模块-->
          <el-form-item label="场景类型" class='common-input form-item'>
            <el-select v-model="param.sceneType" class='small-input'>
              <el-option :label="item.itemName" :value="item.itemCode" v-for="item in selectList" :key="item.itemCode">{{item.itemName}}</el-option>
            </el-select>
          </el-form-item>
          <!--组织树模块-->
          <el-popover ref="orgPopover" placement="top-end" width="174" v-model="isShowPopover">
            <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
            <el-tree class="filter-tree" :data="OrgTree" :props="defaultProps" default-expand-all :filter-node-method="filterNode" @node-click="handleNodeClick" ref="tree"></el-tree>
          </el-popover>
          <el-form-item label="所属组织" label-width="80px" class="common-input">
            <el-input v-model="OrgName" placeholder="请选择组织" readonly v-popover:orgPopover></el-input>
          </el-form-item>
          <!--场景名称模块-->
          <el-form-item label="场景名称" label-width="80px" class="common-input">
            <el-input v-model.trim="param.sceneName" placeholder="请输入场景名称" @keyup.enter.native="onGetPageData()"></el-input>
          </el-form-item>
          <!--查询重置按钮组-->
          <div class="search-toolbar">
            <el-button type="primary" @click="onGetPageData" class="search-btn" :loading="isLoading">查询</el-button>
            <el-button type="primary" @click="onResetParam" class="search-btn">重置</el-button>
          </div>
        </el-form>
      </div>
      <div class="row-flow operation-bar normal-flex-item">
        <el-button type="primary" @click="onAddScene" class="operation-btn">
          <i class="el-icon-plus"></i>&nbsp;添加</el-button>
        <el-button type="danger" @click="onDeleteScenes" class="operation-btn">
          <i class="el-icon-close"></i>&nbsp;删除</el-button>
      </div>
      <!--tablelist场景信息-->
      <div class="row-flow clearfix fit-flex-item table-list">
        <el-table :data="tableData" class="row-flow" ref="multipleTable" @selection-change="handleSelectionChange" height="100%" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="sceneName" label="场景名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="sceneType" label="场景类型" :formatter="filterSceneType"></el-table-column>
          <el-table-column prop="orgName" label="所属组织" show-overflow-tooltip></el-table-column>
          <el-table-column prop="width" label="图片宽度"></el-table-column>
          <el-table-column prop="height" label="图片高度"></el-table-column>
          <el-table-column prop="scaleType" label="比例尺计算方式"></el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button @click="onSceneDetail(scope.row)" type="text" size="small">查看</el-button>
              <el-button @click="onItemEdit(scope.row)" type="text" size="small">编辑</el-button>
              <el-button @click="onItemDelete(scope.row)" type="text" size="small">删除</el-button>
              <el-button @click="onEnterArea(scope.row)" type="text" size="small" v-if="scope.row.sceneType===1||scope.row.sceneType===4||scope.row.sceneType===2">区域管理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--子组件SceneDetail-->
      <scene-detail ref="sceneDetail" :sceneId="id" @change="changeHandler"></scene-detail>
      <div class="row-flow pagination-bar normal-flex-item">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
    <!--子组件SceneInfo-->
    <div v-show="status==='1'">
      <scene-info ref="SceneInfo" :currentParams="param"></scene-info>
    </div>
    <!--子组件AreaManager-->
    <div v-if="status===3">
      <area-manager ref="AreaManager" :areaSceneInfo='areSceneInfo'></area-manager>
    </div>
  </div>
</template>

<script>
import { getSceneList, getScenePageList, getOrgTree, getSceneInfo, deleteScene, getDictionary } from '@/views/MapApp/apis/index.js'
import SceneInfo from '@/views/MapApp/components/SceneInfo'
import SceneDetail from '@/views/MapApp/components/SceneDetail'
import AreaManager from '@/views/MapApp/components/AreaManager'
import { LOG_TAG } from '@/views/MapApp/assets/js/index.js'

export default {
  components: {
    SceneInfo,
    SceneDetail,
    AreaManager
  },
  data () {
    return {
      isLoading: false,
      selectList: [],
      areSceneInfo: {},
      OrgName: '',
      exportOrgNode: {},
      filterText: '',
      status: '0',
      isShowNext: true,
      isShowPopover: false,
      currentRow: {},
      id: '',
      param: {
        sceneName: '',
        sceneType: '',
        orgId: ''
      },
      defaultParam: {
        sceneName: '',
        sceneType: '',
        orgId: ''
      },
      tableData: [
      ],
      pageSize: 10,
      pageNum: 1,
      currentPage: 1,
      total: 0,
      OrgTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      multipleSelection: [],
      pageData: [
        {
          id: '123',
          sceneName: '测试数据-停车场',
          url: '/map/scenemap/02/park01.jpg',
          centerLon: '110.121332',
          centerLat: '45.123343',
          scale: '20000',
          height: '1200',
          width: '800',
          orgId: '0010102401',
          sceneType: '02'
        },
        {
          id: '124',
          sceneName: '测试数据一楼大厅',
          url: '/map/scenemap/02/park01.jpg',
          centerLon: '90.121332',
          centerLat: '145.123343',
          scale: '2000',
          height: '1200',
          width: '800',
          orgId: '0010102405',
          sceneType: '01'
        }
      ]
    }
  },
  mounted: function () {
    this.params = this.param
    let that = this
    this.onGetPageData()
     /**
    *@description 组织查询
    */
    getOrgTree().then(res => {
      that.exportOrgNode.rootUuid = res.data.data.uuid
      that.OrgTree.splice(0, that.OrgTree.length)
      that.OrgTree.push(res.data.data)
    }).catch(err => {
      console.warn(LOG_TAG + 'getOrgTree接口调用err')
      console.warn(err)
    })
     /**
    *@description 查询数据字典
    */
    getDictionary().then((res) => {
      let dictionary = res.data.data
      let sceneTypes = dictionary.dictCodeType.sceneType
      var len = sceneTypes.length
      for (var i = 0; i < len; i++) {
        sceneTypes[i].itemCode = parseInt(sceneTypes[i].itemCode)
      }
      this.selectList = sceneTypes
    })
  },
  methods: {
    handleSizeChange (val) {
      this.pageSize = val
      this.onGetPageData()
    },
    changeHandler: function (newVal) {
      this.status = newVal
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.onGetPageData()
    },
    filterSceneType: function (row, column) {
      var sceneType = row.sceneType
      switch (sceneType) {
        case 1:
          return '小区全图'
        case 2:
          return '小区区域图'
        case 3:
          return '楼层地图'
        case 4:
          return '停车场主地图'
        case 5:
          return '停车场分区图'
      }
    },
     /**
    *@description 刷新数据列表
    */
    onGetPageData: function () {
      this.isLoading = true
      getScenePageList(this.currentPage, this.pageSize, this.param).then((res) => {
        for (let i = 0; i < res.data.data.pageData.length; i++) {
          if (Number(res.data.data.pageData[i].scaleType) === 1) {
            res.data.data.pageData[i].scaleType = '三点定位'
          } else {
            res.data.data.pageData[i].scaleType = '宽高计算'
          }
        }
        this.tableData = res.data.data.pageData
        this.total = res.data.data.total
        this.isLoading = false
      }).catch(err => {
        console.log(LOG_TAG + 'getScenePageList刷新列表数据err')
        this.isLoading = false
        console.warn(err)
      })
    },
     /**
    *@description 场景类型切换
    */
    SceneTypeChange: function () {
      let options = {}
      options.sceneType = this.value
      options.sceneName = this.valueName
      getSceneList(options).then((res) => {
        this.sceneList = res.data.data
      }).catch(err => {
        console.warn(LOG_TAG + 'getSceneList接口调用err')
        console.warn(err)
      })
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
     /**
    *@description 查询条件重置
    */
    onResetParam: function () {
      this.param = Object.assign({}, this.defaultParam)
      this.OrgName = ''
      this.pageSize = 10
      this.currentPage = 1
      this.onGetPageData()
    },
    handleNodeClick (data) {
      this.OrgName = data.name
      this.param.orgId = data.uuid
      this.isShowPopover = false
      this.filterText = ''
    },
     /**
    *@description 查看场景详情
    *@param {obj} row 场景信息
    */
    onSceneDetail: function (row) {
      getSceneInfo({ sceneId: row.id }).then(res => {
        this.$refs['sceneDetail'].sceneDetailTmp = res.data.data
        this.$refs['sceneDetail'].dialogFormVisible = true
        this.$refs['sceneDetail'].mapImage = res.data.data.url
        let sceneType = this.$refs['sceneDetail'].sceneDetailTmp.sceneType
        switch (sceneType) {
          case 1:
            this.$refs['sceneDetail'].sceneDetailTmp.sceneType = '小区全图'
            break
          case 2:
            this.$refs['sceneDetail'].sceneDetailTmp.sceneType = '小区区域图'
            break
          case 3:
            this.$refs['sceneDetail'].sceneDetailTmp.sceneType = '楼层'
            break
          case 4:
            this.$refs['sceneDetail'].sceneDetailTmp.sceneType = '停车场主地图'
            break
          case 5:
            this.$refs['sceneDetail'].sceneDetailTmp.sceneType = '停车场分地图'
            break
        }
        if (this.$refs['sceneDetail'].sceneDetailTmp.locationPoints && this.$refs['sceneDetail'].sceneDetailTmp.locationPoints.length === 0) {
          this.$refs['sceneDetail'].sceneDetailTmp.locationPoints = null
        }
        this.$refs['sceneDetail'].mapObj = {}
      }).catch(err => {
        console.warn(LOG_TAG + 'getSceneInfo查看详情接口调用err')
        console.warn(err)
      })
    },
    /**
    *@description 场景新增
    */
    onAddScene: function () {
      this.status = '1'
      this.isShowNext = true
      this.$refs['SceneInfo'].addSceneInfo()
      this.$refs['SceneInfo'].resetForm()
    },
    /**
    *@description 场景编辑
    *@param {obj} row 场景信息
    */
    onItemEdit: function (row) {
      this.currentRow = row
      // 调用get接口,点位页面初始化
      getSceneInfo({ sceneId: row.id }).then(res => {
        this.status = '1'
        this.$refs['SceneInfo'].editSceneInfo(res.data.data)
        this.isShowNext = false
      }).catch(err => {
        console.warn(LOG_TAG + 'getSceneInfo接口调用err')
        console.warn(err)
      })
    },
    /**
    *@description 场景项删除
    *@param {obj} row 场景信息
    */
    onItemDelete: function (row) {
      let deleteScenes = {}
      deleteScenes.sceneIds = []
      this.$confirm('确定要刪除场景 ' + row.sceneName + ' 吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        // 在此处调用批量删除的接口
        let deleteScenes = {}
        deleteScenes.sceneIds = []
        deleteScenes.sceneIds.push(row.id)
        deleteScene(deleteScenes).then(res => {
          this.onGetPageData()
        })
        this.$message({
          message: '刪除成功',
          type: 'warning'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    /**
    *@description 区域新增
    *@param {obj} row 场景信息
    */
    onEnterArea: function (row) {
      var sid = row.id
      var data = { 'sceneId': sid }
      getSceneInfo(data).then(res => {
        this.areSceneInfo = res.data.data
        this.status = 3
      }).catch(err => {
        console.warn(LOG_TAG + 'getSceneInfo接口调用err')
        console.warn(err)
      })
    },
    handleSelectionChange: function (val) {
      this.multipleSelection = val
    },
    /**
    *@description 下一步
    */
    next: function () {
      this.status = 2
    },
    /**
    *@description 批量删除
    */
    onDeleteScenes: function () {
      if (this.multipleSelection.length <= 0) {
        this.$message({
          message: '请至少选择一项！',
          type: 'warning'
        })
        return
      }
      let str = ''
      let deleteScenes = {}
      deleteScenes.sceneIds = []
      for (let i = 0, len = this.multipleSelection.length; i < len; i++) {
        if (this.multipleSelection[i].sceneName && i < this.multipleSelection.length) {
          str += this.multipleSelection[i].sceneName
          if (i < this.multipleSelection.length - 1) {
            str += ', '
          }
          deleteScenes.sceneIds.push(this.multipleSelection[i].id)
        }
      }
      str = this.multipleSelection.length > 3 ? (str + '等') : str
      this.$confirm('确定要刪除 ' + str + ' 共 ' + this.multipleSelection.length + ' 个场景吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        // 在此处调用批量删除的接口
        deleteScene(deleteScenes).then(res => {
          this.onGetPageData()
        })
        this.$message({
          message: '刪除成功',
          type: 'warning'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
        )
    }
  },
  watch: {
    filterText (val) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>
<style lang="less" scoped>
/* 公共样式start */
@origin: 10px;
.pull-left {
  float: left;
}
.pull-right {
  float: right;
}
.row-flow {
  width: 100%;
}
.clearfix {
  clear: both;
}
.common-input {
  width: @origin*28;
}
.map-app {
  box-sizing: border-box;
  position: absolute;
  top: 90px;
  bottom: 20px;
  left: 225px;
  right: 20px;
  /deep/.cell {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .page-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    .normal-flex-item {
      flex: 0 0 auto;
    }
    .fit-flex-item {
      flex: 1;
    }
  }
  .table-list {
    display: flex;
  }
}
.filter-tree {
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 300px;
}
/* 公共样式end */
.pagination-bar {
  padding: @origin*2 0;
  text-align: center;
}
.search-form {
  overflow: hidden;
  padding: @origin 0;
  .common-input {
    margin-right: 10px;
    .pull-left;
  }
}
.operation-bar {
  width: 100%;
  height: @origin*4;
  .operation-btn {
    height: 30px;
    padding: @origin*.7 @origin*1.5;
    .pull-left;
  }
}
.search-toolbar {
  width: @origin*20;
  .pull-right;
  .search-btn {
    width: 84px;
    margin-left: @origin*1.2;
    .pull-left;
  }
}

</style>