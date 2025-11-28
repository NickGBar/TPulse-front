// src/services/telepulseApi.js
const API_BASE_URL = 'http://localhost:8080/api';

const getUserId = () => {
  if (window.Telegram && Telegram.WebApp) {
    return Telegram.WebApp.initDataUnsafe.user?.id;
  }
  return 12345;
};

async function makeRequest(endpoint, data = {}) {
  const payload = {
    user_id: getUserId(),
    ...data
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const telepulseAPI = {
  // Моя лента (из подписок)
  getMyFeed: (page = 1, limit = 20) => 
    makeRequest('/feed/my', { page, limit }),

  // Персональные рекомендации
  getRecommendations: (limit = 10) =>
    makeRequest('/recommendations', { limit }),

  // Поиск
  searchPosts: (query) =>
    makeRequest('/search', { query }),

  // Каналы
  getUserChannels: () =>
    makeRequest('/channels'),
    
  addChannel: (channelIdentifier) =>
    makeRequest('/channels/add', { channel: channelIdentifier }),

  // Лайки
  likePost: (post_url) =>
    makeRequest('/like', { post_url }),

  // Удаление канала
  removeChannel: (channelId) =>
    makeRequest('/channels/remove', { channel_id: channelId }),

  // Сохранение тем пользователя
  saveUserTopics: (topics) =>
    makeRequest('/topics/save', { topics }),

  // Получение тем пользователя
  getUserTopics: () =>
    makeRequest('/topics/get'),

   sendAIMessage: async (userId, message) => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, message })
    });
    return response.json();
  },

  getAISuggestions: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/ai/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    return response.json();
  }
};

