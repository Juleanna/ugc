// frontend/src/services/translationService.js
class TranslationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';
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

  /**
   * Отримує збережену мову з localStorage
   */
  getStoredLanguage() {
    try {
      return localStorage.getItem('app_language');
    } catch (e) {
      return null;
    }
  }

  /**
   * Отримує мову браузера
   */
  getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.startsWith('uk')) return 'uk';
    if (lang.startsWith('en')) return 'en';
    return 'uk';
  }

  /**
   * Зберігає мову в localStorage
   */
  storeLanguage(lang) {
    try {
      localStorage.setItem('app_language', lang);
    } catch (e) {
      console.warn('Cannot save language to localStorage:', e);
    }
  }

  /**
   * Завантажує переклади з API
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
   * Базові переклади при помилці завантаження
   */
  getFallbackTranslations(lang) {
    if (lang === 'uk') {
      return {
        'nav.home': 'Головна',
        'nav.about': 'Про нас',
        'nav.services': 'Послуги',
        'nav.contact': 'Контакти',
        'common.loading': 'Завантаження...',
        'common.error': 'Помилка',
        'common.success': 'Успіх'
      };
    } else {
      return {
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.services': 'Services',
        'nav.contact': 'Contact',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success'
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
    
    // Якщо і в англійській немає, повертаємо ключ
    if (!translation) {
      translation = key;
      console.warn(`🔍 Переклад не знайдено: ${key}`);
    }

    // Заміна параметрів в перекладі
    return this.interpolate(translation, params);
  }

  /**
   * Інтерполяція параметрів в переклад
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

    this.currentLanguage = lang;
    this.storeLanguage(lang);

    // Завантажуємо переклади для нової мови
    await this.loadTranslations(lang);

    // Повідомляємо слухачів про зміну мови
    this.notifyListeners();
  }

  /**
   * Отримує поточну мову
   */
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
   * Пошук перекладів
   */
  async searchTranslations(query, lang = null) {
    const searchLang = lang || this.currentLanguage;
    
    try {
      const response = await fetch(
        `${this.baseURL}/translations/${searchLang}/search/?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.results || {};
    } catch (error) {
      console.error('Помилка пошуку перекладів:', error);
      return {};
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
   * Перевіряє чи ключ є плюральним
   */
  isPlural(key) {
    return key.includes('_plural') || key.includes('_count');
  }

  /**
   * Обробляє плюральні форми
   */
  plural(key, count, params = {}) {
    const lang = this.currentLanguage;
    
    // Для української мови
    if (lang === 'uk') {
      let pluralKey;
      if (count === 1) {
        pluralKey = `${key}_one`;
      } else if (count >= 2 && count <= 4) {
        pluralKey = `${key}_few`;
      } else {
        pluralKey = `${key}_many`;
      }
      
      return this.t(pluralKey, { ...params, count });
    }
    
    // Для англійської мови
    if (lang === 'en') {
      const pluralKey = count === 1 ? `${key}_one` : `${key}_other`;
      return this.t(pluralKey, { ...params, count });
    }
    
    // Fallback
    return this.t(key, { ...params, count });
  }

  /**
   * Форматує дату згідно з поточною мовою
   */
  formatDate(date, options = {}) {
    const lang = this.currentLanguage;
    const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
    
    try {
      return new Intl.DateTimeFormat(locale, options).format(new Date(date));
    } catch (error) {
      return date.toString();
    }
  }

  /**
   * Форматує число згідно з поточною мовою
   */
  formatNumber(number, options = {}) {
    const lang = this.currentLanguage;
    const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
    
    try {
      return new Intl.NumberFormat(locale, options).format(number);
    } catch (error) {
      return number.toString();
    }
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
}

// Створюємо єдиний екземпляр сервісу
const translationService = new TranslationService();

// Експортуємо сервіс та функції для зручності
export default translationService;

// Експортуємо зручні функції
export const t = (key, params) => translationService.t(key, params);
export const setLanguage = (lang) => translationService.setLanguage(lang);
export const getCurrentLanguage = () => translationService.getCurrentLanguage();
export const addLanguageChangeListener = (callback) => translationService.addLanguageChangeListener(callback);
export const removeLanguageChangeListener = (callback) => translationService.removeLanguageChangeListener(callback);