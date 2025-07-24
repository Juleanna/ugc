// frontend/src/components/ServicesSection.jsx
// Адаптовано для ViewSets архітектури

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, Button, Spinner, Chip } from "@nextui-org/react";
import { 
  ShirtIcon, 
  HardHat, 
  Stethoscope, 
  GraduationCap, 
  ChefHat, 
  Shield,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

// Хуки для ViewSets API
import { useTranslation } from '../hooks/useTranslation';
import { useServicesData } from '../hooks/useUnifiedAPI.jsx';

const ServicesSection = ({ data, scrollToSection }) => {
  const { t } = useTranslation();
  
  // ViewSets API хук для послуг
  const { 
    data: apiServices, 
    featuredData: apiFeaturedServices,
    isLoading: apiIsLoading, 
    error: apiError,
    reload: reloadServices 
  } = useServicesData();
  
  // Локальний стан компонента
  const [visibleServices, setVisibleServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);

  // Об'єднання даних з різних джерел (пріоритет: props -> ViewSets API -> fallback)
  const services = useMemo(() => {
    if (data?.services?.length > 0) {
      console.log('ServicesSection: використовуємо дані з props');
      return data.services;
    }
    
    if (showAllServices && apiServices?.length > 0) {
      console.log('ServicesSection: використовуємо всі послуги з ViewSets API');
      return apiServices;
    }
    
    if (apiFeaturedServices?.length > 0) {
      console.log('ServicesSection: використовуємо рекомендовані послуги з ViewSets API');
      return apiFeaturedServices;
    }
    
    console.log('ServicesSection: використовуємо fallback дані');
    return getDefaultServices();
  }, [data?.services, apiServices, apiFeaturedServices, showAllServices]);

  // Fallback дані для демонстрації
  const getDefaultServices = () => [
    {
      id: 1,
      name: t('services.corporate.title') || 'Корпоративний одяг',
      short_description: t('services.corporate.description') || 'Елегантний та професійний одяг для офісних працівників',
      icon: 'shirt',
      main_image: '/images/services/corporate.jpg',
      is_featured: true,
      benefits: ['Індивідуальний дизайн', 'Якісні тканини', 'Швидке виробництво'],
      min_order_quantity: 10,
      production_time: '2-3 тижні'
    },
    {
      id: 2,
      name: t('services.medical.title') || 'Медичний одяг',
      short_description: t('services.medical.description') || 'Спеціалізований одяг для медичних працівників',
      icon: 'stethoscope',
      main_image: '/images/services/medical.jpg',
      is_featured: true,
      benefits: ['Антибактеріальні тканини', 'Зручний крій', 'Відповідність стандартам'],
      min_order_quantity: 20,
      production_time: '1-2 тижні'
    },
    {
      id: 3,
      name: t('services.safety.title') || 'Спецодяг та захист',
      short_description: t('services.safety.description') || 'Захисний одяг для промислових об\'єктів',
      icon: 'hardhat',
      main_image: '/images/services/safety.jpg',
      is_featured: true,
      benefits: ['Підвищена міцність', 'Світловідбивні елементи', 'Сертифікація'],
      min_order_quantity: 15,
      production_time: '2-4 тижні'
    },
    {
      id: 4,
      name: t('services.education.title') || 'Шкільна форма',
      short_description: t('services.education.description') || 'Якісна та зручна форма для навчальних закладів',
      icon: 'graduation-cap',
      main_image: '/images/services/education.jpg',
      is_featured: false,
      benefits: ['Натуральні матеріали', 'Різні розміри', 'Доступні ціни'],
      min_order_quantity: 50,
      production_time: '3-4 тижні'
    },
    {
      id: 5,
      name: t('services.horeca.title') || 'Одяг для HoReCa',
      short_description: t('services.horeca.description') || 'Професійний одяг для ресторанів та готелів',
      icon: 'chef-hat',
      main_image: '/images/services/horeca.jpg',
      is_featured: false,
      benefits: ['Стійкість до плям', 'Легкий догляд', 'Стильний вигляд'],
      min_order_quantity: 25,
      production_time: '2-3 тижні'
    },
    {
      id: 6,
      name: t('services.security.title') || 'Форма охорони',
      short_description: t('services.security.description') || 'Професійна форма для служб безпеки',
      icon: 'shield',
      main_image: '/images/services/security.jpg',
      is_featured: false,
      benefits: ['Міцні матеріали', 'Функціональність', 'Представницький вигляд'],
      min_order_quantity: 10,
      production_time: '2-3 тижні'
    }
  ];

  // Іконки для різних категорій послуг
  const getServiceIcon = (iconName) => {
    const iconMap = {
      'shirt': ShirtIcon,
      'stethoscope': Stethoscope,
      'hardhat': HardHat,
      'graduation-cap': GraduationCap,
      'chef-hat': ChefHat,
      'shield': Shield
    };
    return iconMap[iconName] || ShirtIcon;
  };

  // Фільтрація послуг за категорією та пошуком
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Фільтр за категорією
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => 
        service.category === selectedCategory || 
        service.icon === selectedCategory ||
        (selectedCategory === 'featured' && service.is_featured)
      );
    }

    // Пошук
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name?.toLowerCase().includes(query) ||
        service.short_description?.toLowerCase().includes(query) ||
        service.benefits?.some(benefit => benefit.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [services, selectedCategory, searchQuery]);

  // Анімація появи карток
  useEffect(() => {
    setVisibleServices([]);
    const timer = setTimeout(() => {
      setVisibleServices(filteredServices);
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredServices]);

  // Категорії для фільтра
  const categories = [
    { key: 'all', label: t('services.categories.all') || 'Всі послуги', icon: null },
    { key: 'featured', label: t('services.categories.featured') || 'Рекомендовані', icon: CheckCircle },
    { key: 'shirt', label: t('services.categories.corporate') || 'Корпоративний', icon: ShirtIcon },
    { key: 'stethoscope', label: t('services.categories.medical') || 'Медичний', icon: Stethoscope },
    { key: 'hardhat', label: t('services.categories.safety') || 'Спецодяг', icon: HardHat },
  ];

  return (
    <section id="services" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('services.title') || 'Наші послуги'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('services.subtitle') || 'Ми пропонуємо повний спектр послуг з виробництва професійного одягу для різних галузей'}
          </p>

          {/* Контроли пошуку та фільтрації */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            
            {/* Пошук */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('services.search.placeholder') || 'Пошук послуг...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Переключення між рекомендованими та всіма */}
            <Button
              variant={showAllServices ? "solid" : "bordered"}
              color="primary"
              size="sm"
              onClick={() => setShowAllServices(!showAllServices)}
              className="whitespace-nowrap"
            >
              {showAllServices ? 
                (t('services.show.featured') || 'Показати рекомендовані') : 
                (t('services.show.all') || 'Показати всі')
              }
            </Button>
          </div>

          {/* Категорії */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Chip
                  key={category.key}
                  variant={selectedCategory === category.key ? "solid" : "bordered"}
                  color={selectedCategory === category.key ? "primary" : "default"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setSelectedCategory(category.key)}
                  startContent={IconComponent && <IconComponent className="w-4 h-4" />}
                >
                  {category.label}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {apiIsLoading && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" color="primary" />
            <span className="ml-3 text-gray-600">
              {t('services.loading') || 'Завантаження послуг...'}
            </span>
          </div>
        )}

        {/* Error State */}
        {apiError && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">
              {t('services.error') || 'Помилка завантаження послуг'}
            </p>
            <Button 
              color="primary" 
              variant="bordered"
              onClick={reloadServices}
              startContent={<ArrowRight className="w-4 h-4" />}
            >
              {t('common.retry') || 'Спробувати знову'}
            </Button>
          </div>
        )}

        {/* Services Grid */}
        {!apiIsLoading && !apiError && (
          <>
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 
                    (t('services.no_results') || 'Послуги не знайдено за вашим запитом') :
                    (t('services.no_services') || 'Немає послуг у цій категорії')
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleServices.map((service, index) => {
                  const IconComponent = getServiceIcon(service.icon);
                  
                  return (
                    <Card 
                      key={service.id} 
                      className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                      style={{ 
                        animationDelay: `${index * 150}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <CardBody className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.name}
                            </h3>
                            {service.is_featured && (
                              <Chip size="sm" color="success" variant="flat" className="mt-1">
                                {t('services.featured') || 'Рекомендовано'}
                              </Chip>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {service.short_description}
                        </p>

                        {/* Переваги */}
                        {service.benefits && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              {t('services.benefits') || 'Переваги:'}
                            </h4>
                            <ul className="space-y-1">
                              {service.benefits.slice(0, 3).map((benefit, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Інформація про замовлення */}
                        <div className="border-t border-gray-100 pt-4 mb-4">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>
                              {t('services.min_order') || 'Мін. замовлення:'} {service.min_order_quantity || 'За домовленістю'}
                            </span>
                            <span>
                              {service.production_time || '2-3 тижні'}
                            </span>
                          </div>
                        </div>

                        <Button
                          color="primary"
                          variant="flat"
                          className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all"
                          endContent={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                          onClick={() => scrollToSection?.('contact')}
                        >
                          {t('services.order_button') || 'Замовити послугу'}
                        </Button>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {t('services.custom.title') || 'Потрібне індивідуальне рішення?'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {t('services.custom.description') || 
            'Ми розробляємо індивідуальні рішення під ваші потреби. Зв\'яжіться з нами для консультації.'}
          </p>
          <Button
            color="primary"
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform"
            endContent={<ArrowRight className="w-5 h-5" />}
            onClick={() => scrollToSection?.('contact')}
          >
            {t('services.custom.button') || 'Обговорити проект'}
          </Button>
        </div>

        {/* Debug Info (тільки в режимі розробки) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <h4 className="font-semibold mb-2">🔧 Debug Info (ViewSets API):</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>API Status:</strong> {apiIsLoading ? 'Loading...' : 'Ready'}<br/>
                <strong>Services Count:</strong> {services.length}<br/>
                <strong>Featured Services:</strong> {apiFeaturedServices?.length || 0}
              </div>
              <div>
                <strong>Data Source:</strong> {
                  data?.services?.length ? 'Props' : 
                  apiServices?.length ? 'ViewSets API (All)' : 
                  apiFeaturedServices?.length ? 'ViewSets API (Featured)' : 
                  'Fallback'
                }<br/>
                <strong>Show All:</strong> {showAllServices ? 'Yes' : 'No'}<br/>
                <strong>Category:</strong> {selectedCategory}
              </div>
              <div>
                <strong>Search Query:</strong> {searchQuery || 'None'}<br/>
                <strong>Filtered Count:</strong> {filteredServices.length}<br/>
                {apiError && <span className="text-red-600"><strong>Error:</strong> {apiError}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS для анімацій */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;