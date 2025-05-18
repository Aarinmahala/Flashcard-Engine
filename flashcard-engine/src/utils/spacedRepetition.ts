import { Card, ReviewAnswer } from '../types';
import { addDays, startOfDay } from 'date-fns';

// Implementation of a simplified SM-2 algorithm
// https://en.wikipedia.org/wiki/SuperMemo#Algorithm_SM-2

// Constants
const INITIAL_EASE_FACTOR = 2.5;
const EASE_BONUS = 0.1;
const EASE_PENALTY = 0.2;
const MIN_EASE_FACTOR = 1.3;

/**
 * Calculate the next review date based on user's answer
 */
export const calculateNextReview = (card: Card, answer: ReviewAnswer): Card => {
  const now = Date.now();
  const todayStart = startOfDay(now).getTime();
  
  // Clone the card to avoid mutation
  const updatedCard = { ...card, lastReviewed: now };
  
  if (answer === 'correct') {
    // Increase the repetition counter
    updatedCard.repetitions += 1;
    
    // Calculate the new interval
    if (updatedCard.repetitions === 1) {
      updatedCard.interval = 1; // 1 day
    } else if (updatedCard.repetitions === 2) {
      updatedCard.interval = 6; // 6 days
    } else {
      updatedCard.interval = Math.round(updatedCard.interval * updatedCard.easeFactor);
    }
    
    // Increase ease factor
    updatedCard.easeFactor += EASE_BONUS;
    
    // Calculate next review date
    updatedCard.nextReview = addDays(todayStart, updatedCard.interval).getTime();
  } else {
    // Reset repetitions
    updatedCard.repetitions = 0;
    
    // Decrease ease factor
    updatedCard.easeFactor = Math.max(updatedCard.easeFactor - EASE_PENALTY, MIN_EASE_FACTOR);
    
    // Review again tomorrow
    updatedCard.interval = 1;
    updatedCard.nextReview = addDays(todayStart, 1).getTime();
  }
  
  return updatedCard;
};

/**
 * Initialize a new card with default SRS values
 */
export const initializeCardForSRS = (card: Omit<Card, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview' | 'lastReviewed'>): Card => {
  return {
    ...card,
    easeFactor: INITIAL_EASE_FACTOR,
    interval: 0, // days
    repetitions: 0,
    nextReview: Date.now(), // Due immediately
    lastReviewed: null,
    tags: card.tags || [] // Ensure tags are initialized
  };
};

/**
 * Get cards due for review today
 */
export const getDueCards = (cards: Card[], deckId?: string): Card[] => {
  const now = Date.now();
  
  return cards.filter(card => {
    // Filter by deck if deckId is provided
    if (deckId && card.deckId !== deckId) {
      return false;
    }
    
    // Cards that have never been reviewed are due
    if (card.nextReview === null) {
      return true;
    }
    
    // Cards whose next review date is in the past or today are due
    return card.nextReview <= now;
  });
}; 