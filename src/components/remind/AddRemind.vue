<script lang="ts">
import { defineComponent } from "vue";

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
    };
  },
  methods: {
    save() {
      if (this.form.title.trim()) {
        const reminderData: any = {
          title: this.form.title,
          type: this.form.type,
          remind: {
            type: "text" as const,
            content: this.form.title,
            entities: []
          }
        };

        switch (this.form.type) {
          case "specific":
            reminderData.date = this.form.date;
            reminderData.time = this.form.time;
            break;
          
          case "weekly":
            reminderData.time = this.form.time;
            reminderData.days = this.form.days;
            break;
          
          case "daily":
            reminderData.time = this.form.time;
            break;
          
          case "after":
            reminderData.repeat = this.form.repeat;
            break;
        }
        
        this.$emit("save", reminderData);
        this.$emit("close");
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
        <button class="close-button" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Название</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Введите название напоминания"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Тип</label>
          <select v-model="form.type" class="form-select">
            <option value="daily">Ежедневное</option>
            <option value="weekly">Еженедельное</option>
            <option value="specific">В определенную дату</option>
            <option value="after">Через время</option>
          </select>
        </div>

        <div v-if="form.type === 'specific'" class="form-group">
          <label class="form-label">Дата</label>
          <input v-model="form.date" type="date" class="form-input" />
        </div>

        <div v-if="form.type !== 'after'" class="form-group">
          <label class="form-label">Время</label>
          <input v-model="form.time" type="time" class="form-input" />
        </div>

        <div v-if="form.type === 'after'" class="form-group">
          <label class="form-label">Через (минут)</label>
          <input
            v-model="form.repeat"
            type="number"
            class="form-input"
            min="1"
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
              <input type="checkbox" :value="day.value" v-model="form.days" />
              {{ day.name }}
            </label>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" @click="close">Отмена</button>
        <button class="btn btn-primary" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
</template>