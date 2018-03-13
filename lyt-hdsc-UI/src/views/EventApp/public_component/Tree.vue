
<template>
  <el-dropdown trigger="click" class="event-source-dropdown" :hide-on-click="!isCheck">
    <span class="el-dropdown-link">
      <span class="select-text">{{setTitle || editTitle || title}}
      </span>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </span>
    <el-dropdown-menu slot="dropdown" class="event-source-tree" :disabled="disabled">
      <el-dropdown-item>
        <el-tree :default-checked-keys="defaultCheckeds" :load="loadNode" lazy :default-expanded-keys="rootKey" placement="bottom" :show-checkbox="isCheck" :data="data" ref="tree" node-key="uuid" :props="defaultProps" @check-change="onCheckChange" @node-click="onNodeClick"></el-tree>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
import { getOrgNextLevelData } from '../apis/index.js'
export default {
  props: {
    data: {
      type: Array,
      default: []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '请选择资源'
    },
    editTitle: {
      type: String,
      default: ''
    },
    isCheck: {
      type: Boolean,
      default: false
    },
    defaultCheckeds: {
      type: Array,
      default () {
        return []
      }
    },
    code: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'label',
        isLeaf: this.isTreeLeaf
      },
      isActive: false,
      treeResultData: [],
      treeSelect: [],
      orgId: '',
      orgName: '',
      rootKey: []
    }
  },
  computed: {
    // 当前选择的标题
    setTitle () {
      let list = this.treeSelect.map((item) => { return item.label })
      return list.length ? list.join('、') : this.title
    }
  },
  methods: {
    // 树节点多选事件
    onCheckChange () {
      this.treeSelect = this.$refs.tree.getCheckedNodes(true)
        .filter((item) => { return item.isDevice })
      this.$emit('onCheckedNode', this.treeSelect)
    },
    // 树节点点击事件
    onNodeClick (data) {
      if (data.isDevice) {
        this.treeSelect = [data]
        this.$emit('onNodeClick', data)
      }
    },
    // 设置当前节点的选中状态
    setCurrentKey (key) {
      this.$refs.tree.setCurrentKey(key)
    },
    // 清空选中
    clear () {
      this.treeSelect = []
    },
    // 逐级加载组织树
    loadNode (node, resolve) {
      if (node.level === 0) {
        resolve(this.data)
      } else {
        if (!node.data) {
          resolve([])
          return
        }
        let params = {
          uuid: node.data.uuid,
          code: this.code
        }
        // 请求下级子数据
        getOrgNextLevelData(params)
          .then((res) => {
            resolve(res.data.data || [])
          })
          .catch()
      }
    },
    // 判断是否为设备
    isTreeLeaf (data, node) {
      return data.isDevice
    }
  },
  // 监听当前是否选中
  watch: {
    data () {
      let isData = this.data
      if (isData.length > 0) this.rootKey = [isData[0].uuid]
    }
  }
}
</script> 
<style  lang='less'>
// 当组织树中有数据时，显示横向滚动条
.event-source-tree {
  .el-tree-node > .el-tree-node__children {
    overflow: visible;
  }
}
</style>
<style scoped lang='less'>
.el-dropdown-menu__item:focus,
.el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: #fff;
}
.event-source-tree {
  min-width: 218px;
  max-width: 220px;
  min-height: 220px;
  max-height: 460px;
  overflow: auto;
  // .eventTree {
  //   min-width: 200%;
  // }
}
.event-source-dropdown {
  padding-left: 15px;
  padding-right: 30px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  white-space: nowrap;
  overflow: hidden;
  min-width: 220px;
  max-width: 220px;
  .el-dropdown-link {
    display: inline-block;
    width: 100%;
    padding-right: 30px;
    height: 38px;
    .select-text {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    i.el-icon--right {
      height: 100%;
      line-height: 40px;
      position: absolute;
      top: 0;
      right: 15px;
    }
  }
}
</style>


