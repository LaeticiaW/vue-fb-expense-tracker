<template>
  <div class="page">
    <page-header title="Import Expenses" />

    <div class="page-content table-content">
      <!-- Filter -->
      <table-filter>
        <template v-slot:inputs>
          <!-- Start and end dates -->
          <date-range-input :date-range="filter" @date-range-changed="filterChanged" />
        </template>

        <template v-slot:actions>
          <v-btn
            small
            dark
            @click="showImportDialog"
            color="primary"
            title="Import Expenses"
            class="icon-btn import-expenses-btn"
          >
            <v-icon small>{{ 'mdi-publish' }}</v-icon>
          </v-btn>
        </template>
      </table-filter>

      <!-- Data Table -->
      <div class="table-container">
        <v-data-table
          :headers="headers"
          :items="imports"
          item-key="id"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          disable-pagination
          hide-default-footer
          must-sort
        >
          <template v-slot:item.recordCount="{ item }">
            <div class="text-right">{{ item.recordCount }}</div>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small @click="deleteImportedExpenses(item)" title="Delete import and associated expenses"
              >mdi-delete
            </v-icon>
          </template>
          <template v-slot:no-data>
            <div>No Data</div>
          </template>
        </v-data-table>
      </div>
      <div class="table-footer">
        <v-toolbar flat dense>
          <span>{{ imports.length }} {{ rowText }}</span>
        </v-toolbar>
      </div>
    </div>

    <!-- Import Expenses Dialog -->
    <import-dialog v-if="showDialog" v-model="showDialog" @file-imported="getImports" />
    <!-- Snack Msg -->
    <snack-msg :options="snackOptions" @update-show="snackOptions.show = $event" />
  </div>
</template>

<script>
import ImportDialog from '@/components/imports/ImportDialog'
import dayjs from 'dayjs'
import ImportService from '@/services/import'
import ExpenseService from '@/services/expense'
import SnackMsg from '@/components/common/SnackMsg.vue'
import TableFilter from '@/components/common/TableFilter'
import DateRangeInput from '@/components/common/DateRangeInput'
import PageHeader from '@/components/common/PageHeader.vue'
import Util from '@/services/util'

export default {
  name: 'Imports',

  data() {
    return {
      showDialog: false,
      filter: {
        startDate: dayjs().startOf('year').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD')
      },
      sortBy: 'importDate',
      sortDesc: true,
      imports: [],
      headers: [
        { value: 'importDate', text: 'Date', align: 'start' },
        { value: 'fileName', text: 'File Name' },
        { value: 'description', text: 'Description' },
        {
          value: 'recordCount',
          text: 'Records',
          width: '100px',
          align: 'right'
        },
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
    ImportDialog,
    SnackMsg,
    TableFilter,
    DateRangeInput
  },

  computed: {
    rowText() {
      return this.imports.length !== 1 ? 'rows' : 'row'
    }
  },

  methods: {
    /*
     * Retrieve the import summary list from the db
     */
    async getImports() {
      try {
        this.imports = await ImportService.getImports(this.filter)
      } catch (error) {
        console.error('Error retrieving imports:', error)
        Util.showSnack(this.snackOptions, 'Error retrieving imports')
      }
    },

    /*
     * Show the import file dialog
     */
    showImportDialog() {
      this.showDialog = true
    },

    /*
     * When the filter changes, retrieve the import list again
     */
    filterChanged(values) {
      if (values.startDate) {
        this.filter.startDate = values.startDate
      }
      if (values.endDate) {
        this.filter.endDate = values.endDate
      }
      this.getImports()
    },

    /*
     * Delete the import summary and all associated expenses
     */
    async deleteImportedExpenses(importItem) {
      const confirm = await this.$confirm(
        `Are you sure you want to delete all ${importItem.recordCount} expenses associated with this import?`,
        {
          title: 'Confirm Delete Imported Expenses'
        }
      )
      if (confirm) {
        try {
          await ExpenseService.deleteExpensesByImportId(importItem.id)
          await this.getImports()
          Util.showSnack(this.snackOptions, 'Successfully deleted the imported expenses', 'primary')
        } catch (error) {
          console.error('Error deleting imported expenses:', error)
          Util.showSnack(this.snackOptions, 'Error deleting the imported expenses')
        }
      }
    }
  },

  /*
   * On mount, retrieve the import summary list
   */
  mounted() {
    this.getImports()
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';
</style>
