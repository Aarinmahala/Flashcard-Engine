import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { calculateDueCards } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const DeckList = () => {
  const { state, setCurrentDeck, deleteDeck } = useApp();
  const { decks, cards, currentDeckId } = state;
  
  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };
  
  // Item animation variants
  const deckItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.2
      } 
    }
  };
  
  // Button animation variants
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    exit: { opacity: 0, scale: 0.9 }
  };
  
  // Badge animation variants
  const badgeVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      } 
    }
  };
  
  if (decks.length === 0) {
    return (
      <motion.div 
        className="text-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-500">No decks created yet</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="my-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-xl font-semibold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        Your Decks
      </motion.h2>
      
      <motion.div 
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {decks.map(deck => {
            const isActive = deck.id === currentDeckId;
            const deckCards = cards.filter(card => card.deckId === deck.id);
            const dueCount = calculateDueCards(deckCards);
            
            return (
              <motion.div 
                key={deck.id} 
                className={`border rounded-lg overflow-hidden ${
                  isActive ? 'border-blue-500 shadow-md' : 'border-gray-200'
                }`}
                variants={deckItemVariants}
                layoutId={`deck-${deck.id}`}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30 
                }}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <motion.h3 
                      className="text-lg font-medium mb-2"
                      layoutId={`title-${deck.id}`}
                    >
                      {deck.name}
                    </motion.h3>
                    <div className="flex space-x-1">
                      {dueCount > 0 && (
                        <motion.span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          variants={badgeVariants}
                          initial="initial"
                          animate="animate"
                          layoutId={`badge-${deck.id}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {dueCount} due
                        </motion.span>
                      )}
                    </div>
                  </div>
                  
                  <motion.div 
                    className="text-sm text-gray-500 mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <div>Cards: {deckCards.length}</div>
                    <div>Created: {format(deck.createdAt, 'MMM d, yyyy')}</div>
                    {deck.lastReviewed && (
                      <div>Last reviewed: {format(deck.lastReviewed, 'MMM d, yyyy')}</div>
                    )}
                  </motion.div>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => setCurrentDeck(deck.id)}
                      className={`btn flex-1 ${
                        isActive 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                      whileHover={buttonVariants.hover}
                      whileTap={buttonVariants.tap}
                      transition={{ duration: 0.2 }}
                    >
                      {isActive ? 'Selected' : 'Select'}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
                          deleteDeck(deck.id);
                        }
                      }}
                      className="btn btn-danger"
                      title="Delete deck"
                      whileHover={buttonVariants.hover}
                      whileTap={buttonVariants.tap}
                      transition={{ duration: 0.2 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DeckList; 