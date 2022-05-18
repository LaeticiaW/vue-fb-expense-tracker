<template>
  <div>
    <v-card flat outlined height="calc(100vh-100px)">
      <!-- Toolbar -->
      <v-toolbar dense short flat color="secondary">
        <v-toolbar-title class="details-title">Category Details</v-toolbar-title>
        <v-spacer />
        <v-btn small dark color="primary" title="Update Category" class="icon-btn" @click="showUpdateCategoryDialog">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Category Details -->
      <v-card-text>
        <v-row>
          <v-col cols="3" xs="6" sm="6" md="4">
            <label for="name">Name:</label>
          </v-col>
          <v-col cols="9" xs="6" sm="6" md="8">
            <div id="name">{{ category.name }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" xs="6" sm="6" md="4"><label for="subcategories">Subcategories:</label></v-col>
          <v-col cols="9" xs="6" sm="6" md="8">
            <div v-for="(subcat, idx) in category.subcategories" :key="idx" id="subcategories">
              {{ subcat.name }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Update category dialog -->
    <update-category-dialog
      v-if="showCategoryDialog"
      v-model="showCategoryDialog"
      :category="category"
      @category-updated="categoryUpdated"
    />
  </div>
</template>

<script>
import UpdateCategoryDialog from '@/components/categories/UpdateCategoryDialog.vue'

export default {
  name: 'CategoryDetails',

  props: {
    category: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      showCategoryDialog: false
    }
  },

  components: {
    UpdateCategoryDialog
  },

  methods: {
    /*
     * Show the Update Category dialog
     */
    showUpdateCategoryDialog() {
      this.showCategoryDialog = true
    },

    /*
     * Re-emit the category-updated event
     */
    categoryUpdated(category) {
      this.$emit('category-updated', category)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

label {
  font-weight: bold;
}
.details-title {
  font-size: 1rem;
}
.icon-btn {
  padding: 0px !important;
  min-width: 28px !important;
}
</style>
