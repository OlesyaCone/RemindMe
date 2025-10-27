<script lang="ts">
import { defineComponent } from "vue";
import type { UserSurveyData, NewData } from "../../types/fit";
import Restrictions from "./survey/Restrictions.vue";
import LevelGoal from "./survey/LevelGoal.vue";
import Equipment from "./survey/Equipment.vue";
import Days from "./survey/Days.vue";

export default defineComponent({
  name: "Survey",
  components: {
    Restrictions,
    LevelGoal,
    Equipment,
    Days,
  },
  emits: ["complete"],
  inject: ["chatId"],
  data() {
    return {
      currentStep: 1,
      totalSteps: 4,
      userData: {
        healthRestrictions: [],
        jointProblems: [],
        experience: "beginner", 
        goals: [],
        equipment: [],
      } as UserSurveyData,
      schedules: [] as NewData[]
    };
  },
  computed: {
    hasJointProblems(): boolean {
      return this.userData.healthRestrictions.includes("joints");
    },
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      } else {
        this.$emit("complete", {
          userData: this.userData,
          schedules: this.schedules
        });
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    onHealthRestrictionsChange() {
      if (!this.hasJointProblems) {
        this.userData.jointProblems = [];
      }
    },
    updateUserData(newData: Partial<UserSurveyData>) {
      this.userData = { ...this.userData, ...newData };
    },
    updateSchedules(schedules: NewData[]) {
      this.schedules = schedules;
    },
    currentChatId(): string {
      return (
        (this.chatId as string) || localStorage.getItem("telegramUserId") || ""
      );
    },
  },
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
      <Restrictions
        v-if="currentStep === 1"
        :user-data="userData"
        :has-joint-problems="hasJointProblems"
        @health-restrictions-change="onHealthRestrictionsChange"
        @update:user-data="updateUserData"
      />

      <LevelGoal
        v-if="currentStep === 2"
        :user-data="userData"
        @update:user-data="updateUserData"
      />

      <Equipment
        v-if="currentStep === 3"
        :user-data="userData"
        @update:user-data="updateUserData"
      />

      <Days
        v-if="currentStep === 4"
        :user-data="userData"
        @generate-schedules="updateSchedules"
      />

      <div class="survey-actions">
        <button v-if="currentStep > 1" @click="prevStep" class="btn-secondary">
          Назад
        </button>
        <button @click="nextStep" class="btn-primary">
          {{ currentStep === totalSteps ? "Завершить" : "Далее" }}
        </button>
      </div>
    </div>
  </div>
</template>