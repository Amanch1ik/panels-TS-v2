# Интеграция системы мониторинга

## Установка

Система мониторинга уже создана в `shared/monitoring/`. Для интеграции в панели:

### 1. Интеграция в API клиенты

#### Админ-панель (`admin-panel/src/services/adminApi.ts`)

Добавьте после создания `apiClient`:

```typescript
import { createMetricsInterceptor, errorLogger } from '../../../../shared/monitoring';

// Создаем интерцепторы метрик
const metricsInterceptor = createMetricsInterceptor();

// Добавьте метрики к существующим интерцепторам
apiClient.interceptors.request.use(
  (config) => {
    // Существующий код для токена
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Добавляем метрики
    return metricsInterceptor.request(config);
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обновите response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Метрики успешного ответа
    metricsInterceptor.response(response);
    return response;
  },
  (error: AxiosError) => {
    // Существующая обработка ошибок
    // ... ваш код ...
    
    // Логируем ошибку
    if (error.response) {
      errorLogger.logApiError(
        error.config?.url || '',
        error.response.status,
        error
      );
    }
    
    // Метрики ошибки
    return metricsInterceptor.error(error);
  }
);
```

#### Партнёр-панель (`partner-panel/src/services/partnerApi.ts`)

Аналогично для партнёр-панели.

### 2. Инициализация в App.tsx

#### Админ-панель (`admin-panel/src/App.tsx`)

```typescript
import { initializeMonitoring } from '../../shared/monitoring';

function App() {
  // Инициализируем мониторинг при загрузке приложения
  React.useEffect(() => {
    initializeMonitoring();
  }, []);
  
  // ... остальной код ...
}
```

### 3. Компонент дашборда метрик

Создайте страницу `MonitoringPage.tsx` для просмотра метрик:

```typescript
import { getMonitoringReport, exportMonitoringData } from '../../../../shared/monitoring';

export const MonitoringPage = () => {
  const [report, setReport] = useState(getMonitoringReport());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setReport(getMonitoringReport());
    }, 5000); // Обновление каждые 5 секунд
    
    return () => clearInterval(interval);
  }, []);
  
  const handleExport = () => {
    const data = exportMonitoringData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-report-${Date.now()}.json`;
    a.click();
  };
  
  // Отображение метрик...
};
```

## Использование

### Получение метрик API

```typescript
import { apiMetricsCollector } from '../../../../shared/monitoring';

// Сводка за последние 5 минут
const summary = apiMetricsCollector.getRecentMetrics(5);

console.log('Total requests:', summary.totalRequests);
console.log('Success rate:', summary.successfulRequests / summary.totalRequests);
console.log('Average duration:', summary.averageDuration);
```

### Логирование ошибок

```typescript
import { errorLogger } from '../../../../shared/monitoring';

try {
  // ваш код
} catch (error) {
  errorLogger.logError({
    message: error.message,
    source: 'api',
    stack: error.stack,
  });
}
```

### Мониторинг производительности

```typescript
import { performanceMonitor } from '../../../../shared/monitoring';

const metrics = performanceMonitor.getMetrics();
const score = performanceMonitor.getPerformanceScore();

console.log('FCP:', metrics.fcp);
console.log('LCP:', metrics.lcp);
console.log('Score:', score); // 'good' | 'needs-improvement' | 'poor'
```

## Конфигурация

Создайте `.env` файл для управления мониторингом:

```env
# Включить/выключить метрики API
VITE_ENABLE_METRICS=true

# Включить/выключить логирование ошибок
VITE_ENABLE_ERROR_LOGGING=true

# Включить/выключить мониторинг производительности
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

## Экспорт данных

Для отправки данных на сервер:

```typescript
import { exportMonitoringData } from '../../../../shared/monitoring';

const data = exportMonitoringData();

// Отправка на сервер
fetch('/api/v1/admin/metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: data,
});
```

