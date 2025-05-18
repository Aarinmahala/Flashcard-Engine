import { useMemo, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { generateDemoReviewStats } from '../utils/helpers';

const ProgressDashboard = () => {
  // Use try-catch to prevent crashes in case the context isn't properly provided
  let appState = { cards: [], reviewStats: [], decks: [] };
  try {
    const { state } = useApp();
    appState = state || appState;
  } catch (error) {
    console.error("Error accessing app state:", error);
  }
  
  const { cards = [], reviewStats = [], decks = [] } = appState;
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showDemoData, setShowDemoData] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log('ProgressDashboard rendering with:', {
      cardsCount: cards?.length || 0,
      reviewStatsCount: reviewStats?.length || 0
    });
  }, [cards, reviewStats]);
  
  // Generate demo data for testing if needed
  const effectiveReviewStats = useMemo(() => {
    if (showDemoData || ((!reviewStats || reviewStats?.length === 0) && cards?.length > 0)) {
      console.log('Using demo review stats');
      return generateDemoReviewStats();
    }
    return reviewStats || [];
  }, [reviewStats, cards, showDemoData]);

  // Calculate current study streak
  const currentStreak = useMemo(() => {
    if (!effectiveReviewStats || effectiveReviewStats.length === 0) return 0;
    
    try {
      const sortedStats = [...effectiveReviewStats].sort((a, b) => (b?.date || 0) - (a?.date || 0));
      if (!sortedStats[0]?.date) return 0;
      
      const today = startOfDay(new Date()).getTime();
      const yesterday = startOfDay(addDays(new Date(), -1)).getTime();
      
      // Check if studied today or yesterday
      const mostRecentDate = startOfDay(new Date(sortedStats[0].date)).getTime();
      if (mostRecentDate !== today && mostRecentDate !== yesterday) {
        return 0; // Streak broken if not studied today or yesterday
      }
      
      let streakDays = 1;
      let currentDate = mostRecentDate === today ? yesterday : addDays(new Date(mostRecentDate), -1);
      
      for (let i = 1; i < sortedStats.length; i++) {
        if (!sortedStats[i]?.date) continue;
        
        const statDate = startOfDay(new Date(sortedStats[i].date)).getTime();
        
        if (statDate === currentDate.getTime()) {
          streakDays++;
          currentDate = addDays(currentDate, -1);
        } else if (statDate < currentDate.getTime()) {
          // Found a gap
          break;
        }
      }
      
      return streakDays;
    } catch (error) {
      console.error("Error calculating streak:", error);
      return 0;
    }
  }, [effectiveReviewStats]);
  
  // Card status statistics
  const cardStatusStats = useMemo(() => {
    const defaultStats = [
      { name: 'Due Now', value: 0, color: '#ef4444' },
      { name: 'Learning', value: 0, color: '#3b82f6' },
      { name: 'Mastered', value: 0, color: '#10b981' },
      { name: 'New', value: 0, color: '#6366f1' }
    ];
    
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return defaultStats;
    }
    
    try {
      const now = Date.now();
      
      // Count cards by status
      const counts = {
        due: 0,
        learning: 0,
        mastered: 0,
        new: 0
      };
      
      cards.forEach(card => {
        if (!card) return;
        
        if (!card.lastReviewed) {
          counts.new += 1;
        } else if (card.nextReview && card.nextReview <= now) {
          counts.due += 1;
        } else if (card.repetitions >= 4) {
          counts.mastered += 1;
        } else {
          counts.learning += 1;
        }
      });
      
      // Format for pie chart
      return [
        { name: 'Due Now', value: counts.due, color: '#ef4444' },
        { name: 'Learning', value: counts.learning, color: '#3b82f6' },
        { name: 'Mastered', value: counts.mastered, color: '#10b981' },
        { name: 'New', value: counts.new, color: '#6366f1' }
      ];
    } catch (error) {
      console.error("Error calculating card stats:", error);
      return defaultStats;
    }
  }, [cards]);
  
  // Weekly activity data
  const weeklyActivityData = useMemo(() => {
    if (!effectiveReviewStats || !Array.isArray(effectiveReviewStats)) return [];
    
    try {
      // Get sorted array of daily stats for the last 7 days, filling in missing days
      const today = startOfDay(new Date());
      const result = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = startOfDay(addDays(today, -i));
        const dateStr = format(date, 'MMM d');
        const dateTime = date.getTime();
        
        const dayStat = effectiveReviewStats.find(stat => {
          if (!stat || !stat.date) return false;
          return isSameDay(new Date(stat.date), date);
        });
        
        if (dayStat) {
          const correctAnswers = dayStat.correctAnswers || 0;
          const incorrectAnswers = dayStat.incorrectAnswers || 0;
          const total = correctAnswers + incorrectAnswers;
          const accuracy = total > 0 ? Math.round((correctAnswers / total) * 100) : 0;
          
          result.push({
            date: dateStr,
            cardsReviewed: total,
            accuracy: accuracy,
            timestamp: dateTime
          });
        } else {
          result.push({
            date: dateStr, 
            cardsReviewed: 0, 
            accuracy: 0,
            timestamp: dateTime
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error calculating weekly activity:", error);
      return [];
    }
  }, [effectiveReviewStats]);
  
  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const defaultMetrics = {
      totalReviews: 0,
      correctRate: 0,
      averageDailyReviews: 0,
      activeDecks: 0
    };
    
    if (!effectiveReviewStats || !Array.isArray(effectiveReviewStats) || effectiveReviewStats.length === 0) {
      return defaultMetrics;
    }
    
    try {
      let totalReviews = 0;
      let totalCorrect = 0;
      
      effectiveReviewStats.forEach(stat => {
        if (!stat) return;
        totalReviews += (stat.cardsReviewed || 0);
        totalCorrect += (stat.correctAnswers || 0);
      });
      
      const correctRate = totalReviews > 0 
        ? Math.round((totalCorrect / totalReviews) * 100) 
        : 0;
      
      // Count active decks (decks with at least one reviewed card)
      const activeDecks = Array.isArray(decks) 
        ? decks.filter(deck => deck && deck.lastReviewed !== null).length
        : 0;
      
      return {
        totalReviews,
        correctRate,
        averageDailyReviews: Math.round(totalReviews / Math.max(effectiveReviewStats.length, 1)),
        activeDecks
      };
    } catch (error) {
      console.error("Error calculating performance metrics:", error);
      return defaultMetrics;
    }
  }, [effectiveReviewStats, decks]);

  // Get due cards count safely
  const dueCardsCount = useMemo(() => {
    try {
      const dueCardStat = cardStatusStats.find(s => s.name === 'Due Now');
      return dueCardStat?.value || 0;
    } catch (error) {
      console.error("Error getting due cards:", error);
      return 0;
    }
  }, [cardStatusStats]);
  
  // Handle empty state
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
        <h2 className="text-xl font-semibold mb-5">Your Learning Progress</h2>
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <p className="mb-2">Add some cards to start tracking your progress.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Your Learning Progress</h2>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <button
            onClick={() => setShowDemoData(!showDemoData)}
            className="text-xs px-3 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
          >
            {showDemoData ? 'Hide Demo Data' : 'Show Demo Data'}
          </button>
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="text-xs px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
        </div>
      </div>
      
      {/* Quick Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-500 dark:text-blue-300">Current Streak</div>
          <div className="text-2xl font-bold flex items-center">
            {currentStreak} {currentStreak > 0 && (
              <svg className="w-5 h-5 ml-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
              </svg>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">days in a row</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-500 dark:text-green-300">Success Rate</div>
          <div className="text-2xl font-bold">{performanceMetrics.correctRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">correct answers</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-sm text-purple-500 dark:text-purple-300">Total Reviews</div>
          <div className="text-2xl font-bold">{performanceMetrics.totalReviews}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">cards reviewed</div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-sm text-yellow-500 dark:text-yellow-300">Due Cards</div>
          <div className="text-2xl font-bold">{dueCardsCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">cards to review</div>
        </div>
      </div>
      
      {/* Card status overview */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Card Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-60">
            {cardStatusStats.some(stat => stat.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cardStatusStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {cardStatusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cards`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No card data available</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-3">
              {cardStatusStats.map((stat, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</span>
                  <div className="flex items-center mt-1">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: stat.color }}></div>
                    <span className="text-xl font-bold">{stat.value}</span>
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      ({Math.round((stat.value / Math.max(cards?.length || 1, 1)) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Weekly activity chart */}
      {weeklyActivityData.some(day => day.cardsReviewed > 0) ? (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Weekly Activity</h3>
          <div className="bg-white dark:bg-gray-800 p-1 rounded-lg h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyActivityData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="cardsReviewed" name="Cards Reviewed" fill="#3b82f6" />
                <Bar yAxisId="right" dataKey="accuracy" name="Accuracy %" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Weekly Activity</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-full mr-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-medium">No activity recorded yet</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Review some cards to see your weekly activity chart.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug info */}
      {showDebugInfo && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-x-auto">
          <h3 className="text-lg font-medium mb-3 text-red-600 dark:text-red-400">Debug Information</h3>
          <div className="space-y-2 text-sm">
            <div className="font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p>Cards Count: {cards?.length || 0}</p>
              <p>Review Stats Count: {reviewStats?.length || 0}</p>
              <p>Current Streak: {currentStreak}</p>
              <p>Total Reviews: {performanceMetrics.totalReviews}</p>
            </div>
            
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
                Review Stats Data ({effectiveReviewStats?.length || 0} entries)
              </summary>
              <pre className="mt-2 overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                {JSON.stringify(effectiveReviewStats?.map(stat => ({
                  date: stat?.date ? new Date(stat.date).toISOString().split('T')[0] : 'invalid date',
                  cardsReviewed: stat?.cardsReviewed || 0,
                  correctAnswers: stat?.correctAnswers || 0,
                  incorrectAnswers: stat?.incorrectAnswers || 0
                })), null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard; 