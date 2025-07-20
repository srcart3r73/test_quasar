<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Main Transactions Table -->
      <div class="col-md-7 col-sm-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Transactions</div>
            
            <!-- Toolbar -->
            <div class="row items-center q-mb-md">
              <q-btn
                color="primary"
                icon="add"
                label="Add Transaction"
                @click="addNewTransaction"
                class="q-mr-sm"
              />
              <q-btn
                color="negative"
                icon="delete"
                label="Delete Selected"
                @click="deleteSelectedTransactions"
                :disable="selectedTransactions.length === 0"
                class="q-mr-sm"
              />
              <q-space />
              <q-input
                v-model="searchQuery"
                placeholder="Search transactions..."
                dense
                outlined
                @input="onSearch"
                class="q-ml-sm"
                style="width: 250px"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- Transactions Table -->
            <q-table
              :rows="filteredTransactions"
              :columns="transactionColumns"
              row-key="id"
              :loading="loadingTransactions"
              :selected-rows-label="getSelectedString"
              selection="multiple"
              v-model:selected="selectedTransactions"
              :pagination="{ rowsPerPage: 0 }"
              flat
              @row-click="selectTransaction"
            >
              <template v-slot:body-cell-date_listing="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model="editForm.date_listing"
                    type="date"
                    dense
                    @blur="saveTransaction"
                    @keyup.enter="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)">
                    {{ formatDate(props.row.date_listing) }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-date_closing="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model="editForm.date_closing"
                    type="date"
                    dense
                    @blur="saveTransaction"
                    @keyup.enter="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)">
                    {{ formatDate(props.row.date_closing) }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-date_pursuit="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model="editForm.date_pursuit"
                    type="date"
                    dense
                    @blur="saveTransaction"
                    @keyup.enter="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)">
                    {{ formatDate(props.row.date_pursuit) }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-listing_broker_id="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model.number="editForm.listing_broker_id"
                    type="number"
                    dense
                    @blur="saveTransaction"
                    @keyup.enter="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)">
                    {{ props.row.listing_broker_id || '-' }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-buyer_id="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model.number="editForm.buyer_id"
                    type="number"
                    dense
                    @blur="saveTransaction"
                    @keyup.enter="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)">
                    {{ props.row.buyer_id || '-' }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-seller_id="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model.number="editForm.seller_id"
                    type="number"
                    dense
                    @blur="saveTransaction"
                    @keyup.enter="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)">
                    {{ props.row.seller_id || '-' }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-priority_id="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model.number="editForm.priority_id"
                    type="number"
                    dense
                    @blur="saveTransaction"
                    @keyup.enter="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)">
                    {{ props.row.priority_id || '-' }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model="editForm.name"
                    dense
                    @blur="saveTransaction"
                    @keyup.enter="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)">
                    {{ props.row.name || '-' }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-notes="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model="editForm.notes"
                    type="textarea"
                    dense
                    @blur="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)" class="truncate">
                    {{ truncateText(props.row.notes, 50) }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-description="props">
                <q-td :props="props">
                  <q-input
                    v-if="editingTransaction === props.row.id"
                    v-model="editForm.description"
                    type="textarea"
                    dense
                    @blur="saveTransaction"
                  />
                  <span v-else @dblclick="editTransaction(props.row)" class="truncate">
                    {{ truncateText(props.row.description, 50) }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    dense
                    round
                    flat
                    color="primary"
                    icon="visibility"
                    @click="selectTransaction(null, props.row)"
                    size="sm"
                  />
                  <q-btn
                    dense
                    round
                    flat
                    color="negative"
                    icon="delete"
                    @click="deleteTransaction(props.row)"
                    size="sm"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Buildings Side Panel -->
      <div class="col-md-5 col-sm-12">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-h6">
                Buildings
                <span v-if="selectedTransaction" class="text-caption text-grey">
                  (for Transaction #{{ selectedTransaction.id }})
                </span>
              </div>
              <q-space />
              <q-btn
                v-if="selectedTransaction"
                color="primary"
                icon="link"
                label="Link Building"
                @click="showLinkBuildingDialog = true"
                size="sm"
              />
            </div>

            <div v-if="!selectedTransaction" class="text-center q-pa-xl text-grey">
              <q-icon name="info" size="3em" />
              <div class="q-mt-md">Select a transaction to view its buildings</div>
            </div>

            <div v-else>
              <q-table
                :rows="linkedBuildings"
                :columns="buildingColumns"
                row-key="id"
                :loading="loadingBuildings"
                flat
                :pagination="{ rowsPerPage: 0 }"
              >
                <template v-slot:body-cell-address_city_id="props">
                  <q-td :props="props">
                    {{ props.row.address_city_id || '-' }}
                  </q-td>
                </template>

                <template v-slot:body-cell-address_state_id="props">
                  <q-td :props="props">
                    {{ props.row.address_state_id || '-' }}
                  </q-td>
                </template>

                <template v-slot:body-cell-neighborhood_id="props">
                  <q-td :props="props">
                    {{ props.row.neighborhood_id || '-' }}
                  </q-td>
                </template>

                <template v-slot:body-cell-priority="props">
                  <q-td :props="props">
                    <q-badge :color="props.row.priority ? 'positive' : 'grey'" :label="props.row.priority ? 'Yes' : 'No'" />
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      dense
                      round
                      flat
                      color="negative"
                      icon="link_off"
                      @click="unlinkBuilding(props.row)"
                      size="sm"
                    />
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Link Building Dialog -->
    <q-dialog v-model="showLinkBuildingDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Link Building to Transaction</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="selectedBuildingToLink"
            :options="availableBuildings"
            option-label="address_street"
            option-value="id"
            label="Select Building"
            filled
            map-options
            emit-value
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Link"
            color="primary"
            @click="linkBuilding"
            :disable="!selectedBuildingToLink"
            :loading="linkingBuilding"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { transactionsAPI, buildingsAPI, linkAPI, handleAPIError } from '../services/api'

const $q = useQuasar()

// Reactive data
const transactions = ref([])
const buildings = ref([])
const linkedBuildings = ref([])
const selectedTransaction = ref(null)
const selectedTransactions = ref([])
const selectedBuildingToLink = ref(null)
const editingTransaction = ref(null)
const searchQuery = ref('')
const showLinkBuildingDialog = ref(false)

// Loading states
const loadingTransactions = ref(false)
const loadingBuildings = ref(false)
const linkingBuilding = ref(false)

// Edit form
const editForm = reactive({
  id: null,
  date_listing: '',
  listing_broker_id: null,
  notes: '',
  date_closing: '',
  buyer_id: null,
  seller_id: null,
  name: '',
  date_pursuit: '',
  description: '',
  priority_id: null
})

// Table columns
const transactionColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'date_listing', label: 'Date Listed', field: 'date_listing', sortable: true, align: 'left' },
  { name: 'date_closing', label: 'Date Closing', field: 'date_closing', sortable: true, align: 'left' },
  { name: 'date_pursuit', label: 'Date Pursuit', field: 'date_pursuit', sortable: true, align: 'left' },
  { name: 'listing_broker_id', label: 'Listing Broker', field: 'listing_broker_id', sortable: true, align: 'left' },
  { name: 'buyer_id', label: 'Buyer ID', field: 'buyer_id', sortable: true, align: 'left' },
  { name: 'seller_id', label: 'Seller ID', field: 'seller_id', sortable: true, align: 'left' },
  { name: 'priority_id', label: 'Priority', field: 'priority_id', sortable: true, align: 'left' },
  { name: 'notes', label: 'Notes', field: 'notes', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center' }
]

const buildingColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'address_street', label: 'Address', field: 'address_street', sortable: true, align: 'left' },
  { name: 'address_city_id', label: 'City', field: 'address_city_id', sortable: true, align: 'left' },
  { name: 'address_state_id', label: 'State', field: 'address_state_id', sortable: true, align: 'left' },
  { name: 'neighborhood_id', label: 'Neighborhood', field: 'neighborhood_id', sortable: true, align: 'left' },
  { name: 'priority', label: 'Priority', field: 'priority', sortable: true, align: 'center' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center' }
]

// Computed properties
const filteredTransactions = computed(() => {
  if (!searchQuery.value) return transactions.value
  
  const query = searchQuery.value.toLowerCase()
  return transactions.value.filter(transaction => 
    (transaction.name && transaction.name.toLowerCase().includes(query)) ||
    (transaction.notes && transaction.notes.toLowerCase().includes(query)) ||
    (transaction.description && transaction.description.toLowerCase().includes(query))
  )
})

const availableBuildings = computed(() => {
  const linkedBuildingIds = linkedBuildings.value.map(b => b.id)
  return buildings.value.filter(building => !linkedBuildingIds.includes(building.id))
})

// Methods
const fetchTransactions = async () => {
  loadingTransactions.value = true
  try {
    transactions.value = await transactionsAPI.getAll()
  } catch (error) {
    const { error: errorType, message } = handleAPIError(error)
    $q.notify({
      color: 'negative',
      message: `Failed to fetch transactions: ${message}`,
      icon: 'report_problem'
    })
  } finally {
    loadingTransactions.value = false
  }
}

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

const fetchLinkedBuildings = async (transactionId) => {
  if (!transactionId) {
    linkedBuildings.value = []
    return
  }

  loadingBuildings.value = true
  try {
    // Get links for this transaction
    const links = await linkAPI.getByTransactionId(transactionId)
    
    // Get building details for each link
    const buildingPromises = links.map(link => buildingsAPI.getById(link.building_id))
    linkedBuildings.value = await Promise.all(buildingPromises)
  } catch (error) {
    const { error: errorType, message } = handleAPIError(error)
    $q.notify({
      color: 'negative',
      message: `Failed to fetch linked buildings: ${message}`,
      icon: 'report_problem'
    })
    linkedBuildings.value = []
  } finally {
    loadingBuildings.value = false
  }
}

const selectTransaction = (event, row) => {
  selectedTransaction.value = row
  fetchLinkedBuildings(row.id)
}

const editTransaction = (transaction) => {
  editingTransaction.value = transaction.id
  Object.keys(editForm).forEach(key => {
    editForm[key] = transaction[key]
  })
}

const saveTransaction = async () => {
  if (!editingTransaction.value) return

  try {
    await transactionsAPI.update(editingTransaction.value, editForm)
    
    // Update local data
    const index = transactions.value.findIndex(t => t.id === editingTransaction.value)
    if (index !== -1) {
      transactions.value[index] = { ...editForm }
    }
    
    $q.notify({
      color: 'positive',
      message: 'Transaction updated successfully',
      icon: 'check'
    })
  } catch (error) {
    const { error: errorType, message } = handleAPIError(error)
    $q.notify({
      color: 'negative',
      message: `Failed to update transaction: ${message}`,
      icon: 'report_problem'
    })
  } finally {
    editingTransaction.value = null
  }
}

const addNewTransaction = () => {
  // Add a new row for inline editing
  const newTransaction = {
    id: 'new',
    date_listing: '',
    listing_broker_id: null,
    notes: '',
    date_closing: '',
    buyer_id: null,
    seller_id: null,
    name: '',
    date_pursuit: '',
    description: '',
    priority_id: null
  }
  
  transactions.value.unshift(newTransaction)
  editTransaction(newTransaction)
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
        linkedBuildings.value = []
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
        linkedBuildings.value = []
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

const linkBuilding = async () => {
  if (!selectedTransaction.value || !selectedBuildingToLink.value) return

  linkingBuilding.value = true
  try {
    await linkAPI.create(selectedTransaction.value.id, selectedBuildingToLink.value)
    await fetchLinkedBuildings(selectedTransaction.value.id)
    
    showLinkBuildingDialog.value = false
    selectedBuildingToLink.value = null
    
    $q.notify({
      color: 'positive',
      message: 'Building linked successfully',
      icon: 'check'
    })
  } catch (error) {
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
      await linkAPI.deleteByIds(selectedTransaction.value.id, building.id)
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

const onSearch = () => {
  // Search is handled by computed property
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const truncateText = (text, length) => {
  if (!text) return '-'
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const getSelectedString = () => {
  return selectedTransactions.value.length === 0 
    ? '' 
    : `${selectedTransactions.value.length} record(s) selected of ${transactions.value.length}`
}

// Initialize data
onMounted(() => {
  fetchTransactions()
  fetchBuildings()
})
</script>

<style scoped>
.truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.q-table tbody td {
  cursor: pointer;
}

.q-table tbody td:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
