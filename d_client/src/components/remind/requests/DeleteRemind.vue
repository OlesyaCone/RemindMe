<script lang="ts">
import { defineComponent } from 'vue';
import type { Reminder } from "../../../types/reminder";

export default defineComponent({
  name: 'DeleteRemind',
  props: {
    reminder: {
      type: Object as () => Reminder,
      required: true,
    },
  },
  emits: ['confirm', 'close'],
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async confirm() {
      this.loading = true;
      try {
        this.$emit('confirm', this.reminder);
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      } finally {
        this.loading = false;
      }
    },
    close() {
      this.$emit('close');
    },
  },
});
</script>

<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Удалить напоминание</h2>
        <button class="close-button" @click="close" :disabled="loading">×</button>
      </div>
      <div class="modal-body">
        <p>Вы уверены, что хотите удалить напоминание "{{ reminder.remind?.content }}"?</p>
        <p class="text-muted">{{ reminder.type }} • {{ reminder.time || '' }}</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="close" :disabled="loading">Отмена</button>
        <button class="btn btn-danger" @click="confirm" :disabled="loading">
          {{ loading ? 'Удаление...' : 'Удалить' }}
        </button>
      </div>
    </div>
  </div>
</template>