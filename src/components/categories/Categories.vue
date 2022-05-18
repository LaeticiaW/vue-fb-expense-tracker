<template>
  <div class="page">
    <page-header title="Categories" />

    <div class="page-content">
      <!-- Grid layout for single row, two column layout, left column for tree view, right column for details view -->
      <v-row align="start" align-content="start">
        <v-col cols="12" sm="6" md="5">
          <v-card flat outlined class="category-tree-panel">
            <!-- Toolbar -->
            <v-toolbar dense flat color="secondary">
              <v-spacer></v-spacer>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn small dark v-on="on" color="primary" title="Actions" class="icon-btn">
                    <v-icon small>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click="showCategoryDialog = true">
                    <v-list-item-title>Add Category</v-list-item-title>
                  </v-list-item>
                  <v-list-item :disabled="!isCategorySelected" @click="showSubcategoryDialog = true">
                    <v-list-item-title>Add Subcategory</v-list-item-title>
                  </v-list-item>
                  <v-list-item :disabled="!isCategorySelected && !isSubcategorySelected" @click="deleteItem">
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="expandAllCategories">
                    <v-list-item-title>Expand All Categories</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="collapseAllCategories">
                    <v-list-item-title>Collapse All Categories</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-toolbar>
            <v-card-text>
              <!-- Category Tree -->
              <div class="category-tree-wrapper">
                <v-treeview
                  dense
                  activatable
                  return-object
                  ref="treeviewRef"
                  :items="categories"
                  item-key="treeId"
                  item-children="subcategories"
                  :active="activeCategories"
                  color="#454545"
                  :open="openCategories"
                  @update:active="itemActivated"
                  @update:open="itemOpened"
                >
                  <template v-slot:append="{ leaf, active }">
                    <v-btn
                      icon
                      v-if="active && !leaf"
                      @click.stop="showSubcategoryDialog = true"
                      color="primary"
                      title="Add Subcategory"
                    >
                      <v-icon small>{{ 'mdi-plus' }}</v-icon>
                    </v-btn>
                    <v-btn icon v-if="active" @click.stop="deleteItem" color="primary" title="Delete Category">
                      <v-icon small>{{ 'mdi-delete' }}</v-icon>
                    </v-btn>
                  </template>
                </v-treeview>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="7">
          <!-- Category Details -->
          <category-details v-if="isCategorySelected" :category="currentCategory" @category-updated="categoryUpdated" />
          <!-- Subcategory Details -->
          <subcategory-details
            v-if="isSubcategorySelected"
            :category="parentCategory"
            :subcategory="currentSubcategory"
            @subcategory-updated="subcategoryUpdated"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Add Category dialog -->
    <add-category-dialog v-if="showCategoryDialog" v-model="showCategoryDialog" @category-added="categoryAdded" />

    <!-- Add Subcategory dialog -->
    <add-subcategory-dialog
      v-if="showSubcategoryDialog"
      v-model="showSubcategoryDialog"
      :category="currentCategory"
      @subcategory-added="subcategoryAdded"
    />
    <!-- Snack Msg -->
    <snack-msg :options="snackOptions" @update-show="snackOptions.show = $event" />
  </div>
</template>

<script>
import PageHeader from '@/components/common/PageHeader.vue'
import CategoryDetails from '@/components/categories/CategoryDetails.vue'
import SubcategoryDetails from '@/components/categories/SubcategoryDetails.vue'
import AddCategoryDialog from '@/components/categories/AddCategoryDialog.vue'
import AddSubcategoryDialog from '@/components/categories/AddSubcategoryDialog.vue'
import CategoryService from '@/services/category.js'
import ExpenseService from '@/services/expense.js'
import SnackMsg from '@/components/common/SnackMsg.vue'
import Util from '@/services/util'

export default {
  name: 'Categories',

  data() {
    return {
      categories: [],
      currentCategory: null,
      currentSubcategory: null,
      parentCategory: null,
      activeCategories: [],
      openCategoryNames: [],
      openCategories: [],
      showCategoryDialog: false,
      showSubcategoryDialog: false,
      maxCategoryId: null,
      snackOptions: {
        show: null,
        msg: null,
        color: 'error'
      }
    }
  },

  components: {
    PageHeader,
    CategoryDetails,
    SubcategoryDetails,
    AddCategoryDialog,
    AddSubcategoryDialog,
    SnackMsg
  },

  computed: {
    isCategorySelected() {
      return this.currentCategory
    },
    isSubcategorySelected() {
      return this.currentSubcategory
    }
  },

  methods: {
    /*
     * Retrieve the category data
     */
    async getCategories() {
      try {
        this.categories = await CategoryService.getCategories()
        if (this.categories.length) {
          // Default the active category to the first one in the list
          this.activeCategories.push(this.categories[0])
          this.currentCategory = this.categories[0]
        }
      } catch (error) {
        console.error('Error retrieving categories:', error)
        Util.showSnack(this.snackOptions, 'Error retrieving categories')
      }
    },

    /*
     * Callback for when a category or subcategory is selected in the tree
     */
    itemActivated(actives) {
      if (actives && actives.length) {
        if (this.isSubcategory(actives[0])) {
          this.currentSubcategory = actives[0]
          this.parentCategory = this.getParentCategory(this.currentSubcategory)
          this.currentCategory = null
        } else {
          this.currentCategory = actives[0]
          this.currentSubcategory = null
          this.parentCategory = null
        }
      } else if (this.currentCategory) {
        // Ensure that an item is always activated, do not allow user to deactivate the row that is currently active
        if (this.currentCategory) {
          this.activeCategories.push(this.currentCategory)
        } else if (this.currentSubcategory) {
          this.activeCategories.push(this.currentSubcategory)
        }
      }
    },

    /*
     * Determine if the specified item is a category or a subcategory
     */
    isSubcategory(item) {
      if (item.parentTreeId !== undefined) {
        return true
      }
      return false
    },

    /*
     * Keep track of open items
     */
    itemOpened(opened) {
      this.openCategories = opened
    },

    /*
     * When the Delete menu item is selected, determine wether to delete a category or subcategory
     */
    deleteItem() {
      if (this.isSubcategorySelected) {
        this.deleteSubcategory()
      } else {
        this.deleteCategory()
      }
    },

    /*
     * Delete the selected Category from the db
     */
    async deleteCategory() {
      const response = await this.$confirm(`Are you sure you want to delete category ${this.currentCategory.name}?`, {
        title: 'Confirm Delete Category'
      })
      if (response) {
        try {
          const categoryInUse = await ExpenseService.isCategoryInUse(this.currentCategory._id)
          if (!categoryInUse) {
            await CategoryService.deleteCategory(this.currentCategory._id)
            this.refreshCategories()
            Util.showSnack(this.snackOptions, 'Category deleted successfully', 'primary')
          } else {
            Util.showSnack(
              this.snackOptions,
              `Cannot delete category '${this.currentCategory.name}' because it is already assigned to expenses`
            )
          }
        } catch (error) {
          console.error('Error deleting category:', error)
          Util.showSnack(this.snackOptions, 'Error deleting the category')
        }
      }
    },

    /*
     * Delete the subcategory from the category object and then save/update the category
     */
    async deleteSubcategory() {
      const response = await this.$confirm(
        `Are you sure you want to delete subcategory ${this.currentSubcategory.name}?`,
        {
          title: 'Confirm Delete Subcategory'
        }
      )
      if (response) {
        let idx = this.categories.findIndex((cat) => cat.treeId === this.currentSubcategory.parentTreeId)
        if (idx !== -1) {
          try {
            // Only remove the subcategory if it is not already associated to expenses
            const isSubcategoryInUse = await ExpenseService.isSubcategoryInUse(this.currentSubcategory.id)
            if (!isSubcategoryInUse) {
              // Remove the subcategory from the category object
              const category = this.categories[idx]
              idx = category.subcategories.findIndex((subcat) => subcat.treeId === this.currentSubcategory.treeId)
              if (idx !== -1) {
                category.subcategories.splice(idx, 1)
              }

              // Save the category to the db
              const cat = await CategoryService.updateCategory(category)

              this.refreshCategories(cat)
              Util.showSnack(this.snackOptions, 'Subcategory deleted successfully', 'primary')
            } else {
              Util.showSnack(
                this.snackOptions,
                `Cannot delete subcategory '${this.currentSubcategory.name}' because it is already assigned to expenses`
              )
            }
          } catch (error) {
            console.error('Error deleting subcategory:', error)
            Util.showSnack(this.snackOptions, 'Error deleting the subcategory')
          }
        }
      }
    },

    /*
     * Retrieve the categories list again from the db and reset categories variables.
     * Note that currentCategory and currentSubcategory must contain references to the newly retrieved categories
     */
    async refreshCategories(currentCat, currentSubcat) {
      try {
        this.categories = await CategoryService.getCategories()
        this.currentCategory = null
        this.currentSubcategory = null

        if (currentCat) {
          // Find the current category in the list
          const idx = this.categories.findIndex((cat) => cat._id === currentCat._id)
          if (idx !== -1) {
            this.currentCategory = this.categories[idx]
          } else {
            this.currentCategory = this.categories.length ? this.categories[0] : null
          }
        } else {
          this.currentCategory = this.categories.length ? this.categories[0] : null
        }

        if (currentSubcat && this.currentCategory) {
          // Find the current subcategory in the subcategory list
          const subIdx = this.currentCategory.subcategories.findIndex((subcat) => subcat.name === currentSubcat.name)
          if (subIdx !== -1) {
            this.currentSubcategory = this.currentCategory.subcategories[subIdx]
            this.parentCategory = this.currentCategory
            this.currentCategory = null
          }
        }

        // The activeCategories and openCategories arrays need to be recreated with the categories
        // just retrieved, so that the object references match.
        this.activeCategories = []
        if (this.currentSubcategory) {
          this.activeCategories = [this.currentSubcategory]
        } else if (this.currentCategory) {
          this.activeCategories = [this.currentCategory]
        }

        this.openCategories = this.categories.filter(
          (item) => this.openCategories.filter((openItem) => openItem._id === item._id).length > 0
        )
      } catch (error) {
        console.error('Error retrieving categories:', error)
        Util.showSnack(this.snackOptions, 'Error retrieving the categories')
      }
    },

    /*
     * Return the parent category for the specified subcategory
     */
    getParentCategory(subcategory) {
      const idx = this.categories.findIndex((cat) => cat.treeId === subcategory.parentTreeId)
      if (idx !== -1) {
        return this.categories[idx]
      }
      return {}
    },

    categoryAdded(category) {
      Util.showSnack(this.snackOptions, 'Category added successfully', 'primary')
      this.refreshCategories(category)
    },

    subcategoryAdded() {
      Util.showSnack(this.snackOptions, 'Subcategory added successfully', 'primary')
      this.refreshCategories(this.currentCategory)
    },

    categoryUpdated(category) {
      Util.showSnack(this.snackOptions, 'Category updated successfully', 'primary')
      this.refreshCategories(category)
    },

    subcategoryUpdated(category, subcategory) {
      Util.showSnack(this.snackOptions, 'Subcategory updated successfully', 'primary')
      this.refreshCategories(category, subcategory)
    },

    /*
     * Expand all categories in the tree
     */
    expandAllCategories() {
      this.$refs.treeviewRef.updateAll(true)
    },

    /*
     * Collapse all categories in the tree
     */
    collapseAllCategories() {
      this.$refs.treeviewRef.updateAll(false)
    }
  },

  /*
   * On create, retrieve the categories data
   */
  created() {
    this.getCategories()
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.category-tree-wrapper {
  height: calc(100vh - 240px);
  overflow-y: auto;
}
::v-deep .v-card {
  height: calc(100vh - 170px);
}
::v-deep .v-treeview-node__content {
  cursor: pointer;
}
</style>
