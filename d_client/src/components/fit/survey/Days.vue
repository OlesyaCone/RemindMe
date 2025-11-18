<script lang="ts">
import { defineComponent } from 'vue';
import type { UserSurveyData, NewData } from "../../../types/fit";

interface DayOption {
  name: string;
  value: string;
  time: string;
}

export default defineComponent({
  name: 'Days',
  props: {
    userData: {
      type: Object as () => UserSurveyData,
      required: true
    }
  },
  emits: ['generateSchedules'],
  inject: ['chatId'],
  data() {
    return {
      daysOfWeek: [
        { name: 'Понедельник', value: 'пн', time: '18:00' },
        { name: 'Вторник', value: 'вт', time: '18:00' },
        { name: 'Среда', value: 'ср', time: '18:00' },
        { name: 'Четверг', value: 'чт', time: '18:00' },
        { name: 'Пятница', value: 'пт', time: '18:00' },
        { name: 'Суббота', value: 'сб', time: '18:00' },
        { name: 'Воскресенье', value: 'вс', time: '18:00' }
      ] as DayOption[],
      selectedDays: [] as string[]
    };
  },
  computed: {
    currentChatId(): string {
      return (this.chatId as string) || localStorage.getItem("telegramUserId") || "";
    },
    schedules(): NewData[] {
      return this.selectedDays.map(dayValue => {
        const day = this.daysOfWeek.find(d => d.value === dayValue);
        return {
          type: "weekly",
          time: day?.time || '12:00',
          chatId: Number(this.currentChatId),
          days: [dayValue],
          put: false,
          description: this.userData
        };
      });
    }
  },
  watch: {
    selectedDays() {
      this.emitSchedules();
    },
    'daysOfWeek': {
      handler() {
        this.emitSchedules();
      },
      deep: true
    }
  },
  methods: {
    toggleDay(dayValue: string) {
      const index = this.selectedDays.indexOf(dayValue);
      if (index === -1) {
        this.selectedDays.push(dayValue);
      } else {
        this.selectedDays.splice(index, 1);
        const day = this.daysOfWeek.find(d => d.value === dayValue);
        if (day) {
          day.time = '12:00';
        }
      }
    },
    emitSchedules() {
      this.$emit('generateSchedules', this.schedules);
    },
    isDaySelected(dayValue: string): boolean {
      return this.selectedDays.includes(dayValue);
    }
  }
});
</script>

<template>
  <div class="survey-step">
    <h2>Выберите дни тренировок</h2>
    <p class="step-subtitle">Отметьте дни и укажите время для каждого</p>
    
    <div class="days-container">
      <div
        v-for="day in daysOfWeek"
        :key="day.value"
        class="day-item"
        :class="{ selected: isDaySelected(day.value) }"
      >
        <label class="day-checkbox-label">
          <input 
            type="checkbox" 
            :checked="isDaySelected(day.value)"
            @change="toggleDay(day.value)"
            class="day-checkbox"
          >
          <span class="custom-checkbox"></span>
          <span class="day-name">{{ day.name }}</span>
        </label>
        
        <div 
          v-if="isDaySelected(day.value)" 
          class="time-input-container"
        >
          <label class="time-label">Время:</label>
          <input
            type="time"
            v-model="day.time"
            class="time-input"
          >
        </div>
      </div>
    </div>

    <div v-if="selectedDays.length > 0" class="selected-summary">
      <h3>Созданные напоминания:</h3>
      <div class="selected-days-list">
        <div
          v-for="dayValue in selectedDays"
          :key="dayValue"
          class="selected-day"
        >
          <span class="day-badge">{{ dayValue }}</span>
          <span class="day-time">{{ daysOfWeek.find(d => d.value === dayValue)?.time }}</span>
        </div>
      </div>
      <p class="schedule-info">Для каждого дня будет создано отдельное напоминание</p>
    </div>
  </div>
</template>