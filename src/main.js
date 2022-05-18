import Vue from 'vue'
import HighchartsVue from 'highcharts-vue'
import Highcharts from 'highcharts'
import annotations from 'highcharts/modules/annotations'
import drilldown from 'highcharts/modules/drilldown'
import VuetifyConfirm from 'vuetify-confirm'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import GlobalMixin from './mixins/globalMixin'
import UserService from './services/user'
import './firebase/firebase'

// Add global mixin and filters to Vue
Vue.mixin(GlobalMixin)
Vue.prototype.$filters = Vue.options.filters

Vue.config.productionTip = false

// Initialize vuetify-confirm
Vue.use(VuetifyConfirm, {
  vuetify,
  buttonTrueText: 'OK',
  buttonFalseText: 'Cancel',
  color: 'warning',
  icon: 'mdi-warning',
  width: 350,
  property: '$confirm'
})

// Initialize Highcharts
Vue.use(HighchartsVue)
annotations(Highcharts)
drilldown(Highcharts)

// Force user to Login, if needed.
// Note that this is not secure with real authorization, it just fakes a user login
// and storing the userId in localStorage.  The currentUser is stored in Vuex.
router.beforeEach(async (to, from, next) => {
  // console.log('Router beforeEach, to:', to, 'from:', from)
  if (to.name === 'Login') {
    next()
  } else if (!store.state.loggedInUserId) {
    next({ name: 'Login' })
  } else if (!store.state.currentUser) {
    try {
      const user = await UserService.getUser(store.state.loggedInUserId)
      store.commit('setCurrentUser', user)
      next()
    } catch (error) {
      console.error('Error retrieving user', store.state.loggedInUserId, error)
      next()
    }
  } else {
    next()
  }
})

// Create the Vue instance and render the App component at #app
// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  router,
  store,
  vuetify,
  render: (h) => h(App)
})
