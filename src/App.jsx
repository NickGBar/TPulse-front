// src/App.jsx
import { useEffect, useState, useMemo, useCallback } from 'react'
import TelegramWebApp from '@twa-dev/sdk'
import { Modal } from './Components/Modal'
import { AIChat } from './Components/AIChat'
import Post from './Components/Post'
import SearchBar from './Components/SearchBar'
import BottomMenu from './Components/BottomMenu'
import ChannelsSettings from './Components/ChannelsSettings'
import TopicsSettings from './Components/TopicsSettings'
import { getSafeImageUrl } from './utils/telegramUrls';
import { useMyFeed, useRecommendations, useSearch, useChannels } from './hooks/useTelepulseData'
import './App.css'
import { ThemeToggle } from './Components/ThemeToggle'; // ← ИМПОРТ ПЕРЕКЛЮЧАТЕЛЯ

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenu, setActiveMenu] = useState('home')
  const [selectedPost, setSelectedPost] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Модалки для настроек
  const [settingsModal, setSettingsModal] = useState(false)
  const [channelsModal, setChannelsModal] = useState(false)
  const [topicsModal, setTopicsModal] = useState(false)
  const [addChannelModal, setAddChannelModal] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState('channels')
  
  // НОВОЕ: Модалка для ИИ-чата
  const [aiChatModal, setAiChatModal] = useState(false)
  
  // Состояния для добавления канала
  const [newChannelInput, setNewChannelInput] = useState('')

  // Данные
  const { 
    posts: feedPosts, 
    loading: feedLoading, 
    error: feedError, 
    hasMore, 
    loadMore, 
    refresh: refreshFeed 
  } = useMyFeed()

  const { 
    posts: recommendationPosts, 
    loading: recommendationLoading, 
    error: recommendationError,
    refresh: refreshRecommendations 
  } = useRecommendations()

  const { 
    results: searchResults, 
    searchLoading, 
    searchError, 
    search 
  } = useSearch()

  const {
    channels,
    loading: channelsLoading,
    addChannel,
    refreshChannels
  } = useChannels()

  // Определяем текущий режим и посты
  const currentMode = activeMenu === 'home' ? 'feed' : 'recommendations'
  
  const displayedPosts = useMemo(() => {
    if (searchQuery) return searchResults
    
    if (currentMode === 'feed') {
      return feedPosts
    } else {
      return recommendationPosts
    }
  }, [searchQuery, searchResults, currentMode, feedPosts, recommendationPosts])

  const isLoading = searchQuery ? searchLoading : 
                   currentMode === 'feed' ? feedLoading : recommendationLoading
                   
  const currentError = searchQuery ? searchError : 
                      currentMode === 'feed' ? feedError : recommendationError

  // Поиск с debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, search])

  // Применение темы Telegram
  const applyTelegramTheme = () => {
    const root = document.documentElement
    const theme = TelegramWebApp.themeParams || {}
    
    // Определяем тему на основе цвета фона
    const isDark = theme.backgroundColor === '#000000' || 
                   theme.backgroundColor === '#1a1a1a' ||
                   (theme.backgroundColor && (
                     theme.backgroundColor.includes('1a1a1a') ||
                     theme.backgroundColor.includes('000000')
                   ));
    
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      console.log('Applied dark theme');
    } else {
      root.setAttribute('data-theme', 'light');
      console.log('Applied light theme');
    }
    
    // Устанавливаем CSS переменные
    root.style.setProperty('--tg-bg-color', theme.backgroundColor || '#ffffff')
    root.style.setProperty('--tg-text-color', theme.textColor || '#000000')
    root.style.setProperty('--tg-hint-color', theme.hintColor || '#999999')
    root.style.setProperty('--tg-button-color', theme.buttonColor || '#2481cc')
    root.style.setProperty('--tg-button-text-color', theme.buttonTextColor || '#ffffff')
    
    document.body.style.backgroundColor = theme.backgroundColor || '#ffffff'
    document.body.style.color = theme.textColor || '#000000'
  }

  // Инициализация Telegram Mini App
  useEffect(() => {
    console.log('Initializing Telegram Mini App...')
    
    try {
      if (TelegramWebApp) {
        // Разворачиваем на весь экран
        TelegramWebApp.expand()

        // Настраиваем кнопку назад
        if (TelegramWebApp.BackButton) {
          TelegramWebApp.BackButton.show()
          TelegramWebApp.BackButton.onClick(() => {
            if (isModalOpen) {
              setIsModalOpen(false)
              setSelectedPost(null)
            } else if (settingsModal) {
              setSettingsModal(false)
            } else if (channelsModal) {
              setChannelsModal(false)
            } else if (topicsModal) {
              setTopicsModal(false)
            } else if (addChannelModal) {
              setAddChannelModal(false)
            } else if (aiChatModal) {
              setAiChatModal(false)
              setActiveMenu('home')
            } else if (searchQuery) {
              setSearchQuery('')
            } else {
              TelegramWebApp.BackButton.hide()
            }
          })
        }

        // Применяем тему Telegram
        applyTelegramTheme()
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('TMA initialization error:', error)
      setIsInitialized(true)
    }
  }, [isModalOpen, settingsModal, channelsModal, topicsModal, addChannelModal, aiChatModal, searchQuery])

  const handlePostClick = useCallback((post) => {
    setSelectedPost(post)
    setIsModalOpen(true)
  }, [])

  // ОБНОВЛЕННАЯ ФУНКЦИЯ: добавлена обработка кнопки ИИ
  const handleMenuClick = useCallback((menuId) => {
    setActiveMenu(menuId)
    setSearchQuery('')
    
    if (menuId === 'settings') {
      setSettingsModal(true)
    } else if (menuId === 'ai') {
      setAiChatModal(true)
    }
  }, [])

  const handleAddChannel = async () => {
    if (!newChannelInput.trim()) return

    try {
      await addChannel(newChannelInput)
      setNewChannelInput('')
      setAddChannelModal(false)
      refreshFeed()
      refreshChannels()
    } catch (error) {
      console.error('Failed to add channel:', error)
      alert('Ошибка при добавлении канала')
    }
  }

  const handleScroll = useCallback((e) => {
    if (currentMode === 'feed' && !searchQuery && hasMore) {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore()
      }
    }
  }, [currentMode, searchQuery, hasMore, loadMore])

  const switchToFeed = () => {
    setActiveMenu('home')
    refreshFeed()
  }

  const switchToRecommendations = () => {
    setActiveMenu('discover')
    refreshRecommendations()
  }

  // ОБНОВЛЕННЫЙ МАССИВ: добавлена кнопка ИИ
  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Лента', active: activeMenu === 'home' },
    { id: 'discover', icon: '🎯', label: 'Подборка', active: activeMenu === 'discover' },
    { id: 'ai', icon: '🤖', label: 'ИИ', active: activeMenu === 'ai' },
    { id: 'settings', icon: '⚙️', label: 'Настройки', active: activeMenu === 'settings' }
  ]

  if (!isInitialized) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Загрузка ленты...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Шапка приложения */}
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">
            {currentMode === 'feed' ? 'Моя лента' : 'Рекомендации'}
          </h1>
          <div className="header-actions">
            {/* ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ — НОВАЯ СТРОКА */}
            <ThemeToggle />
            
            <button 
              className={`mode-button ${currentMode === 'feed' ? 'active' : ''}`}
              onClick={switchToFeed}
            >
              Лента
            </button>
            <button 
              className={`mode-button ${currentMode === 'recommendations' ? 'active' : ''}`}
              onClick={switchToRecommendations}
            >
              Подборка
            </button>
          </div>
        </div>
        
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск постов..."
        />
      </header>

      {/* Основная лента постов */}
      <main className="feed" onScroll={handleScroll}>
        {isLoading && displayedPosts.length === 0 && (
          <div className="loading-state">
            <div className="spinner small"></div>
            <span>Загрузка постов...</span>
          </div>
        )}

        {currentError && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Ошибка загрузки</h3>
            <p>{currentError}</p>
            <button className="retry-button" onClick={
              currentMode === 'feed' ? refreshFeed : refreshRecommendations
            }>
              Попробовать снова
            </button>
          </div>
        )}

        {displayedPosts.length > 0 ? (
          <>
            {displayedPosts.map(post => (
              <Post
                key={post.id}
                post={post}
                onPostClick={handlePostClick}
                showSubscribe={currentMode === 'recommendations'}
                onChannelAdded={refreshChannels}
              />
            ))}
            
            {isLoading && displayedPosts.length > 0 && (
              <div className="loading-more">
                <div className="spinner small"></div>
                <span>Загрузка...</span>
              </div>
            )}
            
            {!hasMore && currentMode === 'feed' && !searchQuery && (
              <div className="end-of-feed">
                <span>Вы просмотрели все посты</span>
              </div>
            )}
          </>
        ) : (
          !isLoading && (
            <div className="empty-state">
              <div className="empty-icon">
                {searchQuery ? "🔍" : 
                 currentMode === 'feed' ? "📰" : "🎯"}
              </div>
              <h3>
                {searchQuery ? "Ничего не найдено" : 
                 currentMode === 'feed' ? "Лента пуста" : "Нет рекомендаций"}
              </h3>
              <p>
                {searchQuery 
                  ? "Попробуйте изменить поисковый запрос" 
                  : currentMode === 'feed' 
                    ? "Добавьте каналы в настройках"
                    : "Оцените несколько постов для персонализации"
                }
              </p>
              
              {!searchQuery && currentMode === 'feed' && (
                <button 
                  className="add-channel-button"
                  onClick={() => setSettingsModal(true)}
                >
                  ⚙️ Открыть настройки
                </button>
              )}
            </div>
          )
        )}
      </main>

      {/* BottomMenu */}
      <BottomMenu
        items={menuItems}
        activeItem={activeMenu}
        onItemClick={handleMenuClick}
      />

      {/* Модальные окна */}

      {/* Модалка просмотра поста */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPost(null)
        }}
        title={selectedPost?.channel?.name || "Пост"}
      >
        {selectedPost && (
          <div className="post-modal-content">
            <div className="modal-post-header">
              <div className="channel-avatar large">
                {selectedPost.channel.avatar}
              </div>
              <div className="modal-channel-info">
                <div className="channel-name">{selectedPost.channel.name}</div>
                <div className="post-meta">{selectedPost.date}</div>
              </div>
            </div>
            
            <h2 className="modal-post-title">{selectedPost.title}</h2>
            <p className="modal-post-text">{selectedPost.content}</p>
            
            {selectedPost.image && (
              <div className="modal-post-image">
                <img 
                  src={getSafeImageUrl(selectedPost.image)} 
                  alt={selectedPost.title} 
                  onError={(e) => {
                    console.log('Modal image failed');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Модалка настроек */}
      <Modal
        isOpen={settingsModal}
        onClose={() => setSettingsModal(false)}
        title="Настройки ленты"
      >
        <div className="settings-modal">
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeSettingsTab === 'channels' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('channels')}
            >
              📺 Каналы
            </button>
            <button 
              className={`settings-tab ${activeSettingsTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveSettingsTab('topics')}
            >
              🎯 Темы
            </button>
          </div>

          <div className="settings-content">
            {activeSettingsTab === 'channels' && (
              <ChannelsSettings 
                channels={channels}
                onAddChannel={() => {
                  setSettingsModal(false)
                  setAddChannelModal(true)
                }}
                onChannelsUpdate={refreshChannels}
              />
            )}
            
            {activeSettingsTab === 'topics' && (
              <TopicsSettings onClose={() => setActiveSettingsTab('channels')} />
            )}
          </div>
        </div>
      </Modal>

      {/* Модалка управления каналами */}
      <Modal
        isOpen={channelsModal}
        onClose={() => setChannelsModal(false)}
        title="Управление каналами"
      >
        <ChannelsSettings 
          channels={channels}
          onAddChannel={() => {
            setChannelsModal(false)
            setAddChannelModal(true)
          }}
          onChannelsUpdate={refreshChannels}
        />
      </Modal>

      {/* Модалка тем интересов */}
      <Modal
        isOpen={topicsModal}
        onClose={() => setTopicsModal(false)}
        title="Темы интересов"
      >
        <TopicsSettings onClose={() => setTopicsModal(false)} />
      </Modal>

      {/* Модалка добавления канала */}
      <Modal
        isOpen={addChannelModal}
        onClose={() => setAddChannelModal(false)}
        title="Добавить канал"
      >
        <div className="add-channel-modal">
          <p>Введите username канала:</p>
          <input
            type="text"
            className="channel-input"
            placeholder="@username или t.me/username"
            value={newChannelInput}
            onChange={(e) => setNewChannelInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddChannel()
              }
            }}
          />
          <div className="modal-buttons">
            <button 
              className="secondary-button"
              onClick={() => setAddChannelModal(false)}
            >
              Отмена
            </button>
            <button 
              className="primary-button"
              onClick={handleAddChannel}
              disabled={!newChannelInput.trim()}
            >
              Добавить
            </button>
          </div>
        </div>
      </Modal>

      {/* Модалка ИИ-чата */}
      <Modal
        isOpen={aiChatModal}
        onClose={() => {
          setAiChatModal(false)
          setActiveMenu('home')
        }}
        title="TelePulse AI"
        className="ai-chat-modal"
      >
        <AIChat 
          userId={123}
          onClose={() => {
            setAiChatModal(false)
            setActiveMenu('home')
          }}
        />
      </Modal>

    </div>
  )
}

export default App