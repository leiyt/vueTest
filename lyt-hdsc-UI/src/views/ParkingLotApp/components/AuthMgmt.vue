<template>
    <el-main>
      <div>
      <section class="from-btns">
        <el-button type="primary" @click="addAuth" >新增</el-button>      
        <el-button type="danger" @click="deleteAuth">删除</el-button>	
      </section>
      <el-form :model="queryForm" ref="queryForm" :rules="searchRules" :inline="true" style="line-height:40px">
        <span class="label-text">车牌号</span>
        <el-form-item prop="queryCarNum">
            <el-input placeholder="请输入车牌号" v-model.trim="queryForm.queryCarNum" @blur="blurInput" ref="queryCarNum" style="width:100%"></el-input>
        </el-form-item>
        <span class="label-text">车位编号</span>
        <el-form-item prop="queryParkSeatCode">
            <el-input placeholder="请输入车位编号" v-model.trim="queryForm.queryParkSeatCode" ref="queryParkSeatCode" style="width:100%"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="queryByNum">查询</el-button>
        </el-form-item>
      </el-form>
        <el-table :data="authData" ref="authData" max-height="720" @selection-change="handleSelectionChange" border style="width: 100%">
          <el-table-column type="selection" width="60"></el-table-column>
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="ownerName" label="业主姓名" ></el-table-column>
          <el-table-column prop="carNum" label="车牌号" min-width="100" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="cardNo" label="卡号" min-width="80" :show-overflow-tooltip="true" ></el-table-column>
          <el-table-column prop="authParkNames" min-width="160" label="停车场名" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="ruleName" label="规则" min-width="100" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="parkSeatCode" label="车位编号" min-width="100" :show-overflow-tooltip="true" ></el-table-column>
          <el-table-column prop="beginTime" label="开始时间" width="160" ></el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="160" ></el-table-column>
          <el-table-column prop="remark" label="备注" min-width="100" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column fixed="right" label="操作" fit="true" width="220">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="editAuth(scope.$index,scope.row)">修改</el-button>
              <el-button size="mini" type="primary" @click="carPay(scope.$index,scope.row)">缴费</el-button>
              <el-button size="mini" type="primary" @click="paymentRecord(scope.$index,scope.row)">记录</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-col class="toolbar">
          <el-pagination :current-page="currentPage" @size-change="handleSizeChange" @current-change="findPage" :page-sizes="[10, 20, 50, 100]" :page-size="10" background layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </el-col>
        <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="50%" :before-close="closeDialog">
          <el-form ref="addAuthform" :model="addAuthform" :rules = "addAuthRules" label-width="80px">
            <el-form-item label="业主" prop="name">
              <el-input v-model="addAuthform.name" :disabled="true"></el-input>
              <i class="el-icon-search" @click="selectFrom('auth')" v-show="isAdd"></i>
            </el-form-item>
            <el-form-item label="授权类型" prop="authStyle" v-show="isAdd">
              <el-radio-group v-model="authStyle" @change="choiseStyle">
                <el-radio :label="0">车牌号</el-radio>
                <el-radio :label="1">卡号</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="卡号" prop="cardNum" v-if="choiseCard">
              <el-input v-model="addAuthform.cardNum" :disabled="true"></el-input>
              <i class="el-icon-search" @click="selectFrom('card')"></i>
            </el-form-item>
            <el-form-item label="车牌号" prop="car" v-else>
              <el-input v-model="addAuthform.car" :disabled="true"></el-input>
              <i class="el-icon-search" @click="selectFrom('car')"></i>
            </el-form-item>
            <el-form-item label="停车场" prop="parks">
              <el-input v-model="addAuthform.parks" :disabled="true"></el-input>
              <i class="el-icon-search" @click="selectFrom('park')"></i>
            </el-form-item>
            <el-form-item label="车位" prop="parkSeatCode">
              <el-input v-model="addAuthform.parkSeatCode" :disabled="true"></el-input>
              <i class="el-icon-search" @click="selectFrom('seat')"></i>
            </el-form-item>
            <el-form-item label="车位类型" prop="parkSeatType">
              <el-select v-model="addAuthform.parkSeatType" placeholder="请选择">
                <el-option
                v-for="item in seatStyle"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="规则" prop="ruleId">
              <el-select v-model="addAuthform.ruleId" placeholder="请选择" :disabled = "!isAdd">
                <el-option
                v-for="item in ruleOpt"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <!-- <el-checkbox v-model="addAuthform.authPay" class="pay-checkbox">立即缴费</el-checkbox>
            <section v-show="addAuthform.authPay">
              <el-form-item label="月数" style="width:30%">
                <el-input v-model="addAuthform.name"></el-input>
              </el-form-item>
              <el-form-item label="缴费" style="width:30%">
                <el-input v-model="addAuthform.name"></el-input>
                <em class="price-unit">元</em>
              </el-form-item>
              <el-form-item label="开始时间" style="width:30%">
                <el-input v-model="addAuthform.name"></el-input>
              </el-form-item>
              <el-form-item label="结束时间" style="width:30%">
                <el-input v-model="addAuthform.name"></el-input>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="addAuthform.name"></el-input>
              </el-form-item>              
            </section>-->
            <el-form-item label="备注">
                <el-input type="textarea" v-model="addAuthform.remark"></el-input>
              </el-form-item> 
            <el-form-item style="text-align:right;">
              <el-button @click="cannelAuth">取 消</el-button>
              <!-- <el-button @click="resetForm('addAuthform')">重置</el-button> -->
              <el-button type="primary" @click="saveAuth">保 存</el-button>
            </el-form-item>
          </el-form>
          <!-- <el-dialog width="50%" :title="innerTitle" :visible.sync="innerVisible" append-to-body>
            <owner ref="diaglo" v-if="isAuth"></owner>
            <section slot="footer" class="dialog-footer" style="text-align:right">
              <el-button @click="innerVisible = false">取 消</el-button>
              <el-button type="primary" @click="selectOwer">确认</el-button>
            </section>
          </el-dialog> -->
        </el-dialog>
        <el-dialog width="50%" :title="dialogData" :visible.sync="innerCardVisible" append-to-body>
          <owner ref="diaglo" v-show="selectName ==='auth'"></owner>
          <section v-show="selectName ==='card'"> 
            <el-table :data="authCardData" ref="authCardForm" highlight-current-row  @current-change="handleCurrentCard" style="width: 100%">
              <el-table-column width="60" type="index" label="序号"></el-table-column>
              <el-table-column prop="cardNo" label="卡号" ></el-table-column>
              <el-table-column prop="cardType" label="卡类型"></el-table-column>
            </el-table>
          </section>
          <section v-show="selectName === 'car'"> 
            <el-table :data="authCarData" ref="authBaseData" highlight-current-row max-height="400" 
              @selection-change="carCurrentChange" style="width: 100%" class="auth-car-table">
              <el-table-column type="selection"></el-table-column>
              <el-table-column width="60" type="index" label="序号"></el-table-column>
              <el-table-column prop="carNum" label="车牌号" ></el-table-column>
              <el-table-column prop="carMode" label="车型" :formatter="carModeFormat"></el-table-column>
              <el-table-column prop="type" label="类型" :formatter="typeFormat"></el-table-column>
              <el-table-column prop="remark" label="备注"></el-table-column>
            </el-table>
          </section>
          <section v-show="selectName === 'park'">
            <div class="park-dialog">
              <el-tree :props="defaultProps" ref="parkTree" height="400" default-expand-all :data="parkTreeData" 
              node-key="parkingName" show-checkbox  @check-change="handleTreeChange"></el-tree>
            </div>
          </section>
          <section v-show="selectName === 'seat'">
            <div class="org-leftTree">
              <el-tree :data="selectParkTreeData" ref="seatParkTree" :props="defaultProps" default-expand-all @node-click="orgNodeClick" style="width:800px;"></el-tree>
            </div> 
            <article class="seatTable">
              <el-form :inline="true">
                <el-form-item><el-input placeholder="请输入车位编号" v-model="formParkSeatCode" style="width:100%"></el-input></el-form-item>
                <el-form-item> <el-button type="primary" @click="querySeat">查询</el-button></el-form-item>
              </el-form>
                <el-table :data="authSeatData" ref="authSeatForm" highlight-current-row max-height="320" 
                  @current-change="selectAuthSeat" style="width: 100%" class="seat-table">
                  <el-table-column type="index" label="序号" width="60"></el-table-column>
                  <el-table-column prop="code" label="车位编号" ></el-table-column>
                  <el-table-column prop="status" label="车位类型" ></el-table-column>
                  <el-table-column prop="remark" label="备注"></el-table-column>
                </el-table>
              <el-col class="toolbar" style="text-align:right; margin:15px 0">
                <el-pagination @size-change="authSeatSizeChange"  @current-change="seatCurrentChange" :current-page="seatCurrPage" :page-sizes="[10, 20, 50, 100]" :page-size="10" background layout="total, sizes, prev, pager, next" :total="seatTotal">
                </el-pagination>
              </el-col> 
            </article>
          </section>
          <section slot="footer" class="dialog-footer" style="text-align:right">
            <el-button @click="innerCardVisible = false">取 消</el-button>
            <el-button type="primary" @click="selectCardBtn">确认</el-button>
          </section>
        </el-dialog>
        <!-- 缴费弹出框 -->
        <el-dialog :title="payTitle" :visible.sync="dialogPayVisible" class="pay-popwin">
          <el-form :inline="true" ref="payAuthform" :model="payAuthform" :rules = "payAuthRule" label-width="120px" v-if="dialogPay">
            <el-form-item label="业主姓名">
              <el-input v-model="payAuthform.ownerName" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="车牌号" v-if="payAuthform.carNum != ''">
              <el-input v-model="payAuthform.carNum" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="卡号"  v-if="payAuthform.carNum == ''">
              <el-input v-model="payAuthform.cardNo" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="车位编码">
              <el-input v-model="payAuthform.seatCode" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="规则">
              <el-input v-model="payAuthform.rule" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="生效时间" v-if="payAuthform.startTime != ''" >
              <span v-text="payAuthform.startTime" class="disabled-text"></span>
            </el-form-item>
            <el-form-item label="失效时间" v-if="payAuthform.endTime != ''" >
              <span v-text="payAuthform.endTime" class="disabled-text"></span>
            </el-form-item>
            <el-form-item label="开始时间" v-if="payAuthform.startTime == ''" prop="beginTime">
              <div class="block">
                <el-date-picker
                  v-model="payAuthform.beginTime" :editable="false"
                  type="datetime"
                  placeholder="选择日期时间" value-format="yyyy-MM-dd HH:mm:ss" :picker-options="pickerBeginDateAfter">
                </el-date-picker>
              </div>
            </el-form-item>
            <el-form-item label="缴费单位" style=" width:100%">
              <span v-text="payAuthform.payPrice" class="disabled-text"></span>
            </el-form-item>
            <el-form-item label="缴费数量" prop="amount">
              <el-input-number v-model="payAuthform.amount" :min="1" :max="10" @change="selectPrice"></el-input-number>
            </el-form-item>
            <el-form-item label="应缴金额" prop="payMoney">
              <el-input v-model="payAuthform.payMoney" :disabled="true"></el-input>
            </el-form-item>
            <!-- <el-form-item label="支付方式">
              <el-select v-model="payAuthform.payStyle" placeholder="请选择">
                <el-option
                v-for="item in payStyle"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
              </el-select>
            </el-form-item> -->
            <el-form-item label="备注" class="pay-ramker" style="width:100%">
              <el-input type="textarea" v-model="payAuthform.remark"></el-input>
            </el-form-item>
            <el-form-item style="text-align:right;width:100%">
              <el-button @click="dialogPayVisible = false">取 消</el-button>
              <el-button type="primary" @click="toPay('payAuthform')">缴 费</el-button>
            </el-form-item>
          </el-form>
          <div v-else>
            <el-table :data="recordData" border style="width: 100%" max-height="500">
              <el-table-column type="index"></el-table-column>
              <el-table-column prop="ownerName" label="业主姓名"></el-table-column>
              <el-table-column prop="carNum" label="车牌号"></el-table-column>
              <el-table-column prop="cardNo" label="卡号"></el-table-column>
              <el-table-column prop="parkSeatCode" label="车位编号" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column prop="chargeMoney" label="缴费金额"></el-table-column>
              <el-table-column prop="chargeTime" label="缴费时间" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column prop="remark" label="备注" :show-overflow-tooltip="true"></el-table-column>
            </el-table>
            <el-col class="toolbar" style="text-align:right; margin:15px 0">
              <el-pagination @size-change="paymentRecordSizeChange" @current-change="paymentRecordCurrentChange" :current-page="paymentRecordCurrentPage" :page-sizes="[10, 20, 50, 100]" :page-size="10" background layout="total, sizes, prev, pager, next" :total="paymentRecordTotal">
              </el-pagination>
            </el-col>
            <span slot="footer" class="text-center">
              <el-button type="primary" @click="dialogPayVisible = false">关 闭</el-button>
            </span>
          </div>
        </el-dialog>
      </div>
    </el-main>
</template>
<script>
import owner from '@/views/ParkingLotApp/components/dialogs/Owner'
import { queryAuth, addAuth, editAuth, deleteAuthById, getMonthRule, getPayMent, toPay, getCardNoByOwnerId, queryParkList, queryCarsByOwnerId, getOrgInfo, queryUnAuthParkSeat, paymentRecord } from '@/views/ParkingLotApp/apis'

export default {
  components: { owner },
  data () {
    let queryValid = (rule, value, callback) => {
      let regexp = new RegExp("[`·~!@#$%+^&*\\-_()=|{}'/\\\\:;'\"\",\\[\\].<>/?！#￥……&*（）——【】‘’；：”“。，、？]")
      if (regexp.test(value)) {
        callback(new Error('请勿输入特殊字符'))
      } else {
        callback()
      }
    }
    return {
      authData: [],
      authCardData: [],
      authCarData: [],
      parkTreeData: '',
      authSeatData: [],
      recordData: [],
      orgTreeData: [],
      selectParkTreeData: [],
      queryValueCar: '',
      carStatus: '',
      payAuthform: {
        authId: '',      //  id
        ownerName: '',   //  业主姓名
        ownerId: '',     //  业主ID
        carNum: '',      //  车牌号
        cardNo: '',      // 卡号
        seatCode: '',    //  车位编号
        rule: '',        //  规则
        startTime: '',   //  服务开始时间
        endTime: '',     //  服务结束时间
        beginTime: '',   // 第一次缴费，授权开始时间
        payPrice: '',    //  金额
        paypriceVal: '', //  金额值
        payUnit: '', // 缴费单位
        amount: '',       //  数量
        payMoney: ''    //  应缴金额
      },
      addAuthform: {
        name: '',
        car: '',
        parks: '',
        cardNum: '',
        parksCodes: '',
        parkSeatCode: '',
        parkSeatType: '',
        ruleId: '',
        remark: ''
      },
      authStyle: 0,
      seatStyle: [{
        value: '1',
        label: '月保车位'
      }, {
        value: '2',
        label: '产权车位'
      }],
      ruleOpt: [],
      payStyle: [{
        value: '1',
        label: '微信'
      }, {
        value: '2',
        label: '支付宝'
      }],
      authId: '',
      queryForm: {
        queryCarNum: '',
        queryParkSeatCode: ''
      },
      seatByPark: '',
      formParkSeatCode: '',
      total: 0,
      sizes: 10,
      currentPage: 1,
      seatCurrPage: 1,
      seatSize: 10,
      seatTotal: 0,
      // loading: false,
      dialogFormVisible: false,
      dialogPayVisible: false,
      innerCardVisible: false,
      choiseCard: false,
      // recodeLoad: true,
      selectName: 'auth',
      dialogTitle: '新增授权',
      innerTitle: '选择业主',
      payTitle: '缴费',
      dialogData: '选择卡号',
      dialogPay: true,
      selectAuth: [],
      selectParkCode: [],
      selectCardVal: [],
      selectParkData: [],
      selectCarData: [],
      selectSeatData: {},
      parkOrgId: '',
      ownerId: '',
      isAdd: false,
      innerVisible: false,
      addAuthRules: {
        name: [
          { required: true, message: '请选择业主', trigger: 'change' }
        ],
        car: [
          { required: true, message: '请选择授权车辆', trigger: 'change' }
        ],
        cardNum: [
          { required: true, message: '请选择卡号', trigger: 'change' }
        ],
        parks: [
          { required: true, message: '请选择授权停车场', trigger: 'change' }
        ],
        parkSeatCode: [
          { required: true, message: '请选择授权车位', trigger: 'change' }
        ],
        parkSeatType: [
          { required: true, message: '请选择车位类型', trigger: 'change' }
        ],
        ruleId: [
          { required: true, message: '请输选择授权规则', trigger: 'change' }
        ]
      },
      payAuthRule: {
        beginTime: [
          { required: true, message: '请输入开始时间', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '请输入数量', trigger: 'blur' },
          {pattern: /^[0-9]*[1-9][0-9]*$/, message: '只能输入数字'}
        ]
      },
      searchRules: {
        queryCarNum: [
          {validator: queryValid, trigger: 'change'}
        ],
        queryParkSeatCode: [
          {validator: queryValid, trigger: 'change'}
        ]
      },
      pickerBeginDateAfter: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      defaultProps: {
        children: 'subParkingLots',
        label: 'parkingName'
      },
      orgTreeProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf'
      },
      paymentRecordPageSize: 10,
      paymentRecordCurrentPage: 1,
      paymentRecordTotal: 0,
      paymentRecordAuthId: ''
    }
  },
  mounted () {
    this.loadAuthList(this.currentPage, this.sizes, this.queryForm.queryCarNum, this.queryForm.queryParkSeatCode) // 获取权限数据
    this.getMonthRule()  // 获取月卡规则
    this.loadParkData() // 获取车场
    this.getOrgInfo()  // 获取组织树
  },
  methods: {
    loadAuthList (currentPage, sizes, queryCarNum, queryParkSeatCode) {
      let _this = this
      // _this.loading = true
      queryCarNum = queryCarNum.trim()
      queryParkSeatCode = queryParkSeatCode.trim()
      queryAuth(currentPage, sizes, queryCarNum, queryParkSeatCode)
        .then(function (response) {
          // _this.loading = false
          var errorcode = response.code
          if (errorcode === '0') {
            _this.authData = response.data.rows
            _this.total = response.data.total
          } else {
            _this.$message.error(response.data.errormsg)
          }
        })
        .catch(function (error) {
          // this.loading = false
          console.log(error)
        }
      )
    },
    queryByNum () {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.loadAuthList(this.currentPage, this.sizes, this.queryForm.queryCarNum, this.queryForm.queryParkSeatCode)
        }
      })
    },
    getMonthRule () {
      let _this = this
      getMonthRule()
        .then(function (response) {
          var errorcode = response.code
          if (errorcode === '0') {
            _this.ruleOpt = _this.formatString(response.data.MONTH_CAR_RULE)
          } else {
            _this.$message.error(response.data.errormsg)
          }
        })
    },
    getOrgInfo () { // 获取组织树
      let _this = this
      getOrgInfo()
        .then(function (response) {
          _this.defaultId = response.data.uuid
          if (response.code === '0') {
            _this.orgTreeData = response.data
          }
        })
        .catch(() => {})
    },
    handleSelectionChange (val) {
      this.selectAuth = val
    },
    selectAuthSeat (val) {
      this.selectSeatData = val
    },
    addAuth () {
      // 清空上次填的信息
      this.addAuthform.name = ''
      this.addAuthform.car = ''
      this.addAuthform.parks = ''
      this.addAuthform.cardNum = ''
      this.addAuthform.parksCodes = ''
      this.addAuthform.parkSeatCode = ''
      this.addAuthform.ruleId = ''
      this.addAuthform.remark = ''

      this.addAuthform.parkSeatType = '1'
      this.dialogTitle = '新增授权'
      this.selectParkCode = []
      this.dialogFormVisible = true
      this.choiseCard = false
      this.authStyle = 0
      this.isAdd = true
    },
    loadCardData (ownerId) {
      var _this = this
      getCardNoByOwnerId(ownerId).then(function (response) {
        var code = response.code
        if (code === '0') {
          _this.authCardData = response.data
        }
      })
    },
    deleteAuth () {
      let _this = this
      let authIds = []
      for (let i = 0; i < _this.selectAuth.length; i++) {
        authIds.push(_this.selectAuth[i].id)
      }
      if (authIds.length < 1) {
        _this.$message('请选择需要删除的授权信息')
        return false
      }
      _this
        .$confirm('是否要删除此授权信息', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          deleteAuthById(authIds)
            .then(function (response) {
              var errorcode = response.code
              if (errorcode === '0') {
                _this.$message({
                  message: '删除成功',
                  type: 'success'
                })
                _this.loadAuthList(_this.currentPage, _this.sizes, _this.queryForm.queryCarNum, _this.queryForm.queryParkSeatCode)
              } else {
                _this.$alert('删除失败', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {}
                })
              }
            })
            .catch(() => {})
        })
        .catch(() => {})
    },
    saveAuth () {
      let _this = this
      let parks = ''
      if (_this.selectParkCode.length !== 0) {
        parks = _this.selectParkCode.toString()
      } else {
        parks = _this.addAuthform.authParkCodes
      }
      let paramsData = {
        id: '', // 授权ID
        ownerId: _this.ownerId, // 业主ID
        cars: _this.addAuthform.car, // 授权车牌号
        cardNo: _this.addAuthform.cardNum,
        parks: parks, // 授权车场编号
        parkSeatCode: _this.addAuthform.parkSeatCode, // 授权车位编号
        parkSeatType: _this.addAuthform.parkSeatType, // 授权车位类型,1:月保,2：产权
        ruleId: _this.addAuthform.ruleId, // 规则ID
        remark: _this.addAuthform.remark // 备注
      }
      console.log('data ' + JSON.stringify(paramsData))
      if (_this.dialogTitle === '新增授权') {
        _this.$refs.addAuthform.validate((valid) => {
          if (valid) {
            addAuth({
              params: JSON.stringify(paramsData)
            }).then(function (response) {
              var errorcode = response.code
              if (errorcode === '0') {
                _this.dialogFormVisible = false
                _this.resetForm()
                _this.$message({
                  message: '保存成功！',
                  type: 'success'
                })
                _this.loadAuthList(_this.currentPage, _this.sizes, _this.queryForm.queryCarNum, _this.queryForm.queryParkSeatCode)
              } else {
                _this.dialogFormVisible = false
                _this.$message.error(response.message || '授权失败!')
              }
            })
          }
        })
      } else {
        paramsData.id = _this.authId
        _this.$refs.addAuthform.validate((valid) => {
          if (valid) {
            editAuth({
              params: JSON.stringify(paramsData)
            }).then(function (response) {
              var errorcode = response.code
              if (errorcode === '0') {
                _this.dialogFormVisible = false
                _this.$message({
                  message: '修改成功！',
                  type: 'success'
                })
                _this.loadAuthList(_this.currentPage, _this.sizes, _this.queryForm.queryCarNum, _this.queryForm.queryParkSeatCode)
              } else {
                _this.dialogFormVisible = false
                _this.$message.error(response.message || '修改授权信息失败!')
              }
            })
          }
        })
      }
    },
    editAuth (index, row) {
      console.log('row' + JSON.stringify(row))
      // 清空selectParkCode
      this.selectParkCode = []
      this.authId = row.id
      this.addAuthform.name = row.ownerName
      this.addAuthform.car = row.carNum
      this.addAuthform.cardNum = row.cardNo
      this.addAuthform.parks = row.authParkNames
      this.addAuthform.authParkCodes = row.authParkCodes
      this.addAuthform.parkSeatCode = row.parkSeatCode
      this.addAuthform.parkSeatType = row.parkSeatType
      this.addAuthform.remark = row.remark
      this.addAuthform.ruleId = row.ruleId
      this.ownerId = row.ownerId
      this.dialogTitle = '修改授权'
      if (row.carNum !== '') {
        this.choiseCard = false
      } else {
        this.choiseCard = true
      }
      this.dialogFormVisible = true
      this.isAdd = false
    },
    carPay (index, row) {
      let _this = this
      _this.dialogPayVisible = true
      _this.dialogPay = true
      _this.payTitle = '缴费'
      _this.payAuthform.ownerName = row.ownerName
      _this.payAuthform.authId = row.id
      _this.payAuthform.ownerId = row.ownerId
      _this.payAuthform.carNum = row.carNum    //  车牌号
      _this.payAuthform.cardNo = row.cardNo  // 卡号
      _this.payAuthform.seatCode = row.parkSeatCode  //  车位编号
      _this.payAuthform.rule = row.ruleName     //  规则
      _this.payAuthform.startTime = row.beginTime //  服务开始时间
      _this.payAuthform.endTime = row.endTime   //  服务结束时间
      _this.payAuthform.beginTime = ''
      _this.payAuthform.amount = ''
      _this.payAuthform.payMoney = ''
      _this.payAuthform.remark = ''
      getPayMent(_this.payAuthform.authId)
        .then(function (response) {
          _this.payAuthform.paypriceVal = response.data.billingUnitPrice
          _this.payAuthform.payPrice = (response.data.billingUnitPrice).toFixed(2) + ' ' + response.data.unitDesc // 缴费金额
          _this.payAuthform.payUnit = response.data.payUnit // 缴费单位
          _this.payAuthform.payMoney = response.data.billingUnitPrice
        })
        .catch(function (error) {
          console.log('获取缴费信息失败,error：' + error)
          _this.payAuthform.payPrice = ''
          _this.payAuthform.paypriceVal = ''
          _this.$message.error(error || '获取缴费信息失败')
        })
    },
    selectPrice (val) {
      if ((typeof Number(val) === 'number') && (typeof Number(this.payAuthform.payPrice) === 'number')) {
        this.payAuthform.payMoney = (Number(this.payAuthform.paypriceVal) * Number(val)).toFixed(2)
      }
    },
    toPay (payAuthform) { // 去缴费
      let _this = this
      let paramsData = _this.payAuthform
      console.log(JSON.stringify(paramsData))
      _this.$refs.payAuthform.validate((valid) => {
        if (valid) {
          toPay({
            params: JSON.stringify(paramsData)
          }).then(function (response) {
            var errorcode = response.code
            _this.$refs[payAuthform].resetFields()
            if (errorcode === '0') {
              _this.dialogPayVisible = false
              _this.loadAuthList(_this.currentPage, _this.sizes, _this.queryForm.queryCarNum, _this.queryForm.queryParkSeatCode)
              _this.$message({
                message: '缴费成功！',
                type: 'success'
              })
            } else {
              _this.dialogPayVisible = false
              _this.$message.error('缴费失败!')
            }
          })
        }
      })
    },
    loadCarData (ownerId) {
      let _this = this
      queryCarsByOwnerId(ownerId)
        .then(function (response) {
          let errorcode = response.code
          if (errorcode === '0') {
            _this.authCarData = response.data
          } else {
            _this.$message.error(response.data.errormsg)
          }
        })
        // .then(function () {
        //   // console.log('_this.selecrFormCar ' + _this.selecrFormCar + _this.authData)
        //   if (_this.selecrFormCar && _this.authData === 'car') {
        //     let carNumArr = _this.selecrFormCar.split(',')
        //     // console.log('carNumArr ' + carNumArr)
        //     for (let i = 0; i < _this.authCarData.length; i++) {
        //       if (carNumArr.indexOf(_this.authCarData[i].carNum) !== -1) {
        //         _this.$refs.authBaseData.toggleRowSelection(_this.authCarData[i])
        //       }
        //     }
        //   }
        // })
    },
    loadParkData () {
      let _this = this
      queryParkList()
        .then(function (response) {
          if (response.code === '0') {
            _this.parkTreeData = response.data
          } else {
            _this.$message.error('查询失败!')
          }
        })
        // .then(function () {
        //   let parksArr
        //   if (_this.selectParkName) {
        //     parksArr = _this.selectParkName.split(',')
        //     _this.$refs.tree.setCheckedKeys(parksArr)
        //   }
        // })
    },
    loadSeatData (currentPage, pageSize, orgId, formParkSeatCode) {
      let _this = this
      queryUnAuthParkSeat(currentPage, pageSize, orgId, formParkSeatCode.trim())
      .then(function (response) {
        let errorcode = response.code
        if (errorcode === '0') {
          _this.authSeatData = response.data.rows
          _this.seatTotal = response.data.total
        } else {
          _this.authSeatData = []
          _this.seatTotal = 0
          _this.$message.error(response.message)
        }
      })
    },
    handleTreeChange (data) {
      console.log(data)
      if (this.$refs.parkTree.getCheckedNodes()) {
        this.selectParkData = this.$refs.parkTree.getCheckedNodes()
        // console.log(this.$refs.tree.getCheckedNodes())
      }
    },
    handleCurrentCard (val) {
      this.selectCardVal = val
    },
    orgNodeClick (data) {
      // console.log(data)
      // console.info(data.parkOrgId)
      // console.info(this.formParkSeatCode)
      this.seatByPark = data.parkOrgId
      this.loadSeatData(this.seatCurrPage, this.seatSize, this.seatByPark, this.formParkSeatCode)
    },
    authSeatSizeChange (val) {
      this.seatSize = val
      this.loadSeatData(this.seatCurrPage, this.seatSize, this.seatByPark, this.formParkSeatCode)
    },
    seatCurrentChange (val) {
      this.seatCurrPage = val
      this.loadSeatData(this.seatCurrPage, this.seatSize, this.seatByPark, this.formParkSeatCode)
    },
    noSelectTip () {
      this.$confirm('还没选择确定关闭窗口?', '提示', {
        onfirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.innerVisible = false
      }).catch(() => {
        this.innerVisible = true
      })
    },
    selectFrom (fromName) { // 选择车场
      this.selectName = fromName
      if (fromName === 'park') {
        this.dialogData = '选择车场'
        if (this.addAuthform.parks && this.$refs.parkTree) {
          let parkArr = this.addAuthform.parks.split(',')
          this.$refs.parkTree.setCheckedKeys(parkArr)
        } else {
          if (this.$refs.parkTree) {
            this.$refs.parkTree.setCheckedKeys([])
          }
        }
        // console.log(this.addAuthform.parks)
      } else if (fromName === 'auth') {
        this.dialogData = '选择业主'
      } else if (fromName === 'card') {
        if (this.addAuthform.name) {
          this.loadCardData(this.ownerId)
          this.dialogData = '选择卡号'
        } else {
          this.$message('请先选择业主信息！')
          return false
        }
      } else if (fromName === 'car') {
        if (this.addAuthform.name) {
          this.loadCarData(this.ownerId)
          this.dialogData = '选择车辆'
        } else {
          this.$message('请先选择业主信息！')
          return false
        }
      } else if (fromName === 'seat') {
        if (this.addAuthform.parks) {
          this.dialogData = '选择车位'
          this.authSeatData = []
          this.seatTotal = 0
          this.selectParkTreeData = this.formatPark(this.selectParkData)
         // console.log(JSON.stringify(this.selectParkData))
          // let orgArr = this.parkOrgId.split(',')
          // this.$refs.seatParkTree.setCheckedKeys(orgArr)
          // this.loadSeatData(this.seatCurrPage, this.seatSize, this.parkOrgId, this.formParkSeatCode)
        } else {
          this.$message('请先选中要授权的车场')
          return false
        }
      }
      this.innerCardVisible = true
    },
    querySeat () {
      this.loadSeatData(this.seatCurrPage, this.seatSize, this.seatByPark, this.formParkSeatCode)
    },
    choiseStyle (val) {
      if (val === 0) {
        this.choiseCard = false
      } else {
        this.choiseCard = true
      }
    },
    selectCardBtn () {
      if (this.selectName === 'auth') {
        if (this.$refs.diaglo && this.$refs.diaglo.selectAuto && this.$refs.diaglo.selectAuto.ownerName) {
          this.addAuthform.name = this.$refs.diaglo.selectAuto.ownerName
          this.ownerId = this.$refs.diaglo.selectAuto.ownerId
        } else {
          this.noSelectTip()
        }
      } else if (this.selectName === 'park') { // 车场
        this.addAuthform.parks = ''
        this.selectParkCode = []
        let parkOrgIds = []
        // console.log('this.selectParkData' + JSON.stringify(this.selectParkData))
        for (let park of this.selectParkData) {
          this.addAuthform.parks += ',' + park.parkingName
          parkOrgIds.push(park.parkOrgId)
          this.selectParkCode.push(park.parkingCode)
        }
        this.selectParkCode = Array.from(new Set(this.getParentTree(this.parkTreeData, this.selectParkCode)))
        // console.log('ids : ' + this.selectParkCode)
        this.addAuthform.parks = (this.addAuthform.parks).substr(1)
        this.parkOrgId = parkOrgIds.toString()
        this.addAuthform.parksCodes = this.selectParkCode
        // console.log(this.addAuthform.parksCodes)
      } else if (this.selectName === 'car') {
        this.addAuthform.car = ''
        for (let park of this.selectCarData) {
          this.addAuthform.car += ',' + park.carNum
        }
        if (this.addAuthform.car) {
          this.addAuthform.car = (this.addAuthform.car).substr(1)
        }
      } else if (this.selectName === 'seat') {
        this.addAuthform.parkSeatCode = this.selectSeatData.code
      } else if (this.selectName === 'card') {
        if (this.selectCardVal !== '') {
          this.addAuthform.cardNum = this.selectCardVal.cardNo
        }
      }
      this.innerCardVisible = false
    },
    paymentRecord (index, row) { // 缴费记录
      this.dialogPayVisible = true
      this.dialogPay = false
      this.payTitle = '缴费记录'
      this.paymentRecordCurrentPage = 1
      this.paymentRecordPageSize = 10
      this.paymentRecordAuthId = row.id
      this.loadPaymentRecord(this.paymentRecordCurrentPage, this.paymentRecordPageSize, this.paymentRecordAuthId)
    },
    loadPaymentRecord (currentPage, pageSize, authId) {
      var _this = this
      // _this.recodeLoad = true
      paymentRecord(currentPage, pageSize, authId)
      .then(function (response) {
        // _this.recodeLoad = false
        let errorcode = response.code
        if (errorcode === '0') {
          _this.recordData = response.data.rows
          _this.paymentRecordTotal = response.data.total
        } else {
          _this.$message.error('获取缴费记录异常')
        }
      })
    },
    paymentRecordSizeChange (paymentRecordPageSize) {
      this.paymentRecordPageSize = paymentRecordPageSize
      this.loadPaymentRecord(this.paymentRecordCurrentPage, paymentRecordPageSize, this.paymentRecordAuthId)
    },
    paymentRecordCurrentChange (paymentRecordCurrentPage) {
      this.paymentRecordCurrentPage = paymentRecordCurrentPage
      this.loadPaymentRecord(paymentRecordCurrentPage, this.paymentRecordPageSize, this.paymentRecordAuthId)
    },
    findPage (val) {
      this.currentPage = val
      this.loadAuthList(this.currentPage, this.sizes, this.queryForm.queryCarNum, this.queryForm.queryParkSeatCode)
    },
    handleSizeChange (val) {
      this.sizes = val
      this.loadAuthList(this.currentPage, this.sizes, this.queryForm.queryCarNum, this.queryForm.queryParkSeatCode)
    },
    closeDialog (done) {
      done()
      this.resetForm()
    },
    cannelAuth () {
      this.dialogFormVisible = false
      this.resetForm()
    },
    resetForm () {
      this.$refs['addAuthform'].resetFields()
    },
    blurInput () {
      this.queryForm.queryCarNum = this.queryForm.queryCarNum.toUpperCase()
    },
    getParentTree (data, codes) {
      let temp = data
      let treeId = []
      function getTreeId (data, code) {
        let parCode
        for (let dataItem of data) {
          if (dataItem.parkingCode === code) {
            treeId.push(dataItem.parkingCode)
            parCode = dataItem.parentParkingCode
            getTreeId(temp, parCode)
          } else {
            getTreeId(dataItem.subParkingLots, code)
          }
        }
      }
      function getTreeCodes (codes) {
        for (let code of codes) {
          getTreeId(data, code)
        }
        return treeId
      }
      return getTreeCodes(codes)
    },
    formatPark (parkData) {
      let newParks = []
      let codes = []
      for (let i = 0; i < parkData.length; i++) {
        codes.push(parkData[i].parkingCode)
      }
      for (let i = 0; i < parkData.length; i++) {
        if (parkData[i].parentParkingCode === '' || codes.indexOf(parkData[i].parentParkingCode) === -1) {
          newParks.push(parkData[i])
        }
      }
      return newParks
    },
    formatString (dataString) {
      var keyArrs = []
      var valuArrs = []
      var dataArrObj = []
      for (var keyArr in dataString) {
        keyArrs.push('"' + keyArr + '"')
      }
      for (var valueArr in dataString) {
        valuArrs.push('"' + dataString[valueArr] + '"')
      }
      for (let i = 0; i < keyArrs.length; i++) {
        var arrObj = '{value:' + keyArrs[i] + ',label:' + valuArrs[i] + '}'
        dataArrObj.push(this.myEval(arrObj))
      }
      return dataArrObj
    },
    typeFormat: function (row, column) {
      var type = row.type
      if (type === 1) {
        return '特殊车'
      }
      return '普通车'
    },
    carModeFormat: function (row, column) {
      let carMode = row.carMode
      if (carMode === '1') {
        return '大型车'
      } else if (carMode === '2') {
        return '超大型车'
      } else if (carMode === '3') {
        return '摩托车'
      }
      return '小型车'
    },
    carCurrentChange (val) {
      console.log(val)
      this.selectCarData = val
    },
    myEval (str) {
      var Fn = Function
      return new Fn('return ' + str)()
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/views/ParkingLotApp/assets/css/parkLotApp.less";
.el-input{
  width: 60%
}
.pay-popwin .el-input{
  width: 100%
}
.pay-checkbox{
  margin-left: 80px;
  margin-bottom: 10px;
}
.price-unit{
  font-style: normal;
  font-size: 18px;
}
.pay-ramker .el-textarea{
  width: 550px;
}
.disabled-text{
  display: inline-block;
  width: 202px
}
.park-dialog{
  height: 400px;
  overflow: auto;
}
</style>
<style lang="less">
.table-scroll{
  .el-table{
    .el-table__header-wrapper{
      overflow-y: scroll;
    }
  }
}
.seatTable {
  .seat-table{
    .el-table__body-wrapper{
      max-height: 270px!important;
    }
  }
}
.auth-car-table{
  .el-table__body-wrapper{
    max-height:350px!important;
  }
}
</style>





