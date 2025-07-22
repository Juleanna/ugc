// frontend/src/services/translationService.js
class UGCTranslationService {
  constructor() {
    // Використовуємо Vite environment variables
    this.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    this.currentLanguage = 'uk';
    this.translations = new Map();
    this.listeners = new Set();
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 хвилин
    
    // Статус завантаження
    this.isLoading = false;
    this.isReady = false;
    this.loadingPromises = new Map();
    
    // Ініціалізація
    this.init();
  }

  async init() {
    // Отримуємо мову з localStorage або браузера
    this.currentLanguage = this.getStoredLanguage() || this.getBrowserLanguage() || 'uk';
    
    // Ініціалізуємо базові переклади одразу
    this.initializeFallbackTranslations();
    
    // Завантажуємо переклади з сервера
    await this.loadTranslations(this.currentLanguage);
    this.isReady = true;
  }

  /**
   * Ініціалізує базові переклади для уникнення помилок
   */
  initializeFallbackTranslations() {
    const ukTranslations = this.getFallbackTranslations('uk');
    const enTranslations = this.getFallbackTranslations('en');
    
    this.translations.set('uk', ukTranslations);
    this.translations.set('en', enTranslations);
  }

  getStoredLanguage() {
    try {
      return localStorage.getItem('ugc_language');
    } catch (e) {
      return null;
    }
  }

  getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.startsWith('uk')) return 'uk';
    if (lang.startsWith('en')) return 'en';
    return 'uk';
  }

  storeLanguage(lang) {
    try {
      localStorage.setItem('ugc_language', lang);
    } catch (e) {
      console.warn('Cannot save language to localStorage:', e);
    }
  }

  /**
   * Завантажує переклади з вашого Django API
   */
  async loadTranslations(lang, type = 'all') {
    const cacheKey = `${lang}_${type}`;
    
    // Якщо вже завантажуємо цю мову, повертаємо існуючий проміс
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }
    
    // Перевіряємо кеш
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        // Об'єднуємо з існуючими fallback перекладами
        const existingTranslations = this.translations.get(lang) || {};
        const mergedTranslations = { ...existingTranslations, ...cached.data };
        this.translations.set(lang, mergedTranslations);
        return mergedTranslations;
      }
    }

    const loadPromise = this.doLoadTranslations(lang, type, cacheKey);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  async doLoadTranslations(lang, type, cacheKey) {
    try {
      let endpoint;
      switch (type) {
        case 'static':
          endpoint = `/translations/${lang}/`;
          break;
        case 'dynamic':
          endpoint = `/translations/${lang}/dynamic/`;
          break;
        case 'all':
        default:
          endpoint = `/translations/${lang}/all/`;
          break;
      }

      console.log(`🌍 Завантаження перекладів: ${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newTranslations = data.translations || {};

      // Зберігаємо в кеш
      this.cache.set(cacheKey, {
        data: newTranslations,
        timestamp: Date.now()
      });

      // Об'єднуємо з існуючими перекладами (fallback + нові)
      const existingTranslations = this.translations.get(lang) || {};
      const mergedTranslations = { ...existingTranslations, ...newTranslations };
      this.translations.set(lang, mergedTranslations);

      console.log(`✅ Завантажено ${Object.keys(newTranslations).length} перекладів для ${lang}`);
      console.log(`📝 Загалом доступно ${Object.keys(mergedTranslations).length} перекладів`);
      
      return mergedTranslations;

    } catch (error) {
      console.error(`❌ Помилка завантаження перекладів для ${lang}:`, error);
      
      // При помилці використовуємо існуючі переклади або fallback
      const existingTranslations = this.translations.get(lang);
      if (existingTranslations) {
        console.log(`🔄 Використовуємо існуючі переклади для ${lang}`);
        return existingTranslations;
      }
      
      const fallbackTranslations = this.getFallbackTranslations(lang);
      this.translations.set(lang, fallbackTranslations);
      return fallbackTranslations;
    }
  }

  /**
   * Розширені базові переклади для UGC проекту
   */
  getFallbackTranslations(lang) {
    if (lang === 'uk') {
      return {
        // Навігація
        'nav.home': 'Головна',
        'nav.about': 'Про нас',
        'nav.services': 'Послуги',
        'nav.projects': 'Проекти',
        'nav.contact': 'Контакти',

        // Hero секція
        'hero.title.main': 'Професійний одяг',
        'hero.title.for': 'для',
        'hero.title.sphere': 'будь-якої сфери',
        'hero.subtitle': 'Якість, надійність, безпека',
        'hero.button.projects': 'Наші проекти',
        'hero.button.learn_more': 'Дізнатися більше',
        'hero.stats.experience': 'Роки досвіду',
        'hero.stats.projects': 'Завершених проектів',
        'hero.stats.clients': 'Задоволених клієнтів',
        'hero.stats.support': 'Підтримка 24/7',

        // Сервіси
        'services.title': 'Повний цикл виробництва професійного одягу',
        'services.subtitle': 'Від проєктування до готового виробу - ми забезпечуємо якість на кожному етапі',
        'services.details': 'Детальніше',

        // Проекти
        'projects.title': 'Наші проекти',
        'projects.subtitle': 'Успішно реалізовані рішення',
        'projects.badge.success': 'Успішний проєкт',

        // Контакти
        'contact.title': 'Зв\'яжіться з нами',
        'contact.subtitle': 'прямо зараз',
        'contact.description': 'Готові допомогти вам з будь-якими питаннями та замовленнями',

        // Форма
        'form.name': 'Ім\'я',
        'form.email': 'Email',
        'form.phone': 'Телефон',
        'form.message': 'Повідомлення',
        'form.send': 'Відправити',
        'form.sending': 'Відправляємо...',

        // Загальні
        'common.loading': 'Завантаження...',
        'common.error': 'Помилка',
        'common.success': 'Успіх',
        'common.close': 'Закрити',
        'common.language': 'Мова',
      };
    } else {
      return {
        // Навігація
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.services': 'Services',
        'nav.projects': 'Projects',
        'nav.contact': 'Contact',

        // Hero секція
        'hero.title.main': 'Professional clothing',
        'hero.title.for': 'for',
        'hero.title.sphere': 'any sphere',
        'hero.subtitle': 'Quality, reliability, safety',
        'hero.button.projects': 'Our projects',
        'hero.button.learn_more': 'Learn more',
        'hero.stats.experience': 'Years of experience',
        'hero.stats.projects': 'Completed projects',
        'hero.stats.clients': 'Satisfied clients',
        'hero.stats.support': '24/7 Support',

        // Сервіси
        'services.title': 'Full cycle of professional clothing production',
        'services.subtitle': 'From design to finished product - we ensure quality at every stage',
        'services.details': 'Details',

        // Проекти
        'projects.title': 'Our Projects',
        'projects.subtitle': 'Successfully implemented solutions',
        'projects.badge.success': 'Successful project',

        // Контакти
        'contact.title': 'Contact us',
        'contact.subtitle': 'right now',
        'contact.description': 'Ready to help you with any questions and orders',

        // Форма
        'form.name': 'Name',
        'form.email': 'Email',
        'form.phone': 'Phone',
        'form.message': 'Message',
        'form.send': 'Send',
        'form.sending': 'Sending...',

        // Загальні
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.close': 'Close',
        'common.language': 'Language',
      };
    }
  }

  /**
   * Отримує переклад за ключем з покращеною логікою
   */
  t(key, params = {}) {
    const lang = this.currentLanguage;
    const translations = this.translations.get(lang) || {};
    
    let translation = translations[key];
    
    // Якщо переклад не знайдено, шукаємо в англійській мові
    if (!translation && lang !== 'en') {
      const enTranslations = this.translations.get('en') || {};
      translation = enTranslations[key];
    }
    
    // Якщо і в англійській немає, повертаємо ключ
    if (!translation) {
      // Логуємо тільки якщо переклади готові (щоб уникнути спаму при ініціалізації)
      if (this.isReady) {
        console.warn(`🔍 Переклад не знайдено: ${key} (${lang})`);
      }
      
      translation = key;
    }

    // Заміна параметрів в перекладі
    return this.interpolate(translation, params);
  }

  /**
   * Інтерполяція параметрів
   */
  interpolate(text, params) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Змінює поточну мову
   */
  async setLanguage(lang) {
    if (this.currentLanguage === lang) return;

    console.log(`🔄 Зміна мови: ${this.currentLanguage} → ${lang}`);

    this.currentLanguage = lang;
    this.storeLanguage(lang);

    // Завантажуємо переклади для нової мови
    await this.loadTranslations(lang);

    // Повідомляємо слухачів про зміну мови
    this.notifyListeners();
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Перевіряє чи готові переклади
   */
  isTranslationsReady() {
    return this.isReady;
  }

  /**
   * Чекає готовності перекладів
   */
  async waitForReady() {
    if (this.isReady) return;
    
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isReady) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  /**
   * Отримує список доступних мов
   */
  async getAvailableLanguages() {
    try {
      const response = await fetch(`${this.baseURL}/translations/stats/`);
      const data = await response.json();
      return Object.keys(data.languages || {});
    } catch (error) {
      console.error('Помилка отримання списку мов:', error);
      return ['uk', 'en'];
    }
  }

  /**
   * Очищає кеш перекладів
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Кеш перекладів очищено');
  }

  /**
   * Оновлює переклади з сервера
   */
  async refreshTranslations() {
    console.log('🔄 Оновлення перекладів...');
    this.clearCache();
    await this.loadTranslations(this.currentLanguage);
    this.notifyListeners();
  }

  /**
   * Додає слухача для змін мови
   */
  addLanguageChangeListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Видаляє слухача
   */
  removeLanguageChangeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Повідомляє всіх слухачів про зміни
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentLanguage);
      } catch (error) {
        console.error('Помилка в слухачі зміни мови:', error);
      }
    });
  }

  /**
   * Отримує статистику перекладів
   */
  async getTranslationStats() {
    try {
      const response = await fetch(`${this.baseURL}/translations/stats/`);
      return await response.json();
    } catch (error) {
      console.error('Помилка отримання статистики:', error);
      return null;
    }
  }

  /**
   * Синхронізація з Django API (викликає webhook для очищення кешу)
   */
  async syncWithBackend() {
    try {
      await fetch(`${this.baseURL}/webhooks/translations/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Оновлюємо локальний кеш
      await this.refreshTranslations();
      
      console.log('✅ Синхронізація з backend завершена');
    } catch (error) {
      console.error('❌ Помилка синхронізації:', error);
    }
  }
}

// Створюємо єдиний екземпляр сервісу
const ugcTranslationService = new UGCTranslationService();

// Експортуємо сервіс та функції для зручності
export default ugcTranslationService;

// Зручні функції для використання в компонентах
export const t = (key, params) => ugcTranslationService.t(key, params);
export const setLanguage = (lang) => ugcTranslationService.setLanguage(lang);
export const getCurrentLanguage = () => ugcTranslationService.getCurrentLanguage();
export const addLanguageChangeListener = (callback) => ugcTranslationService.addLanguageChangeListener(callback);
export const removeLanguageChangeListener = (callback) => ugcTranslationService.removeLanguageChangeListener(callback);
export const refreshTranslations = () => ugcTranslationService.refreshTranslations();
export const isTranslationsReady = () => ugcTranslationService.isTranslationsReady();
export const waitForReady = () => ugcTranslationService.waitForReady();