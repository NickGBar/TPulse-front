// src/components/ChannelsSettings.jsx
import './Settings.css';
import { telepulseAPI } from '../services/telepulseApi';
import { useState } from 'react';

const ChannelsSettings = ({ channels, onAddChannel, onChannelsUpdate }) => {
  const [removingChannels, setRemovingChannels] = useState({});

  const handleRemoveChannel = async (channelId, channelName) => {
    if (removingChannels[channelId]) return;
    
    // Подтверждение удаления
    if (!window.confirm(`Удалить канал ${channelName} из ленты?`)) {
      return;
    }

    try {
      setRemovingChannels(prev => ({ ...prev, [channelId]: true }));
      
      console.log('Removing channel:', channelId);
      const response = await telepulseAPI.removeChannel(channelId);
      console.log('Remove channel response:', response);
      
      if (response.success) {
        // Обновляем список каналов через callback
        if (onChannelsUpdate) {
          console.log('Calling onChannelsUpdate...');
          onChannelsUpdate();
        }
      } else {
        alert(response.message || 'Ошибка при удалении канала');
      }
    } catch (error) {
      console.error('Failed to remove channel:', error);
      alert('Ошибка при удалении канала: ' + error.message);
    } finally {
      setRemovingChannels(prev => ({ ...prev, [channelId]: false }));
    }
  };

  const handleTestAPI = async () => {
    try {
      console.log('Testing channels API...');
      console.log('Current channels:', channels);
      
      // Тестируем получение каналов
      const testResponse = await telepulseAPI.getUserChannels();
      console.log('Test API response:', testResponse);
      
    } catch (error) {
      console.error('API test failed:', error);
    }
  };

  return (
    <div className="channels-settings">
      <div className="settings-section">
        <div className="channels-header">
          <h3>Мои каналы ({channels.length})</h3>
          <button 
            className="debug-button"
            onClick={handleTestAPI}
            title="Тест API (для отладки)"
          >
            🐛
          </button>
        </div>
        
        {channels.length === 0 ? (
          <div className="empty-channels">
            <div className="empty-icon">📺</div>
            <p>Вы еще не добавили каналы</p>
            <p className="empty-hint">Добавьте каналы чтобы видеть их посты в ленте</p>
          </div>
        ) : (
          <div className="channels-list">
            {channels.map(channel => (
              <div key={channel.id} className="channel-item">
                <div className="channel-info">
                  <span className="channel-avatar">{channel.avatar}</span>
                  <div className="channel-details">
                    <div className="channel-name">{channel.name}</div>
                    <div className="channel-username">@{channel.username}</div>
                    <div className="channel-stats">
                      {channel.post_count ? `${channel.post_count} постов` : 'Нет постов'} • 
                      {channel.subscribers ? ` ${channel.subscribers} подп.` : ' 0 подп.'}
                    </div>
                  </div>
                </div>
                <button 
                  className={`remove-btn ${removingChannels[channel.id] ? 'removing' : ''}`}
                  onClick={() => handleRemoveChannel(channel.id, channel.name)}
                  title="Удалить канал"
                  disabled={removingChannels[channel.id]}
                >
                  {removingChannels[channel.id] ? '⋯' : '×'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="add-channel-btn" onClick={onAddChannel}>
        + Добавить канал
      </button>
      
      {/* Отладочная информация */}
      <div className="debug-info">
        <small>Каналов: {channels.length} | ID первого: {channels[0]?.id}</small>
      </div>
    </div>
  );
};

export default ChannelsSettings;