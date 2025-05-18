import { createContext, useContext, useEffect, useState, ReactNode, Suspense } from 'react';
import { AppState, Card, Deck, ReviewStats } from '../types';
import { loadState, saveState } from '../utils/storage';
import { calculateNextReview, initializeCardForSRS } from '../utils/spacedRepetition';
import { createCard, createDeck, getTodayStats, generateDemoReviewStats } from '../utils/helpers';
import { exportData, exportDeck } from '../utils/importExport';

// Define the context type
interface AppContextType {
  state: AppState;
  isLoading: boolean;
  hasError: boolean;
  addDeck: (name: string) => Deck;
  updateDeck: (deck: Deck) => void;
  deleteDeck: (deckId: string) => void;
  addCard: (front: string, back: string, deckId: string, tags?: string[]) => Card;
  addCards: (cards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[]) => Card[];
  updateCard: (card: Card) => void;
  deleteCard: (cardId: string) => void;
  setCurrentDeck: (deckId: string | null) => void;
  reviewCard: (card: Card, isCorrect: boolean) => Card;
  exportAllData: () => void;
  exportCurrentDeck: () => void;
  importDecksAndCards: (decks: Deck[], cards: Card[]) => void;
  addTagToCard: (cardId: string, tag: string) => void;
  removeTagFromCard: (cardId: string, tag: string) => void;
  getAllTags: () => string[];
  resetAppState: () => void;
}

// Default state for the app
const initialState: AppState = {
  decks: [],
  cards: [],
  reviewStats: [],
  currentDeckId: null
};

// Create the context with default value
const AppContext = createContext<AppContextType | null>(null);

// Custom hook for using the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">Loading application...</p>
    </div>
  </div>
);

function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      setIsLoading(true);
      const loadedState = loadState();
      
      // If there's no review stats data, add some demo data for testing
      if (loadedState.reviewStats.length === 0 && loadedState.cards.length > 0) {
        console.log('Adding demo review stats for testing');
        loadedState.reviewStats = generateDemoReviewStats();
      }
      
      setState(loadedState);
      setHasError(false);
    } catch (error) {
      console.error('Error initializing app state:', error);
      setHasError(true);
      setState(initialState);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save state to localStorage whenever it changes (after initial load)
  useEffect(() => {
    if (!isLoading) {
      try {
        saveState(state);
      } catch (error) {
        console.error('Error saving state:', error);
      }
    }
  }, [state, isLoading]);

  // Reset application state to defaults
  const resetAppState = () => {
    setState(initialState);
  };

  const addDeck = (name: string): Deck => {
    const newDeck = createDeck(name);
    setState(prevState => ({
      ...prevState,
      decks: [...prevState.decks, newDeck],
      currentDeckId: newDeck.id // Set as current deck
    }));
    return newDeck;
  };

  const updateDeck = (deck: Deck): void => {
    setState(prevState => ({
      ...prevState,
      decks: prevState.decks.map(d => (d.id === deck.id ? deck : d))
    }));
  };

  const deleteDeck = (deckId: string): void => {
    setState(prevState => ({
      ...prevState,
      decks: prevState.decks.filter(deck => deck.id !== deckId),
      cards: prevState.cards.filter(card => card.deckId !== deckId),
      currentDeckId: prevState.currentDeckId === deckId ? null : prevState.currentDeckId
    }));
  };

  const addCard = (front: string, back: string, deckId: string, tags: string[] = []): Card => {
    const cardData = createCard(front, back, deckId, tags);
    const newCard = initializeCardForSRS(cardData as Omit<Card, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview' | 'lastReviewed'>);
    
    setState(prevState => ({
      ...prevState,
      cards: [...prevState.cards, newCard]
    }));
    
    return newCard;
  };

  const addCards = (cards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[]): Card[] => {
    const newCards = cards.map(card => {
      const cardData = createCard(card.front, card.back, card.deckId);
      return initializeCardForSRS(cardData as Omit<Card, 'easeFactor' | 'interval' | 'repetitions' | 'nextReview' | 'lastReviewed'>);
    });
    
    setState(prevState => ({
      ...prevState,
      cards: [...prevState.cards, ...newCards]
    }));
    
    return newCards;
  };

  const updateCard = (card: Card): void => {
    setState(prevState => ({
      ...prevState,
      cards: prevState.cards.map(c => (c.id === card.id ? card : c))
    }));
  };

  const deleteCard = (cardId: string): void => {
    setState(prevState => ({
      ...prevState,
      cards: prevState.cards.filter(card => card.id !== cardId)
    }));
  };

  const setCurrentDeck = (deckId: string | null): void => {
    setState(prevState => ({
      ...prevState,
      currentDeckId: deckId
    }));
  };

  const reviewCard = (card: Card, isCorrect: boolean): Card => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    // Find today's stats if they exist
    const existingStatsIndex = state.reviewStats.findIndex(
      s => new Date(s.date).toDateString() === today.toDateString()
    );
    
    // Update or create today's stats
    let updatedStats: ReviewStats;
    let newStats = [...state.reviewStats];
    
    if (existingStatsIndex >= 0) {
      // Update existing stats
      updatedStats = {
        ...state.reviewStats[existingStatsIndex],
        cardsReviewed: state.reviewStats[existingStatsIndex].cardsReviewed + 1,
        correctAnswers: isCorrect 
          ? state.reviewStats[existingStatsIndex].correctAnswers + 1 
          : state.reviewStats[existingStatsIndex].correctAnswers,
        incorrectAnswers: isCorrect 
          ? state.reviewStats[existingStatsIndex].incorrectAnswers 
          : state.reviewStats[existingStatsIndex].incorrectAnswers + 1
      };
      newStats[existingStatsIndex] = updatedStats;
    } else {
      // Create new stats for today
      updatedStats = {
        date: todayStart,
        cardsReviewed: 1,
        correctAnswers: isCorrect ? 1 : 0,
        incorrectAnswers: isCorrect ? 0 : 1
      };
      newStats.push(updatedStats);
    }

    // Update the card with new review data
    const updatedCard = calculateNextReview(card, isCorrect ? 'correct' : 'incorrect');

    // Update the deck's last reviewed timestamp
    const currentDeck = state.decks.find(d => d.id === card.deckId);
    let updatedDecks = state.decks;
    
    if (currentDeck) {
      const updatedDeck = {
        ...currentDeck,
        lastReviewed: Date.now()
      };
      updatedDecks = state.decks.map(d => (d.id === updatedDeck.id ? updatedDeck : d));
    }

    // Update the state
    setState(prevState => {
      return {
        ...prevState,
        cards: prevState.cards.map(c => (c.id === updatedCard.id ? updatedCard : c)),
        reviewStats: newStats,
        decks: updatedDecks
      };
    });

    // Log review stats for debugging
    console.log('Updated review stats:', newStats);

    return updatedCard;
  };

  // Export all data
  const exportAllData = (): void => {
    exportData(state);
  };

  // Export current deck
  const exportCurrentDeck = (): void => {
    if (!state.currentDeckId) return;
    
    const deck = state.decks.find(d => d.id === state.currentDeckId);
    if (!deck) return;
    
    exportDeck(deck, state.cards);
  };

  // Import decks and cards
  const importDecksAndCards = (decks: Deck[], cards: Card[]): void => {
    setState(prevState => {
      // Create a Set of existing deck IDs and card IDs for faster lookups
      const existingDeckIds = new Set(prevState.decks.map(deck => deck.id));
      const existingCardIds = new Set(prevState.cards.map(card => card.id));
      
      // Filter out decks and cards that already exist
      const newDecks = decks.filter(deck => !existingDeckIds.has(deck.id));
      const newCards = cards.filter(card => !existingCardIds.has(card.id));
      
      return {
        ...prevState,
        decks: [...prevState.decks, ...newDecks],
        cards: [...prevState.cards, ...newCards]
      };
    });
  };

  // Add a tag to a card
  const addTagToCard = (cardId: string, tag: string): void => {
    setState(prevState => {
      const cardIndex = prevState.cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return prevState;
      
      const card = prevState.cards[cardIndex];
      
      // Don't add duplicate tags
      if (card.tags.includes(tag)) return prevState;
      
      const updatedCard = {
        ...card,
        tags: [...card.tags, tag]
      };
      
      const updatedCards = [...prevState.cards];
      updatedCards[cardIndex] = updatedCard;
      
      return {
        ...prevState,
        cards: updatedCards
      };
    });
  };

  // Remove a tag from a card
  const removeTagFromCard = (cardId: string, tag: string): void => {
    setState(prevState => {
      const cardIndex = prevState.cards.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return prevState;
      
      const card = prevState.cards[cardIndex];
      
      const updatedCard = {
        ...card,
        tags: card.tags.filter(t => t !== tag)
      };
      
      const updatedCards = [...prevState.cards];
      updatedCards[cardIndex] = updatedCard;
      
      return {
        ...prevState,
        cards: updatedCards
      };
    });
  };

  // Get all unique tags used across all cards
  const getAllTags = (): string[] => {
    const tagsSet = new Set<string>();
    
    state.cards.forEach(card => {
      card.tags.forEach(tag => {
        tagsSet.add(tag);
      });
    });
    
    return Array.from(tagsSet).sort();
  };

  const contextValue: AppContextType = {
    state,
    isLoading,
    hasError,
    addDeck,
    updateDeck,
    deleteDeck,
    addCard,
    addCards,
    updateCard,
    deleteCard,
    setCurrentDeck,
    reviewCard,
    exportAllData,
    exportCurrentDeck,
    importDecksAndCards,
    addTagToCard,
    removeTagFromCard,
    getAllTags,
    resetAppState
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Application Error</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            We encountered an error while loading the application data. You can try refreshing the page or reset the application data.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
            >
              Refresh Page
            </button>
            <button 
              onClick={resetAppState} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1"
            >
              Reset App Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppContext.Provider value={contextValue}>
        {children}
      </AppContext.Provider>
    </Suspense>
  );
}

export default AppProvider; 