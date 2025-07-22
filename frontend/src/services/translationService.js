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
    
    // Ініціалізація
    this.init();
  }

  async init() {
    // Отримуємо мову з localStorage або браузера
    this.currentLanguage = this.getStoredLanguage() || this.getBrowserLanguage() || 'uk';
    
    // Завантажуємо переклади
    await this.loadTranslations(this.currentLanguage);
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
    
    // Перевіряємо кеш
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        this.translations.set(lang, cached.data);
        return cached.data;
      }
    }

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
      const translations = data.translations || {};

      // Зберігаємо в кеш
      this.cache.set(cacheKey, {
        data: translations,
        timestamp: Date.now()
      });

      // Зберігаємо переклади
      this.translations.set(lang, translations);

      console.log(`✅ Завантажено ${Object.keys(translations).length} перекладів для ${lang}`);
      return translations;

    } catch (error) {
      console.error(`❌ Помилка завантаження перекладів для ${lang}:`, error);
      
      // Повертаємо базові переклади при помилці
      const fallbackTranslations = this.getFallbackTranslations(lang);
      this.translations.set(lang, fallbackTranslations);
      return fallbackTranslations;
    }
  }

  /**
   * Базові переклади для UGC проекту
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
      };
    } else {
      return {
        // Навігація
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.services': 'Services',
        'nav.projects': 'Projects',
        'nav.contact': 'Contact',

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
      };
    }
  }

  /**
   * Отримує переклад за ключем
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
    
    // Якщо і в англійській немає, повертаємо ключ або fallback
    if (!translation) {
      const fallback = this.getFallbackTranslations(lang)[key];
      translation = fallback || key;
      
      if (!fallback) {
        console.warn(`🔍 Переклад не знайдено: ${key} (${lang})`);
      }
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