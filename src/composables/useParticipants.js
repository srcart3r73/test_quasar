// src/composables/useParticipants.js
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api, handleAPIError } from '../services/api'

export function useParticipants() {
  const $q = useQuasar()
  
  // State
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

  // Methods
  const fetchParticipants = async () => {
    console.log('🔍 Fetching participants...')
    loadingParticipants.value = true
    try {
      const result = await api.getAll('participants')
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
      const newParticipant = await api.create('participants', {
        participant: participantName
      })
      
      // Add to local array
      participants.value.push(newParticipant)
      
      $q.notify({
        color: 'positive',
        message: 'Participant added successfully',
        icon: 'check'
      })
      
      return newParticipant
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      console.error('Failed to add participant:', message)
      
      $q.notify({
        color: 'negative',
        message: `Failed to add participant: ${message}`,
        icon: 'report_problem'
      })
      
      throw error
    }
  }

  const saveField = async (row, fieldName, value) => {
    try {
      console.log('Saving participant field:', row.id, fieldName, value)
      
      const updateData = { [fieldName]: value }
      await api.update('participants', row.id, updateData)
      
      const index = participants.value.findIndex(p => p.id === row.id)
      if (index !== -1) {
        participants.value[index][fieldName] = value
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

  const deleteParticipant = async (participant) => {
    const displayName = participant.participant || `Participant #${participant.id}`
    
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete participant "${displayName}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await api.delete('participants', participant.id)
          participants.value = participants.value.filter(p => p.id !== participant.id)
          
          $q.notify({
            color: 'positive',
            message: 'Participant deleted successfully',
            icon: 'check'
          })
          
          resolve(true)
        } catch (error) {
          const { error: errorType, message } = handleAPIError(error)
          $q.notify({
            color: 'negative',
            message: `Failed to delete participant: ${message}`,
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
    participants,
    loadingParticipants,
    
    // Computed
    sortedParticipants,
    
    // Methods
    fetchParticipants,
    addNewParticipant,
    saveField,
    deleteParticipant
  }
}