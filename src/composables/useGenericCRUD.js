// src/composables/useGenericCRUD.js
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api, handleAPIError } from '../services/api'

export function useGenericCRUD(endpoint, options = {}) {
  const $q = useQuasar()
    
  // Options with defaults
  const {
    defaultCreateData = {},
    sortBy = null,
    searchFields = ['name', 'description', 'notes', 'id'],
    displayField = 'name'
  } = options
  
  // State
  const items = ref([])
  const selectedItems = ref([])
  const selectedItem = ref(null)
  const loading = ref(false)
  const searchQuery = ref('')
  
  // Additional data for complex operations (like priorities for transactions)
  const additionalData = ref({})

  // Computed
  const sortedItems = computed(() => {
    if (!sortBy) return items.value
    
    return [...items.value].sort((a, b) => {
      if (typeof sortBy === 'function') {
        return sortBy(a, b, additionalData.value)
      }
      
      // Simple field sorting
      if (a[sortBy] < b[sortBy]) return -1
      if (a[sortBy] > b[sortBy]) return 1
      return 0
    })
  })

  const filteredItems = computed(() => {
    const itemsToFilter = sortBy ? sortedItems.value : items.value
    
    if (!searchQuery.value) {
      return itemsToFilter
    }
    
    return itemsToFilter.filter(item => {
      const searchLower = searchQuery.value.toLowerCase()
      return searchFields.some(field => {
        const value = item[field]
        return value && value.toString().toLowerCase().includes(searchLower)
      })
    })
  })

  // Methods
  const fetchAll = async (arg) => {
    loading.value = true
    try {
      let mainPromise;
      let additionalEndpoints = []

      // If arg is an object, treat it as filter/query params
      if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
        mainPromise = api.query(endpoint, arg)
      } else {
        // Otherwise, treat as additional endpoints array
        mainPromise = api.getAll(endpoint)
        if (Array.isArray(arg)) {
          additionalEndpoints = arg
        }
      }

      const promises = [mainPromise]
      additionalEndpoints.forEach(endpoint => {
        promises.push(api.getAll(endpoint))
      })

      const results = await Promise.all(promises)
      items.value = results[0]

      // Store additional data
      if (results.length > 1) {
        additionalEndpoints.forEach((endpoint, index) => {
          additionalData.value[endpoint] = results[index + 1]
        })
      }

      console.log(`✅ ${endpoint} loaded:`, items.value.length)
      return results[0]
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to fetch ${endpoint}: ${message}`,
        errorType: `Error type: ${errorType}`,
        icon: 'report_problem'
      })
      console.error(`Failed to fetch ${endpoint}:`, message)
      items.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const create = async (data = defaultCreateData) => {
    try {
      const newItem = await api.create(endpoint, data)
      items.value.unshift(newItem)
      
      $q.notify({
        color: 'positive',
        message: `New ${endpoint} added`,
        icon: 'check'
      })
      
      return newItem
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to create ${endpoint}: ${message}`,
        errorType: `Error type: ${errorType}`,
        icon: 'report_problem'
      })
      throw error
    }
  }

  const saveField = async (row, fieldName, value) => {
    try {
      console.log('Saving field:', endpoint, row.id, fieldName, value)
      
      let apiValue = value
      if (fieldName.includes('date_') && value) {
        apiValue = value.split('T')[0]
      }
      
      const updateData = { [fieldName]: apiValue }
      await api.update(endpoint, row.id, updateData)
      
      const index = items.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        items.value[index][fieldName] = apiValue
      }
      
      $q.notify({
        color: 'positive',
        message: `${fieldName} updated`,
        icon: 'check',
        timeout: 1000
      })
      
      return true
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to update ${fieldName}: ${message}`,
        errorType: `Error type: ${errorType}`,
        icon: 'report_problem'
      })
      console.error('Save field error:', error)
      return false
    }
  }

  const deleteItem = async (item) => {
    const displayName = item[displayField] || item.id
    
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete ${endpoint} "${displayName}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await api.delete(endpoint, item.id)
          items.value = items.value.filter(i => i.id !== item.id)
          
          if (selectedItem.value?.id === item.id) {
            selectedItem.value = null
          }
          
          $q.notify({
            color: 'positive',
            message: `${endpoint} deleted successfully`,
            icon: 'check'
          })
          
          resolve(true)
        } catch (error) {
          const { error: errorType, message } = handleAPIError(error)
          $q.notify({
            color: 'negative',
            message: `Failed to delete ${endpoint}: ${message}`,
            errorType: `Error type: ${errorType}`,
            icon: 'report_problem'
          })
          resolve(false)
        }
      }).onCancel(() => {
        resolve(false)
      })
    })
  }

  const deleteSelected = () => {
    if (selectedItems.value.length === 0) return Promise.resolve(false)
    
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete ${selectedItems.value.length} ${endpoint}(s)?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await Promise.all(
            selectedItems.value.map(item => api.delete(endpoint, item.id))
          )
          
          const deletedIds = selectedItems.value.map(i => i.id)
          items.value = items.value.filter(i => !deletedIds.includes(i.id))
          
          if (selectedItem.value && deletedIds.includes(selectedItem.value.id)) {
            selectedItem.value = null
          }
          
          selectedItems.value = []
          
          $q.notify({
            color: 'positive',
            message: `${endpoint}s deleted successfully`,
            icon: 'check'
          })
          
          resolve(true)
        } catch (error) {
          const { error: errorType, message } = handleAPIError(error)
          $q.notify({
            color: 'negative',
            message: `Failed to delete ${endpoint}s: ${message}`,
            errorType: `Error type: ${errorType}`,
            icon: 'report_problem',
          })
          resolve(false)
        }
      }).onCancel(() => {
        resolve(false)
      })
    })
  }

  const selectItem = (event, row) => {
    selectedItem.value = row
  }

  const getSelectedString = () => {
    return selectedItems.value.length === 0 
      ? '' 
      : `${selectedItems.value.length} record(s) selected of ${items.value.length}`
  }

  // Utility functions
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

  // Related data methods
  const getRelated = async (id, relation) => {
    try {
      return await api.getRelated(endpoint, id, relation)
    } catch (error) {
      console.error(`Failed to fetch ${relation} for ${endpoint}:`, error)
      return []
    }
  }

  const createRelated = async (id, relation, data) => {
    try {
      return await api.createRelated(endpoint, id, relation, data)
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to create ${relation}: ${message}`,
        errorType: `Error type: ${errorType}`,
        icon: 'report_problem'
      })
      throw error
    }
  }

  return {
    // State
    items,
    selectedItems,
    selectedItem,
    loading,
    searchQuery,
    additionalData,
    
    // Computed
    sortedItems,
    filteredItems,
    
    // Methods
    fetchAll,
    create,
    saveField,
    deleteItem,
    deleteSelected,
    selectItem,
    getSelectedString,
    formatDate,
    truncateText,
    getRelated,
    createRelated
  }
}