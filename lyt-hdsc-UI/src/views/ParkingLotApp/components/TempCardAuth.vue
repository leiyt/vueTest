<template>
  <section class="short-park">
    <div class="park-tree">
      <p>选择车场</p>
      <el-tree :data="parkTreeData" show-checkbox node-key="id" ref="tree" highlight-current :props="defaultProps" @check-change="handleNodeClick">
      </el-tree>
    </div>
    <div class="card-cont">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="请输入卡号" v-model="queryCardNo" style="width:400px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryByNo">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="cardTableData" v-loading="listLoading" @selection-change = "selectCardCharge" max-height="680">
			  <el-table-column type="selection" width="60"></el-table-column>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="uniqueCode" label="卡号"></el-table-column>
        <el-table-column prop="cardType" label="卡类型"></el-table-column>
      </el-table>
      <!-- <el-col class="toolbar">
        <el-pagination @size-change="handleSizeChange" @current-change="findPage" :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" background layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-col> -->
      <section class="auth-btn">
        <el-button type="primary" @click="saveAccredit">确定授权</el-button>
      </section>
    </div>
  </section>
</template>
<script>
import { getCard, queryParkList, updateCardAuth } from '@/views/ParkingLotApp/apis'
export default {
  data () {
    return {
      cardTableData: [],
      parkTreeData: [],
      selectCard: [],
      listLoading: true,
      loadingTree: true,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      queryCardNo: '',
      selectParkCode: [],
      defaultProps: {
        children: 'subParkingLots',
        label: 'parkingName'
      }
    }
  },
  mounted () {
    this.loadData(this.currentPage, this.pageSize, this.queryCardNo)
    this.queryParkTree()
  },
  methods: {
    loadData (currentPage, pageSize, queryCardNo) {
      let _this = this
      queryCardNo = encodeURI(queryCardNo)
      getCard(currentPage, pageSize, queryCardNo)
      .then(function (response) {
        _this.cardTableData = response.data.rows
        _this.total = response.data.total
        _this.listLoading = false
        console.log(response.data)
      })
      .catch(function (error) {
        _this.listLoading = false
        console.log(error)
      })
    },
    queryParkTree () {
      var _this = this
      _this.loadingTree = true
      queryParkList()
        .then(
          function (response) {
            _this.loadingTree = false
            if (response.code === '0') {
              _this.noData = true
              _this.parkTreeData = response.data
            } else {
              _this.noData = true
            }
          }
        )
        .catch(function (error) {
          _this.loadingTree = true
          console.log(error)
        })
    },
    handleNodeClick () {
      this.selectParkCode = this.$refs.tree.getCheckedNodes()
      console.log(this.selectParkCode)
    },
    queryByNo () {
      this.loadData(this.currentPage, this.pageSize, this.queryCardNo)
    },
    selectCardCharge (val) {
      this.selectCard = val
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.loadData(this.currentPage, this.pageSize, this.queryCardNo)
    },
    findPage (val) {
      this.currentPage = val
      this.loadData(this.currentPage, this.pageSize, this.queryCardNo)
    },
    saveAccredit () {
      let _this = this
      let cardNums = []
      let parkArr = []
      for (let i = 0; i < _this.selectParkCode.length; i++) {
        parkArr.push(_this.selectParkCode[i].parkingCode)
      }
      for (let i = 0; i < _this.selectCard.length; i++) {
        cardNums.push(_this.selectCard[i].uniqueCode)
      }
      parkArr = Array.from(new Set(this.getParentTree(this.parkTreeData, parkArr)))
      if (cardNums.length > 0 && parkArr.length > 0) {
        parkArr = parkArr.toString()
        updateCardAuth(parkArr, cardNums).then(
            function (response) {
              if (response.code === '0') {
                _this.$message({
                  type: 'success',
                  message: '授权成功'
                })
              } else {
                _this.$alert('授权失败', '提示', {
                  confirmButtonText: '确定',
                  callback: action => {}
                })
              }
              _this.loadData(_this.currentPage, _this.pageSize, _this.queryCardNo)
            }
          ).catch(() => {})
      } else {
        this.$message({
          message: '请选择需授权的车场或卡号',
          type: 'warning'
        })
      }
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
    }
  }
}
</script>
<style lang="less" scoped>
@import "~@/views/ParkingLotApp/assets/css/parkLotApp.less";
</style>


