<script lang="ts">
import { defineComponent } from "vue";
import HeaderRemind from "../components/remind/Header.vue";
import CardRemind from "../components/remind/Card.vue";
import FilterSelect from "../components/remind/FilterSelect.vue";
import "../styles/remind/header.scss";
import "../styles/remind/card.scss";
import "../styles/remind/select.scss";

interface Reminder {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'specific' | 'after';
  date?: Date;
  time?: string;
}

export default defineComponent({
  name: "RemindPage",
  components: {
    HeaderRemind,
    CardRemind,
    FilterSelect
  },
  data() {
    return {
      selectedType: 'all',
      selectedPeriod: 'all',
      typeOptions: [
        { value: 'all', label: 'Все' },
        { value: 'daily', label: 'Ежедневные' },
        { value: 'weekly', label: 'Еженедельные' },
        { value: 'specific', label: 'В определенную дату' },
        { value: 'after', label: 'Через несколько минут/часов' }
      ],
      periodOptions: [
        { value: 'all', label: 'Все' },
        { value: 'today', label: 'Сегодня' },
        { value: 'tomorrow', label: 'Завтра' },
        { value: 'week', label: 'Эта неделя' }
      ],
      reminder: {
        id: '1',
        title: 'Тестовое напоминание',
        type: 'daily',
        time: '09:00'
      } as Reminder
    };
  }
});
</script>

<template>
  <div class="remind-page">
    <HeaderRemind />
    <div class="remind-content">
      <div class="filters-container">
        <FilterSelect
          label="Тип напоминания"
          :options="typeOptions"
          v-model="selectedType"
        />
        <FilterSelect
          label="Период"
          :options="periodOptions"
          v-model="selectedPeriod"
        />
      </div>
      <CardRemind :reminder="reminder" />
    </div>
  </div>
</template>