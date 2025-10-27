<script lang="ts">
import { defineComponent } from 'vue';

interface UserData {
  healthRestrictions: string[];
  experience: string;
  goals: string[];
  equipment: string[];
}

export default defineComponent({
  name: 'Survey',
  emits: ['complete'],
  data() {
    return {
      currentStep: 1,
      totalSteps: 3,
      userData: {
        healthRestrictions: [],
        experience: '',
        goals: [],
        equipment: []
      } as UserData
    };
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      } else {
        this.$emit('complete', this.userData);
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    toggleArrayItem(array: string[], item: string) {
      const index = array.indexOf(item);
      if (index === -1) {
        array.push(item);
      } else {
        array.splice(index, 1);
      }
    }
  }
});
</script>

<template>
  <div class="survey">
    <div class="survey-header">
      <button class="back-button" @click="$router.back()">← Назад</button>
      <h1 class="page-title">Фитнес-тренер</h1>
      <div class="progress">Шаг {{ currentStep }} из {{ totalSteps }}</div>
    </div>

    <div class="survey-content">
      <div v-if="currentStep === 1" class="survey-step">
        <h2>Есть ли у вас ограничения по здоровью?</h2>
        <div class="options">
          <label class="option">
            <input type="checkbox" v-model="userData.healthRestrictions" value="joints">
            Проблемы с суставами
          </label>
          <label class="option">
            <input type="checkbox" v-model="userData.healthRestrictions" value="heart">
            Проблемы с сердцем
          </label>
          <label class="option">
            <input type="checkbox" v-model="userData.healthRestrictions" value="pregnancy">
            Беременность
          </label>
          <label class="option">
            <input type="checkbox" v-model="userData.healthRestrictions" value="injuries">
            Недавние травмы
          </label>
        </div>
      </div>

      <div v-if="currentStep === 2" class="survey-step">
        <h2>Ваш опыт тренировок</h2>
        <div class="options">
          <label class="option">
            <input type="radio" v-model="userData.experience" value="beginner">
            Начинающий
          </label>
          <label class="option">
            <input type="radio" v-model="userData.experience" value="intermediate">
            Средний уровень
          </label>
          <label class="option">
            <input type="radio" v-model="userData.experience" value="advanced">
            Продвинутый
          </label>
        </div>

        <h3>Ваши цели</h3>
        <div class="options">
          <label class="option">
            <input type="checkbox" v-model="userData.goals" value="weightloss">
            Похудение
          </label>
          <label class="option">
            <input type="checkbox" v-model="userData.goals" value="muscle">
            Набор массы
          </label>
          <label class="option">
            <input type="checkbox" v-model="userData.goals" value="fitness">
            Поддержание формы
          </label>
        </div>
      </div>

      <div v-if="currentStep === 3" class="survey-step">
        <h2>Какое оборудование есть?</h2>
        <div class="options">
          <label class="option">
            <input type="checkbox" v-model="userData.equipment" value="dumbbells">
            Гантели
          </label>
          <label class="option">
            <input type="checkbox" v-model="userData.equipment" value="bands">
            Эспандеры
          </label>
          <label class="option">
            <input type="checkbox" v-model="userData.equipment" value="mat">
            Коврик
          </label>
          <label class="option">
            <input type="checkbox" v-model="userData.equipment" value="none">
            Ничего нет
          </label>
        </div>
      </div>

      <div class="survey-actions">
        <button v-if="currentStep > 1" @click="prevStep" class="btn-secondary">
          Назад
        </button>
        <button @click="nextStep" class="btn-primary">
          {{ currentStep === totalSteps ? 'Завершить' : 'Далее' }}
        </button>
      </div>
    </div>
  </div>
</template>