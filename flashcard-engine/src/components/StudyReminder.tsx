import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getDueCards } from '../utils/spacedRepetition';

const StudyReminder = () => {
  const { state } = useApp();
  const { cards, currentDeckId } = state;
  
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    return localStorage.getItem('reminderEnabled') === 'true';
  });
  
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('reminderTime') || '18:00';
  });
  
  const [showNotification, setShowNotification] = useState(false);
  const [dueCardCount, setDueCardCount] = useState(0);
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('reminderEnabled', reminderEnabled.toString());
    localStorage.setItem('reminderTime', reminderTime);
  }, [reminderEnabled, reminderTime]);
  
  // Check for due cards and show notification if reminders are enabled
  useEffect(() => {
    const checkForDueCards = () => {
      const currentTime = new Date();
      const [hours, minutes] = reminderTime.split(':').map(Number);
      
      // Check if it's time for the reminder
      if (
        reminderEnabled && 
        currentTime.getHours() === hours && 
        currentTime.getMinutes() >= minutes && 
        currentTime.getMinutes() < minutes + 5 // Show for 5 minutes
      ) {
        const dueCards = getDueCards(cards);
        if (dueCards.length > 0) {
          setDueCardCount(dueCards.length);
          setShowNotification(true);
          
          // Try to send a browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification('Flashcard Study Reminder', {
              body: `You have ${dueCards.length} cards due for review!`,
              icon: '/favicon.ico'
            });
          }
        }
      }
    };
    
    // Check immediately and then every minute
    checkForDueCards();
    const interval = setInterval(checkForDueCards, 60000);
    
    return () => clearInterval(interval);
  }, [reminderEnabled, reminderTime, cards]);
  
  // Request notification permission when enabling reminders
  const handleEnableReminder = () => {
    const newState = !reminderEnabled;
    setReminderEnabled(newState);
    
    if (newState && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };
  
  return (
    <div className="mb-6">
      <div className="form-container">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <h2 className="heading-2">Study Reminder</h2>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={reminderEnabled}
                onChange={handleEnableReminder}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-800 dark:text-gray-300">
                Enable daily reminder
              </span>
            </label>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">Remind me at:</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="input max-w-[120px]"
              disabled={!reminderEnabled}
            />
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            {reminderEnabled 
              ? 'You will be reminded to study cards that are due for review' 
              : 'Enable reminders to maintain your study schedule'}
          </div>
        </div>
      </div>
      
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-xs"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="font-medium">Time to study!</p>
                <p className="mt-1 text-sm">
                  You have {dueCardCount} cards due for review.
                </p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => setShowNotification(false)}
                    className="bg-white/20 hover:bg-white/30 text-sm px-3 py-1.5 rounded"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyReminder; 