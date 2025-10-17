<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AddRemind',
  emits: ['save', 'close'],
  data() {
    return {
      form: {
        type: 'daily' as 'daily' | 'weekly' | 'specific' | 'after',
        time: '',
        days: [] as string[],
        remind: {
          type: 'text' as 'text',
          content: '',
          entities: [] as any[]
        }
      }
    };
  },
  methods: {
    getDayName(day: string): string {
      const days: { [key: string]: string } = {
        'пн': 'Понедельник',
        'вт': 'Вторник',
        'ср': 'Среда', 
        'чт': 'Четверг',
        'пт': 'Пятница',
        'сб': 'Суббота',
        'вс': 'Воскресенье'
      };
      return days[day] || day;
    },
    save() {
      if (this.form.remind.content.trim()) {
        this.$emit('save', this.form);
        this.$emit('close');
      }
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
        <h2 class="modal-title">Добавить текстовое напоминание</h2>
        <button class="close-button" @click="close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Текст напоминания</label>
          <textarea 
            v-model="form.remind.content"
            class="form-textarea" 
            placeholder="Введите текст напоминания"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Тип напоминания</label>
          <select v-model="form.type" class="form-select">
            <option value="daily">Ежедневное</option>
            <option value="weekly">Еженедельное</option>
            <option value="specific">В определенную дату</option>
            <option value="after">Через время</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Время</label>
          <input v-model="form.time" type="time" class="form-input">
        </div>
        
        <div v-if="form.type === 'weekly'" class="form-group">
          <label class="form-label">Дни недели</label>
          <div class="checkbox-group">
            <label class="checkbox-label" v-for="day in ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']" :key="day">
              <input type="checkbox" :value="day" v-model="form.days">
              {{ getDayName(day) }}
            </label>
          </div>
        </div>

        <div class="file-hint">
          <p>💡 Для создания напоминаний с медиа-файлами используйте Telegram бота</p>
        </div>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="close">Отмена</button>
        <button class="btn btn-primary" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
</template>