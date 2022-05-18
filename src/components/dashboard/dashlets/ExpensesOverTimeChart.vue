<template>
  <dashlet :dashletTitle="options.dashletTitle" :options="options">
    <!-- Dashlet Actions -->
    <template v-slot:actions>
      <!-- Start and end dates -->
      <date-range-input :date-range="filter" @date-range-changed="filterChanged" />
    </template>
    <!-- Dashlet Content -->
    <template v-slot:content>
      <div v-if="show" class="content-container">
        <div class="chart-container">
          <highcharts v-if="show" ref="highcharts" :options="chartOptions" />
        </div>
      </div>

      <snack-msg :options="snackOptions" @update-show="snackOptions.show = $event" />
    </template>
  </dashlet>
</template>

<script>
import Dashlet from '@/components/dashboard/Dashlet'
import ExpenseService from '@/services/expense'
import Util from '@/services/util'
import SnackMsg from '@/components/common/SnackMsg'
import DateRangeInput from '@/components/common/DateRangeInput'
import dayjs from 'dayjs'

export default {
  name: 'ExpensesOverTimeChart',
  props: {
    // Options object contains vue-grid-item options plus component and dashletTitle properties
    options: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      show: true,
      chartOptions: {},
      expenses: [],
      filter: {
        startDate: dayjs().startOf('year').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        categoryIds: []
      },
      snackOptions: {
        show: null,
        msg: null,
        color: 'error'
      },
      series: []
    }
  },
  components: {
    Dashlet,
    SnackMsg,
    DateRangeInput
  },
  methods: {
    /*
     * Get the expense time series data
     */
    async getExpenseTimeSeries() {
      try {
        this.series = await ExpenseService.getExpenseTimeSeries(this.filter)
        this.chartOptions = this.getChartOptions()
        this.show = true
      } catch (error) {
        console.error('Error retrieving expense time series:', error)
        Util.showSnack(this.snackOptions, 'Error retrieving data for Expenses Over Time dashlet')
      }
    },

    /*
     * When the filter values change, retrieve the expense time series data again
     */
    filterChanged(values) {
      if (values.startDate) {
        this.filter.startDate = values.startDate
      }
      if (values.endDate) {
        this.filter.endDate = values.endDate
      }
      this.getExpenseTimeSeries()
    },

    /*
     * Get the Highcharts line chart options for the time series
     */
    getChartOptions() {
      const chartOptions = {
        chart: {
          type: 'line'
        },
        time: {
          useUTC: false
        },
        title: {
          text: undefined
        },
        tooltip: {
          shared: true,
          valueDecimals: 2,
          headerFormat: '',
          useHTML: true,
          outside: true,
          backgroundColor: 'rgb(239, 239, 239, 1)', // use rgb so can set opacity
          formatter() {
            return Util.formatTimeSeriesSharedTooltip(this)
          }
        },
        yAxis: {
          title: { text: 'Amount' }
        },
        xAxis: {
          type: 'datetime'
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          useHTML: true
        },
        series: this.series
      }
      return chartOptions
    }
  },

  /*
   * On create, initialize the filter and retrieve the categories and expense time series data
   */
  mounted() {
    this.getExpenseTimeSeries()
  }
}
</script>

<style lang="scss" scoped>
.content-container {
  position: relative;
  height: 100%;

  .chart-container {
    position: relative;
    height: 100%;

    ::v-deep div[data-highcharts-chart] {
      position: relative;
      height: 100% !important;
      width: 100%;
    }
  }
}

.filter-input {
  width: 120px !important;
  margin-right: 12px;
}

.chart-bottom-text {
  position: absolute;
  bottom: -24px;
  right: 4px;
  z-index: 5;
  opacity: 1;
  background-color: #ffffff;
}
</style>
