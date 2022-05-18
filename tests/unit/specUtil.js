import { createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VuetifyConfirm from 'vuetify-confirm'
import GlobalMixin from '@/mixins/globalMixin'

/*
 * Spec Utility methods
 */
export default {
  /*
   * Get the local Vue instance
   */
  getLocalVueInstance() {
    const vuetify = new Vuetify()
    const localVue = createLocalVue()

    // Register Vuetify
    Vue.use(Vuetify)
    localVue.use(Vuetify)

    // Add the global mixins to the local vue
    localVue.mixin(GlobalMixin)

    // Add the Vuetify Confirm dialog
    localVue.use(VuetifyConfirm, {
      vuetify,
      buttonTrueText: 'OK',
      buttonFalseText: 'Cancel',
      color: 'warning',
      icon: '',
      width: 400,
      property: '$confirm'
    })

    document.body.innerHTML = ''
    document.body.setAttribute('data-app', true)

    return localVue
  },

  /*
   * Returns a function that returns a promise that resolves to the data parameter, useful in jest.spyOn calls
   * when you want a mockImplementation of an asynchronous method that just returns test data.
   * Example:
   *     const expenses = [<expense object>, <expense object>...]
   *     const expenseSpy = jest.spyOn(ExpenseService, 'getExpenses').mockImplementation(SpecUtil.getPromiseData(expenses)
   */
  getPromiseData(data) {
    return function () {
      return Promise.resolve(data)
    }
  },

  getPromiseData2(data) {
    return function () {
      return {
        then(callback) {
          callback(data)

          return {
            catch() {}
          }
        }
      }
    }
  },

  /*
   * Generic function to use with jest.spyOn when the method returns a rejected promise
   */
  rejectPromise() {
    const response = {
      data: {
        messages: ['one']
      }
    }

    return function () {
      return Promise.reject(response)
    }
  },

  // Remove transition styles to prevent delay that breaks tests
  // vue-test-utils: https://github.com/vuejs/vue-test-utils/issues/839
  stubTransitions() {
    const { getComputedStyle } = window
    window.getComputedStyle = function getComputedStyleStub(el) {
      return {
        ...getComputedStyle(el),
        transitionDelay: '',
        transitionDuration: '',
        animationDelay: '',
        animationDuration: ''
      }
    }
  }
}
