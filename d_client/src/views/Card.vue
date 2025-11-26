<script lang="ts">
import { defineComponent } from "vue";
import "../styles/card.scss"

interface Card {
  id: number;
  title: string;
  icon: string;
  to: string;
}

export default defineComponent({
  name: "CardsContainer",
  data() {
    return {
      cards: [
        {
          id: 1,
          title: "Мои напоминания",
          icon: "notifications",
          to: "/remind",
        },
      ] as Card[],
    };
  },
  methods: {
    handleCardClick(card: Card): void {
      this.$router.push(card.to);
    },
  },
});
</script>

<template>
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
</template>