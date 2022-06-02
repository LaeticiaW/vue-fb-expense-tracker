<template>
  <div class="page">
    <page-header title="Manage Expenses" />

    <div class="page-content table-content">
      <!-- Filter -->
      <table-filter :enable-prominent="true">
        <template v-slot:inputs>
          <!-- Start and end dates -->
          <date-range-input :date-range="filter" @date-range-changed="filterChanged" />
          <!-- Category -->
          <category-select
            v-model="filter.categoryIds"
            :items="selectCategories"
            label="Category"
            @change="filterChanged"
          />
        </template>

        <template v-slot:actions>
          <v-btn
            small
            dark
            @click="showAddExpenseDialog"
            color="primary"
            title="Create New Expense"
            class="icon-btn create-expense-btn"
          >
            <v-icon small>{{ 'mdi-plus' }}</v-icon>
          </v-btn>
        </template>
      </table-filter>

      <!-- Data Table -->
      <div class="table-container">
        <v-data-table
          :headers="headers"
          :items="expenses"
          item-key="_id"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          disable-pagination
          hide-default-footer
          must-sort
          @click:row="rowClicked"
        >
          <template v-slot:item.amount="{ item }">
            <span>{{ item.amount | formatAmount }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small color="primary" class="mr-3" @click="updateExpense(item)">mdi-pencil</v-icon>
            <v-icon class="delete-expense-btn" small @click="deleteExpense(item)">mdi-delete</v-icon>
          </template>
          <template v-slot:no-data>
            <div>No Data</div>
          </template>
        </v-data-table>
      </div>
      <div class="table-footer">
        <v-toolbar flat dense>
          <span>{{ expenses.length }} {{ rowText }}</span>
        </v-toolbar>
      </div>
    </div>

    <!-- Update Expense Dialog -->
    <expense-dialog
      v-if="showExpenseDialog"
      v-model="showExpenseDialog"
      :expense="selectedExpense"
      @expense-updated="expenseUpdated"
    />

    <!-- Snack Msg -->
    <snack-msg :options="snackOptions" @update-show="snackOptions.show = $event" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import ExpenseDialog from '@/components/expenses/ExpenseDialog'
import ExpenseService from '@/services/expense'
import CategoryService from '@/services/category'
import SnackMsg from '@/components/common/SnackMsg'
import TableFilter from '@/components/common/TableFilter'
import DateRangeInput from '@/components/common/DateRangeInput'
import PageHeader from '@/components/common/PageHeader'
import CategorySelect from '@/components/common/CategorySelect'
import Util from '@/services/util'

export default {
  name: 'Expenses',

  data() {
    return {
      showExpenseDialog: false,
      selectedExpense: {},
      newExpense: {},
      sortBy: 'trxDate',
      sortDesc: true,
      expenses: [],
      categories: [],
      selectCategories: [],
      addExpense: false,
      filter: {
        startDate: dayjs().startOf('year').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        categoryIds: []
      },
      headers: [
        { value: 'trxDate', text: 'Date', align: 'start' },
        { value: 'description', text: 'Description' },
        { value: 'categoryName', text: 'Category' },
        { value: 'subcategoryName', text: 'Subcategory' },
        { value: 'amount', text: 'Amount', align: 'end' },
        { value: 'actions', text: 'Actions', sortable: false }
      ],
      snackOptions: {
        show: null,
        msg: null,
        color: 'error'
      }
    }
  },

  components: {
    PageHeader,
    ExpenseDialog,
    SnackMsg,
    TableFilter,
    DateRangeInput,
    CategorySelect
  },

  computed: {
    rowText() {
      return this.expenses.length !== 1 ? 'rows' : 'row'
    }
  },

  methods: {
    /*
     * Retrieve the expense data
     */
    async getExpenses() {
      try {
        this.expenses = await ExpenseService.getExpenses(this.filter, this.categoryMap)
      } catch (error) {
        console.error('Error retrieving expenses:', error)
        Util.showSnack(this.snackOptions, 'Error retrieving the expense data')
      }
    },

    /*
     * Get the categories for the select drop down
     */
    async getCategorySelect() {
      try {
        this.selectCategories = await CategoryService.getCategorySelect()
      } catch (error) {
        console.error('Error retrieving category select:', error)
        Util.showSnack(this.snackOptions, 'Error retrieving category select data')
        throw error
      }
    },

    /*
     * When a filter value changes, retrieve the expenses again
     */
    async filterChanged(values) {
      if (values.startDate) {
        this.filter.startDate = values.startDate
      }
      if (values.endDate) {
        this.filter.endDate = values.endDate
      }
      this.getCategorySelect()
      this.getExpenses()
    },

    /*
     * When a table row is clicked, save that expense as the selectedExpense
     */
    rowClicked(expense) {
      this.selectedExpense = expense
    },

    /*
     * Display the add expense dialog
     */
    showAddExpenseDialog() {
      this.showExpenseDialog = true
      this.addExpense = true
      this.selectedExpense = {
        trxDate: null,
        categoryId: null,
        subcategoryId: null,
        amount: null
      }
    },

    /*
     * Display the Create/Update Expense dialog
     */
    updateExpense(expense) {
      this.selectedExpense = expense
      this.showExpenseDialog = true
      this.addExpense = false
    },

    /*
     * Delete the expense
     */
    async deleteExpense(expense) {
      const confirm = await this.$confirm(`Are you sure you want to delete expense ${expense.amount}?`, {
        title: 'Confirm Delete Expense'
      })
      if (confirm) {
        try {
          await ExpenseService.deleteExpense(expense._id)
          this.getExpenses()
          Util.showSnack(this.snackOptions, 'Expense deleted successfully', 'primary')
        } catch (error) {
          console.error('Error deleting expenses:', error)
          Util.showSnack(this.snackOptions, 'Error deleting the expense')
        }
      }
    },

    /*
     * Expense has been updated, refresh the expenses data
     */
    expenseUpdated() {
      this.getExpenses()
      if (this.addExpense) {
        Util.showSnack(this.snackOptions, 'Expense added successfully', 'primary')
      } else {
        Util.showSnack(this.snackOptions, 'Expense updated successfully', 'primary')
      }
    }
  },

  /*
   * On mount, retrieve the expenses
   */
  mounted() {
    this.getCategorySelect()
    this.getExpenses()
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.create-expense-btn {
  margin-left: 8px;
}
</style>
