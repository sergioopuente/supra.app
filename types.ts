
export type MoodLevel = number; // 0 to 100

export interface CheckIn {
  id: string;
  timestamp: number;
  mood: MoodLevel;
  tags: string[];
  note?: string;
  activity?: string;
}

export enum TonalOption {
  SPIRITUAL = 'Espiritual',
  PRAGMATIC = 'Pragmático'
}

export interface UserState {
  name: string;
  streak: number;
  lastCheckIn?: CheckIn;
  history: CheckIn[];
  preferences: {
    tone: TonalOption;
    goals: string[];
  };
}
