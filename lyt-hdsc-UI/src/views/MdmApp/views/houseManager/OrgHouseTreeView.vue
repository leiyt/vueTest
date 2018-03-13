<template>
  <div class="tree-container">
    <el-input placeholder="按组织名称进行过滤" @keypress.enter.native="filterOrg" prefix-icon="el-icon-search" v-model="searchKey" class="fuzzy-search-tree" :maxlength="30">
    </el-input>
    <el-tree ref="tree" class="file-tree" :data="treeData" node-key="uuid" :default-expanded-keys="defaultExpandKeys" :props="defaultProps" :expand-on-click-node="false" :filter-node-method="filterNode" @node-click="onClickNode" :highlight-current="true"></el-tree>
  </div>
</template>
<script>
import { getOrgTree } from '../../apis/org_manager'
export default {
  props: {
    search: {
      type: Function
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
      // 监测者数据
      searchKey: '',
      // 组织列表集合
      treeData: [],
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
     * @description 组织树添加，成功返回提示信息
     *
     * @param {condition} orgList @default [] 添加成功后给出相应的用户提示
     */
    addHouse: function () {
      this.$message({
        message: '添加房屋',
        type: 'success'
      })
    },
     /**
     * @description 组织树删除，成功返回提示信息
     *
     * @param {condition} orgList @default [] 删除成功后给出相应的用户提示
     */
    delOrg: function () {
      this.$message({
        message: '删除组织',
        type: 'warning'
      })
    },
    onClickNode: function (data, node) {
      // 焦点聚集组织列表的组织时，存储uuid与组织名称
      this.exportOrgNode.uuid = node.key
      this.exportOrgNode.orgName = node.label
      // 通过焦点组织进行刷新操作
      this.search({ orgUuid: data.uuid })
    },
     /**
     * @description 组织树刷新
     *
     * @param {condition} orgList @default [] 获取组织树
     */
    getArrangerTree: function () {
      this.loading = true
      getOrgTree().then(res => {
        // 根节点uuid
        this.exportOrgNode.rootUuid = res.data.data.uuid
        // 根节点组织名称
        this.exportOrgNode.rootName = res.data.data.name
        // 组织列表数组
        this.treeData.splice(0, this.treeData.length)
        this.defaultExpandKeys.push(res.data.data.uuid)
        this.treeData.push(res.data.data)
        this.loading = false
      }).catch(err => {
        console.log(err)
      })
    },
    /**
     * @description 组织树节点点击事件
     *
     * @param {condition} orgList @default [] 组织树节点点击，保存一个key值
     */
    filterNode: function (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    /**
     * @description 组织树节点点击事件
     *
     * @param {condition} orgList @default [] 组织树节点点击，保存一个key值
     */
    filterOrg: function () {
      this.$refs.tree.filter(this.searchKey)
    }
  },
  /**
     * @description 组织树获取
     *
     * @param {condition} orgList @default [] 进入房屋列表，立即获取左侧组织树列表
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
.el-tree-node>.el-tree-node__children {
  background-color: transparent;
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


