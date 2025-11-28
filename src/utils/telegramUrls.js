// src/utils/telegramUrls.js

/**
 * Преобразует Telegram URL в прямую ссылку на медиа
 */
export function getTelegramMediaUrl(telegramUrl) {
  if (!telegramUrl || !telegramUrl.includes('t.me')) {
    return null;
  }
  
  try {
    console.log('🔧 Processing Telegram URL:', telegramUrl);
    
    // Извлекаем канал и ID сообщения
    const match = telegramUrl.match(/t\.me\/([^/]+)\/(\d+)/);
    if (!match) {
      console.log('❌ Cannot parse Telegram URL');
      return null;
    }
    
    const [, channel, messageId] = match;
    console.log('📦 Extracted:', { channel, messageId });
    
    // Формируем правильную ссылку на Telegram CDN
    const directUrl = `https://cdn4.telesco.pe/file/${channel}/${messageId}.jpg`;
    console.log('✅ Converted to:', directUrl);
    
    return directUrl;
    
  } catch (error) {
    console.error('Error parsing Telegram URL:', error);
    return null;
  }
}

/**
 * Получает безопасный URL для изображения
 */

export function getSafeImageUrl(originalUrl) {
  if (!originalUrl) {
    return 'https://picsum.photos/400/200?random=1';
  }
  
  console.log('🖼️ Original URL:', originalUrl);
  
  // Для Telegram постов используем тестовые изображения
  if (originalUrl.includes('t.me')) {
    const match = originalUrl.match(/t\.me\/([^/]+)\/(\d+)/);
    if (match) {
      const messageId = match[2];
      // Генерируем детерминированную картинку на основе ID сообщения
      const imageId = parseInt(messageId) % 50; // 50 разных картинок
      const testImage = `https://picsum.photos/400/200?random=${imageId}`;
      console.log('✅ Using test image:', testImage);
      return testImage;
    }
  }
  
  console.log('🔙 Using original URL');
  return originalUrl;
}