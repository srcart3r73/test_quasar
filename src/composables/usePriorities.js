// src/composables/usePriorities.js
import { ref, computed } from 'vue'
import { prioritiesAPI, handleAPIError } from '../services/api'

export function usePriorities() {
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

  const fetchPriorities = async () => {
    console.log('🔍 Fetching priorities...')
    loadingPriorities.value = true
    try {
      const result = await prioritiesAPI.getAll()
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

  return {
    priorities,
    sortedPriorities, // Export the sorted version
    loadingPriorities,
    fetchPriorities
  }
}