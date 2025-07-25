// frontend/src/hooks/useTranslation.js
// Виправлений хук з кращою обробкою fallback-перекладів

import { useState, useEffect, useCallback, useMemo } from 'react';
import translationService from '../services/translationService';

export const useTranslation = (initialLanguage = 'uk') => {
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoadedLanguage, setLastLoadedLanguage] = useState(null);

  // Функція для завантаження перекладів
  const loadLanguage = useCallback(async (language) => {
    if (lastLoadedLanguage === language) {
      return; // Вже завантажено
    }

    setIsLoading(true);
    setError(null);

    try {
      await translationService.loadTranslations(language);
      setLastLoadedLanguage(language);
      setCurrentLanguage(language);
    } catch (err) {
      console.error('Translation loading error:', err);
      setError(err.message);
      // Все одно встановлюємо мову, бо є fallback
      setCurrentLanguage(language);
      setLastLoadedLanguage(language);
    } finally {
      setIsLoading(false);
    }
  }, [lastLoadedLanguage]);

  // Завантажуємо початкову мову
  useEffect(() => {
    if (!lastLoadedLanguage) {
      loadLanguage(currentLanguage);
    }
  }, [currentLanguage, lastLoadedLanguage, loadLanguage]);

  // Функція перекладу з мемоізацією
  const t = useCallback((key, interpolation = {}) => {
    if (!key) return '';
    
    try {
      return translationService.translate(key, currentLanguage, interpolation);
    } catch (err) {
      console.error(`Translation error for key "${key}":`, err);
      return key; // Fallback до ключа
    }
  }, [currentLanguage]);

  // Функція зміни мови
  const changeLanguage = useCallback(async (newLanguage) => {
    if (newLanguage === currentLanguage) return;
    
    await loadLanguage(newLanguage);
    translationService.setLanguage(newLanguage);
  }, [currentLanguage, loadLanguage]);

  // Перевірка наявності перекладу
  const hasTranslation = useCallback((key) => {
    return translationService.hasTranslation(key, currentLanguage);
  }, [currentLanguage]);

  // Отримання доступних мов
  const availableLanguages = useMemo(() => {
    return translationService.getAvailableLanguages();
  }, []);

  // ВИПРАВЛЕНО: Статистика для debug без process.env
  const stats = useMemo(() => {
    // Перевіряємо чи це dev середовище безпечно
    const isDev = translationService.isDevelopment();
    if (isDev) {
      return translationService.getStats();
    }
    return null;
  }, [currentLanguage, isLoading]);

  return {
    t,
    currentLanguage,
    changeLanguage,
    isLoading,
    error,
    hasTranslation,
    availableLanguages,
    stats
  };
};