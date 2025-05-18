export interface Card {
  id: string;
  front: string;
  back: string;
  deckId: string;
  tags: string[];
  lastReviewed: number | null; // timestamp
  nextReview: number | null; // timestamp
  easeFactor: number; // SM-2 ease factor, starting at 2.5
  interval: number; // days
  repetitions: number; // number of successful reviews in a row
}

export interface Deck {
  id: string;
  name: string;
  createdAt: number; // timestamp
  lastReviewed: number | null; // timestamp
}

export interface ReviewStats {
  date: number; // timestamp for the day
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface AppState {
  decks: Deck[];
  cards: Card[];
  reviewStats: ReviewStats[];
  currentDeckId: string | null;
}

export type ReviewAnswer = 'correct' | 'incorrect';

export interface DailyStats {
  date: string;
  cardsReviewed: number;
  accuracy: number;
  timestamp?: number; // added for better date comparison
}

export interface PerformanceMetrics {
  totalReviews: number;
  correctRate: number;
  averageDailyReviews: number;
  activeDecks: number;
}

export interface CardStatusCounts {
  due: number;
  learning: number;
  mastered: number;
  new: number;
}

export interface CardStatusStat {
  name: string;
  value: number;
  color: string;
} 