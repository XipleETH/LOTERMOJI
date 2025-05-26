export interface ChatMessage {
  id: string;
  user_id: string;
  emojis: string[];
  created_at: string;
}

export interface Ticket {
  id: string;
  numbers: string[];
  timestamp: number;
}

export interface GameResult {
  id: string;
  timestamp: number;
  winningNumbers: string[];
  firstPrize: Ticket[];
  secondPrize: Ticket[];
  thirdPrize: Ticket[];
}

export interface GameState {
  winningNumbers: string[];
  tickets: Ticket[];
  lastResults: {
    firstPrize: Ticket[];
    secondPrize: Ticket[];
    thirdPrize: Ticket[];
  } | null;
  timeRemaining: number;
  gameStarted: boolean;
}