// frontend/src/components/ServicesSection.jsx
// Виправлена версія без jsx атрибуту та з правильними стилями

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
      benefits: ['Антибактеріальні тканини', 'Зручний дизайн', 'Гіпоалергенні матеріали'],
      min_order_quantity: 5,
      production_time: '1-2 тижні'
    },
    {
      id: 3,
      name: t('services.school.title') || 'Шкільна форма',
      short_description: t('services.school.description') || 'Стильна та зручна форма для навчальних закладів',
      icon: 'graduation-cap',
      main_image: '/images/services/school.jpg',
      is_featured: false,
      benefits: ['Міцні тканини', 'Різноманітні розміри', 'Доступні ціни'],
      min_order_quantity: 20,
      production_time: '3-4 тижні'
    },
    {
      id: 4,
      name: t('services.chef.title') || 'Кухарський одяг',
      short_description: t('services.chef.description') || 'Професійний одяг для працівників ресторанів',
      icon: 'chef-hat',
      main_image: '/images/services/chef.jpg',
      is_featured: false,
      benefits: ['Вогнестійкі матеріали', 'Легке прання', 'Ергономічний крій'],
      min_order_quantity: 10,
      production_time: '2-3 тижні'
    },
    {
      id: 5,
      name: t('services.safety.title') || 'Захисний одяг',
      short_description: t('services.safety.description') || 'Спеціалізований одяг для небезпечних умов праці',
      icon: 'shield',
      main_image: '/images/services/safety.jpg',
      is_featured: true,
      benefits: ['Високий рівень захисту', 'Сертифіковані матеріали', 'Відповідність стандартам'],
      min_order_quantity: 5,
      production_time: '2-4 тижні'
    },
    {
      id: 6,
      name: t('services.construction.title') || 'Будівельний одяг',
      short_description: t('services.construction.description') || 'Міцний та зручний одяг для будівельників',
      icon: 'hard-hat',
      main_image: '/images/services/construction.jpg',
      is_featured: false,
      benefits: ['Підвищена міцність', 'Вологостійкість', 'Світловідбиваючі елементи'],
      min_order_quantity: 15,
      production_time: '3-4 тижні'
    }
  ];

  // Об'єднання даних з різних джерел
  const services = useMemo(() => {
    console.log('ServicesSection: Combining data sources', {
      hasPropsData: !!data?.services?.length,
      hasApiData: !!apiServices?.length,
      hasFeaturedData: !!apiFeaturedServices?.length
    });

    if (data?.services?.length > 0) {
      return data.services;
    } else if (apiServices?.length > 0) {
      return apiServices;
    } else if (apiFeaturedServices?.length > 0) {
      return apiFeaturedServices;
    } else {
      return getDefaultServices();
    }
  }, [data?.services, apiServices, apiFeaturedServices]);

  // Категорії послуг
  const categories = [
    { key: 'all', label: t('services.categories.all') || 'Всі послуги', icon: null },
    { key: 'corporate', label: t('services.categories.corporate') || 'Корпоративний', icon: ShirtIcon },
    { key: 'medical', label: t('services.categories.medical') || 'Медичний', icon: Stethoscope },
    { key: 'education', label: t('services.categories.education') || 'Освіта', icon: GraduationCap },
    { key: 'hospitality', label: t('services.categories.hospitality') || 'Ресторани', icon: ChefHat },
    { key: 'safety', label: t('services.categories.safety') || 'Захисний', icon: Shield },
    { key: 'construction', label: t('services.categories.construction') || 'Будівництво', icon: HardHat }
  ];

  // Фільтрація послуг
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Фільтр за категорією
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => 
        service.category === selectedCategory ||
        service.name.toLowerCase().includes(selectedCategory) ||
        service.short_description?.toLowerCase().includes(selectedCategory)
      );
    }

    // Фільтр за пошуковим запитом
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.short_description?.toLowerCase().includes(query) ||
        service.benefits?.some(benefit => 
          benefit.toLowerCase().includes(query)
        )
      );
    }

    // Показувати тільки рекомендовані або всі
    if (!showAllServices) {
      filtered = filtered.filter(service => service.is_featured);
    }

    return filtered;
  }, [services, selectedCategory, searchQuery, showAllServices]);

  // Оновлення видимих послуг
  useEffect(() => {
    setVisibleServices(filteredServices);
  }, [filteredServices]);

  // Отримання іконки для послуги
  const getServiceIcon = (iconName) => {
    const icons = {
      shirt: ShirtIcon,
      'hard-hat': HardHat,
      stethoscope: Stethoscope,
      'graduation-cap': GraduationCap,
      'chef-hat': ChefHat,
      shield: Shield
    };
    
    return icons[iconName] || ShirtIcon;
  };

  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('services.title') || 'Наші послуги'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('services.subtitle') || 'Ми пропонуємо широкий спектр послуг з виробництва професійного одягу'}
          </p>

          {/* Кнопка перемикання */}
          <div className="flex justify-center mb-8">
            <Button
              color={showAllServices ? "default" : "primary"}
              variant={showAllServices ? "bordered" : "solid"}
              onClick={() => setShowAllServices(!showAllServices)}
              className="transition-all duration-300"
              startContent={<Filter className="w-4 h-4" />}
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
                      className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group service-card"
                      style={{ 
                        animationDelay: `${index * 150}ms`,
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
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Додаткова інформація */}
                        <div className="text-xs text-gray-500 mb-4 space-y-1">
                          {service.min_order_quantity && (
                            <div>
                              {t('services.min_order') || 'Мін. замовлення:'} {service.min_order_quantity} {t('services.pieces') || 'шт.'}
                            </div>
                          )}
                          {service.production_time && (
                            <div>
                              {t('services.production_time') || 'Час виробництва:'} {service.production_time}
                            </div>
                          )}
                        </div>

                        {/* Кнопка дії - БЕЗ вкладених кнопок */}
                        <div 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-center cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                          onClick={() => scrollToSection?.('contact')}
                        >
                          <span>{t('services.get_quote') || 'Отримати пропозицію'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Кастомізовані рішення */}
        <div className="text-center mt-16 p-8 bg-white rounded-xl shadow-lg">
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
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
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

      {/* ВИПРАВЛЕНО: CSS без jsx атрибуту */}
      <style>{`
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
        
        .service-card {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .section-padding {
          padding: 5rem 1.5rem;
        }
        
        .container-custom {
          max-width: 1280px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .section-padding {
            padding: 3rem 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;