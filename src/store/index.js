import Vue from 'vue'
import Vuex from 'vuex'
import UserService from '@/services/user'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedInUserId: localStorage.getItem('etLoginToken'),
    currentUser: null
  },
  mutations: {
    setLoggedInUserId(state, userId) {
      state.loggedInUserId = userId
    },
    setCurrentUser(state, user) {
      state.currentUser = user
    }
  },
  actions: {
    async login({ commit }, userId) {
      const user = await UserService.getUser(userId)
      localStorage.setItem('etLoginToken', user.userId)
      commit('setCurrentUser', user)
      commit('setLoggedInUserId', user.userId)
    },
    logout({ commit }) {
      localStorage.removeItem('etLoginToken')
      commit('setLoggedInUserId', null)
      commit('setCurrentUser', null)
    },
    setCurrentUser({ commit }, user) {
      commit('setCurrentUser', user)
    }
  },
  modules: {}
})
