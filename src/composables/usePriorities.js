// src/composables/usePriorities.js
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api, handleAPIError } from '../services/api'

export function usePriorities() {
  const $q = useQuasar()
  
  // State
  const priorities = ref([])
  const loadingPriorities = ref(false)

  // Create a computed property that returns priorities sorted by "order" field
  const sortedPriorities = computed(() => {
    return [...priorities.value].sort((a, b) => {
      // Sort by the "order" field (ascending)
      const orderA = a.order || 0
      const orderB = b.order || 0
      return orderA - orderB
    })
  })

  // Methods
  const fetchPriorities = async () => {
    console.log('🔍 Fetching priorities...')
    loadingPriorities.value = true
    try {
      const result = await api.getAll('priorities')
      console.log('✅ Priorities API result:', result)
      priorities.value = result
    } catch (error) {
      console.error('❌ Priorities fetch error:', error)
      const { error: errorType, message } = handleAPIError(error)
      console.error('Failed to fetch priorities:', message)
      priorities.value = []
    } finally {
      loadingPriorities.value = false
    }
  }

  const addNewPriority = async (priorityData) => {
    try {
      const newPriority = await api.create('priorities', priorityData)
      
      priorities.value.push(newPriority)
      
      $q.notify({
        color: 'positive',
        message: 'Priority added successfully',
        icon: 'check'
      })
      
      return newPriority
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      console.error('Failed to add priority:', message)
      
      $q.notify({
        color: 'negative',
        message: `Failed to add priority: ${message}`,
        icon: 'report_problem'
      })
      
      throw error
    }
  }

  const saveField = async (row, fieldName, value) => {
    try {
      console.log('Saving priority field:', row.id, fieldName, value)
      
      const updateData = { [fieldName]: value }
      await api.update('priorities', row.id, updateData)
      
      const index = priorities.value.findIndex(p => p.id === row.id)
      if (index !== -1) {
        priorities.value[index][fieldName] = value
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
        icon: 'report_problem'
      })
      console.error('Save field error:', error)
      return false
    }
  }

  const deletePriority = async (priority) => {
    const displayName = priority.priority || `Priority #${priority.id}`
    
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete priority "${displayName}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await api.delete('priorities', priority.id)
          priorities.value = priorities.value.filter(p => p.id !== priority.id)
          
          $q.notify({
            color: 'positive',
            message: 'Priority deleted successfully',
            icon: 'check'
          })
          
          resolve(true)
        } catch (error) {
          const { error: errorType, message } = handleAPIError(error)
          $q.notify({
            color: 'negative',
            message: `Failed to delete priority: ${message}`,
            icon: 'report_problem'
          })
          resolve(false)
        }
      }).onCancel(() => {
        resolve(false)
      })
    })
  }

  return {
    // State
    priorities,
    loadingPriorities,
    
    // Computed
    sortedPriorities,
    
    // Methods
    fetchPriorities,
    addNewPriority,
    saveField,
    deletePriority
  }
}