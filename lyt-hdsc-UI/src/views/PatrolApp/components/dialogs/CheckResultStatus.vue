<template>
  <div>
    <el-dialog title="" :visible="show" width="50%" @close="closeEvent">
      <div class="explainReason">
        <el-input v-model="abnormalReason" class="inputOne" placeholder="" :editable="false" v-show="status === '1'" :disabled="true"></el-input>
      </div>
      <el-table ref="checkResultForm" :data="checkResultForm" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange" :border="true">
        <el-table-column type="index" prop="date" label="序号" width="120" align="center">
        </el-table-column>
        <el-table-column prop="pointName" label="名称" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="pointTime" label="打点时间" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column label="结果" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <span :class="getPoinStatusClass(scope.$index, scope.row)" style="color:red">
              {{formatStatus(scope.$index, scope.row)}}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <div class='pages-crew' v-show="data.length">
        <el-pagination small @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageData.pageNo" :page-sizes="[10, 20, 30]" :page-size="pageData.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="pageData.total">
        </el-pagination>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeEvent" class="savePlan">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getResultData } from '../../apis/planChannel'
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
      default () {
        return false
      },
      dialogtext: {}
    },
    selectMessege: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      status: false,
      abnormalReason: '',
      checkResultForm: [],
      uuid: '',
      data: [],
      pageData: {
        pageSize: 10,
        pageNo: 1,
        total: 0
      }
    }
  },
  watch: {
    show (val) {
      if (val) {
        this.uuid = this.selectMessege.uuid ? this.selectMessege.uuid : ''
        this.abnormalReason = this.selectMessege.abnormalReason
        this.status = this.selectMessege.carryStatus
        // console.log('this.selectMessege.carryStatus', typeof (this.selectMessege.carryStatus))
        if (this.uuid) {
          this.checkResult()
        }
      }
    }
  },
  methods: {
    closeEvent () {
      this.$emit('closePlan')
    },
    handleSelectionChange () {
    },
    checkResult () {
      let params = { 'taskId': this.uuid, 'pageNo': this.pageData.pageNo, 'pageSize': this.pageData.pageSize }
      getResultData(params).then((rs) => {
        if (rs.data.code === '00000') {
          this.checkResultForm = rs.data.data.rows
          this.pageData.total = rs.data.data.total
        } else {
          this.checkResultForm = []
        }
      })
    },
    // 后台数据对应显示逻辑
    formatStatus (index, row) {
      let statusText = ['未查巡', '已查巡', '超时未查巡', '超时已查巡', '超时预警中', '超时预警已解除']
      return statusText[parseInt(row.historyPointStatus)]
    },
    getPoinStatusClass () {
    },
    handleSizeChange (val) {
      this.pageData.pageSize = val
      this.checkResult()
    },
    handleCurrentChange (val) {
      this.pageData.pageNo = val
      this.checkResult()
    }
  }
}
</script>
<style scoped lang='less'>
.dialog-footer {
  text-align: center;
}
.pages-crew {
  text-align: center;
}
.explainReason {
  margin-bottom: 1%;
}
.inputOne {
  min-width: 300px;
}
</style>

