<script lang="ts">
import { defineComponent } from 'vue';

interface Reminder {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'specific' | 'after';
  date?: Date;
  time?: string;
  days?: number[];
  repeat?: number;
}

export default defineComponent({
  name: 'CardRemind',
  props: {
    reminder: {
      type: Object as () => Reminder,
      required: true
    }
  },
  computed: {
    metaText(): string {
      return `${this.reminder.type} • ${this.reminder.time}`;
    }
  },
  emits: ['edit', 'delete']
});
</script>

<template>
  <div class="card-remind">
    <div class="card-meta">{{ metaText }}</div>
    <div class="card-title">{{ reminder.title }}</div>
    <div class="card-actions">
      <span class="action-edit" @click="$emit('edit')">Изменить</span>
      <span class="action-separator"></span>
      <span class="action-delete" @click="$emit('delete')">Удалить</span>
    </div>
  </div>
</template>