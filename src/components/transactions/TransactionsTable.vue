<template>
  <q-card>
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="text-h6">Transactions</div>
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Add Transaction"
          @click="$emit('add-transaction')"
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
            @click="$emit('delete-selected')"
            dense
          />
        </div>
      </div>

      <!-- Transactions Table -->
      <q-table
        dense
        :rows="transactions"
        :columns="transactionColumns"
        row-key="id"
        :loading="loading"
        :selected-rows-label="getSelectedString"
        selection="multiple"
        v-model:selected="selectedTransactions"
        :pagination="{ rowsPerPage: 0 }"
        flat
        @row-click="$emit('select-transaction', $event, arguments[1])"
      >
        <!-- Single template for all cells -->
        <template v-slot:body-cell="props">
          <q-td :props="props">
            <!-- Date fields -->
            <q-input
              v-if="props.col.name.includes('date_')"
              v-model="props.row[props.col.name]"
              type="date"
              dense
              borderless
              @blur="$emit('save-field', props.row, props.col.name, props.row[props.col.name])"
            />
            
            <!-- Number fields (ID fields) -->
            <q-input
              v-else-if="['listing_broker_id', 'buyer_id', 'seller_id', 'priority_id'].includes(props.col.name)"
              v-model.number="props.row[props.col.name]"
              type="number"
              dense
              borderless
              @blur="$emit('save-field', props.row, props.col.name, props.row[props.col.name])"
            />
            
            <!-- Textarea fields -->
            <q-input
              v-else-if="['notes', 'description'].includes(props.col.name)"
              v-model="props.row[props.col.name]"
              type="textarea"
              dense
              borderless
              @blur="$emit('save-field', props.row, props.col.name, props.row[props.col.name])"
            />
            
            <!-- Text fields -->
            <q-input
              v-else-if="props.col.name === 'name'"
              v-model="props.row[props.col.name]"
              dense
              borderless
              @blur="$emit('save-field', props.row, props.col.name, props.row[props.col.name])"
            />
            
            <!-- Non-editable ID field -->
            <span v-else-if="props.col.name === 'id'">
              {{ props.row[props.col.name] }}
            </span>
            
            <!-- Actions column -->
            <div v-else-if="props.col.name === 'actions'">
              <q-btn
                dense
                round
                flat
                color="primary"
                icon="visibility"
                @click.stop="$emit('select-transaction', null, props.row)"
                size="sm"
                title="Select Transaction"
              />
              <q-btn
                dense
                round
                flat
                color="negative"
                icon="delete"
                @click.stop="$emit('delete-transaction', props.row)"
                size="sm"
                title="Delete Transaction"
              />
            </div>
            
            <!-- Fallback for any unhandled columns -->
            <span v-else>
              {{ props.row[props.col.name] || '-' }}
            </span>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedTransactions: {
    type: Array,
    default: () => []
  },
  search: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits([
  'add-transaction',
  'delete-selected',
  'select-transaction',
  'save-field',
  'delete-transaction',
  'update:search',
  'update:selected'
])

// Computed
const searchQuery = computed({
  get: () => props.search,
  set: (value) => emit('update:search', value)
})

const selectedTransactions = computed({
  get: () => props.selectedTransactions,
  set: (value) => emit('update:selected', value)
})

// Table columns
const transactionColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'date_listing', label: 'Date Listed', field: 'date_listing', sortable: true, align: 'left' },
  { name: 'date_closing', label: 'Date Closing', field: 'date_closing', sortable: true, align: 'left' },
  { name: 'date_pursuit', label: 'Date Pursuit', field: 'date_pursuit', sortable: true, align: 'left' },
  { name: 'listing_broker_id', label: 'Listing Broker ID', field: 'listing_broker_id', sortable: true, align: 'left' },
  { name: 'buyer_id', label: 'Buyer ID', field: 'buyer_id', sortable: true, align: 'left' },
  { name: 'seller_id', label: 'Seller ID', field: 'seller_id', sortable: true, align: 'left' },
  { name: 'priority_id', label: 'Priority ID', field: 'priority_id', sortable: true, align: 'left' },
  { name: 'notes', label: 'Notes', field: 'notes', sortable: true, align: 'left' },
  { name: 'description', label: 'Description', field: 'description', sortable: true, align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center', sortable: false }
]

const getSelectedString = () => {
  return props.selectedTransactions.length === 0 
    ? '' 
    : `${props.selectedTransactions.length} record(s) selected of ${props.transactions.length}`
}
</script>

<style scoped>
.q-table tbody td {
  cursor: pointer;
}

.q-table tbody td:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>