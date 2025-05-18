import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Card } from '../types';
import { getDueCards } from '../utils/spacedRepetition';
import { formatDistanceStrict } from 'date-fns';

// Add type definition for NodeJS.Timeout
declare namespace NodeJS {
  interface Timeout {}
}

interface LearningModeProps {
  onExit: () => void;
}

const LearningMode = ({ onExit }: LearningModeProps) => {
  const { state, reviewCard } = useApp();
  const { cards, currentDeckId } = state;
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // New state variables for enhanced features
  const [studyStartTime] = useState(Date.now());
  const [currentStudyTime, setCurrentStudyTime] = useState(0);
  const [showConceptMap, setShowConceptMap] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [cardDifficulty, setCardDifficulty] = useState<number>(0);
  const [showImageHint, setShowImageHint] = useState(false);
  
  // Additional animation and feature states
  const [learningStreak, setLearningStreak] = useState(() => {
    const savedStreak = localStorage.getItem('learning_streak');
    return savedStreak ? parseInt(savedStreak, 10) : 0;
  });
  const [lastStudyDate, setLastStudyDate] = useState(() => {
    return localStorage.getItem('last_study_date') || '';
  });
  const [showMindMap, setShowMindMap] = useState(false);
  const [isInFocusMode, setIsInFocusMode] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [cardRotation, setCardRotation] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showExample, setShowExample] = useState(false);
  
  // Media recorder reference
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  
  // Update study timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStudyTime(Date.now() - studyStartTime);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [studyStartTime]);
  
  // Handle learning streak tracking
  useEffect(() => {
    const today = new Date().toDateString();
    
    // If this is a new day compared to last study date, increment streak
    if (lastStudyDate && lastStudyDate !== today) {
      const lastDate = new Date(lastStudyDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last study was yesterday, increment streak, otherwise reset
      if (lastDate.toDateString() === yesterday.toDateString()) {
        setLearningStreak(prev => prev + 1);
      } else {
        setLearningStreak(1); // Reset streak but count today
      }
    } else if (!lastStudyDate) {
      // First time studying
      setLearningStreak(1);
    }
    
    // Update last study date to today
    setLastStudyDate(today);
    localStorage.setItem('last_study_date', today);
    localStorage.setItem('learning_streak', learningStreak.toString());
  }, [isFinished, lastStudyDate, learningStreak]);
  
  // Pomodoro timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsPomodoroActive(false);
      // Play notification sound
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      audio.play();
      // Reset timer
      setPomodoroTime(25 * 60);
    }
    
    return () => {
      if (interval) clearInterval(interval as unknown as number);
    };
  }, [isPomodoroActive, pomodoroTime]);
  
  // Get cards for the current deck
  const deckCards = useMemo(() => {
    if (!currentDeckId) return [];
    return getDueCards(cards, currentDeckId);
  }, [cards, currentDeckId]);
  
  // Handle the case when all cards are reviewed
  useEffect(() => {
    if (deckCards.length === 0 || currentCardIndex >= deckCards.length) {
      setIsFinished(true);
    }
  }, [deckCards, currentCardIndex]);

  // Handle audio recording cleanup
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);
  
  // Generate hints for the current card
  const generateHints = (answer: string): string[] => {
    const hints: string[] = [];
    
    // Hint 1: First letter
    hints.push(`The first letter is "${answer[0]}"`);
    
    // Hint 2: Length and format
    hints.push(`It's ${answer.length} characters long: ${answer.replace(/[^ ]/g, "_ ")}`);
    
    // Hint 3: Show 30% of letters randomly
    const answerChars = answer.split('');
    const visibleCount = Math.ceil(answer.length * 0.3);
    let visibleIndices = new Set<number>();
    
    while (visibleIndices.size < visibleCount) {
      const randomIndex = Math.floor(Math.random() * answer.length);
      if (answer[randomIndex] !== ' ') { // Don't count spaces
        visibleIndices.add(randomIndex);
      }
    }
    
    const partialReveal = answerChars.map((char, index) => {
      if (visibleIndices.has(index) || char === ' ') {
        return char;
      } else {
        return '_';
      }
    }).join('');
    
    hints.push(`Partial reveal: ${partialReveal}`);
    
    // Hint 4: Show 60% of letters randomly
    const moreVisibleCount = Math.ceil(answer.length * 0.6);
    let moreVisibleIndices = new Set<number>([...visibleIndices]);
    
    while (moreVisibleIndices.size < moreVisibleCount) {
      const randomIndex = Math.floor(Math.random() * answer.length);
      if (answer[randomIndex] !== ' ') {
        moreVisibleIndices.add(randomIndex);
      }
    }
    
    const moreReveal = answerChars.map((char, index) => {
      if (moreVisibleIndices.has(index) || char === ' ') {
        return char;
      } else {
        return '_';
      }
    }).join('');
    
    hints.push(`More revealed: ${moreReveal}`);
    
    // Final hint: Show everything except one letter
    const almostComplete = answer.slice(0, -1) + '_';
    hints.push(`It's almost: ${almostComplete}`);
    
    // AI hint: Conceptual hint (simulated)
    hints.push(`Think about: ${answer.split(' ').map(word => word.length > 3 ? word.charAt(0) + '...' : word).join(' ')}`);
    
    return hints;
  };
  
  const currentCard = !isFinished && deckCards.length > 0 ? deckCards[currentCardIndex] : null;
  const hints = currentCard ? generateHints(currentCard.back) : [];
  
  const handleNextCard = (isCorrect: boolean) => {
    if (!currentCard) return;
    
    // Update the review status for the card
    reviewCard(currentCard, isCorrect);
    
    // Store difficulty rating if it was set
    if (cardDifficulty > 0) {
      // Would normally save this to a persistent store
      console.log(`Card ${currentCard.id} rated as difficulty: ${cardDifficulty}/5`);
    }
    
    // Update stats
    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setIncorrect(prev => prev + 1);
    }
    
    // Reset state for next card
    setAudioURL(null);
    setCardDifficulty(0);
    setShowImageHint(false);
    
    // Move to the next card after a delay
    setTimeout(() => {
      setIsFlipped(false);
      setHintLevel(0);
      setCurrentCardIndex(prevIndex => prevIndex + 1);
    }, 1000);
  };
  
  const handleRequestHint = () => {
    if (hintLevel < hints.length) {
      setHintLevel(prevLevel => prevLevel + 1);
    } else {
      setIsFlipped(true);
    }
  };
  
  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access your microphone. Please check your browser permissions.");
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Toggle concept map visibility
  const toggleConceptMap = () => {
    setShowConceptMap(prev => !prev);
  };

  // Toggle mind map visualization
  const toggleMindMap = () => {
    setShowMindMap(prev => !prev);
  };
  
  // Toggle focus mode
  const toggleFocusMode = () => {
    setIsInFocusMode(prev => !prev);
  };
  
  // Toggle pomodoro timer
  const togglePomodoro = () => {
    setIsPomodoroActive(prev => !prev);
  };
  
  // Reset pomodoro timer
  const resetPomodoro = () => {
    setPomodoroTime(25 * 60);
    setIsPomodoroActive(false);
  };
  
  // Format pomodoro time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Animate card flip with rotation
  const animateCardFlip = () => {
    setCardRotation(prev => prev + 360);
    setIsFlipped(true);
  };
  
  // Toggle definition
  const toggleDefinition = () => {
    setShowDefinition(prev => !prev);
  };
  
  // Toggle example
  const toggleExample = () => {
    setShowExample(prev => !prev);
  };

  if (!currentDeckId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a deck first</p>
        <button
          onClick={onExit}
          className="btn btn-primary"
        >
          Back to Decks
        </button>
      </div>
    );
  }
  
  if (isFinished) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            transition: { 
              type: "spring",
              stiffness: 300,
              damping: 20
            } 
          }}
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Learning Session Completed!</h2>
            <div className="inline-block relative mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </motion.div>
          
          <div className="mb-6">
            <motion.p 
              className="text-gray-600 dark:text-gray-300 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Great job! You've finished reviewing all the cards in this deck.
            </motion.p>
            
            {/* Study time summary */}
            <motion.div 
              className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mb-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-purple-700 dark:text-purple-300 font-medium">
                Study time: {formatDistanceStrict(new Date(0), new Date(currentStudyTime))}
              </p>
            </motion.div>
            
            {/* Learning streak */}
            <motion.div 
              className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg mb-4 flex items-center justify-center space-x-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
              </svg>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-300">
                {learningStreak} day streak! Keep it up!
              </p>
            </motion.div>
            
            <motion.div 
              className="flex justify-center space-x-8 mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
                <motion.p 
                  className="text-xl font-bold text-green-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                >
                  {correct}
                </motion.p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Incorrect</p>
                <motion.p 
                  className="text-xl font-bold text-red-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0, type: "spring" }}
                >
                  {incorrect}
                </motion.p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <motion.p 
                  className="text-xl font-bold text-blue-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1, type: "spring" }}
                >
                  {correct + incorrect}
                </motion.p>
              </div>
            </motion.div>
            
            {/* Learning insights */}
            <motion.div
              className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">Learning Insights:</h3>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {correct > incorrect ? "Great work! You're mastering this content." : "Keep practicing! You're making progress."}
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your accuracy rate: {Math.round((correct / (correct + incorrect)) * 100)}%
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Next review recommended: Tomorrow
                </li>
              </ul>
            </motion.div>
          </div>
          
          <motion.button
            onClick={onExit}
            className="btn btn-primary w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Decks
          </motion.button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Study timer and streak */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md shadow-sm text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Study time: {formatDistanceStrict(new Date(0), new Date(currentStudyTime))}
          </p>
        </div>
        
        {/* Learning streak */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-md shadow-sm text-center flex items-center space-x-2">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
          </svg>
          <p className="text-sm font-medium text-orange-600 dark:text-orange-300">
            {learningStreak} day {learningStreak === 1 ? 'streak' : 'streaks'}
          </p>
        </div>
        
        {/* Pomodoro timer */}
        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md shadow-sm text-center">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-red-600 dark:text-red-300">
              {formatTime(pomodoroTime)}
            </p>
            <button
              onClick={togglePomodoro}
              className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
            >
              {isPomodoroActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetPomodoro}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Focus mode toggle */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={toggleFocusMode}
          className={`text-sm px-3 py-1 rounded-full flex items-center space-x-1 transition-colors ${
            isInFocusMode 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zm1.414 6.707a1 1 0 00-1.414-1.414L2.293 9l1.414 1.414C5.107 11.8 6 10.907 5.107 9.707zM17.707 5.707a1 1 0 000-1.414L16.293 3l1.414 1.414C19.107 5.8 19.107 5.707 17.707 5.707zM3 17.293l1.414 1.414a1 1 0 001.414-1.414L4.414 16a1 1 0 00-1.414 1.293zm17-14l-1.414 1.414a1 1 0 001.414 1.414L18.586 5A1 1 0 0020 5.293zM9.293 12.293l1.414 1.414a1 1 0 101.414-1.414L10.707 11a1 1 0 10-1.414 1.293z" clipRule="evenodd" />
          </svg>
          <span>{isInFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}</span>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-300">Learning Progress</span>
          <span className="text-gray-600 dark:text-gray-300">
            {currentCardIndex + 1} of {deckCards.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / deckCards.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Card display */}
      {currentCard && (
        <div className="max-w-2xl mx-auto">
          <div 
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 transition-all duration-500 ${isInFocusMode ? 'ring-4 ring-purple-400 dark:ring-purple-600' : ''}`}
            style={{ transform: `perspective(1000px) rotateY(${cardRotation}deg)`, transformStyle: 'preserve-3d' }}
          >
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Question:</h3>
              
              <div className="flex space-x-2">
                {/* Concept map button */}
                <button 
                  onClick={toggleConceptMap} 
                  className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                >
                  {showConceptMap ? "Hide Concept Map" : "Show Concept Map"}
                </button>
                
                {/* Mind map button */}
                <button 
                  onClick={toggleMindMap} 
                  className="text-sm px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 rounded-full hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  {showMindMap ? "Hide Mind Map" : "Mind Map"}
                </button>
              </div>
            </div>
            
            {/* Concept Map/Summary */}
            <AnimatePresence>
              {showConceptMap && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg mb-4 overflow-hidden"
                >
                  <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Related Concepts:</h4>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="bg-white dark:bg-gray-700 px-2 py-1 rounded-md shadow-sm">
                        {["Memory techniques", "Spaced repetition", "Active recall", "Mental models", "Pattern recognition"][i]}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Mind Map Visualization */}
            <AnimatePresence>
              {showMindMap && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg mb-4 overflow-hidden"
                >
                  <h4 className="text-sm font-medium text-teal-700 dark:text-teal-300 mb-2">Mind Map:</h4>
                  <div className="relative h-48 flex items-center justify-center">
                    {/* Central concept */}
                    <div className="absolute z-10 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-md">
                      {currentCard.front.split(' ').slice(0, 2).join(' ')}
                    </div>
                    
                    {/* Related concepts */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const angle = (i * Math.PI * 2) / 5;
                      const x = Math.cos(angle) * 100;
                      const y = Math.sin(angle) * 70;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="absolute z-0 bg-teal-100 dark:bg-teal-800 rounded-md px-2 py-1 text-xs shadow-sm"
                          style={{ 
                            left: `calc(50% + ${x}px)`, 
                            top: `calc(50% + ${y}px)`, 
                            transform: 'translate(-50%, -50%)' 
                          }}
                        >
                          {["Key term", "Definition", "Example", "Related concept", "Application"][i]}
                        </motion.div>
                      );
                    })}
                    
                    {/* Connector lines */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const angle = (i * Math.PI * 2) / 5;
                        const x = Math.cos(angle) * 100;
                        const y = Math.sin(angle) * 70;
                        return (
                          <motion.line
                            key={i}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            x1="50%" 
                            y1="50%" 
                            x2={`calc(50% + ${x}px)`} 
                            y2={`calc(50% + ${y}px)`}
                            stroke="rgba(20, 184, 166, 0.4)"
                            strokeWidth="1.5"
                            strokeDasharray="5,5"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-xl text-gray-800 dark:text-gray-200 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {currentCard.front}
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="hints"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Need a hint?</h3>
                
                {hintLevel > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Hints:</h4>
                    <ul className="space-y-2">
                      {hints.slice(0, hintLevel).map((hint, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded"
                        >
                          {hint}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Image hint option */}
                <div className="mb-4">
                  <button 
                    onClick={() => setShowImageHint(!showImageHint)}
                    className="text-sm px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                  >
                    {showImageHint ? "Hide Visual Hint" : "Show Visual Hint"}
                  </button>
                  
                  <AnimatePresence>
                    {showImageHint && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center justify-center h-32 bg-gray-200 dark:bg-gray-600 rounded-lg">
                          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Visual representation for this concept</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleRequestHint}
                    className="btn btn-secondary"
                    disabled={hintLevel >= hints.length}
                  >
                    {hintLevel === 0 ? 'Show Hint' : 'Next Hint'}
                  </button>
                  <button
                    onClick={animateCardFlip}
                    className="btn btn-primary"
                  >
                    Show Answer
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Answer:</h3>
                <motion.p 
                  className="text-xl text-gray-800 dark:text-gray-200 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ 
                    opacity: 1, 
                    filter: "blur(0px)",
                    transition: { duration: 0.5, delay: 0.2 }
                  }}
                >
                  {currentCard.back}
                </motion.p>
                
                {/* Additional learning resources */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={toggleDefinition}
                    className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  >
                    <svg className="w-6 h-6 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{showDefinition ? "Hide Definition" : "Show Definition"}</span>
                  </button>
                  
                  <button
                    onClick={toggleExample}
                    className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
                  >
                    <svg className="w-6 h-6 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">{showExample ? "Hide Example" : "Show Example"}</span>
                  </button>
                </div>
                
                {/* Definition panel */}
                <AnimatePresence>
                  {showDefinition && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 overflow-hidden"
                    >
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Definition:</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        A more detailed explanation of "{currentCard.front}" would be: {currentCard.back}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Example panel */}
                <AnimatePresence>
                  {showExample && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4 overflow-hidden"
                    >
                      <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Example:</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        An example of "{currentCard.front}" in practice would be related to {currentCard.back.split(' ').slice(0, 3).join(' ')}...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Voice recording feature */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Practice pronunciation:</h4>
                  
                  <div className="flex items-center space-x-3">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 flex items-center"
                        disabled={!!audioURL}
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        Record
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 flex items-center animate-pulse"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        Stop
                      </button>
                    )}
                    
                    {audioURL && (
                      <audio 
                        src={audioURL} 
                        controls 
                        className="h-8 w-48" 
                      />
                    )}
                  </div>
                </div>
                
                {/* Difficulty rating */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How difficult was this card?</h4>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setCardDifficulty(rating)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          cardDifficulty === rating 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleNextCard(false)}
                    className="btn btn-danger"
                  >
                    Didn't Know
                  </button>
                  <button
                    onClick={() => handleNextCard(true)}
                    className="btn btn-success"
                  >
                    Got It!
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-between">
            <button
              onClick={onExit}
              className="btn btn-secondary"
            >
              Exit Learning Mode
            </button>
            
            <div className="flex space-x-4">
              <div className="text-center">
                <span className="text-sm text-gray-500">Correct</span>
                <p className="font-bold text-green-500">{correct}</p>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500">Incorrect</span>
                <p className="font-bold text-red-500">{incorrect}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Simple confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 10 + 5;
            const left = `${Math.random() * 100}%`;
            const animationDuration = Math.random() * 3 + 2;
            const delay = Math.random() * 0.5;
            const color = [
              'bg-red-500', 'bg-blue-500', 'bg-green-500', 
              'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
            ][Math.floor(Math.random() * 6)];
            
            return (
              <div
                key={i}
                className={`absolute rounded-full ${color}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left,
                  top: '-20px',
                  animation: `confetti ${animationDuration}s ease-in ${delay}s forwards`
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Add confetti animation to global styles */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LearningMode; 