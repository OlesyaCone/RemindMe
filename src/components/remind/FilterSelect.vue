<script lang="ts">
import { defineComponent } from 'vue';

type FilterOption = {
  value: string;
  label: string;
};

export default defineComponent({
  name: 'FilterSelect',
  props: {
    label: {
      type: String,
      required: true
    },
    options: {
      type: Array as () => FilterOption[],
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue']
});
</script>

<template>
  <div class="filter-select-container">
    <label class="filter-label">{{ label }}:</label>
    <select 
      class="filter-select"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>