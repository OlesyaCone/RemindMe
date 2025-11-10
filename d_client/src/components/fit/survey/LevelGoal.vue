<script lang="ts">
import { defineComponent } from 'vue';
import type { UserSurveyData, ExperienceLevel, FitnessGoal } from "../../../types/fit";

interface ExperienceOption {
  value: ExperienceLevel;
  label: string;
}

interface GoalOption {
  value: FitnessGoal;
  label: string;
}

export default defineComponent({
  name: 'LevelGoal',
  props: {
    userData: {
      type: Object as () => UserSurveyData,
      required: true
    }
  },
  emits: ['update:userData'],
  data() {
    return {
      experienceOptions: [
        { value: 'beginner', label: 'Начинающий' },
        { value: 'intermediate', label: 'Средний уровень' },
        { value: 'advanced', label: 'Продвинутый' }
      ] as ExperienceOption[],
      goalOptions: [
        { value: 'weightloss', label: 'Похудение' },
        { value: 'muscle', label: 'Набор массы' },
        { value: 'fitness', label: 'Поддержание формы' }
      ] as GoalOption[]
    };
  },
  methods: {
    updateExperience(experience: ExperienceLevel) {
      this.$emit('update:userData', {
        ...this.userData,
        experience
      });
    },
    updateGoals(goals: FitnessGoal) {
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
      <label 
        v-for="option in experienceOptions" 
        :key="option.value" 
        class="option"
      >
        <input 
          type="radio" 
          name="experience"
          :checked="userData.experience === option.value"
          @change="updateExperience(option.value)"
        >
        <span class="radiomark"></span>
        {{ option.label }}
      </label>
    </div>

    <h3>Ваши цели</h3>
    <div class="options">
      <label 
        v-for="option in goalOptions" 
        :key="option.value" 
        class="option"
      >
        <input 
          type="radio" 
          name="goals"
          :checked="userData.goals.includes(option.value)"
          @change="updateGoals(option.value)"
        >
        <span class="radiomark"></span>
        {{ option.label }}
      </label>
    </div>
  </div>
</template>