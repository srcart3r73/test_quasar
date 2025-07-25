// src/composables/useTransactions.js
import { ref, computed } from 'vue'
import { useGenericCRUD } from './useGenericCRUD'
import { api, handleAPIError } from '../services/api'

export function useTransactions() {
  
  // Use the generic CRUD for basic operations
  const transactionsCRUD = useGenericCRUD('transactions', {
    defaultCreateData: { 
      name: 'New Transaction',
      date_listing: new Date().toISOString().split('T')[0]
    },
    sortBy: (a, b, additionalData) => {
      const priorities = additionalData.priorities || []
      const priorityA = priorities.find(p => p.id === a.priority_id)
      const priorityB = priorities.find(p => p.id === b.priority_id)
      const orderA = priorityA?.order || 999
      const orderB = priorityB?.order || 999
      return orderA - orderB
    }
  })

  // Extract what we need from the CRUD
  const {
    items: transactions,
    selectedItems: selectedTransactions,
    selectedItem: selectedTransaction,
    loading: loadingTransactions,
    searchQuery,
//    filteredItems: filteredTransactions,
    create: addNewTransaction,
    saveField,
    deleteItem: deleteTransaction,
    deleteSelected: deleteSelectedTransactions,
    selectItem: selectTransaction,
    getSelectedString
  } = transactionsCRUD

  // Additional state specific to transactions
  const priorities = ref([])

  // Computed property to sort transactions by priority order
  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => {
      const priorityA = priorities.value.find(p => p.id === a.priority_id)
      const priorityB = priorities.value.find(p => p.id === b.priority_id)
      const orderA = priorityA?.order || 999
      const orderB = priorityB?.order || 999
      return orderA - orderB
    })
  })

  // Override filteredTransactions to use sortedTransactions
  const filteredTransactionsOverride = computed(() => {
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

  // Enhanced fetch method that includes priorities
  const fetchTransactions = async () => {
    loadingTransactions.value = true
    try {
      const [transactionsResult, prioritiesResult] = await Promise.all([
        api.getAll('transactions'),
        api.getAll('priorities')
      ])
      
      transactions.value = transactionsResult
      priorities.value = prioritiesResult
      
      console.log('✅ Transactions loaded:', transactions.value.length)
      console.log('✅ Priorities loaded for sorting:', priorities.value.length)
      
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      console.error('Failed to fetch transactions:', message, errorType)
      transactions.value = []
      priorities.value = []
    } finally {
      loadingTransactions.value = false
    }
  }

  // Utility functions (keep these as they're transaction-specific)
  const formatDate = (date) => {
    if (!date) return '-'
    const dateStr = date.split('T')[0]
    const [year, month, day] = dateStr.split('-')
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return dateObj.toLocaleDateString()
  }

  const truncateText = (text, length = 50) => {
    if (!text) return '-'
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  }

  return {
    // State
    transactions,
    priorities,
    sortedTransactions,
    selectedTransactions,
    selectedTransaction,
    loadingTransactions,
    searchQuery,
    
    // Computed
    filteredTransactions: filteredTransactionsOverride,
    
    // Methods from CRUD
    fetchTransactions,
    addNewTransaction,
    saveField,          // ← Now comes from useGenericCRUD
    deleteTransaction,
    deleteSelectedTransactions,
    selectTransaction,
    getSelectedString,
    
    // Utility methods
    formatDate,
    truncateText
  }
}