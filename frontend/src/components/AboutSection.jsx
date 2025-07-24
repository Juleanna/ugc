// frontend/src/components/AboutSection.jsx
// Адаптовано для ViewSets архітектури з повною підтримкою API

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, Chip, Spinner, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/react";
import { 
  Shield, 
  Award, 
  Users, 
  Target,
  Clock,
  Star,
  TrendingUp,
  Heart,
  AlertCircle,
  Trophy,
  Building,
  CheckCircle,
  Eye,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';

// Хуки для ViewSets API
import { useTranslation } from '../hooks/useTranslation';
import { useHomepageData, useTeamData } from '../hooks/useUnifiedAPI.jsx';

const AboutSection = ({ data, scrollToSection }) => {
  const { t } = useTranslation();
  
  // ViewSets API хуки
  const { 
    data: homepageData, 
    isLoading: homepageLoading, 
    error: homepageError,
    reload: reloadHomepage 
  } = useHomepageData();
  
  const { 
    data: teamMembers, 
    managementData: managementTeam,
    isLoading: teamLoading, 
    error: teamError,
    reload: reloadTeam 
  } = useTeamData();

  // Локальний стан
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [visiblePhotos, setVisiblePhotos] = useState(6);
  
  // Modal для деталей
  const { isOpen: isTeamModalOpen, onOpen: onTeamModalOpen, onClose: onTeamModalClose } = useDisclosure();
  const { isOpen: isCertModalOpen, onOpen: onCertModalOpen, onClose: onCertModalClose } = useDisclosure();

  // Об'єднання даних з різних джерел
  const aboutData = useMemo(() => {
    // Пріоритет: props -> ViewSets API -> fallback
    const sourceData = data || homepageData || {};
    
    return {
      title: sourceData.about_title || t('about.title') || 'Про нашу компанію',
      subtitle: sourceData.about_subtitle || t('about.subtitle') || 'Наш багаторічний досвід гарантує якість',
      description: sourceData.about_description || t('about.description') || 
        'Ми створюємо одяг, який забезпечує безпеку і комфорт у будь-яких умовах. Наша продукція відповідає найвищим стандартам якості.',
      mission: sourceData.mission_text || t('about.mission') || 
        'Наша місія – забезпечити працівників якісним, зручним та безпечним професійним одягом.',
      vision: sourceData.vision_text || t('about.vision') || 
        'Стати провідним виробником професійного одягу в Україні та Східній Європі.',
      values: sourceData.values_text || t('about.values') || 
        'Якість, надійність, інновації та відповідальність – основа нашої роботи.',
      features: getFeatures(sourceData),
      stats: sourceData.stats || getDefaultStats(),
      achievements: getCertificates(sourceData),
      team: getTeamData(),
      productionPhotos: getProductionPhotos(sourceData)
    };
  }, [data, homepageData, teamMembers, managementTeam, t]);

  // Отримання даних команди
  const getTeamData = () => {
    if (managementTeam?.length > 0) {
      return managementTeam.slice(0, 6); // Показуємо топ-6 керівників
    }
    if (teamMembers?.length > 0) {
      return teamMembers.filter(member => member.is_management).slice(0, 6);
    }
    return getDefaultTeam();
  };

  // Отримання сертифікатів з API даних
  const getCertificates = (sourceData) => {
    if (sourceData.certificates?.length > 0) {
      return sourceData.certificates.map(cert => ({
        id: cert.id,
        title: cert.title,
        description: cert.description,
        year: new Date(cert.issued_date).getFullYear(),
        image: cert.image,
        organization: cert.issuing_organization,
        url: cert.certificate_url
      }));
    }
    return getDefaultAchievements();
  };

  // Отримання фото виробництва
  const getProductionPhotos = (sourceData) => {
    if (sourceData.production_photos?.length > 0) {
      return sourceData.production_photos.map(photo => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        image: photo.image,
        is_featured: photo.is_featured
      }));
    }
    return getDefaultProductionPhotos();
  };

  // Отримання особливостей
  const getFeatures = (sourceData) => {
    // Якщо є дані з API, використовуємо їх
    if (sourceData.features?.length > 0) {
      return sourceData.features;
    }
    
    // Інакше генеруємо на основі статистики та стандартних особливостей
    return getDefaultFeatures();
  };

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
    experience: '10+',
    projects: '150+',
    clients: '95+',
    employees: '25+',
    support: '24/7'
  });

  // Дефолтні досягнення
  const getDefaultAchievements = () => [
    {
      id: 1,
      title: 'ISO 9001:2015',
      description: 'Сертифікат системи управління якістю',
      year: 2023,
      organization: 'Міжнародна організація стандартизації'
    },
    {
      id: 2,
      title: 'Найкращий постачальник',
      description: 'Нагорода від державних підприємств',
      year: 2024,
      organization: 'Міністерство економіки України'
    },
    {
      id: 3,
      title: 'Еко-сертифікація',
      description: 'Використання екологічно чистих матеріалів',
      year: 2024,
      organization: 'Екологічна сертифікація України'
    }
  ];

  // Дефолтна команда
  const getDefaultTeam = () => [
    {
      id: 1,
      name: 'Олександр Петренко',
      position: 'Генеральний директор',
      bio: 'Понад 15 років досвіду в текстильній промисловості',
      photo: '/images/team/director.jpg',
      email: 'director@company.com'
    },
    {
      id: 2,
      name: 'Марія Іваненко',
      position: 'Головний технолог',
      bio: 'Експерт з розробки та впровадження нових технологій',
      photo: '/images/team/technologist.jpg',
      email: 'tech@company.com'
    },
    {
      id: 3,
      name: 'Сергій Коваленко',
      position: 'Менеджер з якості',
      bio: 'Забезпечує високі стандарти якості продукції',
      photo: '/images/team/quality.jpg',
      email: 'quality@company.com'
    }
  ];

  // Дефолтні фото виробництва
  const getDefaultProductionPhotos = () => [
    {
      id: 1,
      title: 'Сучасне обладнання',
      description: 'Використовуємо найновіше обладнання для виробництва',
      image: '/images/production/equipment.jpg',
      is_featured: true
    },
    {
      id: 2,
      title: 'Контроль якості',
      description: 'Перевірка кожного виробу перед відправкою',
      image: '/images/production/quality.jpg',
      is_featured: true
    },
    {
      id: 3,
      title: 'Складські приміщення',
      description: 'Просторі склади для зберігання готової продукції',
      image: '/images/production/warehouse.jpg',
      is_featured: false
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
      'trending-up': TrendingUp,
      'building': Building,
      'check-circle': CheckCircle
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
      'pink': 'from-pink-500 to-pink-600',
      'yellow': 'from-yellow-500 to-yellow-600',
      'indigo': 'from-indigo-500 to-indigo-600'
    };
    return colors[color] || 'from-blue-500 to-blue-600';
  };

  // Обробники для модалів
  const handleTeamMemberClick = (member) => {
    setSelectedTeamMember(member);
    onTeamModalOpen();
  };

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(certificate);
    onCertModalOpen();
  };

  // Loading state
  if (homepageLoading || teamLoading) {
    return (
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="primary" />
            <span className="ml-4 text-lg text-gray-600">
              {t('about.loading') || 'Завантаження інформації...'}
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (homepageError && !data) {
    return (
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {t('about.error.title') || 'Помилка завантаження'}
              </h3>
              <p className="text-red-600 mb-4">
                {homepageError || t('about.error.message') || 'Не вдалося завантажити інформацію про компанію'}
              </p>
              <Button 
                color="danger" 
                variant="bordered"
                onClick={reloadHomepage}
                startContent={<ArrowRight className="w-4 h-4" />}
              >
                {t('common.retry') || 'Спробувати знову'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {aboutData.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {aboutData.subtitle}
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            {aboutData.description}
          </p>
        </div>

        {/* Статистика */}
        {aboutData.stats && (
          <div className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Object.entries(aboutData.stats).map(([key, value], index) => (
                <div key={key} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {value}
                  </div>
                  <div className="text-gray-600 text-sm uppercase tracking-wide">
                    {t(`about.stats.${key}`) || key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Особливості */}
        {aboutData.features && aboutData.features.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              {t('about.features.title') || 'Наші переваги'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aboutData.features.map((feature) => {
                const IconComponent = getFeatureIcon(feature.icon);
                const iconColorClass = getIconColor(feature.color);
                
                return (
                  <Card 
                    key={feature.id} 
                    className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                  >
                    <CardBody className="p-6 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${iconColorClass} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Місія, Візія, Цінності */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardBody className="p-6 text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {t('about.mission.title') || 'Наша місія'}
                </h4>
                <p className="text-gray-700">
                  {aboutData.mission}
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardBody className="p-6 text-center">
                <Eye className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {t('about.vision.title') || 'Наше бачення'}
                </h4>
                <p className="text-gray-700">
                  {aboutData.vision}
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardBody className="p-6 text-center">
                <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {t('about.values.title') || 'Наші цінності'}
                </h4>
                <p className="text-gray-700">
                  {aboutData.values}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Команда */}
        {aboutData.team && aboutData.team.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              {t('about.team.title') || 'Наша команда'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aboutData.team.map((member) => (
                <Card 
                  key={member.id} 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleTeamMemberClick(member)}
                >
                  <CardBody className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {member.photo ? (
                        <img 
                          src={member.photo} 
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-blue-600 font-medium mb-3">
                        {member.position}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {member.bio}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {teamError && (
              <div className="text-center mt-6">
                <p className="text-orange-600 text-sm mb-2">
                  {t('about.team.api_error') || 'Помилка завантаження команди з API'}
                </p>
                <Button size="sm" variant="bordered" onClick={reloadTeam}>
                  {t('common.retry') || 'Спробувати знову'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Досягнення та сертифікати */}
        {aboutData.achievements && aboutData.achievements.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              {t('about.achievements.title') || 'Наші досягнення'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {aboutData.achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className="text-center hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleCertificateClick(achievement)}
                >
                  <CardBody className="p-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {achievement.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Chip size="sm" variant="flat" color="primary">
                        <Calendar className="w-3 h-3 mr-1" />
                        {achievement.year}
                      </Chip>
                      {achievement.organization && (
                        <Chip size="sm" variant="flat" color="secondary">
                          <Building className="w-3 h-3 mr-1" />
                          {achievement.organization.length > 15 ? 
                            `${achievement.organization.substring(0, 15)}...` : 
                            achievement.organization
                          }
                        </Chip>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Фото виробництва */}
        {aboutData.productionPhotos && aboutData.productionPhotos.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              {t('about.production.title') || 'Наше виробництво'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutData.productionPhotos.slice(0, visiblePhotos).map((photo) => (
                <Card key={photo.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <CardBody className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {photo.image ? (
                        <img 
                          src={photo.image} 
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {photo.is_featured && (
                        <Chip 
                          size="sm" 
                          color="primary" 
                          className="absolute top-2 right-2"
                          startContent={<Star className="w-3 h-3" />}
                        >
                          {t('about.production.featured') || 'Рекомендовано'}
                        </Chip>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {photo.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {photo.description}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {aboutData.productionPhotos.length > visiblePhotos && (
              <div className="text-center mt-8">
                <Button
                  variant="bordered"
                  onClick={() => setVisiblePhotos(prev => prev + 6)}
                  endContent={<ArrowRight className="w-4 h-4" />}
                >
                  {t('about.production.show_more') || 'Показати більше'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Заклик до дії */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
            <CardBody className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('about.cta.title') || 'Готові працювати з професіоналами?'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {t('about.cta.description') || 'Наш досвід та якість говорять самі за себе. Дозвольте нам створити ідеальний одяг для вашої організації.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  color="primary"
                  size="lg"
                  onClick={() => scrollToSection?.('projects')}
                  endContent={<ArrowRight className="w-5 h-5" />}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {t('about.cta.projects') || 'Переглянути проєкти'}
                </Button>
                <Button
                  variant="bordered"
                  size="lg"
                  onClick={() => scrollToSection?.('contact')}
                  startContent={<Users className="w-5 h-5" />}
                >
                  {t('about.cta.contact') || 'Зв\'язатися з нами'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Modal для деталей команди */}
        <Modal 
          isOpen={isTeamModalOpen} 
          onClose={onTeamModalClose}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              {selectedTeamMember?.name}
            </ModalHeader>
            <ModalBody className="pb-6">
              {selectedTeamMember && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                      {selectedTeamMember.photo ? (
                        <img 
                          src={selectedTeamMember.photo} 
                          alt={selectedTeamMember.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {selectedTeamMember.name}
                      </h4>
                      <p className="text-blue-600 font-medium">
                        {selectedTeamMember.position}
                      </p>
                      {selectedTeamMember.email && (
                        <a 
                          href={`mailto:${selectedTeamMember.email}`}
                          className="text-gray-500 text-sm hover:text-blue-600 transition-colors"
                        >
                          {selectedTeamMember.email}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      {t('about.team.bio') || 'Біографія'}
                    </h5>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedTeamMember.bio}
                    </p>
                  </div>

                  {selectedTeamMember.linkedin && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">
                        {t('about.team.contacts') || 'Контакти'}
                      </h5>
                      <a 
                        href={selectedTeamMember.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        LinkedIn профіль
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal для деталей сертифіката */}
        <Modal 
          isOpen={isCertModalOpen} 
          onClose={onCertModalClose}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-600" />
              {selectedCertificate?.title}
            </ModalHeader>
            <ModalBody className="pb-6">
              {selectedCertificate && (
                <div className="space-y-4">
                  {selectedCertificate.image && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={selectedCertificate.image} 
                        alt={selectedCertificate.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      {t('about.achievements.description') || 'Опис'}
                    </h5>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedCertificate.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="font-medium text-gray-700 mb-1">
                        {t('about.achievements.year') || 'Рік отримання'}
                      </h6>
                      <p className="text-gray-600">{selectedCertificate.year}</p>
                    </div>
                    
                    {selectedCertificate.organization && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">
                          {t('about.achievements.organization') || 'Організація'}
                        </h6>
                        <p className="text-gray-600">{selectedCertificate.organization}</p>
                      </div>
                    )}
                  </div>

                  {selectedCertificate.url && (
                    <div className="pt-4 border-t">
                      <a 
                        href={selectedCertificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {t('about.achievements.view_certificate') || 'Переглянути сертифікат'}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Debug Info (тільки в режимі розробки) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-16 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <h4 className="font-semibold mb-2">🔧 Debug Info (AboutSection ViewSets):</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Homepage Loading:</strong> {homepageLoading ? 'Yes' : 'No'}<br/>
                <strong>Team Loading:</strong> {teamLoading ? 'Yes' : 'No'}<br/>
                <strong>Data Source:</strong> {
                  data ? 'Props' : 
                  homepageData ? 'ViewSets API' : 
                  'Fallback'
                }
              </div>
              <div>
                <strong>Team Members:</strong> {aboutData.team?.length || 0}<br/>
                <strong>Achievements:</strong> {aboutData.achievements?.length || 0}<br/>
                <strong>Production Photos:</strong> {aboutData.productionPhotos?.length || 0}
              </div>
              <div>
                <strong>Features:</strong> {aboutData.features?.length || 0}<br/>
                <strong>Visible Photos:</strong> {visiblePhotos}<br/>
                {(homepageError || teamError) && (
                  <span className="text-red-600">
                    <strong>Errors:</strong> {[homepageError, teamError].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS для анімацій */}
      <style jsx>{`
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

export default AboutSection;