// frontend/src/hooks/useUnifiedAPI.jsx
// Виправлена версія для існуючої структури бекенду

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Context for global API state
const APIContext = createContext(null);

// Provider for global state
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

// Main class for API operations
class UnifiedAPIManager {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    this.cacheTimeout = 5 * 60 * 1000;
    this.requestTimeouts = new Map();
  }

  async makeRequest(endpoint, options = {}, globalState, setGlobalState) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const now = Date.now();

    // Check cache
    if (globalState.cache.has(cacheKey)) {
      const cached = globalState.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheTimeout) {
        console.log(`Cache hit: ${endpoint}`);
        return cached.data;
      }
    }

    // Check if request is already in progress
    if (globalState.requestQueue.has(cacheKey)) {
      console.log(`Request in progress: ${endpoint}`);
      return globalState.requestQueue.get(cacheKey);
    }

    // Create new request
    const requestPromise = this.executeRequest(endpoint, options);
    
    // Add to queue
    setGlobalState(prev => ({
      ...prev,
      requestQueue: new Map(prev.requestQueue).set(cacheKey, requestPromise),
      isLoading: { ...prev.isLoading, [endpoint]: true }
    }));

    try {
      const result = await requestPromise;

      // Cache result
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

      console.log(`API Success: ${endpoint}`);
      return result;

    } catch (error) {
      // Handle error
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

      console.error(`API Error ${endpoint}:`, error);
      throw error;
    }
  }

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

  async preloadCriticalData(globalState, setGlobalState) {
    // ВИПРАВЛЕНО: Використовуємо тільки існуючі endpoints
    const criticalEndpoints = [
      '/homepage/stats/',        // ✅ Працює
      '/services/featured/',     // ✅ Працює
      '/projects/featured/',     // ✅ Працює
      '/translations/uk/all/'    // ⚠️ Потрібно перевірити
    ];

    console.log('Preloading critical data...');

    const results = await Promise.allSettled(
      criticalEndpoints.map(endpoint => 
        this.makeRequest(endpoint, {}, globalState, setGlobalState)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Preloaded ${successful}/${criticalEndpoints.length} endpoints`);

    return { successful, total: criticalEndpoints.length };
  }
}

// Create singleton instance
const apiManager = new UnifiedAPIManager();

// Main hook for API operations
export const useUnifiedAPI = (endpoint, options = {}) => {
  const context = useContext(APIContext);
  
  if (!context) {
    throw new Error('useUnifiedAPI must be used within APIProvider');
  }

  const { globalState, setGlobalState } = context;
  const [localLoading, setLocalLoading] = useState(false);

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

// ВИПРАВЛЕНІ спеціалізовані хуки

export const useHomepageData = () => {
  // Використовуємо тільки існуючий endpoint
  const stats = useUnifiedAPI('/homepage/stats/');
  
  const combinedData = {
    // Базові дані зі статистики
    main_title: 'Професійний одяг',
    sphere_title: 'кожної сфери', 
    subtitle: 'Створюємо якісний одяг для різних професій',
    primary_button_text: 'Наші проєкти',
    secondary_button_text: 'Дізнатися більше',
    // Статистика з API
    stats: stats.data || {
      experience: '5+',
      projects: '100+',
      clients: '50+',
      support: '24/7'
    }
  };

  return {
    data: combinedData,
    isLoading: stats.isLoading,
    error: stats.error,
    reload: stats.reload
  };
};

export const useServicesData = () => {
  // Використовуємо тільки featured endpoint (працює)
  const featured = useUnifiedAPI('/services/featured/');
  
  // Не робимо запит до /services/ оскільки він не існує
  const services = featured.data || [];

  return {
    data: Array.isArray(services) ? services : [],
    isLoading: featured.isLoading,
    error: featured.error,
    reload: featured.reload
  };
};

export const useProjectsData = () => {
  // Використовуємо тільки featured endpoint (працює)
  const featured = useUnifiedAPI('/projects/featured/');
  
  // Не робимо запит до /projects/ оскільки він не існує
  const projects = featured.data || [];

  return {
    data: Array.isArray(projects) ? projects : [],
    isLoading: featured.isLoading,
    error: featured.error,
    reload: featured.reload
  };
};

export const useTranslationsData = (lang = 'uk') => {
  // Спробуємо endpoint перекладів
  return useUnifiedAPI(`/translations/${lang}/all/`);
};

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
      
      console.log('Form submitted successfully');
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Form submission failed:', error);
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
    console.log('All cache cleared');
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
    console.log(`Cache cleared for pattern: ${pattern}`);
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