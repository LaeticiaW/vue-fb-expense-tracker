<template>
  <!-- Common filter bar containing slots for inputs and actions -->
  <div class="filter-container">
    <v-toolbar flat color="#ffffff" class="filter">
      <slot name="inputs" />
      <v-spacer />
      <slot name="actions" />
    </v-toolbar>
  </div>
</template>

<script>
export default {
  name: 'TableFilter'
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
</style>
