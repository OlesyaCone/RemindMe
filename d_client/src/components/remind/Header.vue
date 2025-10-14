<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "HeaderRemind",
  methods: {
    addReminder() {},
  },
});
</script>

<template>
  <header class="header-remind">
    <button class="back-button" @click="$router.back()">← Назад</button>
    <h1 class="page-title">Мои напоминания</h1>

    <button class="add-button" @click="addReminder">
      <span class="add-text">
        <span>Добавить</span>
        <span>новое</span>
        <span>напоминание</span>
      </span>
    </button>
  </header>
</template>
