import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    books: [],
    users: [],
    activities: [],
    total: 0
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Debounced search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ books: [], users: [], activities: [], total: 0 });
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`, config);
      
      if (response.data.success) {
        setSearchResults(response.data.data);
        setShowResults(true);
        
        // Add to search history
        addToSearchHistory(query);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ books: [], users: [], activities: [], total: 0 });
    } finally {
      setIsSearching(false);
    }
  };

  const addToSearchHistory = (query) => {
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ books: [], users: [], activities: [], total: 0 });
    setShowResults(false);
  };

  const navigateToItem = (type, item) => {
    // Clear search when navigating
    clearSearch();
    return { type, item };
  };

  const loadSearchHistory = () => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    searchHistory,
    performSearch,
    clearSearch,
    navigateToItem
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
