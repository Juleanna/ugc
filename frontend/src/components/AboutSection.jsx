// frontend/src/components/AboutSection.jsx
// Виправлена версія з правильним порядком функцій

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

  // ВАЖЛИВО: Всі допоміжні функції оголошуємо ДО useMemo
  
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
      title: t('about.features.experience.title') || 'Досвід',
      description: t('about.features.experience.description') || 'Понад 10 років у сфері професійного одягу',
      color: 'purple'
    },
    {
      id: 4,
      icon: 'target',
      title: t('about.features.precision.title') || 'Точність',
      description: t('about.features.precision.description') || 'Індивідуальний підхід до кожного замовлення',
      color: 'red'
    }
  ];

  // Дефолтна статистика
  const getDefaultStats = () => ({
    years_experience: 10,
    satisfied_clients: 95,
    total_projects: 150,
    team_members: 25,
    services_count: 8
  });

  // Дефолтні досягнення
  const getDefaultAchievements = () => [
    {
      id: 1,
      title: 'ISO 9001:2015',
      description: 'Сертифікат системи управління якістю',
      year: 2023,
      image: '/images/certificates/iso-9001.jpg',
      organization: 'TÜV AUSTRIA'
    },
    {
      id: 2,
      title: 'Сертифікат відповідності ЄС',
      description: 'Відповідність європейським стандартам',
      year: 2023,
      image: '/images/certificates/ce-marking.jpg',
      organization: 'EU Conformity'
    }
  ];

  // Дефолтна команда
  const getDefaultTeam = () => [
    {
      id: 1,
      name: 'Олександр Петренко',
      position: 'Генеральний директор',
      image: '/images/team/director.jpg',
      experience: '15 років',
      description: 'Очолює компанію з моменту заснування'
    },
    {
      id: 2,
      name: 'Марія Коваленко',
      position: 'Головний технолог',
      image: '/images/team/technologist.jpg',
      experience: '12 років',
      description: 'Відповідає за розробку нових видів продукції'
    }
  ];

  // Дефолтні фото виробництва
  const getDefaultProductionPhotos = () => [
    {
      id: 1,
      title: 'Виробничий цех',
      description: 'Сучасне обладнання для пошиття',
      image: '/images/production/workshop.jpg',
      is_featured: true
    },
    {
      id: 2,
      title: 'Контроль якості',
      description: 'Перевірка кожного виробу',
      image: '/images/production/quality-control.jpg',
      is_featured: false
    }
  ];

  // Отримання особливостей
  const getFeatures = (sourceData) => {
    // Якщо є дані з API, використовуємо їх
    if (sourceData.features?.length > 0) {
      return sourceData.features;
    }
    
    // Інакше генеруємо на основі статистики та стандартних особливостей
    return getDefaultFeatures();
  };

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

  // Об'єднання даних з різних джерел - тепер усі функції доступні
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
        'Стати провідним виробником професійного одягу в Україні та Східній Европі.',
      values: sourceData.values_text || t('about.values') || 
        'Якість, надійність, інновації та відповідальність – основа нашої роботи.',
      features: getFeatures(sourceData),
      stats: sourceData.stats || getDefaultStats(),
      achievements: getCertificates(sourceData),
      team: getTeamData(),
      productionPhotos: getProductionPhotos(sourceData)
    };
  }, [data, homepageData, teamMembers, managementTeam, t]);

  // Обробники подій
  const handleTeamMemberClick = (member) => {
    setSelectedTeamMember(member);
    onTeamModalOpen();
  };

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(certificate);
    onCertModalOpen();
  };

  const handleShowMorePhotos = () => {
    setVisiblePhotos(prev => prev + 6);
  };

  // Отримання іконки для особливості
  const getFeatureIcon = (iconName) => {
    const icons = {
      shield: Shield,
      award: Award,
      users: Users,
      target: Target,
      clock: Clock,
      star: Star,
      trending: TrendingUp,
      heart: Heart,
      trophy: Trophy,
      building: Building,
      check: CheckCircle
    };
    
    const IconComponent = icons[iconName] || Shield;
    return <IconComponent className="w-8 h-8" />;
  };

  // Стан завантаження
  if (homepageLoading && !data) {
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

  // Стан помилки
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
                <div key={key} className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                    {key.includes('clients') && '%'}
                    {key.includes('experience') && '+'}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {t(`about.stats.${key}`) || key.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Особливості */}
        {aboutData.features && aboutData.features.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-10">
              {t('about.features.title') || 'Наші переваги'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aboutData.features.map((feature, index) => (
                <Card key={feature.id || index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardBody className="text-center">
                    <div className={`inline-flex p-3 rounded-full mb-4 ${
                      feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      feature.color === 'green' ? 'bg-green-100 text-green-600' :
                      feature.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      feature.color === 'red' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getFeatureIcon(feature.icon)}
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Місія, Бачення, Цінності */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardBody>
                <div className="flex items-center mb-4">
                  <Target className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="text-lg font-semibold">
                    {t('about.mission.title') || 'Місія'}
                  </h4>
                </div>
                <p className="text-gray-600">{aboutData.mission}</p>
              </CardBody>
            </Card>

            <Card className="p-6">
              <CardBody>
                <div className="flex items-center mb-4">
                  <Eye className="w-6 h-6 text-green-600 mr-3" />
                  <h4 className="text-lg font-semibold">
                    {t('about.vision.title') || 'Бачення'}
                  </h4>
                </div>
                <p className="text-gray-600">{aboutData.vision}</p>
              </CardBody>
            </Card>

            <Card className="p-6">
              <CardBody>
                <div className="flex items-center mb-4">
                  <Heart className="w-6 h-6 text-purple-600 mr-3" />
                  <h4 className="text-lg font-semibold">
                    {t('about.values.title') || 'Цінності'}
                  </h4>
                </div>
                <p className="text-gray-600">{aboutData.values}</p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Команда */}
        {aboutData.team && aboutData.team.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-10">
              {t('about.team.title') || 'Наша команда'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutData.team.map((member, index) => (
                <Card 
                  key={member.id || index} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleTeamMemberClick(member)}
                >
                  <CardBody className="text-center">
                    {member.image && (
                      <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gray-200">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/team/default-avatar.jpg';
                          }}
                        />
                      </div>
                    )}
                    <h4 className="text-lg font-semibold mb-1">{member.name}</h4>
                    <p className="text-blue-600 text-sm mb-2">{member.position}</p>
                    {member.experience && (
                      <Chip size="sm" variant="flat" color="primary">
                        {member.experience}
                      </Chip>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Досягнення та сертифікати */}
        {aboutData.achievements && aboutData.achievements.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-10">
              {t('about.achievements.title') || 'Сертифікати та досягнення'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutData.achievements.map((achievement, index) => (
                <Card 
                  key={achievement.id || index}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCertificateClick(achievement)}
                >
                  <CardBody>
                    {achievement.image && (
                      <div className="h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={achievement.image} 
                          alt={achievement.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/certificates/default-certificate.jpg';
                          }}
                        />
                      </div>
                    )}
                    <h4 className="text-lg font-semibold mb-2">{achievement.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {achievement.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Chip size="sm" variant="flat" color="success">
                        {achievement.year}
                      </Chip>
                      {achievement.organization && (
                        <span className="text-xs text-gray-500">
                          {achievement.organization}
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Виробничі фото */}
        {aboutData.productionPhotos && aboutData.productionPhotos.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-10">
              {t('about.production.title') || 'Наше виробництво'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutData.productionPhotos.slice(0, visiblePhotos).map((photo, index) => (
                <Card key={photo.id || index} className="overflow-hidden">
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img 
                      src={photo.image} 
                      alt={photo.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/images/production/default-production.jpg';
                      }}
                    />
                  </div>
                  <CardBody>
                    <h4 className="text-lg font-semibold mb-2">{photo.title}</h4>
                    <p className="text-gray-600 text-sm">{photo.description}</p>
                    {photo.is_featured && (
                      <Chip size="sm" variant="flat" color="warning" className="mt-2">
                        {t('about.production.featured') || 'Рекомендоване'}
                      </Chip>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
            
            {aboutData.productionPhotos.length > visiblePhotos && (
              <div className="text-center mt-8">
                <Button 
                  variant="bordered" 
                  color="primary"
                  onClick={handleShowMorePhotos}
                >
                  {t('about.production.show_more') || 'Показати більше'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* CTA секція */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
          <h3 className="text-2xl font-bold mb-4">
            {t('about.cta.title') || 'Готові розпочати співпрацю?'}
          </h3>
          <p className="text-lg mb-6 opacity-90">
            {t('about.cta.description') || 'Зв\'яжіться з нами для обговорення вашого проекту'}
          </p>
          <Button 
            size="lg" 
            color="default" 
            variant="solid"
            onClick={() => scrollToSection('contact')}
            startContent={<ArrowRight className="w-5 h-5" />}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            {t('about.cta.button') || 'Зв\'язатися з нами'}
          </Button>
        </div>

        {/* Модальне вікно для деталей команди */}
        <Modal 
          isOpen={isTeamModalOpen} 
          onClose={onTeamModalClose}
          size="lg"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">
                {t('about.team.details') || 'Деталі співробітника'}
              </h3>
            </ModalHeader>
            <ModalBody className="pb-6">
              {selectedTeamMember && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {selectedTeamMember.image && (
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        <img 
                          src={selectedTeamMember.image} 
                          alt={selectedTeamMember.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-semibold">{selectedTeamMember.name}</h4>
                      <p className="text-blue-600">{selectedTeamMember.position}</p>
                      {selectedTeamMember.experience && (
                        <Chip size="sm" variant="flat" color="primary">
                          {selectedTeamMember.experience}
                        </Chip>
                      )}
                    </div>
                  </div>
                  
                  {selectedTeamMember.description && (
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">
                        {t('about.team.description') || 'Опис'}
                      </h6>
                      <p className="text-gray-600">{selectedTeamMember.description}</p>
                    </div>
                  )}

                  {selectedTeamMember.responsibilities && (
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">
                        {t('about.team.responsibilities') || 'Обов\'язки'}
                      </h6>
                      <ul className="text-gray-600 space-y-1">
                        {selectedTeamMember.responsibilities.map((responsibility, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            {responsibility}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Модальне вікно для сертифікатів */}
        <Modal 
          isOpen={isCertModalOpen} 
          onClose={onCertModalClose}
          size="lg"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">
                {t('about.achievements.details') || 'Деталі сертифіката'}
              </h3>
            </ModalHeader>
            <ModalBody className="pb-6">
              {selectedCertificate && (
                <div className="space-y-4">
                  {selectedCertificate.image && (
                    <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={selectedCertificate.image} 
                        alt={selectedCertificate.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{selectedCertificate.title}</h4>
                    <p className="text-gray-600 mb-4">{selectedCertificate.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
      <style>{`
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