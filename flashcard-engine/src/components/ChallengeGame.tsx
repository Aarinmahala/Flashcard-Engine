import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Card } from '../types';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';
import Leaderboard, { useLeaderboard, LeaderboardEntry } from './Leaderboard';
import { useAchievements } from './AchievementSystem';

interface ChallengeGameProps {
  onExit: () => void;
}

const ChallengeGame: React.FC<ChallengeGameProps> = ({ onExit }) => {
  const { state, reviewCard } = useApp();
  const { width, height } = useWindowSize();
  const { entries, addEntry, clearLeaderboard } = useLeaderboard();
  const achievements = useAchievements();

  // Debug log
  console.log('ChallengeGame rendering with achievement context:', achievements);
  
  const [gameCards, setGameCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [highlightEntry, setHighlightEntry] = useState<string | undefined>(undefined);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  // Prepare game cards by selecting random cards from all decks
  useEffect(() => {
    const availableCards = state.cards.filter(card => card.back.length < 100); // Filter out cards with very long answers
    if (availableCards.length > 0) {
      const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
      setGameCards(shuffled.slice(0, 10)); // Pick 10 random cards
    }
  }, [state.cards]);
  
  // Generate multiple choices for the current card
  useEffect(() => {
    if (gameCards.length > 0 && currentCardIndex < gameCards.length) {
      const currentCard = gameCards[currentCardIndex];
      const correctAnswer = currentCard.back;
      
      // Get 3 random incorrect answers from other cards
      const otherAnswers = gameCards
        .filter(card => card.id !== currentCard.id)
        .map(card => card.back)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Combine and shuffle
      const allChoices = [correctAnswer, ...otherAnswers].sort(() => Math.random() - 0.5);
      setChoices(allChoices);
      setSelectedChoice(null);
      setIsCorrect(null);
    }
  }, [gameCards, currentCardIndex]);
  
  // Timer countdown
  useEffect(() => {
    if (gameOver || gameCards.length === 0) return;
    
    const timer = setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        handleGameOver();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver, gameCards]);
  
  // Load player name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('challenge_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);
  
  // Update highScore in app state to unlock achievements
  useEffect(() => {
    if (gameOver && score > 0) {
      // Store highScore in app state for achievements
      const highScoresStr = localStorage.getItem('challenge_high_scores');
      const highScores = highScoresStr ? JSON.parse(highScoresStr) : [];
      
      if (!highScores.includes(score)) {
        const newHighScores = [...highScores, score].sort((a, b) => b - a).slice(0, 5);
        localStorage.setItem('challenge_high_scores', JSON.stringify(newHighScores));
      }
    }
  }, [gameOver, score]);
  
  // Auto-hide correct answer animation
  useEffect(() => {
    if (showCorrectAnimation) {
      const timer = setTimeout(() => {
        setShowCorrectAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showCorrectAnimation]);
  
  const handleAnswer = (choice: string) => {
    if (selectedChoice !== null) return; // Prevent multiple selections
    
    const currentCard = gameCards[currentCardIndex];
    const correct = choice === currentCard.back;
    
    setSelectedChoice(choice);
    setIsCorrect(correct);
    
    if (correct) {
      // Update score based on time left and combo
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }
      const comboBonus = Math.min(newCombo * 5, 25); // Cap combo bonus at 25 points
      const timeBonus = Math.floor(timeLeft / 3);
      const earned = 10 + comboBonus + timeBonus;
      
      // Set points earned for animation
      setPointsEarned(earned);
      
      // Show correct answer animation
      setShowCorrectAnimation(true);
      
      setScore(prev => prev + earned);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Mark card as reviewed correctly
      reviewCard(currentCard, true);
    } else {
      // Reset combo and reduce lives
      setCombo(0);
      setLives(prev => prev - 1);
      
      // Mark card as reviewed incorrectly
      reviewCard(currentCard, false);
      
      if (lives <= 1) {
        setTimeout(() => handleGameOver(), 1500);
        return;
      }
    }
    
    // Move to next card after delay
    setTimeout(() => {
      if (currentCardIndex < gameCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setTimeLeft(30); // Reset timer for next question
      } else {
        handleGameOver();
      }
    }, 1500);
  };
  
  const handleGameOver = () => {
    setGameOver(true);
    if (score > 0) {
      setShowNameInput(true);
    }
  };
  
  const handleSubmitScore = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    // Save player name
    localStorage.setItem('challenge_player_name', playerName);
    
    // Add entry to leaderboard
    const entry: LeaderboardEntry = {
      name: playerName,
      score,
      date: Date.now(),
      cardsCompleted: currentCardIndex + 1,
      maxCombo
    };
    
    addEntry(entry);
    setHighlightEntry(`${playerName}-${entry.date}`);
    setShowNameInput(false);
    setShowLeaderboard(true);
  };
  
  const restartGame = () => {
    // Shuffle and get new cards
    const availableCards = state.cards.filter(card => card.back.length < 100);
    if (availableCards.length > 0) {
      const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
      setGameCards(shuffled.slice(0, 10));
    }
    
    // Reset game state
    setCurrentCardIndex(0);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setShowLeaderboard(false);
    setHighlightEntry(undefined);
  };
  
  // If no cards available
  if (gameCards.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/90 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">No Cards Available</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            You need to add some flashcards before you can play the Challenge Game.
          </p>
          <div className="flex justify-end">
            <button 
              onClick={onExit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to App
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Game over screen
  if (gameOver) {
    if (showLeaderboard) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/90 z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full overflow-hidden shadow-xl"
          >
            <Leaderboard 
              entries={entries} 
              highlightEntry={highlightEntry} 
              onClear={clearLeaderboard}
              showControls={true}
            />
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
              <button 
                onClick={restartGame}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Again
              </button>
              <button 
                onClick={onExit}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Exit
              </button>
            </div>
          </motion.div>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/90 z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-2 text-center">Game Over!</h2>
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{score}</p>
            <p className="text-gray-600 dark:text-gray-300">Final Score</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Cards Completed</p>
                <p className="font-medium">{currentCardIndex} / {gameCards.length}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Highest Combo</p>
                <p className="font-medium">{maxCombo}x</p>
              </div>
            </div>
          </div>
          
          {showNameInput ? (
            <div className="mb-6">
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter your name for the leaderboard:
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your name"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Max 15 characters
              </p>
            </div>
          ) : null}
          
          <div className="flex space-x-3">
            {showNameInput ? (
              <>
                <button 
                  onClick={handleSubmitScore}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Score
                </button>
                <button 
                  onClick={() => {
                    setShowNameInput(false);
                    setShowLeaderboard(true);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Skip
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={restartGame}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Play Again
                </button>
                <button 
                  onClick={() => setShowLeaderboard(true)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Leaderboard
                </button>
                <button 
                  onClick={onExit}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Exit
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }
  
  const currentCard = gameCards[currentCardIndex];
  
  // Function to get motivational phrases based on combo and points
  const getMotivationalPhrase = () => {
    if (combo >= 5) return "UNSTOPPABLE!";
    if (combo >= 3) return "ON FIRE!";
    if (pointsEarned >= 25) return "EXCELLENT!";
    if (pointsEarned >= 15) return "GREAT JOB!";
    return "CORRECT!";
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/90 z-50">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      {/* Correct answer animation */}
      <AnimatePresence>
        {showCorrectAnimation && (
          <motion.div
            className="fixed top-10 left-0 right-0 flex justify-center z-50 pointer-events-none"
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 15 
              }
            }}
            exit={{ 
              y: -50, 
              opacity: 0,
              transition: { duration: 0.3 } 
            }}
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-10 py-6 rounded-lg shadow-xl flex flex-col items-center transform scale-110 animate-pulse">
              <motion.div 
                className="text-white font-bold text-3xl md:text-4xl"
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: [0.8, 1.8, 1.5],  // Increased by 50% (1.2 -> 1.8, 1 -> 1.5)
                  transition: { 
                    duration: 0.8,  // Slightly longer duration for more emphasis
                    times: [0, 0.6, 1] 
                  }
                }}
              >
                {getMotivationalPhrase()}
              </motion.div>
              <div className="flex items-center mt-2">
                <motion.div 
                  className="text-yellow-300 font-bold text-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 0.2 }
                  }}
                >
                  +{pointsEarned}
                </motion.div>
                <motion.div 
                  className="ml-2 text-white text-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 0.3 }
                  }}
                >
                  POINTS
                </motion.div>
                
                {combo > 1 && (
                  <motion.div
                    className="ml-3 bg-yellow-500 text-white text-sm px-2 py-1 rounded-full flex items-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { 
                        delay: 0.4,
                        type: "spring" 
                      }
                    }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                    </svg>
                    {combo}x COMBO
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4 overflow-hidden shadow-xl">
        {/* Game header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Question {currentCardIndex + 1} of {gameCards.length}</p>
              <h2 className="text-xl font-bold">Challenge Mode</h2>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Score</p>
              <p className="text-xl font-bold">{score}</p>
            </div>
          </div>
          
          {/* Progress bar and lives */}
          <div className="flex items-center mt-2 space-x-2">
            <div className="flex-1">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white" 
                  initial={{ width: `${(timeLeft / 30) * 100}%` }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span>{timeLeft}s</span>
                {combo > 1 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-yellow-300 font-bold"
                  >
                    Combo x{combo}!
                  </motion.span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-5 h-5 ${i < lives ? 'text-red-400' : 'text-white/30'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        
        {/* Card content */}
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2 text-gray-500 dark:text-gray-400">Front</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 min-h-[100px] flex items-center justify-center">
            <p className="text-center text-lg">{currentCard.front}</p>
          </div>
          
          <h3 className="text-lg font-medium mb-2 text-gray-500 dark:text-gray-400">Choose the correct answer:</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {choices.map((choice, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(choice)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedChoice === choice
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : selectedChoice !== null && choice === currentCard.back
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
                disabled={selectedChoice !== null}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center">
                  <span className="bg-gray-200 dark:bg-gray-700 w-6 h-6 flex items-center justify-center rounded-full mr-2 text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{choice}</span>
                  
                  {selectedChoice === choice && (
                    isCorrect ? (
                      <motion.svg 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-5 h-5 text-green-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </motion.svg>
                    ) : (
                      <motion.svg 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-5 h-5 text-red-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </motion.svg>
                    )
                  )}
                  
                  {selectedChoice !== null && selectedChoice !== choice && choice === currentCard.back && (
                    <motion.svg 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-5 h-5 text-green-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Bottom panel */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-end">
          <button 
            onClick={onExit} 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Exit Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeGame; 