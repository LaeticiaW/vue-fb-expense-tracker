<template>
  <div>
    <v-dialog :value="value" width="500" @click:outside="close">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Add Category</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="dialog-content">
          <v-form ref="form">
            <div class="dialog-error error--text">{{ dialogMessage }}</div>

            <v-container class="form-container">
              <v-row>
                <v-col cols="12" md="12" class="category-col">
                  <v-text-field
                    ref="name"
                    dense
                    outlined
                    required
                    maxlength="30"
                    v-model="categoryName"
                    label="Category"
                    :rules="nameRules"
                    spellcheck="false"
                    autocomplete="off"
                    @keydown.enter.prevent="addCategory"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn text color="#787878" @click="close">Cancel</v-btn>
          <v-btn text color="primary" @click="addCategory">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CategoryService from '@/services/category'

export default {
  name: 'AddCategoryDialog',

  props: {
    // Component v-model property
    value: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      categoryName: undefined,
      valid: undefined,
      isCategoryUnique: true,
      dialogMessage: null,
      nameRules: [
        (value) => !!value || 'Category Name is required',
        () => this.isCategoryUnique || 'Category Name is not unique'
      ]
    }
  },

  methods: {
    /*
     * Add the new category to the db, emit category-added event, and then close the dialog
     */
    async addCategory() {
      this.isCategoryUnique = true
      const category = {
        name: this.categoryName,
        subcategories: []
      }

      try {
        await CategoryService.createCategory(category)
        this.$emit('category-added', category)
        // Close the dialog
        this.close()
      } catch (error) {
        if (error && error.indexOf('Duplicate') !== -1) {
          this.isCategoryUnique = false
          this.$refs.form.validate()
        } else {
          console.error('Error creating category:', error)
          this.dialogMessage = 'Error creating the Category'
        }
      }
    },

    /*
     * Close the dialog
     */
    close() {
      this.$emit('input', false)
    }
  },

  /*
   * On mount focus the name field
   */
  mounted() {
    // Focus the name field
    setTimeout(this.$refs.name.focus, 0)
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.form-container {
  padding: 0px;
}
.category-col {
  padding-top: 0px;
  padding-bottom: 0px;
}
</style>
