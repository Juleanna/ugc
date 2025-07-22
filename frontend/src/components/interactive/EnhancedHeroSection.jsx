// frontend/src/components/interactive/EnhancedHeroSection.jsx
import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody } from "@nextui-org/react";
import { ArrowRight, PlayCircle, Sparkles, Zap, Shield, Award } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const EnhancedHeroSection = ({ scrollToSection, data }) => {
  const { t, currentLanguage } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Статистика з перекладами
  const stats = [
    { 
      value: '5+', 
      labelKey: 'hero.stats.experience',
      fallbackLabel: 'Років досвіду',
      icon: Award 
    },
    { 
      value: '100+', 
      labelKey: 'hero.stats.projects',
      fallbackLabel: 'Проєктів',
      icon: Zap 
    },
    { 
      value: '50+', 
      labelKey: 'hero.stats.clients',
      fallbackLabel: 'Клієнтів',
      icon: Shield 
    },
    { 
      value: '24/7', 
      labelKey: 'hero.stats.support',
      fallbackLabel: 'Підтримка',
      icon: Sparkles 
    }
  ];

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
    // Якщо переклад повертає той самий ключ, використовуємо fallback
    return translation === key ? fallback : translation;
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Динамічні градієнти що реагують на курсор */}
      <div 
        className="absolute inset-0 opacity-30 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15), transparent 40%)`
        }}
      />
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Головний заголовок з анімацією та перекладами */}
          <div className={`transform transition-all duration-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight pt-30">
              <span>{getTranslation('hero.title.main', 'Професійний одяг')} </span>
              <span>{getTranslation('hero.title.for', 'для')} </span>
              <span className="block text-gradient-blue animate-pulse">
                {getTranslation('hero.title.sphere', 'кожної сфери')}
              </span>
            </h1>
          </div>

          {/* Підзаголовок з перекладами */}
          <div className={`transform transition-all duration-1500 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
              {getTranslation(
                'hero.subtitle', 
                'Ми створюємо високоякісний спецодяг, військову форму та корпоративний одяг для українських підприємств та організацій. Наш досвід і прагнення до досконалості допомагають нам задовольняти потреби професіоналів у різних галузях.'
              )}
            </p>
          </div>

          {/* Кнопки дій з перекладами */}
          <div className={`transform transition-all duration-1500 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg"
                className="group bg-gradient-blue text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-blue hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onPress={() => scrollToSection('projects')}
              >
                <ArrowRight className="w-6 h-6 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                {getTranslation('hero.button.projects', 'Наші проєкти')}
              </Button>
              
              <Button 
                variant="bordered"
                size="lg"
                className="group px-8 py-6 text-lg font-semibold border-2 border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                onPress={() => scrollToSection('about')}
              >
                <PlayCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform duration-300" />
                {getTranslation('hero.button.learn_more', 'Дізнатися більше')}
              </Button>
            </div>
          </div>

          {/* Статистика з анімацією та перекладами */}
          <div className={`transform transition-all duration-1500 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const label = getTranslation(stat.labelKey, stat.fallbackLabel);
                
                return (
                  <Card 
                    key={index} 
                    className={`group glass hover-lift cursor-pointer border border-white/20 backdrop-blur-xl transform transition-all duration-500`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CardBody className="p-6 text-center">
                      <div className="mb-4">
                        <Icon className="w-8 h-8 mx-auto text-blue-600 group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300" />
                      </div>
                      <div className="text-3xl lg:text-4xl font-bold text-gradient-blue mb-2 group-hover:scale-105 transition-transform duration-300">
                        {stat.value}
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


        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;