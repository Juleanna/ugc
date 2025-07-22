// frontend/src/hooks/useTranslation.js
import { useState, useEffect, useCallback } from 'react';
import ugcTranslationService from '../services/translationService';

/**
 * React хук для роботи з перекладами в UGC проекті
 */
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState(ugcTranslationService.getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(ugcTranslationService.isTranslationsReady());
  const [error, setError] = useState(null);

  // Функція перекладу з покращеною логікою
  const t = useCallback((key, params = {}) => {
    // Якщо переклади ще не готові, повертаємо ключ без попередження
    if (!isReady) {
      return key;
    }
    
    return ugcTranslationService.t(key, params);
  }, [isReady]);

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

  // Ініціалізація та слухач готовності перекладів
  useEffect(() => {
    const checkReadiness = async () => {
      try {
        // Чекаємо готовності перекладів
        await ugcTranslationService.waitForReady();
        setIsReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Помилка ініціалізації перекладів:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    if (!isReady) {
      checkReadiness();
    }
  }, [isReady]);

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
    isReady,
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

/**
 * Хук для компонентів, які потребують готових перекладів
 * Показує завантаження до готовності перекладів
 */
export const useTranslationWithLoader = () => {
  const translation = useTranslation();
  
  // Якщо переклади не готові, показуємо індикатор завантаження
  if (!translation.isReady) {
    return {
      ...translation,
      shouldShowLoader: true,
    };
  }

  return {
    ...translation,
    shouldShowLoader: false,
  };
};

export default useTranslation;