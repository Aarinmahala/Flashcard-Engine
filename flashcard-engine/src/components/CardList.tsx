import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../types';
import { formatNextReview } from '../utils/helpers';

const CardList = () => {
  const { state, deleteCard } = useApp();
  const { cards, currentDeckId } = state;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const currentDeckCards = useMemo(() => {
    if (!currentDeckId) return [];
    
    return cards
      .filter(card => card.deckId === currentDeckId)
      .filter(card => {
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            card.front.toLowerCase().includes(query) || 
            card.back.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter(card => {
        // Filter by selected tag
        if (selectedTag) {
          return card.tags.includes(selectedTag);
        }
        return true;
      });
  }, [cards, currentDeckId, searchQuery, selectedTag]);
  
  // Get all unique tags used in the current deck
  const deckTags = useMemo(() => {
    if (!currentDeckId) return [];
    
    const tagsSet = new Set<string>();
    
    cards
      .filter(card => card.deckId === currentDeckId)
      .forEach(card => {
        card.tags.forEach(tag => {
          tagsSet.add(tag);
        });
      });
    
    return Array.from(tagsSet).sort();
  }, [cards, currentDeckId]);
  
  if (!currentDeckId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-6">
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Please select a deck to view cards
        </div>
      </div>
    );
  }
  
  if (currentDeckCards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-6">
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {searchQuery || selectedTag
            ? 'No cards match your filters'
            : 'No cards in this deck yet'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Cards</h2>
        
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {deckTags.length > 0 && (
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="input w-full md:w-auto"
            >
              <option value="">All Tags</option>
              {deckTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Front
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Back
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tags
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Next Review
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentDeckCards.map(card => (
              <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {card.front.length > 40
                    ? `${card.front.substring(0, 40)}...`
                    : card.front}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {card.back.length > 40
                    ? `${card.back.substring(0, 40)}...`
                    : card.back}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex flex-wrap gap-1">
                    {card.tags.length > 0 ? (
                      card.tags.map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">No tags</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatNextReview(card.nextReview)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CardList; 