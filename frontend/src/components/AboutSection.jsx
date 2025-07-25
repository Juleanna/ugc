// frontend/src/components/AboutSection.jsx
// Виправлена версія з правильним рендерингом статистики

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

  // ДОПОМІЖНІ ФУНКЦІЇ (до useMemo)
  
  const getDefaultStats = () => ({
    total_projects: 150,
    satisfied_clients: 95,
    years_experience: 10,
    team_members: 25,
    total_services: 12,
    featured_services: 6,
    featured_projects: 8,
    active_jobs: 3,
    offices: 2,
    project_categories: 5
  });

  const getFeatures = (sourceData) => {
    if (sourceData?.features) return sourceData.features;
    
    return [
      {
        id: 1,
        icon: 'shield',
        title: t('about.features.quality.title') || 'Високі стандарти якості',
        description: t('about.features.quality.description') || 'Контроль якості на кожному етапі виробництва',
        color: 'blue'
      },
      {
        id: 2,
        icon: 'clock',
        title: t('about.features.delivery.title') || 'Своєчасна доставка',
        description: t('about.features.delivery.description') || 'Дотримуємося всіх термінів виконання замовлень',
        color: 'green'
      },
      {
        id: 3,
        icon: 'users',
        title: t('about.features.team.title') || 'Досвідчена команда',
        description: t('about.features.team.description') || 'Професійні фахівці з багаторічним досвідом',
        color: 'purple'
      },
      {
        id: 4,
        icon: 'star',
        title: t('about.features.service.title') || 'Індивідуальний підхід',
        description: t('about.features.service.description') || 'Розробляємо рішення під конкретні потреби клієнта',
        color: 'orange'
      }
    ];
  };

  const getCertificates = (sourceData) => {
    if (sourceData?.certificates) return sourceData.certificates;
    
    return [
      {
        id: 1,
        title: 'ISO 9001:2015',
        description: 'Сертифікат системи управління якістю',
        organization: 'TÜV SÜD',
        date: '2023-05-15',
        image: '/certificates/iso-9001.jpg'
      },
      {
        id: 2,
        title: 'ДСТУ EN 388',
        description: 'Сертифікат відповідності захисного одягу',
        organization: 'Держспоживстандарт України',
        date: '2023-08-20',
        image: '/certificates/dstu-en-388.jpg'
      }
    ];
  };

  const getTeamData = () => {
    if (teamMembers?.length > 0) return teamMembers;
    if (managementTeam?.length > 0) return managementTeam;
    
    return [
      {
        id: 1,
        name: 'Олександр Петренко',
        position: 'Генеральний директор',
        experience: '15 років',
        photo: '/team/director.jpg',
        bio: 'Досвідчений керівник з великим досвідом в текстильній промисловості'
      },
      {
        id: 2,
        name: 'Марія Коваленко',
        position: 'Головний технолог',
        experience: '12 років',
        photo: '/team/technologist.jpg',
        bio: 'Спеціаліст з розробки та впровадження нових технологій виробництва'
      }
    ];
  };

  const getProductionPhotos = (sourceData) => {
    if (sourceData?.production_photos) return sourceData.production_photos;
    
    return [
      { id: 1, image: '/production/workshop-1.jpg', title: 'Швейний цех' },
      { id: 2, image: '/production/quality-control.jpg', title: 'Контроль якості' },
      { id: 3, image: '/production/cutting-room.jpg', title: 'Раскрійний відділ' },
      { id: 4, image: '/production/warehouse.jpg', title: 'Склад готової продукції' },
      { id: 5, image: '/production/design-studio.jpg', title: 'Дизайн-студія' },
      { id: 6, image: '/production/testing-lab.jpg', title: 'Лабораторія тестування' }
    ];
  };

  // Об'єднання даних з різних джерел
  const aboutData = useMemo(() => {
    console.log('AboutSection: Combining data sources', {
      hasPropsData: !!data,
      hasHomepageData: !!homepageData,
      hasTeamData: !!teamMembers?.length
    });

    const sourceData = data || homepageData || {};
    
    return {
      title: sourceData.title || t('about.title') || 'Про нашу компанію',
      subtitle: sourceData.subtitle || t('about.subtitle') || 
        'Ми – провідний виробник професійного одягу з багаторічним досвідом.',
      description: sourceData.description || t('about.description') || 
        'Наша продукція відповідає найвищим стандартам якості.',
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
                {homepageError?.message || t('about.error.message') || 'Не вдалося завантажити інформацію про компанію'}
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

        {/* ВИПРАВЛЕНО: Статистика */}
        {aboutData.stats && Object.keys(aboutData.stats).length > 0 && (
          <div className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Object.entries(aboutData.stats).map(([key, value], index) => (
                <div key={key} className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {/* ВИПРАВЛЕНО: Правильний рендеринг значень */}
                    {typeof value === 'number' ? value.toLocaleString() : 
                     typeof value === 'string' ? value : 
                     String(value)}
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
                      feature.color === 'orange' ? 'bg-orange-100 text-orange-600' :
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

        {/* Команда */}
        {aboutData.team && aboutData.team.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-10">
              {t('about.team.title') || 'Наша команда'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aboutData.team.slice(0, 6).map((member) => (
                <Card 
                  key={member.id}
                  isPressable
                  onPress={() => handleTeamMemberClick(member)}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardBody className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      {member.photo ? (
                        <img 
                          src={member.photo} 
                          alt={member.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Users className="w-12 h-12 text-gray-500" />
                      )}
                    </div>
                    <h4 className="text-lg font-semibold mb-1">{member.name}</h4>
                    <p className="text-gray-600 mb-2">{member.position}</p>
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
              {t('about.achievements.title') || 'Наші досягнення'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aboutData.achievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  isPressable
                  onPress={() => handleCertificateClick(achievement)}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2">{achievement.title}</h4>
                        <p className="text-gray-600 mb-2">{achievement.description}</p>
                        {achievement.organization && (
                          <p className="text-sm text-gray-500">{achievement.organization}</p>
                        )}
                        {achievement.date && (
                          <p className="text-sm text-blue-600 mt-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Виробництво */}
        {aboutData.productionPhotos && aboutData.productionPhotos.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-10">
              {t('about.production.title') || 'Наше виробництво'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutData.productionPhotos.slice(0, visiblePhotos).map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {photo.image ? (
                      <img 
                        src={photo.image} 
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <CardBody className="p-4">
                    <h4 className="font-semibold">{photo.title}</h4>
                    {photo.description && (
                      <p className="text-sm text-gray-600 mt-1">{photo.description}</p>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
            
            {visiblePhotos < aboutData.productionPhotos.length && (
              <div className="text-center mt-8">
                <Button
                  variant="bordered"
                  onPress={handleShowMorePhotos}
                  startContent={<Eye className="w-4 h-4" />}
                >
                  {t('about.production.show_more') || 'Показати більше'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Модальні вікна */}
        
        {/* Модал деталей команди */}
        <Modal 
          isOpen={isTeamModalOpen} 
          onClose={onTeamModalClose}
          size="2xl"
        >
          <ModalContent>
            <ModalHeader>
              {selectedTeamMember?.name}
            </ModalHeader>
            <ModalBody className="pb-6">
              {selectedTeamMember && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      {selectedTeamMember.photo ? (
                        <img 
                          src={selectedTeamMember.photo} 
                          alt={selectedTeamMember.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Users className="w-10 h-10 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{selectedTeamMember.position}</h4>
                      {selectedTeamMember.experience && (
                        <p className="text-gray-600">{selectedTeamMember.experience}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedTeamMember.bio && (
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">
                        {t('about.team.bio') || 'Біографія'}
                      </h6>
                      <p className="text-gray-600">{selectedTeamMember.bio}</p>
                    </div>
                  )}
                  
                  {selectedTeamMember.skills && (
                    <div>
                      <h6 className="font-medium text-gray-700 mb-2">
                        {t('about.team.skills') || 'Навички'}
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeamMember.skills.map((skill, index) => (
                          <Chip key={index} size="sm" variant="flat">
                            {skill}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Модал сертифікатів */}
        <Modal 
          isOpen={isCertModalOpen} 
          onClose={onCertModalClose}
          size="2xl"
        >
          <ModalContent>
            <ModalHeader>
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
                  
                  <div className="space-y-3">
                    <div>
                      <h6 className="font-medium text-gray-700 mb-1">
                        {t('about.achievements.description') || 'Опис'}
                      </h6>
                      <p className="text-gray-600">{selectedCertificate.description}</p>
                    </div>
                    
                    {selectedCertificate.date && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">
                          {t('about.achievements.date') || 'Дата видачі'}
                        </h6>
                        <p className="text-gray-600">
                          {new Date(selectedCertificate.date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
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
                <strong>Stats Keys:</strong> {aboutData.stats ? Object.keys(aboutData.stats).length : 0}<br/>
                <strong>Visible Photos:</strong> {visiblePhotos}<br/>
                {(homepageError || teamError) && (
                  <span className="text-red-600">
                    <strong>Errors:</strong> {[homepageError?.message, teamError?.message].filter(Boolean).join(', ')}
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