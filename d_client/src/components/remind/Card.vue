<script lang="ts">
import { defineComponent } from 'vue';

interface MediaItem {
  type: 'photo' | 'video' | 'audio' | 'voice' | 'document';
  file_id: string;
}

interface Reminder {
  _id: string;
  type: 'daily' | 'weekly' | 'specific' | 'after';
  time: string;
  messageId: number;
  chatId: number;
  put: boolean;
  remindId: string | null;
  days?: string[];
  remind: {
    type: 'text' | 'file' | 'media_group';
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
  name: 'CardRemind',
  props: {
    reminder: {
      type: Object as () => Reminder,
      required: true
    }
  },
  computed: {
    metaText(): string {
      const daysText = this.reminder.days && this.reminder.days.length > 0 
        ? ` • ${this.reminder.days.join(', ')}`
        : '';
      return `${this.reminder.type} • ${this.reminder.time}${daysText}`;
    },
    displayContent(): string {
      const remind = this.reminder.remind;
      
      if (remind.type === 'media_group') {
        const itemCount = remind.items?.length || 0;
        const mediaTypes = remind.items?.map(item => item.type) || [];
        const uniqueTypes = [...new Set(mediaTypes)];
        const caption = remind.caption ? ` • ${remind.caption}` : '';
        return `📁 Медиа-группа (${itemCount} файлов: ${uniqueTypes.join(', ')})${caption}`;
      }
      
      if (remind.type === 'file') {
        return `📎 Файл: ${remind.fileName || 'файл'}`;
      }
      
      return remind.content || remind.caption || 'Нет содержания';
    },
    isMediaGroup(): boolean {
      return this.reminder.remind.type === 'media_group';
    },
    isFile(): boolean {
      return this.reminder.remind.type === 'file';
    }
  },
  emits: ['edit', 'delete']
});
</script>

<template>
  <div class="card-remind">
    <div class="card-meta">{{ metaText }}</div>
    <div class="card-content">
      <span v-if="isMediaGroup" class="media-badge">📁 МЕДИА</span>
      <span v-else-if="isFile" class="file-badge">📎 ФАЙЛ</span>
      {{ displayContent }}
    </div>
    <div class="card-actions">
      <span class="action-edit" @click="$emit('edit', reminder)">Изменить</span>
      <span class="action-separator"></span>
      <span class="action-delete" @click="$emit('delete', reminder)">Удалить</span>
    </div>
  </div>
</template>