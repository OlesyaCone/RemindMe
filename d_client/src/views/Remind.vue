<script lang="ts">
import { defineComponent } from "vue";
import HeaderRemind from "../components/remind/Header.vue";
import CardRemind from "../components/remind/Card.vue";
import FilterSelect from "../components/remind/FilterSelect.vue";
import AddRemind from "../components/remind/AddRemind.vue";
import EditRemind from "../components/remind/EditRemind.vue";
import DeleteRemind from "../components/remind/DeleteRemind.vue";
import type { Reminder } from "../types/reminder";
import "../styles/remind/header.scss";
import "../styles/remind/card.scss";
import "../styles/remind/select.scss";
import "../styles/remind/modal.scss";

export default defineComponent({
  name: "RemindPage",
  components: {
    HeaderRemind,
    CardRemind,
    FilterSelect,
    AddRemind,
    EditRemind,
    DeleteRemind,
  },
  data() {
    return {
      selectedType: "all",
      selectedPeriod: "all",
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedReminder: null as Reminder | null,
      typeOptions: [
        { value: "all", label: "Все" },
        { value: "daily", label: "Ежедневные" },
        { value: "weekly", label: "Еженедельные" },
        { value: "specific", label: "В определенную дату" },
        { value: "after", label: "Через несколько минут/часов" },
      ],
      periodOptions: [
        { value: "all", label: "Все" },
        { value: "today", label: "Сегодня" },
        { value: "tomorrow", label: "Завтра" },
        { value: "week", label: "Эта неделя" },
      ],
      reminders: [
        {
          id: "1",
          _id: "1",
          title: "Тренировка",
          type: "weekly",
          time: "20:00",
          chatId: 5248929206,
          messageId: 5161,
          days: ["ср"], 
          put: false,
          remindId: null,
          remind: {
            type: "text",
            content: "📅 СРЕДА (Дом) - Кардио + Стабильность кора\n\n1. Велотренажер: 20 минут\n2. Боковая планка: 3 подхода по 30-45 секунд на сторону\n3. Птица-собака: 3 подхода по 10 раз на сторону\n4. Ягодичный мостик: 3 подхода по 20 раз\n5. Вис на перекладине: 3 подхода на максимум",
            entities: [],
          },
        },
      ] as Reminder[],
    };
  },
  computed: {
    filteredReminders() {
      return this.reminders.filter((reminder) => {
        const typeMatch =
          this.selectedType === "all" || reminder.type === this.selectedType;
        return typeMatch;
      });
    },
  },
  methods: {
    openAddModal() {
      this.showAddModal = true;
    },
    openEditModal(reminder: Reminder) {
      this.selectedReminder = reminder;
      this.showEditModal = true;
    },
    openDeleteModal(reminder: Reminder) {
      this.selectedReminder = reminder;
      this.showDeleteModal = true;
    },
    handleAddReminder(newReminder: any) {
      const reminderId = Date.now().toString();
      const reminder: Reminder = {
        id: reminderId,
        _id: reminderId,
        title: newReminder.title || "Новое напоминание",
        type: newReminder.type,
        time: newReminder.time,
        messageId: Date.now(),
        chatId: 5248929206,
        put: false,
        remindId: null,
        days: newReminder.days,
        date: newReminder.date,
        repeat: newReminder.repeat,
        remind: {
          type: "text",
          content: newReminder.content || newReminder.remind?.content || "",
          entities: [],
        },
      };
      this.reminders.push(reminder);
      this.closeModals();
    },
    handleEditReminder(updatedReminder: Reminder) {
      const index = this.reminders.findIndex(
        (r) => r._id === updatedReminder._id
      );
      if (index !== -1) {
        this.reminders[index] = updatedReminder;
      }
      this.closeModals();
    },
    handleDeleteReminder(reminder: Reminder) {
      this.reminders = this.reminders.filter((r) => r._id !== reminder._id);
      this.closeModals();
    },
    closeModals() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.showDeleteModal = false;
      this.selectedReminder = null;
    },
  },
});
</script>

<template>
  <div class="remind-page">
    <HeaderRemind @add-reminder="openAddModal" />

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

      <div class="reminders-list">
        <CardRemind
          v-for="reminder in filteredReminders"
          :key="reminder._id"
          :reminder="reminder"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />
      </div>
    </div>

    <AddRemind
      v-if="showAddModal"
      @save="handleAddReminder"
      @close="closeModals"
    />

    <EditRemind
      v-if="showEditModal && selectedReminder"
      :reminder="selectedReminder"
      @save="handleEditReminder"
      @close="closeModals"
    />

    <DeleteRemind
      v-if="showDeleteModal && selectedReminder"
      :reminder="selectedReminder"
      @confirm="handleDeleteReminder"
      @close="closeModals"
    />
  </div>
</template>