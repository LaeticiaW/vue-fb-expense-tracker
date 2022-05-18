<template>
  <div v-if="value">
    <v-dialog retain-focus :value="value" width="500" @click:outside="$emit('input', false)" class="expense-dialog">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>{{ dialogTitle }}</v-toolbar-title>
        </v-toolbar>

        <v-divider />

        <v-card-text class="dialog-content">
          <v-form ref="form" v-model="isFormValid">
            <div class="dialog-error error--text">{{ dialogMessage }}</div>

            <!-- Trx Date -->
            <v-menu
              offset-y
              bottom
              v-model="trxDateMenu"
              :close-on-content-click="true"
              transition="scale-transition"
              class="form-item"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  ref="trxDate"
                  outlined
                  readonly
                  dense
                  required
                  v-model="tempExpense.trxDate"
                  class="trxDate"
                  v-on="on"
                  background-color="#ffffff"
                  label="Expense Date"
                  :maxlength="10"
                  :rules="[ruleRequired]"
                  spellcheck="false"
                  autocomplete="off"
                  autofocus
                />
              </template>
              <v-date-picker v-model="tempExpense.trxDate" no-title scrollable header-color="primary">
                <v-spacer />
                <v-btn text color="primary" @click="startDateMenu = false">Cancel</v-btn>
              </v-date-picker>
            </v-menu>

            <!-- Description -->
            <v-text-field
              dense
              outlined
              required
              v-model="tempExpense.description"
              label="Description"
              class="description"
              :rules="[ruleRequired]"
            />

            <!-- Category -->
            <v-select
              dense
              outlined
              required
              v-model="tempExpense.categoryId"
              :items="categories"
              item-text="name"
              item-value="_id"
              @change="categorySelected"
              label="Category"
              background-color="#ffffff"
              class="form-item category"
              menu-props="offset-y, bottom"
              :rules="[ruleRequired]"
            />

            <!-- Subcategory -->
            <v-select
              dense
              outlined
              required
              v-model="tempExpense.subcategoryId"
              :items="subcategories"
              item-text="name"
              item-value="id"
              label="Subcategory"
              background-color="#ffffff"
              class="form-item subcategory"
              menu-props="offset-y, bottom"
              :rules="[ruleRequired]"
            />

            <!-- Amount -->
            <v-text-field
              dense
              outlined
              required
              v-model.number="tempExpense.amount"
              label="Amount"
              class="form-item amount"
              :rules="[ruleRequired]"
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn text color="#787878" @click="close" class="cancel-button">Cancel</v-btn>
          <v-btn text color="primary" @click="save" class="save-button">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ExpenseService from '@/services/expense'
import CategoryService from '@/services/category'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-core'

export default {
  name: 'ExpenseDialog',

  props: {
    // Component v-model property
    value: {
      type: Boolean,
      required: true
    },
    expense: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      isFormValid: undefined,
      isCreate: true,
      trxDateMenu: false,
      tempExpense: cloneDeep(this.expense),
      categories: [],
      subcategories: [],
      categoryMap: {},
      dialogMessage: null,
      snackOptions: {
        show: null,
        msg: null,
        color: 'primary'
      }
    }
  },

  computed: {
    dialogTitle() {
      if (this.expense._id === undefined) {
        return 'Create Expense'
      }
      return 'Update Expense'
    }
  },

  methods: {
    /*
     * Retrieve the categories list, create the categoryMap, set the select categories
     */
    async getCategories() {
      try {
        this.categories = await CategoryService.getCategories()
        this.categoryMap = CategoryService.getCategoryMap(this.categories)
        if (this.tempExpense.categoryId) {
          this.selectedCategory = this.categoryMap[this.tempExpense.categoryId]
          this.subcategories = this.selectedCategory.subcategories
        }
      } catch (error) {
        console.error('Error retrieving categories:', error)
        this.dialogMessage = 'Error retrieving the categories'
      }
    },

    /*
     * Save the updated expense to the db
     */
    async save() {
      if (this.$refs.form.validate()) {
        // Verify that the categoryId and subcategoryId are valid
        const category = this.categoryMap[this.tempExpense.categoryId]
        if (!category) {
          this.tempExpense.categoryId = undefined
        } else {
          const subcategory = category.subcategories.find((subcat) => subcat.id === this.tempExpense.subcategoryId)
          if (!subcategory) {
            this.tempExpense.subcategoryId = undefined
          }
        }

        try {
          await ExpenseService.saveExpense(this.tempExpense)
          this.$emit('expense-updated', this.tempExpense)
          // Close the dialog
          this.close()
        } catch (error) {
          console.error('Error saving expense:', error)
          this.dialogMessage = 'Error saving the expense'
        }
      }
    },

    /*
     * When a categories is selected, get its subcategories from the categoryMap
     */
    categorySelected(catId) {
      const category = this.categoryMap[catId]
      if (category) {
        this.subcategories = category.subcategories
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
   * On create, retrieve the categories data
   */
  created() {
    if (this.tempExpense.trxDate) {
      this.tempExpense.trxDate = dayjs(this.tempExpense.trxDate).format('YYYY-MM-DD')
    }

    // Retrieve the categories list
    this.getCategories()
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.dialog-error {
  color: #bf0d3e;
  padding-bottom: 16px;
}
.dialog-content {
  padding-top: 24px !important;
  padding-bottom: 0px !important;
}
.form-item {
  margin: 16px 0px;
}
</style>
