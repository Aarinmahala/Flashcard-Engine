import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../types';
import { formatNextReview } from '../utils/helpers';

interface FlashcardProps {
  card: Card;
  onAnswer: (isCorrect: boolean) => void;
}

const Flashcard = ({ card, onAnswer }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setIsAnswered(false);
    setShowHint(false);
  }, [card.id]);

  const handleFlip = () => {
    if (!isAnswered) {
      setIsFlipped(!isFlipped);
      
      // Auto-show hint after card flip
      if (!isFlipped) {
        setTimeout(() => setShowHint(true), 600);
      }
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setIsAnswered(true);
    onAnswer(isCorrect);
  };

  // Animation variants
  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      transition: { duration: 0.2 } 
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    },
    tap: { scale: 0.97 }
  };

  const cardContainerVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.4
      }
    },
    exit: { scale: 0.95, opacity: 0 }
  };

  const metadataVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3,
        duration: 0.3
      }
    }
  };

  const hintVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 } 
    }
  };

  // Glow effect for card border when flipped
  const borderColors = isFlipped 
    ? "border-green-300 shadow-lg shadow-green-100" 
    : "border-blue-100";

  return (
    <div className="relative flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto">
      <motion.div 
        className={`relative w-full aspect-[3/2] mb-8 cursor-pointer perspective ${isAnswered ? 'pointer-events-none' : ''}`}
        onClick={handleFlip}
        variants={cardContainerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div
          className={`w-full h-full relative preserve-3d ${borderColors}`}
          initial={false}
          animate={{ 
            rotateY: isFlipped ? 180 : 0,
            scale: isFlipped ? 1.03 : 1
          }}
          transition={{ 
            duration: 0.6, 
            ease: [0.16, 1, 0.3, 1],
            scale: {
              type: "spring",
              stiffness: 300,
              damping: 20
            }
          }}
          style={{ transformStyle: 'preserve-3d' }}
          whileHover={{ scale: isFlipped ? 1.03 : 1.02 }}
        >
          {/* Front of card */}
          <div 
            className="absolute w-full h-full flex flex-col items-center justify-center p-8 bg-white border-2 border-blue-100 rounded-xl shadow-lg backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <motion.div 
              className="absolute top-4 left-4 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              QUESTION
            </motion.div>
            <motion.p 
              className="text-xl text-center font-medium text-gray-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {card.front}
            </motion.p>
            
            <AnimatePresence>
              {!isFlipped && (
                <motion.div 
                  className="mt-4 text-sm text-blue-600 flex items-center"
                  variants={hintVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M15.707 4.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <motion.span
                    animate={{ y: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
                  >
                    Tap to flip
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Back of card */}
          <div 
            className="absolute w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl shadow-lg backface-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <motion.div 
              className="absolute top-4 left-4 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isFlipped ? 1 : 0, x: isFlipped ? 0 : -10 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              ANSWER
            </motion.div>
            <motion.p 
              className="text-xl text-center text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: isFlipped ? 1 : 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {card.back}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Card metadata */}
      <motion.div 
        className="flex justify-between w-full mb-6 text-sm bg-white rounded-lg shadow-sm p-3 border border-gray-100"
        variants={metadataVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-500">Next review: </span>
          <span className="ml-1 font-medium">{formatNextReview(card.nextReview)}</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-purple-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
          </svg>
          <span className="text-gray-500">Ease: </span>
          <span className="ml-1 font-medium">{card.easeFactor.toFixed(1)}</span>
        </div>
      </motion.div>

      {/* Answer buttons - only show after flipping */}
      <AnimatePresence mode="wait">
        {isFlipped && !isAnswered ? (
          <motion.div 
            className="flex space-x-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: 0.2
            }}
          >
            <motion.button
              className="btn btn-danger flex-1 py-3"
              onClick={() => handleAnswer(false)}
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              whileHover="hover"
              whileTap="tap"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Didn't know it
            </motion.button>
            <motion.button
              className="btn btn-success flex-1 py-3"
              onClick={() => handleAnswer(true)}
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              whileHover="hover"
              whileTap="tap"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Got it
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center text-gray-500 w-full py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {!isFlipped 
              ? "Tap the card to reveal the answer" 
              : isAnswered 
                ? "Moving to next card..." 
                : ""}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Flashcard; 