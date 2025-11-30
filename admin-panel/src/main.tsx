import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nGateway } from './i18nGateway';
// Ant Design 5.x не требует импорта CSS - стили встроены
import './styles/colors.css'; // Цветовая палитра Yess!Go
import './styles/animations.css'; // Глобальные анимации
import './styles/global.css'; // Глобальные стили
import './styles/theme.css'; // Система тем (светлая/тёмная)
import i18n, { type Language } from './i18n'; // Инициализация i18n и доступ к языку
import I18nProvider from './i18nGatewayContext';

// Настройка dayjs с поддержкой нескольких локалей
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(customParseFormat);
dayjs.extend(localeData);
dayjs.extend(weekday);

const applyDayjsLocale = (lang: Language) => {
  if (lang === 'en') {
    dayjs.locale('en');
  } else {
    // Для кыргызского используем русскую локаль форматов, чтобы избежать падений,
    // пока не будет добавлена полноценная локаль dayjs для ky-KG
    dayjs.locale('ru');
  }
};

// Инициализируем локаль dayjs по текущему языку
applyDayjsLocale(i18n.getLanguage());
// И обновляем её при смене языка через i18n
i18n.subscribe(() => {
  applyDayjsLocale(i18n.getLanguage());
});

// Инициализация темы при загрузке
const initTheme = () => {
  const savedTheme = localStorage.getItem('admin_panel_theme');
  const theme = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  
  // Обновляем мета-тег для мобильных браузеров
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0d1a12' : '#ffffff');
  }
};

// Инициализируем тему сразу при загрузке
initTheme();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Отключение Service Worker в режиме разработки (делаем это сразу и агрессивно)
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // Немедленно отменяем регистрацию всех Service Workers
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length === 0) {
      console.log('✅ No Service Workers registered');
      return;
    }
    
    console.log(`🗑️ Unregistering ${registrations.length} Service Worker(s)...`);
    
    // Отменяем регистрацию всех Service Workers
    const unregisterPromises = registrations.map((registration) => {
      return registration.unregister().then((success) => {
        if (success) {
          console.log('✅ Service Worker unregistered successfully');
        } else {
          console.warn('⚠️ Failed to unregister Service Worker');
        }
      });
    });
    
    Promise.all(unregisterPromises).then(() => {
      // Очищаем все кэши после отмены регистрации
      caches.keys().then((cacheNames) => {
        if (cacheNames.length === 0) {
          console.log('✅ No caches to clear');
          return;
        }
        
        console.log(`🗑️ Clearing ${cacheNames.length} cache(s)...`);
        const deletePromises = cacheNames.map((cacheName) => {
          return caches.delete(cacheName).then((success) => {
            if (success) {
              console.log(`✅ Cache "${cacheName}" deleted`);
            }
          });
        });
        
        Promise.all(deletePromises).then(() => {
          console.log('✅ All Service Workers and caches cleared for development');
          // Принудительная перезагрузка страницы для полного очищения
          if (window.location.search.includes('sw-cleanup')) {
            // Уже перезагружались
          } else {
            console.log('🔄 Reloading page to complete cleanup...');
            window.location.href = window.location.href + (window.location.search ? '&' : '?') + 'sw-cleanup=1';
          }
        });
      });
    });
  }).catch((error) => {
    console.error('❌ Error unregistering Service Workers:', error);
  });
} else if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Регистрация Service Worker только в production режиме
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);

        // Проверка обновлений
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Новое обновление доступно
                console.log('New Service Worker available');
                // Можно показать уведомление пользователю
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <I18nProvider>
      <I18nGateway>
        <App />
      </I18nGateway>
    </I18nProvider>
  </React.StrictMode>,
);
