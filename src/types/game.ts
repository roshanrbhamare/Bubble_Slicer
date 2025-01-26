export interface Bubble {
  id: string;
  x: number;
  y: number;
  radius: number;
  speed: number;
  isPoison: boolean;
  sliced: boolean;
  slicedAt: number;
  scale: number;
  opacity: number;
}

export interface GameState {
  lives: number;
  score: number;
  combo: number;
  lastComboTime: number;
  gameOver: boolean;
  bubbles: Bubble[];
  isPaused: boolean;
  level: number;
  baseSpeed: number;
}