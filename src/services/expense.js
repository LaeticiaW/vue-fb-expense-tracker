import dayjs from 'dayjs'
import numeral from 'numeral'
import { db, query, doc, collection, getDocs, setDoc, where, deleteDoc, writeBatch, limit } from '@/firebase/firebase'
import CategoryService from '@/services/category'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash'

/*
  Firestore Expense document properties:
    _id, categoryId, subcategoryId, importId, trxDate, trxYear, trxMonth, description, amount


  Client added properties:
    categoryName, subcategoryName
*/

export default {
  /*
   * Retrieve the expense list
   * @param {object} filter - filter values to use when retrieving the expenses
   */
  async getExpenses(filter) {
    try {
      const expenses = []
      const categories = await CategoryService.getCategories()
      const categoryMap = CategoryService.getCategoryMap(categories)
      const subcategoryMap = CategoryService.getSubcategoryMap(categories)

      let expenseQuery
      if (filter.categoryIds && Array.isArray(filter.categoryIds) && filter.categoryIds.length) {
        expenseQuery = query(
          collection(db, 'expenses'),
          where('trxDate', '>=', filter.startDate),
          where('trxDate', '<=', filter.endDate),
          where('categoryId', 'in', filter.categoryIds)
        )
      } else {
        expenseQuery = query(
          collection(db, 'expenses'),
          where('trxDate', '>=', filter.startDate),
          where('trxDate', '<=', filter.endDate)
        )
      }

      const querySnapshot = await getDocs(expenseQuery)
      querySnapshot.forEach((doc) => {
        const expense = doc.data()
        expenses.push(expense)
        if (expense.categoryId) {
          expense.categoryName = categoryMap[expense.categoryId]?.name || ''
          if (expense.categoryName && expense.subcategoryId) {
            expense.subcategoryName = subcategoryMap[expense.subcategoryId]?.name || ''
          }
        }
      })

      return expenses
    } catch (error) {
      console.error('ExpenseService.getExpenses error:', error)
      throw error
    }
  },

  /*
   * Save an expense, either via create or update
   * @param {object} expense - expense object to save
   */
  saveExpense(expense) {
    if (expense._id === undefined) {
      return this.createExpense(expense)
    }
    return this.updateExpense(expense)
  },

  /*
   * Create a new expense
   * @param {object} expense - expense object to save
   */
  async createExpense(expense) {
    try {
      expense._id = uuidv4()
      expense.trxYear = dayjs(expense.trxDate).year()
      expense.trxMonth = dayjs(expense.trxDate).month() + 1
      await setDoc(doc(db, 'expenses', expense._id), expense)
    } catch (error) {
      console.error('ExpenseService.createExpense error', error)
      throw error
    }
  },

  /*
   * Update an existing expense
   * @param {object} expense - expense object to update
   */
  async updateExpense(expense) {
    try {
      expense.trxYear = dayjs(expense.trxDate).year()
      expense.trxMonth = dayjs(expense.trxDate).month() + 1
      await setDoc(doc(db, 'expenses', expense._id), expense)
    } catch (error) {
      console.error('ExpenseService.updateExpense error', error)
      throw error
    }
  },

  /*
   * Delete an expense
   * @param {string} expenseId - id of expense to delete
   */
  async deleteExpense(expenseId) {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId))
    } catch (error) {
      console.error('ExpenseService.deleteExpense error', error)
      throw error
    }
  },

  /*
   * Get expense totals by categories and subcategory
   * @param {object} filter - filter values to use when retrieving the expense totals
   */
  async getExpenseTotals(filter) {
    try {
      const expenses = await this.getExpenses(filter)

      expenses.sort((a, b) => {
        return (
          (a.categoryName || '').localeCompare(b.categoryName || '') ||
          (a.subcategoryName || '').localeCompare(b.subcategoryName || '')
        )
      })

      // Reformat the list, calculating the total for each category, and moving the subcategory totals to an object
      let prevCatId = ''
      let prevSubcatId = ''
      let totalExpensesAmount = 0
      const expenseTotals = []
      let categoryTotal = null

      expenses.forEach((record) => {
        const { categoryId, categoryName, subcategoryId, subcategoryName, amount } = record

        if (categoryId !== prevCatId) {
          if (prevCatId !== '') {
            expenseTotals.push(JSON.parse(JSON.stringify(categoryTotal)))
          }
          categoryTotal = {
            categoryId,
            categoryName,
            totalAmount: amount,
            subcategoryTotals: [
              {
                subcategoryId,
                subcategoryName,
                totalAmount: amount
              }
            ]
          }
          prevCatId = categoryId
          prevSubcatId = subcategoryId
        } else {
          categoryTotal.totalAmount += amount

          if (subcategoryId !== prevSubcatId) {
            categoryTotal.subcategoryTotals.push({
              subcategoryId,
              subcategoryName,
              totalAmount: amount
            })
            prevSubcatId = subcategoryId
          } else {
            categoryTotal.subcategoryTotals[categoryTotal.subcategoryTotals.length - 1].totalAmount += amount
          }
        }

        totalExpensesAmount += amount
      })

      if (categoryTotal) {
        expenseTotals.push(JSON.parse(JSON.stringify(categoryTotal)))
      }

      // Calculate the percent for each total Amount
      expenseTotals.forEach((exp) => {
        exp.percent = (exp.totalAmount / totalExpensesAmount) * 100
      })

      return expenseTotals
    } catch (error) {
      console.error('ExpenseService.getExpenseTotals error:', error)
    }
  },

  /*
   * Get expense totals by categories and subcategory
   * @param {object} filter - filter values to uwe when retrieving the expense time series data
   */
  async getExpenseTimeSeries(filter) {
    try {
      const expenses = await this.getExpenses(filter)

      expenses.sort((a, b) => {
        return (
          (a.categoryId || '').localeCompare(b.categoryId || '') || a.trxYear - b.trxYear || a.trxMonth - b.trxMonth
        )
      })

      // Group by categoryId, trxYear, trxMonth and sum the amount
      const expenseSummaries = []
      let prevCatId = ''
      let prevTrxYear = null
      let prevTrxMonth = null
      let expenseSummary = null
      expenses.forEach((exp, idx) => {
        if (idx === 0) {
          expenseSummary = {
            categoryId: exp.categoryId,
            categoryName: exp.categoryName,
            trxYear: exp.trxYear,
            trxMonth: exp.trxMonth,
            totalAmount: exp.amount
          }
        } else if (exp.categoryId === prevCatId && exp.trxYear === prevTrxYear && exp.trxMonth === prevTrxMonth) {
          expenseSummary.totalAmount += exp.amount
        } else {
          expenseSummaries.push(expenseSummary)
          expenseSummary = {
            categoryId: exp.categoryId,
            categoryName: exp.categoryName,
            trxYear: exp.trxYear,
            trxMonth: exp.trxMonth,
            totalAmount: exp.amount
          }
        }
        prevCatId = exp.categoryId
        prevTrxYear = exp.trxYear
        prevTrxMonth = exp.trxMonth
      })

      // Convert data to Highcharts time series format, one time series per category
      const series = []
      let seriesObj = {}
      let prevCatName = ''
      let data = []
      let dt
      prevCatId = ''
      expenseSummaries.forEach((exp) => {
        if (exp.categoryId !== prevCatId && prevCatId !== '') {
          seriesObj = {
            name: prevCatName,
            data: data
          }
          series.push(seriesObj)
          data = []
        }
        dt = dayjs(`${exp.trxYear.toString()}-${numeral(exp.trxMonth).format('00')}-01`, 'YYYY-MM-DD').valueOf()
        data.push([dt, Number(exp.totalAmount.toFixed(2))])

        prevCatId = exp.categoryId
        prevCatName = exp.categoryName || 'Unknown'
      })
      if (expenseSummaries.length) {
        seriesObj = {
          name: prevCatName,
          data: data
        }
        series.push(seriesObj)
      }

      return series
    } catch (error) {
      console.error('ExpenseService.getExpenseTimeSeries error:', error)
      throw error
    }
  },

  /*
   * Import expenses uploaded from a csv file
   * @param {array} expenses - array of expense objects
   * @param {object} importDetails - details of the import
   */
  async importExpenses(expenses, importDetails) {
    const importExpenses = cloneDeep(expenses)

    // Normalize the trxDate to 'YYYY-MM-DD' and remove $ from amount
    importExpenses.forEach((exp) => {
      exp.trxDate = dayjs(exp.trxDate, importDetails.dateFormat).format('YYYY-MM-DD')
      exp.trxYear = dayjs(exp.trxDate).year()
      exp.trxMonth = dayjs(exp.trxDate).month() + 1

      if (typeof exp.amount === 'string' && exp.amount.substr(0, 1) === '$') {
        exp.amount = exp.amount.substr(1)
      }
    })

    try {
      // Get a new write batch
      const batch = writeBatch(db)

      // Insert the import summary document
      importDetails._id = uuidv4()
      batch.set(doc(db, 'imports', importDetails._id), importDetails)

      // Insert each expense document
      importExpenses.forEach((exp) => {
        exp._id = uuidv4()
        exp.importId = importDetails._id
        batch.set(doc(db, 'expenses', exp._id), exp)
      })

      // Commit the batch
      await batch.commit()
    } catch (error) {
      console.error('Error importing expenses:', error)
      throw error
    }
  },

  /*
   * Delete expenses by import id
   * @param {string} importId - import id
   */
  async deleteExpensesByImportId(importId) {
    // Retrieve all expenses with the specified importId
    const expenses = []
    const expenseQuery = query(collection(db, 'expenses'), where('importId', '==', importId))

    const querySnapshot = await getDocs(expenseQuery)

    querySnapshot.forEach((doc) => {
      const expense = doc.data()
      expenses.push(expense)
    })

    // Get a new write batch
    const batch = writeBatch(db)

    // Delete the import summary record
    batch.delete(doc(db, 'imports', importId))

    // Delete each expense
    expenses.forEach((exp) => {
      batch.delete(doc(db, 'expenses', exp._id))
    })

    // Commit the batch
    await batch.commit()
  },

  /*
   * Determine if any expenses are associated to a specified category
   */
  async isCategoryInUse(categoryId) {
    const expenseQuery = query(collection(db, 'expenses'), limit(1), where('categoryId', '==', categoryId))

    const querySnapshot = await getDocs(expenseQuery)

    return querySnapshot.size ? true : false
  },

  /*
   * Determine if any expenses are associated to a specified subcategory
   */
  async isSubcategoryInUse(subcategoryId) {
    const expenseQuery = query(collection(db, 'expenses'), limit(1), where('subcategoryId', '==', subcategoryId))

    const querySnapshot = await getDocs(expenseQuery)

    return querySnapshot.size ? true : false
  }
}
