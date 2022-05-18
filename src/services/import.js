import { db, query, doc, collection, getDocs, where, deleteDoc } from '@/firebase/firebase'

/*
  Firestore Import document properties
    id, importDate, fileName, description, recordCount
 */

export default {
  /*
   * Retrieve the list of import summaries
   * @param {object} filter - filter values to use when retrieving import summaries
   */
  async getImports(filter) {
    try {
      const imports = []

      let importQuery = query(
        collection(db, 'imports'),
        where('importDate', '>=', filter.startDate),
        where('importDate', '<=', filter.endDate)
      )

      const querySnapshot = await getDocs(importQuery)

      querySnapshot.forEach((doc) => {
        const imp = doc.data()
        imports.push(imp)
      })

      return imports
    } catch (error) {
      console.error('ImportService.getImports error:', error)
      throw error
    }
  },

  /*
   * Delete the specified import summary and all associated imported expenses
   * @param {string} importId - id of import to delete
   */
  async deleteImport(importId) {
    try {
      await deleteDoc(doc(db, 'imports', importId))
    } catch (error) {
      console.error('ExpenseService.deleteImport error', error)
      throw error
    }
  }
}
