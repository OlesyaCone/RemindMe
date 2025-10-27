<script lang="ts">
import { defineComponent } from "vue";
import type { UserSurveyData, NewData } from "../types/fit";
import Survey from "../components/fit/Survey.vue";
import Chat from "../components/fit/Chat.vue";
import "../styles/fit/survey.scss";
import "../styles/fit/options.scss"
import "../styles/fit/days.scss"
import "../styles/fit/joint.scss"
import "../styles/fit/chat.scss";

interface SurveyCompleteData {
  userData: UserSurveyData;
  schedules: NewData[];
}

export default defineComponent({
  name: "FitPage",
  components: {
    Survey,
    Chat,
  },
  data() {
    return {
      showSurvey: true,
      userData: {} as UserSurveyData,
      schedules: [] as NewData[]
    };
  },
  methods: {
    handleSurveyComplete(data: SurveyCompleteData) {
      this.userData = data.userData;
      this.schedules = data.schedules;
      this.showSurvey = false;
    },
    handleBackToSurvey() {
      this.showSurvey = true;
    },
  },
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
        :schedules="schedules"
        @back="handleBackToSurvey" 
      />
    </div>
  </div>
</template>