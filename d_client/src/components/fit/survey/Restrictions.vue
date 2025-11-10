<script lang="ts">
import { defineComponent } from 'vue';
import type { UserSurveyData } from "../../../types/fit";

interface HealthRestriction {
  value: string;
  label: string;
}

interface JointProblem {
  value: string;
  label: string;
}

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
  data() {
    return {
      healthRestrictions: [
        { value: 'joints', label: 'Проблемы с суставами' },
        { value: 'heart', label: 'Проблемы с сердцем' },
        { value: 'pregnancy', label: 'Беременность' }
      ] as HealthRestriction[],
      jointProblems: [
        { value: 'knees', label: 'Колени' },
        { value: 'shoulders', label: 'Плечи' },
        { value: 'elbows', label: 'Локти' },
        { value: 'back', label: 'Спина' },
        { value: 'hips', label: 'Тазобедренные' },
        { value: 'ankles', label: 'Голеностопы' },
        { value: 'wrists', label: 'Кисти и запястья' }
      ] as JointProblem[]
    };
  },
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
      <label 
        v-for="restriction in healthRestrictions" 
        :key="restriction.value" 
        class="option"
      >
        <input 
          type="checkbox" 
          :checked="isHealthRestrictionSelected(restriction.value)"
          @change="toggleHealthRestriction(restriction.value)"
        >
        <span class="checkmark"></span>
        {{ restriction.label }}
      </label>

      <div v-if="hasJointProblems" class="joint-options">
        <div class="joint-header">
          <h3>Какие именно суставы?</h3>
          <div class="joint-subtitle">Можно выбрать несколько</div>
        </div>
        <div class="joint-grid">
          <label 
            v-for="problem in jointProblems" 
            :key="problem.value" 
            class="joint-option"
          >
            <input 
              type="checkbox" 
              :checked="isJointProblemSelected(problem.value)"
              @change="toggleJointProblem(problem.value)"
            >
            <span class="joint-checkmark"></span>
            <span class="joint-label">{{ problem.label }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>