import { AppState, Card, Deck, ReviewStats } from '../types';

// Storage keys
const STORAGE_KEY = 'flashcard-engine-data';

// Default state
const defaultState: AppState = {
  decks: [],
  cards: [],
  reviewStats: [],
  currentDeckId: null,
};

/**
 * Safely parse JSON with error handling
 */
const safeJSONParse = (json: string | null): any => {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
};

/**
 * Check if browser supports localStorage
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
};

/**
 * Save the entire app state to localStorage
 */
export const saveState = (state: AppState): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

/**
 * Load the app state from localStorage
 */
export const loadState = (): AppState => {
  if (!isLocalStorageAvailable()) return defaultState;
  
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return defaultState;
    }
    
    const parsedState = safeJSONParse(serializedState);
    if (!parsedState) return defaultState;
    
    // Validate the parsed state has the expected structure
    if (!parsedState.decks || !Array.isArray(parsedState.decks) ||
        !parsedState.cards || !Array.isArray(parsedState.cards) ||
        !parsedState.reviewStats || !Array.isArray(parsedState.reviewStats)) {
      console.error('Invalid state structure in localStorage');
      return defaultState;
    }
    
    // Migration for older versions without tags
    const migratedCards = parsedState.cards.map(card => {
      if (!card) return null;
      if (!('tags' in card)) {
        return {
          ...card,
          tags: []
        };
      }
      return card;
    }).filter(Boolean) as Card[];
    
    return {
      ...parsedState,
      cards: migratedCards
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return defaultState;
  }
};

/**
 * Save a deck to localStorage
 */
export const saveDeck = (deck: Deck): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const state = loadState();
    const existingDeckIndex = state.decks.findIndex(d => d.id === deck.id);
    
    if (existingDeckIndex >= 0) {
      // Update existing deck
      state.decks[existingDeckIndex] = deck;
    } else {
      // Add new deck
      state.decks.push(deck);
    }
    
    saveState(state);
  } catch (err) {
    console.error('Error saving deck:', err);
  }
};

/**
 * Delete a deck and its cards from localStorage
 */
export const deleteDeck = (deckId: string): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const state = loadState();
    
    // Remove the deck
    state.decks = state.decks.filter(deck => deck.id !== deckId);
    
    // Remove all cards belonging to this deck
    state.cards = state.cards.filter(card => card.deckId !== deckId);
    
    saveState(state);
  } catch (err) {
    console.error('Error deleting deck:', err);
  }
};

/**
 * Save a card to localStorage
 */
export const saveCard = (card: Card): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const state = loadState();
    const existingCardIndex = state.cards.findIndex(c => c.id === card.id);
    
    if (existingCardIndex >= 0) {
      // Update existing card
      state.cards[existingCardIndex] = card;
    } else {
      // Add new card
      state.cards.push(card);
    }
    
    saveState(state);
  } catch (err) {
    console.error('Error saving card:', err);
  }
};

/**
 * Delete a card from localStorage
 */
export const deleteCard = (cardId: string): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const state = loadState();
    state.cards = state.cards.filter(card => card.id !== cardId);
    saveState(state);
  } catch (err) {
    console.error('Error deleting card:', err);
  }
};

/**
 * Save review stats to localStorage
 */
export const saveReviewStats = (stats: ReviewStats): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const state = loadState();
    const existingStatsIndex = state.reviewStats.findIndex(
      s => new Date(s.date).toDateString() === new Date(stats.date).toDateString()
    );
    
    if (existingStatsIndex >= 0) {
      // Update existing stats for today
      state.reviewStats[existingStatsIndex] = stats;
    } else {
      // Add new stats
      state.reviewStats.push(stats);
    }
    
    saveState(state);
  } catch (err) {
    console.error('Error saving review stats:', err);
  }
};

/**
 * Update the current deck ID
 */
export const setCurrentDeckId = (deckId: string | null): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const state = loadState();
    state.currentDeckId = deckId;
    saveState(state);
  } catch (err) {
    console.error('Error setting current deck ID:', err);
  }
};

/**
 * Clear all application data from localStorage and reset to default state
 */
export const clearState = (): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Application state cleared successfully');
  } catch (err) {
    console.error('Error clearing state from localStorage:', err);
  }
}; 