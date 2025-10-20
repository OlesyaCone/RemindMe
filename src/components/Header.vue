<script lang="ts">
import { defineComponent } from "vue";
import "../styles/header.scss"

export default defineComponent({
  name: "AppHeader",
  props: {
    currentTheme: {
      type: String as () => "dark" | "light",
      required: true
    }
  },
  methods: {
    toggleTheme(): void {
      this.$emit('theme-toggle');
    }
  }
});
</script>

<template>
  <div class="remindme-header">
    <span class="remindme-title">RemindMe</span>
    <label for="theme" class="theme">
      <span class="theme__toggle-wrap">
        <input
          id="theme"
          class="theme__toggle"
          type="checkbox"
          role="switch"
          name="theme"
          :checked="currentTheme === 'light'"
          @change="toggleTheme"
        />
        <span class="theme__fill"></span>
        <span class="theme__icon">
          <span class="theme__icon-part"></span>
          <span class="theme__icon-part"></span>
          <span class="theme__icon-part"></span>
          <span class="theme__icon-part"></span>
          <span class="theme__icon-part"></span>
          <span class="theme__icon-part"></span>
          <span class="theme__icon-part"></span>
          <span class="theme__icon-part"></span>
          <span class="theme__icon-part"></span>
        </span>
      </span>
    </label>
  </div>
</template>