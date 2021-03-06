
<template>
  <div>
    <template v-if="!authorityFlag">
      <el-button icon="el-icon-circle-plus-outline" style="margin-center: 10px; margin-bottom: 10px" plain @click="createResourceRole" type="primary">添加</el-button>
    </template>
    <template v-else>
      <el-button class="cancel-btn" style="margin-bottom: 10px" @click="cancelResourceRole" type="primary">取消添加</el-button>
      <el-button class="action-btn" style="margin-bottom: 10px" @click="saveResourceRole('authority')" type="primary">保存</el-button>
    </template>
    <el-form :model="authority" :inline="true" v-if="authorityFlag" ref="authority" :rules="rules">
      <el-form-item label="选择角色" prop="roleUuid">
        <el-select v-model="authority.roleUuid" placeholder="请选择" class="user_el-select" filterable>
          <el-option v-for="roleType in roleSelectOptions" :key="roleType.uuid" :label="roleType.roleName" :value="roleType.uuid"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="操作类型" :label-width="formLabelWidth" v-if="showActionType">
        <el-select v-model="authority.actionType" placeholder="请选择" multiple class="user_el-select">
          <el-option v-for="action in actionTypeOptionsProp" :key="action.itemCode" :label="action.itemName" :value="action.itemCode"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-table :data="resourceRoleDetailData" style="width: 100%" max-height="580" element-loading-text="拼命加载中">
        <el-table-column prop="roleName" label="角色名称" width="120"></el-table-column>
        <el-table-column prop="remark" label="角色说明" width="323"></el-table-column>
        <el-table-column prop="actionTypeName" label="操作类型" width="355"></el-table-column>
        <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <span @click="handleDelete(scope.$index)" content="删除" style="cursor:pointer" class="el-icon-delete">
              </span>
            </template>
        </el-table-column>
    </el-table>
    <div>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="listQuery.page"
          :page-sizes="[5, 10, 15]"
          :page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
    <div>
      <el-form><el-form-item><el-input v-show="false"></el-input></el-form-item></el-form>
    </div>
  </div>
</template>

<script>
  import {
    deleteResourceRole,
    createResourceRole,
    getResourceRoleList,
    getAllRoleList,
    createDevice,
    getResourceRoleNoPageList
  } from '@/views/UserMgmt/userManagement/apis'

  export default {
    props: {
      actionTypeOptionsProp: undefined,
      resourceUuidValue: undefined,
      resourceType: undefined
    },
    watch: {
      resourceRoleDetailData (val) {
        this.authorityFlag = false
        this.showActionType = false
      }
    },
    mounted () {
      this.listQuery.resourceUuid = this.resourceUuidValue
      this.handResourceRoleList(this.listQuery)
    },
    data () {
      return {
        deleteImg: require('../assets/images/delete.png'),
        resourceRoleDetailData: undefined,
        formLabelWidth: '120px',
        authority: {
                // -----权限表-----
          resourceUuid: '',   // 资源代码
          roleUuid: '',       // 角色ID
          actionType: ''      // 操作类型
        },
        roleDeviceAuthorityRequestVo: {
          resourceUuidList: undefined,
          actionTypeList: undefined,
          roleUuid: undefined
        },
        authorityFlag: false,
        showActionType: false,
        roleSelectOptions: undefined,
        total: 0,
        listQuery: {
          page: 1,
          limit: 5,
          resourceUuid: ''
        },
        rules: {
          roleUuid: [
            { required: true, message: '请选择角色名称', trigger: 'blur, change' }
          ]
        }
      }
    },
    methods: {
      // 改变分页大小
      handleSizeChange (val) {
        this.listQuery.limit = val
        this.listQuery.page = 1
        this.listQuery.resourceUuid = this.resourceUuidValue
        this.handResourceRoleList(this.listQuery)
      },
      // 跳转页数
      handleCurrentChange (val) {
        this.listQuery.page = val
        this.listQuery.resourceUuid = this.resourceUuidValue
        this.handResourceRoleList(this.listQuery)
      },
      // 初始联系方式信息
      initResourceRole () {
        this.authority = {
          resourceUuid: '',
          roleUuid: '',
          actionType: ''
        }
      },
      createResourceRole: function () {
        this.authorityFlag = true
        if (this.resourceType === '4' || this.resourceType === '5') {
          this.showActionType = true
        }
        this.authority.resourceUuid = this.resourceUuidValue
        this.handResourceRoleSelect()
      },
      cancelResourceRole: function () {
        this.authorityFlag = false
        // 添加完contact对象后，重置contact对象
        this.initResourceRole()
      },
      // 获取角色权限列表信息
      handResourceRoleList (listQuery) {
      // 权限角色列表信息
        getResourceRoleList(listQuery)
        .then(
          function (result) {
            this.resourceRoleDetailData = result.authorityExt
            this.total = result.pageCount
          }.bind(this)
        )
        .catch(function (error) {
          console.log(error)
        })
      },
      // 获取角色下拉框信息
      handResourceRoleSelect () {
      // 角色下拉框信息
        getAllRoleList()
        .then(
          function (result) {
            this.tmpRoleList = result
            getResourceRoleNoPageList(this.authority.resourceUuid)
              .then(
                function (result) {
                  let roleFilterList = result.authorityExt
                  if (result.pageCount > 0) {
                    for (var i = 0; i < roleFilterList.length; i++) {
                      this.disableRole(roleFilterList[i].roleUuid)
                    }
                  }
                  this.roleSelectOptions = this.tmpRoleList.filter(function (item) { return !item.isDisabled })
                }.bind(this)
              )
              .catch(function (error) {
                console.log(error)
              })
          }.bind(this)
        )
        .catch(
          function (error) {
            console.log(error)
          }
        )
      },
      disableRole (roleUuid) {
        for (var i = 0; i < this.tmpRoleList.length; i++) {
          if (roleUuid === this.tmpRoleList[i].uuid) {
            this.tmpRoleList[i].isDisabled = true
          }
        }
      },
      saveResourceRole (formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            if (this.resourceType === '4' || this.resourceType === '5') {
              this.roleDeviceAuthorityRequestVo.resourceUuidList = [this.authority.resourceUuid]
              this.roleDeviceAuthorityRequestVo.actionTypeList = this.authority.actionType
              this.roleDeviceAuthorityRequestVo.roleUuid = this.authority.roleUuid
              createDevice(this.roleDeviceAuthorityRequestVo)
                .then(() => {
                  this.listQuery.resourceUuid = this.resourceUuidValue
                  this.handResourceRoleList(this.listQuery)
                  this.authorityFlag = false
                    // 添加完authority对象后，重置authority对象
                  this.initResourceRole()
                  this.$message({
                    title: '成功',
                    message: '保存成功',
                    type: 'success',
                    duration: 2000
                  })
                })
            } else {
              this.authority.actionType = ''
              createResourceRole(this.authority)
                .then(() => {
                  this.listQuery.resourceUuid = this.resourceUuidValue
                  this.handResourceRoleList(this.listQuery)
                  this.authorityFlag = false
                  // 添加完authority对象后，重置authority对象
                  this.initResourceRole()
                  this.$message({
                    title: '成功',
                    message: '保存成功',
                    type: 'success',
                    duration: 2000
                  })
                })
            }
          } else {
            return false
          }
        })
      },
      // 确认是否删除联系方式
      handleDelete (row) {
        var data = this.resourceRoleDetailData[row]
        this.$confirm('确定删除此项？', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.delete(data.uuid, row)
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      },
      // 删除联系方式实体
      delete (uuid, row) {
        deleteResourceRole(uuid)
          .then(
            function (result) {
              this.listQuery.resourceUuid = this.resourceUuidValue
              this.handResourceRoleList(this.listQuery)
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }.bind(this)
          )
          .catch(
            function (error) {
              console.log(error)
            }
          )
      },
      handleChangeActionTypeFlag () {
        this.authorityFlag = false
        this.showActionType = false
      }
    }
  }
</script>
