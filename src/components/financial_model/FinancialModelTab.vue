<template>
  <div class="financial-model-tab">
    <!-- Toolbar with dropdowns -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-md-6">
        <!-- Transaction Dropdown -->
        <q-select
          v-model="selectedTransactionId"
          :options="transactionOptions"
          option-value="id"
          option-label="label"
          label="Select Transaction"
          filled
          dense
          emit-value
          map-options
          @update:model-value="onTransactionChange"
        />
      </div>
      
      <div class="col-md-6">
        <!-- Scenarios Dropdown -->
        <q-select
          v-model="selectedScenarioId"
          :options="scenarioOptionsWithAddNew"
          option-value="id"
          option-label="name"
          label="Select Scenario"
          filled
          dense
          emit-value
          map-options
          :disable="!selectedTransactionId"
          @update:model-value="onScenarioChange"
        >
          <template v-slot:option="scope">
            <q-item 
              v-bind="scope.itemProps"
              :class="scope.opt.id === 'add-new' ? 'text-primary text-weight-bold' : ''"
            >
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <!-- Toolbar Actions -->
    <div class="row items-center q-mb-md" v-if="selectedScenarioId && selectedScenarioId !== 'add-new'">
      <div class="text-h6">Model Inputs</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="Add Model Input"
        @click="addNewModelInput"
        dense
      />
    </div>

    <!-- Model Inputs Table -->
    <q-table
      v-if="selectedScenarioId && selectedScenarioId !== 'add-new'"
      dense
      :rows="modelInputs"
      :columns="modelInputColumns"
      row-key="id"
      :loading="loadingModelInputs"
      :pagination="{ rowsPerPage: 0 }"
      flat
    >
      <template v-slot:body-cell="props">
        <q-td :props="props">
          <!-- Handle different cell types -->
          <div v-if="props.col.name === 'actions'">
            <q-btn
              dense
              round
              flat
              color="negative"
              icon="delete"
              @click.stop="deleteModelInput(props.row)"
              size="sm"
              title="Delete Model Input"
            />
          </div>
          
          <!-- Line Item Type Dropdown -->
          <div v-else-if="props.col.name === 'line_item_type_id'">
            <q-select
              v-model="props.row.line_item_type_id"
              :options="lineItemTypeOptionsWithAddNew"
              option-value="id"
              option-label="name"
              dense
              borderless
              emit-value
              map-options
              clearable
              hide-dropdown-icon
              @update:model-value="handleLineItemTypeSelect(props.row, $event)"
            >
              <template v-slot:option="scope">
                <q-item 
                  v-bind="scope.itemProps"
                  :class="scope.opt.id === 'add-new' ? 'text-primary text-weight-bold' : ''"
                >
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          
          <!-- Escalation Type Dropdown -->
          <div v-else-if="props.col.name === 'escalation_type_id'">
            <q-select
              v-model="props.row.escalation_type_id"
              :options="escalationTypeOptionsWithAddNew"
              option-value="id"
              option-label="name"
              dense
              borderless
              emit-value
              map-options
              clearable
              hide-dropdown-icon
              @update:model-value="handleEscalationTypeSelect(props.row, $event)"
            >
              <template v-slot:option="scope">
                <q-item 
                  v-bind="scope.itemProps"
                  :class="scope.opt.id === 'add-new' ? 'text-primary text-weight-bold' : ''"
                >
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          
          <!-- Formatted numeric fields -->
          <div v-else-if="props.col.name === 'line_item_amount'">
            <q-input
              v-model="props.row.line_item_amount"
              :prefix="getAmountPrefix(props.row.line_item_type_id)"
              :suffix="getAmountSuffix(props.row.line_item_type_id)"
              dense
              borderless
              @blur="saveModelInputField(props.row, 'line_item_amount', props.row.line_item_amount)"
            />
          </div>
          
          <div v-else-if="props.col.name === 'escalation_amount'">
            <q-input
              v-model="props.row.escalation_amount"
              :prefix="getEscalationPrefix(props.row.escalation_type_id)"
              :suffix="getEscalationSuffix(props.row.escalation_type_id)"
              dense
              borderless
              @blur="saveModelInputField(props.row, 'escalation_amount', props.row.escalation_amount)"
            />
          </div>
          
          <!-- Regular input fields -->
          <div v-else>
            <q-input
              v-model="props.row[props.col.name]"
              dense
              borderless
              @blur="saveModelInputField(props.row, props.col.name, props.row[props.col.name])"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Empty state when no scenario selected -->
    <div v-else-if="!selectedTransactionId" class="text-center q-py-xl text-grey-5">
      <q-icon name="info" size="3em" class="q-mb-md" />
      <div class="text-h6">Select a transaction to begin</div>
    </div>

    <div v-else-if="!selectedScenarioId" class="text-center q-py-xl text-grey-5">
      <q-icon name="info" size="3em" class="q-mb-md" />
      <div class="text-h6">Select or create a scenario</div>
    </div>

    <!-- Add Scenario Dialog -->
    <q-dialog v-model="showAddScenarioDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add New Scenario</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newScenarioForm.name"
            label="Scenario Name"
            filled
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="newScenarioForm.description"
            label="Description"
            filled
            dense
            type="textarea"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddScenario" />
          <q-btn
            flat
            label="Add"
            color="primary"
            @click="handleAddScenario"
            :loading="addingScenario"
            :disable="!newScenarioForm.name.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Line Item Type Dialog -->
    <q-dialog v-model="showAddLineItemTypeDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add New Line Item Type</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newLineItemTypeName"
            label="Line Item Type Name"
            filled
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddLineItemType" />
          <q-btn
            flat
            label="Add"
            color="primary"
            @click="handleAddLineItemType"
            :loading="addingLineItemType"
            :disable="!newLineItemTypeName.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Escalation Type Dialog -->
    <q-dialog v-model="showAddEscalationTypeDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add New Escalation Type</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newEscalationTypeName"
            label="Escalation Type Name"
            filled
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelAddEscalationType" />
          <q-btn
            flat
            label="Add"
            color="primary"
            @click="handleAddEscalationType"
            :loading="addingEscalationType"
            :disable="!newEscalationTypeName.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api, handleAPIError } from '../../services/api'

// Props
const props = defineProps({
  tabId: {
    type: String,
    required: true
  },
  initialTransactionId: {
    type: [Number, String],
    default: null
  },
  transactions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update-tab-name'])

const $q = useQuasar()

// State
const selectedTransactionId = ref(props.initialTransactionId)
const selectedScenarioId = ref(null)
const scenarios = ref([])
const modelInputs = ref([])
const lineItemTypes = ref([])
const escalationTypes = ref([])

// Loading states
const loadingScenarios = ref(false)
const loadingModelInputs = ref(false)
const addingScenario = ref(false)
const addingLineItemType = ref(false)
const addingEscalationType = ref(false)

// Dialog states
const showAddScenarioDialog = ref(false)
const showAddLineItemTypeDialog = ref(false)
const showAddEscalationTypeDialog = ref(false)

// Form states
const newScenarioForm = ref({
  name: '',
  description: ''
})
const newLineItemTypeName = ref('')
const newEscalationTypeName = ref('')
const pendingLineItemTypeSelection = ref(null)
const pendingEscalationTypeSelection = ref(null)

// Computed Properties
const transactionOptions = computed(() => {
  return props.transactions.map(transaction => ({
    id: transaction.id,
    label: transaction.name || `Transaction ${transaction.id}`
  }))
})

const scenarioOptionsWithAddNew = computed(() => {
  return [
    { id: 'add-new', name: '+ ADD NEW SCENARIO' },
    ...scenarios.value
  ]
})

const lineItemTypeOptionsWithAddNew = computed(() => {
  return [
    { id: 'add-new', name: '+ ADD NEW LINE ITEM TYPE' },
    ...lineItemTypes.value
  ]
})

const escalationTypeOptionsWithAddNew = computed(() => {
  return [
    { id: 'add-new', name: '+ ADD NEW ESCALATION TYPE' },
    ...escalationTypes.value
  ]
})

// Model Inputs Table Columns
const modelInputColumns = [
  { name: 'actions', label: 'Actions', align: 'center', sortable: false, style: 'width: 80px' },
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left', style: 'width: 60px' },
  { name: 'line_item', label: 'Line Item', field: 'line_item', sortable: true, align: 'left', style: 'width: 200px' },
  { name: 'line_item_description', label: 'Description', field: 'line_item_description', sortable: true, align: 'left', style: 'width: 200px' },
  { name: 'line_item_amount', label: 'Amount', field: 'line_item_amount', sortable: true, align: 'right', style: 'width: 120px' },
  { name: 'line_item_type_id', label: 'Type', field: 'line_item_type_id', sortable: true, align: 'left', style: 'width: 120px' },
  { name: 'start_month', label: 'Start Month', field: 'start_month', sortable: true, align: 'right', style: 'width: 100px' },
  { name: 'end_month', label: 'End Month', field: 'end_month', sortable: true, align: 'right', style: 'width: 100px' },
  { name: 'line_item_frequency', label: 'Frequency', field: 'line_item_frequency', sortable: true, align: 'right', style: 'width: 100px' },
  { name: 'escalation_amount', label: 'Escalation', field: 'escalation_amount', sortable: true, align: 'right', style: 'width: 120px' },
  { name: 'escalation_type_id', label: 'Esc. Type', field: 'escalation_type_id', sortable: true, align: 'left', style: 'width: 100px' },
  { name: 'escalation_frequency', label: 'Esc. Freq.', field: 'escalation_frequency', sortable: true, align: 'right', style: 'width: 100px' }
]

// Watchers
watch(selectedTransactionId, (newTransactionId) => {
  if (newTransactionId) {
    const transaction = props.transactions.find(t => t.id === newTransactionId)
    if (transaction) {
      emit('update-tab-name', props.tabId, transaction.name || `Transaction ${transaction.id}`)
    }
    fetchScenariosForTransaction(newTransactionId)
  }
  selectedScenarioId.value = null
  modelInputs.value = []
})

watch(selectedScenarioId, (newScenarioId) => {
  if (newScenarioId && newScenarioId !== 'add-new') {
    fetchModelInputsForScenario(newScenarioId)
  } else {
    modelInputs.value = []
  }
})

// Methods - API Calls
const fetchScenariosForTransaction = async (transactionId) => {
  loadingScenarios.value = true
  try {
    const result = await api.query('scenarios', { transaction_id: transactionId })
    scenarios.value = result
    console.log('✅ Scenarios loaded:', result.length)
  } catch (error) {
    console.error('❌ Failed to fetch scenarios:', error)
    scenarios.value = []
  } finally {
    loadingScenarios.value = false
  }
}

const fetchModelInputsForScenario = async (scenarioId) => {
  loadingModelInputs.value = true
  try {
    const result = await api.query('model_inputs', { scenario_id: scenarioId })
    modelInputs.value = result
    console.log('✅ Model inputs loaded:', result.length)
  } catch (error) {
    console.error('❌ Failed to fetch model inputs:', error)
    modelInputs.value = []
  } finally {
    loadingModelInputs.value = false
  }
}

const fetchLineItemTypes = async () => {
  try {
    const result = await api.getAll('line_item_types')
    lineItemTypes.value = result
    console.log('✅ Line item types loaded:', result.length)
  } catch (error) {
    console.error('❌ Failed to fetch line item types:', error)
    lineItemTypes.value = []
  }
}

const fetchEscalationTypes = async () => {
  try {
    const result = await api.getAll('escalation_types')
    escalationTypes.value = result
    console.log('✅ Escalation types loaded:', result.length)
  } catch (error) {
    console.error('❌ Failed to fetch escalation types:', error)
    escalationTypes.value = []
  }
}

// Methods - Event Handlers
const onTransactionChange = (transactionId) => {
  selectedTransactionId.value = transactionId
}

const onScenarioChange = (scenarioId) => {
  if (scenarioId === 'add-new') {
    showAddScenarioDialog.value = true
    newScenarioForm.value = { name: '', description: '' }
  } else {
    selectedScenarioId.value = scenarioId
  }
}

// Methods - Scenario Management
const handleAddScenario = async () => {
  if (!newScenarioForm.value.name.trim()) return
  
  addingScenario.value = true
  try {
    const newScenario = await api.create('scenarios', {
      name: newScenarioForm.value.name.trim(),
      description: newScenarioForm.value.description.trim(),
      transaction_id: selectedTransactionId.value
    })
    
    scenarios.value.push(newScenario)
    selectedScenarioId.value = newScenario.id
    showAddScenarioDialog.value = false
    
    $q.notify({
      color: 'positive',
      message: 'Scenario added successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('❌ Error adding scenario:', error)
    const { message } = handleAPIError(error)
    $q.notify({
      color: 'negative',
      message: `Failed to add scenario: ${message}`,
      icon: 'report_problem'
    })
  } finally {
    addingScenario.value = false
  }
}

const cancelAddScenario = () => {
  showAddScenarioDialog.value = false
  selectedScenarioId.value = null
  newScenarioForm.value = { name: '', description: '' }
}

// Methods - Model Input Management
const addNewModelInput = async () => {
  try {
    const newModelInput = await api.create('model_inputs', {
      scenario_id: selectedScenarioId.value,
      line_item: 'New Line Item',
      line_item_amount: 0,
      start_month: 0,
      end_month: null,
      line_item_frequency: 12,
      escalation_amount: 0,
      escalation_type_id: 1,
      line_item_type_id: 2,
      escalation_frequency: 12,
      line_item_description: ''
    })
    
    modelInputs.value.unshift(newModelInput)
    
    $q.notify({
      color: 'positive',
      message: 'Model input added successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('❌ Error adding model input:', error)
    const { message } = handleAPIError(error)
    $q.notify({
      color: 'negative',
      message: `Failed to add model input: ${message}`,
      icon: 'report_problem'
    })
  }
}

const saveModelInputField = async (row, fieldName, value) => {
  try {
    const updateData = { [fieldName]: value }
    await api.update('model_inputs', row.id, updateData)
    
    const index = modelInputs.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      modelInputs.value[index][fieldName] = value
    }
    
    $q.notify({
      color: 'positive',
      message: `${fieldName} updated`,
      icon: 'check',
      timeout: 1000
    })
  } catch (error) {
    console.error('❌ Save field error:', error)
    const { message } = handleAPIError(error)
    $q.notify({
      color: 'negative',
      message: `Failed to update ${fieldName}: ${message}`,
      icon: 'report_problem'
    })
  }
}

const deleteModelInput = async (modelInput) => {
  return new Promise((resolve) => {
    $q.dialog({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete model input "${modelInput.line_item || modelInput.id}"?`,
      cancel: true,
      persistent: true
    }).onOk(async () => {
      try {
        await api.delete('model_inputs', modelInput.id)
        modelInputs.value = modelInputs.value.filter(item => item.id !== modelInput.id)
        
        $q.notify({
          color: 'positive',
          message: 'Model input deleted successfully',
          icon: 'check'
        })
        
        resolve(true)
      } catch (error) {
        console.error('❌ Delete error:', error)
        const { message } = handleAPIError(error)
        $q.notify({
          color: 'negative',
          message: `Failed to delete model input: ${message}`,
          icon: 'report_problem'
        })
        resolve(false)
      }
    }).onCancel(() => {
      resolve(false)
    })
  })
}

// Methods - Line Item Type Management
const handleLineItemTypeSelect = async (row, selectedValue) => {
  if (selectedValue === 'add-new') {
    pendingLineItemTypeSelection.value = row
    showAddLineItemTypeDialog.value = true
    newLineItemTypeName.value = ''
  } else {
    await saveModelInputField(row, 'line_item_type_id', selectedValue)
  }
}

const handleAddLineItemType = async () => {
  if (!newLineItemTypeName.value.trim()) return
  
  addingLineItemType.value = true
  try {
    const newLineItemType = await api.create('line_item_types', {
      name: newLineItemTypeName.value.trim()
    })
    
    lineItemTypes.value.push(newLineItemType)
    
    if (pendingLineItemTypeSelection.value) {
      await saveModelInputField(pendingLineItemTypeSelection.value, 'line_item_type_id', newLineItemType.id)
      pendingLineItemTypeSelection.value = null
    }
    
    showAddLineItemTypeDialog.value = false
    newLineItemTypeName.value = ''
    
    $q.notify({
      color: 'positive',
      message: 'Line item type added successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('❌ Error adding line item type:', error)
    const { message } = handleAPIError(error)
    $q.notify({
      color: 'negative',
      message: `Failed to add line item type: ${message}`,
      icon: 'report_problem'
    })
  } finally {
    addingLineItemType.value = false
  }
}

const cancelAddLineItemType = () => {
  showAddLineItemTypeDialog.value = false
  newLineItemTypeName.value = ''
  pendingLineItemTypeSelection.value = null
}

// Methods - Escalation Type Management
const handleEscalationTypeSelect = async (row, selectedValue) => {
  if (selectedValue === 'add-new') {
    pendingEscalationTypeSelection.value = row
    showAddEscalationTypeDialog.value = true
    newEscalationTypeName.value = ''
  } else {
    await saveModelInputField(row, 'escalation_type_id', selectedValue)
  }
}

const handleAddEscalationType = async () => {
  if (!newEscalationTypeName.value.trim()) return
  
  addingEscalationType.value = true
  try {
    const newEscalationType = await api.create('escalation_types', {
      name: newEscalationTypeName.value.trim()
    })
    
    escalationTypes.value.push(newEscalationType)
    
    if (pendingEscalationTypeSelection.value) {
      await saveModelInputField(pendingEscalationTypeSelection.value, 'escalation_type_id', newEscalationType.id)
      pendingEscalationTypeSelection.value = null
    }
    
    showAddEscalationTypeDialog.value = false
    newEscalationTypeName.value = ''
    
    $q.notify({
      color: 'positive',
      message: 'Escalation type added successfully',
      icon: 'check'
    })
  } catch (error) {
    console.error('❌ Error adding escalation type:', error)
    const { message } = handleAPIError(error)
    $q.notify({
      color: 'negative',
      message: `Failed to add escalation type: ${message}`,
      icon: 'report_problem'
    })
  } finally {
    addingEscalationType.value = false
  }
}

const cancelAddEscalationType = () => {
  showAddEscalationTypeDialog.value = false
  newEscalationTypeName.value = ''
  pendingEscalationTypeSelection.value = null
}

// Methods - Formatting
const getAmountPrefix = (lineItemTypeId) => {
  if (lineItemTypeId === 1) return '$' // Currency
  return ''
}

const getAmountSuffix = (lineItemTypeId) => {
  if (lineItemTypeId === 2) return '%' // Percentage
  return ''
}

const getEscalationPrefix = (escalationTypeId) => {
  if (escalationTypeId === 2) return '$' // Currency
  return ''
}

const getEscalationSuffix = (escalationTypeId) => {
  if (escalationTypeId === 1) return '%' // Percentage
  return ''
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchLineItemTypes(),
    fetchEscalationTypes()
  ])
  
  // If we have an initial transaction, fetch its scenarios
  if (selectedTransactionId.value) {
    await fetchScenariosForTransaction(selectedTransactionId.value)
  }
})
</script>

<style scoped>
.financial-model-tab {
  min-height: 400px;
}
</style>