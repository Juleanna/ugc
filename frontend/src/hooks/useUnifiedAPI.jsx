// frontend/src/hooks/useUnifiedAPI.jsx
// Адаптовано для нової ViewSets архітектури бекенду

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Context для глобального стану API
const APIContext = createContext(null);

// Provider для глобального стану
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

// Основний клас для API операцій з підтримкою ViewSets
class UnifiedAPIManager {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    this.cacheTimeout = 5 * 60 * 1000; // 5 хвилин
    this.requestTimeouts = new Map();
  }

  async makeRequest(endpoint, options = {}, globalState, setGlobalState) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const now = Date.now();

    // Перевірка кешу
    if (globalState.cache.has(cacheKey)) {
      const cached = globalState.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheTimeout) {
        console.log(`✅ Cache hit: ${endpoint}`);
        return cached.data;
      }
    }

    // Перевірка чи запит вже виконується
    if (globalState.requestQueue.has(cacheKey)) {
      console.log(`⏳ Request in progress: ${endpoint}`);
      return globalState.requestQueue.get(cacheKey);
    }

    // Створення нового запиту
    const requestPromise = this.executeRequest(endpoint, options);
    
    // Додавання до черги
    setGlobalState(prev => ({
      ...prev,
      requestQueue: new Map(prev.requestQueue).set(cacheKey, requestPromise),
      isLoading: { ...prev.isLoading, [endpoint]: true }
    }));

    try {
      const result = await requestPromise;

      // Кешування результату
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

      console.log(`✅ API Success: ${endpoint}`, result);
      return result;

    } catch (error) {
      // Обробка помилки
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
    
    // Обробляємо різні формати відповідей від ViewSets
    if (result.success !== undefined) {
      // Стандартний формат API
      return result.success ? result.data : result;
    } else if (result.results) {
      // Пагінована відповідь від ViewSets
      return result.results;
    } else if (Array.isArray(result)) {
      // Масив даних
      return result;
    } else {
      // Інші типи відповідей
      return result;
    }
  }

  async preloadCriticalData(globalState, setGlobalState) {
    // ViewSets endpoints для критичних даних
    const criticalEndpoints = [
      '/homepage/1/',                    // ViewSets endpoint для головної сторінки
      '/homepage/1/stats/',              // Статистика головної сторінки
      '/services/featured/',             // Рекомендовані послуги
      '/projects/featured/',             // Рекомендовані проєкти
      '/translations/uk/',               // Переклади
    ];

    console.log('🔄 Preloading critical data for ViewSets...');

    const results = await Promise.allSettled(
      criticalEndpoints.map(endpoint => 
        this.makeRequest(endpoint, {}, globalState, setGlobalState)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Preloaded ${successful}/${criticalEndpoints.length} ViewSets endpoints`);

    return { successful, total: criticalEndpoints.length };
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
  // ViewSets endpoints для головної сторінки
  const homepageDetails = useUnifiedAPI('/homepage/1/');
  const homepageStats = useUnifiedAPI('/homepage/1/stats/');
  const featuredContent = useUnifiedAPI('/homepage/1/featured_content/');

  const combinedData = {
    // Дані з ViewSets
    ...homepageDetails.data,
    stats: homepageStats.data || {
      total_projects: 150,
      satisfied_clients: 95,
      years_experience: 10,
      team_members: 25
    },
    featured_services: featuredContent.data?.featured_services || [],
    featured_projects: featuredContent.data?.featured_projects || []
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
  // ViewSets endpoints для послуг
  const allServices = useUnifiedAPI('/services/');
  const featuredServices = useUnifiedAPI('/services/featured/');

  return {
    data: allServices.data || featuredServices.data || [],
    featuredData: featuredServices.data || [],
    isLoading: allServices.isLoading || featuredServices.isLoading,
    error: allServices.error || featuredServices.error,
    reload: () => {
      allServices.reload();
      featuredServices.reload();
    }
  };
};

export const useServiceDetails = (serviceId) => {
  // ViewSets endpoint для деталей послуги
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
  // ViewSets endpoints для проєктів
  const allProjects = useUnifiedAPI('/projects/');
  const featuredProjects = useUnifiedAPI('/projects/featured/');
  const projectCategories = useUnifiedAPI('/project-categories/');

  return {
    data: allProjects.data || featuredProjects.data || [],
    featuredData: featuredProjects.data || [],
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
  // ViewSets endpoint для деталей проєкту
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
  // ViewSets endpoints для вакансій
  const allJobs = useUnifiedAPI('/jobs/');
  const urgentJobs = useUnifiedAPI('/jobs/urgent/');
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
  // ViewSets endpoint для деталей вакансії
  return useUnifiedAPI(`/jobs/${jobSlug}/`);
};

export const useContactData = () => {
  // ViewSets endpoints для контактів
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
  // ViewSets endpoint для команди
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
  // API views endpoints для перекладів (не ViewSets)
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
  // ViewSets endpoint для статистики
  const apiStats = useUnifiedAPI('/stats/');
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

  // Спеціалізовані методи для різних форм
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

// =================== КЕШ-МЕНЕДЖЕР ===================

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
      activeRequests: globalState.requestQueue.size,
      errorCount: Object.keys(globalState.errors).filter(key => globalState.errors[key]).length
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

// Експорт менеджера для прямого використання (якщо потрібно)
export { apiManager };

console.log('🚀 Unified API for ViewSets initialized');