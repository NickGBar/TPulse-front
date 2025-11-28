// src/Components/Post.jsx
import './Post.css';
import { telepulseAPI } from '../services/telepulseApi';
import { useState } from 'react';
import { getSafeImageUrl } from '../utils/telegramUrls';

const Post = ({ post, onPostClick, showSubscribe = false, onChannelAdded }) => {
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const imageUrl = getSafeImageUrl(post.image);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await telepulseAPI.likePost(post.post_url);
      const button = e.target;
      button.textContent = '♥';
      button.style.color = 'var(--tg-button-color, #ff4444)'; // ← ИСПОЛЬЗУЕМ ПЕРЕМЕННУЮ!
      setTimeout(() => {
        button.style.color = '';
      }, 1000);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleSubscribe = async (e) => {
    e.stopPropagation();
    
    if (isSubscribing) return;
    
    setIsSubscribing(true);
    try {
      const channelUsername = post.channel.username || post.channel.name;
      await telepulseAPI.addChannel(channelUsername);
      
      const button = e.target;
      const originalContent = button.innerHTML;
      button.innerHTML = '✓';
      button.style.color = 'var(--tg-button-color, #00aa00)'; // ← ПЕРЕМЕННАЯ!
      
      if (onChannelAdded) {
        onChannelAdded();
      }
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.color = '';
        setIsSubscribing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to subscribe:', error);
      setIsSubscribing(false);
      
      const button = e.target;
      const originalContent = button.innerHTML;
      button.innerHTML = '✕';
      button.style.color = 'var(--tg-error-color, #ff4444)'; // ← ПЕРЕМЕННАЯ!
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.color = '';
      }, 2000);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: post.post_url,
      });
    } else {
      navigator.clipboard.writeText(post.post_url);
      console.log('Ссылка скопирована');
    }
  };

  return (
    <div className="post" onClick={() => onPostClick && onPostClick(post)}>
      {/* Шапка поста - канал */}
      <div className="post-header">
        <div className="channel-info">
          <div className="channel-avatar">
            {post.channel.avatar}
          </div>
          <div className="channel-details">
            <div className="channel-name">{post.channel.name}</div>
            <div className="post-meta">
              {post.date}
            </div>
          </div>
        </div>
        <button className="menu-button">⋯</button>
      </div>

      {/* Контент поста — СНАЧАЛА КАРТИНКА */}
      <div className="post-content">
        {/* КАРТИНКА ВЫНЕСЕНА НАД ТЕКСТОМ */}
        {imageUrl && (
          <div className="post-image">
            <img 
              src={imageUrl} 
              alt={post.title}
              onError={(e) => {
                console.log('❌ Image failed, using fallback:', imageUrl);
                e.target.style.display = 'none';
                // Показываем заглушку через CSS
              }}
            />
          </div>
        )}

        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.content}</p>
      </div>

      {/* Минималистичные кнопки действий */}
      <div className="post-actions">
        <button className="action-btn" onClick={handleLike} title="Нравится">
          ♡
        </button>
        
        {showSubscribe && (
          <button 
            className="action-btn" 
            onClick={handleSubscribe} 
            title="Добавить канал в ленту"
            disabled={isSubscribing}
          >
            {isSubscribing ? '...' : '+'}
          </button>
        )}
        
        <button className="action-btn" onClick={handleShare} title="Поделиться">
          ↗
        </button>
      </div>
    </div>
  );
};

export default Post;