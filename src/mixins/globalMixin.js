import dayjs from 'dayjs'
import numeral from 'numeral'

/*
 * This mixin contains methods and filters for global use
 */

export default {
  methods: {
    /*
     * Vuetify rule for required input
     */
    ruleRequired(val) {
      if (val === null || val === undefined || val === '') {
        return 'Value is required'
      }
      return true
    }
  },
  filters: {
    /*
     * Format a date
     * @param {number} value - date value to format (iso string)
     * @param {string} format - date format
     */
    formatDate(value, format) {
      if (value) {
        return dayjs
          .utc(value)
          .local()
          .format(format || 'YYYY-MM-DD')
      }
      return null
    },

    /*
     * Format an amount value
     * @param {number} value - value to format
     */
    formatAmount(value) {
      if (value !== null && value !== undefined) {
        const formattedNum = numeral(value).format('0,0.00')
        return formattedNum === 'NaN' ? null : formattedNum
      }
      return null
    }
  }
}
