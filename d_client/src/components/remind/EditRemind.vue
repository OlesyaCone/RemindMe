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
  name: 'EditRemind',
  props: {
    reminder: {
      type: Object as () => Reminder,
      required: true
    }
  },
  emits: ['save', 'close'],
  data() {
    return {
      form: {
        _id: '',
        type: 'daily' as 'daily' | 'weekly' | 'specific' | 'after',
        time: '',
        messageId: 0,
        chatId: 0,
        put: false,
        remindId: null as string | null,
        days: [] as string[],
        remind: {
          type: 'text' as 'text' | 'file' | 'media_group',
          content: '',
          caption: '',
          fileName: '',
          fileUrl: '',
          media_group_id: '',
          items: [] as MediaItem[],
          entities: [] as any[]
        }
      }
    };
  },
  mounted() {
    this.form = { ...this.reminder };
    this.form.days = this.reminder.days ? [...this.reminder.days] : [];
    
    if (this.isMediaGroup) {
      this.form.remind.content = this.reminder.remind.caption || '';
    } else if (this.isFile) {
      this.form.remind.content = `Файл: ${this.reminder.remind.fileName || 'файл'}`;
    } else {
      this.form.remind.content = this.reminder.remind.content || '';
    }
  },
  computed: {
    isMediaGroup(): boolean {
      return this.form.remind.type === 'media_group';
    },
    isFile(): boolean {
      return this.form.remind.type === 'file';
    },
    isEditable(): boolean {
      return this.form.remind.type === 'text';
    },
    mediaInfo(): string {
      if (this.isMediaGroup) {
        const items = this.form.remind.items || [];
        const types = items.map(item => item.type);
        const uniqueTypes = [...new Set(types)];
        return `${items.length} файлов (${uniqueTypes.join(', ')})`;
      }
      return '';
    }
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
      if (this.form.remind.content.trim() || !this.isEditable) {
        const saveData: Reminder = { ...this.form };
        
        if (!this.isEditable) {
          saveData.remind.content = this.reminder.remind.content;
          saveData.remind.caption = this.reminder.remind.caption;
        }
        
        this.$emit('save', saveData);
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
        <h2 class="modal-title">
          <span v-if="isMediaGroup">📁 Медиа-группа</span>
          <span v-else-if="isFile">📎 Файл</span>
          <span v-else>Изменить напоминание</span>
        </h2>
        <button class="close-button" @click="close">×</button>
      </div>
      
      <div class="modal-body">
        <div v-if="isMediaGroup" class="media-notice">
          <p>📁 Медиа-группа</p>
          <p class="media-info">{{ mediaInfo }}</p>
          <p class="file-hint">Для изменения медиа-файлов используйте Telegram бота</p>
        </div>

        <div v-else-if="isFile" class="file-notice">
          <p>📎 Файловое напоминание</p>
          <p class="file-name">{{ reminder.remind.fileName }}</p>
          <p class="file-hint">Для изменения файла используйте Telegram бота</p>
        </div>

        <div class="form-group">
          <label class="form-label">
            {{ isMediaGroup ? 'Подпись к медиа' : 'Текст напоминания' }}
          </label>
          <textarea 
            v-model="form.remind.content"
            class="form-textarea" 
            :placeholder="isMediaGroup ? 'Подпись к медиа-группе' : 'Введите текст напоминания'"
            rows="3"
            :disabled="!isEditable"
          ></textarea>
          <div v-if="!isEditable" class="disabled-hint">
            {{ isMediaGroup ? 'Подпись можно изменить' : 'Текст доступен только для просмотра' }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Тип напоминания</label>
          <select v-model="form.type" class="form-select" :disabled="!isEditable">
            <option value="daily">Ежедневное</option>
            <option value="weekly">Еженедельное</option>
            <option value="specific">В определенную дату</option>
            <option value="after">Через время</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Время</label>
          <input v-model="form.time" type="time" class="form-input" :disabled="!isEditable">
        </div>
        
        <div v-if="form.type === 'weekly'" class="form-group">
          <label class="form-label">Дни недели</label>
          <div class="checkbox-group">
            <label class="checkbox-label" v-for="day in ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']" :key="day">
              <input 
                type="checkbox" 
                :value="day" 
                v-model="form.days"
                :disabled="!isEditable"
              >
              {{ getDayName(day) }}
            </label>
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="close">Отмена</button>
        <button 
          class="btn btn-primary" 
          @click="save"
        >
          {{ isEditable ? 'Сохранить' : 'Сохранить подпись' }}
        </button>
      </div>
    </div>
  </div>
</template>