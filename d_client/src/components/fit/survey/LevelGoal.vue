<script lang="ts">
import { defineComponent } from 'vue';
import type { UserSurveyData } from "../../../types/fit";

export default defineComponent({
  name: 'LevelGoal',
  props: {
    userData: {
      type: Object as () => UserSurveyData,
      required: true
    }
  },
  emits: ['update:userData'],
  methods: {
    updateExperience(experience: string) {
      this.$emit('update:userData', {
        ...this.userData,
        experience
      });
    },
    updateGoals(goals: string) {
      this.$emit('update:userData', {
        ...this.userData,
        goals: [goals]
      });
    }
  }
});
</script>

<template>
  <div class="survey-step">
    <h2>Ваш опыт тренировок</h2>
    <div class="options">
      <label class="option">
        <input 
          type="radio" 
          name="experience"
          :checked="userData.experience === 'beginner'"
          @change="updateExperience('beginner')"
        >
        <span class="radiomark"></span>
        Начинающий
      </label>
      <label class="option">
        <input 
          type="radio" 
          name="experience"
          :checked="userData.experience === 'intermediate'"
          @change="updateExperience('intermediate')"
        >
        <span class="radiomark"></span>
        Средний уровень
      </label>
      <label class="option">
        <input 
          type="radio" 
          name="experience"
          :checked="userData.experience === 'advanced'"
          @change="updateExperience('advanced')"
        >
        <span class="radiomark"></span>
        Продвинутый
      </label>
    </div>

    <h3>Ваши цели</h3>
    <div class="options">
      <label class="option">
        <input 
          type="radio" 
          name="goals"
          :checked="userData.goals.includes('weightloss')"
          @change="updateGoals('weightloss')"
        >
        <span class="radiomark"></span>
        Похудение
      </label>
      <label class="option">
        <input 
          type="radio" 
          name="goals"
          :checked="userData.goals.includes('muscle')"
          @change="updateGoals('muscle')"
        >
        <span class="radiomark"></span>
        Набор массы
      </label>
      <label class="option">
        <input 
          type="radio" 
          name="goals"
          :checked="userData.goals.includes('fitness')"
          @change="updateGoals('fitness')"
        >
        <span class="radiomark"></span>
        Поддержание формы
      </label>
    </div>
  </div>
</template>