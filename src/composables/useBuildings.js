import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { buildingsAPI, handleAPIError } from '../services/api'

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
      buildings.value = await buildingsAPI.getAll()
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to fetch buildings: ${message}`,
        icon: 'report_problem'
      })
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
      
      const newBuilding = await buildingsAPI.create(newBuildingForm)
      console.log('✅ Building created:', newBuilding)
      
      buildings.value.push(newBuilding)
      
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
        message: `Failed to add building: ${message}`,
        icon: 'report_problem'
      })
      return null
    } finally {
      addingBuilding.value = false
    }
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
    addNewBuilding
  }
}