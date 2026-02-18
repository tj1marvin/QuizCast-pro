
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  points: number;
  timeLimit: number; // in seconds
  category?: string;
}

export type AnimationStyle = 'fade' | 'slide' | 'zoom';

export enum GameStatus {
  IDLE = 'IDLE',
  WAITING = 'WAITING',
  SHOWING_QUESTION = 'SHOWING_QUESTION',
  REVEALING_ANSWER = 'REVEALING_ANSWER',
  GAME_OVER = 'GAME_OVER'
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  status: GameStatus;
  lastUpdate: number;
  animationStyle: AnimationStyle;
}

export interface SyncMessage {
  type: 'SYNC_STATE';
  payload: QuizState;
}
