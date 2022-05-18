<template>
  <!-- Common page header -->
  <h2 class="page-title">{{ title }}</h2>
</template>

<script>
export default {
  name: 'PageHeader',

  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 1.25rem;
  font-weight: bold;
  padding: 0px 8px 8px 0px;
}
</style>
