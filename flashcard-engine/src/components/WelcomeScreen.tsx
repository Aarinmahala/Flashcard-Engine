import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { generateDemoData } from '../utils/demoData';

interface WelcomeScreenProps {
  onDismiss: () => void;
}

const WelcomeScreen = ({ onDismiss }: WelcomeScreenProps) => {
  const { importDecksAndCards } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDemoMode = () => {
    setIsLoading(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      const demoData = generateDemoData();
      importDecksAndCards(demoData.decks, demoData.cards);
      setIsLoading(false);
      onDismiss();
    }, 800);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300, 
            duration: 0.4 
          }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl my-2 sm:my-4 overflow-hidden"
        >
          <motion.div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.h1 
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Welcome to Flashcard Engine
            </motion.h1>
            <motion.p 
              className="text-sm sm:text-base text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Your powerful spaced repetition learning tool
            </motion.p>
          </motion.div>
          
          <div className="p-4 sm:p-6">
            <motion.h2 
              className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Getting Started
            </motion.h2>
            
            <motion.div 
              className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-4 sm:mb-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base mb-2">Key Features</h3>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {[
                    "Spaced repetition algorithm for efficient learning",
                    "Tag system to organize your flashcards",
                    "Learning mode with progressive hints",
                    "Challenge Game with scoring and timer",
                    "Pomodoro timer for focused study sessions",
                    "Import/export and sharing functionality"
                  ].map((feature, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (index * 0.05), duration: 0.3 }}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-1 sm:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div 
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base mb-2">Demo Content</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Try out the app with our pre-made decks:
                </p>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {[
                    { name: "Coding Challenges", isNew: true, color: "blue" },
                    { name: "Web Development", isNew: true, color: "green" },
                    { name: "Data Science Essentials", isNew: true, color: "purple" },
                    { name: "Language Learning", isNew: false },
                    { name: "Science Concepts", isNew: false },
                    { name: "Programming Fundamentals", isNew: false }
                  ].map((deck, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (index * 0.05), duration: 0.3 }}
                    >
                      {deck.isNew && (
                        <motion.span 
                          className={`inline-block bg-${deck.color}-100 dark:bg-${deck.color}-900 text-${deck.color}-700 dark:text-${deck.color}-300 p-0.5 rounded mr-1 sm:mr-2 text-xs`}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8 + (index * 0.05), type: "spring", stiffness: 200 }}
                        >
                          NEW
                        </motion.span>
                      )}
                      <span className="truncate">{deck.name}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base mb-1 sm:mb-2">Try Challenge Mode!</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Our new Challenge Game turns your flashcards into an exciting quiz game with multiple choice answers,
                timers, and high scores. Perfect for testing your knowledge!
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              <motion.button
                onClick={onDismiss}
                className="btn btn-secondary w-full sm:w-auto text-sm sm:text-base py-2 px-3 sm:px-4"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Start Fresh
              </motion.button>
              
              <motion.button
                onClick={handleDemoMode}
                className="btn btn-primary w-full sm:w-auto text-sm sm:text-base py-2 px-3 sm:px-4 mb-2 sm:mb-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Demo...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Try Demo Mode
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeScreen; 