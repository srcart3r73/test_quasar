import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { linkTransactionsBuildingsAPI, buildingsAPI, handleAPIError } from '../services/api'

export function useLinkTransactionsBuildings(selectedTransaction, fetchLinkedBuildingsCallback) {
  const $q = useQuasar()
  
  // State
  const showLinkBuildingDialog = ref(false)
  const linkingBuilding = ref(false)
  const linkedBuildings = ref([])
  const loadingLinkedBuildings = ref(false)

  // Watch for changes to selectedTransaction
  watch(() => selectedTransaction.value, async (newTransaction) => {
    if (newTransaction) {
      await fetchLinkedBuildings(newTransaction.id)
    } else {
      linkedBuildings.value = []
    }
  }, { immediate: true })

  // Methods
  const fetchLinkedBuildings = async (transactionId) => {
    if (!transactionId) {
      linkedBuildings.value = []
      return
    }

    loadingLinkedBuildings.value = true
    try {
      const links = await linkTransactionsBuildingsAPI.getByTransactionId(transactionId)
      const buildingPromises = links.map(link => buildingsAPI.getById(link.building_id))
      linkedBuildings.value = await Promise.all(buildingPromises)
      
      // Call the callback if provided
      if (fetchLinkedBuildingsCallback) {
        fetchLinkedBuildingsCallback(linkedBuildings.value)
      }
    } catch (error) {
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to fetch linked buildings: ${message}`,
        icon: 'report_problem'
      })
      linkedBuildings.value = []
    } finally {
      loadingLinkedBuildings.value = false
    }
  }

  const linkBuilding = async (buildingId) => {
    if (!selectedTransaction.value || !buildingId) {
      $q.notify({
        color: 'negative',
        message: 'Please select both a transaction and a building',
        icon: 'warning'
      })
      return
    }

    linkingBuilding.value = true
    try {
      console.log('🔗 Linking building:', selectedTransaction.value.id, buildingId)
      await linkTransactionsBuildingsAPI.create(selectedTransaction.value.id, buildingId)
      await fetchLinkedBuildings(selectedTransaction.value.id)
      
      showLinkBuildingDialog.value = false
      
      $q.notify({
        color: 'positive',
        message: 'Building linked successfully',
        icon: 'check'
      })
    } catch (error) {
      console.error('❌ Link error:', error)
      const { error: errorType, message } = handleAPIError(error)
      $q.notify({
        color: 'negative',
        message: `Failed to link building: ${message}`,
        icon: 'report_problem'
      })
    } finally {
      linkingBuilding.value = false
    }
  }

  const unlinkBuilding = async (building) => {
    if (!selectedTransaction.value) return

    $q.dialog({
      title: 'Confirm Unlink',
      message: `Are you sure you want to unlink "${building.address_street}"?`,
      cancel: true,
      persistent: true
    }).onOk(async () => {
      try {
        await linkTransactionsBuildingsAPI.deleteByIds(selectedTransaction.value.id, building.id)
        await fetchLinkedBuildings(selectedTransaction.value.id)
        
        $q.notify({
          color: 'positive',
          message: 'Building unlinked successfully',
          icon: 'check'
        })
      } catch (error) {
        const { error: errorType, message } = handleAPIError(error)
        $q.notify({
          color: 'negative',
          message: `Failed to unlink building: ${message}`,
          icon: 'report_problem'
        })
      }
    })
  }

  return {
    // State
    showLinkBuildingDialog,
    linkingBuilding,
    linkedBuildings,
    loadingLinkedBuildings,
    
    // Methods
    fetchLinkedBuildings,
    linkBuilding,
    unlinkBuilding
  }
}