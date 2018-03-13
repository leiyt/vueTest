<template>
  <el-dialog title="选择设备" class="equipment-content" :visible="show" @close="closeEvent(false)" width="1500px">
    <el-row class="dialog-row">
      <el-col class="dialog-left">
        <el-table class="equipment-table " filter-multiple height="450" border :data="allData" tooltip-effect="light" :default-expand-all="true" @selection-change="onSelectionChange">
          <el-table-column type="expand">
            <template slot-scope="scope" v-if="scope.row.childrens && scope.row.childrens.length">
              <el-table :data="scope.row.childrens" filter-multiple class="device-table tableBorder" tooltip-effect="light" :show-header="false" @selection-change="onSelectionChange">
                <el-table-column label="设备" prop="childrenDeviceName" :resizable="false" show-overflow-tooltip align="right">
                </el-table-column>
                <el-table-column label="楼幢" show-overflow-tooltip :resizable="false" prop="childrenOrgName" align="right">
                </el-table-column>
                <el-table-column label="楼层" align="center" :resizable="false" width="180px">
                  <template slot-scope="scope">
                    <template v-if="!scope.row.childrens || !scope.row.childrens.length">
                      <el-select v-model="scope.row.selectFloors" multiple collapse-tags placeholder="请选择" align="center">
                        <el-option v-for="item in getFloorOptions(scope.row)" :key="item.value" :label="item.label" :value="item.value">
                          {{ item.label }}
                        </el-option>
                      </el-select>
                    </template>
                    <template v-else> ---- </template>
                  </template>
                </el-table-column>
                <el-table-column prop="creatTime" label="操作" :resizable="false" class="creat-time" align="center">
                  <template slot-scope="scope">
                    <template v-if="!scope.row.childrens || !scope.row.children.length">
                      <el-button type="text" @click="onSelectClick(scope.$index,scope.row)">
                        添加
                      </el-button>
                    </template>
                    <template v-else> ---- </template>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="设备" prop="deviceName" :resizable="false" show-overflow-tooltip align="left">
          </el-table-column>
          <el-table-column label="楼幢" prop="orgName" :resizable="false" show-overflow-tooltip align="left">
          </el-table-column>
          <el-table-column label="楼层" width="180px" :resizable="false" align="left">
            <template slot-scope="scope">
              <template v-if="!scope.row.childrens || !scope.row.childrens.length">
                <el-select v-model="scope.row.selectFloors" multiple collapse-tags placeholder="请选择" align="left">
                  <el-option v-for="item in getFloorOptions(scope.row)" :key="item.value" :label="item.label" :value="item.value">
                    {{ item.label }}
                  </el-option>
                </el-select>
              </template>
              <template v-else> ---- </template>
            </template>
          </el-table-column>
          <el-table-column prop="creat-time" label="操作" :resizable="false" align="center">
            <template slot-scope="scope">
              <template v-if="!scope.row.childrens || !scope.row.childrens.length">
                <el-button type="text" @click="onSelectClick(scope.$index,scope.row)">
                  添加
                </el-button>
              </template>
              <template v-else> ---- </template>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col class="dialog-right">
        <el-table class="select-table" height="450" :data="selectData" tooltip-effect="light" :border="true">
          <el-table-column prop="childrenDeviceName" :resizable="false" label="设备" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column prop="childrenOrgName" :resizable="false" label="楼幢" show-overflow-tooltip align="center"></el-table-column>
          <el-table-column label="楼层" :resizable="false" show-overflow-tooltip align="center">
            <template slot-scope="props">
              <span>[{{props.row.selectFloors.join(',')}}]</span>
            </template>
          </el-table-column>
          <el-table-column prop="creat-time" label="操作" :resizable="false" align="center">
            <template slot-scope="scope">
              <el-button type="text" @click.native.prevent="deleteRow(scope.$index, selectData)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="clearAll">清 空</el-button>
      <el-button type="primary" @click="onSaveEpuipment(true)">保 存</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getEquipmentData } from '../apis/index'
const ERROK = '00000'
export default {
  props: {
    show: {
      required: true,
      type: Boolean,
      default () {
        return false
      }
    },
    selectedData: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      isState: 0,
      allData: [],
      selectData: [],
      selection: ''
    }
  },
  methods: {
    // 获取设备数据
    getEquipments () {
      getEquipmentData().then(res => {
        if (res.data.code === ERROK) {
          // 判断结果是否不为空
          if (res.data.data && res.data.data.length) {
            this.allData = res.data.data
          } else {
            this.allData = []
            this.$message({
              message: '暂无数据',
              type: 'info'
            })
          }
        } else {
          this.allData = []
          this.$message({
            message: res.data.message ? res.data.message : '请求数据失败',
            type: 'error'
          })
        }
      })
        .catch(err => {
          console.log(err)
        })
    },
    // 保持设备数据传给AddEquipment.vue
    onSaveEpuipment () {
      let selectedEquipments = []
      if (this.selectData && this.selectData.length > 0) {
        for (let i = 0; i < this.selectData.length; i++) {
          selectedEquipments.push({
            parentDeviceId: this.selectData[i].parentDeviceId,
            deviceID: this.selectData[i].childrenDeviceID,
            deviceName: this.selectData[i].childrenDeviceName,
            floors: this.selectData[i].selectFloors.join(',')
          })
        }
        let equipmentobj = {
          selectData: this.selectData,
          selectedEquipments: selectedEquipments
        }
        this.allData = []
        this.selectData = []
        this.$message({
          message: '添加成功',
          type: 'success'
        })
        this.$emit('selectedEquipments', equipmentobj)
      } else {
        this.$message({
          message: '您还没有添加设备',
          type: 'warning'
        })
      }
    },
    // 关闭弹框
    closeEvent () {
      this.allData = []
      let isStated = this.isState
      this.$emit('closeEquipment', { isStated })
    },
    // 清空
    clearAll () {
      this.isState = 1
      this.selectData = []
    },
    // 获取当前行的数据
    onSelectionChange (val) {
      this.selection = val
    },
    // 添加
    onSelectClick (index, row) {
      let tempRow = {
        childrens: row.childrens,
        childrenDeviceID: row.childrenDeviceID ? row.childrenDeviceID : row.deviceID,
        childrenDeviceName: row.childrenDeviceName ? row.childrenDeviceName : row.deviceName,
        endFloor: row.endFloor,
        parentDeviceId: row.parentDeviceId,
        childrenOrgID: row.childrenOrgID ? row.childrenOrgID : row.orgID,
        childrenOrgName: row.childrenOrgName ? row.childrenOrgName : row.orgName,
        selectFloors: this.systemSort(row.selectFloors),
        startFloor: row.startFloor
      }
      if (tempRow.selectFloors && tempRow.selectFloors.length > 0) {
        if (this.selectData && this.selectData.length > 0) {
          for (let i = 0; i < this.selectData.length; i++) {
            if (this.selectData[i].childrenDeviceID === tempRow.childrenDeviceID) {
              this.selectData.splice(i, 1)
            }
          }
          this.selectData.push(tempRow)
        } else {
          this.selectData.push(tempRow)
        }
      } else {
        this.$message({
          message: '您还没有选择楼层',
          type: 'warning'
        })
      }
    },
    // 排序
    systemSort (array) {
      return array.sort(function (a, b) { return a - b })
    },
    // 移除
    deleteRow (index, rows) {
      rows.splice(index, 1)
    },
    // 楼层数
    getFloorOptions (row) {
      let start = parseInt(row.startFloor)
      let end = parseInt(row.endFloor)
      let floorArrs = []
      for (; start < end + 1; start++) {
        if (start === 0) {
          start = 1
        }
        floorArrs.push({ label: start + '楼', value: start })
      }
      return floorArrs
    }
  },
  watch: {
    // 监听设备数据
    show (val) {
      if (val) {
        this.getEquipments()
        this.isState = 0
        this.selectData = this.selectedData.length ? this.selectedData : []
      }
    }
  }
}
</script>
<style lang="less" scoped>
.dialog-row {
  display: flex;
  width: 100%;
  margin-top: -30px;
  .dialog-left {
    flex: 1;
    padding: 0 39px 0 40px;
  }
  .dialog-right {
    flex: 1;
    margin-left: 10px;
    padding: 0px 40px 0 40px;
    border-left: 1px solid #ddd;
  }
}
.creat-time {
  border: none;
}
.select-table {
  margin-top: 10px;
  width: 100%;
}
.device-table {
  width: 100%;
  margin: 0px 30px -1px;
}
</style>
<style lang="less">
.equipment-content {
  .el-dialog__footer {
    text-align: center;
  }
}
.equipment-table {
  margin-top: 10px;
  width: 100%;
  .el-table__expanded-cell[class*="cell"] {
    padding: 0px 30px;
  }
  .device-table {
    td {
      border-right: none;
    }
  }
}
</style>