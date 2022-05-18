<template>
  <div>
    <!-- Navigation drawer -->
    <v-navigation-drawer v-model="navDrawerOpen" clipped absolute app hide-overlay temporary>
      <v-list dense nav>
        <v-list-item link v-for="item in navRoutes" :key="item.name" :to="{ name: item.name }">
          <v-list-item-icon>
            <v-icon>{{ item.meta.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App bar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon v-if="isLoggedIn" @click.stop="navIconClicked" />
      <v-toolbar-title>Expense Tracker</v-toolbar-title>
      <v-spacer />
      <v-menu offset-y bottom :close-on-content-click="true" transition="scale-transition" v-if="isLoggedIn">
        <template v-slot:activator="{ on }">
          <v-avatar color="white" size="36" v-on="on">
            <span class="primary--text headline">{{ avatarLetter }}</span>
          </v-avatar>
        </template>
        <v-list dense>
          <v-list-item link @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="loggedInUserId === 'admin1'" link @click="reloadData">
            <v-list-item-title>Reload Demo Data</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </div>
</template>

<script>
import { Routes } from '@/router'
import ReloadService from '@/services/reload.js'

export default {
  name: 'AppBar',

  data() {
    return {
      navDrawerOpen: null
    }
  },

  computed: {
    navRoutes() {
      // only return routes that should show up in the navigation drawer
      return Routes.filter((route) => !route.meta.hidden)
    },
    avatarLetter() {
      if (this.$store.state.loggedInUserId && this.$store.state.currentUser && this.$store.state.currentUser.userId) {
        return this.$store.state.currentUser.userId.substr(0, 1).toUpperCase()
      }
      return ''
    },
    isLoggedIn() {
      return this.$store.state.loggedInUserId !== null
    },
    loggedInUserId() {
      return this.$store.state.loggedInUserId
    }
  },

  methods: {
    /*
     * Toggle the nav drawer
     */
    navIconClicked() {
      this.navDrawerOpen = !this.navDrawerOpen
    },

    /*
     * Logout user
     */
    logout() {
      this.$store.dispatch('logout')
      this.$router.push({ name: 'Login' })
    },

    /*
     * Reload the category and expense data into Firebase
     */
    async reloadData() {
      const confirm = await this.$confirm(`Are you sure you want to reload the category and expense data?`, {
        title: 'Confirm Reload Data'
      })
      if (confirm) {
        try {
          await ReloadService.reloadCategoryData()
          await ReloadService.reloadExpenseData()
        } catch (e) {
          console.error('Error reloading category and expense data:', e)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.v-navigation-drawer--temporary.v-navigation-drawer--clipped {
  z-index: 5;
  padding-top: 64px;
}
.v-list-item__title {
  font-size: 0.875em !important;
}
</style>
