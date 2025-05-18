import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { getDueCards } from '../utils/spacedRepetition';

interface HeaderProps {
  onOpenStats: () => void;
  onOpenImportExport: () => void;
}

const Header = ({ onOpenStats, onOpenImportExport }: HeaderProps) => {
  const { state, setCurrentDeck } = useApp();
  const { darkMode, toggleDarkMode } = useTheme();
  const { decks, cards, currentDeckId } = state;
  
  const currentDeck = decks.find(deck => deck.id === currentDeckId);
  const dueCardCount = getDueCards(cards, currentDeckId || undefined).length;
  
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-900 dark:to-blue-700 text-white p-4 shadow-md transition-colors duration-200">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM5 19V5H11V19H5ZM19 19H13V12H19V19ZM19 10H13V5H19V10Z" fill="currentColor"/>
          </svg>
          <h1 className="text-2xl font-bold">Flashcard Engine</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <select 
              className="bg-white/10 text-white py-2 pl-4 pr-8 rounded-lg cursor-pointer border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
              value={currentDeckId || ''}
              onChange={e => setCurrentDeck(e.target.value || null)}
            >
              <option value="" className="text-gray-800 dark:text-gray-200">Select Deck</option>
              {decks.map(deck => (
                <option key={deck.id} value={deck.id} className="text-gray-800 dark:text-gray-200">
                  {deck.name}
                </option>
              ))}
            </select>
            <svg className="absolute right-2 w-4 h-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {currentDeck && dueCardCount > 0 && (
            <div className="bg-white/20 px-3 py-1 rounded-full flex items-center">
              <span className="font-semibold">{dueCardCount}</span>
              <span className="ml-1">cards due</span>
            </div>
          )}
          
          <button
            onClick={onOpenImportExport}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors border border-white/20 flex items-center"
            aria-label="Import/export data"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors border border-white/20 flex items-center"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={onOpenStats}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/20 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V17.25L12 21L21 17.25V3H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.5 8.25C16.5 7.65326 16.2629 7.08097 15.841 6.65901C15.419 6.23705 14.8467 6 14.25 6C13.6533 6 13.081 6.23705 12.659 6.65901C12.2371 7.08097 12 7.65326 12 8.25H16.5ZM16.5 8.25V15.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8.25V15.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 12.75V15.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Stats
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 