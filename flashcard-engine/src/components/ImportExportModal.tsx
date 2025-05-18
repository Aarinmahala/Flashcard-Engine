import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { importData, importCardsFromCSV } from '../utils/importExport';

interface ImportExportModalProps {
  onClose: () => void;
}

const ImportExportModal = ({ onClose }: ImportExportModalProps) => {
  const { exportAllData, exportCurrentDeck, importDecksAndCards, addCards, state } = useApp();
  const { currentDeckId, decks } = state;
  
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportStatus('loading');
    setStatusMessage('Importing data...');
    
    try {
      const { decks, cards } = await importData(file);
      importDecksAndCards(decks, cards);
      
      setImportStatus('success');
      setStatusMessage(`Successfully imported ${decks.length} decks and ${cards.length} cards`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentDeckId) return;
    
    setIsImporting(true);
    setImportStatus('loading');
    setStatusMessage('Importing CSV...');
    
    try {
      const cards = await importCardsFromCSV(file, currentDeckId);
      const addedCards = addCards(cards);
      
      setImportStatus('success');
      setStatusMessage(`Successfully imported ${addedCards.length} cards`);
      
      // Reset file input
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    } catch (error) {
      setImportStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to import CSV');
    } finally {
      setIsImporting(false);
    }
  };

  const currentDeck = decks.find(deck => deck.id === currentDeckId);
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import & Export</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Status Messages */}
        <AnimatePresence>
          {importStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-3 rounded-md ${
                importStatus === 'loading' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 
                importStatus === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 
                'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}
            >
              {importStatus === 'loading' && (
                <div className="flex items-center">
                  <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {statusMessage}
                </div>
              )}
              
              {importStatus === 'success' && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {statusMessage}
                </div>
              )}
              
              {importStatus === 'error' && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {statusMessage}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Export Section */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Export</h3>
          <div className="space-y-3">
            <button
              onClick={exportAllData}
              className="btn btn-primary w-full justify-start"
              disabled={isImporting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export All Data
            </button>
            
            <button
              onClick={exportCurrentDeck}
              className="btn btn-secondary w-full justify-start dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              disabled={!currentDeckId || isImporting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Current Deck
              {currentDeck && <span className="ml-1 text-sm opacity-70">({currentDeck.name})</span>}
            </button>
          </div>
        </section>
        
        {/* Import Section */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Import</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                  ref={fileInputRef}
                  disabled={isImporting}
                />
                <div className="flex flex-col items-center">
                  <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Click to import JSON
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Import complete decks and cards
                  </span>
                </div>
              </label>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <label className={`cursor-pointer block ${!currentDeckId ? 'opacity-50' : ''}`}>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                  ref={csvFileInputRef}
                  disabled={!currentDeckId || isImporting}
                />
                <div className="flex flex-col items-center">
                  <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Click to import CSV to current deck
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentDeckId 
                      ? `CSV format: front,back or front tab back` 
                      : 'Select a deck first'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default ImportExportModal; 