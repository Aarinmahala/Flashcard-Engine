import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: number;
  cardsCompleted: number;
  maxCombo: number;
}

const STORAGE_KEY = 'challenge_leaderboard';

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  
  useEffect(() => {
    // Load leaderboard from localStorage
    const savedEntries = localStorage.getItem(STORAGE_KEY);
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);
  
  const addEntry = (entry: LeaderboardEntry) => {
    const newEntries = [...entries, entry];
    // Sort by score (highest first)
    newEntries.sort((a, b) => b.score - a.score);
    // Keep only top 10
    const topEntries = newEntries.slice(0, 10);
    
    setEntries(topEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topEntries));
    
    // Return the rank (1-based)
    return newEntries.findIndex(e => e === entry) + 1;
  };
  
  const clearLeaderboard = () => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  };
  
  return {
    entries,
    addEntry,
    clearLeaderboard,
  };
};

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  highlightEntry?: string;
  onClear?: () => void;
  showControls?: boolean;
}

const Leaderboard = ({ entries, highlightEntry, onClear, showControls = true }: LeaderboardProps) => {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  
  const handleClearConfirm = () => {
    if (window.confirm('Are you sure you want to clear the leaderboard? This cannot be undone.')) {
      onClear?.();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 text-white">
        <h2 className="text-xl font-bold">Challenge Mode Leaderboard</h2>
        <p className="text-yellow-100 text-sm">Top scores from your challenge sessions</p>
      </div>
      
      <div className="p-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="mb-2 text-lg">No scores yet!</p>
            <p className="text-sm">Play Challenge Mode to earn your spot on the leaderboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {entries.map((entry, index) => (
                  <motion.tr 
                    key={`${entry.name}-${entry.date}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${
                      highlightEntry === entry.name && entry.date.toString() === highlightEntry.split('-')[1]
                        ? 'bg-yellow-50 dark:bg-yellow-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      {index === 0 ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-white font-bold text-sm">
                          1
                        </span>
                      ) : index === 1 ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-400 text-white font-bold text-sm">
                          2
                        </span>
                      ) : index === 2 ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-700 text-white font-bold text-sm">
                          3
                        </span>
                      ) : (
                        <span className="pl-2">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{entry.name}</td>
                    <td className="px-4 py-3 font-semibold">{entry.score}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {showControls && onClear && entries.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearConfirm}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
            >
              Clear Leaderboard
            </button>
          </div>
        )}
      </div>
      
      {/* Detail modal */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEntry(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Score Details</h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="text-center mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">{selectedEntry.name}</h4>
                  <p className="text-3xl font-bold text-yellow-500">{selectedEntry.score}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(selectedEntry.date).toLocaleString()}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Cards Completed</div>
                    <div className="text-xl font-semibold">{selectedEntry.cardsCompleted}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Highest Combo</div>
                    <div className="text-xl font-semibold">{selectedEntry.maxCombo}x</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard; 