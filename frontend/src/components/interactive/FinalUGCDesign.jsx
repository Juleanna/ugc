// frontend/src/components/interactive/FinalUGCDesign.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Spinner, Card, CardBody, Button } from '@nextui-org/react';
import { ChevronUp, Wifi, WifiOff } from 'lucide-react';

// Імпорт розширених API хуків
import { 
  useEnhancedHomepage, 
  useHeroSectionData, 
  useFeaturedServices, 
  useFeaturedProjects 
} from '../../hooks/useEnhancedAPI';

// Імпорт хука перекладів
import { useTranslation } from '../../hooks/useTranslation';

// Імпорт компонентів
import UnifiedBackground from './UnifiedBackground';
import ModernNavigation from './ModernNavigation';
import EnhancedHeroSection from './EnhancedHeroSection';

// Імпорт секцій
import AboutSection from '../AboutSection';
import ServicesSection from '../ServicesSection';
import ProjectsSection from '../ProjectsSection';
import ContactSection from '../ContactSection';
import Footer from '../Footer';

const FinalUGCDesign = () => {
  // Стан компонента
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Хуки для перекладів
  const { t, isLoading: translationsLoading } = useTranslation();

  // Розширені API хуки
  const { 
    heroData, 
    stats, 
    isLoading: heroLoading, 
    error: heroError 
  } = useHeroSectionData();

  const { 
    services, 
    isLoading: servicesLoading, 
    error: servicesError 
  } = useFeaturedServices();

  const { 
    projects, 
    isLoading: projectsLoading, 
    error: projectsError 
  } = useFeaturedProjects();

  // Загальний стан завантаження
  const isLoading = useMemo(() => 
    heroLoading || servicesLoading || projectsLoading || translationsLoading,
    [heroLoading, servicesLoading, projectsLoading, translationsLoading]
  );

  // Об'єднані дані для передачі в компоненти
  const combinedData = useMemo(() => ({
    hero: heroData,
    services: services,
    projects: projects,
    stats: stats
  }), [heroData, services, projects, stats]);

  // Моніторинг підключення до інтернету
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Відстеження скролу та активної секції
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      
      // Прогрес скролу
      setScrollProgress((currentScroll / totalScroll) * 100);
      
      // Показ кнопки "Вгору"
      setShowScrollToTop(currentScroll > 300);

      // Визначення активної секції
      const sections = ['home', 'about', 'services', 'projects', 'contact'];
      const sectionElements = sections.map(id => document.getElementById(id));
      
      let current = 'home';
      sectionElements.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionCenter = rect.top + (rect.height / 2);
          
          // Секція вважається активною, якщо її центр знаходиться у верхній половині вікна
          if (sectionCenter <= window.innerHeight / 2 && sectionCenter >= -rect.height / 2) {
            current = sections[index];
          }
        }
      });
      
      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    // Throttled scroll handler для кращої продуктивності
    let scrollTimeout;
    const throttledScrollHandler = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    // Ініціальний виклик
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [activeSection]);

  // Функція плавної прокрутки до секції
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Висота навігації
      const offsetTop = element.offsetTop - navHeight;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Оновлюємо активну секцію одразу для кращого UX
      setActiveSection(sectionId);
    }
  }, []);

  // Прокрутка вгору
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Обробка помилок
  const hasErrors = heroError || servicesError || projectsError;
  const errorMessages = [heroError, servicesError, projectsError]
    .filter(Boolean)
    .map(error => error.toString());

  // Індикатор стану підключення
  const ConnectionIndicator = () => (
    <div className={`fixed top-20 right-4 z-40 transition-all duration-300 ${
      isOnline ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <Card className="bg-red-50 border border-red-200">
        <CardBody className="p-3 flex flex-row items-center gap-2">
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">
            {t('common.offline', 'Немає підключення')}
          </span>
        </CardBody>
      </Card>
    </div>
  );

  // Компонент завантаження
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="glass border border-white/20">
        <CardBody className="p-8 text-center">
          <Spinner size="lg" className="mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('common.loading', 'Завантаження...')}
          </h3>
          <p className="text-gray-500">
            {t('common.loading_data', 'Підготовка контенту')}
          </p>
        </CardBody>
      </Card>
    </div>
  );

  // Компонент помилок
  const ErrorDisplay = () => (
    hasErrors && (
      <div className="fixed top-20 left-4 z-40">
        <Card className="bg-red-50 border border-red-200 max-w-sm">
          <CardBody className="p-4">
            <h4 className="font-semibold text-red-700 mb-2">
              {t('common.error', 'Помилка завантаження')}
            </h4>
            <div className="text-sm text-red-600 space-y-1">
              {errorMessages.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* Показуємо overlay завантаження тільки при першому завантаженні */}
      {isLoading && !combinedData.hero && <LoadingOverlay />}
      
      {/* Фоновий компонент з усіма ефектами */}
      <UnifiedBackground />
      
      {/* Індикатор прогресу скролу */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50 transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Індикатор підключення */}
      <ConnectionIndicator />

      {/* Відображення помилок */}
      <ErrorDisplay />

      {/* Навігація */}
      <ModernNavigation 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* Основний контент */}
      <main>
        {/* Hero секція з розширеними даними */}
        <section id="home" className="relative min-h-screen">
          <EnhancedHeroSection 
            scrollToSection={scrollToSection}
            heroData={combinedData.hero}
            stats={combinedData.stats}
            isLoading={heroLoading}
          />
        </section>

        {/* Секція "Про нас" */}
        <section id="about" className="relative bg-white/80 backdrop-blur-sm">
          <div className="parallax-section">
            <AboutSection 
              data={combinedData}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Секція послуг з розширеними даними */}
        <section id="services" className="relative bg-gray-50/80 backdrop-blur-sm">
          <div className="parallax-section">
            <ServicesSection 
              services={combinedData.services}
              isLoading={servicesLoading}
              error={servicesError}
            />
          </div>
        </section>

        {/* Секція проектів з розширеними даними */}
        <section id="projects" className="relative bg-white/80 backdrop-blur-sm">
          <div className="parallax-section">
            <ProjectsSection 
              projects={combinedData.projects}
              isLoading={projectsLoading}
              error={projectsError}
            />
          </div>
        </section>

        {/* Секція контактів */}
        <section id="contact" className="relative bg-gray-50/80 backdrop-blur-sm">
          <div className="parallax-section">
            <ContactSection 
              data={combinedData}
              isLoading={isLoading}
            />
          </div>
        </section>
      </main>

      {/* Футер */}
      <Footer data={combinedData} />

      {/* Кнопка прокрутки вгору */}
      <Button
        isIconOnly
        className={`fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 ${
          showScrollToTop 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-16 opacity-0 scale-75 pointer-events-none'
        }`}
        size="lg"
        onPress={scrollToTop}
        aria-label={t('common.scroll_to_top', 'Прокрутити вгору')}
      >
        <ChevronUp className="w-6 h-6" />
      </Button>

      {/* Дебаг інформація (тільки в режимі розробки) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40 bg-black/80 text-white text-xs p-3 rounded-lg font-mono">
          <div>Active: {activeSection}</div>
          <div>Scroll: {Math.round(scrollProgress)}%</div>
          <div>Online: {isOnline ? '✓' : '✗'}</div>
          <div>Loading: {isLoading ? '⏳' : '✓'}</div>
          <div>Hero: {combinedData.hero ? '✓' : '✗'}</div>
          <div>Services: {combinedData.services?.length || 0}</div>
          <div>Projects: {combinedData.projects?.length || 0}</div>
        </div>
      )}
    </div>
  );
};

export default FinalUGCDesign;