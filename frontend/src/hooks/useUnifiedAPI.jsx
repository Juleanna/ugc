// frontend/src/hooks/useUnifiedAPI.jsx
// Виправлена версія з rate limiting та throttling

import React, { useState, useEffect, useContext, useCallback, createContext } from 'react';

// =================== КОНТЕКСТ ГЛОБАЛЬНОГО СТАНУ ===================

const APIContext = createContext(null);

export const APIProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    data: {},
    errors: {},
    isLoading: {},
    cache: new Map(),
    requestQueue: new Set(),
  });

  return (
    <APIContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </APIContext.Provider>
  );
};

// =================== RATE LIMITER ===================

class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) { // 10 запитів за хвилину
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // endpoint -> timestamps[]
    this.globalRequests = []; // всі запити
  }

  // Перевірка чи можна робити запит
  canMakeRequest(endpoint) {
    const now = Date.now();
    
    // Очищаємо старі записи
    this.cleanup(now);
    
    // Перевіряємо глобальний ліміт
    if (this.globalRequests.length >= this.maxRequests) {
      console.warn(`🚫 Rate limit exceeded: ${this.globalRequests.length}/${this.maxRequests} requests in last ${this.windowMs/1000}s`);
      return false;
    }
    
    // Перевіряємо ліміт по endpoint
    const endpointRequests = this.requests.get(endpoint) || [];
    if (endpointRequests.length >= 3) { // max 3 запити на endpoint
      console.warn(`🚫 Endpoint rate limit exceeded for ${endpoint}: ${endpointRequests.length}/3`);
      return false;
    }
    
    return true;
  }

  // Записуємо запит
  recordRequest(endpoint) {
    const now = Date.now();
    
    // Записуємо глобально
    this.globalRequests.push(now);
    
    // Записуємо по endpoint
    const endpointRequests = this.requests.get(endpoint) || [];
    endpointRequests.push(now);
    this.requests.set(endpoint, endpointRequests);
    
    console.log(`📊 Rate limiter: ${this.globalRequests.length}/${this.maxRequests} global, ${endpointRequests.length}/3 for ${endpoint}`);
  }

  // Очищення старих записів
  cleanup(now) {
    // Очищаємо глобальні
    this.globalRequests = this.globalRequests.filter(time => now - time < this.windowMs);
    
    // Очищаємо по endpoints
    for (const [endpoint, timestamps] of this.requests) {
      const filtered = timestamps.filter(time => now - time < this.windowMs);
      if (filtered.length === 0) {
        this.requests.delete(endpoint);
      } else {
        this.requests.set(endpoint, filtered);
      }
    }
  }

  // Отримання часу очікування
  getWaitTime(endpoint) {
    const now = Date.now();
    this.cleanup(now);
    
    // Перевіряємо глобальний ліміт
    if (this.globalRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.globalRequests);
      return Math.max(0, this.windowMs - (now - oldestRequest)) + 1000; // +1s buffer
    }
    
    // Перевіряємо ліміт endpoint
    const endpointRequests = this.requests.get(endpoint) || [];
    if (endpointRequests.length >= 3) {
      const oldestRequest = Math.min(...endpointRequests);
      return Math.max(0, this.windowMs - (now - oldestRequest)) + 1000;
    }
    
    return 0;
  }

  // Статистика
  getStats() {
    const now = Date.now();
    this.cleanup(now);
    return {
      globalRequests: this.globalRequests.length,
      maxRequests: this.maxRequests,
      endpointCounts: Object.fromEntries(
        Array.from(this.requests.entries()).map(([endpoint, timestamps]) => [
          endpoint, 
          timestamps.length
        ])
      )
    };
  }
}

// =================== УНІФІКОВАНИЙ API МЕНЕДЖЕР ===================

class UnifiedAPIManager {
  constructor() {
    this.baseURL = 'http://127.0.0.1:8000/api/v1';
    this.requestTimeout = 15000; // Збільшено з 10s до 15s
    this.retryDelay = 2000; // Збільшено з 1s до 2s
    this.maxRetries = 2; // Зменшено з 3 до 2
    this.rateLimiter = new RateLimiter(8, 60000); // 8 запитів за хвилину
    this.pendingRequests = new Map(); // Дедуплікація запитів
  }

  async makeRequest(endpoint, options = {}, globalState, setGlobalState) {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;

    // Перевіряємо кеш
    if (globalState.cache.has(cacheKey)) {
      const cached = globalState.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 хвилин кеш
        console.log(`💾 Cache hit for ${endpoint}`);
        return cached.data;
      }
    }

    // Дедуплікація: перевіряємо чи запит вже виконується
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`⏳ Request already pending for ${endpoint}, waiting...`);
      return this.pendingRequests.get(cacheKey);
    }

    // Rate limiting перевірка
    if (!this.rateLimiter.canMakeRequest(endpoint)) {
      const waitTime = this.rateLimiter.getWaitTime(endpoint);
      console.warn(`⏰ Rate limited ${endpoint}, waiting ${waitTime}ms`);
      
      // Чекаємо та пробуємо знову
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Перевіряємо повторно
      if (!this.rateLimiter.canMakeRequest(endpoint)) {
        throw new Error(`Rate limit exceeded for ${endpoint}. Please try again later.`);
      }
    }

    // Створюємо проміс для запиту
    const requestPromise = this.executeRequestWithRetry(url, options, endpoint);
    this.pendingRequests.set(cacheKey, requestPromise);

    // Оновлюємо стан завантаження
    setGlobalState(prev => ({
      ...prev,
      isLoading: { ...prev.isLoading, [endpoint]: true }
    }));

    try {
      // Записуємо запит у rate limiter
      this.rateLimiter.recordRequest(endpoint);
      
      const result = await requestPromise;
      const processedData = this.processResponse(result);

      // Кешуємо результат
      setGlobalState(prev => {
        const newCache = new Map(prev.cache);
        newCache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now()
        });

        return {
          ...prev,
          data: { ...prev.data, [endpoint]: processedData },
          errors: { ...prev.errors, [endpoint]: null },
          isLoading: { ...prev.isLoading, [endpoint]: false },
          cache: newCache
        };
      });

      return processedData;
    } catch (error) {
      console.error(`❌ API Error ${endpoint}:`, error);
      
      setGlobalState(prev => ({
        ...prev,
        errors: { ...prev.errors, [endpoint]: error },
        isLoading: { ...prev.isLoading, [endpoint]: false }
      }));

      throw error;
    } finally {
      // Видаляємо з pending запитів
      this.pendingRequests.delete(cacheKey);
    }
  }

  async executeRequestWithRetry(url, options, endpoint, attempt = 1) {
    try {
      return await this.executeRequest(url, options);
    } catch (error) {
      // Якщо це rate limit помилка і ще є спроби
      if (error.message.includes('429') && attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`🔄 Retry ${attempt}/${this.maxRetries} for ${endpoint} after ${delay}ms (429 error)`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeRequestWithRetry(url, options, endpoint, attempt + 1);
      }
      
      throw error;
    }
  }

  async executeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      console.log(`🌐 Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  processResponse(result) {
    if (!result) return null;
    
    if (result.data && typeof result.data === 'object') {
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
    // ЗМЕНШЕНА кількість критичних endpoints для уникнення rate limit
    const criticalEndpoints = [
      '/homepage/1/',                    // Існуючий ViewSet endpoint
      '/content/stats/',                 // Централізований endpoint
      '/content/featured/',              // Централізований endpoint
    ];

    console.log('🔄 Preloading critical data with rate limiting...');
    console.log(`📊 Rate limiter stats:`, this.rateLimiter.getStats());

    // Послідовне завантаження замість паралельного для уникнення rate limit
    const results = [];
    for (const endpoint of criticalEndpoints) {
      try {
        console.log(`⏳ Loading ${endpoint}...`);
        const result = await this.makeRequest(endpoint, {}, globalState, setGlobalState);
        results.push({ status: 'fulfilled', value: result });
        
        // Невелика затримка між запитами
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to load ${endpoint}:`, error);
        results.push({ status: 'rejected', reason: error });
      }
    }

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Preloaded ${successful}/${criticalEndpoints.length} endpoints`);
    console.log(`📊 Final rate limiter stats:`, this.rateLimiter.getStats());

    return { successful, total: criticalEndpoints.length };
  }

  // Метод для отримання статистики
  getStats() {
    return {
      rateLimiter: this.rateLimiter.getStats(),
      pendingRequests: this.pendingRequests.size,
      baseURL: this.baseURL
    };
  }
}

// Створення singleton instance
const apiManager = new UnifiedAPIManager();

// Основний хук для API операцій
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
  }, [endpoint, globalState.data, loadData]);

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

// =================== СПЕЦІАЛІЗОВАНІ ХУКИ ДЛЯ VIEWSETS ===================

export const useHomepageData = () => {
  const homepageDetails = useUnifiedAPI('/homepage/1/');
  const homepageStats = useUnifiedAPI('/content/stats/');
  const featuredContent = useUnifiedAPI('/content/featured/');

  const combinedData = {
    ...homepageDetails.data,
    stats: homepageStats.data?.homepage_stats || homepageStats.data || {
      total_projects: 150,
      satisfied_clients: 95,
      years_experience: 10,
      team_members: 25
    },
    featured_services: featuredContent.data?.services || [],
    featured_projects: featuredContent.data?.projects || []
  };

  return {
    data: combinedData,
    isLoading: homepageDetails.isLoading || homepageStats.isLoading || featuredContent.isLoading,
    error: homepageDetails.error || homepageStats.error || featuredContent.error,
    reload: () => {
      homepageDetails.reload();
      homepageStats.reload();
      featuredContent.reload();
    }
  };
};

export const useServicesData = () => {
  const allServices = useUnifiedAPI('/services/');
  const featuredServices = useUnifiedAPI('/content/featured/');

  return {
    data: allServices.data || [],
    featuredData: featuredServices.data?.services || [],
    isLoading: allServices.isLoading || featuredServices.isLoading,
    error: allServices.error || featuredServices.error,
    reload: () => {
      allServices.reload();
      featuredServices.reload();
    }
  };
};

export const useServiceDetails = (serviceId) => {
  const serviceDetails = useUnifiedAPI(`/services/${serviceId}/`);
  const serviceFeatures = useUnifiedAPI(`/services/${serviceId}/features/`);

  return {
    data: {
      ...serviceDetails.data,
      features: serviceFeatures.data || []
    },
    isLoading: serviceDetails.isLoading || serviceFeatures.isLoading,
    error: serviceDetails.error || serviceFeatures.error,
    reload: () => {
      serviceDetails.reload();
      serviceFeatures.reload();
    }
  };
};

export const useProjectsData = () => {
  const allProjects = useUnifiedAPI('/projects/');
  const featuredProjects = useUnifiedAPI('/content/featured/');
  const projectCategories = useUnifiedAPI('/project-categories/');

  return {
    data: allProjects.data || [],
    featuredData: featuredProjects.data?.projects || [],
    categories: projectCategories.data || [],
    isLoading: allProjects.isLoading || featuredProjects.isLoading || projectCategories.isLoading,
    error: allProjects.error || featuredProjects.error || projectCategories.error,
    reload: () => {
      allProjects.reload();
      featuredProjects.reload();
      projectCategories.reload();
    }
  };
};

export const useProjectDetails = (projectSlug) => {
  const projectDetails = useUnifiedAPI(`/projects/${projectSlug}/`);
  const projectImages = useUnifiedAPI(`/projects/${projectSlug}/images/`);

  return {
    data: {
      ...projectDetails.data,
      images: projectImages.data || []
    },
    isLoading: projectDetails.isLoading || projectImages.isLoading,
    error: projectDetails.error || projectImages.error,
    reload: () => {
      projectDetails.reload();
      projectImages.reload();
    }
  };
};

export const useJobsData = () => {
  const allJobs = useUnifiedAPI('/jobs/');
  const urgentJobs = useUnifiedAPI('/jobs/?urgent=true');
  const workplacePhotos = useUnifiedAPI('/workplace-photos/');

  return {
    data: allJobs.data || [],
    urgentData: urgentJobs.data || [],
    workplacePhotos: workplacePhotos.data || [],
    isLoading: allJobs.isLoading || urgentJobs.isLoading,
    error: allJobs.error || urgentJobs.error,
    reload: () => {
      allJobs.reload();
      urgentJobs.reload();
      workplacePhotos.reload();
    }
  };
};

export const useJobDetails = (jobSlug) => {
  return useUnifiedAPI(`/jobs/${jobSlug}/`);
};

export const useContactData = () => {
  const offices = useUnifiedAPI('/offices/');
  const partnershipInfo = useUnifiedAPI('/partnership-info/');

  return {
    offices: offices.data || [],
    partnershipInfo: partnershipInfo.data || [],
    isLoading: offices.isLoading || partnershipInfo.isLoading,
    error: offices.error || partnershipInfo.error,
    reload: () => {
      offices.reload();
      partnershipInfo.reload();
    }
  };
};

export const useTeamData = () => {
  const teamMembers = useUnifiedAPI('/team-members/');
  const managementTeam = useUnifiedAPI('/team-members/?is_management=true');

  return {
    data: teamMembers.data || [],
    managementData: managementTeam.data || [],
    isLoading: teamMembers.isLoading || managementTeam.isLoading,
    error: teamMembers.error || managementTeam.error,
    reload: () => {
      teamMembers.reload();
      managementTeam.reload();
    }
  };
};

export const useTranslationsData = (lang = 'uk') => {
  const translations = useUnifiedAPI(`/translations/${lang}/`);
  const allTranslations = useUnifiedAPI(`/translations/${lang}/all/`);

  return {
    data: translations.data || {},
    extendedData: allTranslations.data || {},
    isLoading: translations.isLoading || allTranslations.isLoading,
    error: translations.error || allTranslations.error,
    reload: () => {
      translations.reload();
      allTranslations.reload();
    }
  };
};

export const useAPIStats = () => {
  const apiStats = useUnifiedAPI('/content/stats/');
  const healthCheck = useUnifiedAPI('/health/');

  return {
    data: apiStats.data || {},
    health: healthCheck.data || {},
    isLoading: apiStats.isLoading || healthCheck.isLoading,
    error: apiStats.error || healthCheck.error,
    reload: () => {
      apiStats.reload();
      healthCheck.reload();
    }
  };
};

// =================== ФОРМИ ТА SUBMISSION ===================

export const useFormSubmission = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useFormSubmission must be used within APIProvider');
  }

  const { globalState, setGlobalState } = context;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = useCallback(async (endpoint, formData) => {
    setIsSubmitting(true);
    
    try {
      const result = await apiManager.makeRequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formData
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

  const submitContactForm = useCallback((formData) => {
    return submitForm('/contact-inquiries/', formData);
  }, [submitForm]);

  const submitJobApplication = useCallback((formData) => {
    return submitForm('/job-applications/', formData);
  }, [submitForm]);

  const submitPartnerInquiry = useCallback((formData) => {
    return submitForm('/partner-inquiries/', formData);
  }, [submitForm]);

  return {
    submitForm,
    submitContactForm,
    submitJobApplication,
    submitPartnerInquiry,
    isSubmitting
  };
};

// =================== УТИЛІТИ ===================

export const useCacheManager = () => {
  const { setGlobalState, globalState } = useContext(APIContext);

  const clearAllCache = useCallback(() => {
    setGlobalState(prev => ({
      ...prev,
      cache: new Map(),
      data: {}
    }));
    console.log('🗑️ All cache cleared');
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
      
      return { ...prev, cache: newCache, data: newData };
    });
    console.log(`🗑️ Cache cleared for pattern: ${pattern}`);
  }, [setGlobalState]);

  const getCacheStats = useCallback(() => {
    return {
      totalEntries: globalState.cache.size,
      dataKeys: Object.keys(globalState.data),
      activeRequests: globalState.requestQueue?.size || 0,
      errorCount: Object.keys(globalState.errors).filter(key => globalState.errors[key]).length,
      apiManagerStats: apiManager.getStats()
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

// =================== ЗРУЧНИЙ КОМПОЗИТНИЙ ХУК ===================

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
    stats: homepage.data?.stats || {},
    featured_services: services.featuredData?.slice(0, 3) || [],
    featured_projects: projects.featuredData?.slice(0, 4) || []
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

// Альтернативний експорт для зворотної сумісності
export const useAPIUtils = useCacheManager;

// Експорт менеджера для прямого використання (якщо потрібно)
export { apiManager };

console.log('🚀 Rate Limited Unified API initialized');
console.log('✅ Added rate limiting (8 requests/minute)');
console.log('✅ Added request deduplication');
console.log('✅ Added exponential backoff for retries');
console.log('✅ Reduced critical endpoints to prevent rate limiting');