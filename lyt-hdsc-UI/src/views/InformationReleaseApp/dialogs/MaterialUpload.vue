<template>
  <div class="material-upload">
    <el-dialog title="上传素材" :visible="show" width="30%" center @close="closeEvent()" :close-on-click-modal='false'>
      <el-row :gutter="0" style="margin-bottom:15px">
        <el-col :span="4">
          <div style="min-height:10px" class="grid-content bg-purple"></div>
        </el-col>
        <el-col :span="20">
          <el-select v-model="value" @change="changeValue" placeholder="请选择上传数据类型">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <div class="dialog-body-content">
        <el-upload :file-list="uploadFileList" :accept="uploadType" ref="uploadlist" :before-upload="beforeAvatarUpload" :on-change="handleprogress" :on-success="handleAvatarSuccess" :on-error="handlePreview" :headers="headers" :data="upLoadData" class="upload-demo" drag action='/zuul/scp-informationreleaseapp/media/uploadMedia' :multiple='false'>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div class="el-upload__tip" slot="tip">只能上传
            <span>{{typeMessage}}</span>文件,后缀名必须是{{uploadType}}
          </div>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      uploadFileList: [],
      media: '',
      uploadType: '.txt',
      typeMessage: '文本',
      headers: { Authorization: sessionStorage.token, FrontType: 'scp-admin-ui' },
      upLoadData: {
        mediaName: '',
        mediaType: 0,
        createUser: 'admin'
      },
      options: [{
        value: '选项1',
        label: '文本',
        type: '.txt',
        id: 0
      }, {
        value: '选项2',
        label: '图片',
        type: '.jpg,.png',
        id: 1
      }, {
        value: '选项3',
        label: '音频',
        type: '.mp3',
        id: 2
      }, {
        value: '选项4',
        label: '视频',
        type: '.mp4',
        id: 3
      }, {
        value: '选项5',
        label: 'pdf',
        type: '.pdf',
        id: 4
      }],
      value: '文本'
    }
  },
  mounted () {
  },
  methods: {
    // 文件状态改变时的钩子
    handleprogress (file, fileList) {
      this.upLoadData.mediaName = file.name
    },
    // 文件上传失败时的钩子
    handlePreview (err, file, fileList) {
      // console.log(typeof (err))
      // console.log(JSON.parse(err.message).message)
      if (typeof (err) === 'string') {
        this.$message({
          showClose: true,
          message: err,
          type: 'error'
        })
      } else if (typeof (err) === 'object') {
        this.$message({
          showClose: true,
          message: err.message ? err.message : '上传失败',
          type: 'error'
        })
      } else {
        this.$message({
          showClose: true,
          message: JSON.parse(err.message).message ? JSON.parse(err.message).message : '上传失败',
          type: 'error'
        })
      }
    },
    // 文件上传成功时的钩子
    handleAvatarSuccess (res, file) {
      this.uploadFileList = []
      this.$message({
        showClose: true,
        message: res.code === '00000' ? '上传成功' : (res.message === null ? '上传失败' : 'ir.mediaFileTypeNotSupport'),
        type: res.code === '00000' ? 'success' : 'error'
      })
      if (res.code === '00000') {
        this.$emit('showmaterialapp')
        this.$refs.uploadlist.clearFiles()
      }
    },
    // 下拉选择素材类型
    changeValue (value) {
      let obj = {}
      obj = this.options.find((item) => {
        return item.value === value
      })
      this.upLoadData.mediaType = obj.id
      this.uploadType = obj.type
      this.typeMessage = obj.label
    },
    // 关闭素材上传页面
    closeEvent () {
      this.$emit('closeDialog')
    },
    // 上传文件之前的钩子
    beforeAvatarUpload (file) {
      var promise = new Promise((resolve, reject) => {
        this.$confirm('是否上传当前文件', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const isTXT = file.type === 'text/plain'
          const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
          const isaudio = file.type === 'audio/mp3' || file.type === 'audio/mpeg'
          const isvideo = file.type === 'video/mp4'
          const isPDF = file.type === 'application/pdf'
          if (parseInt(this.upLoadData.mediaType) === 0) {
            if (!isTXT) {
              this.$message.error('上传文本只能是 txt 格式!')
              this.uploadFileList = []
            } else {
              resolve()
            }
            return isTXT
          }
          if (parseInt(this.upLoadData.mediaType) === 1) {
            if (!isJPG) {
              this.$message.error('上传图片只能是 JPG或PNG 格式!')
              this.uploadFileList = []
            } else {
              resolve()
            }
            return isJPG
          }
          if (parseInt(this.upLoadData.mediaType) === 2) {
            if (!isaudio) {
              this.$message.error('上传音频只能是 mp3 格式!')
              this.uploadFileList = []
            } else {
              resolve()
            }
            return isaudio
          }
          if (parseInt(this.upLoadData.mediaType) === 3) {
            if (!isvideo) {
              this.$message.error('上传视频只能是 mp4 格式!')
              this.uploadFileList = []
            } else {
              resolve()
            }
            return isvideo
          }
          if (parseInt(this.upLoadData.mediaType) === 4) {
            if (!isPDF) {
              this.$message.error('上传pdf只能是 pdf 格式!')
              this.uploadFileList = []
            } else {
              resolve()
            }
            return isPDF
          }
        }).catch((e) => {
          reject(e)
        })
      })
      return promise
    }
  }
}
</script>
<style lang="less" scoped>
.dialog-body-content {
  text-align: center;
}
</style>
<style lang="less">
.material-upload {
  .dialog-body-content {
    .el-upload--text {
      overflow: visible;
    }
  }
  .el-dialog--center .el-dialog__body {
    text-align: left;
  }
}
</style>
