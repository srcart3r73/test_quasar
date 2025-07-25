<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Add New Building</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row q-gutter-md">
          <div class="col-12">
            <q-input
              v-model="localForm.address_street"
              label="Street Address"
              filled
              dense
              :rules="[val => !!val || 'Street address is required']"
            />
          </div>
          <div class="col-5">
            <q-input
              v-model="localForm.address_city_id"
              label="City"
              filled
              dense
            />
          </div>
          <div class="col-3">
            <q-input
              v-model="localForm.address_state_id"
              label="State"
              filled
              dense
            />
          </div>
          <div class="col-4">
            <q-input
              v-model="localForm.address_zip"
              label="ZIP Code"
              filled
              dense
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="localForm.square_feet"
              label="Square Feet"
              type="number"
              filled
              dense
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="localForm.year_built"
              label="Year Built"
              type="number"
              filled
              dense
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="localForm.description"
              label="Description"
              type="textarea"
              filled
              dense
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="$emit('cancel')" />
        <q-btn
          flat
          label="Add Building"
          color="primary"
          @click="$emit('add')"
          :disable="!localForm.address_street"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Local copy of form
const localForm = ref({ ...props.form })

// Watch for changes from parent and update local copy
watch(() => props.form, (newForm) => {
  localForm.value = { ...newForm }
})

// When dialog opens, reset localForm to props.form
watch(() => props.modelValue, (val) => {
  if (val) {
    localForm.value = { ...props.form }
  }
})
</script>