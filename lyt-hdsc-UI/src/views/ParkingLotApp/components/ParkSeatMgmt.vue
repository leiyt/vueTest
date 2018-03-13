<template>
  <div id="parkSeat" style="height:100%;">
    <el-container style="height:100%;">
      <el-aside class="park-tree">
        <el-tree :data="treeData" :props="defaultProps" ref="tree" @node-click="handleNodeClick" v-if="treeData.length > 0 " style="width:900px;"></el-tree>
        <p class="tree-nodata" v-else>暂无数据</p>
      </el-aside>
      <el-main>
        <div>
          <section class="from-btns">
            <el-button type="primary" @click="addCarSeat" >新增</el-button>
            <el-button type="danger" @click="batchCarSeat">批量删除</el-button>
            <el-button type="primary" v-if="queryType==1" @click="setEnable">设为不可用</el-button>
            <el-button type="primary" v-if="queryType==0" @click="setEnable">设为正常</el-button>
            <el-button type="primary" @click="parkSeatUpload">导入</el-button>
            <upload title="车位导入" :action="'/scp-parkinglotapp/parkSeatMgmt/uploadData?defaultId='+defaultId" downloadUrl="/scp-parkinglotapp/file/downloadTemplateFile?template=parkSeat" tips="请选择EXCEL文件！" ref='parkSeatUpload'></upload>
          </section>
          <el-form :inline="true">
            <el-select v-model="queryType" placeholder="全部" class="mr15" @change="typeChange">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-form-item>
              <el-input placeholder="请输入车位编号" v-model="queryValue"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryByNum">查询</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="tableData" v-loading = "seatLoad" ref="carSeatData" @selection-change="handleSelectionChange" max-height="640" border style="width: 100%">
            <el-table-column type="selection" width="60"></el-table-column>
            <el-table-column type="index" label="序号" width="60"></el-table-column>
            <el-table-column prop="code" label="车位编号" ></el-table-column>
            <el-table-column prop="mode" label="车位类型" :formatter="modeFormat"></el-table-column>
            <el-table-column prop="propertyRight" label="车位产权" :formatter="propeFormat"></el-table-column>
            <el-table-column prop="carportEnable" label="是否可用" :formatter="enableFormat"></el-table-column>
            <el-table-column prop="remark" label="备注" min-width="100" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column fixed="right" label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="small" @click="editCarSeat(scope.$index,scope.row)" >修改</el-button>
                <el-button type="danger" size="small" @click="delCarSeat(scope.$index,scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-col class="toolbar">
            <el-pagination @size-change="seatSizeChange" @current-change="seatFindPage" :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
          </el-col>
        </div>
      </el-main>
    </el-container>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :before-close="closeDialog">
      <el-form ref="carSeatForm" :model="carSeatForm" :rules="rules" label-width="200px" id="carSeatForm">
        <el-form-item label="车位编号" prop="code">
          <el-input v-model="carSeatForm.code" style="width:60%;" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="车位类型">
          <el-select :disabled="false" v-model="carSeatForm.mode" @change = "changeSelect">
            <el-option v-for="item in carModeOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="车位产权" prop="propertyRight">
          <el-select :disabled="false" v-model="carSeatForm.propertyRight">
            <el-option
              v-for="item in propertOpt"
              :key="item.propValue"
              :label="item.label"
              :value="item.propValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否可用" prop="carportEnable">
          <el-select :disabled="false" v-model="carSeatForm.carportEnable">
            <el-option
              v-for="item in enableOpt"
              :key="item.enableValue"
              :label="item.label"
              :value="item.enableValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="绑定车位探测器设备">
          <el-input v-model="carSeatForm.detectorName" style="width:60%;" :disabled = "true"></el-input>
          <i class="el-icon-search" @click="openDevice('detector')" title="选择车位探测器设备"></i>
        </el-form-item>
        <el-form-item label="绑定车牌显示器设备">
          <el-input v-model="carSeatForm.screenName" style="width:60%;" :disabled = "true"></el-input>
          <i class="el-icon-search" @click="openDevice('screen')" title="选择车牌显示器设备"></i>
        </el-form-item>
        <el-form-item label="自定义车牌显示屏显示信息：">
          <el-input type="textarea" :maxlength = "256" :rows = "2" v-model="carSeatForm.screenInfo"></el-input>
        </el-form-item>	
        <el-form-item label="绑定车位锁设备" prop="lockName">
          <el-input v-model="carSeatForm.lockName" style="width:60%;"></el-input>
          <i class="el-icon-search" @click="openDevice('lock')" title="选择车位锁设备"></i>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :maxlength = "256" :rows = "3" v-model="carSeatForm.remark"></el-input>
        </el-form-item>				
        <el-form-item style="text-align: right">
          <el-button @click="cannelDialog('carSeatForm')">取 消</el-button>
          <!-- <el-button type="primary" @click="resetData('carSeatForm')" id="resetForm">重置</el-button> -->
          <el-button type="primary" @click="saveData('carSeatForm')">保  存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog :title="innerTitle" :visible.sync="detectorVisible" append-to-body>
      <section>
        <div class="tree-left">
          <el-tree :data="treeData" node-key="uuid" ref="tree" highlight-current :props="defaultProps" @node-click="orgDeviceNodeClick" style="width:800px;"></el-tree>
        </div>
        <div class="table-right">
          
          <el-form :inline="true">
          <el-form-item>
            <el-input placeholder="请输入设备编号|名称" v-model="queryDeviceValue"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryByDeviceName">查询</el-button>
          </el-form-item>
        </el-form>
          <div class="table-scroll">
            <el-table :data="dataDevice" @current-change="handleCurrentChangeDevice" highlight-current-row max-height = "400" style="width:100%">
              <!-- <el-table-column type="index" label="序号" width="80px">
              </el-table-column> -->
              <el-table-column type="selection" width="60px" :selectable="selectable"></el-table-column>
              <el-table-column prop="deviceID" :show-overflow-tooltip="true" label="设备编号" width="100px">
              </el-table-column>
              <el-table-column prop="deviceName" :show-overflow-tooltip="true" label="设备名" width="100px">
              </el-table-column>
              <el-table-column prop="deviceModel" :show-overflow-tooltip="true" label="型号" width="100px">
              </el-table-column>
              <el-table-column prop="deviceIP" :show-overflow-tooltip="true" label="设备IP"  width="130px">
              </el-table-column>
              <el-table-column prop="deviceStatus" label="绑定状态" :formatter="modeDeviceStatusFormat">
              </el-table-column>
            </el-table>
          </div>
        </div>
      </section>
      <section slot="footer" class="dialog-footer" style="text-align:right">
        <el-button @click="detectorVisible = false">取 消</el-button>
        <el-button type="primary" @click="selectOrg">确认</el-button>
      </section>
    </el-dialog>
  </div>
</template>
<script>
import Upload from './Upload'
import {
  // queryParkList,
  addParkSeat,
  editParkSeat,
  batchDelSeat,
  queryParkSeatByKey,
  updateParkSeatEnable,
  getOrgInfo,
  queryDeviceByOrgId,
  carDictData,
  parkIsExist
} from '@/views/ParkingLotApp/apis'
export default {
  components: {
    Upload
  },
  data () {
    var isExist = (rule, value, callback) => {
      parkIsExist(value).then(function (response) {
        let errorcode = response.code
        if (errorcode === '0') {
          if (response.data.isExist) {
            callback(new Error('该车位编号已存在!'))
          } else {
            callback()
          }
        }
      })
    }
    var isChecked = (rule, value, callback) => {
      let patrn = /^[0-9a-zA-Z]+$/
      if (patrn.test(value) || value === '') {
        callback()
      } else {
        callback(new Error('只能是字母、数字'))
      }
    }
    return {
      queryValue: '',
      queryDeviceValue: '',
      defaultOrgId: '',
      currentPage: 1,
      tableData: [],
      selections: [],
      selectDevice: [],
      dataDevice: [],
      total: 0,
      pageSize: 10,
      defaultId: '',
      dialogVisible: false,
      leadingDialogVisible: false,
      detectorVisible: false,
      isSelectOrg: false,
      seatLoad: true,
      innerTitle: '',
      treeData: [],
      dialogTitle: '新增车位',
      isEdit: false,
      queryType: '-1',
      carModeOpt: [],
      propertOpt: [
        {
          propValue: '0',
          label: '公共产权'
        },
        {
          propValue: '1',
          label: '个人产权'
        }
      ],
      carportOpt: [
        {
          carPortValue: '0',
          label: '未分配'
        },
        {
          carPortValue: '1',
          label: '已分配'
        }
      ],
      enableOpt: [
        {
          enableValue: '1',
          label: '正常'
        },
        {
          enableValue: '0',
          label: '不可用'
        }
      ],
      // defaultProps: {
      //   children: 'subParkingLots',
      //   label: 'parkingName'
      // },
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf'
      },
      carSeatForm: {
        id: '',
        name: '',
        code: '',
        mode: '0',
        propertyRight: '',
        location: '',
        detectorCode: '',
        screenCode: '',
        lockCode: '',
        screenInfo: '',
        remark: '',
        detectorName: '',
        screenName: '',
        lockName: '',
        carportEnable: ''
      },
      options: [
        {
          value: '-1',
          label: '全部'
        },
        {
          value: '0',
          label: '不可用'
        },
        {
          value: '1',
          label: '正常'
        }
      ],
      rules: {
        code: [
          { required: true, message: '请输入车位编号', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
          { validator: isExist, trigger: 'blur' },
          { validator: isChecked, trigger: 'blur' }
        ],
        lockName: [
          { validator: isChecked, trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.loadTreeData()
    this.getCarDictData()
  },
  methods: {
    queryByDeviceName () {
      let _this = this
      let key = _this.queryDeviceValue
      key = encodeURI(key)
      _this.dataDevice = []
      queryDeviceByOrgId(_this.defaultOrgId, key, _this.selectName).then(function (response) {
        if (response.code === '0' && response.data !== null) {
          for (let devices of response.data) {
            console.log(_this.selectName)
            // if (_this.selectName === 'detector' && (devices.deviceTypeCode === '2007' || devices.deviceTypeCode === '2022' || devices.deviceTypeCode === '3040')) {
            //   _this.dataDevice.push(devices)
            // } else if (_this.selectName === 'screen' && (devices.deviceTypeCode === '3033' || devices.deviceTypeCode === '3034')) {
            //   _this.dataDevice.push(devices)
            // } else if (_this.selectName === 'lock') {
            //   _this.dataDevice.push(devices)
            // }
            _this.dataDevice.push(devices)
          }
          console.log(_this.dataDevice)
          // _this.deviceInfo.deviceName = response.data.deviceName
          // _this.deviceInfo.deviceModel = response.data.deviceModel
          // _this.deviceInfo.deviceIP = response.data.deviceIP
          // console.log(_this.deviceInfo)
        } else {
          _this.dataDevice = []
        }
      })
    },
    modeDeviceStatusFormat (row, column) {
      var state = row.deviceStatus
      if (state === true) {
        return '已绑定'
      } else if (state === false) {
        return '未绑定'
      }
      return '未绑定'
    },
    selectable (row, index) {
      return !row.deviceStatus
    },
    getCarDictData () { // 获取下拉框的基础数据
      let _this = this
      carDictData()
        .then(function (response) {
          let errorcode = response.code
          if (errorcode === '0') {
            _this.carModeOpt = _this.formatString(response.data.CAR_MODE_DICT)
          } else {
            _this.$message.error(response.data.errormsg)
          }
        })
        .catch(() => {})
    },
    formatString (dataString) {
      let keyArrs = []
      let valuArrs = []
      let dataArrObj = []
      for (let keyArr in dataString) {
        keyArrs.push('"' + keyArr + '"')
      }
      for (let valueArr in dataString) {
        valuArrs.push('"' + dataString[valueArr] + '"')
      }
      for (let i = 0; i < keyArrs.length; i++) {
        let arrObj = '{value:' + keyArrs[i] + ',label:' + valuArrs[i] + '}'
        dataArrObj.push(this.myEval(arrObj))
      }
      return dataArrObj
    },
    myEval (str) {
      let Fn = Function
      return new Fn('return ' + str)()
    },
    loadTreeData () {
      this.loading2 = true
      var _this = this
      _this.getOrgInfo()
    },
    getOrgInfo () {
      let _this = this
      getOrgInfo()
        .then(function (response) {
          _this.defaultId = response.data.uuid
          if (response.code === '0') {
            _this.queryByNum()
            _this.treeData.push(response.data)
          } else {
            _this.treeData = []
            _this.tableData = []
            _this.seatLoad = false
          }
        })
        .catch((error) => {
          console.log(error)
          _this.tableData = []
          _this.seatLoad = false
        })
    },
    handleNodeClick (data) {
      this.isSelectOrg = true
      this.defaultId = data.uuid
      this.carSeatList(this.currentPage, this.pageSize, data.uuid)
    },
    typeChange () {  // 查询
      this.queryByNum()
    },
    // 导入
    parkSeatUpload: function () {
      if (this.isSelectOrg) {
        this.$refs['parkSeatUpload'].openDialog()
      } else {
        this.$message({
          message: '请选择组织',
          type: 'warning'
        })
      }
    },
    // 查询车位
    queryByNum () {
      var _this = this
      _this.seatLoad = true
      let key = _this.queryValue.trim()
      key = encodeURI(key)
      queryParkSeatByKey(_this.currentPage, _this.pageSize, key, _this.queryType, _this.defaultId).then(function (response) {
        _this.seatLoad = false
        if (response.code === '0') {
          _this.tableData = response.data.rows
          _this.total = response.data.total
        }
      }).catch(function () {
        _this.seatLoad = false
      })
    },
    openDevice (deveName) {
      this.selectName = deveName
      this.detectorVisible = true
      this.queryValue = ''
      if (deveName === 'detector') {
        this.innerTitle = '选择车位探测器设备'
        this.getDeviceByOrgId(this.treeData[0].uuid)
      } else if (deveName === 'screen') {
        this.innerTitle = '选择车牌显示器设备'
        this.getDeviceByOrgId(this.treeData[0].uuid)
      } else if (deveName === 'lock') {
        this.innerTitle = '选择车位锁设备'
        this.getDeviceByOrgId(this.treeData[0].uuid)
      }
    },
    carSeatList (currentPage, pageSize, parkId) {
      this.loading2 = true
      var _this = this
      let key = _this.queryValue
      queryParkSeatByKey(_this.currentPage, _this.pageSize, key, _this.queryType, _this.defaultId)
        .then(function (response) {
          if (response.code === '0') {
            _this.tableData = response.data.rows
            _this.total = response.data.total
          }
        })
        .catch(
          function (error) {
            this.loading2 = false
            console.log(error)
          }.bind(this)
        )
    },
    handleRemove (file, fileList) {
      console.log(file, fileList)
    },
    handlePreview (file) {
      console.log(file)
    },
    changeSelect (val) {
      this.carSeatForm.mode = val
    },
    modeFormat (row, column) {
      var mode = row.mode
      var modeName = ''
      var carModeOpt = this.carModeOpt
      for (var i = 0; i < carModeOpt.length; i++) {
        if (mode === carModeOpt[i].value) {
          modeName = carModeOpt[i].label
          break
        }
      }
      return modeName
    },
    propeFormat (row, column) {
      let prope = row.propertyRight
      if (prope === '0') {
        return '公共产权'
      } else if (prope === '1') {
        return '个人产权'
      }
    },
    enableFormat (row, column) {
      let prope = row.carportEnable
      if (prope === '0') {
        return '不可用'
      } else if (prope === '1') {
        return '正常'
      }
    },
    cannelDialog (carSeatForm) {
      this.$refs[carSeatForm].resetFields()
      this.dialogVisible = false
    },
    addCarSeat () {
      let _this = this
      if (_this.isSelectOrg) {
        _this.isEdit = false
        // _this.carSeatForm = {}
        _this.carSeatForm.code = ''
        _this.carSeatForm.remark = ''
        _this.carSeatForm.mode = '0'
        _this.carSeatForm.propertyRight = '0'
        _this.carSeatForm.carportEnable = '1'
        _this.dialogTitle = '新增车位'
        _this.carSeatForm.detectorCode = ''
        _this.carSeatForm.screenInfo = ''
        _this.carSeatForm.screenCode = ''
        _this.carSeatForm.lockCode = ''
        _this.carSeatForm.detectorName = ''
        _this.carSeatForm.screenName = ''
        _this.carSeatForm.lockName = ''
        _this.dialogVisible = true
      } else {
        _this.$message('请选择组织')
      }
    },
    leadingIn () {
      var _this = this
      _this.carSeatForm.remark = ''
      _this.dialogTitle = '导入车位信息'
      _this.leadingDialogVisible = true
    },
    editCarSeat (index, rows) {
      this.isEdit = true
      this.dialogTitle = '修改车位'
      console.log('rows' + JSON.stringify(rows))
      this.carSeatForm.id = rows.id
      this.carSeatForm.code = rows.code
      this.carSeatForm.mode = rows.mode
      this.carSeatForm.propertyRight = rows.propertyRight
      this.carSeatForm.remark = rows.remark
      this.carSeatForm.carportEnable = rows.carportEnable
      this.carSeatForm.location = rows.location
      this.carSeatForm.detectorCode = rows.detectorCode
      this.carSeatForm.screenInfo = rows.screenInfo
      this.carSeatForm.screenCode = rows.screenCode
      this.carSeatForm.lockCode = rows.lockCode
      this.carSeatForm.detectorName = rows.detectorName
      this.carSeatForm.screenName = rows.screenName
      this.carSeatForm.lockName = rows.lockName
      this.dialogVisible = true
    },
    // 保存数据
    saveData (seatForm) {
      var _this = this
      var _params = {
        id: _this.carSeatForm.id,
        name: _this.carSeatForm.name,
        orgId: _this.defaultId,
        code: _this.carSeatForm.code,
        mode: _this.carSeatForm.mode,
        propertyRight: _this.carSeatForm.propertyRight,
        location: _this.carSeatForm.location,
        carportEnable: _this.carSeatForm.carportEnable,
        screenInfo: _this.carSeatForm.screenInfo,
        detectorCode: _this.carSeatForm.detectorCode,
        screenCode: _this.carSeatForm.screenCode,
        lockCode: _this.carSeatForm.lockCode,
        remark: _this.carSeatForm.remark,
        detectorName: _this.carSeatForm.detectorName,
        screenName: _this.carSeatForm.screenName,
        lockName: _this.carSeatForm.lockName
      }
      console.log(_params)
      console.log(_this.$refs)
      if (this.isEdit) {
        editParkSeat({
          params: JSON.stringify(_params)
        })
          .then(function (response) {
            if (response.code === '0') {
              _this.$message({
                type: 'success',
                message: '修改成功'
              })
              _this.carSeatList(
              _this.currentPage,
              _this.pageSize,
              _this.defaultId
            )
              _this.$refs[seatForm].resetFields()
              _this.dialogVisible = false
            } else {
              _this.$alert('修改失败', '提示', {
                confirmButtonText: '确定',
                callback: action => {}
              })
            }
          })
          .catch(function () {})
      } else {
        _this.$refs.carSeatForm.validate(valid => {
          if (valid) {
            addParkSeat({
              params: JSON.stringify(_params)
            })
              .then(function (response) {
                if (response.code === '0') {
                  _this.$message({
                    type: 'success',
                    message: '增加成功'
                  })
                  _this.carSeatList(
                    _this.currentPage,
                    _this.pageSize,
                    _this.defaultId
                  )
                  _this.$refs[seatForm].resetFields()
                  _this.dialogVisible = false
                } else {
                  _this.$alert('增加失败', '提示', {
                    confirmButtonText: '确定',
                    callback: action => {}
                  })
                }
              })
              .catch(function () {})
          }
        })
      }
    },
    delCarSeat (index, rows) {
      var _this = this
      _this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          batchDelSeat(rows.id)
            .then(function (response) {
              if (response.code === '0') {
                _this.$message({
                  type: 'success',
                  message: '删除成功'
                })
                _this.carSeatList(_this.currentPage, _this.pageSize, _this.defaultId)
              } else if (response.code === 'parkinglot.carport.package.plate.number.repeate') {
                _this.$alert('车位已被授权，删除失败!', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {}
                })
              } else {
                _this.$alert('删除失败', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {}
                })
              }
            })
            .catch(() => {})
        })
        .catch(() => {
          _this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    batchCarSeat () {
      var _this = this
      let ids = []
      for (let i = 0; i < this.selections.length; i++) {
        ids.push(this.selections[i].id)
      }
      if (ids.length > 0) {
        _this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          batchDelSeat(ids)
            .then(function (response) {
              if (response.code === '0') {
                _this.$message({
                  type: 'success',
                  message: '删除成功'
                })
                _this.carSeatList(_this.currentPage, _this.pageSize, _this.defaultId)
              } else if (response.code === 'parkinglot.carport.package.plate.number.repeate') {
                _this.$alert('车位已被授权，删除失败!', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {}
                })
              } else {
                _this.$alert('删除失败', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {}
                })
              }
            })
            .catch(() => {})
        })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      } else {
        this.$message({
          type: 'info',
          message: '请选择需要删除的车位'
        })
      }
    },
    setEnable () {
      var _this = this
      let parkSeatEnable = []
      const map = new Map()
      for (let i = 0; i < this.selections.length; i++) {
        parkSeatEnable.push(this.selections[i].id + '@' + this.selections[i].carportEnable)
      }
      console.log('map' + [...map])
      _this.$confirm('此操作将永久修改车位信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(() => {
        updateParkSeatEnable(parkSeatEnable)
          .then(function (response) {
            if (response.code === '0') {
              _this.$message({
                type: 'success',
                message: '设置成功'
              })
              _this.carSeatList(_this.currentPage, _this.pageSize, _this.defaultId)
            } else if (response.code === '100') {
              _this.$message({
                type: 'fail',
                message: '选择车位包含可用或者不可用，请选择一致车位'
              })
            } else {
              _this.$alert('设置失败', '提示', {
                confirmButtonText: '确定',
                callback: action => {}
              })
            }
          })
          .catch(() => {})
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    getSelectData: function () {
      return this.selections
    },
    handleSelectionChange: function (val) {
      this.selections = val
    },
    seatSizeChange (val) {
      this.pageSize = val
      this.carSeatList(this.currentPage, this.pageSize, this.defaultId)
    },
    seatFindPage (val) {
      this.currentPage = val
      this.carSeatList(this.currentPage, this.pageSize, this.defaultId)
    },
    selectOrg () {
      if (this.selectName === 'detector') {
        this.carSeatForm.detectorCode = this.selectDevice.deviceID
        this.carSeatForm.detectorName = this.selectDevice.deviceName
      } else if (this.selectName === 'screen') {
        this.carSeatForm.screenCode = this.selectDevice.deviceID
        this.carSeatForm.screenName = this.selectDevice.deviceName
      } else if (this.selectName === 'lock') {
        this.carSeatForm.lockCode = this.selectDevice.deviceID
        this.carSeatForm.lockName = this.selectDevice.deviceName
      }
      this.detectorVisible = false
    },
    handleCurrentChangeDevice (val) {
      this.selectDevice = val
    },
    orgDeviceNodeClick (data) {
      console.log(data)
      this.getDeviceByOrgId(data.uuid)
      this.defaultOrgId = data.uuid
      // this.queryByDeviceName(data.uuid)
    },
    closeDialog (done) {
      done()
      this.$refs['carSeatForm'].resetFields()
    },
    getDeviceByOrgId (orgId) {
      let _this = this
      _this.dataDevice = []
      queryDeviceByOrgId(orgId, '', _this.selectName).then(function (response) {
        if (response.code === '0' && response.data !== null) {
          for (let devices of response.data) {
            console.log(_this.selectName)
            // if (_this.selectName === 'detector' && (devices.deviceTypeCode === '2007' || devices.deviceTypeCode === '2022' || devices.deviceTypeCode === '3040')) {
            //   _this.dataDevice.push(devices)
            // } else if (_this.selectName === 'screen' && (devices.deviceTypeCode === '3033' || devices.deviceTypeCode === '3034')) {
            //   _this.dataDevice.push(devices)
            // } else if (_this.selectName === 'lock') {
            //   _this.dataDevice.push(devices)
            // }
            _this.dataDevice.push(devices)
          }
          console.log(_this.dataDevice)
          // _this.deviceInfo.deviceName = response.data.deviceName
          // _this.deviceInfo.deviceModel = response.data.deviceModel
          // _this.deviceInfo.deviceIP = response.data.deviceIP
          // console.log(_this.deviceInfo)
        } else {
          _this.dataDevice = []
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/views/ParkingLotApp/assets/css/parkLotApp.less";
.toolbar {
  margin-top: 15px;
  text-align: right;
}
.tree-cont {
  float: left;
}
.table-cont {
  float: left;
}
.tree-left{
  display: inline-block;
  vertical-align: top;
  width: 30%;
  height: 500px;
  overflow: auto;
}
.table-right{
  display: inline-block;
  vertical-align: top;
  width: 68%;
}

</style>
