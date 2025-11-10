export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type FitnessGoal = "weightloss" | "muscle" | "fitness";
export type EquipmentType = 
  | "dumbbell"
  | "barbell"
  | "band"
  | "roller"
  | "medicine ball"
  | "resistance band"
  | "weighted"
  | "body weight"
  | "cable"
  | "leverage machine"
  | "smith machine"
  | "stationary bike"
  | "elliptical machine"
  | "stepmill machine"
  | "assisted"
  | "sled machine"
  | "skierg machine"
  | "upper body ergometer"
  | "bosu ball"
  | "stability ball";

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