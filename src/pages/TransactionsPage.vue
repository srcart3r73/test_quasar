<template>
  <q-page>
    <div class="row q-gutter-md">
      <!-- Main Transactions Table -->
      <div class="col-md-12 col-sm-12">
        <q-card>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-h6">Transactions</div>
              <q-space />
              <q-btn
                color="primary"
                icon="add"
                label="Add Transaction"
                @click="addNewTransaction"
                dense
              />
            </div>

            <!-- Search and bulk actions -->
            <div class="row q-gutter-md q-mb-md">
              <div class="col-md-8">
                <q-input
                  v-model="searchQuery"
                  placeholder="Search transactions..."
                  filled
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-md-4">
                <q-btn
                  v-if="selectedTransactions.length > 0"
                  color="negative"
                  icon="delete"
                  :label="`Delete (${selectedTransactions.length})`"
                  @click="deleteSelectedTransactions"
                  dense
                />
              </div>
            </div>

            <!-- Transactions Table with Expandable Rows -->
            <q-table
              dense
              :rows="filteredTransactions"
              :columns="transactionColumns"
              row-key="id"
              :loading="loadingTransactions"
              :selected-rows-label="getSelectedString"
              selection="multiple"
              v-model:selected="selectedTransactions"
              v-model:expanded="expanded"
              :pagination="{ rowsPerPage: 0 }"
              flat
              @row-click="selectTransaction"
            >
              <!-- Custom header to add expand column -->
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th auto-width /> <!-- Expand toggle -->
                  <q-th auto-width /> <!-- Selection checkbox -->
                  
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <!-- Custom body with expandable rows -->
              <template v-slot:body="props">
                <q-tr :props="props">
                  <!-- Expand toggle -->
                  <q-td auto-width>
                    <q-btn
                      dense
                      round
                      flat
                      :icon="props.expand ? 'expand_more' : 'expand_less'"
                      @click.stop="toggleExpand(props)"
                      size="sm"
                    />
                  </q-td>
                  
                  <!-- Selection checkbox -->
                  <q-td auto-width>
                    <q-checkbox v-model="props.selected" />
                  </q-td>

                  <!-- Actions column -->
                  <q-td key="actions" :props="props">
                    <div class="row no-wrap items-center">
                      <q-btn
                        dense
                        round
                        flat
                        color="primary"
                        icon="visibility"
                        @click.stop="selectTransaction(null, props.row)"
                        size="sm"
                        title="Select Transaction"
                      />
                      <q-btn
                        dense
                        round
                        flat
                        color="negative"
                        icon="delete"
                        @click.stop="deleteTransaction(props.row)"
                        size="sm"
                        title="Delete Transaction"
                      />
                    </div>
                  </q-td>

                  <!-- Priority dropdown -->
                  <q-td key="priority_id" :props="props">
                    <q-select
                      v-model="props.row.priority_id"
                      :options="sortedPriorities"
                      option-value="id"
                      option-label="priority"
                      dense
                      borderless
                      emit-value
                      map-options
                      clearable
                      hide-dropdown-icon
                      @update:model-value="saveField(props.row, 'priority_id', $event)"
                    />
                  </q-td>

                  <!-- ID field -->
                  <q-td key="id" :props="props">
                    {{ props.row.id }}
                  </q-td>

                  <!-- Name field -->
                  <q-td key="name" :props="props">
                    <q-input
                      v-model="props.row.name"
                      dense
                      borderless
                      @blur="saveField(props.row, 'name', props.row.name)"
                    >
                      <q-tooltip v-if="props.row.name">
                        {{ props.row.name }}
                      </q-tooltip>
                    </q-input>
                  </q-td>

                  <!-- Date fields -->
                  <q-td key="date_listing" :props="props">
                    <q-input
                      v-model="props.row.date_listing"
                      type="date"
                      dense
                      borderless
                      @blur="saveField(props.row, 'date_listing', props.row.date_listing)"
                    />
                  </q-td>

                  <q-td key="date_closing" :props="props">
                    <q-input
                      v-model="props.row.date_closing"
                      type="date"
                      dense
                      borderless
                      @blur="saveField(props.row, 'date_closing', props.row.date_closing)"
                    />
                  </q-td>

                  <q-td key="date_pursuit" :props="props">
                    <q-input
                      v-model="props.row.date_pursuit"
                      type="date"
                      dense
                      borderless
                      @blur="saveField(props.row, 'date_pursuit', props.row.date_pursuit)"
                    />
                  </q-td>

                  <!-- Participant dropdowns -->
                  <q-td key="listing_broker_id" :props="props">
                    <q-select
                      v-model="props.row.listing_broker_id"
                      :options="participantOptionsWithAddNew"
                      option-value="id"
                      option-label="participant"
                      dense
                      borderless
                      emit-value
                      map-options
                      clearable
                      hide-dropdown-icon
                      @update:model-value="handleParticipantSelect(props.row, 'listing_broker_id', $event)"
                    >
                      <template v-slot:option="scope">
                        <q-item 
                          v-bind="scope.itemProps"
                          :class="scope.opt.id === 'add-new' ? 'text-primary text-weight-bold' : ''"
                        >
                          <q-item-section>
                            <q-item-label>{{ scope.opt.participant }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <q-td key="buyer_id" :props="props">
                    <q-select
                      v-model="props.row.buyer_id"
                      :options="participantOptionsWithAddNew"
                      option-value="id"
                      option-label="participant"
                      dense
                      borderless
                      emit-value
                      map-options
                      clearable
                      hide-dropdown-icon
                      @update:model-value="handleParticipantSelect(props.row, 'buyer_id', $event)"
                    >
                      <template v-slot:option="scope">
                        <q-item 
                          v-bind="scope.itemProps"
                          :class="scope.opt.id === 'add-new' ? 'text-primary text-weight-bold' : ''"
                        >
                          <q-item-section>
                            <q-item-label>{{ scope.opt.participant }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <q-td key="seller_id" :props="props">
                    <q-select
                      v-model="props.row.seller_id"
                      :options="participantOptionsWithAddNew"
                      option-value="id"
                      option-label="participant"
                      dense
                      borderless
                      emit-value
                      map-options
                      clearable
                      hide-dropdown-icon
                      @update:model-value="handleParticipantSelect(props.row, 'seller_id', $event)"
                    >
                      <template v-slot:option="scope">
                        <q-item 
                          v-bind="scope.itemProps"
                          :class="scope.opt.id === 'add-new' ? 'text-primary text-weight-bold' : ''"
                        >
                          <q-item-section>
                            <q-item-label>{{ scope.opt.participant }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </q-td>

                  <!-- Notes field -->
                  <q-td key="notes" :props="props">
                    <q-input
                      v-model="props.row.notes"
                      dense
                      borderless
                      @blur="saveField(props.row, 'notes', props.row.notes)"
                    >
                      <q-tooltip v-if="props.row.notes">
                        {{ props.row.notes }}
                      </q-tooltip>
                    </q-input>
                  </q-td>

                  <!-- Description field -->
                  <q-td key="description" :props="props">
                    <q-input
                      v-model="props.row.description"
                      dense
                      borderless
                      @blur="saveField(props.row, 'description', props.row.description)"
                    >
                      <q-tooltip v-if="props.row.description">
                        {{ props.row.description }}
                      </q-tooltip>
                    </q-input>
                  </q-td>
                </q-tr>

                <!-- Expanded row content -->
                <q-tr v-show="props.expand" :props="props">
                  <q-td colspan="100%" class="bg-grey-1">
                    <div class="q-pa-xs">
                      <div class="row items-center">
                        <div class="text-italic" style="border-bottom: 1px solid #e0e0e0; padding-bottom: 1px; margin-bottom: 1px;">
                          Buildings for this Transaction:
                        </div>
                        <q-btn
                          color="secondary"
                          icon="link"
                          label="Add A Building"
                          @click="handleLinkBuildingForTransaction(props.row)"
                          size="sm"
                          class="q-ml-lg"
                          dense
                        />
                      </div>
                      
                      <!-- Buildings content -->
                      <div v-if="loadingBuildingsByTransaction[props.row.id]" class="text-center q-py-md">
                        <q-spinner color="primary" size="1.5em" />
                      </div>
                      
                      <q-list v-else-if="getLinkedBuildingsForTransaction(props.row.id).length > 0" dense>
                        <q-item v-for="building in getLinkedBuildingsForTransaction(props.row.id)" :key="building.id" dense>
                          <q-item-section>
                            <q-item-label class="text-weight-medium">
                              {{ building.address_street }}
                            </q-item-label>
                            <q-item-label caption>
                              {{ building.address_city_id }}, {{ building.address_state_id }}, {{ building.address_neighborhood_id }}, {{ building.description }}
                            </q-item-label>
                            <q-item-label caption v-if="building.square_feet">
                              {{ building.square_feet }} sq ft
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-btn
                              dense
                              round
                              flat
                              color="negative"
                              icon="unlink"
                              @click="unlinkBuildingFromTransaction(building, props.row.id)"
                              size="sm"
                              title="Unlink Building"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                      
                      <div v-else class="text-grey-6 text-center q-py-md">
                        No buildings linked to this transaction
                      </div>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Add Building Dialog -->
    <AddBuildingDialog
      v-model="showAddBuildingDialog"
      :form="newBuildingForm"
      :loading="addingBuilding"
      @add="addNewBuilding"
      @cancel="cancelAddBuilding"
    />

    <!-- Link Building Dialog -->
    <LinkBuildingDialog
      v-model="showLinkBuildingDialog"
      :available-buildings="availableBuildings"
      :selected-transaction="selectedTransaction"
      @link="linkBuilding"
    />

    <!-- Add Participant Dialog -->
    <q-dialog v-model="showAddParticipantDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add New Participant</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="newParticipantName"
            autofocus
            label="Participant Name"
            @keyup.enter="handleAddParticipant"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="cancelAddParticipant" />
          <q-btn 
            flat 
            label="Add" 
            @click="handleAddParticipant"
            :loading="addingParticipant"
            :disable="!newParticipantName.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/* eslint-disable no-console */
import { onMounted, ref, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import LinkBuildingDialog from '../components/transactions/LinkBuildingDialog.vue'
import AddBuildingDialog from '../components/buildings/AddBuildingDialog.vue'

import { useTransactions } from '../composables/useTransactions'
import { useBuildings } from '../composables/useBuildings'
import { useLinkTransactionsBuildings } from '../composables/useLinkTransactionsBuildings'
import { usePriorities } from '../composables/usePriorities'
import { useParticipants } from '../composables/useParticipants'
import { linkTransactionsBuildingsAPI, buildingsAPI } from '../services/api'

const $q = useQuasar()

// Composables - only destructure what you actually use
const {
  selectedTransactions,
  selectedTransaction,
  loadingTransactions,
  searchQuery,
  filteredTransactions,
  fetchTransactions,
  addNewTransaction,
  saveField,
  deleteTransaction,
  deleteSelectedTransactions,
  selectTransaction,
  getSelectedString
} = useTransactions()

const {
  showAddBuildingDialog,
  addingBuilding,
  newBuildingForm,
  availableBuildings,
  fetchBuildings,
  openAddBuildingDialog,
  cancelAddBuilding,
  addNewBuilding
} = useBuildings()

const {
  showLinkBuildingDialog,
  linkBuilding,
  unlinkBuilding
} = useLinkTransactionsBuildings(selectedTransaction)

const {
  sortedPriorities,
  fetchPriorities
} = usePriorities()

const {
  sortedParticipants,
  fetchParticipants,
  addNewParticipant
} = useParticipants()

// Reactive data
const expanded = ref([])
const linkedBuildingsByTransaction = ref({})
const loadingBuildingsByTransaction = ref({})
const showAddParticipantDialog = ref(false)
const newParticipantName = ref('')
const addingParticipant = ref(false)
const pendingParticipantSelection = ref(null)

// Keep your original Table columns configuration exactly as is
const transactionColumns = [
  { name: 'actions', label: 'Actions', align: 'center', sortable: false, headerStyle: 'width: 100px', style: 'width: 100px' },
  { name: 'priority_id', label: 'Priority', field: 'priority_id', sortable: true, align: 'left', headerStyle: 'width: 80px', style: 'width: 80px' },
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left', headerStyle: 'width: 60px', style: 'width: 60px' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left', headerStyle: 'width: 200px', style: 'width: 200px' },
  { name: 'date_listing', label: 'Date Listed', field: 'date_listing', sortable: true, align: 'left', headerStyle: 'width: 120px', style: 'width: 120px' },
  { name: 'date_closing', label: 'Date Closing', field: 'date_closing', sortable: true, align: 'left', headerStyle: 'width: 120px', style: 'width: 120px' },
  { name: 'date_pursuit', label: 'Date Pursuit', field: 'date_pursuit', sortable: true, align: 'left', headerStyle: 'width: 120px', style: 'width: 120px' },
  { name: 'listing_broker_id', label: 'Broker', field: 'listing_broker_id', sortable: true, align: 'left', headerStyle: 'width: 80px', style: 'width: 80px' },
  { name: 'buyer_id', label: 'Buyer', field: 'buyer_id', sortable: true, align: 'left', headerStyle: 'width: 80px', style: 'width: 80px' },
  { name: 'seller_id', label: 'Seller', field: 'seller_id', sortable: true, align: 'left', headerStyle: 'width: 80px', style: 'width: 80px' },
  { name: 'notes', label: 'Notes', field: 'notes', sortable: true, align: 'left', headerStyle: 'width: 150px', style: 'width: 150px' },
  { name: 'description', label: 'Description', field: 'description', sortable: true, align: 'left', headerStyle: 'width: 150px', style: 'width: 150px' }
]

// Computed properties
const participantOptionsWithAddNew = computed(() => {
  return [
    { id: 'add-new', participant: '+ ADD NEW PARTICIPANT' },
    ...sortedParticipants.value
  ]
})

// Methods
const toggleExpand = async (props) => {
  console.log('🔄 Before toggling props.expand value - transaction:', props.row.name, 'props.expand=', props.expand)
  
  props.expand = !props.expand // Now toggle
  
  console.log('🔄 After toggling props.expand value - transaction:', props.row.name, 'props.expand=', props.expand)
  
  // If row is now expanded (was collapsed before), fetch buildings
  await nextTick(async () => { // Remove 'this.$' - just use 'nextTick'
    console.log('🔄 Inside nextTick - transaction:', props.row.name, 'props.expand=', props.expand)
    if (props.expand) {
      console.log('🔍 Row now expanded - fetching buildings for:', props.row.name)
      await fetchLinkedBuildingsForTransaction(props.row.id) // Remove 'this.' - just call the function directly
    } else {
      console.log('🔄 Row was expanded, now collapsed - no action needed for:', props.row.name)
    }
  })
}

const getLinkedBuildingsForTransaction = (transactionId) => {
  return linkedBuildingsByTransaction.value[transactionId] || []
}

const fetchLinkedBuildingsForTransaction = async (transactionId) => {
  console.log('🔍 Fetching linked buildings for transaction:', transactionId)
  
  loadingBuildingsByTransaction.value[transactionId] = true
  try {
    const links = await linkTransactionsBuildingsAPI.getByTransactionId(transactionId)
    console.log('✅ Links found for transaction', transactionId, ':', links)
    
    if (links.length > 0) {
      const buildingPromises = links.map(link => buildingsAPI.getById(link.building_id))
      const buildings = await Promise.all(buildingPromises)
      console.log('✅ Buildings loaded for transaction', transactionId, ':', buildings)
      linkedBuildingsByTransaction.value[transactionId] = buildings
    } else {
      console.log('ℹ️ No links found for transaction', transactionId)
      linkedBuildingsByTransaction.value[transactionId] = []
    }
  } catch (error) {
    console.error('❌ Failed to fetch linked buildings for transaction', transactionId, ':', error)
    linkedBuildingsByTransaction.value[transactionId] = []
  } finally {
    loadingBuildingsByTransaction.value[transactionId] = false
  }
}

const handleLinkBuildingForTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showLinkBuildingDialog.value = true
}

const unlinkBuildingFromTransaction = async (building, transactionId) => {
  try {
    await unlinkBuilding(building)
    delete linkedBuildingsByTransaction.value[transactionId]
    await fetchLinkedBuildingsForTransaction(transactionId)
  } catch (error) {
    console.error('Failed to unlink building:', error)
  }
}

const handleParticipantSelect = async (row, fieldName, selectedValue) => {
  if (selectedValue === 'add-new') {
    pendingParticipantSelection.value = { row, fieldName }
    showAddParticipantDialog.value = true
    newParticipantName.value = ''
  } else {
    await saveField(row, fieldName, selectedValue)
  }
}

const handleAddParticipant = async () => {
  if (!newParticipantName.value.trim()) return
  
  addingParticipant.value = true
  try {
    console.log('🔄 Adding participant:', newParticipantName.value.trim())
    const newParticipant = await addNewParticipant(newParticipantName.value.trim())
    console.log('✅ New participant created:', newParticipant)
    
    if (pendingParticipantSelection.value) {
      const { row, fieldName } = pendingParticipantSelection.value
      await saveField(row, fieldName, newParticipant.id)
      pendingParticipantSelection.value = null
    }
    
    showAddParticipantDialog.value = false
    newParticipantName.value = ''
    
    $q.notify({
      color: 'positive',
      message: 'Participant added successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('❌ Error adding participant:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to add participant',
      icon: 'report_problem'
    })
  } finally {
    addingParticipant.value = false
  }
}

const cancelAddParticipant = () => {
  showAddParticipantDialog.value = false
  newParticipantName.value = ''
  pendingParticipantSelection.value = null
}

const handleAddBuilding = () => {
  openAddBuildingDialog()
}

const handleLinkBuilding = () => {
  showLinkBuildingDialog.value = true
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 Starting data fetch...')
  
  await Promise.all([
    fetchTransactions(),
    fetchBuildings(),
    fetchPriorities(),
    fetchParticipants()
  ])
  
  console.log('📊 All data loaded!')
//  console.log('🎯 Priorities:', sortedPriorities.value)
//  console.log('🎯 Participants:', sortedParticipants.value)
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