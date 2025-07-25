import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { api, handleAPIError } from '../services/api'

export function useBuildings() {
  const $q = useQuasar()
  
  // State
  const buildings = ref([])
  const showAddBuildingDialog = ref(false)
  const addingBuilding = ref(false)
  const newBuildingForm = reactive({
    address_street: '',
    address_city_id: '',
    address_state_id: '',
    address_neighborhood_id: '',
    address_zip: '',
    square_feet: null,
    year_built: null,
    description: '',
    notes: ''
  })

  // Computed
  const availableBuildings = computed(() => buildings.value)

  // Methods
  const fetchBuildings = async () => {
    try {
      buildings.value = await api.getAll('buildings')
      console.log('✅ Buildings loaded:', buildings.value.length)
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to fetch buildings: ${message}`,
        errorType: `Error type: ${errorType}`,
        icon: 'report_problem'
      })
      buildings.value = []
    }
  }

  const openAddBuildingDialog = () => {
    Object.keys(newBuildingForm).forEach(key => {
      newBuildingForm[key] = key.includes('_feet') || key.includes('_built') ? null : ''
    })
    showAddBuildingDialog.value = true
  }

  const cancelAddBuilding = () => {
    showAddBuildingDialog.value = false
    Object.keys(newBuildingForm).forEach(key => {
      newBuildingForm[key] = key.includes('_feet') || key.includes('_built') ? null : ''
    })
  }

  const addNewBuilding = async () => {
    if (!newBuildingForm.address_street) {
      $q.notify({
        color: 'negative',
        message: 'Street address is required',
        icon: 'warning'
      })
      return null
    }

    addingBuilding.value = true
    try {
      console.log('🏢 Creating new building:', newBuildingForm)
      
      const newBuilding = await api.create('buildings', { ...newBuildingForm })
      console.log('✅ Building created:', newBuilding)
      
      buildings.value.unshift(newBuilding)
      
      showAddBuildingDialog.value = false
      Object.keys(newBuildingForm).forEach(key => {
        newBuildingForm[key] = key.includes('_feet') || key.includes('_built') ? null : ''
      })
      
      $q.notify({
        color: 'positive',
        message: 'Building added successfully',
        icon: 'check'
      })
      
      return newBuilding
    } catch (error) {
      console.error('❌ Add building error:', error)
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to add a building: ${message}`,
        errorType: `Error type: ${errorType}`,
        icon: 'report_problem'
      })
      return null
    } finally {
      addingBuilding.value = false
    }
  }

  const saveField = async (row, fieldName, value) => {
    try {
      console.log('Saving building field:', row.id, fieldName, value)
      
      const updateData = { [fieldName]: value }
      await api.update('buildings', row.id, updateData)
      
      const index = buildings.value.findIndex(b => b.id === row.id)
      if (index !== -1) {
        buildings.value[index][fieldName] = value
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

  const deleteBuilding = async (building) => {
    const displayName = building.address_street || `Building #${building.id}`
    
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete building "${displayName}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await api.delete('buildings', building.id)
          buildings.value = buildings.value.filter(b => b.id !== building.id)
          
          $q.notify({
            color: 'positive',
            message: 'Building deleted successfully',
            icon: 'check'
          })
          
          resolve(true)
        } catch (error) {
          const { error: errorType, message } = handleAPIError(error)
          $q.notify({
            color: 'negative',
            message: `Failed to delete building: ${message}`,
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

  return {
    // State
    buildings,
    showAddBuildingDialog,
    addingBuilding,
    newBuildingForm,
    
    // Computed
    availableBuildings,
    
    // Methods
    fetchBuildings,
    openAddBuildingDialog,
    cancelAddBuilding,
    addNewBuilding,
    saveField,
    deleteBuilding
  }
}