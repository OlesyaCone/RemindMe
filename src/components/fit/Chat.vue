<script lang="ts">
import { defineComponent } from "vue";

interface UserData {
  healthRestrictions: string[];
  experience: string;
  goals: string[];
  equipment: string[];
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default defineComponent({
  name: "Chat",
  props: {
    userData: {
      type: Object as () => UserData,
      required: true,
    },
  },
  emits: ["back"],
  data() {
    return {
      messages: [] as Message[],
      newMessage: "",
    };
  },
  mounted() {
    this.generateWelcomeMessage();
  },
  methods: {
    generateWelcomeMessage() {
      const welcomeText = this.generateProgram();
      this.messages.push({
        id: "1",
        text: welcomeText,
        isBot: true,
        timestamp: new Date(),
      });
    },
    generateProgram(): string {
      return `На основе ваших данных я составил программу тренировок!\n\n💪 Программа:\n- Приседания 3x15\n- Отжимания 3x12\n- Планка 3x30 сек\n\nНачнем тренировки?`;
    },
    sendMessage() {
      if (this.newMessage.trim()) {
        this.messages.push({
          id: Date.now().toString(),
          text: this.newMessage,
          isBot: false,
          timestamp: new Date(),
        });
        this.newMessage = "";
      }
    },
  },
});
</script>

<template>
  <div class="chat">
    <div class="chat-header">
      <button class="back-button" @click="$emit('back')">← Назад</button>
      <h1 class="page-title">Фитнес-тренер</h1>
      <div class="header-placeholder"></div>
    </div>
    <div class="messages-container">
      <div class="messages">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.isBot ? 'bot-message' : 'user-message']"
        >
          <div class="message-text">{{ message.text }}</div>
          <div class="message-time">
            {{
              message.timestamp.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </div>
        </div>
      </div>
    </div>

    <div class="input-container">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Введите сообщение..."
        class="message-input"
      />
      <button @click="sendMessage" class="send-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path
            fill="currentColor"
            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>
