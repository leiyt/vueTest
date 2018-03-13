<template>
  <div class="ocx">
    <object classid="clsid:d97c5a6f-1b81-4ccc-8c3f-1c9860e57567" width="200" height="150" id="Plugin" name="Plugin" ref="prewviewOcx"></object>
  </div>
</template>
<script>
export default {
  props: {
    deviceId: {
      type: String,
      default: ''
    },
    ocxPreviewShow: {
      require: true,
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      errorImg: false,
      previewData: {
        deviceID: '30011613241321740001',
        parentID: '10012001161324132174',
        mediaIP: '192.168.0.207',
        mediaPort: 10000,
        streamProfile: 1
      },
      ocxShow: true,
      playBackData: {},
      playbackRequestData: [],
      cameraData: {},
      previewAllData: {}
    }
  },
  mounted () {
    // 刷新时调用释放接口
    this.initOcx()
    window.onbeforeunload = () => {
      this.releaseOcx()
    }
  },
  beforeDestroy () {
    this.releaseOcx()
  },
  methods: {
    // ocx初始化
    initOcx () {
      this.$nextTick(() => {
        try {
          let Plugin = this.$refs.prewviewOcx
          // 创建视频接口
          Plugin.OCX_SetFrame(JSON.stringify({
            cmd: 1,
            showMode: 0,
            width: 1056,
            height: 594
          }))
          // 处理回调
          Plugin.OCX_SetCallback((data) => {
            this.funOnEvent(data)
          })
        } catch (e) {
          this.downLoadShow = true
        }
      })
    },
    // 播放预览
    playPreview () {
      // console.log(this.previewData)
      try {
        let Plugin = this.$refs.prewviewOcx
        Plugin.OCX_InformExe(JSON.stringify({
          cmd: 2,
          data: [this.previewData]
        }))
        this.getPlaybackData()
      } catch (e) { }
    },
    rePlayPreview () {
      try {
        let Plugin = this.$refs.prewviewOcx
        Plugin.OCX_InformExe(JSON.stringify({
          cmd: 2,
          data: [this.previewData]
        }))
      } catch (e) { }
    },
    // 关闭视频推流
    StopPreview () {
      try {
        let Plugin = this.$refs.prewviewOcx
        Plugin.OCX_InformExe(JSON.stringify({
          cmd: 3,
          data: [this.previewData]
        }))
      } catch (e) { }
    },
    releaseOcx () {
      this.playbackRequestData = []
      try {
        let Plugin = this.$refs.prewviewOcx
        Plugin.OCX_CloseFrame(JSON.stringify({ cmd: 9 }))
      } catch (e) { }
    },
    funOnEvent (data) {
      let callBackdata = JSON.parse(data)
      console.log(callBackdata)
      switch (callBackdata.cmd) {
        case 1:
          if (callBackdata.result === 'ok') {
            this.getData()
          }
          break
        case 4:
          this.sendptzCmd(callBackdata.ptzCmd)
          break
      }
    },
    // 获取视频数据
    getData () {
      this.cameraData = {}
      this.$nextTick(() => {
        this.playPreview()
        // getDeviceByCameraCode({ cameraCode: this.deviceId }).then(res => {
        //   this.previewAllData = res.data
        //   this.previewData = {
        //     deviceID: res.data.deviceID,
        //     parentID: res.data.parentID,
        //     mediaIP: res.data.mediaIP,
        //     mediaPort: res.data.mediaPort,
        //     streamProfile: 0
        //   }
        //   this.playPreview()
        // }).catch(err => {
        //   console.log(err)
        // })
      })
    },
    changeStream (streamCode) {
      this.StopPreview()
      // 回放资源也需要释放
      this.previewData.streamProfile = streamCode
      this.rePlayPreview()
    }
  }
}
</script>
<style scoped lang='less'>
.ocx {
  position: relative;
  .ocx-show {
    margin-left: 52px;
    height: 594px;
    object {
      float: left;
    }
  }
  .error-img {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 100;
    width: 1056px;
    height: 594px;
    margin-left: -528px;
  }
}
</style>



