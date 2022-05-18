import { mount } from '@vue/test-utils'
import ExpenseDialog from '@/components/expenses/ExpenseDialog.vue'
import ExpenseService from '@/services/expense'
import CategoryService from '@/services/category'
import SpecUtil from '@/../tests/unit/specUtil'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'

describe('ExpenseDialog.vue', () => {
  const localVue = SpecUtil.getLocalVueInstance()

  const categories = [
    {
      _id: '1',
      name: 'Auto',
      subcategories: [
        { id: '101', name: 'Auto Insurance', matchText: ['Progressive'] },
        { id: '102', name: 'Auto Service', matchText: ['Ford', 'Subaru'] },
        { id: '103', name: 'Gas', matchText: ['ExxonMobil', 'Valero'] }
      ]
    },
    {
      _id: '2',
      name: 'Groceries',
      subcategories: [
        { id: '104', name: 'Costco', matchText: ['Costco'] },
        { id: '105', name: 'Food Lion', matchText: ['Food Lion'] },
        { id: '106', name: 'Harris Teeter', matchText: ['Harris Teeter', 'HarrisTeeter'] }
      ]
    },
    {
      _id: '3',
      name: 'Utilities',
      subcategories: [
        { id: '107', name: 'Electric' },
        { id: '108', name: 'Gas', matchText: ['Valero'] },
        { id: '109', name: 'Internet', matchText: ['Spectrum'] }
      ]
    }
  ]

  const expense = {
    _id: 503,
    trxDate: '2020-05-01',
    trxYear: 2020,
    trxMonth: 2,
    categoryId: '2',
    categoryName: 'Groceries',
    subcategoryId: '106',
    subcategoryName: 'Harris Teeter',
    description: 'Harris Teeter',
    amount: '74.15'
  }

  const mountComponent = function (propsData) {
    const vuetify = new Vuetify()
    return mount(ExpenseDialog, {
      sync: false,
      vuetify,
      localVue,
      propsData: propsData || {}
    })
  }

  beforeEach(() => {
    jest.spyOn(CategoryService, 'getCategories').mockImplementation(SpecUtil.getPromiseData(categories))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Renders expense dialog in Create mode', async () => {
    // Mount the ExpenseDialog component
    const wrapper = mountComponent({ value: true, expense: {} })

    // Let the promises resolve
    await flushPromises()

    // Find dom elements
    const title = wrapper.find('.v-toolbar__title').text()
    const cancelButton = wrapper.find('.cancel-button')
    const saveButton = wrapper.find('.save-button')
    const trxDate = wrapper.find('.trxDate input')
    const description = wrapper.find('.description input')
    const category = wrapper.find('.category input')
    const subcategory = wrapper.find('.subcategory input')
    const amount = wrapper.find('.amount input')

    // Test values
    expect(title).toEqual('Create Expense')
    expect(cancelButton.exists()).toEqual(true)
    expect(saveButton.exists()).toEqual(true)
    expect(trxDate.exists()).toEqual(true)
    expect(trxDate.element.value).toEqual('')
    expect(description.exists()).toEqual(true)
    expect(description.element.value).toEqual('')
    expect(amount.element.value).toEqual('')
    expect(category.exists()).toEqual(true)
    expect(category.element.value).toEqual('')
    expect(subcategory.exists()).toEqual(true)
    expect(subcategory.element.value).toEqual('')
  })

  test('Renders expense dialog in Update mode with form populated', async () => {
    // Mount the ExpenseDialog component
    const wrapper = mountComponent({ value: true, expense })

    // Let the promises resolve
    await flushPromises()

    // Find dom elements
    const title = wrapper.find('.v-toolbar__title').text()
    const cancelButton = wrapper.find('.cancel-button')
    const saveButton = wrapper.find('.save-button')
    const trxDate = wrapper.find('.trxDate input')
    const description = wrapper.find('.description input')
    const category = wrapper.find('.category .v-select__selection')
    const subcategory = wrapper.find('.subcategory .v-select__selection')
    const amount = wrapper.find('.amount input')

    // Test values
    expect(title).toEqual('Update Expense')
    expect(cancelButton.exists()).toEqual(true)
    expect(saveButton.exists()).toEqual(true)
    expect(trxDate.element.value).toEqual('2020-05-01')
    expect(description.element.value).toEqual('Harris Teeter')
    expect(amount.element.value).toEqual('74.15')
    expect(category.text()).toEqual('Groceries')
    expect(subcategory.text()).toEqual('Harris Teeter')
  })

  test('Pressing the Cancel button emits the input event to close the dialog', async () => {
    // Mount the ExpenseDialog component
    const wrapper = mountComponent({ value: true, expense })

    // Let the promises resolve
    await flushPromises()

    // Find dom elements
    const dialog = wrapper.find('.expense-dialog')
    const title = wrapper.find('.v-toolbar__title')
    const cancelButton = wrapper.find('.cancel-button')

    // Test values to verify dialog is displayed
    expect(dialog.exists()).toBe(true)
    expect(title.text()).toEqual('Update Expense')
    expect(cancelButton.exists()).toEqual(true)

    // Trigger click on Cancel button
    cancelButton.trigger('click')
    await flushPromises()

    // Test that the input event with value false was emitted to close the dialog
    expect(wrapper.emitted().input.length).toEqual(1)
    expect(wrapper.emitted().input[0][0]).toEqual(false)
  })

  test('Pressing the Save button saves the expense and emits the expense-updated event', async () => {
    const saveSpy = jest.spyOn(ExpenseService, 'saveExpense').mockImplementation(() => expense)

    // Mount the ExpenseDialog component
    const wrapper = mountComponent({ value: true, expense })

    // Let the promises resolve
    await flushPromises()

    // Find dom elements
    const dialog = wrapper.find('.expense-dialog')
    const title = wrapper.find('.v-toolbar__title')
    const description = wrapper.find('.description input')
    const saveButton = wrapper.find('.save-button')

    // Test values to verify dialog is displayed
    expect(dialog.exists()).toBe(true)
    expect(title.text()).toEqual('Update Expense')
    expect(saveButton.exists()).toEqual(true)

    // Change the description value in the form
    description.setValue('Updated Description')
    await flushPromises()

    // Trigger click on Save button
    saveButton.trigger('click')
    await flushPromises()

    // Test that the expense was saved and the expense-updated event was emitted with the new description value
    expect(saveSpy).toHaveBeenCalled()
    expect(wrapper.emitted()['expense-updated'].length).toEqual(1)
    expect(wrapper.emitted()['expense-updated'][0][0]).toEqual(
      expect.objectContaining({
        _id: 503,
        trxDate: '2020-05-01',
        trxYear: 2020,
        trxMonth: 2,
        categoryId: '2',
        categoryName: 'Groceries',
        subcategoryId: '106',
        subcategoryName: 'Harris Teeter',
        description: 'Updated Description',
        amount: '74.15'
      })
    )
    expect(wrapper.emitted().input.length).toEqual(1)
    expect(wrapper.emitted().input[0][0]).toEqual(false)
  })
})
