# 🧹 Очистка Service Worker

## ⚠️ Важно

Service Worker уже зарегистрирован в вашем браузере и мешает работе Vite dev server. 

**Нужно очистить его один раз**, после чего автоматическое отключение будет работать.

## 🚀 Быстрое решение

### Откройте консоль браузера (F12) и выполните:

```javascript
// Скопируйте и вставьте весь этот код в консоль:

(async function() {
  console.log('🧹 Начинаем очистку Service Worker...');
  
  if ('serviceWorker' in navigator) {
    // Отключаем все Service Workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`Найдено ${registrations.length} Service Worker(s)`);
    
    for (const registration of registrations) {
      const success = await registration.unregister();
      console.log(success ? '✅ Отключен' : '❌ Ошибка отключения');
    }
    
    // Очищаем все кэши
    const cacheNames = await caches.keys();
    console.log(`Найдено ${cacheNames.length} кэша(ей)`);
    
    for (const cacheName of cacheNames) {
      const deleted = await caches.delete(cacheName);
      console.log(deleted ? `✅ Кэш "${cacheName}" удален` : `❌ Ошибка удаления "${cacheName}"`);
    }
    
    console.log('✅ Очистка завершена!');
    console.log('🔄 Перезагрузите страницу (Ctrl+Shift+R)');
  } else {
    console.log('Service Worker не поддерживается');
  }
})();
```

После выполнения перезагрузите страницу с очисткой кэша: **Ctrl+Shift+R** (или Cmd+Shift+R на Mac)

## ✅ После очистки

- Service Worker больше не будет мешать работе
- Vite dev server будет работать нормально
- Hot Module Replacement (HMR) будет работать
- Автоматическое отключение Service Worker будет работать

