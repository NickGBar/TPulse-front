import { useState, useRef, useEffect } from 'react'
import './AIChat.css'

export function AIChat({ userId, onClose }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [aiStatus, setAiStatus] = useState({ loaded: false, loading: true, progress: 0 })
  const messagesEndRef = useRef(null)

  // Загрузка статуса ИИ и подсказок
  useEffect(() => {
    checkAIStatus()
    loadSuggestions()
    
    // Добавляем приветственное сообщение
    setMessages([{
      id: 1,
      type: 'ai',
      content: '👋 Привет! Я TelePulse AI - ваш помощник для поиска интересного контента в Telegram. Спросите меня о постах, каналах или трендах!',
      timestamp: new Date()
    }])

    // Периодически проверяем статус загрузки
    const statusInterval = setInterval(checkAIStatus, 2000)
    return () => clearInterval(statusInterval)
  }, [userId])

  const checkAIStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/ai/status')
      const data = await response.json()
      if (data.success) {
        setAiStatus({
          loaded: data.status.is_loaded,
          loading: data.status.loading,
          progress: data.status.load_progress
        })
      }
    } catch (error) {
      console.error('Error checking AI status:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      const data = await response.json()
      if (data.success) {
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
    }
  }

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          message: message 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: '⚠️ Произошла ошибка при отправке сообщения. Попробуйте еще раз.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Показываем индикатор загрузки модели
  if (aiStatus.loading) {
    return (
      <div className="ai-chat">
        <div className="ai-chat-header">
          <div className="ai-avatar">🤖</div>
          <div className="ai-info">
            <h3>TelePulse AI</h3>
            <p>Загрузка модели...</p>
          </div>
        </div>
        
        <div className="ai-loading-model">
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${aiStatus.progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              Загрузка ИИ модели... {aiStatus.progress}%
            </div>
            <div className="loading-details">
              <p>⏳ Первая загрузка может занять 2-5 минут</p>
              <p>📦 Размер модели: ~2.3GB</p>
              <p>⚡ Последующие запуски будут мгновенными</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-chat">
      <div className="ai-chat-header">
        <div className="ai-avatar">🤖</div>
        <div className="ai-info">
          <h3>TelePulse AI</h3>
          <p>{aiStatus.loaded ? '✅ Модель загружена' : '❌ Модель не загружена'}</p>
        </div>
        <button className="ai-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="ai-chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}-message`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!aiStatus.loaded && (
        <div className="ai-model-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>ИИ модель еще не загружена</strong>
            <p>Ответы могут быть ограничены. Попробуйте обновить страницу через 1-2 минуты.</p>
          </div>
        </div>
      )}

      {suggestions.length > 0 && messages.length <= 2 && (
        <div className="ai-suggestions">
          <div className="suggestions-title">💡 Быстрые подсказки:</div>
          <div className="suggestions-grid">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading || !aiStatus.loaded}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-chat-input">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={aiStatus.loaded ? "Задайте вопрос о постах или каналах..." : "Модель загружается..."}
            disabled={isLoading || !aiStatus.loaded}
          />
          <button 
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading || !aiStatus.loaded}
            className="send-button"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}