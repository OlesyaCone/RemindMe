<script lang="ts">
import { defineComponent } from "vue";
import Survey from "../components/fit/Survey.vue";
import Chat from "../components/fit/Chat.vue";
import "../styles/fit/survey.scss";
import "../styles/fit/chat.scss";

interface UserData {
  healthRestrictions: string[];
  experience: string;
  goals: string[];
  equipment: string[];
}

export default defineComponent({
  name: "FitPage",
  components: {
    Survey,
    Chat
  },
  data() {
    return {
      showSurvey: true,
      userData: {} as UserData
    };
  },
  methods: {
    handleSurveyComplete(data: UserData) {
      this.userData = data;
      this.showSurvey = false;
    },
    handleBackToSurvey() {
      this.showSurvey = true;
    }
  }
});
</script>

<template>
  <div class="fit-page">
    <div v-if="showSurvey">
      <Survey @complete="handleSurveyComplete" />
    </div>
    <div v-else>
      <Chat 
        :user-data="userData" 
        @back="handleBackToSurvey" 
      />
    </div>
  </div>
</template>

<style scoped>
.fit-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
}
</style>