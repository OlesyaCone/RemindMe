export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type FitnessGoal = "weightloss" | "muscle" | "fitness";
export type EquipmentType = "dumbbells" | "bands" | "none";

export interface UserSurveyData {
  healthRestrictions: string[];
  jointProblems: string[];
  experience: ExperienceLevel;
  goals: FitnessGoal[];
  equipment: EquipmentType[];
}

export interface NewData {
  type: string;
  time: string;
  chatId: number;
  days: string[];
  put: boolean;
  description: UserSurveyData;
}