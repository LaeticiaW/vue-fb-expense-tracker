<template>
  <!-- Common Date Range input -->
  <div class="date-range-container">
    <!-- Start Date -->
    <span class="date-wrapper">
      <v-menu offset-y bottom v-model="startDateMenu" :close-on-content-click="true" transition="scale-transition">
        <template v-slot:activator="{ on }">
          <v-text-field
            ref="startDate"
            outlined
            readonly
            dense
            hide-details
            required
            v-model="startDate"
            name="startDate"
            v-on="on"
            class="start-date"
            background-color="#ffffff"
            label="Start Date"
            :maxlength="10"
            spellcheck="false"
            autocomplete="off"
            autofocus
          />
        </template>
        <v-date-picker
          v-model="startDate"
          no-title
          scrollable
          header-color="primary"
          :max="maxDate"
          @input="dateRangeChanged"
        >
          <v-spacer />
          <v-btn text color="primary" @click="startDateMenu = false">Cancel</v-btn>
        </v-date-picker>
      </v-menu>
    </span>

    <!-- End Date -->
    <span class="date-wrapper">
      <v-menu offset-y bottom v-model="endDateMenu" :close-on-content-click="true" transition="scale-transition">
        <template v-slot:activator="{ on }">
          <v-text-field
            ref="endDate"
            outlined
            readonly
            dense
            hide-details
            required
            v-model="endDate"
            name="endDate"
            v-on="on"
            class="end-date"
            background-color="#ffffff"
            label="End Date"
            :maxlength="10"
            spellcheck="false"
            autocomplete="off"
            autofocus
          />
        </template>
        <v-date-picker
          v-model="endDate"
          no-title
          scrollable
          header-color="primary"
          :max="maxDate"
          @input="dateRangeChanged"
        >
          <v-spacer />
          <v-btn text color="primary" @click="endDateMenu = false">Cancel</v-btn>
        </v-date-picker>
      </v-menu>
    </span>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'DateRangeInput',
  props: {
    // dateRange object contains startDate, endDate properties
    dateRange: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      startDate: this.dateRange.startDate,
      endDate: this.dateRange.endDate,
      startDateMenu: false,
      endDateMenu: false,
      minDate: null,
      maxDate: dayjs().format('YYYY-MM-DD')
    }
  },
  computed: {
    startDateMax() {
      return this.dateRange.endDate
    },
    endDateMin() {
      return this.dateRange.startDate
    }
  },
  methods: {
    /*
     * When the user changes the start or end date values, calculate the number (ms) date values from the string values
     * and emit the date-range-changed event.
     */
    dateRangeChanged() {
      // this.setMsDates()
      this.$emit('date-range-changed', { startDate: this.startDate, endDate: this.endDate })
    }
  },

  /*
   * On create, initialize the date range values
   */
  created() {
    if (!this.dateRange.startDate) {
      this.startDate = dayjs().startOf('year').format('YYYY-MM-DD')
    }
    if (!this.dateRange.endDate) {
      this.endDate = dayjs().format('YYYY-MM-DD')
    }
    // if (!this.dateRange.startDate) {
    //   dayjs()
    //     .startOf('year')
    //     .format('YYYY-MM-DD')
    // }
    // if (!this.dateRange.endDate) {
    //   dayjs().format('YYYY-MM-DD')
    // }
  }
}
</script>

<style lang="scss" scoped>
.date-wrapper {
  display: inline-block;
  width: 100px !important;
  margin-right: 8px !important;
}

::v-deep .date-wrapper .v-input {
  font-size: 14px !important;
}

@media only screen and (max-width: 600px) {
  .date-wrapper {
    margin-bottom: 8px;
  }
}
</style>
