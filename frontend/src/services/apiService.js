// frontend/src/services/apiService.js
// Оптимізований API сервіс без дублювання запитів

class OptimizedAPIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 хвилин
  }

  // ==================== БАЗОВІ МЕТОДИ ====================

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Перевіряємо кеш для GET запитів
    if (!options.method || options.method === 'GET') {
      const cached = this.getFromCache(endpoint);
      if (cached) return cached;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Кешуємо тільки успішні GET запити
      if ((!options.method || options.method === 'GET') && data.success) {
        this.setCache(endpoint, data);
      }

      return data;
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // ==================== КЕШ МЕТОДИ ====================

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // ==================== ЦЕНТРАЛІЗОВАНІ ENDPOINTS (НОВІ) ====================

  // Замість множинних запитів за статистикою
  async getUnifiedStats() {
    return this.request('/content/stats/');
  }

  // Замість окремих запитів за featured контентом
  async getUnifiedFeaturedContent() {
    return this.request('/content/featured/');
  }

  // ==================== CONTENT ENDPOINTS ====================

  async getHomepage() {
    return this.request('/homepage/1/');
  }

  async getAboutPage() {
    return this.request('/about/');
  }

  async getTeamMembers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/team-members/${queryString ? '?' + queryString : ''}`);
  }

  // ==================== SERVICE ENDPOINTS ====================

  async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/services/${queryString ? '?' + queryString : ''}`);
  }

  async getServiceDetails(id) {
    return this.request(`/services/${id}/`);
  }

  async getServiceFeatures(id) {
    return this.request(`/services/${id}/features/`);
  }

  // ==================== PROJECT ENDPOINTS ====================

  async getProjectCategories() {
    return this.request('/project-categories/');
  }

  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects/${queryString ? '?' + queryString : ''}`);
  }

  async getProjectDetails(slug) {
    return this.request(`/projects/${slug}/`);
  }

  async getProjectImages(slug) {
    return this.request(`/projects/${slug}/images/`);
  }

  async getCategoryProjects(categoryId) {
    return this.request(`/project-categories/${categoryId}/projects/`);
  }

  // ==================== JOB ENDPOINTS ====================

  async getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/jobs/${queryString ? '?' + queryString : ''}`);
  }

  async getJobDetails(slug) {
    return this.request(`/jobs/${slug}/`);
  }

  async submitJobApplication(data) {
    return this.request('/job-applications/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkplacePhotos() {
    return this.request('/workplace-photos/');
  }

  // ==================== PARTNER ENDPOINTS ====================

  async getPartnershipInfo() {
    return this.request('/partnership-info/');
  }

  async getWorkStages() {
    return this.request('/work-stages/');  // НОВИЙ endpoint
  }

  async submitPartnerInquiry(data) {
    return this.request('/partner-inquiries/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== CONTACT ENDPOINTS ====================

  async getOffices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/offices/${queryString ? '?' + queryString : ''}`);
  }

  async submitContactInquiry(data) {
    return this.request('/contact-inquiries/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== UTILITY ENDPOINTS ====================

  async getTranslations(lang) {
    return this.request(`/translations/${lang}/`);
  }

  async getAllTranslations(lang) {
    return this.request(`/translations/${lang}/all/`);
  }

  async getHealthCheck() {
    return this.request('/health/');
  }

  async getCacheStats() {
    return this.request('/cache/');
  }

  async clearServerCache() {
    return this.request('/cache/', { method: 'DELETE' });
  }

  // ==================== ОПТИМІЗОВАНІ КОМПОЗИТНІ МЕТОДИ ====================

  // Замість множинних запитів - один запит за всім для головної сторінки
  async getHomepageData() {
    try {
      const [homepage, stats, featured] = await Promise.all([
        this.getHomepage(),
        this.getUnifiedStats(),
        this.getUnifiedFeaturedContent()
      ]);

      return {
        success: true,
        data: {
          ...homepage.data,
          stats: stats.data,
          featured_services: featured.data.services,
          featured_projects: featured.data.projects,
          team_members: featured.data.team_members
        }
      };
    } catch (error) {
      console.error('Error loading homepage data:', error);
      throw error;
    }
  }

  // Оптимізований метод для отримання всіх даних послуг
  async getServicesData() {
    try {
      const [services, featured] = await Promise.all([
        this.getServices(),
        this.getUnifiedFeaturedContent()
      ]);

      return {
        success: true,
        data: {
          all: services.data,
          featured: featured.data.services
        }
      };
    } catch (error) {
      console.error('Error loading services data:', error);
      throw error;
    }
  }

  // Оптимізований метод для отримання всіх даних проєктів
  async getProjectsData() {
    try {
      const [projects, categories, featured] = await Promise.all([
        this.getProjects(),
        this.getProjectCategories(),
        this.getUnifiedFeaturedContent()
      ]);

      return {
        success: true,
        data: {
          all: projects.data,
          categories: categories.data,
          featured: featured.data.projects
        }
      };
    } catch (error) {
      console.error('Error loading projects data:', error);
      throw error;
    }
  }

  // ==================== ПОШУК БЕЗ ДУБЛЮВАННЯ ====================

  async search(query, type = 'all') {
    const searches = [];
    
    if (type === 'all' || type === 'services') {
      searches.push(this.getServices({ search: query }));
    }
    
    if (type === 'all' || type === 'projects') {
      searches.push(this.getProjects({ search: query }));
    }
    
    if (type === 'all' || type === 'jobs') {
      searches.push(this.getJobs({ search: query }));
    }

    try {
      const results = await Promise.allSettled(searches);
      
      return {
        success: true,
        data: {
          services: type === 'all' || type === 'services' ? results[0]?.value?.data || [] : [],
          projects: type === 'all' || type === 'projects' ? results[type === 'all' ? 1 : 0]?.value?.data || [] : [],
          jobs: type === 'all' || type === 'jobs' ? results[type === 'all' ? 2 : 0]?.value?.data || [] : []
        }
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}

// Створюємо singleton instance
const optimizedAPIService = new OptimizedAPIService();

export default optimizedAPIService;

// Експортуємо оптимізовані константи endpoints
export const OPTIMIZED_API_ENDPOINTS = {
  // Централізовані endpoints
  UNIFIED_STATS: '/content/stats/',
  UNIFIED_FEATURED: '/content/featured/',
  
  // ViewSets endpoints
  HOMEPAGE: '/homepage/1/',
  SERVICES: '/services/',
  PROJECTS: '/projects/',
  PROJECT_CATEGORIES: '/project-categories/',
  JOBS: '/jobs/',
  OFFICES: '/offices/',
  TEAM_MEMBERS: '/team-members/',
  
  // Нові endpoints
  WORK_STAGES: '/work-stages/',
  
  // Form endpoints
  CONTACT_FORM: '/contact-inquiries/',
  JOB_APPLICATION: '/job-applications/',
  PARTNER_INQUIRY: '/partner-inquiries/',
  
  // Utility endpoints
  TRANSLATIONS: (lang) => `/translations/${lang}/`,
  HEALTH: '/health/',
  CACHE: '/cache/'
};

console.log('🚀 Оптимізований APIService ініціалізовано');
console.log('✅ Видалено дублюючі запити');
console.log('✅ Додано централізовані endpoints');
console.log('✅ Покращено кешування');