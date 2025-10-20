<script lang="ts">
import { defineComponent } from "vue";
import type { Reminder } from "../../types/reminder";

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
      form: {} as any,
    };
  },
  mounted() {
    this.form = { ...this.reminder };
    if (this.form.date instanceof Date) {
      this.form.date = this.formatDate(this.form.date);
    }
  },
  methods: {
    formatDate(date: Date): any {
      return date.toISOString().split("T")[0];
    },
    save() {
      if (this.form.title.trim()) {
        this.$emit("save", { ...this.form });
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
        <h2 class="modal-title">Изменить напоминание</h2>
        <button class="close-button" @click="close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label"
            >Текст (для добавления файлов используйте бота)</label
          >
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Введите название"
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
              />
              {{ day }}
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
