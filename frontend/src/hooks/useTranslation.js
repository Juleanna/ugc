// frontend/src/hooks/useTranslation.js
import { useState, useEffect, useCallback } from 'react';
import translationService from '../services/translationService';

/**
 * React хук для роботи з перекладами
 */
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState(translationService.getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Функція перекладу
  const t = useCallback((key, params = {}) => {
    return translationService.t(key, params);
  }, [currentLanguage]);

  // Функція для плюральних форм
  const plural = useCallback((key, count, params = {}) => {
    return translationService.plural(key, count, params);
  }, [currentLanguage]);

  // Зміна мови
  const changeLanguage = useCallback(async (lang) => {
    setIsLoading(true);
    setError(null);

    try {
      await translationService.setLanguage(lang);
      setCurrentLanguage(lang);
    } catch (err) {
      setError(err.message);
      console.error('Помилка зміни мови:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Оновлення перекладів
  const refreshTranslations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await translationService.refreshTranslations();
    } catch (err) {
      setError(err.message);
      console.error('Помилка оновлення перекладів:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Форматування дати
  const formatDate = useCallback((date, options = {}) => {
    return translationService.formatDate(date, options);
  }, [currentLanguage]);

  // Форматування числа
  const formatNumber = useCallback((number, options = {}) => {
    return translationService.formatNumber(number, options);
  }, [currentLanguage]);

  // Пошук перекладів
  const searchTranslations = useCallback(async (query, lang = null) => {
    return await translationService.searchTranslations(query, lang);
  }, []);

  // Слухач зміни мови
  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      setCurrentLanguage(newLang);
    };

    translationService.addLanguageChangeListener(handleLanguageChange);

    return () => {
      translationService.removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  return {
    // Основні функції
    t,
    plural,
    changeLanguage,
    refreshTranslations,
    
    // Форматування
    formatDate,
    formatNumber,
    
    // Пошук
    searchTranslations,
    
    // Стан
    currentLanguage,
    isLoading,
    error,
    
    // Додаткові функції
    clearError: () => setError(null),
  };
};

/**
 * Хук для отримання списку доступних мов
 */
export const useAvailableLanguages = () => {
  const [languages, setLanguages] = useState(['uk', 'en']);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadLanguages = async () => {
      setIsLoading(true);
      try {
        const availableLanguages = await translationService.getAvailableLanguages();
        setLanguages(availableLanguages);
      } catch (error) {
        console.error('Помилка завантаження списку мов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();
  }, []);

  return { languages, isLoading };
};

/**
 * Хук для статистики перекладів
 */
export const useTranslationStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const translationStats = await translationService.getTranslationStats();
      setStats(translationStats);
    } catch (error) {
      console.error('Помилка завантаження статистики:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, isLoading, refreshStats: loadStats };
};

export default useTranslation;