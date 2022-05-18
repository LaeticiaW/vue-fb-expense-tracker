<template>
  <div>
    <v-dialog :value="value" width="500" @click:outside="close()">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Update Subcategory</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="dialog-content">
          <v-form ref="form">
            <div class="dialog-error error--text">{{ dialogMessage }}</div>

            <v-text-field
              dense
              outlined
              maxlength="30"
              v-model="tempSubcategory.name"
              :rules="nameRules"
              label="Subcategory"
              required
            />

            <!-- Match Text list -->
            <fieldset class="text-mappings">
              <legend>Match Text</legend>

              <v-list dense height="150" max-height="150" class="overflow-y-auto">
                <v-list-item-group v-model="selectedMatchText" ripple="false">
                  <v-list-item v-for="(matchText, idx) in tempSubcategory.matchText" :key="idx">
                    <v-list-item-content>
                      <v-list-item-title>{{ matchText }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn
                        small
                        icon
                        @click.stop="deleteMatchText(matchText, idx)"
                        color="primary"
                        title="Delete Match Text"
                      >
                        <v-icon small>{{ 'mdi-delete' }}</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </fieldset>

            <!-- New match text to add -->
            <div class="new-text-mapping-container">
              <v-spacer />
              <v-text-field dense outlined v-model="newMatchText" label="New Match Text">
                <template v-slot:append-outer>
                  <v-btn small dark @click.stop="addMatchText" color="primary" title="Add Match Text" class="icon-btn">
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
          <v-btn text color="primary" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CategoryService from '@/services/category.js'
import { cloneDeep } from 'lodash-core'

export default {
  name: 'UpdateSubcategoryDialog',

  props: {
    // Component v-model property
    value: {
      type: Boolean,
      required: true
    },
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
      dialogMessage: null,
      selectedMatchText: undefined,
      nameRules: [
        (value) => !!value || 'Subcategory Name is required',
        () => {
          this.dialogMessage = null
          return this.isSubcategoryUnique() || 'Subcategory Name is not unique'
        }
      ],
      newMatchText: undefined,
      tempCategory: cloneDeep(this.category),
      tempSubcategory: cloneDeep(this.subcategory)
    }
  },

  methods: {
    /*
     * Save the category with updated subcategory to the db
     */
    async save() {
      this.dialogMessage = null
      // Verify the subcategory is unique within the category before saving
      if (this.isSubcategoryUnique()) {
        // Update the subcategory in the category's subcategories
        const index = this.tempCategory.subcategories.findIndex((subcat) => subcat.name === this.subcategory.name)
        if (index !== -1) {
          this.tempCategory.subcategories[index] = this.tempSubcategory

          this.tempCategory.subcategories.sort((sub1, sub2) => {
            return sub1.name.toLowerCase().localeCompare(sub2.name.toLowerCase())
          })

          try {
            await CategoryService.updateCategory(this.tempCategory)
            // Emit the subcategory-updated event
            this.$emit('subcategory-updated', this.tempCategory, this.tempSubcategory)
            // Close the dialog
            this.close()
          } catch (error) {
            console.error('Error saving subcategory:', error)
            this.dialogMessage = 'Error saving the Subcategory'
          }
        }
      } else {
        this.dialogMessage = 'Subcategory name is not unique'
      }
    },

    /*
     * Determine if the subcategory name is unique within the category
     */
    isSubcategoryUnique() {
      // First check that if name is unchanged from original
      if (this.tempSubcategory.name.toLowerCase() === this.subcategory.name.toLowerCase()) {
        return true
      }
      // Now check to see if subcategory name is already used within the category
      const idx = this.tempCategory.subcategories.findIndex(
        (subcat) => subcat.name.toLowerCase() === this.tempSubcategory.name.toLowerCase()
      )
      if (idx !== -1) {
        return false
      }
      return true
    },

    /*
     * Close the dialog
     */
    close() {
      this.$emit('input', false)
    },

    /*
     * Add match text to the subcategory
     */
    addMatchText() {
      this.dialogMessage = null
      if (!this.newMatchText) {
        return
      }

      if (!this.tempSubcategory.matchText) {
        this.tempSubcategory.matchText = []
      }

      // Verify the new matchtext is unique within the subcategory before adding it
      const idx = this.tempSubcategory.matchText.findIndex(
        (match) => match.toLowerCase() === this.newMatchText.toLowerCase()
      )
      if (idx === -1) {
        this.tempSubcategory.matchText.push(this.newMatchText)

        // Sort the matchtext
        this.tempSubcategory.matchText.sort((a, b) => {
          if (a.toLowerCase() < b.toLowerCase()) {
            return -1
          }
          if (a.toLowerCase() > b.toLowerCase()) {
            return 1
          }
          return 0
        })
      }
      this.newMatchText = undefined
    },

    /*
     * Delete match text from the subcategory
     */
    deleteMatchText(text, idx) {
      this.dialogMessage = null
      this.tempSubcategory.matchText.splice(idx, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.text-mappings {
  padding: 8px;
  border-radius: 5px;
  border: solid 1px #9a9a9a;
}

.new-text-mapping-container {
  padding-top: 16px;
}

::v-deep .v-list-item__action {
  margin: 6px 0px !important;
}
</style>
