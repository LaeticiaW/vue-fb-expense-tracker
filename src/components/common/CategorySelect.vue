<template>
  <span class="filter-input">
    <v-select
      multiple
      dense
      outlined
      hide-details
      clearable
      v-model="selectedValues"
      :items="items"
      class="category-select"
      :label="label"
      background-color="#ffffff"
      menu-props="offset-y, bottom"
      :item-text="itemText"
      :item-value="itemValue"
      @change="handleChange"
      @input="handleInput"
    >
      <template v-slot:selection="{ item, index }">
        <span v-if="index === 0">{{ item.name }}</span>
        <span v-if="index === 1" class="other-count">(+{{ selectedValues.length - 1 }})</span>
      </template>
    </v-select>
  </span>
</template>

<script>
export default {
  name: 'CategorySelect',
  props: {
    // Component v-model property
    value: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      requied: true
    },
    items: {
      type: Array,
      required: true
    },
    itemText: {
      type: String,
      default: 'name'
    },
    itemValue: {
      type: String,
      default: '_id'
    }
  },
  data() {
    return {
      selectedValues: null
    }
  },
  methods: {
    handleChange() {
      // Propagate the change event to parent
      this.$emit('change', this.selectedValues)
    },
    handleInput() {
      // v-model implementation
      this.$emit('input', this.selectedValues)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.other-count {
  padding-left: 4px;
}

.category-select {
  max-width: 198px !important;
  min-width: 198px !important;
}
</style>
