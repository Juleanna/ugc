// frontend/src/components/AboutSection.jsx
import React, { useMemo } from 'react';
import { Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { 
  Shield, 
  Award, 
  Users, 
  Target,
  Clock,
  Star,
  TrendingUp,
  Heart,
  AlertCircle
} from 'lucide-react';

// Хуки
import { useTranslation } from '../hooks/useTranslation';
// ВИКОРИСТОВУЄМО UNIFIED API
import { useHomepageData } from '../hooks/useUnifiedAPI.jsx';

const AboutSection = ({ data, scrollToSection }) => {
  const { t } = useTranslation();
  
  // ВИКОРИСТОВУЄМО UNIFIED API HOOK для отримання даних про компанію
  const { 
    data: apiData, 
    isLoading: apiIsLoading, 
    error: apiError,
    reload: reloadData 
  } = useHomepageData();

  // Об'єднання даних з різних джерел
  const aboutData = useMemo(() => {
    // Пріоритет: props -> API -> fallback
    const sourceData = data || apiData || {};
    
    return {
      title: sourceData.about_title || t('about.title') || 'Наш багаторічний досвід',
      subtitle: sourceData.about_subtitle || t('about.subtitle') || 'гарантує якість',
      description: sourceData.about_description || t('about.description') || 'Ми створюємо одяг, який забезпечує безпеку і комфорт у будь-яких умовах. Наша продукція відповідає найвищим стандартам якості.',
      features: sourceData.about_features || getDefaultFeatures(),
      stats: sourceData.stats || getDefaultStats(),
      achievements: sourceData.achievements || getDefaultAchievements()
    };
  }, [data, apiData, t]);

  // Дефолтні особливості
  const getDefaultFeatures = () => [
    {
      id: 1,
      icon: 'shield',
      title: t('about.features.reliability.title') || 'Надійність',
      description: t('about.features.reliability.description') || 'Використовуємо тільки перевірені матеріали та технології',
      color: 'blue'
    },
    {
      id: 2,
      icon: 'award',
      title: t('about.features.quality.title') || 'Якість',
      description: t('about.features.quality.description') || 'Контроль якості на кожному етапі виробництва',
      color: 'green'
    },
    {
      id: 3,
      icon: 'users',
      title: t('about.features.trust.title') || 'Довіра',
      description: t('about.features.trust.description') || 'Понад 50 задоволених клієнтів по всій Україні',
      color: 'purple'
    },
    {
      id: 4,
      icon: 'target',
      title: t('about.features.precision.title') || 'Точність',
      description: t('about.features.precision.description') || 'Індивідуальний підхід до кожного замовлення',
      color: 'orange'
    },
    {
      id: 5,
      icon: 'clock',
      title: t('about.features.speed.title') || 'Швидкість',
      description: t('about.features.speed.description') || 'Дотримуємося встановлених термінів виконання',
      color: 'red'
    },
    {
      id: 6,
      icon: 'heart',
      title: t('about.features.care.title') || 'Турбота',
      description: t('about.features.care.description') || 'Підтримуємо клієнтів на всіх етапах співпраці',
      color: 'pink'
    }
  ];

  // Дефолтна статистика
  const getDefaultStats = () => ({
    experience: '5+',
    projects: '100+',
    clients: '50+',
    support: '24/7'
  });

  // Дефолтні досягнення
  const getDefaultAchievements = () => [
    {
      id: 1,
      title: 'ISO 9001:2015',
      description: 'Сертифікат системи управління якістю',
      year: '2023'
    },
    {
      id: 2,
      title: 'Найкращий постачальник',
      description: 'Нагорода від Міністерства оборони України',
      year: '2024'
    },
    {
      id: 3,
      title: 'Еко-сертифікація',
      description: 'Використання екологічно чистих матеріалів',
      year: '2024'
    }
  ];

  // Іконки для особливостей
  const getFeatureIcon = (iconName) => {
    const icons = {
      'shield': Shield,
      'award': Award,
      'users': Users,
      'target': Target,
      'clock': Clock,
      'heart': Heart,
      'star': Star,
      'trending-up': TrendingUp
    };
    return icons[iconName] || Shield;
  };

  // Кольори для іконок
  const getIconColor = (color) => {
    const colors = {
      'blue': 'from-blue-500 to-blue-600',
      'green': 'from-green-500 to-green-600',
      'purple': 'from-purple-500 to-purple-600',
      'orange': 'from-orange-500 to-orange-600',
      'red': 'from-red-500 to-red-600',
      'pink': 'from-pink-500 to-pink-600'
    };
    return colors[color] || 'from-blue-500 to-blue-600';
  };

  // Обробка помилки API
  if (apiError && !data) {
    return (
      <section id="about" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Помилка завантаження</h3>
              <p className="text-red-600 mb-4">{apiError}</p>
              <button 
                onClick={reloadData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Спробувати знову
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        
        {/* Заголовок секції */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {aboutData.title}
            <br />
            <span className="text-gradient-blue">{aboutData.subtitle}</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {aboutData.description}
          </p>
        </div>

        {/* Індикатор завантаження */}
        {apiIsLoading && !data && (
          <div className="text-center py-8">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600 mt-4">Завантаження інформації...</p>
          </div>
        )}

        {/* Статистика компанії */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
              {aboutData.stats.experience}
            </div>
            <div className="text-gray-600">
              {t('about.stats.experience') || 'років досвіду'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
              {aboutData.stats.projects}
            </div>
            <div className="text-gray-600">
              {t('about.stats.projects') || 'проєктів'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
              {aboutData.stats.clients}
            </div>
            <div className="text-gray-600">
              {t('about.stats.clients') || 'клієнтів'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
              {aboutData.stats.support}
            </div>
            <div className="text-gray-600">
              {t('about.stats.support') || 'підтримка'}
            </div>
          </div>
        </div>

        {/* Основні особливості */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {aboutData.features.map((feature, index) => {
            const IconComponent = getFeatureIcon(feature.icon);
            const iconColorClass = getIconColor(feature.color);
            
            return (
              <Card 
                key={feature.id || index} 
                className="hover-lift p-6 text-center transition-all duration-300 hover:shadow-xl"
              >
                <CardBody className="p-0">
                  <div className={`bg-gradient-to-r ${iconColorClass} p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Досягнення та сертифікати */}
        {aboutData.achievements && aboutData.achievements.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {t('about.achievements.title') || 'Наші досягнення'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aboutData.achievements.map((achievement, index) => (
                <Card key={achievement.id || index} className="text-center p-4 hover:shadow-lg transition-shadow">
                  <CardBody>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      {achievement.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {achievement.description}
                    </p>
                    <Chip size="sm" variant="flat" color="primary">
                      {achievement.year}
                    </Chip>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Заклик до дії */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('about.cta.title') || 'Готові працювати з професіоналами?'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('about.cta.description') || 'Наш досвід та якість говорять самі за себе. Дозвольте нам створити ідеальний одяг для вашої організації.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollToSection?.('projects')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                {t('about.cta.projects') || 'Переглянути проєкти'}
              </button>
              <button
                onClick={() => scrollToSection?.('contact')}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
              >
                {t('about.cta.contact') || 'Зв\'язатися з нами'}
              </button>
            </div>
          </div>
        </div>

        {/* Статистика API (тільки в режимі розробки) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              📊 API Status: {apiIsLoading ? 'Loading...' : 'Ready'} | 
              Features: {aboutData.features.length} | 
              Source: {data ? 'Props' : apiData ? 'Unified API' : 'Fallback'}
              {apiError && ` | Error: ${apiError}`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;