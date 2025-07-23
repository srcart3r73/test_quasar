<template>
  <div>
    <q-list v-if="linkedBuildings.length > 0" dense>
      <q-item v-for="building in linkedBuildings" :key="building.id" dense>
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ building.address_street }}
          </q-item-label>
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
            @click="$emit('unlink', building)"
            size="sm"
            title="Unlink Building"
          />
        </q-item-section>
      </q-item>
    </q-list>
    
    <div v-else-if="!loading" class="text-grey-6 text-center q-py-md">
      No buildings linked to this transaction
    </div>
    
    <div v-if="loading" class="text-center q-py-md">
      <q-spinner color="primary" size="1.5em" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  transaction: Object,
  linkedBuildings: Array,
  loading: Boolean
})

defineEmits(['unlink', 'link'])
</script>