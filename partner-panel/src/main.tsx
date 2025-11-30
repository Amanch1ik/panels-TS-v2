import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18nGatewayContext';
import { I18nGateway } from './i18nGateway';
import 'antd/dist/reset.css';
import './styles/colors.css';
import './styles/global.css';
import './styles/theme.css';
import './i18n'; // Инициализация i18n

// Инициализация темы при загрузке
const initTheme = () => {
  const savedTheme = localStorage.getItem('partner_panel_theme');
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
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <I18nGateway>
        <App />
      </I18nGateway>
    </I18nProvider>
  </React.StrictMode>,
);

