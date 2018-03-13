<template>
  <div class="tree-container">
    <el-input placeholder="模糊组织查询" @keypress.enter.native="getOrgTree" prefix-icon="el-icon-search" v-model="searchKey" class="fuzzy-search-tree" :maxlength="30">
    </el-input>
    <el-tree ref="tree" class="file-tree" :data="treeData" node-key="uuid" :default-expanded-keys="defaultExpandKeys" :props="defaultProps" :expand-on-click-node="false" @node-click="onClickNode" :filter-node-method="filterNode" :highlight-current="true"></el-tree>
  </div>
</template>
<script>
import { getOrgTree } from '../../apis/org_manager'
export default {
  props: {
    search: {
      type: Function,
      default: function () { }
    },
    exportOrgNode: {}
  },
  watch: {
    searchKey (val) {
      this.$refs.tree.filter(val)
    }
  },
  data () {
    return {
      // 监测者
      searchKey: '',
      key: '',
      // 组织树数组
      treeData: [],
      // 根节点uuid
      rootUuid: '',
      // 根节点组织名称
      rootName: '',
      loading: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      defaultExpandKeys: []
    }
  },
  methods: {
    /**
    * @description 组织树节点添加
    *
    * @param {condition} orgList @default [] 成功返回状态提示信息
    */
    addOrg: function () {
      this.$message({
        message: '添加组织',
        type: 'success'
      })
    },
    /**
    * @description 组织树节点展开刷新当前节点下所有组织
    *
    * @param {condition} orgList @default [] 单机组织树一次,展开一层级
    */
    onClickNode: function (data, node) {
      // 焦点组织uuid
      this.exportOrgNode.uuid = node.key
      // 焦点组织名称
      this.exportOrgNode.orgName = node.label
      // 点击组织树获取焦点刷新列表
      this.search({ uuid: data.uuid, name: this.name })
    },
    filterNode: function (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    filterOrg: function () {
      this.$refs.tree.filter(this.searchKey)
    },
    /**
    * @description 组织树刷新
    *
    * @param {condition} orgList @default [] 刷新组织树
    */
    getArrangerTree: function () {
      this.loading = true
      getOrgTree({}).then(res => {
        let mamUuid = this.exportOrgNode.uuid || res.data.data.uuid
        this.defaultExpandKeys.push(mamUuid)
        this.exportOrgNode.rootUuid = res.data.data.uuid
        this.exportOrgNode.rootName = res.data.data.name
        this.treeData.splice(0, this.treeData.length)
        this.treeData.push(res.data.data)
        this.loading = false
      }).catch(err => {
        console.log(err)
      })
    }
  },
  /**
    * @description 刚进入组织界面，便主动加载左侧的组织树
    *
    * @param {condition} orgList @default [] 刷新组织树
    */
  mounted: function () {
    this.getArrangerTree()
  }
}
</script>
<style lang='less' scoped>
.tree-container {
  display: flex;
  flex-flow: column;
  width: 200px;
  float: left;
  height: 100%;
  border: 1px solid #dddee1;
  box-sizing: border-box;
  overflow: auto;
}
.file-tree {
  height: 700px;
}
.el-tree {
  flex: 1;
  width: 900px;
}
.fuzzy-search-tree {
  margin: 10px;
  width: 178px;
}
</style>


