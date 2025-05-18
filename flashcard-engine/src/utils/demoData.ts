import { Card, Deck } from '../types';
import { generateId } from './helpers';
import { initializeCardForSRS } from './spacedRepetition';

// Language demo deck
const languageDemoCards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[] = [
  {
    front: "¿Cómo estás?",
    back: "How are you?",
    deckId: '',
    tags: ['spanish', 'greeting', 'beginner']
  },
  {
    front: "Buenos días",
    back: "Good morning",
    deckId: '',
    tags: ['spanish', 'greeting', 'beginner']
  },
  {
    front: "Me llamo...",
    back: "My name is...",
    deckId: '',
    tags: ['spanish', 'introduction', 'beginner']
  },
  {
    front: "Gracias",
    back: "Thank you",
    deckId: '',
    tags: ['spanish', 'courtesy', 'beginner']
  },
  {
    front: "Por favor",
    back: "Please",
    deckId: '',
    tags: ['spanish', 'courtesy', 'beginner']
  },
  {
    front: "Je m'appelle...",
    back: "My name is...",
    deckId: '',
    tags: ['french', 'introduction', 'beginner']
  },
  {
    front: "Comment allez-vous?",
    back: "How are you?",
    deckId: '',
    tags: ['french', 'greeting', 'beginner']
  },
  {
    front: "Bonjour",
    back: "Hello / Good day",
    deckId: '',
    tags: ['french', 'greeting', 'beginner']
  },
  {
    front: "¿Dónde está el baño?",
    back: "Where is the bathroom?",
    deckId: '',
    tags: ['spanish', 'travel', 'beginner']
  },
  {
    front: "Necesito ayuda",
    back: "I need help",
    deckId: '',
    tags: ['spanish', 'emergency', 'beginner']
  },
  {
    front: "¿Cuánto cuesta?",
    back: "How much does it cost?",
    deckId: '',
    tags: ['spanish', 'shopping', 'beginner']
  },
  {
    front: "Je voudrais...",
    back: "I would like...",
    deckId: '',
    tags: ['french', 'restaurant', 'beginner']
  },
  {
    front: "Où est la gare?",
    back: "Where is the train station?",
    deckId: '',
    tags: ['french', 'travel', 'beginner']
  },
  {
    front: "Merci beaucoup",
    back: "Thank you very much",
    deckId: '',
    tags: ['french', 'courtesy', 'beginner']
  },
];

// Science demo deck
const scienceDemoCards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[] = [
  {
    front: "What is photosynthesis?",
    back: "The process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water.",
    deckId: '',
    tags: ['biology', 'plants']
  },
  {
    front: "What is Newton's First Law of Motion?",
    back: "An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an external force.",
    deckId: '',
    tags: ['physics', 'newton']
  },
  {
    front: "What is the chemical formula for water?",
    back: "H₂O",
    deckId: '',
    tags: ['chemistry', 'simple']
  },
  {
    front: "What are the three states of matter?",
    back: "Solid, liquid, and gas. (Plasma is often considered the fourth state.)",
    deckId: '',
    tags: ['physics', 'chemistry', 'basics']
  },
  {
    front: "What is the law of conservation of energy?",
    back: "Energy can neither be created nor destroyed; it can only be transferred or converted from one form to another.",
    deckId: '',
    tags: ['physics', 'energy']
  },
  {
    front: "What is the difference between mitosis and meiosis?",
    back: "Mitosis results in two genetically identical diploid cells, while meiosis produces four genetically diverse haploid cells used in sexual reproduction.",
    deckId: '',
    tags: ['biology', 'cells', 'reproduction']
  },
  {
    front: "What is Avogadro's number?",
    back: "6.022 × 10²³, representing the number of atoms or molecules in one mole of a substance.",
    deckId: '',
    tags: ['chemistry', 'molecules', 'constants']
  },
  {
    front: "What is the Heisenberg Uncertainty Principle?",
    back: "It states that we cannot simultaneously know the exact position and momentum of a particle, with high precision.",
    deckId: '',
    tags: ['physics', 'quantum', 'advanced']
  },
  {
    front: "What is the pH scale?",
    back: "A logarithmic scale used to specify the acidity or basicity of an aqueous solution, ranging from 0 (most acidic) to 14 (most basic).",
    deckId: '',
    tags: ['chemistry', 'acids', 'basics']
  },
  {
    front: "What is the Krebs cycle?",
    back: "A series of chemical reactions used by all aerobic organisms to release stored energy through the oxidation of acetyl-CoA derived from carbohydrates, fats, and proteins.",
    deckId: '',
    tags: ['biology', 'metabolism', 'cellular']
  },
];

// Programming demo deck
const programmingDemoCards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[] = [
  {
    front: "What is a variable in programming?",
    back: "A storage location paired with an associated symbolic name, which contains some known or unknown quantity of information referred to as a value.",
    deckId: '',
    tags: ['basics', 'variables']
  },
  {
    front: "What is a function in programming?",
    back: "A block of code designed to perform a particular task, which can be reused throughout the program.",
    deckId: '',
    tags: ['basics', 'functions']
  },
  {
    front: "What is a loop in programming?",
    back: "A sequence of instructions that is continually repeated until a certain condition is reached.",
    deckId: '',
    tags: ['basics', 'loops', 'control-flow']
  },
  {
    front: "What is an array in programming?",
    back: "A data structure consisting of a collection of elements, each identified by an index.",
    deckId: '',
    tags: ['basics', 'data-structures']
  },
  {
    front: "What is Object-Oriented Programming (OOP)?",
    back: "A programming paradigm based on the concept of objects, which can contain data and code: data in the form of fields, and code in the form of procedures.",
    deckId: '',
    tags: ['paradigms', 'advanced']
  },
  {
    front: "What is a callback function?",
    back: "A function passed as an argument to another function, to be executed after some operation has been completed.",
    deckId: '',
    tags: ['functions', 'advanced', 'javascript']
  },
  {
    front: "What is the difference between == and === in JavaScript?",
    back: "== compares values with type conversion, while === compares both values and types without conversion.",
    deckId: '',
    tags: ['javascript', 'operators', 'comparison']
  },
  {
    front: "What is a closure in programming?",
    back: "A function that has access to variables from its outer (enclosing) scope, even after the outer function has finished executing.",
    deckId: '',
    tags: ['javascript', 'functions', 'advanced']
  },
  {
    front: "What is the Big O notation?",
    back: "A mathematical notation that describes the limiting behavior of a function when the argument approaches infinity, used to classify algorithms by their time or space complexity.",
    deckId: '',
    tags: ['algorithms', 'performance', 'computer-science']
  },
  {
    front: "What is recursion?",
    back: "A programming technique where a function calls itself to solve a problem by breaking it down into smaller instances of the same problem.",
    deckId: '',
    tags: ['algorithms', 'functions', 'advanced']
  },
];

// New programming challenges deck
const codingChallengeDemoCards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[] = [
  {
    front: "Write a function to check if a string is a palindrome",
    back: "function isPalindrome(str) {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return cleaned === cleaned.split('').reverse().join('');\n}",
    deckId: '',
    tags: ['challenge', 'strings', 'algorithms']
  },
  {
    front: "Write a function to find the factorial of a number",
    back: "function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}",
    deckId: '',
    tags: ['challenge', 'recursion', 'algorithms']
  },
  {
    front: "Write a function to find the maximum number in an array",
    back: "function findMax(arr) {\n  return Math.max(...arr);\n  // Or: return arr.reduce((max, num) => num > max ? num : max, arr[0]);\n}",
    deckId: '',
    tags: ['challenge', 'arrays', 'algorithms']
  },
  {
    front: "Write a function to check if a number is prime",
    back: "function isPrime(num) {\n  if (num <= 1) return false;\n  if (num <= 3) return true;\n  if (num % 2 === 0 || num % 3 === 0) return false;\n  for (let i = 5; i * i <= num; i += 6) {\n    if (num % i === 0 || num % (i + 2) === 0) return false;\n  }\n  return true;\n}",
    deckId: '',
    tags: ['challenge', 'numbers', 'algorithms']
  },
  {
    front: "Write a function to reverse a string without using the built-in reverse method",
    back: "function reverseString(str) {\n  let reversed = '';\n  for (let i = str.length - 1; i >= 0; i--) {\n    reversed += str[i];\n  }\n  return reversed;\n}",
    deckId: '',
    tags: ['challenge', 'strings', 'algorithms']
  },
  {
    front: "Implement the map function for arrays",
    back: "Array.prototype.myMap = function(callback) {\n  const result = [];\n  for (let i = 0; i < this.length; i++) {\n    result.push(callback(this[i], i, this));\n  }\n  return result;\n}",
    deckId: '',
    tags: ['challenge', 'arrays', 'functional', 'javascript']
  },
  {
    front: "Write a function to remove duplicates from an array",
    back: "function removeDuplicates(arr) {\n  return [...new Set(arr)];\n  // Or: return arr.filter((item, index) => arr.indexOf(item) === index);\n}",
    deckId: '',
    tags: ['challenge', 'arrays', 'algorithms']
  },
  {
    front: "Implement a basic debounce function",
    back: "function debounce(func, delay) {\n  let timeout;\n  return function(...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(this, args), delay);\n  };\n}",
    deckId: '',
    tags: ['challenge', 'functions', 'advanced', 'javascript']
  },
  {
    front: "Implement a function to find the longest substring without repeating characters",
    back: "function longestSubstring(str) {\n  let start = 0;\n  let maxLength = 0;\n  let charMap = new Map();\n\n  for (let i = 0; i < str.length; i++) {\n    if (charMap.has(str[i]) && charMap.get(str[i]) >= start) {\n      start = charMap.get(str[i]) + 1;\n    }\n    charMap.set(str[i], i);\n    maxLength = Math.max(maxLength, i - start + 1);\n  }\n  return maxLength;\n}",
    deckId: '',
    tags: ['challenge', 'strings', 'algorithms', 'medium']
  },
  {
    front: "Implement a function to detect if a linked list has a cycle",
    back: "function hasCycle(head) {\n  if (!head || !head.next) return false;\n  \n  let slow = head;\n  let fast = head;\n  \n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    \n    if (slow === fast) return true;\n  }\n  \n  return false;\n}",
    deckId: '',
    tags: ['challenge', 'linked-lists', 'algorithms', 'medium']
  },
  {
    front: "Write a function to implement the binary search algorithm",
    back: "function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  \n  return -1; // Not found\n}",
    deckId: '',
    tags: ['challenge', 'arrays', 'algorithms', 'search']
  },
];

// Web development flashcards
const webDevDemoCards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[] = [
  {
    front: "What is the CSS box model?",
    back: "A layout model that describes how elements are rendered with content, padding, border, and margin areas.",
    deckId: '',
    tags: ['web', 'css', 'layout']
  },
  {
    front: "What is a CSS flexbox?",
    back: "A one-dimensional layout method for arranging items in rows or columns, with space distribution and alignment capabilities.",
    deckId: '',
    tags: ['web', 'css', 'layout']
  },
  {
    front: "What is the difference between let and var in JavaScript?",
    back: "let is block-scoped while var is function-scoped. let doesn't create properties on the global object and doesn't allow redeclaration in the same scope.",
    deckId: '',
    tags: ['web', 'javascript', 'variables']
  },
  {
    front: "What is the Virtual DOM in React?",
    back: "A lightweight copy of the actual DOM that React uses to improve performance by minimizing direct DOM manipulations.",
    deckId: '',
    tags: ['web', 'react', 'performance']
  },
  {
    front: "What are React hooks?",
    back: "Functions that let you use React state and lifecycle features in functional components, introduced in React 16.8.",
    deckId: '',
    tags: ['web', 'react', 'hooks']
  },
  {
    front: "What is responsive web design?",
    back: "An approach to web design that makes web pages render well on various devices and window/screen sizes.",
    deckId: '',
    tags: ['web', 'design', 'css']
  },
  {
    front: "What is CORS?",
    back: "Cross-Origin Resource Sharing - a mechanism that allows restricted resources on a web page to be requested from another domain outside the domain from which the first resource was served.",
    deckId: '',
    tags: ['web', 'security', 'api']
  },
  {
    front: "What is a RESTful API?",
    back: "An API that conforms to the principles of REST architectural style, using HTTP methods like GET, POST, PUT, DELETE to perform operations on resources.",
    deckId: '',
    tags: ['web', 'api', 'architecture']
  },
  {
    front: "What is the purpose of the HTML 'meta viewport' tag?",
    back: "It helps control the viewport's size and scale on mobile devices, ensuring proper responsive design rendering.",
    deckId: '',
    tags: ['web', 'html', 'responsive']
  },
  {
    front: "What is the CSS 'grid' display property?",
    back: "A two-dimensional layout system that allows for complex grid-based layouts with rows and columns.",
    deckId: '',
    tags: ['web', 'css', 'layout']
  },
  {
    front: "What is a Promise in JavaScript?",
    back: "An object representing the eventual completion or failure of an asynchronous operation and its resulting value.",
    deckId: '',
    tags: ['web', 'javascript', 'async']
  },
  {
    front: "What is webpack?",
    back: "A static module bundler for JavaScript applications that processes and bundles JavaScript files, along with other assets like CSS and images.",
    deckId: '',
    tags: ['web', 'tools', 'build']
  },
  {
    front: "What are the key principles of Progressive Web Apps (PWAs)?",
    back: "Reliable (works offline), Fast (responsive), and Engaging (feels like a native app with features like push notifications).",
    deckId: '',
    tags: ['web', 'pwa', 'architecture']
  },
];

// Create a new Data Science deck
const dataScienceDemoCards: Omit<Card, 'id' | 'lastReviewed' | 'nextReview' | 'easeFactor' | 'interval' | 'repetitions'>[] = [
  {
    front: "What is Machine Learning?",
    back: "A field of computer science that gives computers the ability to learn without being explicitly programmed, using algorithms that can identify patterns in data.",
    deckId: '',
    tags: ['data-science', 'machine-learning', 'basics']
  },
  {
    front: "What is the difference between supervised and unsupervised learning?",
    back: "Supervised learning uses labeled training data to make predictions, while unsupervised learning identifies patterns in unlabeled data without predefined outputs.",
    deckId: '',
    tags: ['data-science', 'machine-learning', 'basics']
  },
  {
    front: "What is a neural network?",
    back: "A computational model inspired by the human brain, consisting of interconnected nodes (neurons) organized in layers that process information and learn patterns in data.",
    deckId: '',
    tags: ['data-science', 'deep-learning', 'neural-networks']
  },
  {
    front: "What is overfitting in machine learning?",
    back: "When a model learns the training data too well, including its noise and outliers, resulting in poor performance on new, unseen data.",
    deckId: '',
    tags: ['data-science', 'machine-learning', 'concepts']
  },
  {
    front: "What is the purpose of cross-validation?",
    back: "To assess how well a model generalizes to independent datasets by partitioning data into multiple training and validation sets.",
    deckId: '',
    tags: ['data-science', 'evaluation', 'methodology']
  },
  {
    front: "What is the bias-variance tradeoff?",
    back: "The balance between a model that is too simple (high bias) and a model that is too complex (high variance) to find the optimal level of generalization.",
    deckId: '',
    tags: ['data-science', 'machine-learning', 'concepts']
  },
  {
    front: "What is a decision tree?",
    back: "A tree-like model of decisions where each internal node represents a feature, each branch represents a decision rule, and each leaf node represents an outcome.",
    deckId: '',
    tags: ['data-science', 'algorithms', 'machine-learning']
  },
  {
    front: "What is gradient descent?",
    back: "An optimization algorithm that iteratively adjusts parameters to minimize a cost function by moving in the direction of the steepest descent.",
    deckId: '',
    tags: ['data-science', 'algorithms', 'optimization']
  },
  {
    front: "What is a confusion matrix?",
    back: "A table used to describe the performance of a classification model, showing the counts of true positives, false positives, true negatives, and false negatives.",
    deckId: '',
    tags: ['data-science', 'evaluation', 'metrics']
  },
  {
    front: "What is a feature in machine learning?",
    back: "An individual measurable property or characteristic of a phenomenon being observed, which serves as input to a machine learning algorithm.",
    deckId: '',
    tags: ['data-science', 'basics', 'terminology']
  },
];

// Generate demo decks and cards
export const generateDemoData = (): { decks: Deck[], cards: Card[] } => {
  const decks: Deck[] = [];
  const cards: Card[] = [];
  
  // Language deck
  const languageDeck: Deck = {
    id: generateId(),
    name: "Language Learning",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    lastReviewed: Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 day ago
  };
  decks.push(languageDeck);
  
  // Science deck
  const scienceDeck: Deck = {
    id: generateId(),
    name: "Science Concepts",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    lastReviewed: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
  };
  decks.push(scienceDeck);
  
  // Programming deck
  const programmingDeck: Deck = {
    id: generateId(),
    name: "Programming Fundamentals",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    lastReviewed: null
  };
  decks.push(programmingDeck);
  
  // New coding challenge deck
  const challengeDeck: Deck = {
    id: generateId(),
    name: "Coding Challenges",
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    lastReviewed: null
  };
  decks.push(challengeDeck);
  
  // Web development deck
  const webDevDeck: Deck = {
    id: generateId(),
    name: "Web Development",
    createdAt: Date.now(), // today
    lastReviewed: null
  };
  decks.push(webDevDeck);
  
  // Data Science deck
  const dataScienceDeck: Deck = {
    id: generateId(),
    name: "Data Science Essentials",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    lastReviewed: null
  };
  decks.push(dataScienceDeck);
  
  // Generate cards for each deck
  languageDemoCards.forEach(cardData => {
    const cardWithDeck = { ...cardData, deckId: languageDeck.id };
    const fullCard = initializeCardForSRS(cardWithDeck);
    
    // Randomly set some cards as already reviewed to demonstrate the SRS algorithm
    if (Math.random() > 0.3) {
      fullCard.lastReviewed = Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000;
      fullCard.repetitions = Math.floor(Math.random() * 3);
      fullCard.interval = fullCard.repetitions > 0 ? Math.pow(2, fullCard.repetitions) : 0;
      fullCard.nextReview = fullCard.lastReviewed + (fullCard.interval * 24 * 60 * 60 * 1000);
    }
    
    cards.push(fullCard);
  });
  
  scienceDemoCards.forEach(cardData => {
    const cardWithDeck = { ...cardData, deckId: scienceDeck.id };
    const fullCard = initializeCardForSRS(cardWithDeck);
    
    // Randomly set some cards as already reviewed
    if (Math.random() > 0.4) {
      fullCard.lastReviewed = Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000;
      fullCard.repetitions = Math.floor(Math.random() * 2);
      fullCard.interval = fullCard.repetitions > 0 ? Math.pow(2, fullCard.repetitions) : 0;
      fullCard.nextReview = fullCard.lastReviewed + (fullCard.interval * 24 * 60 * 60 * 1000);
    }
    
    cards.push(fullCard);
  });
  
  programmingDemoCards.forEach(cardData => {
    const cardWithDeck = { ...cardData, deckId: programmingDeck.id };
    const fullCard = initializeCardForSRS(cardWithDeck);
    
    // All programming cards are new (not reviewed yet)
    
    cards.push(fullCard);
  });
  
  // Add coding challenge cards
  codingChallengeDemoCards.forEach(cardData => {
    const cardWithDeck = { ...cardData, deckId: challengeDeck.id };
    const fullCard = initializeCardForSRS(cardWithDeck);
    
    // These are brand new challenges
    cards.push(fullCard);
  });
  
  // Add web development cards
  webDevDemoCards.forEach(cardData => {
    const cardWithDeck = { ...cardData, deckId: webDevDeck.id };
    const fullCard = initializeCardForSRS(cardWithDeck);
    
    // Web dev cards are all new
    cards.push(fullCard);
  });
  
  // Add data science cards
  dataScienceDemoCards.forEach(cardData => {
    const cardWithDeck = { ...cardData, deckId: dataScienceDeck.id };
    const fullCard = initializeCardForSRS(cardWithDeck);
    
    // Data science cards are all new
    cards.push(fullCard);
  });
  
  return { decks, cards };
}; 