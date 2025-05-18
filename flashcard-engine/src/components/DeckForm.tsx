import { useState, FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const DeckForm = () => {
  const { addDeck } = useApp();
  const [deckName, setDeckName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!deckName.trim()) {
      setError('Deck name is required');
      return;
    }
    
    setIsSubmitting(true);
    
    // Add the deck (with a slight delay to show the loading state)
    try {
      setTimeout(() => {
        addDeck(deckName.trim());
        
        // Reset form
        setDeckName('');
        setError('');
        setIsSubmitting(false);
      }, 300);
    } catch (err) {
      setError('Failed to create deck');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
        <h2 className="heading-2">Create New Deck</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="deckName" className="block text-sm font-medium text-gray-700 mb-1">
            Deck Name
          </label>
          <input
            type="text"
            id="deckName"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="input"
            placeholder="Enter a name for your new deck"
            disabled={isSubmitting}
          />
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}
        </div>
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
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Deck
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default DeckForm; 