<template>
  <v-app>
    <app-bar />

    <!-- Content area/Router View -->
    <v-content>
      <v-container fluid class="content-container">
        <router-view :key="$route.fullPath" />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import AppBar from './components/common/AppBar'

export default {
  name: 'App',

  data() {
    return {
      navDrawerOpen: null
    }
  },

  components: {
    AppBar
  },

  methods: {
    /*
     * Set the Vuetify theme colors
     */
    setThemeColors() {
      this.$vuetify.theme.themes.light.primary = '#005da1'
      this.$vuetify.theme.themes.light.secondary = '#d8ebf7'
      this.$vuetify.theme.themes.light.accent = '#e57200'
      this.$vuetify.theme.themes.light.error = '#bf0d3e'
      this.$vuetify.theme.themes.light.warning = '#ffb81c'
      this.$vuetify.theme.themes.light.info = '#2196F3'
      this.$vuetify.theme.themes.light.success = '#4CAF50'
    }
  },

  /*
   * On create, set the Vuetify theme colors
   */
  created() {
    this.setThemeColors()
  }
}
</script>

<style lang="scss" scoped>
@import './styles/global.scss';

.content-container {
  min-height: calc(100vh - 70px);
}
::v-deep .page {
  margin: 0px 20px 20px 20px;
}
</style>
