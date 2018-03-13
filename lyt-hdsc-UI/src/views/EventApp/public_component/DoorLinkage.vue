<template>
  <div class='door-linkage'>
    <div class="event-btns">
      <span type="info" @click="openAddDialog">＋ 添加</span>
      <span type="info" @click="handleDel">× 删除</span>
    </div>
    <el-table :data="sourceTableData" border @selection-change="handleSelectionChange" ref="sourceTable" max-height="280">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="deviceId" label="设备ID" align="center"></el-table-column>
      <el-table-column prop="label" label="设备名称" align="center"></el-table-column>
      <el-table-column prop="installAddress" label="区域" align="center"></el-table-column>
    </el-table>
    <el-dialog class="linkage-mode-source-dialog" title="添加资源" :visible="dialogVisible" width="420px" @close="closeDialog" :modal="false" :code="code">
      <div class="tree-size">
        <el-tree :default-checked-keys="defaultCheckeds" :props="defaultProps" :default-expanded-keys="rootKey" placement="bottom" :load="loadNode" lazy :show-checkbox="true" :data="treeData" ref='tree' node-key='deviceId' @check-change="onCheckChange"></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type='primary' @click="confirmSourceTree">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
import { copyObject } from '../../../packages/utils/util'
import { getSourceTreeData, getOrgNextLevelData } from '../apis/index'
export default {
  name: 'DoorLinkage',
  props: {
    modifyData: {
      type: Array,
      default: []
    },
    code: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dialogVisible: false,
      hasSelected: [],
      deviceId: '',
      treeData: [],
      checkedNodes: [],
      defaultCheckeds: [],
      sourceTableData: [],
      rootKey: [],
      defaultProps: {
        children: 'children',
        label: 'label',
        isLeaf: this.isTreeLeaf
      }
    }
  },
  methods: {
    // 资源列表删除勾选的资源点
    handleDel () {
      this.sourceTableData = _.differenceWith(this.sourceTableData, this.hasSelected, _.isEqual)
      this.$emit('onUpdateData', this.sourceTableData)
    },
    // 打开资源添加弹窗
    openAddDialog () {
      this.dialogVisible = true
      let param = { code: this.code }
      getSourceTreeData(param).then(res => {
        this.treeData = [res.data.data]
        this.defaultCheckeds = this.sourceTableData.map(rs => { return rs.deviceId })
      }).catch(err => {
        console.log(err)
      })
    },
    closeDialog () {
      this.dialogVisible = false
    },
    // 改变选中项
    handleSelectionChange (data) {
      this.hasSelected = data
    },
    // 当选中项改变时触发
    onCheckChange () {
      this.checkedNodes = this.$refs.tree.getCheckedNodes(true).filter(rs => { return rs.isDevice })
    },
    // 点击确认将数据渲染在表格中
    confirmSourceTree () {
      this.sourceTableData = copyObject(this.checkedNodes)
      this.$emit('onUpdateData', this.sourceTableData)
      this.dialogVisible = false
    },
    // 逐级加载树组件
    loadNode (node, resolve) {
      if (node.level === 0) {
        this.rootKey = [node.data.uuid]
        resolve(this.treeData)
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
    // 判断是否为树子级
    isTreeLeaf (data, node) {
      return data.isDevice
    }
  },
  watch: {
    modifyData (val) {
      this.$nextTick(() => {
        this.sourceTableData = val
      })
    }
  }
}
</script>
<style scoped lang='less'>
.door-linkage {
  .event-btns {
    height: 40px;
    line-height: 40px;
    background-color: #666;
    text-align: left;
    color: #fff;
    span {
      cursor: pointer;
      margin-left: 15px;
    }
  }
}
</style>
<style lang='less'>
.linkage-mode-source-dialog {
  .el-dialog__body {
    text-align: center;
    height: 516px;
  }
  .tree-size {
    height: 100%;
    overflow: auto;
  }
}
</style>

