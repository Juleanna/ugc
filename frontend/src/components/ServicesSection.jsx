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
  CheckCircle
} from 'lucide-react';

// Хуки
import { useTranslation } from '../hooks/useTranslation';
import { useFeaturedServices } from '../hooks/useEnhancedAPI';

const ServicesSection = ({ data, scrollToSection }) => {
  const { t } = useTranslation();
  const { services: apiServices, isLoading: apiIsLoading, error: apiError } = useFeaturedServices();
  
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
      console.log('ServicesSection: використовуємо дані з API');
      return apiServices;
    }
    
    console.log('ServicesSection: data.services порожній, використовуємо defaultServices');
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
      features: ['Індивідуальний дизайн', 'Якісні матеріали', 'Швидке виготовлення'],
      price_from: 'від 1500 грн'
    },
    {
      id: 2,
      title: t('services.medical.title') || 'Медичний одяг',
      description: t('services.medical.description') || 'Спеціалізований одяг для медичних працівників',
      icon: 'stethoscope',
      category: 'medical',
      features: ['Антибактеріальні тканини', 'Зручний крій', 'Довговічність'],
      price_from: 'від 800 грн'
    },
    {
      id: 3,
      title: t('services.industrial.title') || 'Робочий одяг',
      description: t('services.industrial.description') || 'Захисний одяг для промисловості',
      icon: 'hardhat',
      category: 'industrial',
      features: ['Підвищена міцність', 'Захисні властивості', 'Сертифікація'],
      price_from: 'від 1200 грн'
    },
    {
      id: 4,
      title: t('services.education.title') || 'Шкільна форма',
      description: t('services.education.description') || 'Якісна шкільна форма для учнів',
      icon: 'graduation-cap',
      category: 'education',
      features: ['Різні розміри', 'Комфортна носка', 'Доступні ціни'],
      price_from: 'від 600 грн'
    },
    {
      id: 5,
      title: t('services.hospitality.title') || 'Одяг для HoReCa',
      description: t('services.hospitality.description') || 'Професійний одяг для ресторанів та готелів',
      icon: 'chef-hat',
      category: 'hospitality',
      features: ['Стильний дизайн', 'Практичність', 'Легкий догляд'],
      price_from: 'від 900 грн'
    },
    {
      id: 6,
      title: t('services.security.title') || 'Форма безпеки',
      description: t('services.security.description') || 'Спеціалізований одяг для служб безпеки',
      icon: 'shield',
      category: 'security',
      features: ['Функціональність', 'Професійний вигляд', 'Міцність'],
      price_from: 'від 1100 грн'
    }
  ];

  // Іконки для категорій
  const getServiceIcon = (iconName) => {
    const icons = {
      'shirt': ShirtIcon,
      'stethoscope': Stethoscope,
      'hardhat': HardHat,
      'graduation-cap': GraduationCap,
      'chef-hat': ChefHat,
      'shield': Shield
    };
    return icons[iconName] || ShirtIcon;
  };

  // Категорії послуг
  const categories = [
    { id: 'all', name: t('services.categories.all') || 'Всі послуги' },
    { id: 'corporate', name: t('services.categories.corporate') || 'Корпоративний' },
    { id: 'medical', name: t('services.categories.medical') || 'Медичний' },
    { id: 'industrial', name: t('services.categories.industrial') || 'Робочий' },
    { id: 'education', name: t('services.categories.education') || 'Освіта' },
    { id: 'hospitality', name: t('services.categories.hospitality') || 'HoReCa' },
    { id: 'security', name: t('services.categories.security') || 'Безпека' }
  ];

  // Фільтровані послуги
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return services;
    return services.filter(service => service.category === selectedCategory);
  }, [services, selectedCategory]);

  // Анімація появи сервісів
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleServices(filteredServices.map((_, index) => index));
    }, 100);
    return () => clearTimeout(timer);
  }, [filteredServices]);

  // Компонент завантаження
  if (apiIsLoading) {
    return (
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">
              {t('services.loading') || 'Завантаження послуг...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Компонент помилки
  if (apiError && services.length === 0) {
    return (
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">
              {t('services.error') || 'Помилка завантаження послуг'}
            </h3>
            <p className="text-red-600">
              {apiError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Заголовок секції */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('services.title') || 'Наші послуги'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.subtitle') || 'Ми пропонуємо широкий спектр послуг з виготовлення професійного одягу для різних сфер діяльності'}
          </p>
        </div>

        {/* Фільтри категорій */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "solid" : "bordered"}
              color={selectedCategory === category.id ? "primary" : "default"}
              size="sm"
              onPress={() => setSelectedCategory(category.id)}
              className="transition-all duration-300"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Сітка послуг */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => {
            const IconComponent = getServiceIcon(service.icon);
            const isVisible = visibleServices.includes(index);
            
            return (
              <Card
                key={service.id}
                className={`group hover:shadow-xl transition-all duration-500 border-0 ${
                  isVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                }}
              >
                <CardBody className="p-8">
                  
                  {/* Іконка і категорія */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    
                    {service.price_from && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {t('services.price_from') || 'Ціна'}
                        </div>
                        <div className="text-lg font-semibold text-blue-600">
                          {service.price_from}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Назва і опис */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Особливості */}
                  {service.features && service.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        {t('services.features') || 'Особливості:'}
                      </h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Кнопка дії */}
                  <Button
                    color="primary"
                    variant="bordered"
                    className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
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
      </div>
    </section>
  );
};

export default ServicesSection;