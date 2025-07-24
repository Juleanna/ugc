// frontend/src/components/ServicesSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, Button, Spinner } from "@nextui-org/react";
import { 
  ShirtIcon, 
  HardHat, 
  Stethoscope, 
  GraduationCap, 
  ChefHat, 
  Shield,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Хуки
import { useTranslation } from '../hooks/useTranslation';
// ВИКОРИСТОВУЄМО UNIFIED API замість старого useEnhancedAPI
import { useServicesData } from '../hooks/useUnifiedAPI.jsx';

const ServicesSection = ({ data, scrollToSection }) => {
  const { t } = useTranslation();
  
  // ВИКОРИСТОВУЄМО UNIFIED API HOOK
  const { 
    data: apiServices, 
    isLoading: apiIsLoading, 
    error: apiError,
    reload: reloadServices 
  } = useServicesData();
  
  // Стан компонента
  const [visibleServices, setVisibleServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Об'єднання даних з різних джерел
  const services = useMemo(() => {
    // Пріоритет: props -> API -> defaultServices
    if (data?.services?.length > 0) {
      console.log('ServicesSection: використовуємо дані з props');
      return data.services;
    }
    
    if (apiServices?.length > 0) {
      console.log('ServicesSection: використовуємо дані з Unified API');
      return apiServices;
    }
    
    console.log('ServicesSection: використовуємо defaultServices як fallback');
    return getDefaultServices();
  }, [data?.services, apiServices]);

  // Дефолтні послуги як fallback
  const getDefaultServices = () => [
    {
      id: 1,
      title: t('services.corporate.title') || 'Корпоративний одяг',
      description: t('services.corporate.description') || 'Професійний одяг для офісу та бізнесу',
      icon: 'shirt',
      category: 'corporate',
      features: ['Індивідуальний дизайн', 'Високоякісні матеріали', 'Швидке виробництво'],
      price_range: 'від 800 грн'
    },
    {
      id: 2,
      title: t('services.safety.title') || 'Спецодяг і засоби захисту',
      description: t('services.safety.description') || 'Надійний захист для промисловості',
      icon: 'hard-hat',
      category: 'safety',
      features: ['Сертифіковані матеріали', 'ДСТУ стандарти', 'Тестування якості'],
      price_range: 'від 1200 грн'
    },
    {
      id: 3,
      title: t('services.medical.title') || 'Медичний одяг',
      description: t('services.medical.description') || 'Комфорт і гігієна для медперсоналу',
      icon: 'stethoscope',
      category: 'medical',
      features: ['Антибактеріальна обробка', 'Гіпоалергенні матеріали', 'Ергономічний крій'],
      price_range: 'від 600 грн'
    },
    {
      id: 4,
      title: t('services.education.title') || 'Шкільна форма',
      description: t('services.education.description') || 'Стильна і практична форма для учнів',
      icon: 'graduation-cap',
      category: 'education',
      features: ['Стійкі кольори', 'Міцні тканини', 'Зручний крій'],
      price_range: 'від 500 грн'
    },
    {
      id: 5,
      title: t('services.horeca.title') || 'Одяг для HoReCa',
      description: t('services.horeca.description') || 'Професійний одяг для ресторанів та готелів',
      icon: 'chef-hat',
      category: 'horeca',
      features: ['Термостійкі матеріали', 'Легке прання', 'Стильний дизайн'],
      price_range: 'від 700 грн'
    },
    {
      id: 6,
      title: t('services.security.title') || 'Форма охорони',
      description: t('services.security.description') || 'Впізнаваний і функціональний одяг для охорони',
      icon: 'shield',
      category: 'security',
      features: ['Функціональні кишені', 'Міцні застібки', 'Швидкосушний матеріал'],
      price_range: 'від 900 грн'
    }
  ];

  // Іконки для різних категорій
  const getServiceIcon = (iconName) => {
    const icons = {
      'shirt': ShirtIcon,
      'hard-hat': HardHat,
      'stethoscope': Stethoscope,
      'graduation-cap': GraduationCap,
      'chef-hat': ChefHat,
      'shield': Shield
    };
    return icons[iconName] || ShirtIcon;
  };

  // Категорії для фільтрування
  const categories = [
    { id: 'all', name: t('services.categories.all') || 'Всі послуги' },
    { id: 'corporate', name: t('services.categories.corporate') || 'Корпоративний' },
    { id: 'safety', name: t('services.categories.safety') || 'Спецодяг' },
    { id: 'medical', name: t('services.categories.medical') || 'Медичний' },
    { id: 'education', name: t('services.categories.education') || 'Освіта' },
    { id: 'horeca', name: t('services.categories.horeca') || 'HoReCa' },
    { id: 'security', name: t('services.categories.security') || 'Охорона' }
  ];

  // Фільтрація послуг за категорією
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') {
      return services;
    }
    return services.filter(service => service.category === selectedCategory);
  }, [services, selectedCategory]);

  // Ефект для анімації появи
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleServices(filteredServices.map((_, index) => index));
    }, 100);
    return () => clearTimeout(timer);
  }, [filteredServices]);

  // Обробка помилки API
  if (apiError && !data?.services?.length) {
    return (
      <section id="services" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Помилка завантаження</h3>
              <p className="text-red-600 mb-4">{apiError}</p>
              <Button 
                color="danger" 
                variant="flat" 
                onPress={reloadServices}
                className="mx-auto"
              >
                Спробувати знову
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        
        {/* Заголовок секції */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('services.title') || 'Наші послуги'}
            <br />
            <span className="text-gradient-blue">
              {t('services.subtitle') || 'для кожної галузі'}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.description') || 'Ми пропонуємо широкий спектр послуг з виробництва професійного одягу для різних сфер діяльності.'}
          </p>
        </div>

        {/* Категорії фільтрів */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "solid" : "flat"}
              color={selectedCategory === category.id ? "primary" : "default"}
              className={`transition-all ${
                selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'hover:bg-gray-100'
              }`}
              onPress={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Індикатор завантаження */}
        {apiIsLoading && !services.length && (
          <div className="text-center py-12">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600 mt-4">Завантаження послуг...</p>
          </div>
        )}

        {/* Сітка послуг */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredServices.map((service, index) => {
            const IconComponent = getServiceIcon(service.icon);
            
            return (
              <Card 
                key={service.id || index} 
                className={`hover-lift transition-all duration-500 ${
                  visibleServices.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <CardBody className="p-6">
                  
                  {/* Іконка та заголовок */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gradient-blue p-3 rounded-lg flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Особливості */}
                  {service.features && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ціна */}
                  {service.price_range && (
                    <div className="mb-4">
                      <span className="text-lg font-semibold text-blue-600">
                        {service.price_range}
                      </span>
                    </div>
                  )}

                  {/* Кнопка замовлення */}
                  <Button
                    color="primary"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    endContent={<ArrowRight className="w-4 h-4" />}
                    onPress={() => scrollToSection?.('contact')}
                  >
                    {t('services.order') || 'Замовити'}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Додаткова інформація */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('services.custom.title') || 'Індивідуальні рішення'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('services.custom.description') || 'Не знайшли те, що шукаєте? Ми розробляємо індивідуальні рішення під ваші потреби.'}
            </p>
            <Button
              color="primary"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              onPress={() => scrollToSection?.('contact')}
            >
              {t('services.custom.button') || 'Обговорити проект'}
            </Button>
          </div>
        </div>

        {/* Статистика API (тільки в режимі розробки) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              📊 API Status: {apiIsLoading ? 'Loading...' : 'Ready'} | 
              Services: {services.length} | 
              Source: {data?.services?.length ? 'Props' : apiServices?.length ? 'Unified API' : 'Fallback'}
              {apiError && ` | Error: ${apiError}`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;