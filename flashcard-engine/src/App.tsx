import { useState, useEffect } from 'react';
import AppProvider from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import DeckForm from './components/DeckForm';
import CardForm from './components/CardForm';
import DeckList from './components/DeckList';
import CardList from './components/CardList';
import ReviewMode from './components/ReviewMode';
import LearningMode from './components/LearningMode';
import ChallengeGame from './components/ChallengeGame';
import PomodoroTimer from './components/PomodoroTimer';
import ProgressDashboard from './components/ProgressDashboard';
import StatsModal from './components/StatsModal';
import ImportExportModal from './components/ImportExportModal';
import WelcomeScreen from './components/WelcomeScreen';
import StudyReminder from './components/StudyReminder';
import AchievementSystem from './components/AchievementSystem';
import { AnimatePresence, motion } from 'framer-motion';
import { clearState } from './utils/storage';

function App() {
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [activeTab, setActiveTab] = useState<'cards' | 'progress'>('cards');
  
  useEffect(() => {
    setShowWelcomeScreen(true);
    localStorage.setItem('hasVisitedBefore', 'true');
  }, []);
  
  const handlePomodoroComplete = () => {
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: 'Take a break or continue studying.',
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  return (
    <ThemeProvider>
      <AppProvider>
        <AchievementSystem>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Header 
              onOpenStats={() => setIsStatsModalOpen(true)} 
              onOpenImportExport={() => setIsImportExportModalOpen(true)}
            />
            
            <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex-1">
              {isReviewMode ? (
                <ReviewMode onExit={() => setIsReviewMode(false)} />
              ) : isLearningMode ? (
                <LearningMode onExit={() => setIsLearningMode(false)} />
              ) : isChallengeMode ? (
                <ChallengeGame onExit={() => setIsChallengeMode(false)} />
              ) : (
                <>
                  <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <div className="flex whitespace-nowrap">
                      <button
                        className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                          activeTab === 'cards'
                            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                            : 'border-transparent hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        onClick={() => setActiveTab('cards')}
                      >
                        My Flashcards
                      </button>
                      <button
                        className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                          activeTab === 'progress'
                            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                            : 'border-transparent hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        onClick={() => setActiveTab('progress')}
                      >
                        My Progress
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2">
                      {activeTab === 'cards' ? (
                        <>
                          <DeckList />
                          <CardList />
                        </>
                      ) : (
                        <>
                          <ProgressDashboard />
                          <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">Troubleshooting</h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                              If you're experiencing issues with the progress dashboard, you can try the following:
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                              <button
                                onClick={() => window.location.reload()}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Refresh Page
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to reset the application? This will delete all your decks, cards, and progress.')) {
                                    clearState();
                                    window.location.reload();
                                  }
                                }}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                              >
                                Reset Application
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                      >
                        <h2 className="text-xl font-semibold mb-3">Study Options</h2>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Review Mode</h3>
                            <p className="text-sm mb-3 text-blue-100">
                              Traditional spaced repetition review of due cards
                            </p>
                            <button 
                              onClick={() => setIsReviewMode(true)}
                              className="w-full py-2 bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400 font-medium rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Start Review
                            </button>
                          </div>
                          
                          <div className="bg-purple-600 dark:bg-purple-700 text-white p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Learning Mode</h3>
                            <p className="text-sm mb-3 text-purple-100">
                              Learn with progressive hints
                            </p>
                            <button 
                              onClick={() => setIsLearningMode(true)}
                              className="w-full py-2 bg-white text-purple-600 dark:bg-gray-800 dark:text-purple-400 font-medium rounded-md hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Start Learning
                            </button>
                          </div>
                          
                          <div className="bg-green-600 dark:bg-green-700 text-white p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Challenge Mode</h3>
                            <p className="text-sm mb-3 text-green-100">
                              Test your knowledge with a timed quiz game
                            </p>
                            <button 
                              onClick={() => setIsChallengeMode(true)}
                              className="w-full py-2 bg-white text-green-600 dark:bg-gray-800 dark:text-green-400 font-medium rounded-md hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Start Challenge
                            </button>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <PomodoroTimer onComplete={handlePomodoroComplete} />
                      </motion.div>
                      
                      <StudyReminder />
                      {activeTab === 'cards' && (
                        <>
                          <DeckForm />
                          <CardForm />
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </main>
            
            <footer className="bg-gray-100 dark:bg-gray-800 py-4 text-center text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200">
              <div className="container mx-auto">
                Flashcard Engine with Spaced Repetition
              </div>
            </footer>
            
            <AnimatePresence>
              {isStatsModalOpen && (
                <StatsModal onClose={() => setIsStatsModalOpen(false)} />
              )}
              
              {isImportExportModalOpen && (
                <ImportExportModal onClose={() => setIsImportExportModalOpen(false)} />
              )}
              
              {showWelcomeScreen && (
                <WelcomeScreen onDismiss={() => setShowWelcomeScreen(false)} />
              )}
            </AnimatePresence>
          </div>
        </AchievementSystem>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App; 