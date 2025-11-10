<script lang="ts">
import { defineComponent } from "vue";
import type { UserSurveyData, EquipmentType } from "../../../types/fit";

interface EquipmentItem {
  value: EquipmentType;
  label: string;
}

interface EquipmentGroup {
  title: string;
  subtitle?: string;
  items: EquipmentItem[];
}

export default defineComponent({
  name: "Equipment",
  props: {
    userData: {
      type: Object as () => UserSurveyData,
      required: true,
    },
  },
  emits: ["update:userData"],
  data() {
    return {
      basicEquipment: [
        { value: 'body weight', label: 'Вес тела' },
        { value: 'dumbbell', label: 'Гантели' },
        { value: 'barbell', label: 'Штанга' },
        { value: 'band', label: 'Эспандер' },
        { value: 'roller', label: 'Роллер' },
        { value: 'medicine ball', label: 'Медицинский мяч' },
        { value: 'resistance band', label: 'Резиновый эспандер' },
        { value: 'weighted', label: 'Утяжелители' }
      ] as EquipmentItem[],
      machineEquipment: {
        title: 'Тренажеры',
        subtitle: 'Можно выбрать несколько',
        items: [
          { value: 'cable', label: 'Тросовый тренажер' },
          { value: 'leverage machine', label: 'Рычажный тренажер' },
          { value: 'smith machine', label: 'Тренажер Смита' },
          { value: 'stationary bike', label: 'Велотренажер' },
          { value: 'elliptical machine', label: 'Эллиптический тренажер' },
          { value: 'stepmill machine', label: 'Степпер' },
          { value: 'assisted', label: 'Тренажер с противовесом' },
          { value: 'sled machine', label: 'Тренажер-сани' },
          { value: 'skierg machine', label: 'Лыжный тренажер' },
          { value: 'upper body ergometer', label: 'Эргометр для верха тела' },
          { value: 'bosu ball', label: 'Полусфера BOSU' },
          { value: 'stability ball', label: 'Фитбол' }
        ] as EquipmentItem[]
      } as EquipmentGroup,
      showMachines: false
    };
  },
  methods: {
    toggleEquipment(item: EquipmentType) {
      const equipment = [...this.userData.equipment];
      const index = equipment.indexOf(item);

      if (index === -1) {
        equipment.push(item);
      } else {
        equipment.splice(index, 1);
      }

      this.$emit("update:userData", {
        ...this.userData,
        equipment,
      });
    },
    isEquipmentSelected(item: EquipmentType): boolean {
      return this.userData.equipment.includes(item);
    },
    toggleMachines() {
      this.showMachines = !this.showMachines;
    }
  },
});
</script>

<template>
  <div class="survey-step">
    <h2>Какое оборудование есть?</h2>
    <div class="options">
      <label 
        v-for="item in basicEquipment" 
        :key="item.value" 
        class="option"
      >
        <input
          type="checkbox"
          :checked="isEquipmentSelected(item.value)"
          @change="toggleEquipment(item.value)"
        />
        <span class="checkmark"></span>
        {{ item.label }}
      </label>

      <label class="option">
        <input
          type="checkbox"
          @change="toggleMachines"
        />
        <span class="checkmark"></span>
        Тренажеры
      </label>

      <div v-if="showMachines" class="joint-options">
        <div class="joint-header">
          <h3>Какие именно тренажеры?</h3>
          <div class="joint-subtitle">Можно выбрать несколько</div>
        </div>
        <div class="joint-grid">
          <label 
            v-for="item in machineEquipment.items" 
            :key="item.value" 
            class="joint-option"
          >
            <input
              type="checkbox"
              :checked="isEquipmentSelected(item.value)"
              @change="toggleEquipment(item.value)"
            />
            <span class="joint-checkmark"></span>
            <span class="joint-label">{{ item.label }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>