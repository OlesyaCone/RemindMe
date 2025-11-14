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
  name: "EditRemind",
  props: {
    reminder: {
      type: Object as () => Reminder,
      required: true,
    },
  },
  emits: ["save", "close"],
  data() {
    return {
      form: {
        title: "",
        type: "daily" as "daily" | "weekly" | "specific" | "after",
        date: "",
        time: "",
        days: [] as string[],
        repeat: 0,
      } as ReminderForm,
      loading: false,
    };
  },
  mounted() {
    this.initializeForm();
  },
  methods: {
    initializeForm() {
      this.form.title = this.reminder.remind.content || "";
      this.form.type = this.reminder.type;
      this.form.time = this.reminder.time || ""; 
      this.form.repeat = this.reminder.repeat || 0;

      if (this.reminder.date) {
        const date = new Date(this.reminder.date);
        this.form.date = date.toISOString().slice(0, 10);
      }

      if (this.reminder.days) {
        this.form.days = [...this.reminder.days];
      }
    },

    async save() {
      if (!this.form.title.trim()) {
        alert("Введите текст напоминания");
        return;
      }

      this.loading = true;

      try {
        const reminderData: Partial<Reminder> = {
          type: this.form.type,
          time: this.form.time || undefined,
          repeat: this.form.repeat || undefined,
          remind: {
            type: "text",
            content: this.form.title,
            entities: this.reminder.remind?.entities || [],
          },
        };

        if (this.form.type === "specific" && this.form.date) {
          reminderData.date = new Date(this.form.date);
        } else {
          reminderData.date = undefined;
        }

        if (this.form.type === "weekly") {
          reminderData.days = this.form.days;
        } else {
          reminderData.days = undefined;
        }
        this.$emit("save", reminderData);
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert('Ошибка при обновлении напоминания');
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
        <h2 class="modal-title">Изменить напоминание</h2>
        <button class="close-button" @click="close" :disabled="loading">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Текст</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Введите название"
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
            v-model.number="form.repeat"
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
              v-for="(day, idx) in [
                'Понедельник',
                'Вторник',
                'Среда',
                'Четверг',
                'Пятница',
                'Суббота',
                'Воскресенье',
              ]"
              :key="idx"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'][idx]"
                v-model="form.days"
                :disabled="loading"
              />
              {{ day }}
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