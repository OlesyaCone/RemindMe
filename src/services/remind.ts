import axios from 'axios';
import type { Reminder } from '../types/reminder';

const API_BASE_URL = 'http://localhost:3000/api'; 

export async function getReminders(chatId: string): Promise<Reminder[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/reminds`, {
      params: { chatId }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении напоминаний:', error);
    throw error;
  }
}

export async function createReminder(reminderData: Partial<Reminder> & { chatId: string }): Promise<Reminder> {
  try {
    const response = await axios.post(`${API_BASE_URL}/reminds`, reminderData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании напоминания:', error);
    throw error;
  }
}

export async function updateReminder(reminderId: string, reminderData: Partial<Reminder>): Promise<Reminder> {
  try {
    const response = await axios.put(`${API_BASE_URL}/reminds/${reminderId}`, reminderData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении напоминания:', error);
    throw error;
  }
}

export async function deleteReminder(reminderId: string): Promise<void> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/reminds/${reminderId}`);
    console.log('Успешно удалено:', response.data);
  } catch (error) {
    console.error('Ошибка при удалении напоминания:', error);
    throw error;
  }
}