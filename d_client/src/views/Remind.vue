<script lang="ts">
import { defineComponent } from "vue";
import HeaderRemind from "../components/remind/Header.vue";
import CardRemind from "../components/remind/Card.vue";
import FilterSelect from "../components/remind/FilterSelect.vue";
import AddRemind from "../components/remind/AddRemind.vue";
import EditRemind from "../components/remind/EditRemind.vue";
import DeleteRemind from "../components/remind/DeleteRemind.vue";
import "../styles/remind/header.scss";
import "../styles/remind/card.scss";
import "../styles/remind/select.scss";
import "../styles/remind/modal.scss";

interface MediaItem {
  type: 'photo' | 'video' | 'audio' | 'voice' | 'document';
  file_id: string;
}

interface Reminder {
  _id: string;
  type: "daily" | "weekly" | "specific" | "after";
  time: string;
  messageId: number;
  chatId: number;
  put: boolean;
  remindId: string | null;
  days?: string[];
  remind: {
    type: "text" | "file" | "media_group";
    content?: string;
    caption?: string;
    fileName?: string;
    fileUrl?: string;
    media_group_id?: string;
    items?: MediaItem[];
    entities: any[];
  };
}

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
          _id: "1",
          type: "daily",
          time: "09:00",
          messageId: 5096,
          chatId: 5248929206,
          put: false,
          remindId: null,
          remind: {
            type: "text",
            content: "Тестовое напоминание",
            entities: [],
          },
        },
        {
          _id: "2",
          type: "weekly",
          time: "19:00",
          messageId: 5247,
          chatId: 5248929206,
          put: false,
          remindId: null,
          days: ["пн", "ср", "пт"],
          remind: {
            type: "text",
            content: "Тренировка",
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
      const reminder: Reminder = {
        _id: Date.now().toString(), 
        type: newReminder.type,
        time: newReminder.time,
        messageId: Date.now(),
        chatId: 5248929206,
        put: false,
        remindId: null,
        days: newReminder.days,
        remind: {
          type: 'text',
          content: newReminder.remind.content,
          entities: []
        }
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