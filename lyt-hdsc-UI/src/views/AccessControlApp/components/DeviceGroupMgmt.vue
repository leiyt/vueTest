<template>
  <el-container>
    <el-row width="48%">
    <el-col :span="3"><el-button type="primary" @click="handleAddGroup" style="margin-bottom:0.5cm">新建分组</el-button></el-col>
    <el-table :data="deviceGroup" @row-click="handleShowEquips" max-height="700" highlight-current-row>
      <el-table-column width="50" type="index"></el-table-column>
      <el-table-column prop="uuid" v-if="false"></el-table-column>
      <el-table-column label="组名" prop="groupName"></el-table-column>
      <el-table-column label="备注" prop="remark"></el-table-column>
      <el-table-column label="操作" >
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.$index, scope.row)">修改</el-button>    
          <el-button type="text"  @click="removeEquipGroupById(scope.$index, scope.row)">删除</el-button> 
        </template>
      </el-table-column>
    </el-table>
    </el-row>

  <el-row style="margin-left:20px">
    <el-col :span="3"><el-button type="danger" :disabled="this.sels.length === 0" style="margin-bottom:0.5cm" @click="removeDevices">删除组内设备</el-button></el-col>
    <el-table :data='devices'  @selection-change="selsChange" max-height="700">
      <el-table-column type="selection" prop="deviceID"></el-table-column>
      <el-table-column label="设备名称" prop="deviceName"></el-table-column>
      <el-table-column label="设备型号" prop="deviceTypeName"></el-table-column>
      <el-table-column label="所属组织" prop="orgName"></el-table-column>
    </el-table>
  </el-row>

 <el-dialog title="新建设备组" :visible.sync="dialogVisible" width="70%">
    <el-container style="height: 600px; border: 1px solid #eee">
      <el-header>
        <el-form :inline="true" :rules="rules" :model="insertForm" ref="insertForm">
          <el-form-item label="设备组名称" class="groupInput" prop="groupName">
            <el-input placeholder="请输入设备组名称" v-model="insertForm.groupName"></el-input>
          </el-form-item>
          <el-form-item label="备注" class="groupInput" prop="groupRemark">
            <el-input placeholder="请输入备注" v-model="insertForm.groupRemark"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleClearDevices">清空设备</el-button>
            <el-button @click="dialogVisible=false">取消</el-button>
            <el-button type="primary" @click="handleSaveGroup">保存</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-container>
        <el-aside class="tree-aside">
          <el-tree :data="orgTree" :props="defaultProps" ref='tree' highlight-current @node-click="getDeviceList"></el-tree>
        </el-aside>
        <el-container>
          <el-main>
            <el-table :data="odevices" border stripe @select="addDevices" height="370" @select-all='addAllDevices' ref="aTable">
              <el-table-column type="selection" prop="parentDeviceID"></el-table-column>
              <el-table-column prop="gatewayServiceID" v-if="false"></el-table-column>
              <el-table-column prop="deviceTypeCode" v-if="false"></el-table-column>
              <el-table-column label="设备编码" prop="deviceID" width="200px"></el-table-column>
              <el-table-column label="设备名称" prop="deviceName" width="150px"></el-table-column>
              <el-table-column label="设备型号" prop="deviceTypeName" width="180px"></el-table-column>
              <el-table-column label="所属区域" prop="orgName"></el-table-column>
            </el-table>
          </el-main>
          <el-footer>
            <fieldset class='tagsDiv'>
              <legend>已选设备</legend>
              <span>
              <el-tag
                :key="index"
                v-for="(tag, index) in this.insertForm.dynamicTags"
                closable
                @close="handleClose(tag)">
                {{tag.deviceID + '-' + tag.deviceName}}
              </el-tag>
              </span>
            </fieldset>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </el-dialog>
 <el-dialog title="修改设备组" :visible.sync="mdialogVisible" width="70%">
    <el-container style="height: 600px; border: 1px solid #eee">
      <el-header>
        <el-form :inline="true" :rules="rules" ref="insertForm" :model="insertForm">
          <el-form-item label="设备组名称" class="groupInput" prop="groupName">
            <el-input placeholder="请输入设备组名称" v-model="insertForm.groupName"></el-input>
          </el-form-item>
          <el-form-item label="备注" class="groupInput" prop="groupRemark">
            <el-input placeholder="请输入备注" v-model="insertForm.groupRemark"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetuForm('insertForm')">重置组内设备</el-button>
            <el-button @click="mdialogVisible=false">取消</el-button>
            <el-button type="primary" @click="handleUpdateGroup">保存</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-container>
        <el-aside class="tree-aside">
          <el-tree :data="uOrgTree" :props="defaultProps" highlight-current @node-click="getuDeviceList"> </el-tree>
        </el-aside>
        <el-container>
          <el-main>
            <el-table :data="udevices" border stripe @select="addDevices" height="370" @select-all='addAllDevices' ref="multipleTable">
              <el-table-column type="selection" prop="parentDeviceID"></el-table-column>
              <el-table-column prop="gatewayServiceID" v-if="false"></el-table-column>
              <el-table-column prop="deviceTypeCode" v-if="false"></el-table-column>
              <el-table-column label="设备编码" prop="deviceID" width="200px"></el-table-column>
              <el-table-column label="设备名称" prop="deviceName" width="150px"></el-table-column>
              <el-table-column label="设备型号" prop="deviceTypeName" width="180px"></el-table-column>
              <el-table-column label="所属区域" prop="orgName"></el-table-column>
            </el-table>
          </el-main>
          <el-footer>
            <fieldset class='tagsDiv'>
              <legend>已选设备</legend>
              <span>
              <el-tag
                :key="index"
                v-for="(tag, index) in insertForm.dynamicTags"
                closable
                @close="handleClose(tag)">
                {{tag.deviceID + '-' + tag.deviceName}}
              </el-tag>
              </span>
            </fieldset>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </el-dialog>

</el-container>

</template>

<script>
import { listDeviceGroup, deleteDeviceGroupById, listDevicesByOrgId, loadOrgTree, insertDeviceGroup, batchDeleteDevices
, listSubDevicesByGroupId, listDevicesByGroupId, updateDeviceGroup, isGroupNameExists } from '@/views/AccessControlApp/apis'

export default {
  data () {
    var isExist = (rule, value, callback) => {
      if (this.orgGroupName === this.insertForm.groupName) {
        callback()
      }
      value = encodeURI(value)
      isGroupNameExists(value).then(res => {
        let errorcode = res.errorcode
        if (errorcode === '00000') {
          if (res.data === true) {
            callback(new Error('该设备组名称已存在！'))
          } else {
            callback()
          }
        }
      })
    }
    return {
      orgTree: [],
      dialogVisible: false,
      mdialogVisible: false,
      loading2: false,
      inputVisible: false,
      inputValue: '',
      deviceGroup: [],
      devices: [],
      odevices: [],
      udevices: [],
      sels: [],
      uOrgTree: [],
      groupId: '',
      orgGroupName: '',
      defaultProps: {
        orgId: 'uuid',
        children: 'children',
        label: 'name'
      },
      insertForm: {
        groupId: '',
        groupName: '',
        groupRemark: '',
        dynamicTags: []
      },
      rules: {
        groupName: [
          { required: true, message: '请填写设备组名称', trigger: 'change' },
          { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'change' },
          { validator: isExist, trigger: 'blur' }
        ],
        groupRemark: [
          { max: 30, message: '最长不能超过30字符', trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    // 加载数据
    loadData () {
      var _this = this
      this.loading2 = true
      listDeviceGroup()
      .then(
        function (response) {
          var errorcode = response.errorcode
          if (errorcode === '00000') {
            _this.deviceGroup = response.data
          } else {
            _this.$message.error(response.data.errormsg)
          }
        }
      )
      .catch(
        function (error) {
          this.loading2 = false
          console.log(error)
        }.bind(this)
      )
    },

    // 新建设备组
    handleAddGroup () {
      var _this = this
      _this.orgGroupName = ''
      _this.insertForm.groupName = ''
      _this.insertForm.groupRemark = ''
      _this.insertForm.dynamicTags = []
      _this.dialogVisible = true
      _this.odevices = []
      loadOrgTree()
      .then(function (response) {
        var errorcode = response.errorcode
        if (errorcode === '00000') {
          _this.orgTree = response.data
        } else {
          _this.$message({
            type: 'warning',
            message: '加载组织树异常，错误码:' + response.errorcode
          })
        }
      })
    },

    // 保存设备组
    handleSaveGroup () {
      var _this = this
      _this.$refs.insertForm.validate((valid) => {
        if (valid) {
          if (_this.insertForm.dynamicTags.length < 1) {
            _this.$message({
              type: 'warning',
              message: '未选择设备,保存失败！'
            })
            return
          }
          insertDeviceGroup({
            groupName: _this.insertForm.groupName,
            groupRemark: _this.insertForm.groupRemark,
            deviceList: _this.insertForm.dynamicTags
          })
          // insertDeviceGroup(_this.insertForm.groupName, _this.insertForm.groupRemark, _this.insertForm.dynamicTags)
          .then(function (response) {
            var errorcode = response.errorcode
            if (errorcode === '00000') {
              _this.$message({
                type: 'success',
                message: '保存设备组成功！'
              })
              _this.dialogVisible = false
              _this.loadData()
            } else {
              _this.$message({
                type: 'warning',
                message: '保存设备组失败，错误码:' + response.errorcode
              })
            }
          })
        }
      })
    },

    // 编辑
    handleEdit (index, row) {
      var _this = this
      _this.mdialogVisible = true
      _this.orgGroupName = row.groupName
      _this.insertForm.groupId = row.uuid
      _this.insertForm.groupName = row.groupName
      _this.insertForm.groupRemark = row.remark
      _this.insertForm.dynamicTags = []
      _this.udevices = []
      loadOrgTree()
      .then(function (response) {
        var errorcode = response.errorcode
        if (errorcode === '00000') {
          _this.uOrgTree = response.data
        } else {
          _this.$message({
            type: 'warning',
            message: '加载组织树异常，错误码:' + response.errorcode
          })
        }
      })
      // listSubDevicesByGroupId()
      listSubDevicesByGroupId(row.uuid)
      .then(
        function (response) {
          var errorcode = response.errorcode
          if (errorcode === '00000') {
            var deviceList = response.data
            var arr = []
            for (let i in deviceList) {
              arr.push(deviceList[i])
            }
            if (arr != null && arr.length > 0) {
              for (var i = 0; i < arr.length; i++) {
                _this.inputVisible = true
                let inputValue = {}
                inputValue.deviceID = arr[i].deviceID
                inputValue.deviceName = arr[i].deviceName
                inputValue.parentDeviceID = arr[i].parentDeviceID
                inputValue.gatewayServiceID = arr[i].gatewayServiceID
                inputValue.deviceTypeCode = arr[i].deviceTypeCode
                if (inputValue && _this.insertForm.dynamicTags.indexOf(inputValue) === -1) {
                  _this.insertForm.dynamicTags.push(inputValue)
                }
                _this.inputVisible = false
                _this.inputValue = ''
              }
            }
          } else {
            _this.$message({
              type: 'warning',
              message: '加载组内所有设备异常,错误码:' + response.errorcode
            })
          }
        }
      )
    },

    // 保存修改设备组
    handleUpdateGroup () {
      var _this = this
      _this.$refs.insertForm.validate((valid) => {
        if (valid) {
          if (_this.insertForm.dynamicTags.length < 1) {
            _this.$message({
              type: 'warning',
              message: '未选择设备,保存失败！'
            })
            return
          }
          updateDeviceGroup({
            groupId: _this.insertForm.groupId,
            groupName: _this.insertForm.groupName,
            groupRemark: _this.insertForm.groupRemark,
            deviceList: _this.insertForm.dynamicTags
          })
          .then(function (response) {
            var errorcode = response.errorcode
            if (errorcode === '00000') {
              _this.$message({
                type: 'success',
                message: '修改设备组成功！'
              })
              _this.mdialogVisible = false
              _this.loadData()
              // 重新加载组内设备
              listDevicesByGroupId(_this.groupId)
              .then(function (response) {
                var errorcode = response.errorcode
                if (errorcode === '00000') {
                  _this.devices = response.data
                } else {
                  _this.$message({
                    type: 'warning',
                    message: '加载组内设备异常，错误码:' + response.errorcode
                  })
                }
              })
            } else {
              _this.$message({
                type: 'warning',
                message: '保存设备组失败,错误码:' + response.errorcode
              })
            }
          })
        }
      })
    },

    // 单击设备组显示组内所有设备
    handleShowEquips (row) {
      this.groupId = row.uuid
      var _this = this
      listDevicesByGroupId(row.uuid)
      .then(function (response) {
        var errorcode = response.errorcode
        if (errorcode === '00000') {
          _this.devices = response.data
        } else {
          _this.$message({
            type: 'warning',
            message: '加载组内设备异常,错误码:' + response.errorcode
          })
        }
      })
    },

    // 添加设备
    addDevices (selection, row) {
      var _this = this
      _this.inputVisible = true
      let inputValue = {}
      inputValue.deviceID = row.deviceID
      inputValue.deviceName = row.deviceName
      inputValue.parentDeviceID = row.parentDeviceID
      inputValue.gatewayServiceID = row.gatewayServiceID
      inputValue.deviceTypeCode = row.deviceTypeCode
      // let inputValue = row.deviceID + '：' + row.deviceName + '-' + row.parentDeviceID + '_' + row.gatewayServiceID
      // 判断数组中是否已存在该标签
      let exist = false
      for (let i in _this.insertForm.dynamicTags) {
        if (_this.insertForm.dynamicTags[i]['deviceID'] === inputValue.deviceID) {
          exist = true
          break
        }
      }
      if (exist === false) {
        _this.insertForm.dynamicTags.push(inputValue)
      }
      _this.inputVisible = false
      _this.inputValue = {}
    },

    // 全选设备
    addAllDevices (selection) {
      var _this = this
      for (let i = 0; i < selection.length; i++) {
        _this.inputVisible = true
        let inputValue = {}
        inputValue.deviceID = selection[i].deviceID
        inputValue.deviceName = selection[i].deviceName
        inputValue.parentDeviceID = selection[i].parentDeviceID
        inputValue.gatewayServiceID = selection[i].gatewayServiceID
        inputValue.deviceTypeCode = selection[i].deviceTypeCode
        // 判断数组中是否已存在该标签
        let exist = false
        for (let i in _this.insertForm.dynamicTags) {
          if (_this.insertForm.dynamicTags[i]['deviceID'] === inputValue.deviceID) {
            exist = true
            break
          }
        }
        if (exist === false) {
          _this.insertForm.dynamicTags.push(inputValue)
        }
        _this.inputVisible = false
        _this.inputValue = {}
      }
    },

    // 删除设备标签
    handleClose (tag) {
      var _this = this
      _this.insertForm.dynamicTags.splice(_this.insertForm.dynamicTags.indexOf(tag), 1)
    },

    // 根据单元获取设备列表（修改设备组）
    getuDeviceList (node) {
      var _this = this
      // listDevicesByOrgId()
      listDevicesByOrgId(node.uuid)
      .then(response => {
        var errorcode = response.errorcode
        if (errorcode === '00000') {
          _this.udevices = response.data
        } else {
          _this.$message({
            type: 'warning',
            message: '获取该单元设备异常！' + errorcode
          })
          console.error(response.errormsg)
        }
      })
      .then(() => {
        var arr = []
        for (let i in _this.insertForm.dynamicTags) {
          arr.push(_this.insertForm.dynamicTags[i].deviceID)
        }
        for (let i in _this.udevices) {
          if (arr.indexOf(_this.udevices[i].deviceID) !== -1) {
            setTimeout(() => { _this.$refs.multipleTable.toggleRowSelection(_this.udevices[i]) }, 200)
          }
        }
      })
    },

    // 根据单元获取设备列表（新增设备组）
    getDeviceList (node) {
      var _this = this
      // listDevicesByOrgId()
      listDevicesByOrgId(node.uuid)
      .then(function (response) {
        var errorcode = response.errorcode
        if (errorcode === '00000') {
          _this.odevices = response.data
        } else {
          _this.$message({
            type: 'warning',
            message: '获取该单元设备异常！'
          })
          console.error(response.errormsg)
        }
      })
      .then(() => {
        var arr = []
        for (let i in _this.insertForm.dynamicTags) {
          arr.push(_this.insertForm.dynamicTags[i].deviceID)
        }
        for (let i in _this.odevices) {
          if (arr.indexOf(_this.odevices[i].deviceID) !== -1) {
            setTimeout(() => { _this.$refs.aTable.toggleRowSelection(_this.odevices[i]) }, 200)
          }
        }
      }
      )
    },

    // 删除
    removeEquipGroupById (index, row) {
      var _this = this
      _this.$confirm('确定要删除名为：' + row.groupName + ' 的设备组吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDeviceGroupById(row.uuid)
        .then(function (response) {
          var errorcode = response.errorcode
          if (errorcode === '00000') {
            _this.$message({
              type: 'success',
              message: '删除成功！'
            })
            _this.loadData()
            _this.devices = []
          } else {
            _this.$message({
              type: 'warning',
              message: '删除失败,错误码:' + errorcode
            })
          }
        })
        .catch(
        )
      })
    },

    // 删除组内设备
    removeDevices () {
      var _this = this
      var deleteId = []
      for (var i = 0; i < _this.sels.length; i++) {
        deleteId.push(_this.sels[i].deviceID)
      }
      if (deleteId.length === _this.devices.length) {
        _this.$message({
          type: 'warning',
          message: '不允许删除组内所有设备'
        })
        return
      }
      _this.$confirm('确定要删除所选设备吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        batchDeleteDevices(_this.groupId, deleteId)
        .then(function (response) {
          var errorcode = response.errorcode
          if (errorcode === '00000') {
            _this.$message({
              type: 'success',
              message: '删除成功！'
            })
            // 重新加载组内设备
            listDevicesByGroupId(_this.groupId)
            .then(function (response) {
              var errorcode = response.errorcode
              if (errorcode === '00000') {
                _this.devices = response.data
              } else {
                _this.$message({
                  type: 'warning',
                  message: '加载组内设备异常，错误码:' + response.errorcode
                })
              }
            })
          } else {
            _this.$message({
              type: 'warning',
              message: '删除失败，错误码:' + response.errorcode
            })
          }
        }
        )
      })
    },
    // 选中项改变时执行
    selsChange (sels) {
      var _this = this
      _this.sels = sels
    },

    // 清空设备
    handleClearDevices () {
      var _this = this
      _this.insertForm.dynamicTags = []
      _this.$refs.aTable.clearSelection()
    },

    // 重置表单
    resetuForm (insertForm) {
      var _this = this
      _this.insertForm.dynamicTags = []
      _this.udevices = []
      listSubDevicesByGroupId(_this.insertForm.groupId)
      .then(
        function (response) {
          var errorcode = response.errorcode
          if (errorcode === '00000') {
            var deviceList = response.data
            var arr = []
            for (let i in deviceList) {
              arr.push(deviceList[i])
            }
            if (arr != null && arr.length > 0) {
              for (var i = 0; i < arr.length; i++) {
                _this.inputVisible = true
                let inputValue = {}
                inputValue.deviceID = arr[i].deviceID
                inputValue.deviceName = arr[i].deviceName
                inputValue.parentDeviceID = arr[i].parentDeviceID
                inputValue.gatewayServiceID = arr[i].gatewayServiceID
                inputValue.deviceTypeCode = arr[i].deviceTypeCode
                if (inputValue && _this.insertForm.dynamicTags.indexOf(inputValue) === -1) {
                  _this.insertForm.dynamicTags.push(inputValue)
                }
                _this.inputVisible = false
                _this.inputValue = ''
              }
            }
          } else {
            _this.$message({
              type: 'warning',
              message: '加载组内所有设备异常，错误码:' + response.errorcode
            })
          }
        }
      )
    }

  }
}
</script>

<style scoped>
  .groupInput {
    text-align:center;
    font-size:16px;
    height:40px;
    line-height:40px;
    padding-left: 60px;
  }  
  .el-footer {
    background-color: white;
    height:120px!important;
  }
  .tagsDiv {
    overflow-y:auto;
    height:120px;
    border:1px solid rgb(238, 238, 238);
  }
  .el-header {
    background-color:white;
    margin-top:8px
  }
  .el-tree {
    height: 100%
  }
  .tree-aside {
     width: 300px;
     height: 100%;
     border: 1px solid #ebeef5;
     background-color: white
  }
</style>
