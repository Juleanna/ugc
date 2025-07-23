// frontend/src/services/apiService.js
// Централізований сервіс для всіх API викликів

class APIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 хвилин
    this.requestQueue = new Map(); // Для запобігання дублюванню запитів
  }

  // Базовий API виклик з кешуванням та дедуплікацією
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    console.log(`📡 API Request: ${endpoint}`);

    // Перевіряємо чи вже виконується такий запит
    if (this.requestQueue.has(cacheKey)) {
      console.log(`⏳ Waiting for existing request: ${endpoint}`);
      return this.requestQueue.get(cacheKey);
    }

    // Перевіряємо кеш
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`🎯 Cache hit: ${endpoint}`);
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Створюємо Promise для запиту
    const requestPromise = this.executeRequest(url, options);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Кешуємо успішний результат
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      console.log(`✅ API Success: ${endpoint}`);
      return result;
      
    } catch (error) {
      console.error(`❌ API Error ${endpoint}:`, error);
      throw error;
    } finally {
      // Видаляємо з черги після завершення
      this.requestQueue.delete(cacheKey);
    }
  }

  // Виконання HTTP запиту
  async executeRequest(url, options = {}) {
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

  // Очищення кешу
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    console.log('🧹 Cache cleared');
  }

  // Примусове оновлення даних
  async forceRefresh(endpoint, options = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    this.cache.delete(cacheKey);
    return this.apiCall(endpoint, options);
  }

  // ==================== СПЕЦИФІЧНІ МЕТОДИ ====================

  // Homepage дані
  async getHomepageData() {
    return this.apiCall('/homepage/');
  }

  // Hero дані з fallback
  async getHeroData() {
    try {
      return await this.apiCall('/homepage/hero_data/');
    } catch (error) {
      console.warn('Hero endpoint недоступний, використовуємо homepage дані');
      const homepageData = await this.getHomepageData();
      return {
        main_title: homepageData?.main_title || 'Професійний одяг',
        sphere_title: homepageData?.sphere_title || 'кожної сфери',
        subtitle: homepageData?.subtitle || '',
        primary_button_text: homepageData?.primary_button_text || 'Наші проєкти',
        secondary_button_text: homepageData?.secondary_button_text || 'Дізнатися більше',
        stats: homepageData?.stats || {},
        featured_services: homepageData?.featured_services || []
      };
    }
  }

  // Статистика з fallback
  async getStats() {
    try {
      return await this.apiCall('/homepage/stats/');
    } catch (error) {
      console.warn('Stats endpoint недоступний, використовуємо fallback');
      return {
        experience: '5+',
        projects: '100+',
        clients: '50+',
        support: '24/7'
      };
    }
  }

  // Рекомендовані послуги
  async getFeaturedServices() {
    try {
      return await this.apiCall('/services/featured/');
    } catch (error) {
      console.warn('Featured services недоступні, спробуємо загальний endpoint');
      try {
        const allServices = await this.apiCall('/services/');
        return Array.isArray(allServices) ? allServices.slice(0, 6) : [];
      } catch (secondError) {
        console.error('Всі services endpoints недоступні');
        return [];
      }
    }
  }

  // Рекомендовані проекти
  async getFeaturedProjects() {
    try {
      return await this.apiCall('/projects/featured/');
    } catch (error) {
      console.warn('Featured projects недоступні, спробуємо загальний endpoint');
      try {
        const allProjects = await this.apiCall('/projects/');
        return Array.isArray(allProjects) ? allProjects.slice(0, 6) : [];
      } catch (secondError) {
        console.error('Всі projects endpoints недоступні');
        return [];
      }
    }
  }

  // Переклади
  async getTranslations(lang = 'uk') {
    try {
      return await this.apiCall(`/translations/${lang}/all/`);
    } catch (error) {
      console.warn(`Translations для ${lang} недоступні`);
      return {};
    }
  }

  // Комплексне завантаження для Homepage
  async loadHomepageBundle() {
    try {
      console.log('🚀 Завантаження Homepage bundle...');
      
      // Паралельно завантажуємо всі дані
      const [
        heroDataResult,
        statsResult, 
        servicesResult,
        projectsResult
      ] = await Promise.allSettled([
        this.getHeroData(),
        this.getStats(),
        this.getFeaturedServices(),
        this.getFeaturedProjects()
      ]);

      const bundle = {
        hero: heroDataResult.status === 'fulfilled' ? heroDataResult.value : null,
        stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
        services: servicesResult.status === 'fulfilled' ? servicesResult.value : [],
        projects: projectsResult.status === 'fulfilled' ? projectsResult.value : [],
        hasErrors: [heroDataResult, statsResult, servicesResult, projectsResult]
          .some(result => result.status === 'rejected')
      };

      console.log('✅ Homepage bundle завантажено:', {
        hero: !!bundle.hero,
        stats: !!bundle.stats,
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

  // Загальні послуги
  async getServices() {
    return this.apiCall('/services/');
  }

  // Загальні проекти
  async getProjects() {
    return this.apiCall('/projects/');
  }

  // Офіси
  async getOffices() {
    return this.apiCall('/offices/');
  }

  // About дані
  async getAboutData() {
    return this.apiCall('/about/');
  }

  // Контактна форма
  async submitContactForm(formData) {
    return this.apiCall('/contact-inquiries/', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }

  // Заявка на вакансію
  async submitJobApplication(applicationData) {
    return this.apiCall('/job-applications/', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  // Партнерська заявка
  async submitPartnerInquiry(partnerData) {
    return this.apiCall('/partner-inquiries/', {
      method: 'POST',
      body: JSON.stringify(partnerData)
    });
  }

  // ==================== УТИЛІТАРНІ МЕТОДИ ====================

  // Перевірка доступності API
  async checkAPIHealth() {
    try {
      await this.apiCall('/');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  // Отримання статистики кешу
  getCacheStats() {
    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys()),
      activeRequests: this.requestQueue.size
    };
  }

  // Попереднє завантаження критичних даних
  async preloadCriticalData() {
    const criticalEndpoints = [
      '/homepage/',
      '/services/featured/',
      '/translations/uk/all/'
    ];

    console.log('🔄 Попереднє завантаження критичних даних...');
    
    const results = await Promise.allSettled(
      criticalEndpoints.map(endpoint => this.apiCall(endpoint))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Попередньо завантажено ${successful}/${criticalEndpoints.length} критичних endpoints`);
    
    return {
      total: criticalEndpoints.length,
      successful,
      failed: criticalEndpoints.length - successful
    };
  }
}

// Створюємо singleton instance
const apiService = new APIService();

// Експортуємо як default та named exports
export default apiService;
export { APIService };

// Експортуємо готові хуки для React компонентів
export const useAPIService = () => apiService;