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
import { useHeroSectionData } from '../../hooks/useEnhancedAPI';

const EnhancedHeroSection = ({ 
  scrollToSection, 
  heroData: propHeroData, 
  stats: propStats, 
  isLoading: propIsLoading 
}) => {
  // Хуки
  const { t } = useTranslation();
  const { 
    heroData: hookHeroData, 
    isLoading: hookIsLoading, 
    error 
  } = useHeroSectionData();

  // Стан компонента
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Використовуємо дані з props якщо є, інакше з хука
  const heroData = propHeroData || hookHeroData;
  const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading;

  // Конфігурація статистики з іконками
  const statsConfig = useMemo(() => [
    {
      key: 'experience',
      labelKey: 'hero.stats.experience',
      fallbackLabel: 'Років досвіду',
      fallbackValue: '5+',
      icon: Award,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      key: 'projects',
      labelKey: 'hero.stats.projects',
      fallbackLabel: 'Проєктів',
      fallbackValue: '100+',
      icon: Zap,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      key: 'clients',
      labelKey: 'hero.stats.clients',
      fallbackLabel: 'Клієнтів',
      fallbackValue: '50+',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      key: 'support',
      labelKey: 'hero.stats.support',
      fallbackLabel: 'Підтримка',
      fallbackValue: '24/7',
      icon: Shield,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ], []);

  // Ініціалізація анімацій та подій
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    };

    const heroElement = document.getElementById('home');
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      clearTimeout(timer);
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Функція отримання перекладу з fallback
  const getTranslation = (key, fallback) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  // Функція отримання контенту (пріоритет: API -> переклади -> fallback)
  const getContent = (apiValue, translationKey, fallback) => {
    if (apiValue && apiValue.trim()) return apiValue;
    return getTranslation(translationKey, fallback);
  };

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
            {error?.message || getTranslation('hero.error_message', 'Не вдалося завантажити дані Hero секції')}
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

  // Статистична картка
  const StatCard = ({ statConfig, index, value, label }) => {
    const Icon = statConfig.icon;
    
    return (
      <Card 
        className={`group glass hover-lift cursor-pointer border border-white/20 backdrop-blur-xl transform transition-all duration-500 ${statConfig.bgColor}/10`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <CardBody className="p-6 text-center">
          <div className="mb-4">
            <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-r ${statConfig.color} flex items-center justify-center group-hover:scale-110 transform transition-all duration-300 shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className={`text-3xl lg:text-4xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 ${statConfig.textColor}`}>
            {value}
          </div>
          <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300 text-sm">
            {label}
          </div>
        </CardBody>
      </Card>
    );
  };

  // Картка рекомендованої послуги
  const ServiceCard = ({ service, index }) => (
    <Card 
      className="group hover-lift transition-all duration-300 border border-white/10 glass"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <CardBody className="p-6">
        {service.icon && (
          <div className="w-12 h-12 mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">{service.icon}</span>
          </div>
        )}
        <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
          {service.name || service.title}
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          {service.short_description || service.description}
        </p>
        {service.price && (
          <div className="mt-3 text-green-600 font-semibold">
            {service.price}
          </div>
        )}
      </CardBody>
    </Card>
  );

  // Рендер основного контенту
  if (isLoading && !heroData) {
    return <LoadingContent />;
  }

  if (error && !heroData) {
    return <ErrorContent />;
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Інтерактивний фоновий градієнт */}
      <div 
        className="absolute inset-0 opacity-30 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(59, 130, 246, 0.3) 0%, 
            rgba(147, 51, 234, 0.2) 50%, 
            transparent 100%)`
        }}
      />

      {/* Основний контент */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        
        {/* Заголовки */}
        <div className={`transform transition-all duration-1500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-gray-900">
              {getContent(
                heroData?.main_title,
                'hero.main_title',
                'Професійний одяг'
              )}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {getContent(
                `для ${heroData?.sphere_title}`,
                'hero.sphere_title',
                'кожної сфери'
              )}
            </span>
          </h1>
        </div>

        {/* Підзаголовок */}
        <div className={`transform transition-all duration-1500 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed ">
            {getContent(
              heroData?.subtitle,
              'hero.subtitle',
              'Ми створюємо високоякісний спецодяг, військову форму та корпоративний одяг для українських підприємств та організацій. Наш досвід і прагнення до досконалості допомагають нам задовольняти потреби професіоналів у різних галузях.'
            )}
          </p>
        </div>

        {/* Кнопки дій */}
        <div className={`transform transition-all duration-1500 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg"
              className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onPress={() => scrollToSection && scrollToSection('projects')}
            >
              <ArrowRight className="w-6 h-6 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
              {getContent(
                heroData?.primary_button_text,
                'hero.button.projects',
                'Наші проєкти'
              )}
            </Button>
            
            <Button 
              variant="bordered"
              size="lg"
              className="group px-8 py-6 text-lg font-semibold border-2 border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
              onPress={() => scrollToSection && scrollToSection('about')}
            >
              <PlayCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform duration-300" />
              {getContent(
                heroData?.secondary_button_text,
                'hero.button.learn_more',
                'Дізнатися більше'
              )}
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className={`transform transition-all duration-1500 delay-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {statsConfig.map((statConfig, index) => {
              const label = getTranslation(statConfig.labelKey, statConfig.fallbackLabel);
              const value = heroData?.stats?.[statConfig.key] || 
                          propStats?.[statConfig.key] || 
                          statConfig.fallbackValue;
              
              return (
                <StatCard
                  key={statConfig.key}
                  statConfig={statConfig}
                  index={index}
                  value={value}
                  label={label}
                />
              );
            })}
          </div>
        </div>

        {/* Додаткова інформація */}
        {heroData?.additional_info && (
          <div className={`transform transition-all duration-1500 delay-900 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <Card className="glass border border-white/20 mb-12">
              <CardBody className="p-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {heroData.additional_info}
                </p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Рекомендовані послуги */}
        {heroData?.featuredServices && heroData.featuredServices.length > 0 && (
          <div className={`transform transition-all duration-1500 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                {getTranslation('hero.featured_services', 'Наші основні послуги')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroData.featuredServices.slice(0, 3).map((service, index) => (
                  <ServiceCard
                    key={service.id || index}
                    service={service}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Рекомендовані проекти (превью) */}
        {heroData?.featuredProjects && heroData.featuredProjects.length > 0 && (
          <div className={`transform transition-all duration-1500 delay-1100 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                {getTranslation('hero.featured_projects', 'Останні проекти')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroData.featuredProjects.slice(0, 3).map((project, index) => (
                  <Card 
                    key={project.id || index}
                    className="group hover-lift transition-all duration-300 border border-white/10 glass"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CardBody className="p-0">
                      {project.main_image && (
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={project.main_image}
                            alt={project.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {project.title}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {project.short_description}
                        </p>
                        {project.category && (
                          <div className="mt-3 inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                            {project.category.name || project.category}
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              
              {/* Кнопка "Дивитись всі проекти" */}
              <div className="mt-8">
                <Button
                  variant="bordered"
                  size="lg"
                  className="group border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                  onPress={() => scrollToSection && scrollToSection('projects')}
                >
                  <Star className="w-5 h-5 mr-2 group-hover:text-blue-600 transition-colors duration-300" />
                  {getTranslation('hero.view_all_projects', 'Дивитись всі проекти')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Індикатор скролу */}
        <div className={`transform transition-all duration-1500 delay-1200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1">
                <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
              <p className="text-gray-500 text-sm animate-pulse">
                {getTranslation('hero.scroll_down', 'Прокрутіть вниз')}
              </p>
            </div>
          </div>
        </div>

        {/* Декоративні елементи */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-purple-200 rounded-full blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-green-200 rounded-full blur-xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>

      </div>

      {/* Інформаційна панель стану (тільки в dev режимі) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-20">
          <div>Hero Data: {heroData ? '✓' : '✗'}</div>
          <div>Loading: {isLoading ? '⏳' : '✓'}</div>
          <div>Services: {heroData?.featuredServices?.length || 0}</div>
          <div>Projects: {heroData?.featuredProjects?.length || 0}</div>
          <div>Stats: {heroData?.stats ? '✓' : '✗'}</div>
        </div>
      )}
    </section>
  );
};

export default EnhancedHeroSection;