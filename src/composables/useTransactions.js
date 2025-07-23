import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { transactionsAPI, prioritiesAPI, handleAPIError } from '../services/api'

export function useTransactions() {
  const $q = useQuasar()
  
  // State
  const transactions = ref([])
  const priorities = ref([]) // Add priorities ref
  const selectedTransactions = ref([])
  const selectedTransaction = ref(null)
  const loadingTransactions = ref(false)
  const searchQuery = ref('')

  // Computed property to sort transactions by priority order
  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => {
      // Find the priority for each transaction
      const priorityA = priorities.value.find(p => p.id === a.priority_id)
      const priorityB = priorities.value.find(p => p.id === b.priority_id)
      
      // Get the order values (default to 999 if no priority found)
      const orderA = priorityA?.order || 999
      const orderB = priorityB?.order || 999
      
      // Sort by priority order (ascending)
      return orderA - orderB
    })
  })

  // Update filtered transactions to use sorted transactions
  const filteredTransactions = computed(() => {
    if (!searchQuery.value) {
      return sortedTransactions.value
    }
    
    return sortedTransactions.value.filter(transaction => {
      const searchLower = searchQuery.value.toLowerCase()
      return (
        transaction.name?.toLowerCase().includes(searchLower) ||
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.notes?.toLowerCase().includes(searchLower) ||
        transaction.id?.toString().includes(searchLower)
      )
    })
  })

  // Methods
  const fetchTransactions = async () => {
    loadingTransactions.value = true
    try {
      // Fetch both transactions and priorities
      const [transactionsResult, prioritiesResult] = await Promise.all([
        transactionsAPI.getAll(),
        prioritiesAPI.getAll()
      ])
      
      transactions.value = transactionsResult
      priorities.value = prioritiesResult
      
      console.log('✅ Transactions loaded:', transactions.value.length)
      console.log('✅ Priorities loaded for sorting:', priorities.value.length)
      
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      console.error('Failed to fetch transactions:', message)
      transactions.value = []
      priorities.value = []
    } finally {
      loadingTransactions.value = false
    }
  }

  const addNewTransaction = async () => {
    try {
      const newTransaction = await transactionsAPI.create({
        name: 'New Transaction',
        date_listing: new Date().toISOString().split('T')[0]
      })
      
      transactions.value.unshift(newTransaction)
      
      $q.notify({
        color: 'positive',
        message: 'New transaction added',
        icon: 'check'
      })
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to create transaction: ${message}`,
        icon: 'report_problem'
      })
    }
  }

  const saveField = async (row, fieldName, value) => {
    try {
      console.log('Saving field:', row.id, fieldName, value)
      
      let apiValue = value
      if (fieldName.includes('date_') && value) {
        apiValue = value.split('T')[0]
      }
      
      const updateData = { [fieldName]: apiValue }
      await transactionsAPI.update(row.id, updateData)
      
      const index = transactions.value.findIndex(t => t.id === row.id)
      if (index !== -1) {
        transactions.value[index][fieldName] = apiValue
      }
      
      $q.notify({
        color: 'positive',
        message: `${fieldName} updated`,
        icon: 'check',
        timeout: 1000
      })
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to update ${fieldName}: ${message}`,
        icon: 'report_problem'
      })
      console.error('Save field error:', error)
    }
  }

  const deleteTransaction = async (transaction) => {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete transaction "${transaction.name || transaction.id}"?`,
      cancel: true,
      persistent: true
    }).onOk(async () => {
      try {
        await transactionsAPI.delete(transaction.id)
        transactions.value = transactions.value.filter(t => t.id !== transaction.id)
        
        if (selectedTransaction.value?.id === transaction.id) {
          selectedTransaction.value = null
        }
        
        $q.notify({
          color: 'positive',
          message: 'Transaction deleted successfully',
          icon: 'check'
        })
      } catch (error) {
        const { error: errorType, message } = handleAPIError(error)
        $q.notify({
          color: 'negative',
          message: `Failed to delete transaction: ${message}`,
          icon: 'report_problem'
        })
      }
    })
  }

  const deleteSelectedTransactions = () => {
    if (selectedTransactions.value.length === 0) return
    
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${selectedTransactions.value.length} transaction(s)?`,
      cancel: true,
      persistent: true
    }).onOk(async () => {
      try {
        await Promise.all(
          selectedTransactions.value.map(transaction => 
            transactionsAPI.delete(transaction.id)
          )
        )
        
        const deletedIds = selectedTransactions.value.map(t => t.id)
        transactions.value = transactions.value.filter(t => !deletedIds.includes(t.id))
        
        if (selectedTransaction.value && deletedIds.includes(selectedTransaction.value.id)) {
          selectedTransaction.value = null
        }
        
        selectedTransactions.value = []
        
        $q.notify({
          color: 'positive',
          message: 'Transactions deleted successfully',
          icon: 'check'
        })
      } catch (error) {
        const { error: errorType, message } = handleAPIError(error)
        $q.notify({
          color: 'negative',
          message: `Failed to delete transactions: ${message}`,
          icon: 'report_problem'
        })
      }
    })
  }

  const selectTransaction = (event, row) => {
    selectedTransaction.value = row
  }

  const getSelectedString = () => {
    return selectedTransactions.value.length === 0 
      ? '' 
      : `${selectedTransactions.value.length} record(s) selected of ${transactions.value.length}`
  }

  // Utility functions
  const formatDate = (date) => {
    if (!date) return '-'
    const dateStr = date.split('T')[0]
    const [year, month, day] = dateStr.split('-')
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return dateObj.toLocaleDateString()
  }

  const truncateText = (text, length) => {
    if (!text) return '-'
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  }

  return {
    // State
    transactions,
    sortedTransactions, // Export sorted transactions
    selectedTransactions,
    selectedTransaction,
    loadingTransactions,
    searchQuery,
    
    // Computed
    filteredTransactions, // This now uses sortedTransactions
    
    // Methods
    fetchTransactions,
    addNewTransaction,
    saveField,
    deleteTransaction,
    deleteSelectedTransactions,
    selectTransaction,
    getSelectedString,
    formatDate,
    truncateText
  }
}