<script lang="ts">
import { defineComponent } from 'vue';

interface Reminder {
  id: string;
  title: string;
  type: string;
  time?: string;
}

export default defineComponent({
  name: 'DeleteRemind',
  props: {
    reminder: {
      type: Object as () => Reminder,
      required: true
    }
  },
  emits: ['confirm', 'close'],
  methods: {
    confirm() {
      this.$emit('confirm', this.reminder);
      this.$emit('close');
    },
    close() {
      this.$emit('close');
    }
  }
});
</script>

<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Удалить напоминание</h2>
        <button class="close-button" @click="close">×</button>
      </div>
      
      <div class="modal-body">
        <p>Вы уверены, что хотите удалить напоминание "{{ reminder.title }}"?</p>
        <p class="text-muted">{{ reminder.type }} • {{ reminder.time }}</p>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="close">Отмена</button>
        <button class="btn btn-danger" @click="confirm">Удалить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-muted {
  color: var(--text-secondary);
  margin-top: 0.5rem;
}
</style>