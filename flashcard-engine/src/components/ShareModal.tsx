import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Deck } from '../types';
import QRCode from 'react-qr-code';

interface ShareModalProps {
  deck: Deck;
  cards: Card[];
  onClose: () => void;
}

const ShareModal = ({ deck, cards, onClose }: ShareModalProps) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Generate a shareable URL with data encoded in a compressed format
  useEffect(() => {
    const shareData = {
      deck: {
        name: deck.name,
        id: deck.id
      },
      cards: cards.map(card => ({
        front: card.front,
        back: card.back,
        tags: card.tags
      }))
    };
    
    // Compress the data
    const jsonData = JSON.stringify(shareData);
    const compressedData = btoa(encodeURIComponent(jsonData));
    
    // Create the share URL
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}?share=${compressedData}`;
    
    setShareUrl(shareUrl);
  }, [deck, cards]);
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Reset the "Copied" state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-5 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Share Deck: {deck.name}</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-1">
            Share this deck with {cards.length} flashcards
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">QR Code</h3>
            <div className="bg-white p-4 rounded-lg flex justify-center">
              <QRCode 
                value={shareUrl} 
                size={200}
                fgColor="#1e40af"
                bgColor="#ffffff"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              Scan this code to view or import this deck
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">Share Link</h3>
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-r-md font-medium transition-colors ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Anyone with this link can view and import this deck into their Flashcard Engine.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareModal; 