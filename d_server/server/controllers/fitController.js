import { config } from 'dotenv';
import axios from 'axios';

config();

class FitController {
  constructor() {
    this.DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
    this.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    this.EXERCISEDB_API_KEY = process.env.EXERCISEDB_API;
    this.EXERCISEDB_URL = "https://exercisedb.p.rapidapi.com/exercises";
  }

  async getFit(req, res) {
    try {
      const userDataString = req.query.userData;
      
      if (!userDataString) {
        return res.status(400).json({ error: "userData query parameter is required" });
      }

      const userData = JSON.parse(userDataString);
      const chatId = userData.chatId || 5248929206;

      const exercises = await this.getExercisesFromExerciseDB(userData.equipment);
      const telegramSchedule = await this.generateTelegramSchedule(userData, exercises, chatId);
      
      res.json({
        success: true,
        schedule: telegramSchedule, 
        userData: userData
      });

    } catch (err) {
      console.error('Error in getFit:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getExercisesFromExerciseDB(equipmentTypes) {
    try {
      const allExercises = [];
      
      for (const equipment of equipmentTypes) {
        const response = await axios.get(
          `${this.EXERCISEDB_URL}/equipment/${equipment}`,
          {
            headers: {
              'X-RapidAPI-Key': this.EXERCISEDB_API_KEY,
              'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
          }
        );
        
        const exercisesWithEquipment = response.data.map(exercise => ({
          ...exercise,
          equipment: equipment
        }));
        
        allExercises.push(...exercisesWithEquipment);
      }
      
      return allExercises;
    } catch (error) {
      console.error('ExerciseDB API error:', error);
      throw new Error(`Failed to fetch exercises: ${error.message}`);
    }
  }

  async generateTelegramSchedule(userData, exercises, chatId) {
    try {
      const prompt = this.buildTelegramPrompt(userData, exercises, chatId);
      
      const response = await axios.post(
        this.DEEPSEEK_API_URL,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      return this.parseTelegramResponse(aiResponse);
      
    } catch (error) {
      console.error('DeepSeek API error:', error);
      return this.createFallbackSchedule(userData, exercises, chatId);
    }
  }

  buildTelegramPrompt(userData, exercises, chatId) {
    return `
Ты профессиональный фитнес-тренер. Создай программу тренировок и верни её в виде МАССИВА ОБЪЕКТОВ для Telegram бота.

ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:
- Уровень: ${userData.experience}
- Цели: ${userData.goals}
- Оборудование: ${userData.equipment.join(', ')}
- Ограничения: ${userData.healthRestrictions.join(', ') || 'нет'}
- Проблемы с суставами: ${userData.jointProblems.join(', ') || 'нет'}
- Дни тренировок: ${userData.days ? userData.days.join(', ') : '["пн", "ср", "пт"]'}
- ChatId: ${chatId}

ДОСТУПНЫЕ УПРАЖНЕНИЯ (GIF ссылки):
${exercises.slice(0, 80).map(ex => 
  `- ${ex.name} (${ex.bodyPart} → ${ex.target}): ${ex.gifUrl}`
).join('\n')}

СОЗДАЙ МАССИВ ОБЪЕКТОВ. Каждый объект - напоминание на один день.

ВЕРНИ ТОЛЬКО МАССИВ В ТАКОМ ФОРМАТЕ:
[
  {
    "type": "weekly",
    "time": "18:00",
    "chatId": ${chatId},
    "days": ["пн"],
    "put": false,
    "remind": {
      "type": "media_group",
      "media_group_id": "unique_id_1",
      "items": [
        {
          "type": "video",
          "media": "https://v2.exercisedb.io/image/AgEOB3NxdWF0.gif",
          "caption": "Тренировка на понедельник:\n\n1) Приседания\n3 подхода по 12 повторений\n\n2) Отжимания\n3 подхода по 10 повторений\n\n3) Тяга гантелей\n3 подхода по 12 повторений"
        },
        {
          "type": "video", 
          "media": "https://v2.exercisedb.io/image/BDUEOBwdXNoLnVw.gif"
        },
        {
          "type": "video",
          "media": "https://v2.exercisedb.io/image/DUEOBGR1bWJiZWxs.gif"
        }
      ]
    }
  },
  {
    "type": "weekly", 
    "time": "18:00",
    "chatId": ${chatId},
    "days": ["ср"],
    "put": false,
    "remind": {
      "type": "media_group",
      "media_group_id": "unique_id_2",
      "items": [
        {
          "type": "video",
          "media": "https://v2.exercisedb.io/image/руки.gif",
          "caption": "Тренировка на среду:\n\n1) Подтягивания\n3 подхода по 8 повторений\n\n2) Жим гантелей\n3 подхода по 10 повторений"
        }
      ]
    }
  }
]

ПРАВИЛА:
- caption ТОЛЬКО у первого элемента в items
- Используй ТОЛЬКО доступные упражнения и их GIF ссылки
- Для каждого дня тренировки создай отдельный объект в массиве
- time бери из данных пользователя или используй "18:00"
- media_group_id должен быть уникальным для каждого дня

ВЕРНИ ТОЛЬКО МАССИВ JSON БЕЗ ЛЮБОГО ДОПОЛНИТЕЛЬНОГО ТЕКСТА!
`;
  }

  parseTelegramResponse(aiResponse) {
    try {
      const arrayMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!arrayMatch) {
        throw new Error('No array found in AI response');
      }
      
      const scheduleArray = JSON.parse(arrayMatch[0]);
      
      if (!Array.isArray(scheduleArray)) {
        throw new Error('AI response is not an array');
      }
      
      return scheduleArray;
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw error;
    }
  }

  createFallbackSchedule(userData, exercises, chatId) {
    const days = userData.days || ["пн", "ср", "пт"];
    const availableExercises = exercises.slice(0, 12);
    
    return days.map((day, dayIndex) => {
      const dayExercises = availableExercises.slice(dayIndex * 4, (dayIndex + 1) * 4);
      
      const caption = `Тренировка на ${day}:\n\n` + 
        dayExercises.map((ex, idx) => 
          `${idx + 1}) ${ex.name}\n3 подхода по 10-12 повторений`
        ).join('\n\n');

      const mediaItems = dayExercises.map((ex, idx) => ({
        type: "video",
        media: ex.gifUrl,
        caption: idx === 0 ? caption : undefined
      }));

      return {
        type: "weekly",
        time: "18:00",
        chatId: parseInt(chatId),
        days: [day],
        put: false,
        remind: {
          type: "media_group", 
          media_group_id: `workout_${Date.now()}_${dayIndex}`,
          items: mediaItems
        }
      };
    });
  }
}

export default new FitController();