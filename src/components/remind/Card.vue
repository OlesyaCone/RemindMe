<script lang="ts">
import { defineComponent } from "vue";
import type { Reminder } from "../../types/reminder";

export default defineComponent({
  name: "CardRemind",
  props: {
    reminder: {
      type: Object as () => Reminder,
      required: true,
    },
  },
  computed: {
    metaText(): string {
      return `${this.reminder.type} • ${this.reminder.time || ""}`;
    },
  },
  emits: ["edit", "delete"],
});
</script>

<template>
  <div class="card-remind">
    <div class="card-meta">{{ metaText }}</div>
    <div class="card-title">{{ reminder.remind.content }}</div>
    <div class="card-actions">
      <span class="action-edit" @click="$emit('edit', reminder)">Изменить</span>
      <span class="action-separator"></span>
      <span class="action-delete" @click="$emit('delete', reminder)"
        >Удалить</span
      >
    </div>
  </div>
</template>
