export interface Reminder {
  id: string;
  _id: string;
  title: string;
  type: "daily" | "weekly" | "specific" | "after";
  time?: string;
  date?: Date;
  messageId?: number;
  chatId?: number;
  put?: boolean;
  remindId?: string | null;
  days?: (string | number)[];
  repeat?: number;
  remind?: {
    type: "text" | "file" | "media_group";
    content?: string;
    caption?: string;
    fileName?: string;
    fileUrl?: string;
    media_group_id?: string;
    items?: any[];
    entities: any[];
  };
}