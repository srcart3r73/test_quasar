<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Link Building to Transaction</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div v-if="selectedTransaction" class="q-mb-md">
          <strong>Transaction:</strong> {{ selectedTransaction.name || `Transaction ${selectedTransaction.id}` }}
        </div>

        <q-select
          v-model="selectedBuildingId"
          :options="buildingOptions"
          option-label="label"
          option-value="value"
          label="Select Building"
          filled
          map-options
          emit-value
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="$emit('update:modelValue', false)" />
        <q-btn
          flat
          label="Link"
          color="primary"
          @click="handleLink"
          :disable="!selectedBuildingId"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  availableBuildings: {
    type: Array,
    default: () => []
  },
  selectedTransaction: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'link'
])

// Local state
const selectedBuildingId = ref(null)

// Computed
const buildingOptions = computed(() => {
  return props.availableBuildings.map(building => ({
    label: `${building.address_street} - ${building.address_city_id}, ${building.address_state_id}`,
    value: building.id
  }))
})

// Methods
const handleLink = () => {
  console.log('🔗 handleLink called')
  console.log('🔗 selectedBuildingId.value:', selectedBuildingId.value)
  console.log('🔗 availableBuildings:', props.availableBuildings)
  
  if (selectedBuildingId.value) {
    // Find the full building object
    const selectedBuilding = props.availableBuildings.find(
      building => building.id === selectedBuildingId.value
    )
    
    console.log('🔗 Found building:', selectedBuilding)
    
    if (selectedBuilding) {
      emit('link', selectedBuilding.id)  // Make sure we're emitting the ID
    } else {
      console.error('❌ Could not find building with ID:', selectedBuildingId.value)
    }
  } else {
    console.error('❌ No building selected')
  }
}

// Reset selection when dialog opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedBuildingId.value = null
  }
})
</script>