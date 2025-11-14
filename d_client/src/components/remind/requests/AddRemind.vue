<script lang="ts">
import { defineComponent } from "vue";
import type { Reminder } from "../../../types/reminder";

interface ReminderForm {
  title: string;
  type: "daily" | "weekly" | "specific" | "after";
  date: string;
  time: string;
  days: string[];
  repeat: number;
}

export default defineComponent({
  name: "AddRemind",
  emits: ["save", "close"],
  data() {
    return {
      form: {
        title: "",
        type: "daily",
        date: "",
        time: "",
        days: [] as string[],
        repeat: 0,
      } as ReminderForm,
      loading: false,
    };
  },
  methods: {
    async save() {
      if (!this.form.title.trim()) {
        alert("Пожалуйста, введите название напоминания");
        return;
      }

      this.loading = true;

      try {
        const reminderData: Partial<Reminder> = {
          type: this.form.type,
          remind: {
            type: "text",
            content: this.form.title,
            entities: []
          }
        };

        switch (this.form.type) {
          case "specific":
            if (this.form.date) {
              reminderData.date = new Date(this.form.date);
            }
            if (this.form.time) {
              reminderData.time = this.form.time;
            }
            break;
          
          case "weekly":
            if (this.form.time) {
              reminderData.time = this.form.time;
            }
            if (this.form.days.length > 0) {
              reminderData.days = this.form.days;
            }
            break;
          
          case "daily":
            if (this.form.time) {
              reminderData.time = this.form.time;
            }
            break;
          
          case "after":
            if (this.form.repeat) {
              reminderData.repeat = this.form.repeat;
            }
            break;
        }
        
        this.$emit("save", reminderData);
        this.$emit("close");
      } catch (error) {
        console.error('Ошибка при создании напоминания:', error);
        alert('Не удалось создать напоминание');
      } finally {
        this.loading = false;
      }
    },
    
    close() {
      this.$emit("close");
    },
  },
});
</script>

<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Добавить напоминание</h2>
        <button class="close-button" @click="close" :disabled="loading">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Название</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Введите название напоминания"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Тип</label>
          <select v-model="form.type" class="form-select" :disabled="loading">
            <option value="daily">Ежедневное</option>
            <option value="weekly">Еженедельное</option>
            <option value="specific">В определенную дату</option>
            <option value="after">Через время</option>
          </select>
        </div>

        <div v-if="form.type === 'specific'" class="form-group">
          <label class="form-label">Дата</label>
          <input v-model="form.date" type="date" class="form-input" :disabled="loading" />
        </div>

        <div v-if="form.type !== 'after'" class="form-group">
          <label class="form-label">Время</label>
          <input v-model="form.time" type="time" class="form-input" :disabled="loading" />
        </div>

        <div v-if="form.type === 'after'" class="form-group">
          <label class="form-label">Через (минут)</label>
          <input
            v-model="form.repeat"
            type="number"
            class="form-input"
            min="1"
            :disabled="loading"
          />
        </div>

        <div v-if="form.type === 'weekly'" class="form-group">
          <label class="form-label">Дни недели</label>
          <div class="checkbox-group">
            <label
              v-for="day in [
                { name: 'Понедельник', value: 'пн' },
                { name: 'Вторник', value: 'вт' },
                { name: 'Среда', value: 'ср' },
                { name: 'Четверг', value: 'чт' },
                { name: 'Пятница', value: 'пт' },
                { name: 'Суббота', value: 'сб' },
                { name: 'Воскресенье', value: 'вс' },
              ]"
              :key="day.value"
              class="checkbox-label"
            >
              <input 
                type="checkbox" 
                :value="day.value" 
                v-model="form.days" 
                :disabled="loading"
              />
              {{ day.name }}
            </label>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" @click="close" :disabled="loading">Отмена</button>
        <button class="btn btn-primary" @click="save" :disabled="loading">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </div>
  </div>
</template>