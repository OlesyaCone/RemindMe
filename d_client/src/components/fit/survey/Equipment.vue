<script lang="ts">
import { defineComponent } from 'vue';
import type { UserSurveyData, EquipmentType } from "../../../types/fit";

export default defineComponent({
  name: 'Equipment',
  props: {
    userData: {
      type: Object as () => UserSurveyData,
      required: true
    }
  },
  emits: ['update:userData'],
  methods: {
    toggleEquipment(item: EquipmentType) {  
      const equipment = [...this.userData.equipment];
      const index = equipment.indexOf(item);
      
      if (index === -1) {
        equipment.push(item);
      } else {
        equipment.splice(index, 1);
      }
      
      this.$emit('update:userData', {
        ...this.userData,
        equipment
      });
    },
    isEquipmentSelected(item: EquipmentType): boolean { 
      return this.userData.equipment.includes(item);
    }
  }
});
</script>

<template>
  <div class="survey-step">
    <h2>Какое оборудование есть?</h2>
    <div class="options">
      <label class="option">
        <input 
          type="checkbox" 
          :checked="isEquipmentSelected('dumbbells')"
          @change="toggleEquipment('dumbbells')"
        >
        <span class="checkmark"></span>
        Гантели
      </label>
      <label class="option">
        <input 
          type="checkbox" 
          :checked="isEquipmentSelected('bands')"
          @change="toggleEquipment('bands')"
        >
        <span class="checkmark"></span>
        Эспандеры
      </label>
      <label class="option">
        <input 
          type="checkbox" 
          :checked="isEquipmentSelected('none')"
          @change="toggleEquipment('none')"
        >
        <span class="checkmark"></span>
        Ничего нет
      </label>
    </div>
  </div>
</template>