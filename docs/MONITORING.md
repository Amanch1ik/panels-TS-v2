# 📊 Система мониторинга

Полнофункциональная система мониторинга для отслеживания производительности, ошибок и метрик API.

## Быстрый старт

### Интеграция

```typescript
// В App.tsx
import { initializeMonitoring } from '../../shared/monitoring';

useEffect(() => {
  initializeMonitoring();
}, []);
```

### Использование

```typescript
import { getMonitoringReport } from '../../shared/monitoring';

const report = getMonitoringReport();
console.log('API:', report.api);
console.log('Errors:', report.errors);
console.log('Performance:', report.performance);
```

## Документация

- **API**: `shared/monitoring/README.md`

## Компоненты

- **API Метрики** - Отслеживание всех запросов
- **Логирование ошибок** - Централизованное логирование
- **Производительность** - Web Vitals и метрики
- **Дашборд** - Страница `/monitoring` в админ-панели

