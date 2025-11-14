<script lang="ts">
import { defineComponent } from "vue";
import type { WebApp } from "@twa-dev/types";
import "./styles/main.scss";
import AppHeader from "./components/Header.vue";

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

export default defineComponent({
  name: "RemindMeApp",
  components: {
    AppHeader,
  },
  data() {
    return {
      currentTheme: "dark" as "dark" | "light",
      chatId: null as string | null,
      isTelegram: false,
    };
  },
  mounted() {
    this.initTelegramWebApp();
    this.applyTheme(this.currentTheme);
  },
  methods: {
    initTelegramWebApp(): void {
      if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        this.isTelegram = true;
        
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        console.log('Telegram User:', user);
        
        if (user && user.id) {
          this.chatId = user.id.toString();
          localStorage.setItem('telegramUserId', this.chatId);
        } else {
          this.chatId = localStorage.getItem('telegramUserId');
        }
        
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
      } else {
        this.chatId = this.getChatIdFromURL() || localStorage.getItem('telegramUserId')
      }
    }, 
    
    getChatIdFromURL(): string | null {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('userId') || urlParams.get('chatId');
    },
    
    toggleTheme(): void {
      this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
      this.applyTheme(this.currentTheme);
    },
    
    applyTheme(theme: "dark" | "light"): void {
      document.documentElement.setAttribute("data-theme", theme);
    },
  },
  
  provide() {
    return {
      chatId: this.chatId,
      isTelegram: this.isTelegram
    };
  }
});
</script>

<template>
  <div class="remindme-app" :class="{ 'telegram-webapp': isTelegram }">
    <AppHeader 
      :current-theme="currentTheme" 
      @theme-toggle="toggleTheme" 
    />
    
    <div class="remindme-content">
      <router-view />
    </div>
  </div>
</template>
[file content end]