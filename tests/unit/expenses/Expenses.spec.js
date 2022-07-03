import { mount } from '@vue/test-utils'
import Expenses from '@/components/expenses/Expenses.vue'
import SpecUtil from '@/../tests/unit/specUtil'
import Vuetify from 'vuetify'
import ExpenseService from '@/services/expense'
import CategoryService from '@/services/category'
import flushPromises from 'flush-promises'
import dayjs from 'dayjs'

describe('Expenses.vue', () => {
  const localVue = SpecUtil.getLocalVueInstance()

  const categories = [
    {
      id: '1',
      name: 'Auto',
      subcategories: [
        { id: '101', name: 'Auto Insurance', matchText: ['Progressive'] },
        { id: '102', name: 'Auto Service', matchText: ['Ford', 'Subaru'] },
        { id: '103', name: 'Gas', matchText: ['ExxonMobil', 'Valero'] }
      ]
    },
    {
      id: '2',
      name: 'Groceries',
      subcategories: [
        { id: '104', name: 'Costco', matchText: ['Costco'] },
        { id: '105', name: 'Food Lion', matchText: ['Food Lion'] },
        { id: '106', name: 'Harris Teeter', matchText: ['Harris Teeter', 'HarrisTeeter'] }
      ]
    },
    {
      id: '3',
      name: 'Utilities',
      subcategories: [
        { id: '107', name: 'Electric' },
        { id: '108', name: 'Gas', matchText: ['Valero'] },
        { id: '109', name: 'Internet', matchText: ['Spectrum'] }
      ]
    }
  ]

  const expenses = [
    {
      id: 503,
      trxDate: '2020-05-01',
      trxYear: 2020,
      trxMonth: 2,
      categoryId: '2',
      categoryName: 'Groceries',
      subcategoryId: '106',
      subcategoryName: 'Harris Teeter',
      description: 'Harris Teeter',
      amount: '74.15'
    },
    {
      id: 502,
      trxDate: '2020-04-01',
      trxYear: 2020,
      trxMonth: 2,
      categoryId: '1',
      categoryName: 'Auto',
      subcategoryId: '101',
      subcategoryName: 'Auto Insurance',
      description: 'Quick Gas',
      amount: '257.28'
    },
    {
      id: 501,
      trxDate: '2020-03-01',
      trxYear: 2020,
      trxMonth: 2,
      categoryId: '1',
      categoryName: 'Auto',
      subcategoryId: '103',
      subcategoryName: 'Gas',
      description: 'Quick Gas',
      amount: '25.32'
    }
  ]

  const mountComponent = function (propsData) {
    const vuetify = new Vuetify()
    return mount(Expenses, {
      sync: false,
      vuetify,
      localVue,
      propsData: propsData || {}
    })
  }

  beforeEach(() => {
    jest.spyOn(ExpenseService, 'getExpenses').mockImplementation(SpecUtil.getPromiseData(expenses))
    jest.spyOn(CategoryService, 'getCategories').mockImplementation(SpecUtil.getPromiseData(categories))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Renders page title, filter, and data table', async () => {
    // Mount the Expenses component
    const wrapper = mountComponent()

    // Let the promises resolve
    await flushPromises()

    // Find dom elements
    const pageTitle = wrapper.find('.page-title').text()
    const filter = wrapper.find('.filter-container')
    const table = wrapper.find('.table-container')

    // Test values
    expect(pageTitle).toEqual('Manage Expenses')
    expect(filter.exists()).toBe(true)
    expect(table.exists()).toBe(true)
  })

  test('Filter contains startDate, endDate, and category inputs and Add Expense button', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const filter = wrapper.find('.filter-container')
    const filterStartDate = filter.find('[name="startDate"]').element.value
    const filterEndDate = filter.find('[name="endDate"]').element.value
    const filterCategory = filter.find('.category-select')
    const createExpenseButton = filter.find('button.create-expense-btn')

    // Get year to date start and end date values
    const start = dayjs().startOf('year').format('YYYY-MM-DD')
    const end = dayjs().format('YYYY-MM-DD')

    expect(filterStartDate).toEqual(start)
    expect(filterEndDate).toEqual(end)
    expect(filterCategory.exists()).toBe(true)
    expect(createExpenseButton.exists()).toBe(true)
  })

  test('Table contains correct header fields', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const headers = wrapper.findAll('th span')

    expect(headers.length).toEqual(6)

    expect(headers.at(0).text()).toEqual('Date')
    expect(headers.at(1).text()).toEqual('Description')
    expect(headers.at(2).text()).toEqual('Category')
    expect(headers.at(3).text()).toEqual('Subcategory')
    expect(headers.at(4).text()).toEqual('Amount')
    expect(headers.at(5).text()).toEqual('Actions')
  })

  test('Table contains expense rows with correct values', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const rows = wrapper.findAll('tbody > tr')
    const row1 = rows.at(0).findAll('td')
    const row2 = rows.at(1).findAll('td')
    const row3 = rows.at(2).findAll('td')

    expect(rows.length).toEqual(3)

    expect(row1.at(0).text()).toEqual(expenses[0].trxDate.substr(0, 10))
    expect(row1.at(1).text()).toEqual(expenses[0].description)
    expect(row1.at(2).text()).toEqual(expenses[0].categoryName)
    expect(row1.at(3).text()).toEqual(expenses[0].subcategoryName)
    expect(row1.at(4).text()).toEqual(expenses[0].amount)

    expect(row2.at(0).text()).toEqual(expenses[1].trxDate.substr(0, 10))
    expect(row2.at(1).text()).toEqual(expenses[1].description)
    expect(row2.at(2).text()).toEqual(expenses[1].categoryName)
    expect(row2.at(3).text()).toEqual(expenses[1].subcategoryName)
    expect(row2.at(4).text()).toEqual(expenses[1].amount)

    expect(row3.at(0).text()).toEqual(expenses[2].trxDate.substr(0, 10))
    expect(row3.at(1).text()).toEqual(expenses[2].description)
    expect(row3.at(2).text()).toEqual(expenses[2].categoryName)
    expect(row3.at(3).text()).toEqual(expenses[2].subcategoryName)
    expect(row3.at(4).text()).toEqual(expenses[2].amount)
  })

  test('Table footer displays the number of rows', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const footer = wrapper.find('.table-footer span').text()

    expect(footer).toEqual('3 rows')
  })

  test('Clicking the Create Expense button displays the Create Expense Dialog', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const createExpenseButton = wrapper.find('button.create-expense-btn')
    expect(createExpenseButton.exists()).toBe(true)

    // Verify the dialog is not yet displayed
    let expenseDialog = wrapper.find('.expense-dialog')
    expect(expenseDialog.exists()).toBe(false)

    // Trigger a button click
    createExpenseButton.trigger('click')
    await flushPromises()

    expenseDialog = wrapper.find('.expense-dialog')
    expect(expenseDialog.exists()).toBe(true)
  })

  test('Clicking the table row Delete Expense icon displays the Delete Expense dialog', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const rows = wrapper.findAll('tbody > tr')
    const row1 = rows.at(0).findAll('td')
    const actions = row1.at(5)
    const deleteButton = actions.find('button.mdi-delete.delete-expense-btn')

    // Verify the delete dialog has not yet displayed
    let dialogs = document.querySelectorAll('.v-dialog .v-toolbar__title')
    let dialogFound = false
    dialogs.forEach((dialog) => {
      if (dialog.textContent === 'Confirm Delete Expense') {
        dialogFound = true
      }
    })
    expect(dialogFound).toEqual(false)

    // Click the delete expense button
    deleteButton.trigger('click')
    await flushPromises()

    // Verify that the Confirm Delete dialog is displayed
    dialogs = document.querySelectorAll('.v-dialog .v-toolbar__title')
    dialogFound = false
    dialogs.forEach((dialog) => {
      if (dialog.textContent === 'Confirm Delete Expense') {
        dialogFound = true
      }
    })
    expect(dialogFound).toEqual(true)
  })

  test('Clicking the table row Update Expense button displays the Update Expense dialog', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const rows = wrapper.findAll('tbody > tr')
    const row1 = rows.at(0).findAll('td')
    const actions = row1.at(5)
    const updateButton = actions.find('button.mdi-pencil')

    // Verify the dialog is not yet displayed
    let expenseDialog = wrapper.find('.expense-dialog')
    expect(expenseDialog.exists()).toBe(false)

    // Trigger a button click
    updateButton.trigger('click')
    await flushPromises()

    expenseDialog = wrapper.find('.expense-dialog')
    expect(expenseDialog.exists()).toBe(true)
  })
})
