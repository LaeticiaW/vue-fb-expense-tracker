<template>
  <div class="page">
    <page-header title="Login" />

    <div class="page-content">
      <v-form ref="form" class="form" noValidate autoComplete="off">
        <v-select
          dense
          outlined
          required
          v-model="userId"
          :items="users"
          item-text="id"
          item-value="id"
          label="Users"
          background-color="#ffffff"
          menu-props="offset-y, bottom"
          :rules="[ruleRequired]"
        />
        <v-btn raised color="primary" @click="login" class="login-button">Login</v-btn>
      </v-form>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/common/PageHeader'
import UserService from '@/services/user'

export default {
  name: 'Login',
  data() {
    return {
      userId: null,
      users: [],
      isFormValid: true
    }
  },
  components: {
    PageHeader
  },
  methods: {
    async getUsers() {
      try {
        this.users = await UserService.getUsers()
      } catch (error) {
        console.error('Error retrieving users:', error)
      }
    },
    async login() {
      if (this.$refs.form.validate()) {
        try {
          await this.$store.dispatch('login', this.userId)
          this.$router.push({ name: 'Dashboard' })
        } catch (error) {
          console.error('Error routing to Dashboard after login:', error)
        }
      }
    }
  },
  created() {
    this.getUsers()
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.form {
  padding-top: 100px;
  width: 200px;
  margin: auto;
}
</style>
