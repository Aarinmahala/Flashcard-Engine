import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getDueCards } from '../utils/spacedRepetition';
import Flashcard from './Flashcard';
import { Card } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewModeProps {
  onExit: () => void;
}

const ReviewMode = ({ onExit }: ReviewModeProps) => {
  const { state, reviewCard } = useApp();
  const { cards, currentDeckId } = state;
  
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  // Load due cards when component mounts or deck changes
  useEffect(() => {
    if (currentDeckId) {
      const filteredCards = getDueCards(cards, currentDeckId);
      // Shuffle the cards
      const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
      setDueCards(shuffled);
      setCurrentCardIndex(0);
      setReviewedCount(0);
      setCorrectCount(0);
    }
  }, [cards, currentDeckId]);
  
  const handleAnswer = (isCorrect: boolean) => {
    const currentCard = dueCards[currentCardIndex];
    
    // Update statistics
    setReviewedCount(prev => prev + 1);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    // Update the card in the system
    reviewCard(currentCard, isCorrect);
    
    // Wait a moment before moving to the next card for animation
    setTimeout(() => {
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      }
    }, 750);
  };
  
  const currentCard = dueCards[currentCardIndex];
  const isReviewComplete = currentCardIndex >= dueCards.length - 1 && reviewedCount > 0;
  
  if (!currentDeckId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Please select a deck to review</p>
        <button onClick={onExit} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }
  
  if (dueCards.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Cards Due</h2>
        <p className="text-gray-500 mb-6">
          There are no cards due for review in this deck.
        </p>
        <button onClick={onExit} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  if (isReviewComplete) {
    const accuracy = reviewedCount > 0 
      ? Math.round((correctCount / reviewedCount) * 100) 
      : 0;
      
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Review Complete!</h2>
        
        <div className="mb-8 flex flex-col items-center">
          <div className="text-5xl font-bold text-blue-500 mb-2">{accuracy}%</div>
          <p className="text-gray-600">Accuracy</p>
          
          <div className="mt-6 bg-gray-100 rounded-lg p-4 inline-block">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
              <div className="text-gray-500">Cards Reviewed:</div>
              <div className="font-medium">{reviewedCount}</div>
              
              <div className="text-gray-500">Correct Answers:</div>
              <div className="font-medium text-green-600">{correctCount}</div>
              
              <div className="text-gray-500">Incorrect Answers:</div>
              <div className="font-medium text-red-600">{reviewedCount - correctCount}</div>
            </div>
          </div>
        </div>
        
        <button onClick={onExit} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-[70vh] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Card {currentCardIndex + 1} of {dueCards.length}
        </h2>
        <button onClick={onExit} className="btn btn-secondary text-sm">
          Exit Review
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Flashcard
              card={currentCard}
              onAnswer={handleAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full mt-6">
        <div 
          className="h-full bg-blue-500 rounded-full"
          style={{ 
            width: `${((currentCardIndex + 1) / dueCards.length) * 100}%`,
            transition: 'width 0.5s ease-in-out'
          }}
        />
      </div>
    </div>
  );
};

export default ReviewMode; 