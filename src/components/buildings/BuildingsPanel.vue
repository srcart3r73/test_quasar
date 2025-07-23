<template>
  <q-card>
    <q-card-section>
      <div class="row items-center q-mb-md">
        <div class="text-h6">Buildings</div>
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Add Building"
          @click="$emit('add-building')"
          dense
        />
      </div>

      <!-- Selected Transaction Info -->
      <div v-if="selectedTransaction">
        <div class="text-subtitle2 q-mb-sm">
          Linked to: {{ selectedTransaction.name || `Transaction ${selectedTransaction.id}` }}
        </div>
        
        <q-btn
          color="secondary"
          icon="link"
          label="Link Building"
          @click="$emit('link-building')"
          size="sm"
          class="q-mb-md"
        />

        <!-- Linked Buildings List -->
        <q-list v-if="linkedBuildings.length > 0">
          <q-item v-for="building in linkedBuildings" :key="building.id">
            <q-item-section>
              <q-item-label>{{ building.address_street }}</q-item-label>
              <q-item-label caption>
                {{ building.address_city }}, {{ building.address_state }} {{ building.address_zip }}
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
                @click="$emit('unlink-building', building)"
                size="sm"
                title="Unlink Building"
              />
            </q-item-section>
          </q-item>
        </q-list>
        
        <div v-else-if="!loadingBuildings" class="text-grey-6 text-center q-pa-md">
          No buildings linked to this transaction
        </div>
        
        <div v-if="loadingBuildings" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em" />
        </div>
      </div>
      
      <div v-else class="text-grey-6 text-center q-pa-md">
        Select a transaction to see linked buildings
      </div>

      <!-- All Buildings List -->
      <q-separator class="q-my-md" v-if="selectedTransaction" />
      
      <div class="text-subtitle2 q-mb-sm">All Buildings</div>
      <q-list v-if="buildings.length > 0">
        <q-item v-for="building in buildings" :key="building.id">
          <q-item-section>
            <q-item-label>{{ building.address_street }}</q-item-label>
            <q-item-label caption>
              {{ building.address_city }}, {{ building.address_state }} {{ building.address_zip }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              dense
              round
              flat
              color="primary"
              icon="visibility"
              size="sm"
              title="View Building Details"
            />
          </q-item-section>
        </q-item>
      </q-list>
      
      <div v-else class="text-grey-6 text-center q-pa-md">
        No buildings available
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  selectedTransaction: {
    type: Object,
    default: null
  },
  buildings: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits([
  'add-building',
  'link-building',
  'unlink-building'
])

// Local state
const linkedBuildings = ref([])
const loadingBuildings = ref(false)

// Watch for transaction changes to fetch linked buildings
watch(() => props.selectedTransaction, async (newTransaction) => {
  if (newTransaction) {
    await fetchLinkedBuildings(newTransaction.id)
  } else {
    linkedBuildings.value = []
  }
}, { immediate: true })

// Methods
const fetchLinkedBuildings = async (transactionId) => {
  loadingBuildings.value = true
  try {
    // This would typically come from a composable or prop
    // For now, we'll emit an event or handle it differently
    linkedBuildings.value = []
  } catch (error) {
    console.error('Error fetching linked buildings:', error)
  } finally {
    loadingBuildings.value = false
  }
}
</script>