<script lang="ts">
import { defineComponent } from "vue";
import "./styles/main.scss";
import AppHeader from "./components/Header.vue";
import Card from "./views/Card.vue";

export default defineComponent({
  name: "RemindMeApp",
  components: {
    AppHeader,
    Card
  },
  data() {
    return {
      currentTheme: "dark" as "dark" | "light",
    };
  },
  mounted() {
    this.applyTheme(this.currentTheme);
  },
  methods: {
    toggleTheme(): void {
      this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
      this.applyTheme(this.currentTheme);
    },
    applyTheme(theme: "dark" | "light"): void {
      document.documentElement.setAttribute("data-theme", theme);
    },
  },
});
</script>

<template>
  <div class="remindme-app">
    <AppHeader 
      :current-theme="currentTheme" 
      @theme-toggle="toggleTheme" 
    />
    
    <div class="remindme-content">
      <CardsContainer />
      <router-view />
    </div>
  </div>
</template>