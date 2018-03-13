<template>
  <div>
    <el-dialog title="区域信息" :visible.sync="dialogFormVisible" width="536px" height="440px">
      <el-form>
        <el-form-item label="*区域名称" label-width="80px" class="common-input">
          <el-input placeholder="请输入区域名称" v-model="addoptions.areaName"></el-input>
        </el-form-item>
        <el-form-item label="*区域类型" class="form-item">
          <el-select v-model="currentAreaType" class="small-input" disabled="">
            <el-option :label="item.itemName" :value="item.itemCode" v-for="item in selectList" :key="item.itemCode">{{item.itemName}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="common-input">
          <el-button @click="onRelateChildShow" type="primary" plain v-show="currentAreaType === 2">关联子场景</el-button>
          <el-button @click="onRelateShow" type="primary" plain v-show="currentAreaType !== 2">关联场景</el-button>
        </el-form-item>
        <div class="btn-group">
          <el-button type="success" plain @click="onSavePage" :loading="isLoading">保存</el-button>
          <el-button type="info" plain @click="onCancle">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <relate-scene-dialog ref="RelateSceneDialog"></relate-scene-dialog>
    <relate-child-dialog ref="RelateChildDialog"></relate-child-dialog>
  </div>
</template>
<script>
import {
  addArea,
  updateArea,
  getAreaList,
  getDictionary
} from '@/views/MapApp/apis/index.js'
// 关联场景的弹窗
import RelateSceneDialog from './RelateSceneDialog'
 // 关联子场景的弹窗
import RelateChildDialog from './RelateChildDialog'
 // 数据格式化
import { formatArea } from '@/views/MapApp/assets/js/utils.js'
  // 日志
import { LOG_TAG } from '@/views/MapApp/assets/js/index.js'
export default {
  components: {
    RelateSceneDialog,
    RelateChildDialog
  },
  data () {
    return {
      isLoading: false,
      selectList: [],
      currentAreaType: '',
      curLinkedScene: '',
      curParentArea: '',
      dialogFormVisible: false,
      sceneType: '',
      areSceneId: '',
      points: [],
      addoptions: {
        sceneId: '',
        areaName: '',
        areaType: '',
        linkSceneId: '',
        borderPoints: [
          {
            gpsLongitude: 0.0,
            gpsLatitude: 0.0,
            pointX: 100,
            pointY: 200,
            markerType: 1
          },
          // 区域边界点位列表
          {
            gpsLongitude: 0.0,
            gpsLatitude: 0.0,
            pointX: 100,
            pointY: 200,
            markerType: 1
          }
        ],
        childScene: []
      }
    }
  },
  mounted: function () {
    // 获取字典表
    getDictionary().then((res) => {
      let dictionary = res.data.data
      let areaTypes = dictionary.dictCodeType.areaType
      var len = areaTypes.length
      for (var i = 0; i < len; i++) {
        areaTypes[i].itemCode = parseInt(areaTypes[i].itemCode)
      }
      this.selectList = areaTypes
    }).catch(err => {
      console.warn(LOG_TAG + '调用字典表接口失败')
      console.warn(err)
    })
  },
  methods: {
    /**
     * @description 关联场景
     */
    onRelateShow: function () {
      this.$refs['RelateSceneDialog'].openDialog()
      this.$refs['RelateSceneDialog'].onSearchScene()
    },
    /**
     * @description 关联子场景
     */
    onRelateChildShow: function () {
      this.$refs['RelateChildDialog'].openDialog()
      this.$refs['RelateChildDialog'].onSearch()
    },
    /**
     * @description 取消
     */
    onCancle: function () {
      this.sceneType = ''
      this.dialogFormVisible = false
    },
    /**
     * @description 保存
     */
    onSavePage: function () {
      this.addoptions.areaType = this.currentAreaType
      if (!this.addoptions.areaName.trim()) {
        const h = this.$createElement
        this.$message({
          message: h('p', null, [
            h('span', null, ''),
            h('i', { style: 'color: red' }, '请将区域信息填写完整！')
          ])
        })
        return
      }
      // 楼栋必须关联子场景
      if (parseInt(this.currentAreaType) === 2) {
        this.$refs['RelateChildDialog'].onConfirmPage()
        if (this.addoptions.childScene.length > 0) {
          this.addoptions.childScene = this.$refs['RelateChildDialog'].checkList
          this.addoptions.linkSceneId = ''
        } else {
          this.$message({
            message: '楼栋区域必须关联子场景',
            type: 'warning'
          })
          return false
        }
      } else {
        this.addoptions.linkSceneId = this.$refs['RelateSceneDialog'].selecedSceneId
        this.addoptions.childScene = []
      }
      if (this.$parent.addOrEdit === 0) {
        // 调用接口 addArea
        var adds = this.addoptions
        adds.areaName = adds.areaName.trim()
        delete adds['id']
        this.isLoading = true
        addArea(adds).then(res => {
          if (res.data.code === '00000') {
            var data = { sceneId: this.addoptions.sceneId }
            var _this = this
            getAreaList(data).then(res => {
              if (res.data.code === '00000') {
                let alist = formatArea(res.data.data)
                let areaList = []
                for (let i = 0; i < alist.length; i++) {
                  if (parseInt(alist[i].areaType) === 1 || parseInt(alist[i].areaType) === 2 || parseInt(alist[i].areaType) === 3) {
                    areaList.push(alist[i])
                  }
                }
                _this.$parent.areaList = areaList
                _this.dialogFormVisible = false
                _this.isLoading = false
                this.$message({
                  message: '恭喜你，数据添加成功',
                  type: 'success'
                })
              } else {
                this.isLoading = false
              }
            }).catch(err => {
              console.warn(LOG_TAG + '调用getAreaList失败')
              console.warn(err)
            })
          }
        }).catch(err => {
          this.isLoading = false
          console.warn(err)
          console.log(LOG_TAG + '添加区域失败')
          this.$message({
            message: '数据添加失败'
          })
        })
      } else {
        // 调用接口 updateArea
        this.isLoading = true
        this.addoptions.areaName = this.addoptions.areaName.trim()
        updateArea(this.addoptions).then(res => {
          if (res.status === 200) {
            var data = { sceneId: this.addoptions.sceneId }
            var _this = this
            getAreaList(data).then(res => {
              if (res.data.code === '00000') {
                let alist = formatArea(res.data.data)
                let areaList = []
                for (let i = 0; i < alist.length; i++) {
                  if (parseInt(alist[i].areaType) === 1 || parseInt(alist[i].areaType) === 2 || parseInt(alist[i].areaType) === 3) {
                    areaList.push(alist[i])
                  }
                }
                _this.$parent.areaList = areaList
                _this.dialogFormVisible = false
                this.isLoading = false
                this.$message({
                  message: '恭喜你，数据修改成功',
                  type: 'success'
                })
              } else {
                this.isLoading = false
              }
            }).catch(err => {
              this.isLoading = false
              console.warn(LOG_TAG + '调用getAreaList失败')
              console.warn(err)
            })
          }
        }).catch(err => {
          console.warn(err)
          console.log(LOG_TAG + '数据修改失败')
          this.$message({
            message: '数据修改失败'
          })
        })
      }
    },
    /**
     * @description 页面初始化
     */
    initParamEdit: function () {
      let currentAreaType = this.currentAreaType
      let curParentArea = this.curParentArea
      let curLinkedScene = this.curLinkedScene
      this.$refs['RelateSceneDialog'].initParamsDialog(currentAreaType, curLinkedScene)
      this.$refs['RelateChildDialog'].initParamsDialog(currentAreaType, curParentArea)
    }
  }
}
</script>

<style lang="less" scoped>
/* MapApp.less公共样式start */
@origin: 10px;
.pull-left {
  float: left;
}
.pull-right {
  float: right;
}
.row-flow {
  width: 100%;
}
.clearfix {
  clear: both;
}
.common-input {
  width: @origin*28;
}
.map-app {
  box-sizing: border-box;
  position: absolute;
  top: 90px;
  bottom: 20px;
  left: 225px;
  right: 20px;
}
.filter-tree {
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 300px;
}
/* MapApp.less公共样式end */

.el-dialog {
  min-width: 536px !important;
}
.btn-group {
  margin-left: 60%;
  bottom: 10px;
  line-height: 30px;
  padding: 0 24px 0 0;
  width: 50%;
  button {
    width: 84px;
  }
}
.small-input {
  width: 200px;
}
.form-item {
  margin-left: 8px;
}
</style>
