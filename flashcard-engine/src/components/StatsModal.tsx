import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { calculateDailyStats, calculateDueCards, calculateUpcomingCards } from '../utils/helpers';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';

interface StatsModalProps {
  onClose: () => void;
}

const StatsModal = ({ onClose }: StatsModalProps) => {
  const { state } = useApp();
  const { cards, reviewStats } = state;
  
  const totalCards = cards.length;
  const dueToday = calculateDueCards(cards);
  const dueThisWeek = calculateUpcomingCards(cards);
  const dailyStats = calculateDailyStats(reviewStats);
  
  const totalReviewed = reviewStats.reduce(
    (sum, day) => sum + day.cardsReviewed, 
    0
  );
  
  const totalCorrect = reviewStats.reduce(
    (sum, day) => sum + day.correctAnswers, 
    0
  );
  
  const overallAccuracy = totalReviewed > 0 
    ? Math.round((totalCorrect / totalReviewed) * 100) 
    : 0;
  
  // Data for the pie chart
  const pieData = [
    { name: 'Due Today', value: dueToday, color: '#3b82f6' },
    { name: 'Due This Week', value: dueThisWeek, color: '#93c5fd' },
    { name: 'Later', value: Math.max(0, totalCards - dueToday - dueThisWeek), color: '#dbeafe' },
  ];
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Review Statistics</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-blue-600 text-lg font-medium mb-1">Total Cards</div>
              <div className="text-3xl font-bold">{totalCards}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-green-600 text-lg font-medium mb-1">Overall Accuracy</div>
              <div className="text-3xl font-bold">{overallAccuracy}%</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-purple-600 text-lg font-medium mb-1">Cards Reviewed</div>
              <div className="text-3xl font-bold">{totalReviewed}</div>
            </div>
          </div>
          
          {/* Visualizations */}
          <div className="space-y-8">
            {/* Cards due distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Card Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Daily review count */}
            {dailyStats.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Daily Reviews</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cardsReviewed" fill="#3b82f6" name="Cards Reviewed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* Accuracy trend */}
            {dailyStats.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Accuracy Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#10b981" 
                        name="Accuracy (%)" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsModal; 