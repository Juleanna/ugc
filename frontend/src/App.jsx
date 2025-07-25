// frontend/src/App.jsx
// Головний компонент додатку адаптований для ViewSets архітектури

import React, { useState, useEffect, Suspense } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { Spinner } from '@nextui-org/react';

// Провайдер для Unified API
import { APIProvider, useCacheManager, useAPIStats } from './hooks/useUnifiedAPI.jsx';

// Lazy loading компонентів для оптимізації
const FinalUGCDesign = React.lazy(() => import('./components/interactive/FinalUGCDesign.jsx'));

// Компонент завантаження
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="text-center">
      <Spinner size="lg" color="primary" className="mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Завантаження додатку...
      </h2>
      <p className="text-gray-500">
        Підготовка ViewSets API інтерфейсу
      </p>
    </div>
  </div>
);

// Компонент помилки
const ErrorBoundaryFallback = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.334 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900">
        Помилка завантаження
      </h2>
      <p className="text-gray-600 mb-4">
        {error?.message || 'Щось пішло не так при ініціалізації додатку'}
      </p>
      <button
        onClick={resetError}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Спробувати знову
      </button>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Технічні деталі
          </summary>
          <pre className="p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto">
            {error?.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Error Boundary клас
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
    
    // В production можна відправити помилку на сервер моніторингу
    if (process.env.NODE_ENV === 'production') {
      // Приклад: відправка на Sentry, LogRocket, тощо
      // sentryService.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Компонент ініціалізації API
const APIInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const { preloadCriticalData, getCacheStats } = useCacheManager();
  const { health } = useAPIStats();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Ініціалізація ViewSets API...');
        
        // Попереднє завантаження критичних даних
        const preloadResult = await preloadCriticalData();
        console.log('📦 Preload result:', preloadResult);
        
        // Отримання статистики кешу
        const cacheStats = getCacheStats();
        console.log('💾 Cache stats:', cacheStats);
        
        // Затримка для плавної анімації
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsInitialized(true);
        console.log('✅ Додаток ініціалізовано успішно');
        
      } catch (error) {
        console.error('❌ Помилка ініціалізації:', error);
        setInitError(error);
      }
    };

    initializeApp();
  }, [preloadCriticalData, getCacheStats]);

  if (initError) {
    return (
      <ErrorBoundaryFallback 
        error={initError}
        resetError={() => {
          setInitError(null);
          setIsInitialized(false);
        }}
      />
    );
  }

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return children;
};

// Головний компонент App
const App = () => {
  const [theme, setTheme] = useState('light');

  // Детекція системної теми
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    // Встановлення початкової теми
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Підписка на зміни
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Встановлення теми в document
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <ErrorBoundary>
      <NextUIProvider>
        <APIProvider>
          <div className={`min-h-screen ${theme}`}>
            <APIInitializer>
              <Suspense fallback={<LoadingSpinner />}>
                <FinalUGCDesign />
              </Suspense>
            </APIInitializer>
            
            {/* Development Tools */}
            {process.env.NODE_ENV === 'development' && (
              <DevTools theme={theme} setTheme={setTheme} />
            )}
          </div>
        </APIProvider>
      </NextUIProvider>
    </ErrorBoundary>
  );
};

// Інструменти розробки
const DevTools = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { clearAllCache, getCacheStats } = useCacheManager();
  const { data: apiStats, health } = useAPIStats();

  const handleClearCache = () => {
    clearAllCache();
    console.log('🗑️ Cache cleared via DevTools');
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    console.log(`🎨 Theme changed to: ${newTheme}`);
  };

  const cacheStats = getCacheStats();

  return (
    <>
      {/* Floating DevTools Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
        title="DevTools"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* DevTools Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-40 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                🛠️ DevTools
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* API Health */}
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Health
              </h4>
              <div className="text-sm">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    health?.api === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {health?.api || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Cache:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    health?.cache === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {health?.cache || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Stats */}
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cache Statistics
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Entries: {cacheStats.totalEntries}</div>
                <div>Active Requests: {cacheStats.activeRequests}</div>
                <div>Data Keys: {cacheStats.dataKeys.length}</div>
                <div>Errors: {cacheStats.errorCount}</div>
              </div>
            </div>

            {/* API Stats */}
            {apiStats && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Statistics
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Services: {apiStats.total_services || 0}</div>
                  <div>Projects: {apiStats.total_projects || 0}</div>
                  <div>Jobs: {apiStats.active_jobs || 0}</div>
                  <div>Offices: {apiStats.offices || 0}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleClearCache}
                className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm transition-colors"
              >
                🗑️ Clear Cache
              </button>
              
              <button
                onClick={handleThemeToggle}
                className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition-colors"
              >
                🎨 Toggle Theme ({theme})
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-sm transition-colors"
              >
                🔄 Reload App
              </button>
            </div>

            {/* Environment Info */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div>Mode: {process.env.NODE_ENV}</div>
                <div>API URL: {import.meta.env.VITE_API_URL || 'Default'}</div>
                <div>Build: {import.meta.env.VITE_APP_VERSION || 'Dev'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;