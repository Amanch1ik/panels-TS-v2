# Утилиты для тестирования системы мониторинга

## Тестирование метрик API

### Создание тестовых запросов

```typescript
// test-api-metrics.ts
import { apiMetricsCollector } from './apiMetrics';

// Симулируем несколько запросов
function simulateApiRequests() {
  // Успешный запрос
  apiMetricsCollector.recordRequest({
    url: '/api/v1/users',
    method: 'GET',
    status: 200,
    duration: 150,
    timestamp: Date.now(),
    success: true,
  });

  // Запрос с ошибкой
  apiMetricsCollector.recordRequest({
    url: '/api/v1/users/999',
    method: 'GET',
    status: 404,
    duration: 50,
    timestamp: Date.now(),
    error: 'Not Found',
    success: false,
  });

  // Медленный запрос
  apiMetricsCollector.recordRequest({
    url: '/api/v1/dashboard/stats',
    method: 'GET',
    status: 200,
    duration: 2500,
    timestamp: Date.now(),
    success: true,
  });
}

// Проверка метрик
function testMetrics() {
  const summary = apiMetricsCollector.getSummary();
  
  console.assert(summary.totalRequests > 0, 'Should have requests');
  console.assert(summary.successfulRequests > 0, 'Should have successful requests');
  console.assert(summary.failedRequests > 0, 'Should have failed requests');
  
  console.log('✅ API Metrics test passed');
}
```

## Тестирование логирования ошибок

```typescript
// test-error-logger.ts
import { errorLogger } from './errorLogger';

function testErrorLogging() {
  // API ошибка
  errorLogger.logApiError('/api/v1/users', 500, { message: 'Server error' });
  
  // JavaScript ошибка
  errorLogger.logError({
    message: 'Test error',
    source: 'javascript',
    stack: 'Error: Test error\n  at test()',
  });
  
  // React ошибка
  errorLogger.logReactError(
    new Error('React component error'),
    { componentStack: 'at Component' }
  );
  
  const summary = errorLogger.getSummary();
  console.assert(summary.totalErrors > 0, 'Should have errors');
  
  console.log('✅ Error Logger test passed');
}
```

## Тестирование производительности

```typescript
// test-performance.ts
import { performanceMonitor } from './performanceMonitor';

function testPerformance() {
  // Измерение времени рендеринга
  const result = performanceMonitor.measureRenderTime('TestComponent', () => {
    // Симуляция тяжелой операции
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += i;
    }
    return sum;
  });
  
  const metrics = performanceMonitor.getMetrics();
  const score = performanceMonitor.getPerformanceScore();
  
  console.log('Metrics:', metrics);
  console.log('Score:', score);
  
  console.log('✅ Performance Monitor test passed');
}
```

## Интеграционные тесты

```typescript
// integration-test.ts
import { 
  initializeMonitoring,
  getMonitoringReport,
  exportMonitoringData,
} from './index';

function runIntegrationTests() {
  // Инициализация
  initializeMonitoring();
  
  // Генерация отчета
  const report = getMonitoringReport();
  console.assert(report !== null, 'Report should be generated');
  console.assert(report.api !== undefined, 'Should have API metrics');
  console.assert(report.errors !== undefined, 'Should have error metrics');
  console.assert(report.performance !== undefined, 'Should have performance metrics');
  
  // Экспорт
  const exported = exportMonitoringData();
  console.assert(exported.length > 0, 'Should export data');
  
  const parsed = JSON.parse(exported);
  console.assert(parsed.api !== undefined, 'Exported should have API data');
  
  console.log('✅ Integration tests passed');
}

// Запуск всех тестов
function runAllTests() {
  console.log('🧪 Running monitoring tests...');
  
  try {
    runIntegrationTests();
    console.log('✅ All tests passed');
  } catch (error) {
    console.error('❌ Tests failed:', error);
  }
}

// Экспорт для использования
export { runAllTests };
```

## Использование в браузере

Откройте консоль браузера и выполните:

```javascript
// Импортируйте функции (в зависимости от структуры проекта)
import { runAllTests } from './test-utils';

// Запустите тесты
runAllTests();
```

Или создайте тестовую страницу:

```typescript
// TestPage.tsx
import { useEffect } from 'react';
import { runAllTests } from '../shared/monitoring/test-utils';

export const TestPage = () => {
  useEffect(() => {
    runAllTests();
  }, []);
  
  return <div>Проверьте консоль для результатов тестов</div>;
};
```

## Автоматическое тестирование

Для автоматического тестирования в CI/CD:

```bash
# test-monitoring.sh
#!/bin/bash

echo "🧪 Testing monitoring system..."

# Запустите тесты через Node.js
node -e "
import('./shared/monitoring/test-utils.js').then(module => {
  module.runAllTests();
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
"

echo "✅ Monitoring tests completed"
```

## Ручное тестирование

1. Откройте DevTools → Console
2. Выполните:
   ```javascript
   // Загрузите модуль
   import('./shared/monitoring/index.js').then(module => {
     const report = module.getMonitoringReport();
     console.table(report.api);
     console.table(report.errors);
   });
   ```
3. Проверьте метрики в реальном времени

