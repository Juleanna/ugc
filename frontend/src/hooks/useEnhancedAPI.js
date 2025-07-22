// frontend/src/hooks/useEnhancedAPI.js
// Розширений хук для роботи з новими API endpoints

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Розширений хук для Homepage з підтримкою Hero даних
 */
export const useEnhancedHomepage = () => {
  const [homepageData, setHomepageData] = useState(null);
  const [heroData, setHeroData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiCall = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Нові серіалізатори повертають дані в форматі { success, data, message }
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'API Error');
      }
    } catch (error) {
      console.error(`API Error ${endpoint}:`, error);
      throw error;
    }
  };

  // Завантаження всіх даних Homepage
  const loadHomepageData = useCallback(async () => {
    try {
      const data = await apiCall('/homepage/');
      setHomepageData(data);
      return data;
    } catch (error) {
      throw new Error(`Помилка завантаження Homepage: ${error.message}`);
    }
  }, []);

  // Завантаження Hero даних (оптимізовано)
  const loadHeroData = useCallback(async () => {
    try {
      const data = await apiCall('/homepage/hero_data/');
      setHeroData(data);
      return data;
    } catch (error) {
      console.warn('Hero endpoint недоступний, використовуємо основні дані');
      // Fallback на основні дані
      const homepageData = await loadHomepageData();
      const heroFallback = {
        main_title: homepageData?.main_title || 'Професійний одяг',
        sphere_title: homepageData?.sphere_title || 'кожної сфери',
        subtitle: homepageData?.subtitle || '',
        primary_button_text: homepageData?.primary_button_text || 'Наші проєкти',
        secondary_button_text: homepageData?.secondary_button_text || 'Дізнатися більше',
        stats: homepageData?.stats || {},
        featured_services: homepageData?.featured_services || []
      };
      setHeroData(heroFallback);
      return heroFallback;
    }
  }, [loadHomepageData]);

  // Завантаження статистики
  const loadStats = useCallback(async () => {
    try {
      const data = await apiCall('/homepage/stats/');
      setStats(data);
      return data;
    } catch (error) {
      console.warn('Stats endpoint недоступний');
      // Fallback статистика
      const fallbackStats = {
        experience: '5+',
        projects: '100+',
        clients: '50+',
        support: '24/7'
      };
      setStats(fallbackStats);
      return fallbackStats;
    }
  }, []);

  // Ініціальне завантаження
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Завантажуємо Hero дані (вони включають основну інформацію)
        await loadHeroData();
        
        // Завантажуємо статистику паралельно
        await loadStats();

        console.log('✅ Enhanced Homepage data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading enhanced homepage data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [loadHeroData, loadStats]);

  return {
    // Дані
    homepageData,
    heroData,
    stats,
    
    // Стан
    isLoading,
    error,
    
    // Методи
    refresh: () => {
      setIsLoading(true);
      return loadHeroData().finally(() => setIsLoading(false));
    },
    
    clearError: () => setError(null)
  };
};

/**
 * Хук для рекомендованих послуг з кешуванням
 */
export const useFeaturedServices = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeaturedServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/services/featured/`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        
        // Обробляємо відповідь залежно від формату
        let servicesData;
        if (result.success) {
          // Новий формат API
          servicesData = result.data;
        } else if (result.results) {
          // Старий формат DRF pagination
          servicesData = result.results;
        } else if (Array.isArray(result)) {
          // Прямий масив
          servicesData = result;
        } else {
          servicesData = [];
        }

        setServices(servicesData);
        console.log(`✅ Featured services loaded: ${servicesData.length} items`);
      } catch (error) {
        console.error('❌ Error loading featured services:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedServices();
  }, []);

  return { services, isLoading, error };
};

/**
 * Хук для рекомендованих проектів
 */
export const useFeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/featured/`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        
        let projectsData;
        if (result.success) {
          projectsData = result.data;
        } else if (result.results) {
          projectsData = result.results;
        } else if (Array.isArray(result)) {
          projectsData = result;
        } else {
          projectsData = [];
        }

        setProjects(projectsData);
        console.log(`✅ Featured projects loaded: ${projectsData.length} items`);
      } catch (error) {
        console.error('❌ Error loading featured projects:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProjects();
  }, []);

  return { projects, isLoading, error };
};

/**
 * Комбінований хук для Hero секції з всіма потрібними даними
 */
export const useHeroSectionData = () => {
  const { heroData, stats, isLoading: heroLoading, error: heroError } = useEnhancedHomepage();
  const { services, isLoading: servicesLoading } = useFeaturedServices();
  const { projects, isLoading: projectsLoading } = useFeaturedProjects();

  const isLoading = heroLoading || servicesLoading || projectsLoading;

  // Об'єднуємо всі дані для Hero секції
  const combinedHeroData = {
    ...heroData,
    featuredServices: heroData?.featured_services || services,
    featuredProjects: heroData?.featured_projects || projects,
    stats: heroData?.stats || stats || {
      experience: '5+',
      projects: '100+',
      clients: '50+',
      support: '24/7'
    }
  };

  return {
    heroData: combinedHeroData,
    isLoading,
    error: heroError,
    hasData: !!heroData
  };
};

export default useEnhancedHomepage;