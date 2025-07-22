// frontend/src/components/interactive/EnhancedHeroSection.jsx
// Спрощена версія з використанням кастомних хуків
import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { ArrowRight, PlayCircle, Award, Zap, Users, Shield } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useHeroData } from '../../hooks/useAPI';

const EnhancedHeroSection = ({ scrollToSection }) => {
  const { t } = useTranslation();
  const { heroData, isLoading, error } = useHeroData();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Статистика з іконками та кольорами
  const statsConfig = [
    {
      key: 'experience',
      labelKey: 'hero.stats.experience',
      fallbackLabel: 'Років досвіду',
      fallbackValue: '5+',
      icon: Award,
      color: 'from-blue-500 to-blue-600'
    },
    {
      key: 'projects',
      labelKey: 'hero.stats.projects',
      fallbackLabel: 'Проєктів',
      fallbackValue: '100+',
      icon: Zap,
      color: 'from-green-500 to-green-600'
    },
    {
      key: 'clients',
      labelKey: 'hero.stats.clients',
      fallbackLabel: 'Клієнтів',
      fallbackValue: '50+',
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      key: 'support',
      labelKey: 'hero.stats.support',
      fallbackLabel: 'Підтримка',
      fallbackValue: '24/7',
      icon: Shield,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  // Ініціалізація анімацій
  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Функція для отримання перекладу з fallback
  const getTranslation = (key, fallback) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  // Функція для отримання контенту (API -> переклад -> fallback)
  const getContent = (apiContent, translationKey, fallback) => {
    if (apiContent && apiContent.trim()) return apiContent;
    return getTranslation(translationKey, fallback);
  };

  // Показуємо спінер під час завантаження
  if (isLoading) {
    return (
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-gray-600">
            {getTranslation('common.loading', 'Завантаження...')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Динамічні градієнти що реагують на курсор */}
      <div 
        className="absolute inset-0 opacity-30 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15), transparent 40%)`
        }}
      />
      
      {/* Повідомлення про помилку */}
      {error && (
        <div className="absolute top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p className="text-sm">
            {getTranslation('common.error', 'Помилка')}: {error}
          </p>
        </div>
      )}
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          
          {/* Головний заголовок */}
          <div className={`transform transition-all duration-1500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight pt-30">
              <span>
                {getContent(
                  heroData?.main_title,
                  'hero.title.main',
                  'Професійний одяг'
                )}
              </span>
              <span className="mx-2">
                {getTranslation('hero.title.for', 'для')}
              </span>
              <span className="block text-gradient-blue animate-pulse">
                {getContent(
                  heroData?.sphere_title,
                  'hero.title.sphere',
                  'кожної сфери'
                )}
              </span>
            </h1>
          </div>

          {/* Підзаголовок */}
          <div className={`transform transition-all duration-1500 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
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
                className="group bg-gradient-blue text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-blue hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
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

          {/* Статистика з API даними */}
          <div className={`transform transition-all duration-1500 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
              {statsConfig.map((statConfig, index) => {
                const Icon = statConfig.icon;
                const label = getTranslation(statConfig.labelKey, statConfig.fallbackLabel);
                const value = heroData?.stats?.[statConfig.key] || statConfig.fallbackValue || '0';
                
                return (
                  <Card 
                    key={statConfig.key} 
                    className="group glass hover-lift cursor-pointer border border-white/20 backdrop-blur-xl transform transition-all duration-500"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CardBody className="p-6 text-center">
                      <div className="mb-4">
                        <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${statConfig.color} flex items-center justify-center group-hover:scale-110 transition-all duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl lg:text-4xl font-bold text-gradient-blue mb-2 group-hover:scale-105 transition-transform duration-300">
                        {value}
                      </div>
                      <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">
                        {label}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Додаткова інформація з API */}
          {heroData?.additional_info && (
            <div className={`transform transition-all duration-1500 delay-900 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <p className="text-gray-700 leading-relaxed">
                  {heroData.additional_info}
                </p>
              </div>
            </div>
          )}

          {/* Рекомендовані послуги (якщо є) */}
          {heroData?.featuredServices && heroData.featuredServices.length > 0 && (
            <div className={`transform transition-all duration-1500 delay-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-800 mb-8">
                  {getTranslation('hero.featured_services', 'Наші основні послуги')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {heroData.featuredServices.map((service, index) => (
                    <Card 
                      key={service.id} 
                      className="group hover-lift transition-all duration-300"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <CardBody className="p-6">
                        <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {service.short_description}
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Індикатор скролу */}
          <div className={`transform transition-all duration-1500 delay-1100 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                {getTranslation('hero.scroll_down', 'Прокрутіть вниз')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;