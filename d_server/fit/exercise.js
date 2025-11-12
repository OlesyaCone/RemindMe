import "dotenv/config";

const API_KEY = process.env.ExerciseDB_API;
const BASE_URL = "https://exercisedb.p.rapidapi.com";

const headers = {
  "X-RapidAPI-Key": API_KEY,
  "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
};

class ExerciseDB {
  async getExercisesByEquipment(equipment) {
    try {
      const response = await axios.get(`${BASE_URL}/exercises`, { headers });
      const allExercises = response.data;

      const filtered = allExercises.filter((exercise) =>
        equipments.includes(exercise.equipment)
      );

      return filtered;
    } catch (error) {
      console.log(err);
    }
  }
}

export default new ExerciseDB();