<template>
  <div>
    <v-dialog :value="value" width="500" @click:outside="close()">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Update Category</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="dialog-content">
          <v-form ref="form">
            <div class="dialog-error error--text">{{ dialogMessage }}</div>

            <v-text-field
              dense
              outlined
              maxlength="20"
              v-model="tempCategory.name"
              label="Category"
              required
              :rules="nameRules"
            />

            <!--Subcategory List -->
            <fieldset class="subcategories">
              <legend>Subcategories</legend>

              <v-list dense height="150" max-height="150" class="overflow-y-auto">
                <v-list-item-group v-model="selectedSubcategory" ripple="false">
                  <v-list-item v-for="(subcat, idx) in tempCategory.subcategories" :key="idx">
                    <v-list-item-content>
                      <v-list-item-title>{{ subcat.name }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn
                        small
                        icon
                        @click.stop="deleteSubcategory(subcat, idx)"
                        color="primary"
                        title="Delete Subcategory"
                      >
                        <v-icon small>{{ 'mdi-delete' }}</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </fieldset>

            <!-- Subcategory to add -->
            <div class="new-subcategory-container">
              <v-spacer />
              <v-text-field dense outlined v-model="newSubcategory" label="New Subcategory">
                <template v-slot:append-outer>
                  <v-btn
                    dark
                    small
                    @click.stop="addSubcategory"
                    color="primary"
                    title="Add Subcategory"
                    class="icon-btn"
                  >
                    <v-icon small>{{ 'mdi-plus' }}</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </div>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn text color="#787878" @click="close">Cancel</v-btn>
          <v-btn text color="primary" @click="save" :disabled="!tempCategory.name">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snack Msg -->
    <snack-msg :options="snackOptions" @update-show="snackOptions.show = $event" />
  </div>
</template>

<script>
import CategoryService from '@/services/category.js'
import SnackMsg from '@/components/common/SnackMsg.vue'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash-core'

export default {
  name: 'UpdateCategoryDialog',

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
      selectedSubcategory: undefined,
      nameRules: [
        (value) => !!value || 'Category Name is required',
        () => {
          this.dialogMessage = null
          return this.isCategoryUnique || 'Category Name is not unique'
        }
      ],
      newSubcategory: undefined,
      tempCategory: cloneDeep(this.category),
      isCategoryUnique: true,
      dialogMessage: null,
      snackOptions: {
        show: null,
        msg: null,
        color: 'primary'
      }
    }
  },

  components: {
    SnackMsg
  },

  methods: {
    /*
     * Save the Category to the db
     */
    async save() {
      this.dialogMessage = null
      this.isCategoryUnique = true

      try {
        await CategoryService.updateCategory(this.tempCategory)
        this.$emit('category-updated', this.tempCategory)
        // Close the dialog
        this.close()
      } catch (error) {
        if (error && error.indexOf('Duplicate') !== -1) {
          this.isCategoryUnique = false
          this.$refs.form.validate()
        } else {
          console.error('Error saving category:', error)
          this.dialogMessage = 'Error saving the Category'
        }
      }
    },

    /*
     * Close the dialog
     */
    close() {
      this.$emit('input', false)
    },

    /*
     * Add the new subcategory to the list of subcategories
     */
    addSubcategory() {
      this.dialogMessage = null
      if (!this.newSubcategory) {
        return
      }

      // Verify subcategory name not already in the category list
      const sameName = this.tempCategory.subcategories.find(
        (sub) => sub.name.toLowerCase() === this.newSubcategory.toLowerCase()
      )
      if (sameName) {
        this.newSubcategory = undefined
        return
      }

      const subcat = {
        id: uuidv4(),
        name: this.newSubcategory,
        parentTreeId: this.tempCategory.treeId,
        matchText: []
      }

      this.tempCategory.subcategories.push(subcat)
      this.newSubcategory = undefined

      this.tempCategory.subcategories.sort((sub1, sub2) => {
        return sub1.name.toLowerCase().localeCompare(sub2.name.toLowerCase())
      })
    },

    /*
     * Delete the subcategory from the list
     */
    deleteSubcategory(subcat, idx) {
      this.dialogMessage = null
      this.tempCategory.subcategories.splice(idx, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.subcategories {
  padding: 8px;
  border-radius: 5px;
  border: solid 1px #9a9a9a;
}
.new-subcategory-container {
  padding-top: 16px;
}
::v-deep .v-list-item__action {
  margin: 6px 0px !important;
}
</style>
