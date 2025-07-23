// frontend/src/components/interactive/EnhancedHeroSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { 
  ArrowRight, 
  PlayCircle, 
  Award, 
  Zap, 
  Users, 
  Shield,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

// Хуки
import { useTranslation } from '../../hooks/useTranslation';
import { useEnhancedAPI } from '../../hooks/useEnhancedAPI';

const EnhancedHeroSection = ({ 
  scrollToSection, 
  heroData: propHeroData, 
  stats: propStats, 
  isLoading: propIsLoading 
}) => {
  // Хуки
  const { t } = useTranslation();
  const { 
    data: apiData, 
    isLoading: apiIsLoading, 
    error: apiError 
  } = useEnhancedAPI();

  // Стан компонента
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Об'єднання даних з різних джерел
  const heroData = useMemo(() => {
    // Пріоритет: props -> API -> fallback
    return {
      main_title: propHeroData?.main_title || apiData?.homepage?.main_title || 'Професійний одяг',
      sphere_title: propHeroData?.sphere_title || apiData?.homepage?.sphere_title || 'кожної сфери',
      subtitle: propHeroData?.subtitle || apiData?.homepage?.subtitle || 'Створюємо якісний одяг для різних професій',
      primary_button_text: propHeroData?.primary_button_text || apiData?.homepage?.primary_button_text || 'Наші проєкти',
      secondary_button_text: propHeroData?.secondary_button_text || apiData?.homepage?.secondary_button_text || 'Дізнатися більше',
      featured_services: propHeroData?.featured_services || apiData?.services || [],
      featured_projects: propHeroData?.featured_projects || apiData?.projects || []
    };
  }, [propHeroData, apiData]);

  const stats = useMemo(() => {
    return propStats || apiData?.stats || {
      experience: '5+',
      projects: '100+',
      clients: '50+',
      support: '24/7'
    };
  }, [propStats, apiData]);

  const isLoading = propIsLoading !== undefined ? propIsLoading : apiIsLoading;

  // Функція отримання перекладу з fallback
  const getTranslation = (key, fallback) => {
    const translation = t(key);
    return translation !== key ? translation : fallback;
  };

  // Функція отримання контенту (пріоритет: API -> переклади -> fallback)
  const getContent = (apiValue, translationKey, fallback) => {
    if (apiValue && apiValue.trim()) return apiValue;
    return getTranslation(translationKey, fallback);
  };

  // Відстеження руху миші для інтерактивності
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
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

  // Компонент завантаження
  const LoadingContent = () => (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="glass border border-white/20">
        <CardBody className="p-8 text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600">
            {getTranslation('hero.loading', 'Завантаження контенту...')}
          </p>
        </CardBody>
      </Card>
    </div>
  );

  // Компонент помилки
  const ErrorContent = () => (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="glass border border-red-200">
        <CardBody className="p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-700 mb-2">
            {getTranslation('hero.error', 'Помилка завантаження')}
          </h3>
          <p className="text-red-600 mb-4">
            {apiError?.message || getTranslation('hero.error_message', 'Не вдалося завантажити дані Hero секції')}
          </p>
          <Button
            color="danger"
            variant="bordered"
            onPress={() => window.location.reload()}
          >
            {getTranslation('common.retry', 'Спробувати знову')}
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  // Статистичні іконки
  const statsIcons = {
    experience: Award,
    projects: TrendingUp,
    clients: Users,
    support: Shield
  };

  // Якщо завантаження
  if (isLoading) {
    return <LoadingContent />;
  }

  // Якщо помилка і немає даних
  if (apiError && !heroData.main_title) {
    return <ErrorContent />;
  }

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
      }}
    >
      {/* Фоновий градієнт */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30" />
      
      {/* Декоративні елементи */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Лівий блок - Основний контент */}
          <div className={`space-y-8 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            
            {/* Заголовок */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="block text-gray-900">
                  {getContent(heroData.main_title, 'hero.title', 'Професійний одяг')}
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
                  {getContent(heroData.sphere_title, 'hero.subtitle', 'кожної сфери')}
                </span>
              </h1>
              
              {heroData.subtitle && (
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  {heroData.subtitle}
                </p>
              )}
            </div>

            {/* Кнопки дій */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                color="primary"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                endContent={<ArrowRight className="w-5 h-5" />}
                onPress={() => scrollToSection?.('projects')}
              >
                {getContent(heroData.primary_button_text, 'hero.primary_button', 'Наші проєкти')}
              </Button>
              
              <Button
                size="lg"
                variant="bordered"
                className="border-2 border-gray-300 hover:border-blue-500 transition-colors duration-300"
                startContent={<PlayCircle className="w-5 h-5" />}
                onPress={() => scrollToSection?.('about')}
              >
                {getContent(heroData.secondary_button_text, 'hero.secondary_button', 'Дізнатися більше')}
              </Button>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
              {Object.entries(stats).map(([key, value], index) => {
                const IconComponent = statsIcons[key] || Star;
                return (
                  <div 
                    key={key}
                    className={`text-center transform transition-all duration-500 delay-${index * 100}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-center mb-2">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {getTranslation(`stats.${key}`, key)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Правий блок - Візуальний контент */}
          <div className={`relative transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            
            {/* Основне зображення/контент */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                
                {/* Рекомендовані послуги */}
                {heroData.featured_services?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="w-5 h-5 text-blue-600 mr-2" />
                      {getTranslation('hero.featured_services', 'Популярні послуги')}
                    </h3>
                    <div className="space-y-3">
                      {heroData.featured_services.slice(0, 3).map((service, index) => (
                        <div 
                          key={service.id || index}
                          className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                          <span className="text-gray-700">{service.title || service.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Рекомендовані проекти */}
                {heroData.featured_projects?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                      {getTranslation('hero.featured_projects', 'Останні проекти')}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {heroData.featured_projects.slice(0, 4).map((project, index) => (
                        <div 
                          key={project.id || index}
                          className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {project.title || project.name}
                          </div>
                          {project.category && (
                            <div className="text-xs text-gray-500 mt-1">
                              {project.category}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback контент якщо немає даних */}
                {(!heroData.featured_services?.length && !heroData.featured_projects?.length) && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👔</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {getTranslation('hero.welcome', 'Ласкаво просимо')}
                    </h3>
                    <p className="text-gray-600">
                      {getTranslation('hero.welcome_message', 'Професійний підхід до кожного замовлення')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Плаваючі елементи */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-500/10 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          </div>
        </div>
      </div>

      {/* Індикатор скролу */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-sm mb-2">{getTranslation('hero.scroll_down', 'Прокрутіть вниз')}</span>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full relative">
            <div className="w-1 h-3 bg-gray-400 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;