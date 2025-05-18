import { Card, Deck, AppState } from '../types';

// Export all data (or filtered data) to JSON file
export const exportData = (data: AppState | { cards: Card[], decks: Deck[] }): void => {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = `flashcard-export-${new Date().toISOString().split('T')[0]}.json`;
  link.href = url;
  link.click();
  
  URL.revokeObjectURL(url);
};

// Export single deck with its cards
export const exportDeck = (deck: Deck, cards: Card[]): void => {
  const deckCards = cards.filter(card => card.deckId === deck.id);
  exportData({ decks: [deck], cards: deckCards });
};

// Import data from JSON file
export const importData = async (file: File): Promise<{ decks: Deck[], cards: Card[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (typeof event.target?.result !== 'string') {
          throw new Error('Invalid file content');
        }
        
        const data = JSON.parse(event.target.result);
        
        // Validate imported data
        if (!data.cards || !Array.isArray(data.cards) || !data.decks || !Array.isArray(data.decks)) {
          throw new Error('Invalid data format');
        }
        
        // Here we could do more validation of each card and deck
        
        resolve({
          decks: data.decks,
          cards: data.cards
        });
      } catch (error) {
        reject(new Error('Failed to parse import file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Parse CSV for importing cards
export const importCardsFromCSV = async (file: File, deckId: string): Promise<Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (typeof event.target?.result !== 'string') {
          throw new Error('Invalid file content');
        }
        
        const csvData = event.target.result;
        const lines = csvData.split('\n');
        
        const cards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[] = [];
        
        // Skip header if it exists
        const startIndex = lines[0].includes('front') && lines[0].includes('back') ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Handle different CSV formats (comma or tab delimited)
          const delimiter = line.includes('\t') ? '\t' : ',';
          const [front, back] = line.split(delimiter).map(item => item.trim());
          
          if (front && back) {
            cards.push({
              front,
              back,
              deckId
            });
          }
        }
        
        resolve(cards);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}; 