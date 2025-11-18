import axios from 'axios';
import type { NewData, UserSurveyData } from '../types/fit';

const API_BASE_URL = 'http://127.0.0.1:3000/api';

export async function getExercises(userData: UserSurveyData): Promise<NewData[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/exercises`, {
      params: userData
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении упражнений:', error);
    throw error;
  }
}