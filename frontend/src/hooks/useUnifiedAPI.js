// frontend/src/hooks/useUnifiedAPI.js
// Єдиний хук для всіх API операцій - замінює всі інші API хуки

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Контекст для глобального стану API
const APIContext = createContext(null);

// Провайдер для глобального стану
export const APIProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    data: {},
    cache: new Map(),
    requestQueue: new Map(),
    isLoading: {},
    errors: {}
  });

  return (
    <APIContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </APIContext.Provider>
  );
};

// Основний клас для роботи з API
class UnifiedAPIManager {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    this.cacheTimeout = 5 * 60 * 1000; // 5 хвилин
    this.requestTimeouts = new Map(); // Для очищення застарілих запитів
  }

  // Базовий API виклик з дедуплікацією та кешуванням
  async makeRequest(endpoint, options = {}, globalState, setGlobalState) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const now = Date.now();

    // Перевіряємо кеш
    if (globalState.cache.has(cacheKey)) {
      const cached = globalState.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheTimeout) {
        console.log(`🎯 Cache hit: ${endpoint}`);
        return cached.data;
      }
    }

    // Перевіряємо чи вже виконується запит
    if (globalState.requestQueue.has(cacheKey)) {
      console.log(`⏳ Request in progress: ${endpoint}`);
      return globalState.requestQueue.get(cacheKey);
    }

    // Створюємо новий запит
    const requestPromise = this.executeRequest(endpoint, options);
    
    // Додаємо в чергу
    setGlobalState(prev => ({
      ...prev,
      requestQueue: new Map(prev.requestQueue).set(cacheKey, requestPromise),
      isLoading: { ...prev.isLoading, [endpoint]: true }
    }));

    try {
      const result = await requestPromise;

      // Кешуємо результат
      setGlobalState(prev => {
        const newCache = new Map(prev.cache);
        newCache.set(cacheKey, { data: result, timestamp: now });
        
        const newQueue = new Map(prev.requestQueue);
        newQueue.delete(cacheKey);

        return {
          ...prev,
          cache: newCache,
          requestQueue: newQueue,
          data: { ...prev.data, [endpoint]: result },
          isLoading: { ...prev.isLoading, [endpoint]: false },
          errors: { ...prev.errors, [endpoint]: null }
        };
      });

      console.log(`✅ API Success: ${endpoint}`);
      return result;

    } catch (error) {
      // Обробляємо помилку
      setGlobalState(prev => {
        const newQueue = new Map(prev.requestQueue);
        newQueue.delete(cacheKey);

        return {
          ...prev,
          requestQueue: newQueue,
          isLoading: { ...prev.isLoading, [endpoint]: false },
          errors: { ...prev.errors, [endpoint]: error.message }
        };
      });

      console.error(`❌ API Error ${endpoint}:`, error);
      throw error;
    }
  }

  // Виконання HTTP запиту
  async executeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Обробляємо різні формати відповідей
    if (result.success) {
      return result.data;
    } else if (result.results) {
      return result.results;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      return result;
    }
  }

  // Метод для попереднього завантаження
  async preloadCriticalData(globalState, setGlobalState) {
    const criticalEndpoints = [
      '/homepage/',
      '/homepage/stats/',
      '/services/featured/',
      '/projects/featured/',
      '/translations/uk/all/'
    ];

    console.log('🔄 Попереднє завантаження критичних даних...');

    const results = await Promise.allSettled(
      criticalEndpoints.map(endpoint => 
        this.makeRequest(endpoint, {}, globalState, setGlobalState)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Попередньо завантажено ${successful}/${criticalEndpoints.length} endpoints`);

    return { successful, total: criticalEndpoints.length };
  }
}

// Створюємо singleton instance
const apiManager = new UnifiedAPIManager();

// Головний хук для роботи з API
export const useUnifiedAPI = (endpoint, options = {}) => {
  const context = useContext(APIContext);
  
  if (!context) {
    throw new Error('useUnifiedAPI must be used within APIProvider');
  }

  const { globalState, setGlobalState } = context;
  const [localLoading, setLocalLoading] = useState(false);

  // Функція для завантаження даних
  const loadData = useCallback(async () => {
    if (!endpoint) return null;

    setLocalLoading(true);
    try {
      const result = await apiManager.makeRequest(endpoint, options, globalState, setGlobalState);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [endpoint, options, globalState, setGlobalState]);

  // Автоматичне завантаження при зміні endpoint
  useEffect(() => {
    if (endpoint && !globalState.data[endpoint]) {
      loadData();
    }
  }, [endpoint, loadData]);

  return {
    data: globalState.data[endpoint] || null,
    isLoading: localLoading || globalState.isLoading[endpoint] || false,
    error: globalState.errors[endpoint] || null,
    reload: loadData,
    clearCache: () => {
      setGlobalState(prev => {
        const newCache = new Map(prev.cache);
        // Очищаємо кеш для поточного endpoint
        for (const key of newCache.keys()) {
          if (key.startsWith(endpoint)) {
            newCache.delete(key);
          }
        }
        return { ...prev, cache: newCache };
      });
    }
  };
};

// Спеціалізовані хуки для різних типів даних
export const useHomepageData = () => {
  const homepage = useUnifiedAPI('/homepage/');
  const stats = useUnifiedAPI('/homepage/stats/');
  
  // Комбінуємо дані з fallback
  const combinedData = {
    ...homepage.data,
    stats: stats.data || {
      experience: '5+',
      projects: '100+',
      clients: '50+',
      support: '24/7'
    }
  };

  return {
    data: combinedData,
    isLoading: homepage.isLoading || stats.isLoading,
    error: homepage.error || stats.error,
    reload: () => {
      homepage.reload();
      stats.reload();
    }
  };
};

export const useServicesData = () => {
  const featured = useUnifiedAPI('/services/featured/');
  const all = useUnifiedAPI('/services/');

  // Використовуємо featured, якщо доступні, інакше всі
  const services = featured.data || all.data || [];

  return {
    data: Array.isArray(services) ? services : [],
    isLoading: featured.isLoading || all.isLoading,
    error: featured.error || all.error,
    reload: () => {
      featured.reload();
      all.reload();
    }
  };
};

export const useProjectsData = () => {
  const featured = useUnifiedAPI('/projects/featured/');
  const all = useUnifiedAPI('/projects/');

  const projects = featured.data || all.data || [];

  return {
    data: Array.isArray(projects) ? projects : [],
    isLoading: featured.isLoading || all.isLoading,
    error: featured.error || all.error,
    reload: () => {
      featured.reload();
      all.reload();
    }
  };
};

export const useTranslationsData = (lang = 'uk') => {
  return useUnifiedAPI(`/translations/${lang}/all/`);
};

// Комбінований хук для Hero секції
export const useHeroData = () => {
  const homepage = useHomepageData();
  const services = useServicesData();
  const projects = useProjectsData();

  const heroData = {
    main_title: homepage.data?.main_title || 'Професійний одяг',
    sphere_title: homepage.data?.sphere_title || 'кожної сфери',
    subtitle: homepage.data?.subtitle || 'Створюємо якісний одяг для різних професій',
    primary_button_text: homepage.data?.primary_button_text || 'Наші проєкти',
    secondary_button_text: homepage.data?.secondary_button_text || 'Дізнатися більше',
    stats: homepage.data?.stats,
    featured_services: services.data.slice(0, 3),
    featured_projects: projects.data.slice(0, 4)
  };

  return {
    data: heroData,
    isLoading: homepage.isLoading || services.isLoading || projects.isLoading,
    error: homepage.error || services.error || projects.error,
    reload: () => {
      homepage.reload();
      services.reload();
      projects.reload();
    }
  };
};

// Хук для форм
export const useFormSubmission = () => {
  const context = useContext(APIContext);
  const { globalState, setGlobalState } = context;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = useCallback(async (endpoint, formData) => {
    setIsSubmitting(true);
    
    try {
      const result = await apiManager.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      }, globalState, setGlobalState);
      
      console.log('✅ Form submitted successfully');
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ Form submission failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [globalState, setGlobalState]);

  return {
    submitForm,
    isSubmitting
  };
};

// Утилітарний хук для управління кешем
export const useCacheManager = () => {
  const context = useContext(APIContext);
  const { globalState, setGlobalState } = context;

  const clearAllCache = useCallback(() => {
    setGlobalState(prev => ({
      ...prev,
      cache: new Map(),
      data: {},
      errors: {}
    }));
    console.log('🧹 All cache cleared');
  }, [setGlobalState]);

  const clearCachePattern = useCallback((pattern) => {
    setGlobalState(prev => {
      const newCache = new Map(prev.cache);
      const newData = { ...prev.data };
      
      for (const key of newCache.keys()) {
        if (key.includes(pattern)) {
          newCache.delete(key);
        }
      }
      
      for (const key of Object.keys(newData)) {
        if (key.includes(pattern)) {
          delete newData[key];
        }
      }
      
      return {
        ...prev,
        cache: newCache,
        data: newData
      };
    });
    console.log(`🧹 Cache cleared for pattern: ${pattern}`);
  }, [setGlobalState]);

  const getCacheStats = useCallback(() => {
    return {
      cacheSize: globalState.cache.size,
      dataKeys: Object.keys(globalState.data).length,
      activeRequests: globalState.requestQueue.size,
      errors: Object.keys(globalState.errors).filter(key => globalState.errors[key]).length
    };
  }, [globalState]);

  const preloadCriticalData = useCallback(async () => {
    return apiManager.preloadCriticalData(globalState, setGlobalState);
  }, [globalState, setGlobalState]);

  return {
    clearAllCache,
    clearCachePattern,
    getCacheStats,
    preloadCriticalData
  };
};

export default useUnifiedAPI;