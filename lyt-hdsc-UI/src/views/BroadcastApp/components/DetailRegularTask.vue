<template>
  <el-dialog :visible.sync="dialogFormVisible" width="950px">
    <div slot="title">
      <span>定时任务详情</span>
    </div>
    <el-form ref="taskForm" :model="taskForm" label-width="90px">
      <el-row>
        <el-col :span="10">
          <el-form-item label="任务名称" prop="broadcastName">
            <el-input v-model.trim="taskForm.broadcastName" auto-complete="off" :maxlength="20" :readonly="true"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="重复次数" prop="repetitions">
            <el-input v-model.trim="taskForm.repetitions" auto-complete="off" :maxlength="10" :readonly="true"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="任务等级" prop="taskLevel">
            <el-input v-model.trim="taskForm.taskLevel" auto-complete="off" :maxlength="2" :readonly="true"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 中间媒体选择区域 -->
      <el-row>
        <div class="ca-container clearfix">
          <div class="left-con">
            <el-tree ref="tree" node-key="id" :data="treeData" :props="defaultProps" default-expand-all :expand-on-click-node="true">
            </el-tree>
          </div>
          <div class="right-con">
            <el-table ref="multipleTable" :data="sceneListDetail" tooltip-effect="dark" max-height="200" border style="width: 100%">
              <el-table-column label="场景名称" width="202" prop="sceneName">
                <template slot-scope="scope">{{ scope.row.sceneName }}</template>
              </el-table-column>
              <el-table-column label="创建日期" width="204" prop="createTime">
                <template slot-scope="scope">{{ scope.row.createTime }}</template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="启动时间" prop="dailyStartTime">
            <el-input class="datepick" v-model="taskForm.dailyStartTime" :readonly="true">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="终止时间" prop="dailyEndTime">
            <el-input class="datepick" v-model="taskForm.dailyEndTime" :readonly="true">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="20" v-show="false">
          <el-form-item label="单次播放" prop="startupTime">
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="重复周期" prop="duplicate">
          <el-checkbox-group v-model="taskForm.duplicate" :disabled="true">
            <el-checkbox :label="item" :key="item" name="type" v-for="item in taskForm.duplicate">{{item}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-row>
    </el-form>
    <div slot="footer">
      <el-button @click="onCancel">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>

import { getTaskDetail } from '@/views/BroadcastApp/apis/index.js'
import { LOG_TAG } from '@/views/BroadcastApp/assets/js/index.js'
export default {
  data () {
    return {
      pageSize: 10,
      currentPage: 1,
      taskForm: {
        broadcastName: '',
        repetitions: '',
        taskLevel: '',
        broadcastType: 1,
        startupTime: '',
        endTime: '',
        dailyStartTime: '',
        dailyEndTime: '',
        duplicate: [],
        sceneIds: [],
        playAreaIds: [],
        recovery: 1
      },
      treeData: [],
      defaultProps: {
        id: 'id',
        children: 'children',
        label: 'label'
      },
      sceneListDetail: [
      ],
      dialogFormVisible: false
    }
  },
  methods: {
    /**
     * @description 初始化弹出框任务详细信息
     * @param {Object} taskInfo
     */
    initFormData: function (taskInfo = {}) {
      let _task = taskInfo
      getTaskDetail(_task).then(res => {
        if (res.data.code === '00000') {
          let result = res.data.data[0]
          this.sceneListDetail = []
          this.sceneListDetail = result.scene
          this.taskForm.broadcastName = result.broadcastName
          this.taskForm.repetitions = result.repetitions
          this.taskForm.taskLevel = result.taskLevel
          this.taskForm.dailyStartTime = result.dailyStartTime.substring(11)
          this.taskForm.dailyEndTime = result.dailyEndTime.substring(11)
          let duplicateId = result.duplicateId.split(',')
          let duplicate = []
          if (duplicateId.length === 7) {
            duplicate = ['每天']
          } else {
            duplicateId.forEach((item, index) => {
              switch (item) {
                case '1': duplicate[index] = '星期一'
                  break
                case '2': duplicate[index] = '星期二'
                  break
                case '3': duplicate[index] = '星期三'
                  break
                case '4': duplicate[index] = '星期四'
                  break
                case '5': duplicate[index] = '星期五'
                  break
                case '6': duplicate[index] = '星期六'
                  break
                case '7': duplicate[index] = '星期日'
                  break
              }
            })
          }
          this.taskForm.duplicate = duplicate
          // 初始化组织树
          this.treeData = []
          let treeD = []
          let idx = 0
          let devcList = result.broadcastAreaLink
          devcList.forEach((item, index) => {
            if (item.playAreaId.length > 0) {
              treeD[idx] = {}
              treeD[idx].label = item.controllerName
              treeD[idx].id = item.controllerId
              treeD[idx].children = []
              if (item.subDeviceInfo !== '' && item.subDeviceInfo !== null) {
                let subDeviceInfo = item.subDeviceInfo.split(',')
                subDeviceInfo.forEach((cur, _idx) => {
                  if (cur !== null && cur !== '') {
                    let areaName = cur.split(':')[1]
                    let _label = areaName.substr(0, 1) === '_' ? cur.split(':')[1].substring(1) : cur.split(':')[1]
                    treeD[idx].children.push({
                      id: cur.split(':')[0],
                      label: _label
                    })
                  }
                })
                idx = idx + 1
              }
            }
          })
          this.treeData = treeD
        } else {
          this.$message({
            message: res.data.data,
            type: 'warning'
          })
        }
      }).catch(err => {
        console.warn(LOG_TAG + err)
      })
    },
    openDialog: function () {
      this.dialogFormVisible = true
    },
    onCancel: function () {
      this.dialogFormVisible = false
    }
  }
}
</script>
<style scoped>
.clearfix:before,
.clearfix:after {
  content: "";
  display: table;
  clear: both;
}
.clearfix {
  zoom: 1;
}
.ca-container {
  position: relative;
  width: 100%;
  height: 100%;
  margin-bottom: 20px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #dddee1;
}
.left-con {
  float: left;
  width: 50%;
  height: 230px;
  display: flex;
  flex-flow: column;
  overflow-y: auto;
  border-right: 1px solid #dddee1;
}
.right-con {
  display: flex;
  flex-flow: column;
  float: right;
  width: 46%;
  height: 196px;
  overflow-y: auto;
  box-sizing: border-box;
  margin-top: 14px;
}
.datepick {
  width: 210px;
}
.ck-item {
  margin-left: 0px;
}
</style>