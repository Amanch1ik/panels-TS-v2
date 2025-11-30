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

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Отключение Service Worker в режиме разработки
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then(() => {
        console.log('Service Worker unregistered for development');
        // Очищаем все кэши
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      });
    });
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
