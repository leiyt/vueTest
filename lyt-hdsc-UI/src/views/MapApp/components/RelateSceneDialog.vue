<template>
  <el-dialog title="关联场景" :visible.sync="dialogVisible" @close="closeDialog" width="536px">
    <div class="scene-info-center">
      <div class="demo-input-suffix">
        <span class="scenename-span">场景名称&nbsp;&nbsp;</span>
        <div class="scenename-input">
          <el-input v-model="value">
            <el-button slot="append" icon="el-icon-search" @click.native="onSearchScene()"></el-button>
          </el-input>
        </div>
      </div>
      <div class="scene-select">
        <a href="javascript:;" :class="{ 'default': selecedSceneId!==item.id, 'warning': selecedSceneId===item.id }" v-for="(item, $index) in restaurants" :key="$index" @click="onSendVal(item.id, item.sceneName)">{{ item.sceneName }}</a>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onConfirmPage">确 定</el-button>
      <el-button @click="onClosePage">取 消</el-button>
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
      selecedSceneId: '',
      // 最后需要传递的值
      result: '',
      restaurants: [],
      value: '',
      sname: '',
      defaultSceneType: '',
      defaultSelecedSceneId: ''
    }
  },
  methods: {
    initParamsDialog: function (currentAreaType, curLinkedScene) {
      this.selecedSceneId = curLinkedScene
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
      this.onSearchScene()
    },
    onSendVal: function (val, sname) {
      this.selecedSceneId = val
      this.selecedSceneName = sname
    },
    onClosePage: function () {
      this.dialogVisible = false
      this.selecedSceneId = this.defaultSelecedSceneId
    },
    openDialog: function () {
      this.dialogVisible = true
    },
    /**
    *@description 页面保存
    */
    onConfirmPage: function () {
      if (this.selecedSceneId === '') {
        let str = '此区域未关联场景，请确定是否需要关联'
        this.$confirm(str, '提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'info',
          dangerouslyUseHTMLString: true
        }).then(() => { }).catch(() => {
          this.$message({
            message: '取消添加关联场景！',
            type: 'warning'
          })
        })
      } else {
        let str = '已选择场景' + this.selecedSceneName + '，' + '是否确定'
        this.$confirm(str, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
          dangerouslyUseHTMLString: true
        }).then(() => {
          // 在此处调用添加的接口
          this.$parent.addoptions.linkSceneId = this.selecedSceneId
          this.defaultSelecedSceneId = this.selecedSceneId
          this.dialogVisible = false
          this.$message({
            message: '添加成功',
            type: 'success'
          })
        }).catch(() => {
          this.$message({
            message: '取消添加关联场景！',
            type: 'warning'
          })
        })
      }
    },
    /**
    *@description 场景列表搜索
    */
    onSearchScene: function () {
      let data = {}
      data.sceneType = this.defaultSceneType
      data.sceneName = this.value
      getSceneList(data).then(res => {
        if (res.data.code === '00000') {
          this.restaurants = res.data.data
        }
      }).catch(err => {
        console.warn(LOG_TAG + '获取场景列表失败')
        console.warn(err)
      })
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
  .demo-input-suffix {
    width: 100%;
    min-height: 40px;
    margin-top: 10px;
    .scenename-span {
      display: block;
      width: auto;
      height: 40px;
      line-height: 40px;
      float: left;
      margin-right: 5px;
    }
    .scenename-input {
      width: 300px;
      float: left;
      .el-input {
        width: 216px !important;
      }
      .el-button {
        float: right;
      }
    }
    .el-autocomplete {
      width: 100% !important;
    }
  }
  .scene-select {
    width: 100%;
    min-height: 100px;
    max-height: 200px;
    overflow-y: scroll;
    margin-top: 20px;
    a {
      display: block;
      text-decoration: none;
      margin-top: 10px;
      cursor: pointer;
    }
    .warning {
      color: orange;
    }
    .default {
      color: #3098ef;
    }
  }
}
</style>
