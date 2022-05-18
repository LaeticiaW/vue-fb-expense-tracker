<template>
  <div>
    <v-card height="calc(100vh-100px)">
      <!-- Toolbar -->
      <v-toolbar dense short flat color="secondary">
        <v-toolbar-title class="details-title">Subcategory Details</v-toolbar-title>
        <v-spacer />
        <v-btn small dark color="primary" @click="showUpdateDialog" title="Update Subcategory" class="icon-btn">
          <v-icon small>{{ 'mdi-pencil' }}</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Subcategory Details -->
      <v-card-text>
        <v-row>
          <v-col cols="3" xs="6" sm="6" md="4">
            <label for="name">Name:</label>
          </v-col>
          <v-col cols="9" xs="6" sm="6" md="8">
            <div id="name">{{ subcategory.name }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" xs="6" sm="6" md="4">
            <label for="matchText">Import Match Text:</label>
          </v-col>
          <v-col cols="9" xs="6" sm="6" md="8">
            <div id="matchText" v-for="(text, idx) in subcategory.matchText" :key="idx">{{ text }}</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Update subcategory dialog -->
    <update-subcategory-dialog
      v-if="showSubcategoryDialog"
      v-model="showSubcategoryDialog"
      :category="category"
      :subcategory="subcategory"
      @subcategory-updated="subcategoryUpdated"
    />
  </div>
</template>

<script>
import UpdateSubcategoryDialog from '@/components/categories/UpdateSubcategoryDialog.vue'

export default {
  name: 'SubcategoryDetails',

  props: {
    category: {
      type: Object,
      required: true
    },
    subcategory: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      showSubcategoryDialog: false
    }
  },

  components: {
    UpdateSubcategoryDialog
  },

  methods: {
    /*
     * Display the Update Subcategory Dialog
     */
    showUpdateDialog() {
      this.showSubcategoryDialog = true
    },

    /*
     * Re-emit the subcategory-updated event
     */
    subcategoryUpdated(category, subcategory) {
      this.$emit('subcategory-updated', category, subcategory)
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
</style>
