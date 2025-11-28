// src/hooks/useTelepulseData.js
import { useState, useEffect, useCallback } from 'react';
import { telepulseAPI } from '../services/telepulseApi';

export const useMyFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await telepulseAPI.getMyFeed(pageNum);
      
      if (append) {
        // Убираем дубликаты при добавлении
        const newPosts = data.posts.filter(newPost => 
          !posts.some(existingPost => existingPost.id === newPost.id)
        );
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(data.posts);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadFeed(page + 1, true);
    }
  };

  const refresh = useCallback(() => {
    loadFeed(1, false);
  }, []);

  useEffect(() => {
    loadFeed();
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};

export const useRecommendations = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await telepulseAPI.getRecommendations();
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  return {
    posts,
    loading,
    error,
    refresh: loadRecommendations,
  };
};

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await telepulseAPI.searchPosts(query);
      setResults(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    search,
  };
};

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await telepulseAPI.getUserChannels();
      console.log('Channels loaded:', data.channels); // Добавьте логирование
      setChannels(data.channels || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading channels:', err);
    } finally {
      setLoading(false);
    }
  };

  const addChannel = async (channelIdentifier) => {
    try {
      const data = await telepulseAPI.addChannel(channelIdentifier);
      console.log('Channel added:', data); // Добавьте логирование
      await loadChannels(); // Перезагружаем список
      return data;
    } catch (err) {
      console.error('Error adding channel:', err);
      throw err;
    }
  };

  const refreshChannels = async () => {
    console.log('Refreshing channels...'); // Добавьте логирование
    await loadChannels();
  };

  useEffect(() => {
    loadChannels();
  }, []);

  return {
    channels,
    loading,
    error,
    loadChannels,
    addChannel,
    refreshChannels,
  };
};