<template>
  <div v-if="value">
    <v-dialog :value="value" width="400" @click:outside="close">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Add Subcategory</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="dialog-content">
          <v-form ref="form">
            <div v-if="dialogMessage" class="dialog-error error--text">{{ dialogMessage }}</div>

            <v-container class="form-container">
              <v-row>
                <v-col cols="12" md="12" class="subcategory-col">
                  <v-text-field
                    ref="name"
                    dense
                    outlined
                    required
                    maxlength="20"
                    v-model="subcategoryName"
                    :rules="nameRules"
                    label="Subcategory"
                    spellcheck="false"
                    autocomplete="off"
                    @keydown.enter.prevent="addSubcategory"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn text color="#787878" @click="close">Cancel</v-btn>
          <v-btn text color="primary" @click="addSubcategory">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CategoryService from '@/services/category'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash-core'

export default {
  name: 'AddSubcategoryDialog',

  props: {
    // Component v-model property
    value: {
      type: Boolean,
      required: true
    },
    category: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      subcategoryName: undefined,
      dialogMessage: null,
      isSubcategoryUnique: true,
      nameRules: [
        (value) => !!value || 'Subcategory Name is required',
        () => this.isSubcategoryUnique || 'Subcategory Name is not unique'
      ]
    }
  },

  methods: {
    /*
     * Add the new subcategory to the parent category and save to the db
     */
    async addSubcategory() {
      const newCategory = cloneDeep(this.category)
      newCategory.subcategories.push({
        id: uuidv4(),
        name: this.subcategoryName,
        matchText: []
      })

      newCategory.subcategories.sort((sub1, sub2) => {
        return sub1.name.toLowerCase().localeCompare(sub2.name.toLowerCase())
      })

      try {
        await CategoryService.updateCategory(newCategory, this.subcategoryName)
        this.$emit('subcategory-added', this.category.name, this.subcategoryName)
        this.close()
      } catch (error) {
        if (error.indexOf('Duplicate subcategory') !== -1) {
          this.dialogMessage = 'Subcategory name is not unique within the category'
          this.isSubcategoryUnique = false
          this.$refs.form.validate()
        } else {
          console.error('Error creating subcategory:', error)
          this.dialogMessage = 'Error creating the Subcategory'
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
   * On mount, focus the name field
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
.subcategory-col {
  padding-top: 0px;
  padding-bottom: 0px;
}
</style>
