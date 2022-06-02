<template>
  <!-- Common filter bar containing slots for inputs and actions -->
  <div class="filter-container">
    <v-toolbar flat color="#ffffff" class="filter" :prominent="prominent">
      <slot name="inputs" />
      <v-spacer />
      <slot name="actions" />
    </v-toolbar>
  </div>
</template>

<script>
export default {
  name: 'TableFilter',
  props: {
    enableProminent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      prominent: false
    }
  },
  methods: {
    /*
     * At extra small breakpoint, increase height of toolbar to handle wrapping fields
     */
    increaseToolbarHeight(isXsBreakpoint) {
      if (isXsBreakpoint.matches) {
        this.prominent = true
      } else {
        this.prominent = false
      }
    }
  },

  /*
   * On mount, determine if need to increase size of toolbar
   */
  mounted() {
    if (this.enableProminent) {
      // At extra small breakpoint, increase the height of the toolbar
      this.isXsBreakpoint = window.matchMedia('(max-width: 600px)')
      this.increaseToolbarHeight(this.isXsBreakpoint)
      this.isXsBreakpoint.addEventListener('change', this.increaseToolbarHeight)
    }
  },

  /*
   * Before destroy, remove event listeners
   */
  beforeDestroy() {
    this.isXsBreakpoint.addEventListener('change', this.increaseToolbarHeight)
  }
}
</script>

<style lang="scss" scoped>
.filter {
  background-color: #d8ebf7 !important;
  margin-bottom: 24px;
  border: solid 1px #d1dce4 !important;
  border-radius: 5px;

  ::v-deep .v-input,
  ::v-deep input::placeholder,
  .v-text-field__slot {
    font-size: 13px !important;
  }

  // Change the Vuetify input label font size, only when the label is active, e.g. used as placeholder
  ::v-deep .v-input label:not(.v-label--active) {
    font-size: 13px !important;
  }
}

.v-toolbar--prominent {
  padding: 16px;
}
</style>
