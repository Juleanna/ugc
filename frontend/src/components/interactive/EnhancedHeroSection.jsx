// frontend/src/components/interactive/EnhancedHeroSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, CardBody, Spinner, Chip } from "@nextui-org/react";
import { 
  ArrowRight, 
  PlayCircle, 
  Award, 
  Zap, 
  Users, 
  Shield,
  TrendingUp,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';

// Хуки
import { useTranslation } from '../../hooks/useTranslation';
// ВИКОРИСТОВУЄМО ТІЛЬКИ UNIFIED API
import { 
  useHeroData,
  useHomepageData, 
  useServicesData, 
  useProjectsData
} from '../../hooks/useUnifiedAPI.jsx';

const EnhancedHeroSection = ({ 
  scrollToSection, 
  heroData: propHeroData, 
  stats: propStats, 
  isLoading: propIsLoading 
}) => {
  // Хуки
  const { t } = useTranslation();
  
  // ВИКОРИСТОВУЄМО UNIFIED API HOOKS
  const { 
    data: heroApiData, 
    isLoading: heroIsLoading, 
    error: heroError,
    reload: reloadHero 
  } = useHeroData();

  const { 
    data: homepageData, 
    isLoading: homepageIsLoading 
  } = useHomepageData();

  const { 
    data: servicesData, 
    isLoading: servicesIsLoading 
  } = useServicesData();

  const { 
    data: projectsData, 
    isLoading: projectsIsLoading 
  } = useProjectsData();

  // Стан компонента
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Об'єднання даних з різних джерел
  const heroData = useMemo(() => {
    console.log('HeroSection: Объединяем данные', {
      propHeroData: !!propHeroData,
      heroApiData: !!heroApiData,
      homepageData: !!homepageData
    });

    // Пріоритет: props -> heroAPI -> homepage -> fallback
    const sourceData = propHeroData || heroApiData || homepageData || {};
    
    return {
      main_title: sourceData.main_title || t('hero.main_title') || 'Професійний одяг',
      sphere_title: sourceData.sphere_title || t('hero.sphere_title') || 'кожної сфери',
      subtitle: sourceData.subtitle || t('hero.subtitle') || 'Створюємо якісний одяг для різних професій',
      primary_button_text: sourceData.primary_button_text || t('hero.primary_button') || 'Наші проєкти',
      secondary_button_text: sourceData.secondary_button_text || t('hero.secondary_button') || 'Дізнатися більше',
      description: sourceData.description || t('hero.description') || 'Ми пропонуємо повний спектр послуг з виробництва професійного одягу для різних галузей. Від корпоративного стилю до спеціалізованого захисного обладнання.',
      featured_services: sourceData.featured_services || servicesData?.slice(0, 3) || [],
      featured_projects: sourceData.featured_projects || projectsData?.slice(0, 4) || []
    };
  }, [propHeroData, heroApiData, homepageData, servicesData, projectsData, t]);

  const stats = useMemo(() => {
    const sourceStats = propStats || heroApiData?.stats || homepageData?.stats;
    
    return sourceStats || {
      experience: '5+',
      projects: '100+',
      clients: '50+',
      support: '24/7'
    };
  }, [propStats, heroApiData, homepageData]);

  // Визначаємо стан завантаження
  const isLoading = propIsLoading !== undefined 
    ? propIsLoading 
    : (heroIsLoading || homepageIsLoading || servicesIsLoading || projectsIsLoading);

  // Функція отримання перекладу з fallback
  const getTranslation = (key, fallback) => {
    const translation = t(key);
    return translation !== key ? translation : fallback;
  };

  // Обробка руху миші для паралакс ефекту
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      setMousePosition({
        x: (clientX / innerWidth - 0.5) * 20,
        y: (clientY / innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Анімація появи
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Автоматична зміна активної особливості
  useEffect(() => {
    if (heroData.featured_services.length > 0) {
      const interval = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % heroData.featured_services.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [heroData.featured_services.length]);

  // Ключові переваги для анімації
  const keyFeatures = [
    {
      icon: Shield,
      title: getTranslation('hero.features.quality', 'Висока якість'),
      description: 'Використовуємо тільки сертифіковані матеріали'
    },
    {
      icon: Clock,
      title: getTranslation('hero.features.speed', 'Швидке виконання'),
      description: 'Дотримуємося встановлених термінів'
    },
    {
      icon: Award,
      title: getTranslation('hero.features.experience', 'Досвід роботи'),
      description: 'Понад 5 років успішної діяльності'
    },
    {
      icon: Users,
      title: getTranslation('hero.features.service', 'Індивідуальний підхід'),
      description: 'Персональні рішення для кожного клієнта'
    }
  ];

  // Обробка помилок API
  if (heroError && !propHeroData) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Помилка завантаження</h3>
            <p className="text-red-600 mb-4">{heroError}</p>
            <Button 
              color="danger" 
              variant="flat" 
              onPress={reloadHero}
            >
              Спробувати знову
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      
      {/* Анімований фон */}
      <div className="absolute inset-0">
        {/* Геометричні фігури з паралакс ефектом */}
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`
          }}
        />
        
        {/* Анімовані точки */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Основний контент */}
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Лівий блок - основний контент */}
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            
            {/* Заголовок */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
                <span className="block text-gray-900">
                  {heroData.main_title}
                </span>
                <span className="block text-gradient-blue">
                  {heroData.sphere_title}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed">
                {heroData.subtitle}
              </p>

              {heroData.description && (
                <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-2xl">
                  {heroData.description}
                </p>
              )}
            </div>

            {/* Кнопки дій */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                color="primary"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-semibold hover:shadow-2xl transition-all duration-300"
                endContent={<ArrowRight className="w-5 h-5" />}
                onPress={() => scrollToSection?.('projects')}
              >
                {heroData.primary_button_text}
              </Button>
              
              <Button
                size="lg"
                variant="bordered"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-300"
                startContent={<PlayCircle className="w-5 h-5" />}
                onPress={() => scrollToSection?.('about')}
              >
                {heroData.secondary_button_text}
              </Button>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                  {stats.experience}
                </div>
                <div className="text-sm text-gray-600">
                  {getTranslation('hero.stats.experience', 'років досвіду')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
                  {stats.projects}
                </div>
                <div className="text-sm text-gray-600">
                  {getTranslation('hero.stats.projects', 'проєктів')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-1">
                  {stats.clients}
                </div>
                <div className="text-sm text-gray-600">
                  {getTranslation('hero.stats.clients', 'клієнтів')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-1">
                  {stats.support}
                </div>
                <div className="text-sm text-gray-600">
                  {getTranslation('hero.stats.support', 'підтримка')}
                </div>
              </div>
            </div>
          </div>

          {/* Правий блок - інтерактивний контент */}
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            
            {/* Індикатор завантаження */}
            {isLoading && (
              <div className="text-center py-12">
                <Spinner size="lg" color="primary" />
                <p className="text-gray-600 mt-4">Завантаження даних...</p>
              </div>
            )}

            {/* Ключові переваги */}
            <div className="space-y-6 mb-8">
              {keyFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                const isActive = index === activeFeature;
                
                return (
                  <Card 
                    key={index}
                    className={`transition-all duration-500 cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg scale-105' 
                        : 'hover:shadow-md'
                    }`}
                    isPressable
                    onPress={() => setActiveFeature(index)}
                  >
                    <CardBody className="p-4 flex flex-row items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                          : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          isActive ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${
                          isActive ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {feature.title}
                        </h4>
                        <p className={`text-sm ${
                          isActive ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* Рекомендовані послуги */}
            {heroData.featured_services && heroData.featured_services.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {getTranslation('hero.featured_services', 'Популярні послуги')}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {heroData.featured_services.map((service, index) => (
                    <Card 
                      key={service.id || index}
                      className="hover:shadow-md transition-all duration-300 cursor-pointer"
                      isPressable
                      onPress={() => scrollToSection?.('services')}
                    >
                      <CardBody className="p-4 flex flex-row items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {service.title || service.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {service.description?.slice(0, 60)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {service.price_range && (
                            <Chip size="sm" variant="flat" color="primary">
                              {service.price_range}
                            </Chip>
                          )}
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Останні проєкти */}
            {heroData.featured_projects && heroData.featured_projects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {getTranslation('hero.recent_projects', 'Останні проєкти')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {heroData.featured_projects.map((project, index) => (
                    <Card 
                      key={project.id || index}
                      className="hover:shadow-md transition-all duration-300 cursor-pointer"
                      isPressable
                      onPress={() => scrollToSection?.('projects')}
                    >
                      <CardBody className="p-3 text-center">
                        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-2 rounded-lg mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {project.title?.slice(0, 25) || project.name?.slice(0, 25)}
                          {(project.title?.length > 25 || project.name?.length > 25) && '...'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {project.client || project.subtitle}
                        </p>
                        {project.status && (
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            color={project.status === 'completed' ? 'success' : 'warning'}
                            className="mt-2"
                          >
                            {project.status === 'completed' ? 'Завершено' : 'В процесі'}
                          </Chip>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Додаткові елементи UI */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <span className="text-sm">
              {getTranslation('hero.scroll_down', 'Прокрутіть вниз')}
            </span>
            <div className="w-8 h-0.5 bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Плаваючі елементи дизайну */}
      <div className="absolute top-20 right-20 animate-bounce">
        <div className="w-4 h-4 bg-blue-400 rounded-full opacity-60"></div>
      </div>
      <div className="absolute bottom-40 left-20 animate-pulse">
        <div className="w-6 h-6 bg-purple-400 rounded-full opacity-40"></div>
      </div>
      <div className="absolute top-1/2 right-10 animate-ping">
        <div className="w-3 h-3 bg-pink-400 rounded-full opacity-50"></div>
      </div>

      {/* Статистика API (тільки в режимі розробки) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
          <div>API Status: {isLoading ? 'Loading...' : 'Ready'}</div>
          <div>Hero Data: {propHeroData ? 'Props' : heroApiData ? 'Hero API' : homepageData ? 'Homepage API' : 'Fallback'}</div>
          <div>Services: {heroData.featured_services.length}</div>
          <div>Projects: {heroData.featured_projects.length}</div>
          {heroError && <div className="text-red-400">Error: {heroError}</div>}
        </div>
      )}
    </section>
  );
};

export default EnhancedHeroSection;