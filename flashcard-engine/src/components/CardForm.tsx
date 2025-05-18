import { useState, FormEvent, useRef, KeyboardEvent } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const CardForm = () => {
  const { state, addCard, getAllTags } = useApp();
  const { currentDeckId, decks } = state;
  
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  const tagInputRef = useRef<HTMLInputElement>(null);

  const currentDeck = decks.find(deck => deck.id === currentDeckId);
  const existingTags = getAllTags();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setIsSuccess(false);
    
    // Validate
    if (!front.trim() || !back.trim()) {
      setError('Both front and back of the card are required');
      return;
    }
    
    if (!currentDeckId) {
      setError('Please select a deck first');
      return;
    }
    
    setIsSubmitting(true);
    
    // Add the card (with a slight delay to show the loading state)
    try {
      setTimeout(() => {
        addCard(front.trim(), back.trim(), currentDeckId, selectedTags);
        
        // Reset form
        setFront('');
        setBack('');
        setSelectedTags([]);
        setIsSubmitting(false);
        setIsSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
      }, 300);
    } catch (err) {
      setError('Failed to create card');
      setIsSubmitting(false);
    }
  };
  
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput('');
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }
  };
  
  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && tagInput === '' && selectedTags.length > 0) {
      setSelectedTags(selectedTags.slice(0, -1));
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowTagSuggestions(e.target.value.trim() !== '');
  };
  
  const addTagSuggestion = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };
  
  const filteredSuggestions = tagInput.trim() !== '' 
    ? existingTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) && 
        !selectedTags.includes(tag)
      ).slice(0, 5)
    : [];

  // Don't render form if no deck is selected
  if (!currentDeckId) {
    return (
      <div className="form-container">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
          </svg>
          <p className="text-gray-500 font-medium mb-2">No Deck Selected</p>
          <p className="text-gray-400 text-sm">Please select or create a deck to add cards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            <path fillRule="evenodd" d="M7 5a1 1 0 011-1h3.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V15a1 1 0 01-1 1H8a1 1 0 01-1-1V5z" clipRule="evenodd" />
          </svg>
          <h2 className="heading-2">Add New Card</h2>
        </div>
        
        {currentDeck && (
          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            To: {currentDeck.name}
          </div>
        )}
      </div>
      
      {isSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Card successfully added!
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="cardFront" className="block text-sm font-medium text-gray-700 mb-1">
            Front (Question)
          </label>
          <textarea
            id="cardFront"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="input"
            placeholder="Enter the question or prompt"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="cardBack" className="block text-sm font-medium text-gray-700 mb-1">
            Back (Answer)
          </label>
          <textarea
            id="cardBack"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="input"
            placeholder="Enter the answer or explanation"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="cardTags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            {selectedTags.map(tag => (
              <div
                key={tag}
                className="bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full text-sm mr-2 mb-2 flex items-center"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  &times;
                </button>
              </div>
            ))}
            <div className="flex-1 relative">
              <input
                id="cardTags"
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onBlur={() => {
                  handleAddTag();
                  setShowTagSuggestions(false);
                }}
                onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
                className="border-none p-1 flex-1 focus:ring-0 focus:outline-none w-full bg-transparent dark:text-gray-100 min-w-[120px]"
                placeholder={selectedTags.length ? "" : "Add tags (press Enter or comma after each tag)"}
                disabled={isSubmitting}
              />
              {showTagSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg mt-1 w-full left-0">
                  {filteredSuggestions.map(tag => (
                    <div
                      key={tag}
                      className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm"
                      onClick={() => addTagSuggestion(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Organize your cards with tags for easier filtering and searching</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        )}
        
        <motion.button 
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Card...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Card
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default CardForm; 