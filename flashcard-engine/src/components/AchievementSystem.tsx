import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  condition: (stats: any) => boolean;
}

interface AchievementProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

// Not currently used in the app, but kept for future use
export const AchievementItem: React.FC<AchievementProps> = ({ achievement, isUnlocked }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 ${isUnlocked ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
          <span className="text-2xl">{achievement.icon}</span>
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`font-medium ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{achievement.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
        </div>
        {isUnlocked && (
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 dark:text-gray-400">Unlocked</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(achievement.unlockedAt!).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const AchievementNotification: React.FC<{ achievement: Achievement; onClose: () => void }> = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 max-w-sm z-50 border-l-4 border-green-500"
    >
      <div className="flex items-start">
        <div className="bg-green-100 dark:bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
          <span className="text-xl">{achievement.icon}</span>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 dark:text-white">Achievement Unlocked!</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{achievement.title}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Create the context type
interface AchievementContextType {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  notification: Achievement | null;
}

// Create the context with a default value
const AchievementContext = createContext<AchievementContextType | null>(null);

// Create the hook for using the achievement context
export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementSystem provider');
  }
  return context;
}

// Main component that provides the achievement context
function AchievementSystem({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notification, setNotification] = useState<Achievement | null>(null);
  
  // Define achievements
  useEffect(() => {
    const preDefinedAchievements: Achievement[] = [
      {
        id: 'first_card',
        title: 'First Steps',
        description: 'Create your first flashcard',
        icon: '🔖',
        unlockedAt: null,
        condition: (stats) => stats.cards.length > 0
      },
      {
        id: 'first_deck',
        title: 'Organizer',
        description: 'Create your first deck',
        icon: '📚',
        unlockedAt: null,
        condition: (stats) => stats.decks.length > 0
      },
      {
        id: 'ten_cards',
        title: 'Card Collector',
        description: 'Create 10 or more flashcards',
        icon: '🗃️',
        unlockedAt: null,
        condition: (stats) => stats.cards.length >= 10
      },
      {
        id: 'review_streak',
        title: 'Consistent Learner',
        description: 'Review cards for 3 days in a row',
        icon: '🔥',
        unlockedAt: null,
        condition: (stats) => {
          const reviewDays = new Map();
          stats.reviewStats.forEach((stat: any) => {
            const day = new Date(stat.date).toDateString();
            reviewDays.set(day, true);
          });
          
          if (reviewDays.size < 3) return false;
          
          // Check for streak
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const dayBefore = new Date(today);
          dayBefore.setDate(dayBefore.getDate() - 2);
          
          return (
            reviewDays.has(today.toDateString()) || 
            (reviewDays.has(yesterday.toDateString()) && 
             reviewDays.has(dayBefore.toDateString()))
          );
        }
      },
      {
        id: 'mastered_cards',
        title: 'Memory Master',
        description: 'Master 5 or more cards',
        icon: '🧠',
        unlockedAt: null,
        condition: (stats) => {
          return stats.cards.filter((card: any) => card.repetitions >= 4).length >= 5;
        }
      },
      {
        id: 'challenge_pro',
        title: 'Challenge Pro',
        description: 'Score 100+ points in Challenge Mode',
        icon: '🏆',
        unlockedAt: null,
        condition: (stats) => {
          return stats.highScores && stats.highScores.some((score: any) => score >= 100);
        }
      },
      {
        id: 'tag_master',
        title: 'Tag Master',
        description: 'Use 5 or more different tags',
        icon: '🏷️',
        unlockedAt: null,
        condition: (stats) => {
          const uniqueTags = new Set();
          stats.cards.forEach((card: any) => {
            if (card.tags) {
              card.tags.forEach((tag: any) => uniqueTags.add(tag));
            }
          });
          return uniqueTags.size >= 5;
        }
      },
      {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Study after 10 PM',
        icon: '🦉',
        unlockedAt: null,
        condition: (stats) => {
          return stats.reviewStats.some((stat: any) => {
            const reviewTime = new Date(stat.date);
            return reviewTime.getHours() >= 22 || reviewTime.getHours() <= 4;
          });
        }
      }
    ];
    
    // Define a map of condition functions by achievement ID
    const conditionMap = new Map(preDefinedAchievements.map(
      achievement => [achievement.id, achievement.condition]
    ));
    
    // Load previously unlocked achievements
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      try {
        const parsedAchievements = JSON.parse(savedAchievements);
        
        // Restore condition functions that may have been lost during serialization
        const restoredAchievements = parsedAchievements.map((achievement: Achievement) => {
          // Check if condition is not a function (it's lost during JSON serialization)
          if (typeof achievement.condition !== 'function') {
            // Restore the condition function from our predefined map
            const conditionFunc = conditionMap.get(achievement.id);
            if (conditionFunc) {
              return {
                ...achievement,
                condition: conditionFunc
              };
            }
          }
          return achievement;
        });
        
        setAchievements(restoredAchievements);
      } catch (error) {
        console.error('Error restoring achievements, using defaults:', error);
        setAchievements(preDefinedAchievements);
      }
    } else {
      setAchievements(preDefinedAchievements);
    }
  }, []);
  
  // Check for newly unlocked achievements
  useEffect(() => {
    const checkAchievements = () => {
      let updatedAchievements = [...achievements];
      let hasNewAchievement = false;
      
      updatedAchievements = updatedAchievements.map(achievement => {
        // Skip already unlocked achievements
        if (achievement.unlockedAt !== null) {
          return achievement;
        }
        
        // Check if the achievement condition is a function before calling it
        if (typeof achievement.condition === 'function') {
          try {
            // Check if the achievement condition is met
            if (achievement.condition(state)) {
              hasNewAchievement = true;
              return {
                ...achievement,
                unlockedAt: Date.now()
              };
            }
          } catch (error) {
            console.error(`Error evaluating condition for achievement ${achievement.id}:`, error);
          }
        }
        
        return achievement;
      });
      
      if (hasNewAchievement) {
        setAchievements(updatedAchievements);
        
        // Create a safe-to-serialize copy of achievements for localStorage
        // This avoids JSON serialization issues with the condition functions
        const serializableAchievements = updatedAchievements.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: achievement.unlockedAt,
          // Skip the function property, we'll restore it when loading
        }));
        
        localStorage.setItem('achievements', JSON.stringify(serializableAchievements));
        
        // Find the most recently unlocked achievement for notification
        const newlyUnlocked = updatedAchievements.find(
          a => a.unlockedAt !== null && !achievements.find(old => old.id === a.id && old.unlockedAt !== null)
        );
        
        if (newlyUnlocked) {
          setNotification(newlyUnlocked);
        }
      }
    };
    
    // Check achievements whenever state changes
    checkAchievements();
  }, [state, achievements]);
  
  const dismissNotification = () => {
    setNotification(null);
  };

  // Create context value
  const contextValue = {
    achievements,
    unlockedCount: achievements.filter(a => a.unlockedAt !== null).length,
    totalCount: achievements.length,
    notification
  };
  
  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
      
      <AnimatePresence>
        {notification && (
          <AchievementNotification
            achievement={notification}
            onClose={dismissNotification}
          />
        )}
      </AnimatePresence>
    </AchievementContext.Provider>
  );
}

export default AchievementSystem; 