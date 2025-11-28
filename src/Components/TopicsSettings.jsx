// src/components/TopicsSettings.jsx
import './Settings.css';
import { useState, useEffect } from 'react';
import { telepulseAPI } from '../services/telepulseApi';

const TopicsSettings = ({ onClose }) => {
  const allTopics = [
    { id: 'news', name: 'Новости', emoji: '📰' },
    { id: 'tech', name: 'Технологии', emoji: '💻' },
    { id: 'sports', name: 'Спорт', emoji: '⚽' },
    { id: 'crypto', name: 'Криптовалюты', emoji: '₿' },
    { id: 'business', name: 'Бизнес', emoji: '💼' },
    { id: 'entertainment', name: 'Развлечения', emoji: '🎭' },
    { id: 'science', name: 'Наука', emoji: '🔬' },
    { id: 'travel', name: 'Путешествия', emoji: '✈️' },
    { id: 'health', name: 'Здоровье', emoji: '🏥' },
    { id: 'education', name: 'Образование', emoji: '📚' },
    { id: 'music', name: 'Музыка', emoji: '🎵' },
    { id: 'games', name: 'Игры', emoji: '🎮' },
  ];

  const [selectedTopics, setSelectedTopics] = useState([]);
  const [initialTopics, setInitialTopics] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Загружаем темы пользователя при монтировании
  useEffect(() => {
    loadUserTopics();
  }, []);

  const loadUserTopics = async () => {
    try {
      setLoading(true);
      const response = await telepulseAPI.getUserTopics();
      if (response.success) {
        setSelectedTopics(response.topics || []);
        setInitialTopics(response.topics || []);
      }
    } catch (error) {
      console.error('Failed to load user topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId) => {
    const newSelectedTopics = selectedTopics.includes(topicId)
      ? selectedTopics.filter(id => id !== topicId)
      : [...selectedTopics, topicId];
    
    setSelectedTopics(newSelectedTopics);
    
    // Проверяем есть ли изменения compared to initial state
    const hasChanges = JSON.stringify(newSelectedTopics.sort()) !== JSON.stringify(initialTopics.sort());
    setHasChanges(hasChanges);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await telepulseAPI.saveUserTopics(selectedTopics);
      setInitialTopics(selectedTopics); // Обновляем начальное состояние
      setHasChanges(false);
      
      // Закрываем модалку через секунду чтобы пользователь видел успех
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to save topics:', error);
      alert('Ошибка при сохранении тем');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Возвращаем исходное состояние
    setSelectedTopics(initialTopics);
    setHasChanges(false);
    if (onClose) onClose();
  };

  const handleSelectAll = () => {
    const allTopicIds = allTopics.map(topic => topic.id);
    setSelectedTopics(allTopicIds);
    setHasChanges(true);
  };

  const handleSelectNone = () => {
    setSelectedTopics([]);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="topics-settings">
        <div className="loading-topics">
          <div className="spinner small"></div>
          <span>Загрузка тем...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="topics-settings">
      <div className="settings-section">
        <div className="topics-header">
          <h3>Выберите интересные темы</h3>
          <p className="settings-description">
            Мы будем показывать посты по выбранным темам в рекомендациях
          </p>
          
          <div className="topics-quick-actions">
            <button className="quick-action-btn" onClick={handleSelectAll}>
              Выбрать все
            </button>
            <button className="quick-action-btn" onClick={handleSelectNone}>
              Сбросить
            </button>
          </div>
        </div>
        
        <div className="topics-grid">
          {allTopics.map(topic => (
            <button
              key={topic.id}
              className={`topic-item ${selectedTopics.includes(topic.id) ? 'selected' : ''}`}
              onClick={() => toggleTopic(topic.id)}
            >
              <span className="topic-emoji">{topic.emoji}</span>
              <span className="topic-name">{topic.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="topics-footer">
        <div className="selected-count">
          Выбрано: {selectedTopics.length} из {allTopics.length} тем
          {hasChanges && <span className="changes-indicator"> • Есть изменения</span>}
        </div>
        
        <div className="topics-actions">
          <button 
            className="secondary-button" 
            onClick={handleCancel}
            disabled={saving}
          >
            Отмена
          </button>
          <button 
            className="primary-button" 
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicsSettings;