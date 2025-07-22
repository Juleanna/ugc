// frontend/src/hooks/useTranslation.js
import { useState, useEffect, useCallback } from 'react';
import ugcTranslationService from '../services/translationService';

/**
 * React хук для роботи з перекладами в UGC проекті
 */
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState(ugcTranslationService.getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Функція перекладу
  const t = useCallback((key, params = {}) => {
    return ugcTranslationService.t(key, params);
  }, [currentLanguage]);

  // Зміна мови
  const changeLanguage = useCallback(async (lang) => {
    if (lang === currentLanguage) return;

    setIsLoading(true);
    setError(null);

    try {
      await ugcTranslationService.setLanguage(lang);
      setCurrentLanguage(lang);
      console.log(`✅ Мова змінена на: ${lang}`);
    } catch (err) {
      setError(err.message);
      console.error('❌ Помилка зміни мови:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Оновлення перекладів
  const refreshTranslations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await ugcTranslationService.refreshTranslations();
      console.log('✅ Переклади оновлено');
    } catch (err) {
      setError(err.message);
      console.error('❌ Помилка оновлення перекладів:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Слухач зміни мови
  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      setCurrentLanguage(newLang);
      console.log(`🔄 Мова оновлена в хуку: ${newLang}`);
    };

    ugcTranslationService.addLanguageChangeListener(handleLanguageChange);

    return () => {
      ugcTranslationService.removeLanguageChangeListener(handleLanguageChange);
    };
  }, []);

  return {
    // Основні функції
    t,
    changeLanguage,
    refreshTranslations,
    
    // Стан
    currentLanguage,
    isLoading,
    error,
    
    // Додаткові функції
    clearError: () => setError(null),
    
    // Перевірки мови
    isUkrainian: currentLanguage === 'uk',
    isEnglish: currentLanguage === 'en',
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
        const availableLanguages = await ugcTranslationService.getAvailableLanguages();
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
 * Хук для статистики перекладів (для адміністраторів)
 */
export const useTranslationStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const translationStats = await ugcTranslationService.getTranslationStats();
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