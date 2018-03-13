import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'

// ����vuex�����ļ����û���Ϣģ��vuex����������
// import umUserInfo from '@/stores/modules/umUserInfo'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    mutations
  },
  actions
})
