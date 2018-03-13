<template>
  <div>
    <el-dialog :visible="show" @close="closeEvent" width="40%" style="padding-right:20px">
      <el-form :model="form" style="padding-bottom: 0px">
        <el-form-item label="图 片" :label-width="formLabelWidth">
          <el-carousel :autoplay="false" type="card" height="200px">
            <el-carousel-item v-for="item in child" :key="item">
              <img :src="item" />
            </el-carousel-item>
          </el-carousel>
        </el-form-item>
        <el-form-item label="视  频" :label-width="formLabelWidth">
          <el-carousel :autoPlay="false" :interval="0" indicator-position="outside" height="300px" @change='change'>
            <el-carousel-item v-for="item in video" :key="item">
              <embed controls="controls" :src="item" type="video/mp4" height="100%" width="100%" autobuffer/>
              <video @click="onPlayerEnded($event.target)" controls="controls" :src="item" type="video/mp4" height="100%" width="100%" aria-label="Close"></video>
            </el-carousel-item>
          </el-carousel>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEvent">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script type="javascript/text">
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
      default () {
        return false
      }
    },
    video: '',
    child: ''
  },
  methods: {
    //走马灯切换时
    change () {
      let tag = document.getElementsByTagName('video')
      for (let i = 0; i < tag.length; i++) {
        this.onPlayerEnded(tag[i])
      }
    },
    // 播放关闭和开始
    onPlayerEnded (tag) {
      tag.pause()
    },
    closeEvent () {
      let tag = document.getElementsByTagName('video')
      for (let i = 0; i < tag.length; i++) {
        this.onPlayerEnded(tag[i])
      }
      this.$emit('closeDialog')
    }
  },
  data () {
    return {
      form: {
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      formLabelWidth: '70px',
      _videoPlayer: ''
    }
  }
}
</script>
<style lang="less" scoped>
// 视频展示
.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
}
.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}
.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
.el-form-item {
  margin-bottom: 10px;
}
// 图片轮播
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
}
.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}
.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
.el-carousel__button {
  width: 20px;
  height: 40px;
}
// 页面
.dialog-footer {
  text-align: center;
}
img {
  display: block;
  height: 100%;
  width: 100%;
}
video {
  height: 100%;
  width: 100%;
}
.dialog-footer .el-button {
  margin: 0 15%;
  width: 15%;
}
</style>
