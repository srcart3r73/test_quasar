<template>
  <q-page>
    <!-- Tab Panel Structure -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <!-- Transactions Tab -->
      <q-tab name="transactions" label="Transactions" />
      
      <!-- Financial Model Tabs -->
      <q-tab
        v-for="modelTab in financialModelTabs"
        :key="modelTab.id"
        :name="modelTab.id"
        class="financial-model-tab"
      >
        <div class="column items-center">
          <div class="text-weight-medium">Financial Model</div>
          <div class="text-caption">{{ modelTab.transactionName }}</div>
        </div>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="close"
          class="q-ml-sm"
          @click.stop="closeFinancialModelTab(modelTab.id)"
        />
      </q-tab>
    </q-tabs>

    <q-separator />

    <!-- Tab Panels Content -->
    <q-tab-panels v-model="activeTab" animated>
      <!-- Transactions Tab Panel -->
      <q-tab-panel name="transactions" class="q-pa-none">
        <div class="row q-gutter-md q-pa-md">
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
                  <!-- Custom header with expand toggle and selection checkbox -->
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
                            @click.stop="openFinancialModelTab(props.row)"
                            size="sm"
                            title="Open Financial Model"
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
                          @update:model-value="saveTransactionField(props.row, 'priority_id', $event)"
                        />
                      </q-td>

                      <!-- ID column -->
                      <q-td key="id" :props="props">
                        {{ props.row.id }}
                      </q-td>

                      <!-- Name column -->
                      <q-td key="name" :props="props">
                        <q-input
                          v-model="props.row.name"
                          dense
                          borderless
                          @blur="saveTransactionField(props.row, 'name', props.row.name)"
                        >
                          <q-tooltip v-if="props.row.name">
                            {{ props.row.name }}
                          </q-tooltip>
                        </q-input>
                      </q-td>

                      <!-- Date listing column -->
                      <q-td key="date_listing" :props="props">
                        <q-input
                          v-model="props.row.date_listing"
                          type="date"
                          dense
                          borderless
                          @blur="saveTransactionField(props.row, 'date_listing', props.row.date_listing)"
                        />
                      </q-td>

                      <!-- Date closing column -->
                      <q-td key="date_closing" :props="props">
                        <q-input
                          v-model="props.row.date_closing"
                          type="date"
                          dense
                          borderless
                          @blur="saveTransactionField(props.row, 'date_closing', props.row.date_closing)"
                        />
                      </q-td>

                      <q-td key="date_pursuit" :props="props">
                        <q-input
                          v-model="props.row.date_pursuit"
                          type="date"
                          dense
                          borderless
                          @blur="saveTransactionField(props.row, 'date_pursuit', props.row.date_pursuit)"
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
                          @blur="saveTransactionField(props.row, 'notes', props.row.notes)"
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
                          @blur="saveTransactionField(props.row, 'description', props.row.description)"
                        >
                          <q-tooltip v-if="props.row.description">
                            {{ props.row.description }}
                          </q-tooltip>
                        </q-input>
                      </q-td>
                    </q-tr>

                    <!-- LINKED BUILDINGS -->
                    <q-tr v-show="props.expand" :props="props">
                      <q-td colspan="100%" class="bg-grey-1">
                        <div class="q-pa-xs">
                          <!-- Title and Link Button -->
                          <div class="row items-center">
                            <div class="text-italic" style="border-bottom: 1px solid #e0e0e0; padding-bottom: 1px; margin-bottom: 1px;">
                              Buildings for this Transaction:
                            </div>
                            <q-btn
                              color="secondary"
                              icon="link"
                              label="Link Another Building"
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
                          <q-table
                            v-else-if="getLinkedBuildingsForTransaction(props.row.id).length > 0"
                            :rows="getLinkedBuildingsForTransaction(props.row.id)"
                            :columns="buildingColumns"
                            row-key="id"
                            dense
                            flat
                            hide-bottom
                          >
                            <template v-slot:body-cell="buildingProps">
                              <q-td :props="buildingProps" class="text-caption">

                                <template v-if="buildingProps.col.name === 'address_city_id'">
                                  <q-select
                                    v-model="buildingProps.row.address_city_id"
                                    :options="cityOptionsWithAddNew"
                                    option-value="id"
                                    option-label="city"
                                    dense
                                    borderless
                                    emit-value
                                    map-options
                                    clearable
                                    hide-dropdown-icon
                                    @update:model-value="saveBuildingField(buildingProps.row, 'address_city_id', $event)"
                                  >
                                    <template v-slot:option="scope">
                                      <q-item v-bind="scope.itemProps">
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.city }}</q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                  </q-select>
                                </template>

                                <template v-else-if="buildingProps.col.name === 'address_state_id'">
                                  <q-select
                                    v-model="buildingProps.row.address_state_id"
                                    :options="stateOptionsWithAddNew"
                                    option-value="id"
                                    option-label="state"
                                    dense
                                    borderless
                                    emit-value
                                    map-options
                                    clearable
                                    hide-dropdown-icon
                                    @update:model-value="saveBuildingField(buildingProps.row, 'address_state_id', $event)"
                                  >
                                    <template v-slot:option="scope">
                                      <q-item v-bind="scope.itemProps">
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.state }}</q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                  </q-select>
                                </template>

                                <template v-else-if="buildingProps.col.name === 'neighborhood_id'">
                                  <q-select
                                    v-model="buildingProps.row.neighborhood_id"
                                    :options="neighborhoodOptionsWithAddNew"
                                    option-value="id"
                                    option-label="neighborhood"
                                    dense
                                    borderless
                                    emit-value
                                    map-options
                                    clearable
                                    hide-dropdown-icon
                                    @update:model-value="async (val) => { try { await saveBuildingField(buildingProps.row, 'neighborhood_id', val) } catch (e) { $q.notify({ color: 'negative', message: 'Failed to save neighborhood', caption: e.message }) } }"
                                  >
                                    <template v-slot:option="scope">
                                      <q-item v-bind="scope.itemProps">
                                        <q-item-section>
                                          <q-item-label>{{ scope.opt.neighborhood }}</q-item-label>
                                        </q-item-section>
                                      </q-item>
                                    </template>
                                  </q-select>
                                </template>

                                <template v-else>
                                  <q-input
                                    v-model="buildingProps.row[buildingProps.col.name]"
                                    auto-width
                                    dense
                                    borderless
                                    class="text-caption"
                                    input-class="text-caption"
                                  />
                                </template>

                              </q-td>
                            </template>                      
                          </q-table>

                        </div>
                      </q-td>
                    </q-tr>

                    
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>


      <!-- Financial Model Tab Panels -->
      <q-tab-panel
        v-for="modelTab in financialModelTabs"
        :key="modelTab.id"
        :name="modelTab.id"
        class="q-pa-md"
      >
        <FinancialModelTab
          :tab-id="modelTab.id"
          :initial-transaction-id="modelTab.transactionId"
          :transactions="transactions"
          @update-tab-name="updateFinancialModelTabName"
        />
      </q-tab-panel>
    </q-tab-panels>

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

    <!-- GENERAL Add New Record Dialog -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ addDialogLabel }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <template v-if="addDialogEntity === 'states'">
            <q-input dense v-model="newStateName" autofocus label="State Name" @keyup.enter="handleAddRecord" />
            <q-input dense v-model="newStateShort" label="State Abbreviation" @keyup.enter="handleAddRecord" />
          </template>
          <template v-else-if="addDialogEntity === 'cities'">
            <q-input dense v-model="newCityName" autofocus label="City Name" @keyup.enter="handleAddRecord" />
            <q-select
              v-model="newCityStateId"
              :options="stateOptionsWithAddNew"
              option-value="id"
              option-label="state"
              dense borderless emit-value map-options clearable label="State"
            />
          </template>
          <template v-else-if="addDialogEntity === 'neighborhoods'">
            <q-input dense v-model="newNeighborhoodName" autofocus label="Neighborhood Name" @keyup.enter="handleAddRecord" />
            <q-select
              v-model="newNeighborhoodCityId"
              :options="neighborhoodCityOptions"
              option-value="id"
              option-label="label"
              dense borderless emit-value map-options clearable label="City"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>
                      {{ scope.opt.city }} <span v-if="scope.opt.state_short">({{ scope.opt.state_short }})</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </template>
          <template v-else-if="addDialogEntity === 'participants'">
            <q-input dense v-model="newParticipantName" autofocus label="Participant Name" @keyup.enter="handleAddRecord" />
            <q-select
              v-model="newParticipantTypeId"
              :options="participantTypeOptions"
              option-value="id"
              option-label="name"
              dense borderless emit-value map-options clearable label="Participant Type"
            />
          </template>
          <template v-else>
            <q-input dense v-model="newRecordName" autofocus :label="`${addDialogLabel} Name`" @keyup.enter="handleAddRecord" />
          </template>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="cancelAddRecord" />
          <q-btn flat label="Add" @click="handleAddRecord" :disable="addDialogDisabled" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { api } from '../services/api'
import { useGenericCRUD } from '../composables/useGenericCRUD'

import { onMounted, ref, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import LinkBuildingDialog from '../components/transactions/LinkBuildingDialog.vue'
import AddBuildingDialog from '../components/buildings/AddBuildingDialog.vue'
import FinancialModelTab from '../components/financial_model/FinancialModelTab.vue'

import { useTransactions } from '../composables/useTransactions'
import { useBuildings } from '../composables/useBuildings'
import { usePriorities } from '../composables/usePriorities'
import { useParticipants } from '../composables/useParticipants'

const $q = useQuasar()

// Add missing tab management state
const activeTab = ref('transactions')
const financialModelTabs = ref([])
const financialModelTabCounter = ref(0)

// Composables - updated to use the new structure
const {
  transactions,
  selectedTransactions,
  selectedTransaction,
  loadingTransactions,
  searchQuery,
  filteredTransactions,
  fetchTransactions,
  addNewTransaction,
  saveField: saveTransactionField,
  deleteTransaction,
  deleteSelectedTransactions,
  selectTransaction,
  getSelectedString
} = useTransactions()

const {
  availableBuildings,
  addingBuilding,
  fetchBuildings,
  showAddBuildingDialog,
  newBuildingForm,
  //  openAddBuildingDialog,
  cancelAddBuilding,
  addNewBuilding,
  saveField: saveBuildingField
} = useBuildings()

const {
//  priorities,const cancelAddRecord = () => {
  sortedPriorities,
  fetchPriorities
} = usePriorities()

const {
  // participants,
  sortedParticipants,
  fetchParticipants,
  addParticipant
} = useParticipants()

const { items: cities, create: addCity, fetchAll: fetchCities } = useGenericCRUD('cities')
const { items: states, create: addState, fetchAll: fetchStates } = useGenericCRUD('states')
const { items: neighborhoods, create: addNeighborhood, fetchAll: fetchNeighborhoods } = useGenericCRUD('neighborhoods')
const { items: participantTypes, fetchAll: fetchParticipantTypes } = useGenericCRUD('participant_types')


// Local reactive data
const expanded = ref([])
const linkedBuildingsByTransaction = ref({})
const loadingBuildingsByTransaction = ref({})
const showLinkBuildingDialog = ref(false)  // Add this back
const showAddParticipantDialog = ref(false)
const newParticipantName = ref('')
const pendingParticipantSelection = ref(null)
const newStateName = ref('')
const newStateShort = ref('')
const newCityName = ref('')
const newCityStateId = ref(null)
const newNeighborhoodName = ref('')
const newNeighborhoodCityId = ref(null)
const newParticipantTypeId = ref(null)


// GENERAL CRUD Map
const crudMap = {
  cities: { create: addCity, items: cities },
  states: { create: addState, items: states },
  neighborhoods: { create: addNeighborhood, items: neighborhoods },
  participants: { create: addParticipant, items: sortedParticipants }
}

// GENERAL Map for Entity Fields 
const entityFieldMap = {
  cities: ['city', 'state_id'],
  states: ['state', 'state_short'],
  neighborhoods: ['neighborhood', 'city_id'],
  participants: ['participant', 'participant_type_id']
}

// GENERAL Reactive Data
const showAddDialog = ref(false)
const newRecordName = ref('')
const pendingSelection = ref(null)
const addDialogLabel = ref('')
const addDialogEntity = ref('') // e.g., 'cities', 'states', 'neighborhoods', 'participants'

// GENERAL Computed Options with Add New
const optionsWithAddNew = (entity, labelKey) => computed(() => [
  { id: 'add-new', [labelKey]: `+ ADD NEW ${entity.toUpperCase()}` },
  ...crudMap[entity].items.value
])

// GENERAL Select Handler
//const handleSelect = async (row, fieldName, selectedValue, entity) => {
//  if (selectedValue === 'add-new') {
//    pendingSelection.value = { row, fieldName, entity }
//    addDialogLabel.value = `Add New ${entity.charAt(0).toUpperCase() + entity.slice(1)}`
//    showAddDialog.value = true
//    newRecordName.value = ''
//    addDialogEntity.value = entity
//  } else {
//    await saveField(row, fieldName, selectedValue)
//  }
//}

const handleAddRecord = async () => {
  let payload = {}
  const entity = addDialogEntity.value
  if (entity === 'states') {
    payload = { state: newStateName.value, state_short: newStateShort.value }
  } else if (entity === 'cities') {
    payload = { city: newCityName.value, state_id: newCityStateId.value }
  } else if (entity === 'neighborhoods') {
    payload = { neighborhood: newNeighborhoodName.value, city_id: newNeighborhoodCityId.value }
  } else if (entity === 'participants') {
    payload = { participant: newParticipantName.value, participant_type_id: newParticipantTypeId.value }
  } else {
    payload = { [entityFieldMap[entity][0]]: newRecordName.value }
  }
  const createFn = crudMap[entity].create
  const newRecord = await createFn(payload)
  crudMap[entity].items.value.push(newRecord)
  if (pendingSelection.value) {
    const { row, fieldName } = pendingSelection.value
    row[fieldName] = newRecord.id
    pendingSelection.value = null
  }
  showAddDialog.value = false
  // Reset dialog fields
  newStateName.value = ''
  newStateShort.value = ''
  newCityName.value = ''
  newCityStateId.value = null
  newNeighborhoodName.value = ''
  newNeighborhoodCityId.value = null
  newParticipantName.value = ''
  newParticipantTypeId.value = null
  newRecordName.value = ''
}

// GENERAL Cancel Add Dialog
const cancelAddRecord = () => {
  showAddDialog.value = false
  pendingSelection.value = null
  newStateName.value = ''
  newStateShort.value = ''
  newCityName.value = ''
  newCityStateId.value = null
  newNeighborhoodName.value = ''
  newNeighborhoodCityId.value = null
  newParticipantName.value = ''
  newParticipantTypeId.value = null
  newRecordName.value = ''
}


// INDIVIDUAL Computed Options with Add New
const participantOptionsWithAddNew = optionsWithAddNew('participants', 'participant')
const cityOptionsWithAddNew = optionsWithAddNew('cities', 'city')
const stateOptionsWithAddNew = optionsWithAddNew('states', 'state')
const neighborhoodOptionsWithAddNew = optionsWithAddNew('neighborhoods', 'neighborhood')
const neighborhoodCityOptions = computed(() =>
  cities.value.map(city => ({
    id: city.id,
    city: city.city,
    state_short: states.value.find(s => s.id === city.state_id)?.state_short || '',
    label: `${city.city}${city.state_id ? ' (' + (states.value.find(s => s.id === city.state_id)?.state_short || '') + ')' : ''}`
  }))
)
const participantTypeOptions = computed(() => [
  ...participantTypes.value
])


// Keep your table columns exactly as they are
const transactionColumns = [
  { name: 'actions', label: 'Actions', align: 'center', sortable: false, headerStyle: 'width: 100px', style: 'width: 100px' },
  { name: 'priority_id', label: 'Priority', field: 'priority_id', sortable: true, align: 'left', headerStyle: 'width: 80px', style: 'width: 80px' },
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left', headerStyle: 'width: 60px', style: 'width: 60px' },
  { name: 'name', label: 'Name (address as a proxy)', field: 'name', sortable: true, align: 'left', headerStyle: 'width: 200px', style: 'width: 200px' },
  { name: 'date_listing', label: 'Date Listed', field: 'date_listing', sortable: true, align: 'left', headerStyle: 'width: 120px', style: 'width: 120px' },
  { name: 'date_closing', label: 'Date Closing', field: 'date_closing', sortable: true, align: 'left', headerStyle: 'width: 120px', style: 'width: 120px' },
  { name: 'date_pursuit', label: 'Date Pursuit', field: 'date_pursuit', sortable: true, align: 'left', headerStyle: 'width: 120px', style: 'width: 120px' },
  { name: 'listing_broker_id', label: 'Broker', field: 'listing_broker_id', sortable: true, align: 'left', headerStyle: 'width: 80px', style: 'width: 80px' },
  { name: 'buyer_id', label: 'Buyer', field: 'buyer_id', sortable: true, align: 'left', headerStyle: 'width: 80px', style: 'width: 80px' },
  { name: 'seller_id', label: 'Seller', field: 'seller_id', sortable: true, align: 'left', headerStyle: 'width: 80px', style: 'width: 80px' },
  { name: 'notes', label: 'Notes', field: 'notes', sortable: true, align: 'left', headerStyle: 'width: 150px', style: 'width: 150px' },
  { name: 'description', label: 'Description', field: 'description', sortable: true, align: 'left', headerStyle: 'width: 150px', style: 'width: 150px' }
]

const buildingColumns = [
  { name: 'address_street', label: 'Street', field: 'address_street', sortable: true, align: 'left' },
  { name: 'address_city_id', label: 'City', field: 'address_city_id', sortable: true, align: 'left' },
  { name: 'address_state_id', label: 'State', field: 'address_state_id', sortable: true, align: 'left' },
  { name: 'neighborhood_id', label: 'Neighborhood', field: 'neighborhood_id', sortable: true, align: 'left' },
  { name: 'description', label: 'Description', field: 'description', sortable: true, align: 'left' },
  { name: 'square_feet', label: 'Square Feet', field: 'square_feet', sortable: true, align: 'right' }
]

// Updated methods
const toggleExpand = async (props) => {
  props.expand = !props.expand
  
  await nextTick(async () => {
    if (props.expand) {
      await fetchLinkedBuildingsForTransaction(props.row.id)
    }
  })
}

const getLinkedBuildingsForTransaction = (transactionId) => {
  return linkedBuildingsByTransaction.value[transactionId] || []
}

const fetchLinkedBuildingsForTransaction = async (transactionId) => {
  loadingBuildingsByTransaction.value[transactionId] = true
  try {
    // Use the generic api instead of linkTransactionsBuildingsAPI
    const links = await api.query('link_transactions_buildings', { transaction_id: transactionId })
    
    if (links.length > 0) {
      // Use the generic api instead of buildingsAPI
      const buildingPromises = links.map(link => api.getById('buildings', link.building_id))
      const buildings = await Promise.all(buildingPromises)
      linkedBuildingsByTransaction.value[transactionId] = buildings
    } else {
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

const linkBuilding = async (buildingId) => {
  try {
    await api.createLink('link_transactions_buildings', selectedTransaction.value.id, buildingId)
    showLinkBuildingDialog.value = false
    await fetchLinkedBuildingsForTransaction(selectedTransaction.value.id)
  } catch (error) {
    console.error('Failed to link building:', error)
  }
}

const handleParticipantSelect = async (row, fieldName, selectedValue) => {
  if (selectedValue === 'add-new') {
    pendingParticipantSelection.value = { row, fieldName }
    showAddParticipantDialog.value = true
    newParticipantName.value = ''
  } else {
    await saveTransactionField(row, fieldName, selectedValue)
  }
}


// Add the missing Financial Model tab methods
const openFinancialModelTab = (transaction) => {
  // Check if we already have 5 tabs open
  if (financialModelTabs.value.length >= 5) {
    $q.notify({
      color: 'warning',
      message: 'Maximum of 5 Financial Model tabs allowed',
      icon: 'warning'
    })
    return
  }

  financialModelTabCounter.value++
  const tabId = `financial-model-${financialModelTabCounter.value}`
  const newTab = {
    id: tabId,
    transactionId: transaction.id,
    transactionName: transaction.name || `Transaction ${transaction.id}`
  }
  financialModelTabs.value.push(newTab)
  activeTab.value = tabId
}

const closeFinancialModelTab = (tabId) => {
  const index = financialModelTabs.value.findIndex(tab => tab.id === tabId)
  if (index !== -1) {
    financialModelTabs.value.splice(index, 1)
    
    // If we closed the active tab, switch to transactions tab
    if (activeTab.value === tabId) {
      if (financialModelTabs.value.length > 0) {
        activeTab.value = financialModelTabs.value[financialModelTabs.value.length - 1].id
      } else {
        activeTab.value = 'transactions'
      }
    }
  }
}

const updateFinancialModelTabName = (tabId, newTransactionName) => {
  const tab = financialModelTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.transactionName = newTransactionName
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchTransactions(),
    fetchBuildings(),
    fetchPriorities(),
    fetchParticipants(),
    fetchCities(),
    fetchStates(),
    fetchNeighborhoods(),
    fetchParticipantTypes()
  ])
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