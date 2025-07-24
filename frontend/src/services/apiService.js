// frontend/src/services/apiService.js
// Адаптовано для нової ViewSets архітектури бекенду

class APIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    this.cache = new Map();
    this.requestQueue = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 хвилин
    this.requestTimeout = 30 * 1000; // 30 секунд
  }

  // ==================== БАЗОВІ МЕТОДИ ====================

  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Перевірка кешу
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`✅ Cache hit: ${endpoint}`);
        return cached.data;
      }
    }

    // Перевірка активних запитів
    if (this.requestQueue.has(cacheKey)) {
      console.log(`⏳ Request in progress: ${endpoint}`);
      return this.requestQueue.get(cacheKey);
    }

    // Налаштування запиту
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: this.requestTimeout,
      ...options
    };

    // Створення промісу з timeout
    const requestPromise = this.createTimeoutPromise(
      fetch(url, config),
      this.requestTimeout
    );

    // Додавання до черги
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Обробка різних форматів відповідей від ViewSets
      const processedData = this.processResponse(result);

      // Кешування успішного результату
      this.cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });

      console.log(`✅ API Success: ${endpoint}`);
      return processedData;

    } catch (error) {
      console.error(`❌ API Error ${endpoint}:`, error.message);
      throw error;
    } finally {
      // Видалення з черги
      this.requestQueue.delete(cacheKey);
    }
  }

  processResponse(result) {
    // Обробка стандартного формату API
    if (result.success !== undefined) {
      return result.success ? result.data : result;
    }
    
    // Обробка пагінованої відповіді від ViewSets
    if (result.results) {
      return result.results;
    }
    
    // Обробка масиву даних
    if (Array.isArray(result)) {
      return result;
    }
    
    // Повернення як є
    return result;
  }

  createTimeoutPromise(fetchPromise, timeout) {
    return Promise.race([
      fetchPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  // ==================== VIEWSETS ENDPOINTS ====================

  // Homepage ViewSets
  async getHomepageData(homepageId = 1) {
    return this.apiCall(`/homepage/${homepageId}/`);
  }

  async getHomepageStats(homepageId = 1) {
    return this.apiCall(`/homepage/${homepageId}/stats/`);
  }

  async getHomepageFeaturedContent(homepageId = 1) {
    return this.apiCall(`/homepage/${homepageId}/featured_content/`);
  }

  // About ViewSets
  async getAboutData() {
    return this.apiCall('/about/');
  }

  async getTeamMembers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/team-members/?${queryParams}` : '/team-members/';
    return this.apiCall(endpoint);
  }

  async getManagementTeam() {
    return this.getTeamMembers({ is_management: 'true' });
  }

  // Services ViewSets
  async getServices(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/services/?${queryParams}` : '/services/';
    return this.apiCall(endpoint);
  }

  async getFeaturedServices() {
    return this.apiCall('/services/featured/');
  }

  async getServiceDetails(serviceId) {
    return this.apiCall(`/services/${serviceId}/`);
  }

  async getServiceFeatures(serviceId) {
    return this.apiCall(`/services/${serviceId}/features/`);
  }

  // Projects ViewSets
  async getProjectCategories() {
    return this.apiCall('/project-categories/');
  }

  async getProjects(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/projects/?${queryParams}` : '/projects/';
    return this.apiCall(endpoint);
  }

  async getFeaturedProjects() {
    return this.apiCall('/projects/featured/');
  }

  async getProjectDetails(projectSlug) {
    return this.apiCall(`/projects/${projectSlug}/`);
  }

  async getProjectImages(projectSlug) {
    return this.apiCall(`/projects/${projectSlug}/images/`);
  }

  async getProjectsByCategory(categoryId) {
    return this.apiCall(`/project-categories/${categoryId}/projects/`);
  }

  // Jobs ViewSets
  async getJobs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/jobs/?${queryParams}` : '/jobs/';
    return this.apiCall(endpoint);
  }

  async getUrgentJobs() {
    return this.apiCall('/jobs/urgent/');
  }

  async getJobDetails(jobSlug) {
    return this.apiCall(`/jobs/${jobSlug}/`);
  }

  async getWorkplacePhotos() {
    return this.apiCall('/workplace-photos/');
  }

  // Partnership ViewSets
  async getPartnershipInfo() {
    return this.apiCall('/partnership-info/');
  }

  // Contact ViewSets
  async getOffices(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/offices/?${queryParams}` : '/offices/';
    return this.apiCall(endpoint);
  }

  async getMainOffices() {
    return this.getOffices({ is_main: 'true' });
  }

  // Statistics ViewSets
  async getAPIStats() {
    return this.apiCall('/stats/');
  }

  // ==================== ФОРМИ (POST ЗАПИТИ) ====================

  async submitContactForm(formData) {
    return this.apiCall('/contact-inquiries/', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }

  async submitJobApplication(applicationData) {
    return this.apiCall('/job-applications/', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  async submitPartnerInquiry(partnerData) {
    return this.apiCall('/partner-inquiries/', {
      method: 'POST',
      body: JSON.stringify(partnerData)
    });
  }

  // ==================== UTILITY ENDPOINTS (API Views) ====================

  async getTranslations(lang = 'uk') {
    return this.apiCall(`/translations/${lang}/`);
  }

  async getAllTranslations(lang = 'uk') {
    return this.apiCall(`/translations/${lang}/all/`);
  }

  async checkAPIHealth() {
    return this.apiCall('/health/');
  }

  async getCacheInfo() {
    return this.apiCall('/cache/');
  }

  async clearAPICache() {
    return this.apiCall('/cache/', { method: 'DELETE' });
  }

  // ==================== КОМПОЗИТНІ МЕТОДИ ====================

  // Завантаження всіх даних для головної сторінки
  async getHomepageBundle(homepageId = 1) {
    try {
      console.log('🔄 Завантаження HomePage bundle з ViewSets...');

      const [
        homepageResult,
        statsResult,
        featuredContentResult,
        servicesResult,
        projectsResult
      ] = await Promise.allSettled([
        this.getHomepageData(homepageId),
        this.getHomepageStats(homepageId),
        this.getHomepageFeaturedContent(homepageId),
        this.getFeaturedServices(),
        this.getFeaturedProjects()
      ]);

      const bundle = {
        homepage: homepageResult.status === 'fulfilled' ? homepageResult.value : null,
        stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
        featuredContent: featuredContentResult.status === 'fulfilled' ? featuredContentResult.value : null,
        services: servicesResult.status === 'fulfilled' ? servicesResult.value : [],
        projects: projectsResult.status === 'fulfilled' ? projectsResult.value : [],
        hasErrors: [homepageResult, statsResult, featuredContentResult, servicesResult, projectsResult]
          .some(result => result.status === 'rejected')
      };

      console.log('✅ Homepage bundle завантажено з ViewSets:', {
        homepage: !!bundle.homepage,
        stats: !!bundle.stats,
        featuredContent: !!bundle.featuredContent,
        services: bundle.services.length,
        projects: bundle.projects.length,
        hasErrors: bundle.hasErrors
      });

      return bundle;
      
    } catch (error) {
      console.error('❌ Помилка завантаження Homepage bundle:', error);
      throw error;
    }
  }

  // Завантаження повних даних про послуги
  async getServicesBundle(serviceId = null) {
    try {
      const promises = [
        this.getServices(),
        this.getFeaturedServices()
      ];

      if (serviceId) {
        promises.push(
          this.getServiceDetails(serviceId),
          this.getServiceFeatures(serviceId)
        );
      }

      const results = await Promise.allSettled(promises);

      return {
        allServices: results[0].status === 'fulfilled' ? results[0].value : [],
        featuredServices: results[1].status === 'fulfilled' ? results[1].value : [],
        serviceDetails: serviceId && results[2].status === 'fulfilled' ? results[2].value : null,
        serviceFeatures: serviceId && results[3].status === 'fulfilled' ? results[3].value : [],
        hasErrors: results.some(result => result.status === 'rejected')
      };
    } catch (error) {
      console.error('❌ Помилка завантаження Services bundle:', error);
      throw error;
    }
  }

  // Завантаження повних даних про проєкти
  async getProjectsBundle(projectSlug = null) {
    try {
      const promises = [
        this.getProjects(),
        this.getFeaturedProjects(),
        this.getProjectCategories()
      ];

      if (projectSlug) {
        promises.push(
          this.getProjectDetails(projectSlug),
          this.getProjectImages(projectSlug)
        );
      }

      const results = await Promise.allSettled(promises);

      return {
        allProjects: results[0].status === 'fulfilled' ? results[0].value : [],
        featuredProjects: results[1].status === 'fulfilled' ? results[1].value : [],
        categories: results[2].status === 'fulfilled' ? results[2].value : [],
        projectDetails: projectSlug && results[3].status === 'fulfilled' ? results[3].value : null,
        projectImages: projectSlug && results[4].status === 'fulfilled' ? results[4].value : [],
        hasErrors: results.some(result => result.status === 'rejected')
      };
    } catch (error) {
      console.error('❌ Помилка завантаження Projects bundle:', error);
      throw error;
    }
  }

  // Завантаження контактних даних
  async getContactBundle() {
    try {
      const [officesResult, partnershipResult] = await Promise.allSettled([
        this.getOffices(),
        this.getPartnershipInfo()
      ]);

      return {
        offices: officesResult.status === 'fulfilled' ? officesResult.value : [],
        partnershipInfo: partnershipResult.status === 'fulfilled' ? partnershipResult.value : [],
        hasErrors: [officesResult, partnershipResult].some(result => result.status === 'rejected')
      };
    } catch (error) {
      console.error('❌ Помилка завантаження Contact bundle:', error);
      throw error;
    }
  }

  // Завантаження даних про вакансії
  async getJobsBundle(jobSlug = null) {
    try {
      const promises = [
        this.getJobs(),
        this.getUrgentJobs(),
        this.getWorkplacePhotos()
      ];

      if (jobSlug) {
        promises.push(this.getJobDetails(jobSlug));
      }

      const results = await Promise.allSettled(promises);

      return {
        allJobs: results[0].status === 'fulfilled' ? results[0].value : [],
        urgentJobs: results[1].status === 'fulfilled' ? results[1].value : [],
        workplacePhotos: results[2].status === 'fulfilled' ? results[2].value : [],
        jobDetails: jobSlug && results[3].status === 'fulfilled' ? results[3].value : null,
        hasErrors: results.some(result => result.status === 'rejected')
      };
    } catch (error) {
      console.error('❌ Помилка завантаження Jobs bundle:', error);
      throw error;
    }
  }

  // ==================== УТИЛІТАРНІ МЕТОДИ ====================

  // Попереднє завантаження критичних даних
  async preloadCriticalData() {
    const criticalEndpoints = [
      () => this.getHomepageData(),
      () => this.getHomepageStats(),
      () => this.getFeaturedServices(),
      () => this.getFeaturedProjects(),
      () => this.getTranslations('uk')
    ];

    console.log('🔄 Попереднє завантаження критичних даних ViewSets...');
    
    const results = await Promise.allSettled(
      criticalEndpoints.map(fn => fn())
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Попередньо завантажено ${successful}/${criticalEndpoints.length} критичних endpoints`);
    
    return {
      total: criticalEndpoints.length,
      successful,
      failed: criticalEndpoints.length - successful,
      results: results.map((result, index) => ({
        endpoint: criticalEndpoints[index].name,
        status: result.status,
        error: result.status === 'rejected' ? result.reason?.message : null
      }))
    };
  }

  // Очищення кешу
  clearCache(pattern = null) {
    if (pattern) {
      // Очищення за патерном
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
      console.log(`🗑️ Cache cleared for pattern: ${pattern}`);
    } else {
      // Повне очищення
      this.cache.clear();
      console.log('🗑️ All cache cleared');
    }
  }

  // Статистика кешу
  getCacheStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      totalEntries: this.cache.size,
      activeRequests: this.requestQueue.size,
      cacheKeys: Array.from(this.cache.keys()),
      expiredEntries: entries.filter(([_, value]) => 
        now - value.timestamp > this.cacheTimeout
      ).length,
      validEntries: entries.filter(([_, value]) => 
        now - value.timestamp <= this.cacheTimeout
      ).length,
      totalCacheSize: JSON.stringify(entries).length // Приблизний розмір
    };
  }

  // Валідація endpoints
  async validateAllEndpoints() {
    const endpoints = [
      '/homepage/1/',
      '/homepage/1/stats/',
      '/services/',
      '/services/featured/',
      '/projects/',
      '/projects/featured/',
      '/project-categories/',
      '/jobs/',
      '/jobs/urgent/',
      '/offices/',
      '/team-members/',
      '/stats/',
      '/health/',
      '/translations/uk/'
    ];

    console.log('🔍 Валідація ViewSets endpoints...');

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        try {
          await this.apiCall(endpoint);
          return { endpoint, status: 'success' };
        } catch (error) {
          return { endpoint, status: 'error', error: error.message };
        }
      })
    );

    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.status === 'success'
    ).length;

    const report = {
      total: endpoints.length,
      successful,
      failed: endpoints.length - successful,
      details: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
    };

    console.log(`📊 Endpoints validation: ${successful}/${endpoints.length} working`);
    return report;
  }

  // Retry механізм
  async retryRequest(endpoint, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${endpoint}`);
        return await this.apiCall(endpoint, options);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          // Експоненційна затримка
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  // Batch запити
  async batchRequest(requests) {
    const results = await Promise.allSettled(
      requests.map(({ endpoint, options = {} }) => 
        this.apiCall(endpoint, options)
      )
    );

    return results.map((result, index) => ({
      endpoint: requests[index].endpoint,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason?.message : null
    }));
  }

  // ==================== SEARCH & FILTERING ====================

  // Пошук по послугах
  async searchServices(query, filters = {}) {
    const searchParams = {
      ...filters,
      search: query
    };
    return this.getServices(searchParams);
  }

  // Пошук по проєктах
  async searchProjects(query, filters = {}) {
    const searchParams = {
      ...filters,
      search: query
    };
    return this.getProjects(searchParams);
  }

  // Пошук по вакансіях
  async searchJobs(query, filters = {}) {
    const searchParams = {
      ...filters,
      search: query
    };
    return this.getJobs(searchParams);
  }
}

// Створюємо singleton instance
const apiService = new APIService();

// Експортуємо як default та named exports
export default apiService;
export { APIService };

// Експортуємо готові хуки для React компонентів
export const useAPIService = () => apiService;

// Ініціалізація
console.log('🚀 APIService для ViewSets архітектури ініціалізовано');
console.log(`📡 Base URL: ${apiService.baseURL}`);

// Експорт корисних констант
export const API_ENDPOINTS = {
  // ViewSets endpoints
  HOMEPAGE: '/homepage/1/',
  HOMEPAGE_STATS: '/homepage/1/stats/',
  HOMEPAGE_FEATURED: '/homepage/1/featured_content/',
  
  SERVICES: '/services/',
  SERVICES_FEATURED: '/services/featured/',
  
  PROJECTS: '/projects/',
  PROJECTS_FEATURED: '/projects/featured/',
  PROJECT_CATEGORIES: '/project-categories/',
  
  JOBS: '/jobs/',
  JOBS_URGENT: '/jobs/urgent/',
  
  OFFICES: '/offices/',
  TEAM_MEMBERS: '/team-members/',
  
  STATS: '/stats/',
  
  // API Views endpoints
  TRANSLATIONS: (lang) => `/translations/${lang}/`,
  HEALTH: '/health/',
  CACHE: '/cache/',
  
  // Form endpoints
  CONTACT_FORM: '/contact-inquiries/',
  JOB_APPLICATION: '/job-applications/',
  PARTNER_INQUIRY: '/partner-inquiries/'
};