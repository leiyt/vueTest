<template>
  <div class='egsc-admin-header'>
    <span class='spantitle'>恒大集团智慧小区平台</span>
    <ul class="header_navbar">
      <li :class="item.icon" v-for='(item,i) in titleList' :key='i' :name='item.title'>
        <a :name='item.title' @click='selectTitle ($event)'>{{ item.title }}</a>
      </li>
    </ul>
    <div class='user-info'>
      <el-dropdown trigger='click' @command='handleCommand'>
        <span class='el-dropdown-link'>
          欢迎光临, {{username}} ,您好！
        </span>
        <el-dropdown-menu slot='dropdown'>
          <el-dropdown-item command='loginout'>退出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>
<script>
import { getfirstRouters } from '@/assets/js/util.js'
import { logout } from '@/views/UserMgmt/login/apis'
export default {
  data () {
    return {
      name: '',
      titleList: []
    }
  },
  mounted () {
    console.log('header.vue_mounted is active')
    // 加载一级菜单
    this.loadData()
  },
  computed: {
    username () {
      let username = sessionStorage.getItem('login_username')
      return username || this.name || 'admin'
    },
    headerStataus () {
      return this.$store.getters.getHeaderStatus || 'SHOW_HEADER'
    }
  },
  methods: {
    handleCommand (command) {
      console.log('header.vue_methods_handleCommand  is active')
      if (command === 'loginout') {
        sessionStorage.removeItem('login_username')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('userRouters')
        sessionStorage.removeItem('userResourcePermission')
        sessionStorage.removeItem('scpUserInfo')
        sessionStorage.removeItem('meuns')
        logout(null).then(result => {
          console.log(result)
        })
        this.$router.push('/login')
      }
    },
    selectTitle (event) {
      console.log('header.vue_selectTitle_handleCommand  is active')
      var btnObj = event.currentTarget
      if (this.titleList !== undefined && this.titleList.length > 0) {
        for (let i = 0; i < this.titleList.length; i++) {
          if (this.titleList[i].title === btnObj.name) {
            this.titleList[i].icon = 'header_navbar_active'
          } else {
            this.titleList[i].icon = ''
          }
        }
      }
      btnObj.icon = 'header_navbar_active'
      this.$emit('getSelectedTitle', btnObj.name)
      let firstRouters = getfirstRouters(this.$store.getters.getUserInfo, btnObj.name)
      console.log('firstRouters:' + firstRouters)
      this.$router.push(firstRouters)
    },
    loadData () {
      let userInfo = this.$store.getters.getUserInfo
      if (userInfo !== null && userInfo.uiResources !== null && userInfo.uiResources.length > 0) {
        this.titleList = []
        let uilength = userInfo.uiResources.length
        for (let k = 0; k < uilength; k++) {
          let uiResTemp = userInfo.uiResources[k]
          let temp = { 'id': uiResTemp.id, 'title': uiResTemp.title, 'icon': '', 'url': uiResTemp.url }
          this.titleList.push(temp)
        }
      }
      if (sessionStorage.getItem('CurrentlyCheckedTitle') !== undefined) {
        var currentMeunName = sessionStorage.getItem('CurrentlyCheckedTitle')
        if (this.titleList !== undefined && this.titleList.length > 0) {
          for (let i = 0; i < this.titleList.length; i++) {
            if (this.titleList[i].title === currentMeunName) {
              this.titleList[i].icon = 'header_navbar_active'
            } else {
              this.titleList[i].icon = ''
            }
          }
        }
        this.$emit('getSelectedTitle', currentMeunName)
      }
    }
  }
}
</script>
<style lang='less'>
@import "../../assets/css/mainheader.less";
</style>

