<template>
  <el-dialog :title="id ? '修改联动规则':'新增联动规则'" :visible="show" @close="closeDialog" width="70%">
    <el-form ref="ruleForm" :model="ruleForm" :rules="ruleFormRules" :show-message="true" label-width="80px">
      <el-row :gutter="10">
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
          <el-form-item label="设备分类" prop="deviceType">
            <el-select v-if="id" v-model="ruleForm.deviceType" clearable placeholder="请选择设备" @clear="clear" :disabled="isDisabled">
            </el-select>
            <el-select v-else v-model="ruleForm.deviceType" clearable placeholder="请选择设备" @change="getEvent" @clear="clear">
              <el-option v-for="item in deviceTypes" :key="item.id" :label="item.name" :value="item.code"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
          <el-form-item label="事件类型" prop="eventType">
            <el-select v-if="id" v-model="ruleForm.eventTypeName" clearable placeholder="请选择事件" :disabled="isDisabled">
            </el-select>
            <el-select v-else v-model="ruleForm.eventType" clearable placeholder="请选择事件">
              <el-option v-for="item in eventOptions" :key="item.id" :label="item.name" :value="item.code"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
          <el-form-item label="设备资源" prop="eventSourceCode">
            <template v-if="id">
              <el-input placeholder="选择资源" v-model="deviceName" :disabled="isDisabled">
              </el-input>
            </template>
            <template v-else>
              <tree-component :is-check="true" :editTitle="deviceName" :data="treeResult" :code="code" @onCheckedNode="onCheckChange" ref="tree"></tree-component>
            </template>
          </el-form-item>
        </el-col>
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
          <el-form-item label="是否有序" prop="isSequential">
            <el-select v-if="id" v-model="ruleForm.isSequential" clearable placeholder="请选择顺序" :disabled="isDisabled">
              <el-option label="是" :value="true">是</el-option>
              <el-option label="否" :value="false">否</el-option>
            </el-select>
            <el-select v-else v-model="ruleForm.isSequential" clearable placeholder="请选择顺序">
              <el-option label="是" :value="true">是</el-option>
              <el-option label="否" :value="false">否</el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="linkage-rule">
      <el-row :gutter="10">
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="linkage-method">
            <h3>联动方式</h3>
            <div>
              <ul class="event-list">
                <li v-for="(item, index) of linkageList" :key="item.id" :class="{'active': linkageActiveIndex===index}" @click="onSelectLinkageType(index)">
                  <span>{{item.name}}</span>
                  <div class="linkage-type-switch">
                    <el-switch v-model="linkageOpenIndexs[index]" :index="index" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </el-col>
        <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
          <div class="resource-table-content">
            <component :sourceTableData="sourceTableData" :modifyData="this.triggers[linkageActiveIndex] || []" :is="componentViewsMap[linkageList.length ? linkageList[linkageActiveIndex].value : 'FAC_CALLING']" @onUpdateData="handleUpdateData" :code="linkageList.length ? linkageList[linkageActiveIndex].code : ''">
            </component>
          </div>
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSave">保 存</el-button>
      <el-button @click="closeInnerDialog">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import TreeComponent from './Tree.vue'
import DoorLinkage from './DoorLinkage.vue'
import { getLinkageRuleDeviceData, getLinkageRuleByCodeData, getSourceTreeData, getLinkageModeData, postLinkageRuleSaveData, getLinkageRuleInfoData, postLinkageRuleUpdateData } from '../apis/index'
export default {
  name: 'ruleDialog',
  components: {
    TreeComponent,
    DoorLinkage
  },
  props: {
    show: {
      required: true,
      type: Boolean,
      default () {
        return false
      }
    },
    id: {
      type: String,
      defautl () {
        return ''
      }
    }
  },
  data () {
    return {
      ruleFormRules: {
        eventType: [{ required: true, message: '请选择事件类型', trigger: 'change' }],
        deviceType: [{ required: true, message: '请选择设备', trigger: 'change' }],
        isSequential: [{ required: true, message: '请选择顺序', trigger: 'change' }]
      },
      showMsg: true,
      // ['ImageLinkage', 'VideoLinkage', 'DoorLinkage', 'AudioLinkage']
      componentViewsMap: {
        'FAC_CALLING': 'DoorLinkage',
        'CATCH_CALLING': 'DoorLinkage'
      },
      isDisabled: false,
      treeResult: [],
      deviceTypes: [],
      eventOptions: [],
      ruleForm: {
        deviceType: '',
        triggerId: '',
        isSequential: false,
        eventType: '',
        eventSourceCode: ''
      },
      sourceTableData: [],
      linkageList: [],
      linkageActiveIndex: 0,
      linkageOpenIndexs: [],
      triggers: [],
      ruleParams: {
        triggers: []
      },
      deviceName: '',
      disabled: true,
      code: ''
    }
  },
  methods: {
    // 初始化数据
    initData () {
      getLinkageModeData().then(rs => {
        this.linkageList = rs.data.data || []
        this.triggers.length = this.linkageOpenIndexs.length = this.linkageList.length
        getLinkageRuleDeviceData().then(res => {
          this.deviceTypes = res.data.data
          if (this.id) {
            let params = { triggerId: this.id }
            getLinkageRuleInfoData(params).then(rs => {
              this.ruleParams = rs.data.data
              let ruleParams = this.ruleParams
              let triggers = ruleParams.triggers || []
              this.isDisabled = true
              this.getEvent(ruleParams.deviceType, ruleParams)
              if (ruleParams.deviceName) {
                this.$nextTick(() => {
                  this.deviceName = ruleParams.deviceName
                  this.ruleForm = {
                    eventTypeName: ruleParams.eventTypeName,
                    eventType: ruleParams.eventType,
                    eventSourceCode: ruleParams.eventSourceCode,
                    isSequential: ruleParams.isSequential,
                    deviceType: ruleParams.deviceType,
                    triggerRuleId: this.id
                  }
                  this.linkageList.forEach((item, index) => {
                    triggers.forEach(subItem => {
                      if (item.value === subItem.method) {
                        this.linkageOpenIndexs[index] = true
                        this.triggers[index] = JSON.parse(subItem.params.sourceLists)
                      }
                    })
                  })
                })
              }
            })
          }
        })
      })
    },
    // 修改
    handleUpdateData (data) {
      let linkageActiveIndex = this.linkageActiveIndex
      this.triggers[linkageActiveIndex] = data
    },
    // 树节点多选事件
    onCheckChange (data) {
      this.ruleForm.eventSourceCode = data.map((item) => { return item.deviceId }).join(',')
      this.deviceName = data.label
    },
    // 传递设备获取事件类型
    getEvent (value, editData) {
      if (this.ruleForm.deviceType) {
        this.treeResult = []
        this.eventOptions = []
        this.ruleForm.eventType = ''
        this.ruleForm.eventSourceCode = ''
        this.$refs.tree.clear()
        this.code = value
        getLinkageRuleByCodeData({ code: value }).then(res => {
          this.eventOptions = res.data.data
          this.$nextTick(() => {
            if (editData) this.ruleForm.eventType = editData.eventType
          })
        }).catch(err => {
          console.log(err)
        })
        getSourceTreeData().then(res => {
          this.treeResult = [res.data.data]
          this.$nextTick(() => {
            if (this.$refs.tree && editData) {
              this.$refs.tree.setCurrentKey(editData.eventSourceCode)
            }
          })
        }).catch(err => {
          console.log(err)
        })
      }
    },
    // 清空选中
    clearSelect () {
      this.ruleForm.deviceType = ''
      this.ruleForm.eventType = ''
      this.isDisabled = false
      this.triggers = []
      this.treeResult = []
      this.deviceName = ''
      this.ruleForm.eventSourceCode = ''
    },
    // 切换联动规则
    onSelectLinkageType (index) {
      this.linkageActiveIndex = index
    },
    // 保存
    handleSave () {
      if (!this.isDisabled) {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            let params = Object.assign({}, this.ruleForm)
            let triggers = []
            this.linkageList.forEach((item, index) => {
              let trigger = this.triggers[index] || []
              this.linkageOpenIndexs[index] && triggers.push({
                method: item.value,
                to: item.to,
                params: {
                  deviceId: trigger.map(rs => { return rs.deviceId }).join(','),
                  sourceLists: JSON.stringify(trigger)
                }
              })
            })
            let creator = this.username
            params.creator = creator
            params.triggers = triggers
            postLinkageRuleSaveData(params).then(res => {
              this.closeInnerDialog()
              this.$message({
                message: '新增联动规则成功',
                type: 'success'
              })
              this.clear()
            }).catch(() => {

            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        let params = Object.assign({}, this.ruleForm)
        let triggers = []
        this.linkageList.forEach((item, index) => {
          let trigger = this.triggers[index] || []
          if (trigger.length > 0) {
            this.linkageOpenIndexs[index] && triggers.push({
              method: item.value,
              to: item.to,
              params: {
                deviceId: trigger.map(rs => { return rs.deviceId }).join(','),
                sourceLists: JSON.stringify(trigger)
              }
            })
          }
        })
        params.triggers = triggers
        postLinkageRuleUpdateData(params).then(res => {
          this.$message({
            message: '修改联动规则成功',
            type: 'success'
          })
          this.closeInnerDialog()
        }).catch(() => {

        })
      }
    },
    // 清空数据
    clear () {
      this.treeResult = []
      this.eventOptions = []
      this.$refs.tree.onCheckChange([])
      this.$refs.tree.clear()
      this.$refs['ruleForm'].resetFields()
      this.ruleForm.eventSourceCode = ''
    },
    // 关闭弹窗
    closeDialog () {
      this.$emit('closeDialog')
      this.$refs['ruleForm'].resetFields()
      this.clearSelect()
      if (!this.id) {
        if (this.$refs.tree) {
          this.$refs.tree.clear()
        }
      }
    },
    // 关闭内层弹窗
    closeInnerDialog () {
      if (!this.id) {
        this.$refs.tree.clear()
      }
      this.clearSelect()
      this.closeDialog()
      this.$refs['ruleForm'].resetFields()
    }
  },
  computed: {
    // 获取当前登录的管理员姓名
    username () {
      let username = localStorage.getItem('login_username')
      return username || this.name || 'admin'
    }
  },
  // 监听当页面传递的值存在时初始化数据
  watch: {
    show (val) {
      if (val) {
        this.initData()
      }
    }
  }
}
</script>
<style scoped lang='less'>
ul {
  list-style-type: none;
  padding: 0;
}
.linkage-rule {
  border: 1px solid #999;
  .linkage-method {
    height: 420px;
    margin: 8px;
    border: 1px solid #999;
    h3 {
      text-align: center;
      line-height: 42px;
      font-size: 20px;
      color: #666;
      font-weight: normal;
    }
    .event-list {
      display: block;
      margin: 0 10px 5px 10px;
      li {
        cursor: pointer;
        text-align: center;
        height: 40px;
        line-height: 38px;
        margin-bottom: 1px;
        font-size: 14px;
        letter-spacing: 3px;
        padding: 0 50px;
        position: relative;
        background: #ccc;
        box-sizing: border-box;
        &:hover,
        &.active {
          background: #409eff;
          color: #fff;
        }
        &:hover {
          background: #2c85dd;
        }
      }
    }
    .linkage-type-switch {
      display: block;
      position: absolute;
      right: 10px;
      top: 0;
    }
  }
  .resource-table-content {
    height: 420px;
    margin: 8px 8px 8px 0;
    border: 1px solid #999;
  }
}
.hidden-rule {
  height: 1px;
  width: 100px;
  position: absolute;
  top: 0;
  left: 0;
}
</style>