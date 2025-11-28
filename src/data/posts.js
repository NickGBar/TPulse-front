// src/data/posts.js
export const mockPosts = [
  {
    id: 1,
    channel: {
      name: "Технологии",
      avatar: "🔧",
      subscribers: "12.5K"
    },
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
    title: "Новый iPhone выйдет осенью",
    content: "Apple анонсировала выход нового iPhone с революционной камерой и улучшенной батареей...",
    date: "2 часа назад",
    views: "12.4K",
    likes: "2.1K",
    comments: "543"
  },
  {
    id: 2,
    channel: {
      name: "Криптовалюты",
      avatar: "₿",
      subscribers: "89.2K"
    },
    image: "https://images.unsplash.com/photo-1516245834210-8e0b6e0e8e1f?w=400",
    title: "Bitcoin достиг нового максимума",
    content: "Курс Bitcoin превысил $70,000 на основных биржах. Аналитики прогнозируют дальнейший рост...",
    date: "5 часов назад",
    views: "45.7K",
    likes: "8.9K",
    comments: "1.2K"
  },
  {
    id: 3,
    channel: {
      name: "Игры",
      avatar: "🎮",
      subscribers: "156K"
    },
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
    title: "Выход GTA 6 перенесли",
    content: "Rockstar Games официально подтвердили перенос релиза GTA 6 на следующий год...",
    date: "1 день назад",
    views: "234K",
    likes: "45.2K",
    comments: "8.7K"
  },
  {
    id: 4,
    channel: {
      name: "Наука",
      avatar: "🔬",
      subscribers: "67.3K"
    },
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
    title: "Открыта новая планета в зоне обитаемости",
    content: "Астрономы обнаружили экзопланету с условиями, подходящими для жизни...",
    date: "2 дня назад",
    views: "78.9K",
    likes: "12.3K",
    comments: "2.4K"
  },
  {
    id: 5,
    channel: {
      name: "Спорт",
      avatar: "⚽",
      subscribers: "203K"
    },
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400",
    title: "Рекордный трансфер футболиста",
    content: "Клуб заплатил 200 миллионов евро за переход бразильского нападающего...",
    date: "3 дня назад",
    views: "156K",
    likes: "23.4K",
    comments: "4.5K"
  }
];

export const menuItems = [
  { id: 'home', icon: '🏠', label: 'Главная', active: true },
  { id: 'search', icon: '🔍', label: 'Поиск', active: false },
  { id: 'favorites', icon: '⭐', label: 'Избранное', active: false },
  { id: 'profile', icon: '👤', label: 'Профиль', active: false }
];
