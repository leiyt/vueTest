<template>
  <el-dialog title="关联子集场景" :visible.sync="dialogVisible" @close="closeDialog" width="536px">
    <div class="scene-info-center">
      <div class="demo-input-suffix">
        <span class="scenename-show">场景名称&nbsp;&nbsp;</span>
        <div class="scenename-input">
          <el-input v-model="value">
            <el-button slot="append" icon="el-icon-search" @click.native="onSearch()"></el-button>
          </el-input>
        </div>
      </div>
      <div class="scenename-list">
        <el-checkbox-group v-model="checkList">
          <el-checkbox v-for="item in optionDatas" :key="item.id" :label="item.id">{{ item.sceneName }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onConfirmPage" type="primary">确 定</el-button>
      <el-button type="default" @click="onClosePage">取 消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getSceneList } from '@/views/MapApp/apis/index.js'
import { LOG_TAG } from '@/views/MapApp/assets/js/index.js'
export default {
  data () {
    return {
      dialogVisible: false,
      value: '',
      checkList: [],
      optionDatas: [],
      SceneName: '',
      SceneTypes: [],
      stype: '',
      defaultScenetype: '',
      curParentArea: '',
      defaultCheckList: []
    }
  },
  methods: {
    /**
     * @description 对话框初始化
     */
    initParamsDialog: function (currentAreaType, curParentArea) {
      this.curParentArea = curParentArea
      switch (currentAreaType) {
        // 小区分区区域
        case 1: this.defaultSceneType = 2
          break
        // 楼栋
        case 2: this.defaultSceneType = 3
          break
        // 车场分区区域
        default: this.defaultSceneType = 5
          break
      }
    },
    /**
     * @description 场景搜索
     */
    onSearch: function () {
      let data = {}
      data.sceneType = this.defaultSceneType
      data.sceneName = this.value
      this.checkList = []
      getSceneList(data).then(res => {
        if (res.data.code === '00000') {
          let sceneList = res.data.data
          let sceneLength = sceneList.length
          let curParentArea = this.curParentArea
          for (let i = 0; i < sceneLength; i++) {
            if (!!curParentArea && !!sceneList[i].parentArea && (curParentArea === sceneList[i].parentArea)) {
              this.checkList.push(sceneList[i].id)
            }
          }
          this.optionDatas = sceneList
          this.defaultCheckList = Object.assign([], this.checkList)
        }
      }).catch(err => {
        console.warn(LOG_TAG + '获取关联场景失败')
        console.warn(err)
      })
    },
    onClosePage: function () {
      this.dialogVisible = false
      this.checkList = Object.assign([], this.defaultCheckList)
    },
    openDialog: function () {
      this.dialogVisible = true
    },
    /**
     * @description 页面保存
     */
    onConfirmPage: function () {
      if (this.checkList.length === 0) {
        const h = this.$createElement
        this.$message({
          message: h('p', null, [
            h('span', null, ''),
            h('i', { style: 'color: red' }, '请关联子场景')
          ])
        })
      } else {
        this.dialogVisible = false
        this.$parent.addoptions.childScene = this.checkList
      }
    },
    closeDialog: function () {
      this.value = ''
    }
  }
}
</script>
<style lang="less" scoped>
.el-dialog {
  min-width: 536px !important;
}
.scene-info-center {
  width: 95%;
  min-height: 40px;
  margin: 0 auto;
  background: none;
  .scenename-list {
    height: 150px;
    margin: 20px auto 0 auto;
    overflow-y: scroll;
  }
  .demo-input-suffix {
    min-height: 40px;
    width: 100%;
    margin-top: 10px;
    .scenename-show {
      display: block;
      width: auto;
      height: 40px;
      line-height: 40px;
      float: left;
      margin-right: 5px;
    }
    .scenename-input {
      width: auto;
      float: left;
    }
  }
  .el-checkbox-group {
    .el-checkbox {
      display: block;
      width: 100%;
      margin-left: 0;
      margin-top: 10px;
    }
  }
}
</style>
