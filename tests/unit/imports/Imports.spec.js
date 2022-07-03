import { mount } from '@vue/test-utils'
import Imports from '@/components/imports/Imports.vue'
import SpecUtil from '@/../tests/unit/specUtil'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import dayjs from 'dayjs'
import ImportService from '@/services/import'

describe('Imports.vue', () => {
  const localVue = SpecUtil.getLocalVueInstance()

  const imports = [
    {
      id: '1',
      importDate: '2020-04-17',
      fileName: 'Visa1-01_01_2020_to_04_05_2020.CSV',
      description: 'mycreditcard1',
      recordCount: 30
    },
    {
      id: '2',
      importDate: '2020-04-17',
      fileName: 'Visa2-Jan1-Apr7.csv',
      description: 'mycreditcard2',
      recordCount: 164
    }
  ]

  const mountComponent = function (propsData) {
    const vuetify = new Vuetify()
    return mount(Imports, {
      sync: false,
      vuetify,
      localVue,
      propsData: propsData || {}
    })
  }

  beforeEach(() => {
    jest.spyOn(ImportService, 'getImports').mockImplementation(SpecUtil.getPromiseData(imports))
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
    expect(pageTitle).toEqual('Import Expenses')
    expect(filter.exists()).toBe(true)
    expect(table.exists()).toBe(true)
  })

  test('Filter contains startDate and endDate inputs and import expenses button', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const filter = wrapper.find('.filter-container')
    const filterStartDate = filter.find('[name="startDate"]').element.value
    const filterEndDate = filter.find('[name="endDate"]').element.value
    const importExpensesButton = filter.find('button.import-expenses-btn')

    // Get year to date start and end date values
    const start = dayjs().startOf('year').format('YYYY-MM-DD')
    const end = dayjs().format('YYYY-MM-DD')

    expect(filterStartDate).toEqual(start)
    expect(filterEndDate).toEqual(end)
    expect(importExpensesButton.exists()).toBe(true)
  })

  test('Table contains correct header fields', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const headers = wrapper.findAll('th span')

    expect(headers.length).toEqual(5)

    expect(headers.at(0).text()).toEqual('Date')
    expect(headers.at(1).text()).toEqual('File Name')
    expect(headers.at(2).text()).toEqual('Description')
    expect(headers.at(3).text()).toEqual('Records')
    expect(headers.at(4).text()).toEqual('Actions')
  })

  test('Table contains import rows with correct values', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const rows = wrapper.findAll('tbody > tr')
    const row1 = rows.at(0).findAll('td')
    const row2 = rows.at(1).findAll('td')

    expect(rows.length).toEqual(2)

    expect(row1.at(0).text()).toEqual(imports[0].importDate)
    expect(row1.at(1).text()).toEqual(imports[0].fileName)
    expect(row1.at(2).text()).toEqual(imports[0].description)
    expect(Number(row1.at(3).text())).toEqual(imports[0].recordCount)

    expect(row2.at(0).text()).toEqual(imports[1].importDate)
    expect(row2.at(1).text()).toEqual(imports[1].fileName)
    expect(row2.at(2).text()).toEqual(imports[1].description)
    expect(Number(row2.at(3).text())).toEqual(imports[1].recordCount)
  })

  test('Table footer displays the number of rows', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const footer = wrapper.find('.table-footer span').text()

    expect(footer).toEqual('2 rows')
  })

  test('Clicking the Import Expenses button displays the Import Expenses Dialog', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    const importExpensesButton = wrapper.find('button.import-expenses-btn')
    expect(importExpensesButton.exists()).toBe(true)

    // Verify the dialog is not yet displayed
    let importDialog = wrapper.find('.import-dialog')
    expect(importDialog.exists()).toBe(false)

    // Trigger a button click
    importExpensesButton.trigger('click')
    await flushPromises()

    importDialog = wrapper.find('.import-dialog')
    expect(importDialog.exists()).toBe(true)
  })
})
