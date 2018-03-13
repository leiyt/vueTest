<template>

  <el-dialog :visible.sync="dialogFormVisible" width="900px" class="dialog">
    <div class="title-div">
      <span class="title">{{sceneDetailTmp.sceneName}}</span>
    </div>
    <div class="head">
      <el-form ref="sceneDetailTmp" :model="sceneDetailTmp" label-width="80px">
        <div class="box">
          <div class="font-info" v-show="sceneDetailTmp.locationPoints!==undefined&&sceneDetailTmp.locationPoints!==''">
            <el-form-item class="item-font" label="场景类型: " prop="scene_type">{{sceneDetailTmp.sceneType}}</el-form-item>
            <el-form-item class="item-font" label="所属组织: " prop="org_code">{{sceneDetailTmp.orgName}}</el-form-item>
            <el-form-item class="item-font" label="图片大小: " prop="imgSize" v-show="sceneDetailTmp.Height">{{sceneDetailTmp.Width}} * {{sceneDetailTmp.Height}}</el-form-item>
            <el-form-item class="item-font" label="场景大小: " prop="sceneSize" v-show="sceneDetailTmp.realWidth||sceneDetailTmp.realHeight">{{sceneDetailTmp.realWidth}} * {{sceneDetailTmp.realHeight}} </el-form-item>
            <el-form-item class="item-font" label="比例尺: " prop="scale">{{sceneDetailTmp.scale}}</el-form-item>
            <el-form-item class="item-font center" label="中心点位:" v-if="sceneDetailTmp.centerLon||sceneDetailTmp.centerLat">{{sceneDetailTmp.centerLon}},{{sceneDetailTmp.centerLat}}</el-form-item>
          </div>
          <div class="font-point" v-if="sceneDetailTmp.locationPoints!==undefined&&sceneDetailTmp.locationPoints!==''&&sceneDetailTmp.locationPoints!==null">
            <!--GPS坐标展示-->
            <div class="reallyPosition">
              <span>
                <el-form-item label="实际位置1:">
                  <i>{{sceneDetailTmp.locationPoints[0].gpsLongitude}},</i>
                  <i>{{sceneDetailTmp.locationPoints[0].gpsLatitude}}</i>
                </el-form-item>
              </span>
              <span>
                <el-form-item label="实际位置2:">
                  <i>{{sceneDetailTmp.locationPoints[1].gpsLongitude}},</i>
                  <i>{{sceneDetailTmp.locationPoints[1].gpsLatitude}}</i>
                </el-form-item>
              </span>
              <span>
                <el-form-item label="实际位置3:">
                  <i>{{sceneDetailTmp.locationPoints[2].gpsLongitude}},</i>
                  <i>{{sceneDetailTmp.locationPoints[2].gpsLatitude}}</i>
                </el-form-item>
              </span>
            </div>
            <!--点位坐标展示-->
            <div class="img-point">
              <span>
                <el-form-item label="图片点位1:">
                  <i>{{sceneDetailTmp.locationPoints[0].pointX}},</i>
                  <i>{{sceneDetailTmp.locationPoints[0].pointY}}</i>
                </el-form-item>
              </span>
              <span>
                <el-form-item label="图片点位2:">
                  <i>{{sceneDetailTmp.locationPoints[1].pointX}},</i>
                  <i>{{sceneDetailTmp.locationPoints[1].pointY}}</i>
                </el-form-item>
              </span>
              <span>
                <el-form-item label="图片点位3:">
                  <i>{{sceneDetailTmp.locationPoints[2].pointX}},</i>
                  <i>{{sceneDetailTmp.locationPoints[2].pointY}}</i>
                </el-form-item>
              </span>
            </div>
          </div>
        </div>
        <!--图片显示区域-->
        <div class="upload-content">
          <img :src="mapImage" alt="显示场景图片">
        </div>
      </el-form>
    </div>
    <div class="foot">
      <el-button @click="onCancle" type="primary">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  poops: [],
  data () {
    return {
      dialogFormVisible: false,
      sceneType: '',
      mapImage: '',
      sceneDetailTmp: {
        orgCode: '012980001',
        sceneName: '停车场',
        sceneType: '停车场分区图',
        Length: 120,
        Width: 80,
        scale: Math.random() * 20000,
        realLength: 1200,
        realWidth: 100,
        locationPoints: [
          {
            gpsLongitude: 56.129856,
            gpsLatitude: 56.129851,
            pointX: 56.129851,
            pointY: 56.129851
          },
          {
            gpsLongitude: 156.129856,
            gpsLatitude: 75.129851,
            pointX: 56.129851,
            pointY: 56.129851
          },
          {
            gpsLongitude: 156.129856,
            gpsLatitude: 75.129851,
            pointX: 56.129851,
            pointY: 56.129851
          }
        ]
      }
    }
  },
  created: function () {
    this.initUrl()
  },
  methods: {
    /**
    *@description 取消操作
    */
    onCancle: function () {
      this.dialogFormVisible = false
      this.$emit('change', '0')
    },
    /**
    *@description 获取图片的url
    */
    initUrl: function () {
      this.mapImage = this.sceneDetailTmp.mapImage
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
div {
  box-sizing: border-box;
}
.box {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 10px;
  width: 80%;
  margin: 0 auto;
}
.dialog {
  top: 5px;
  padding: 0 20px;
  .title-div {
    text-align: center;
    margin-bottom: 15px;
  }
}
el-dialog {
  padding: 0 60px 10px 0;
}

/* 弹性布局 */
.font-info {
  width: 100%;
  height: 68px;
  .item-font {
    box-sizing: border-box;
    display: block;
    width: 33%;
    padding-left: 8px;
    float: left;
    margin-bottom: 0;
  }
  .center {
    width: 38%;
  }
}
.font-point {
  width: 100%;
  margin-top: 0px;
  .reallyPosition,
  .img-point {
    width: 100%;
    margin-top: 10px;
    height: 40px;
    span {
      box-sizing: border-box;
      display: block;
      width: 33%;
      height: 40px;
      padding-left: 8px;
      float: left;
      i {
        display: block;
        height: 20px;
        line-height: 20px;
        font-style: normal;
      }
    }
  }
}
.item-font {
  width: 33%;
}
.head,
.foot {
  border-top: 1px solid #ccc;
  margin-top: 20px;
}
.head {
  position: relative;
  margin-top: 0px;
}
.foot {
  position: absolute;
  bottom: 5px;
  right: 20px;
}
.upload-content {
  margin: 0 auto;
  height: 320px;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 30px;
  text-align: center;
  overflow-x: auto;
  overflow-y: hidden;
  img {
    height: 100%;
  }
}
.dialog .title {
  margin: auto;
  font-size: 18px;
  font-weight: 700;
}

</style>


