<template>
  <div class="dashlet elevation-2">
    <v-toolbar flat>
      <v-toolbar-title>{{ options.dashletTitle }}</v-toolbar-title>
      <v-spacer />

      <!-- Dashlet actions slot -->
      <slot name="actions" />

      <!-- Maximize and Minimize buttons -->
      <v-btn v-if="!expanded" small dark title="Maximize" @click="maximize" color="primary" class="icon-btn control">
        <v-icon>mdi-fullscreen</v-icon>
      </v-btn>
      <v-btn v-if="expanded" small dark title="Minimize" @click="minimize" color="primary" class="icon-btn control">
        <v-icon>mdi-fullscreen-exit</v-icon>
      </v-btn>
    </v-toolbar>

    <v-divider />

    <div class="dashlet-content">
      <!-- Dashlet content slot -->
      <slot name="content" />
    </div>
  </div>
</template>

<script>
/*
 * This is a common Dashlet component used by dashlets for a common look and feel
 */
export default {
  name: 'Dashlet',
  inject: ['dashboardEventBus'],
  props: {
    // Options contains vue-grid-item options plus component and dashletTitle properties
    options: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      expanded: false
    }
  },

  methods: {
    /*
     * Emit the maximize event, will be caught by the Dashboard component
     */
    maximize() {
      this.expanded = true
      this.$emit('maximize')
      this.dashboardEventBus.$emit('maximize', this.options)
    },

    /*
     * Emit the minimize event, will be caught by the Dashboard component
     */
    minimize() {
      this.expanded = false
      this.$emit('minimize')
      this.dashboardEventBus.$emit('minimize', this.options)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.dashlet {
  position: relative;
  height: 100%;

  .dashlet-content {
    padding: 0px 24px 12px 24px;
    height: calc(100% - 80px);
  }

  ::v-deep .v-toolbar__title {
    font-size: 1rem !important;
    line-height: 1 !important;
    font-weight: 500;
  }
}
</style>
