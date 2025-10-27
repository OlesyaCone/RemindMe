<script lang="ts">
import { defineComponent } from 'vue';
import type { UserSurveyData } from "../../../types/fit";

export default defineComponent({
  name: 'Restrictions',
  props: {
    userData: {
      type: Object as () => UserSurveyData,
      required: true
    },
    hasJointProblems: {
      type: Boolean,
      required: true
    }
  },
  emits: ['health-restrictions-change', 'update:userData'],
  methods: {
    toggleHealthRestriction(restriction: string) {
      const restrictions = [...this.userData.healthRestrictions];
      const index = restrictions.indexOf(restriction);
      
      if (index === -1) {
        restrictions.push(restriction);
      } else {
        restrictions.splice(index, 1);
      }
      
      this.$emit('update:userData', {
        ...this.userData,
        healthRestrictions: restrictions
      });
      
      if (restriction === 'joints') {
        this.$emit('health-restrictions-change');
      }
    },
    toggleJointProblem(problem: string) {
      const problems = [...this.userData.jointProblems];
      const index = problems.indexOf(problem);
      
      if (index === -1) {
        problems.push(problem);
      } else {
        problems.splice(index, 1);
      }
      
      this.$emit('update:userData', {
        ...this.userData,
        jointProblems: problems
      });
    },
    isHealthRestrictionSelected(restriction: string): boolean {
      return this.userData.healthRestrictions.includes(restriction);
    },
    isJointProblemSelected(problem: string): boolean {
      return this.userData.jointProblems.includes(problem);
    }
  }
});
</script>

<template>
  <div class="survey-step">
    <h2>Есть ли у вас ограничения по здоровью?</h2>
    <div class="options">
      <label class="option">
        <input 
          type="checkbox" 
          :checked="isHealthRestrictionSelected('joints')"
          @change="toggleHealthRestriction('joints')"
        >
        <span class="checkmark"></span>
        Проблемы с суставами
      </label>
      
      <div v-if="hasJointProblems" class="joint-options">
        <div class="joint-header">
          <h3>Какие именно суставы?</h3>
          <div class="joint-subtitle">Можно выбрать несколько</div>
        </div>
        <div class="joint-grid">
          <label class="joint-option">
            <input 
              type="checkbox" 
              :checked="isJointProblemSelected('knees')"
              @change="toggleJointProblem('knees')"
            >
            <span class="joint-checkmark"></span>
            <span class="joint-label">Колени</span>
          </label>
          <label class="joint-option">
            <input 
              type="checkbox" 
              :checked="isJointProblemSelected('shoulders')"
              @change="toggleJointProblem('shoulders')"
            >
            <span class="joint-checkmark"></span>
            <span class="joint-label">Плечи</span>
          </label>
          <label class="joint-option">
            <input 
              type="checkbox" 
              :checked="isJointProblemSelected('elbows')"
              @change="toggleJointProblem('elbows')"
            >
            <span class="joint-checkmark"></span>
            <span class="joint-label">Локти</span>
          </label>
          <label class="joint-option">
            <input 
              type="checkbox" 
              :checked="isJointProblemSelected('back')"
              @change="toggleJointProblem('back')"
            >
            <span class="joint-checkmark"></span>
            <span class="joint-label">Спина</span>
          </label>
          <label class="joint-option">
            <input 
              type="checkbox" 
              :checked="isJointProblemSelected('hips')"
              @change="toggleJointProblem('hips')"
            >
            <span class="joint-checkmark"></span>
            <span class="joint-label">Тазобедренные</span>
          </label>
          <label class="joint-option">
            <input 
              type="checkbox" 
              :checked="isJointProblemSelected('ankles')"
              @change="toggleJointProblem('ankles')"
            >
            <span class="joint-checkmark"></span>
            <span class="joint-label">Голеностопы</span>
          </label>
          <label class="joint-option">
            <input 
              type="checkbox" 
              :checked="isJointProblemSelected('wrists')"
              @change="toggleJointProblem('wrists')"
            >
            <span class="joint-checkmark"></span>
            <span class="joint-label">Кисти и запястья</span>
          </label>
        </div>
      </div>

      <label class="option">
        <input 
          type="checkbox" 
          :checked="isHealthRestrictionSelected('heart')"
          @change="toggleHealthRestriction('heart')"
        >
        <span class="checkmark"></span>
        Проблемы с сердцем
      </label>
      <label class="option">
        <input 
          type="checkbox" 
          :checked="isHealthRestrictionSelected('pregnancy')"
          @change="toggleHealthRestriction('pregnancy')"
        >
        <span class="checkmark"></span>
        Беременность
      </label>
      <label class="option">
        <input 
          type="checkbox" 
          :checked="isHealthRestrictionSelected('injuries')"
          @change="toggleHealthRestriction('injuries')"
        >
        <span class="checkmark"></span>
        Недавние травмы
      </label>
    </div>
  </div>
</template>