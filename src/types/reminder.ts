export interface Reminder {
  id: string;
  _id: string;
  title: string;
  type: "daily" | "weekly" | "specific" | "after";
  time?: string;
  date?: string | Date; 
  messageId?: number;
  chatId?: string | number; 
  put?: boolean;
  remindId?: string | null;
  days?: string[]; 
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