<script lang="ts">
import { defineComponent } from "vue";
import HeaderRemind from "../components/remind/Header.vue";
import CardRemind from "../components/remind/Card.vue";
import FilterSelect from "../components/remind/FilterSelect.vue";
import AddRemind from "../components/remind/requests/AddRemind.vue";
import EditRemind from "../components/remind/requests/EditRemind.vue";
import DeleteRemind from "../components/remind/requests/DeleteRemind.vue";
import type { Reminder } from "../types/reminder";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../services/remind";
import "../styles/remind/card.scss";
import "../styles/remind/header.scss";
import "../styles/remind/modal.scss";
import "../styles/remind/select.scss";

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
  inject: ["chatId"],
  data() {
    return {
      selectedType: "all",
      selectedPeriod: "all",
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedReminder: null as Reminder | null,
      loading: false,
      error: null as string | null,
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
      reminders: [] as Reminder[],
    };
  },
  computed: {
    filteredReminders(): Reminder[] {
      return this.reminders.filter((reminder) => {
        return (
          this.selectedType === "all" || reminder.type === this.selectedType
        );
      });
    },
    currentChatId(): string {
      return (
        (this.chatId as string) || localStorage.getItem("telegramUserId") || ""
      );
    },
  },
  async mounted() {
    await this.loadReminders();
  },
  methods: {
    async loadReminders() {
      if (!this.currentChatId) {
        this.error = "Chat ID не найден";
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        this.reminders = await getReminders(this.currentChatId);
      } catch (err) {
        this.error = "Ошибка при загрузке напоминаний";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

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

    async handleAddReminder(newReminderData: Reminder) {
      try {
        const newReminder = await createReminder({
          ...newReminderData,
          chatId: this.currentChatId,
        });
        this.reminders.push(newReminder);
        this.closeModals();
      } catch (error) {
        this.error = "Ошибка при создании напоминания";
        console.error(error);
      }
    },

    async handleEditReminder(updatedReminderData: Reminder) {
      if (!this.selectedReminder) return;

      try {
        const updatedReminder = await updateReminder(
          this.selectedReminder._id,
          updatedReminderData
        );
        const index = this.reminders.findIndex(
          (r) => r._id === this.selectedReminder!._id
        );
        if (index !== -1) this.reminders[index] = updatedReminder;
        this.closeModals();
      } catch (error) {
        this.error = "Ошибка при обновлении напоминания";
        console.error(error);
      }
    },

    async handleDeleteReminder(reminder: Reminder) {
      try {
        await deleteReminder(reminder._id);
        this.reminders = this.reminders.filter((r) => r._id !== reminder._id);
        this.closeModals();
      } catch (error) {
        this.error = "Ошибка при удалении напоминания";
        console.error(error);
      }
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
      <div v-if="error" class="error-state">
        {{ error }}
        <button @click="loadReminders" class="btn btn-secondary">Повторить</button>
      </div>

      <div v-if="loading" class="loader">
        <div class="bars bar1"></div>
        <div class="bars bar2"></div>
        <div class="bars bar3"></div>
        <div class="bars bar4"></div>
        <div class="bars bar5"></div>
        <div class="bars bar6"></div>
        <div class="bars bar7"></div>
        <div class="bars bar8"></div>
        <div class="bars bar9"></div>
        <div class="bars bar10"></div>
      </div>

      <div v-if="!loading && !error">
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
          <div v-if="filteredReminders.length === 0" class="empty-state">
            Напоминаний не найдено
          </div>

          <CardRemind
            v-for="reminder in filteredReminders"
            :key="reminder._id"
            :reminder="reminder"
            @edit="openEditModal"
            @delete="openDeleteModal"
          />
        </div>
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
