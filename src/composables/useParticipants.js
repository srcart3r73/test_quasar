// src/composables/useParticipants.js
import { ref, computed } from 'vue'
import { participantsAPI, handleAPIError } from '../services/api'

export function useParticipants() {
  const participants = ref([])
  const loadingParticipants = ref(false)

  // Create a computed property that returns participants sorted alphabetically
  const sortedParticipants = computed(() => {
    return [...participants.value].sort((a, b) => {
      // Sort alphabetically by the "participant" field
      const nameA = a.participant?.toLowerCase() || ''
      const nameB = b.participant?.toLowerCase() || ''
      return nameA.localeCompare(nameB)
    })
  })

  const fetchParticipants = async () => {
    console.log('🔍 Fetching participants...')
    loadingParticipants.value = true
    try {
      const result = await participantsAPI.getAll()
      console.log('✅ Participants API result:', result)
      participants.value = result
    } catch (error) {
      console.error('❌ Participants fetch error:', error)
      const { error: errorType, message } = handleAPIError(error)
      console.error('Failed to fetch participants:', message)
      participants.value = []
    } finally {
      loadingParticipants.value = false
    }
  }

  // Add method to create new participant
  const addNewParticipant = async (participantName) => {
    try {
      const newParticipant = await participantsAPI.create({
        participant: participantName
      })
      
      // Add to local array
      participants.value.push(newParticipant)
      
      return newParticipant
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      console.error('Failed to add participant:', message)
      throw error
    }
  }

  return {
    participants,
    sortedParticipants, // Export the sorted version
    loadingParticipants,
    fetchParticipants,
    addNewParticipant // Export the new method
  }
}