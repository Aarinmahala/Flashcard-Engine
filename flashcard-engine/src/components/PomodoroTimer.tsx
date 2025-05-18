import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Add NodeJS.Timeout type declaration
declare namespace NodeJS {
  interface Timeout {}
}

interface PomodoroTimerProps {
  onComplete?: () => void;
}

type TimerMode = 'focus' | 'break';
type TimerSettings = {
  focus: number;
  shortBreak: number;
  longBreak: number;
  cyclesBeforeLongBreak: number;
};

const defaultSettings: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  cyclesBeforeLongBreak: 4
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onComplete }) => {
  const [minutes, setMinutes] = useState<number>(defaultSettings.focus);
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [cycles, setCycles] = useState<number>(0);
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showCompletionMessage, setShowCompletionMessage] = useState<boolean>(false);
  const [editedSettings, setEditedSettings] = useState<TimerSettings>(defaultSettings);
  
  // Interval ref to prevent issues with cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Play sound when timer completes
  const playSound = () => {
    if (!soundEnabled) return;
    
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };
  
  // Handle timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            clearInterval(intervalRef.current!);
            setIsActive(false);
            
            // Play notification sound
            playSound();
            
            // Show completion message
            setShowCompletionMessage(true);
            setTimeout(() => setShowCompletionMessage(false), 3000);
            
            // Handle cycle completion
            if (mode === 'focus') {
              // Switch to break mode
              setMode('break');
              const isLongBreak = cycles > 0 && (cycles % settings.cyclesBeforeLongBreak === 0);
              setMinutes(isLongBreak ? settings.longBreak : settings.shortBreak);
              if (onComplete) onComplete();
            } else {
              // Switch back to focus mode
              setMode('focus');
              setMinutes(settings.focus);
              setCycles(prev => prev + 1);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, minutes, seconds, mode, cycles, settings, onComplete, soundEnabled]);
  
  // Toggle timer start/pause
  const toggleTimer = () => {
    setIsActive(!isActive);
    
    // If starting from a completed state, reset the timer
    if (!isActive && minutes === 0 && seconds === 0) {
      if (mode === 'focus') {
        setMinutes(settings.focus);
      } else {
        const isLongBreak = cycles > 0 && (cycles % settings.cyclesBeforeLongBreak === 0);
        setMinutes(isLongBreak ? settings.longBreak : settings.shortBreak);
      }
    }
  };
  
  // Reset timer to initial state
  const resetTimer = () => {
    setIsActive(false);
    setMode('focus');
    setMinutes(settings.focus);
    setSeconds(0);
    setCycles(0);
    setShowCompletionMessage(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  // Skip to next phase
  const skipToNext = () => {
    setIsActive(false);
    setShowCompletionMessage(false);
    
    if (mode === 'focus') {
      setMode('break');
      const isLongBreak = cycles > 0 && (cycles % settings.cyclesBeforeLongBreak === 0);
      setMinutes(isLongBreak ? settings.longBreak : settings.shortBreak);
    } else {
      setMode('focus');
      setMinutes(settings.focus);
      setCycles(prev => prev + 1);
    }
    setSeconds(0);
  };
  
  // Apply settings
  const applySettings = () => {
    setSettings(editedSettings);
    
    // Update current timer if not active
    if (!isActive) {
      if (mode === 'focus') {
        setMinutes(editedSettings.focus);
      } else {
        const isLongBreak = cycles > 0 && (cycles % editedSettings.cyclesBeforeLongBreak === 0);
        setMinutes(isLongBreak ? editedSettings.longBreak : editedSettings.shortBreak);
      }
      setSeconds(0);
    }
    
    setShowSettings(false);
  };
  
  // Calculate progress percentage
  const getTotalSeconds = () => {
    if (mode === 'focus') {
      return settings.focus * 60;
    } else {
      const isLongBreak = cycles > 0 && (cycles % settings.cyclesBeforeLongBreak === 0);
      return (isLongBreak ? settings.longBreak : settings.shortBreak) * 60;
    }
  };
  
  const totalSeconds = getTotalSeconds();
  const currentSeconds = minutes * 60 + seconds;
  const progress = 1 - (currentSeconds / totalSeconds);
  
  // Get color scheme based on mode
  const getColorScheme = () => {
    if (mode === 'focus') {
      return {
        main: 'text-red-500 dark:text-red-400',
        bg: 'bg-red-500 dark:bg-red-600',
        ringBg: 'bg-red-100 dark:bg-red-900/30',
        progress: '#ef4444',
        progressDark: '#dc2626',
        overlay: 'bg-red-50 dark:bg-red-900/20'
      };
    } else {
      return {
        main: 'text-purple-500 dark:text-purple-400',
        bg: 'bg-purple-500 dark:bg-purple-600',
        ringBg: 'bg-purple-100 dark:bg-purple-900/30',
        progress: '#8b5cf6',
        progressDark: '#7c3aed',
        overlay: 'bg-purple-50 dark:bg-purple-900/20'
      };
    }
  };
  
  const colors = getColorScheme();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <svg className={`w-5 h-5 mr-2 ${colors.main}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Pomodoro Timer
        </h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={soundEnabled ? "Mute sound" : "Unmute sound"}
          >
            {soundEnabled ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Timer Display */}
      <div className="flex flex-col items-center mb-4">
        <div className="mb-2 text-sm font-medium flex items-center">
          <span className={`px-3 py-1 rounded-full ${colors.ringBg} ${colors.main}`}>
            {mode === 'focus' ? 'Focus Time' : (cycles > 0 && cycles % settings.cyclesBeforeLongBreak === 0 ? 'Long Break' : 'Short Break')}
          </span>
          
          {cycles > 0 && (
            <span className="ml-2 text-gray-500 dark:text-gray-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Cycle {cycles}
            </span>
          )}
        </div>
        
        <div className="relative w-48 h-48">
          {/* Background circle */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
              className="dark:opacity-20"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={colors.progress}
              strokeWidth="6"
              strokeDasharray="282.7"
              strokeDashoffset={282.7 * (1 - progress)}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 282.7 }}
              animate={{ strokeDashoffset: 282.7 * (1 - progress) }}
              transition={{ duration: 0.5 }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          
          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence>
              <motion.div
                key={`${minutes}-${seconds}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-bold"
              >
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Completion message overlay */}
          <AnimatePresence>
            {showCompletionMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 flex items-center justify-center rounded-full ${colors.overlay}`}
              >
                <div className="flex flex-col items-center p-3">
                  <svg className={`w-8 h-8 ${colors.main}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold mt-1">
                    {mode === 'focus' ? 'Break Time!' : 'Focus Time!'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex justify-center space-x-2">
        <motion.button
          onClick={toggleTimer}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${
            isActive
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              : `${colors.bg} text-white hover:opacity-90`
          }`}
        >
          {isActive ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start
            </>
          )}
        </motion.button>
        
        <motion.button
          onClick={resetTimer}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Reset
        </motion.button>
        
        <motion.button
          onClick={skipToNext}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
          </svg>
          Skip
        </motion.button>
      </div>
      
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Timer Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Focus Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editedSettings.focus}
                    onChange={e => setEditedSettings({...editedSettings, focus: parseInt(e.target.value) || defaultSettings.focus})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Short Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editedSettings.shortBreak}
                    onChange={e => setEditedSettings({...editedSettings, shortBreak: parseInt(e.target.value) || defaultSettings.shortBreak})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Long Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editedSettings.longBreak}
                    onChange={e => setEditedSettings({...editedSettings, longBreak: parseInt(e.target.value) || defaultSettings.longBreak})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cycles before Long Break
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editedSettings.cyclesBeforeLongBreak}
                    onChange={e => setEditedSettings({...editedSettings, cyclesBeforeLongBreak: parseInt(e.target.value) || defaultSettings.cyclesBeforeLongBreak})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setEditedSettings(defaultSettings)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={applySettings}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium transition-colors hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PomodoroTimer; 