import { format, isToday, isTomorrow, addDays, startOfDay, isThisWeek, parseISO, isSameDay, subDays } from 'date-fns';
import { Card, DailyStats, Deck, ReviewStats, CardStatusCounts, PerformanceMetrics } from '../types';

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Format the next review date in a human-readable way
 */
export const formatNextReview = (nextReview: number | null): string => {
  if (!nextReview) {
    return 'Not reviewed yet';
  }
  
  const date = new Date(nextReview);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  
  if (isThisWeek(date)) {
    return format(date, 'EEEE'); // Day of week
  }
  
  return format(date, 'MMM d, yyyy');
};

/**
 * Create a new deck object
 */
export const createDeck = (name: string): Deck => {
  return {
    id: generateId(),
    name,
    createdAt: Date.now(),
    lastReviewed: null
  };
};

/**
 * Create a new card object
 */
export const createCard = (front: string, back: string, deckId: string, tags: string[] = []): Partial<Card> => {
  return {
    id: generateId(),
    front,
    back,
    deckId,
    tags
  };
};

/**
 * Get or create today's review stats
 */
export const getTodayStats = (allStats: ReviewStats[]): ReviewStats => {
  const today = startOfDay(new Date()).getTime();
  
  const todayStats = allStats.find(
    stats => startOfDay(new Date(stats.date)).getTime() === today
  );
  
  if (todayStats) {
    return todayStats;
  }
  
  // Create new stats for today
  return {
    date: today,
    cardsReviewed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  };
};

/**
 * Calculate and format daily stats for charting
 */
export const calculateDailyStats = (reviewStats: ReviewStats[]): DailyStats[] => {
  if (reviewStats.length === 0) {
    return [];
  }
  
  // Create an array of the last 7 days
  const today = startOfDay(new Date());
  const result: DailyStats[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = startOfDay(subDays(today, i));
    const dateTime = date.getTime();
    const dateStr = format(date, 'MMM d');
    
    // Find stats for this day
    const dayStat = reviewStats.find(stat => 
      isSameDay(new Date(stat.date), date)
    );
    
    if (dayStat) {
      const total = dayStat.correctAnswers + dayStat.incorrectAnswers;
      const accuracy = total > 0 ? Math.round((dayStat.correctAnswers / total) * 100) : 0;
      
      result.push({
        date: dateStr,
        cardsReviewed: total,
        accuracy,
        timestamp: dateTime
      });
    } else {
      // No reviews on this day
      result.push({
        date: dateStr,
        cardsReviewed: 0,
        accuracy: 0,
        timestamp: dateTime
      });
    }
  }
  
  return result;
};

/**
 * Calculate card status counts
 */
export const calculateCardStatusCounts = (cards: Card[]): CardStatusCounts => {
  const now = Date.now();
  const counts: CardStatusCounts = {
    due: 0,
    learning: 0,
    mastered: 0,
    new: 0
  };
  
  cards.forEach(card => {
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
  
  return counts;
};

/**
 * Calculate study streak (consecutive days of study)
 */
export const calculateStudyStreak = (reviewStats: ReviewStats[]): number => {
  if (reviewStats.length === 0) return 0;
  
  const sortedStats = [...reviewStats].sort((a, b) => b.date - a.date);
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
};

/**
 * Calculate the longest study streak
 */
export const calculateLongestStreak = (reviewStats: ReviewStats[]): number => {
  if (reviewStats.length === 0) return 0;
  
  const sortedDates = [...reviewStats]
    .map(stat => startOfDay(new Date(stat.date)).getTime())
    .sort((a, b) => a - b);
  
  const uniqueDates = Array.from(new Set(sortedDates));
  
  let currentStreak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDay = addDays(new Date(uniqueDates[i-1]), 1).getTime();
    
    if (prevDay === uniqueDates[i]) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

/**
 * Calculate performance metrics
 */
export const calculatePerformanceMetrics = (
  reviewStats: ReviewStats[], 
  cards: Card[], 
  decks: Deck[]
): PerformanceMetrics => {
  if (reviewStats.length === 0) {
    return {
      totalReviews: 0,
      correctRate: 0,
      averageDailyReviews: 0,
      activeDecks: 0
    };
  }
  
  const totalReviews = reviewStats.reduce((sum, stat) => 
    sum + stat.cardsReviewed, 0);
  const totalCorrect = reviewStats.reduce((sum, stat) => 
    sum + stat.correctAnswers, 0);
  const correctRate = totalReviews > 0 
    ? Math.round((totalCorrect / totalReviews) * 100) 
    : 0;
  
  // Calculate days with activity
  const uniqueDays = new Set(
    reviewStats.map(stat => startOfDay(new Date(stat.date)).getTime())
  );
  const activeDays = uniqueDays.size;
  
  // Calculate average daily reviews on active days
  const averageDailyReviews = activeDays > 0 
    ? Math.round(totalReviews / activeDays) 
    : 0;
  
  // Count active decks (decks with at least one reviewed card)
  const activeDecks = decks.filter(deck => deck.lastReviewed !== null).length;
  
  return {
    totalReviews,
    correctRate,
    averageDailyReviews,
    activeDecks
  };
};

/**
 * Calculate the number of cards due today
 */
export const calculateDueCards = (cards: Card[]): number => {
  const now = Date.now();
  
  return cards.filter(card => {
    if (card.nextReview === null) {
      return true; // New cards are due
    }
    return card.nextReview <= now;
  }).length;
};

/**
 * Calculate the number of cards due in the coming week
 */
export const calculateUpcomingCards = (cards: Card[]): number => {
  const now = Date.now();
  const nextWeek = addDays(now, 7).getTime();
  
  return cards.filter(card => {
    if (card.nextReview === null) {
      return true; // New cards are due
    }
    return card.nextReview > now && card.nextReview <= nextWeek;
  }).length;
};

/**
 * Generate demo review statistics for testing
 */
export const generateDemoReviewStats = (): ReviewStats[] => {
  const today = new Date();
  const stats: ReviewStats[] = [];
  
  // Generate stats for the last 14 days
  for (let i = 0; i < 14; i++) {
    const date = startOfDay(addDays(today, -i)).getTime();
    
    // Skip some days to simulate breaks in study
    if (i === 3 || i === 7) continue;
    
    const correctAnswers = Math.floor(Math.random() * 10) + 5; // 5-15 correct answers
    const incorrectAnswers = Math.floor(Math.random() * 5); // 0-4 incorrect answers
    
    stats.push({
      date,
      cardsReviewed: correctAnswers + incorrectAnswers,
      correctAnswers,
      incorrectAnswers
    });
  }
  
  return stats;
}; 