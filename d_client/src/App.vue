<script lang="ts">
import { defineComponent } from "vue";
import "./styles/main.scss";

interface Card {
  id: number;
  title: string;
  icon: string;
}

export default defineComponent({
  name: "RemindMeApp",
  data() {
    return {
      currentTheme: "dark" as "dark" | "light",
      cards: [
        { id: 1, title: "Мои напоминания", icon: "notifications" },
        { id: 2, title: "Составить программу тренировок", icon: "exercise" },
      ] as Card[],
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
    handleCardClick(card: Card): void {
      if (card.id === 1) {
        console.log("Открываем напоминания");
      } else if (card.id === 2) {
        console.log("Открываем тренировки");
      }
    },
  },
});
</script>

<template>
  <div class="remindme-app">
    <div class="remindme-header">
      <span class="remindme-title">RemindMe</span>
      <label for="theme" class="theme">
        <span class="theme__toggle-wrap">
          <input
            id="theme"
            class="theme__toggle"
            type="checkbox"
            role="switch"
            name="theme"
            :checked="currentTheme === 'light'"
            @change="toggleTheme"
          />
          <span class="theme__fill"></span>
          <span class="theme__icon">
            <span class="theme__icon-part"></span>
            <span class="theme__icon-part"></span>
            <span class="theme__icon-part"></span>
            <span class="theme__icon-part"></span>
            <span class="theme__icon-part"></span>
            <span class="theme__icon-part"></span>
            <span class="theme__icon-part"></span>
            <span class="theme__icon-part"></span>
            <span class="theme__icon-part"></span>
          </span>
        </span>
      </label>
    </div>

    <div class="remindme-content">
      <div class="remindme-cards-container">
        <div
          v-for="card in cards"
          :key="card.id"
          class="remindme-card"
          @click="handleCardClick(card)"
        >
          <div class="remindme-card-content">
            <span class="material-symbols-outlined remindme-card-icon">{{
              card.icon
            }}</span>
            <p class="remindme-card-text">{{ card.title }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>