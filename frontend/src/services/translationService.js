// frontend/src/services/translationService.js
// Виправлена версія БЕЗ використання process.env у браузері

class TranslationService {
  constructor() {
    this.currentLanguage = 'uk';
    this.translations = new Map();
    this.isLoading = false;
    this.fallbackTranslations = this.getFallbackTranslations();
    
    console.log('🌍 Translation Service initialized');
  }

  // Fallback переклади для критичних ключів
  getFallbackTranslations() {
    return {
      'uk': {
        // Hero section
        'hero.description': 'Ми створюємо високоякісний професійний одяг',
        'hero.features.quality': 'Висока якість',
        'hero.features.speed': 'Швидка доставка',
        'hero.features.experience': 'Багаторічний досвід',
        'hero.features.service': 'Професійний сервіс',
        'hero.scroll_down': 'Прокрутити вниз',
        
        // About section
        'about.title': 'Про нашу компанію',
        'about.subtitle': 'Наш багаторічний досвід гарантує якість',
        'about.description': 'Ми створюємо одяг, який забезпечує безпеку і комфорт у будь-яких умовах',
        'about.mission': 'Наша місія – забезпечити працівників якісним професійним одягом',
        'about.vision': 'Стати провідним виробником професійного одягу в Україні',
        'about.values': 'Якість, надійність, інновації та відповідальність',
        'about.loading': 'Завантаження інформації...',
        'about.error.title': 'Помилка завантаження',
        'about.error.message': 'Не вдалося завантажити інформацію про компанію',
        
        // Features
        'about.features.title': 'Наші переваги',
        'about.features.reliability.title': 'Надійність',
        'about.features.reliability.description': 'Використовуємо тільки перевірені матеріали',
        'about.features.quality.title': 'Якість',
        'about.features.quality.description': 'Контроль якості на кожному етапі',
        'about.features.experience.title': 'Досвід',
        'about.features.experience.description': 'Понад 10 років у сфері професійного одягу',
        'about.features.precision.title': 'Точність',
        'about.features.precision.description': 'Індивідуальний підхід до кожного замовлення',
        
        // Stats
        'about.stats.years_experience': 'Років досвіду',
        'about.stats.satisfied_clients': 'Задоволених клієнтів',
        'about.stats.total_projects': 'Завершених проектів',
        'about.stats.team_members': 'Членів команди',
        'about.stats.services_count': 'Видів послуг',
        
        // Team
        'about.team.title': 'Наша команда',
        'about.team.details': 'Деталі співробітника',
        'about.team.description': 'Опис',
        'about.team.responsibilities': 'Обов\'язки',
        
        // Achievements
        'about.achievements.title': 'Сертифікати та досягнення',
        'about.achievements.details': 'Деталі сертифіката',
        'about.achievements.year': 'Рік отримання',
        'about.achievements.organization': 'Організація',
        'about.achievements.view_certificate': 'Переглянути сертифікат',
        
        // Production
        'about.production.title': 'Наше виробництво',
        'about.production.featured': 'Рекомендоване',
        'about.production.show_more': 'Показати більше',
        
        // CTA
        'about.cta.title': 'Готові розпочати співпрацю?',
        'about.cta.description': 'Зв\'яжіться з нами для обговорення вашого проекту',
        'about.cta.button': 'Зв\'язатися з нами',
        
        // Mission, Vision, Values
        'about.mission.title': 'Місія',
        'about.vision.title': 'Бачення',
        'about.values.title': 'Цінності',
        
        // Services
        'services.title': 'Наші послуги',
        'services.subtitle': 'Ми пропонуємо широкий спектр послуг',
        'services.loading': 'Завантаження послуг...',
        'services.error': 'Помилка завантаження послуг',
        'services.featured': 'Рекомендовано',
        'services.benefits': 'Переваги:',
        'services.min_order': 'Мін. замовлення:',
        'services.pieces': 'шт.',
        'services.production_time': 'Час виробництва:',
        'services.get_quote': 'Отримати пропозицію',
        'services.show.featured': 'Показати рекомендовані',
        'services.show.all': 'Показати всі',
        'services.categories.all': 'Всі послуги',
        'services.categories.corporate': 'Корпоративний',
        'services.categories.medical': 'Медичний',
        'services.categories.education': 'Освіта',
        'services.categories.hospitality': 'Ресторани',
        'services.categories.safety': 'Захисний',
        'services.categories.construction': 'Будівництво',
        'services.no_results': 'Послуги не знайдено за вашим запитом',
        'services.no_services': 'Немає послуг у цій категорії',
        'services.custom.title': 'Потрібне індивідуальне рішення?',
        'services.custom.description': 'Ми розробляємо індивідуальні рішення під ваші потреби',
        'services.custom.button': 'Обговорити проект',
        
        // Projects
        'projects.title': 'Наші проєкти',
        'projects.subtitle': 'Переглядайте наші успішні проєкти',
        'projects.view_details': 'Деталі',
        'projects.contact': 'Зв\'язатись',
        'projects.status.completed': 'Завершено',
        'projects.status.in_progress': 'В процесі',
        'projects.status.planning': 'Планування',
        'projects.details.info': 'Основна інформація',
        'projects.details.features': 'Особливості',
        'projects.details.metrics': 'Результати',
        'projects.cta.title': 'Готові почати новий проєкт?',
        'projects.cta.description': 'Ми готові втілити ваші ідеї в життя',
        'projects.cta.button': 'Почати співпрацю',
        'projects.stats.total': 'Загалом проєктів',
        'projects.stats.satisfaction': 'Задоволення клієнтів',
        'projects.stats.items': 'Виготовлено виробів',
        'projects.stats.support': 'Підтримка клієнтів',
        
        // Common
        'common.retry': 'Спробувати знову',
        'common.loading': 'Завантаження...',
        'common.error': 'Помилка'
      },
      'en': {
        // Hero section
        'hero.description': 'We create high-quality professional clothing',
        'hero.features.quality': 'High Quality',
        'hero.features.speed': 'Fast Delivery',
        'hero.features.experience': 'Years of Experience',
        'hero.features.service': 'Professional Service',
        'hero.scroll_down': 'Scroll Down',
        
        // About section
        'about.title': 'About Our Company',
        'about.subtitle': 'Our years of experience guarantee quality',
        'about.description': 'We create clothing that provides safety and comfort in any conditions',
        'about.mission': 'Our mission is to provide workers with quality professional clothing',
        'about.vision': 'To become a leading manufacturer of professional clothing in Ukraine',
        'about.values': 'Quality, reliability, innovation and responsibility',
        'about.loading': 'Loading information...',
        'about.error.title': 'Loading Error',
        'about.error.message': 'Failed to load company information',
        
        // Features
        'about.features.title': 'Our Advantages',
        'about.features.reliability.title': 'Reliability',
        'about.features.reliability.description': 'We use only proven materials',
        'about.features.quality.title': 'Quality',
        'about.features.quality.description': 'Quality control at every stage',
        'about.features.experience.title': 'Experience',
        'about.features.experience.description': 'Over 10 years in professional clothing',
        'about.features.precision.title': 'Precision',
        'about.features.precision.description': 'Individual approach to each order',
        
        // Stats
        'about.stats.years_experience': 'Years of Experience',
        'about.stats.satisfied_clients': 'Satisfied Clients',
        'about.stats.total_projects': 'Completed Projects',
        'about.stats.team_members': 'Team Members',
        'about.stats.services_count': 'Types of Services',
        
        // Team
        'about.team.title': 'Our Team',
        'about.team.details': 'Employee Details',
        'about.team.description': 'Description',
        'about.team.responsibilities': 'Responsibilities',
        
        // Achievements
        'about.achievements.title': 'Certificates and Achievements',
        'about.achievements.details': 'Certificate Details',
        'about.achievements.year': 'Year Received',
        'about.achievements.organization': 'Organization',
        'about.achievements.view_certificate': 'View Certificate',
        
        // Production
        'about.production.title': 'Our Production',
        'about.production.featured': 'Featured',
        'about.production.show_more': 'Show More',
        
        // CTA
        'about.cta.title': 'Ready to Start Cooperation?',
        'about.cta.description': 'Contact us to discuss your project',
        'about.cta.button': 'Contact Us',
        
        // Mission, Vision, Values
        'about.mission.title': 'Mission',
        'about.vision.title': 'Vision',
        'about.values.title': 'Values',
        
        // Services
        'services.title': 'Our Services',
        'services.subtitle': 'We offer a wide range of services',
        'services.loading': 'Loading services...',
        'services.error': 'Error loading services',
        'services.featured': 'Featured',
        'services.benefits': 'Benefits:',
        'services.min_order': 'Min. order:',
        'services.pieces': 'pcs.',
        'services.production_time': 'Production time:',
        'services.get_quote': 'Get Quote',
        'services.show.featured': 'Show Featured',
        'services.show.all': 'Show All',
        'services.categories.all': 'All Services',
        'services.categories.corporate': 'Corporate',
        'services.categories.medical': 'Medical',
        'services.categories.education': 'Education',
        'services.categories.hospitality': 'Hospitality',
        'services.categories.safety': 'Safety',
        'services.categories.construction': 'Construction',
        'services.no_results': 'No services found for your query',
        'services.no_services': 'No services in this category',
        'services.custom.title': 'Need a custom solution?',
        'services.custom.description': 'We develop individual solutions for your needs',
        'services.custom.button': 'Discuss Project',
        
        // Projects
        'projects.title': 'Our Projects',
        'projects.subtitle': 'View our successful projects',
        'projects.view_details': 'Details',
        'projects.contact': 'Contact',
        'projects.status.completed': 'Completed',
        'projects.status.in_progress': 'In Progress',
        'projects.status.planning': 'Planning',
        'projects.details.info': 'Basic Information',
        'projects.details.features': 'Features',
        'projects.details.metrics': 'Results',
        'projects.cta.title': 'Ready to start a new project?',
        'projects.cta.description': 'We are ready to bring your ideas to life',
        'projects.cta.button': 'Start Cooperation',
        'projects.stats.total': 'Total Projects',
        'projects.stats.satisfaction': 'Client Satisfaction',
        'projects.stats.items': 'Items Produced',
        'projects.stats.support': 'Client Support',
        
        // Common
        'common.retry': 'Try Again',
        'common.loading': 'Loading...',
        'common.error': 'Error'
      }
    };
  }

  // ВИПРАВЛЕНО: Функція без використання process.env
  async loadTranslations(language = 'uk', namespace = 'all') {
    if (this.isLoading) {
      console.log('🔄 Translation loading already in progress');
      return;
    }

    this.isLoading = true;
    
    try {
      // ВИПРАВЛЕНО: Безпечне отримання базового URL без process.env
      const baseUrl = this.getApiBaseUrl();
      const url = `${baseUrl}/api/v1/translations/${language}/${namespace}/`;
      console.log(`🌍 Завантаження перекладів: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Зберігаємо переклади
      if (data.translations && typeof data.translations === 'object') {
        this.translations.set(language, data.translations);
        console.log(`✅ Завантажено ${Object.keys(data.translations).length} перекладів для ${language}`);
      } else {
        console.warn('⚠️ Неправильний формат даних перекладів');
        // Використовуємо fallback
        this.translations.set(language, this.fallbackTranslations[language] || {});
      }

      console.log(`📝 Загалом доступно ${this.getTotalTranslationsCount()} перекладів`);
      this.currentLanguage = language;

    } catch (error) {
      console.error('❌ Помилка завантаження перекладів:', error);
      
      // Використовуємо fallback переклади при помилці
      const fallback = this.fallbackTranslations[language] || this.fallbackTranslations['uk'] || {};
      this.translations.set(language, fallback);
      console.log(`🔄 Використовуємо fallback переклади: ${Object.keys(fallback).length} записів`);
    } finally {
      this.isLoading = false;
    }
  }

  // ВИПРАВЛЕНО: Безпечне отримання базового URL
  getApiBaseUrl() {
    // Спочатку перевіряємо змінні середовища браузера
    if (typeof window !== 'undefined' && window.location) {
      // Для dev середовища
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8000';
      }
      
      // Для production використовуємо той же домен
      return window.location.origin;
    }
    
    // Fallback для SSR або тестів
    return 'http://127.0.0.1:8000';
  }

  getTotalTranslationsCount() {
    let total = 0;
    for (const [lang, translations] of this.translations) {
      total += Object.keys(translations).length;
    }
    return total;
  }

  translate(key, language = null, interpolation = {}) {
    const lang = language || this.currentLanguage;
    const translations = this.translations.get(lang) || {};
    
    // Спробуємо знайти переклад
    let translation = this.getNestedValue(translations, key);
    
    // Якщо не знайдено, спробуємо fallback
    if (!translation) {
      const fallback = this.fallbackTranslations[lang] || {};
      translation = this.getNestedValue(fallback, key);
      
      if (!translation && lang !== 'uk') {
        // Спробуємо українську як останній fallback
        const ukFallback = this.fallbackTranslations['uk'] || {};
        translation = this.getNestedValue(ukFallback, key);
      }
    }
    
    // Якщо все ще не знайдено, показуємо повідомлення (тільки в dev режимі)
    if (!translation) {
      // ВИПРАВЛЕНО: Безпечна перевірка dev режиму
      if (this.isDevelopment()) {
        console.warn(`🔍 Переклад не знайдено: ${key} (${lang})`);
      }
      return key; // Повертаємо ключ як fallback
    }

    // Інтерполяція змінних (якщо потрібно)
    if (typeof translation === 'string' && Object.keys(interpolation).length > 0) {
      return this.interpolate(translation, interpolation);
    }

    return translation;
  }

  // ВИПРАВЛЕНО: Безпечна перевірка dev режиму
  isDevelopment() {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '5173');
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  interpolate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setLanguage(language) {
    if (this.currentLanguage !== language) {
      this.currentLanguage = language;
      // Автоматично завантажуємо переклади для нової мови
      this.loadTranslations(language);
    }
  }

  getAvailableLanguages() {
    return ['uk', 'en'];
  }

  hasTranslation(key, language = null) {
    const lang = language || this.currentLanguage;
    const translations = this.translations.get(lang) || {};
    const translation = this.getNestedValue(translations, key);
    
    if (translation) return true;
    
    // Перевіряємо fallback
    const fallback = this.fallbackTranslations[lang] || {};
    return !!this.getNestedValue(fallback, key);
  }

  // Метод для додавання перекладів в runtime (корисно для тестування)
  addTranslations(language, translations) {
    const existing = this.translations.get(language) || {};
    this.translations.set(language, { ...existing, ...translations });
    console.log(`✅ Додано ${Object.keys(translations).length} перекладів для ${language}`);
  }

  // Метод для очищення кешу перекладів
  clearCache() {
    this.translations.clear();
    console.log('🧹 Кеш перекладів очищено');
  }

  // Статистика для debug
  getStats() {
    const stats = {};
    for (const [lang, translations] of this.translations) {
      stats[lang] = Object.keys(translations).length;
    }
    return {
      currentLanguage: this.currentLanguage,
      isLoading: this.isLoading,
      languages: stats,
      fallbackAvailable: Object.keys(this.fallbackTranslations).length,
      isDevelopment: this.isDevelopment()
    };
  }
}

// Створюємо singleton instance
const translationService = new TranslationService();

// Експортуємо інстанс та клас
export default translationService;
export { TranslationService };