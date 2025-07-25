// frontend/src/components/ProjectsSection.jsx
// Виправлена версія БЕЗ вкладених кнопок

import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Chip, Button, Spinner } from "@nextui-org/react";
import { 
  FolderOpen, 
  CheckCircle, 
  ExternalLink, 
  Calendar,
  Users,
  Trophy,
  AlertCircle
} from 'lucide-react';

// Хуки
import { useTranslation } from '../hooks/useTranslation';
import { useProjectsData } from '../hooks/useUnifiedAPI.jsx';

const ProjectsSection = ({ data, scrollToSection }) => {
  const { t } = useTranslation();
  
  // ВИКОРИСТОВУЄМО UNIFIED API HOOK
  const { 
    data: apiProjects, 
    isLoading: apiIsLoading, 
    error: apiError,
    reload: reloadProjects 
  } = useProjectsData();

  // Стан компонента
  const [selectedProject, setSelectedProject] = useState(null);

  // Дефолтні проєкти як fallback
  const getDefaultProjects = () => [
    {
      id: 1,
      title: 'Національна Гвардія України',
      client: 'Національна Гвардія України',
      subtitle: 'Захист і комфорт для наших захисників',
      description: 'Національна Гвардія України забезпечує своїх працівників якісним спецодягом, який відповідає найвищим стандартам захисту і комфорту в різних умовах служби.',
      badge: 'Успішний проєкт',
      status: 'completed',
      category: 'military',
      completion_date: '2024',
      team_size: '50+',
      features: [
        'Вітро-вологозахисні властивості',
        'Підвищена міцність',
        'Ергономічний дизайн',
        'Функціональні елементи'
      ],
      image: '/images/projects/national-guard.jpg',
      metrics: {
        satisfaction: '98%',
        delivery_time: '2 місяці',
        items_produced: '1000+'
      }
    },
    {
      id: 2,
      title: 'Міністерство оборони України',
      client: 'Міністерство оборони України',
      subtitle: 'Вітро-вологозахисний костюм для військових',
      description: 'Міністерство оборони України замовило спеціальний вітро-вологозахисний костюм, який забезпечує надійний захист і комфорт для військових у різних погодних умовах.',
      badge: 'Успішний проєкт',
      status: 'completed',
      category: 'military',
      completion_date: '2024',
      team_size: '75+',
      features: [
        'Захист від несприятливої погоди',
        'Дихаючі матеріали',
        'Камуфляжний принт',
        'Посилені шви'
      ],
      image: '/images/projects/ministry-defense.jpg',
      metrics: {
        satisfaction: '97%',
        delivery_time: '3 місяці',
        items_produced: '2000+'
      }
    },
    {
      id: 3,
      title: 'Медичний центр "Віта"',
      client: 'Медичний центр "Віта"',
      subtitle: 'Медичний одяг нового покоління',
      description: 'Комплексне забезпечення медичного центру сучасним одягом для персоналу з антибактеріальною обробкою та ергономічним дизайном.',
      badge: 'В процесі',
      status: 'in_progress',
      category: 'medical',
      completion_date: '2024',
      team_size: '30+',
      features: [
        'Антибактеріальні властивості',
        'Зручний крій',
        'Легкий догляд',
        'Професійний вигляд'
      ],
      image: '/images/projects/medical-center.jpg',
      metrics: {
        satisfaction: '95%',
        delivery_time: '1.5 місяці',
        items_produced: '500+'
      }
    }
  ];

  // Об'єднання даних
  const projects = useMemo(() => {
    if (data?.projects?.length > 0) {
      return data.projects;
    } else if (apiProjects?.length > 0) {
      return apiProjects;
    } else {
      return getDefaultProjects();
    }
  }, [data?.projects, apiProjects]);

  // Функція для отримання кольору статусу
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'planning': return 'primary';
      default: return 'default';
    }
  };

  // Функція для отримання тексту статусу
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return t('projects.status.completed') || 'Завершено';
      case 'in_progress': return t('projects.status.in_progress') || 'В процесі';
      case 'planning': return t('projects.status.planning') || 'Планування';
      default: return status || 'Невідомо';
    }
  };

  // ВИПРАВЛЕНО: Обробник кліків без вкладених кнопок
  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleContactClick = () => {
    scrollToSection?.('contact');
  };

  const handleViewDetailsClick = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
  };

  return (
    <section id="projects" className="section-padding bg-white">
      <div className="container-custom">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('projects.title') || 'Наші проєкти'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('projects.subtitle') || 'Переглядайте наші успішні проєкти та дізнайтеся, як ми допомагаємо організаціям досягати їхніх цілей'}
          </p>
        </div>

        {/* Індикатор завантаження */}
        {apiIsLoading && !projects.length && (
          <div className="text-center py-12">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600 mt-4">Завантаження проєктів...</p>
          </div>
        )}

        {/* ВИПРАВЛЕНО: Сітка проєктів БЕЗ isPressable */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <Card 
              key={project.id || index}
              className="hover-lift transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => handleProjectClick(project)}
            >
              <CardHeader className="pb-2">
                
                {/* Статус та категорія */}
                <div className="flex justify-between items-start w-full mb-2">
                  <Chip 
                    color={getStatusColor(project.status)} 
                    variant="flat" 
                    size="sm"
                  >
                    {getStatusText(project.status)}
                  </Chip>
                  
                  {project.category && (
                    <Chip 
                      variant="bordered" 
                      size="sm"
                      className="capitalize"
                    >
                      {project.category}
                    </Chip>
                  )}
                </div>

                {/* Заголовок */}
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                  {project.title || project.name}
                </h3>

                {/* Підзаголовок */}
                {project.subtitle && (
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {project.subtitle}
                  </p>
                )}
              </CardHeader>

              <CardBody className="pt-0">
                
                {/* Опис */}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {project.description}
                </p>

                {/* Метрики проєкту */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {project.completion_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{project.completion_date}</span>
                    </div>
                  )}
                  
                  {project.team_size && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{project.team_size}</span>
                    </div>
                  )}
                </div>

                {/* Особливості проєкту */}
                {project.features && project.features.length > 0 && (
                  <div className="mb-4">
                    <div className="space-y-1">
                      {project.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                      {project.features.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{project.features.length - 2} більше
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ВИПРАВЛЕНО: Кнопки дій БЕЗ вкладених кнопок */}
                <div className="flex gap-2 mt-auto">
                  <div
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-center cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    onClick={(e) => handleViewDetailsClick(e, project)}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>{t('projects.view_details') || 'Деталі'}</span>
                  </div>
                  
                  <div
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-3 rounded-lg text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactClick();
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t('projects.contact') || 'Зв\'язатись'}</span>
                  </div>
                </div>

                {/* Значок успіху для завершених проєктів */}
                {project.status === 'completed' && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Trophy className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Заклик до дії */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('projects.cta.title') || 'Готові почати новий проєкт?'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('projects.cta.description') || 'Ми готові втілити ваші ідеї в життя та створити якісний професійний одяг для вашої організації.'}
            </p>
            <Button
              color="primary"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-transform"
              onPress={handleContactClick}
            >
              {t('projects.cta.button') || 'Почати співпрацю'}
            </Button>
          </div>
        </div>

        {/* Статистика проєктів */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
              {projects.length}
            </div>
            <div className="text-sm text-gray-600">
              {t('projects.stats.total') || 'Загалом проєктів'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
              98%
            </div>
            <div className="text-sm text-gray-600">
              {t('projects.stats.satisfaction') || 'Задоволення клієнтів'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-1">
              5000+
            </div>
            <div className="text-sm text-gray-600">
              {t('projects.stats.items') || 'Виготовлено виробів'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-1">
              24/7
            </div>
            <div className="text-sm text-gray-600">
              {t('projects.stats.support') || 'Підтримка клієнтів'}
            </div>
          </div>
        </div>

        {/* Модальне вікно деталей проєкту */}
        {selectedProject && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <div 
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                
                {/* Заголовок модального вікна */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProject.title || selectedProject.name}
                    </h3>
                    <p className="text-blue-600 font-medium">
                      {selectedProject.client}
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2"
                    onClick={() => setSelectedProject(null)}
                  >
                    ✕
                  </button>
                </div>

                {/* Статус та метрики */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Chip 
                    color={getStatusColor(selectedProject.status)} 
                    variant="flat"
                  >
                    {getStatusText(selectedProject.status)}
                  </Chip>
                  
                  {selectedProject.category && (
                    <Chip variant="bordered" className="capitalize">
                      {selectedProject.category}
                    </Chip>
                  )}
                </div>

                {/* Повний опис */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {selectedProject.description}
                </p>

                {/* Детальна інформація */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  
                  {/* Основна інформація */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {t('projects.details.info') || 'Основна інформація'}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Клієнт:</span>
                        <span className="font-medium">{selectedProject.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Рік завершення:</span>
                        <span className="font-medium">{selectedProject.completion_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Команда:</span>
                        <span className="font-medium">{selectedProject.team_size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Особливості */}
                  {selectedProject.features && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {t('projects.details.features') || 'Особливості'}
                      </h4>
                      <ul className="space-y-2">
                        {selectedProject.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Метрики проєкту */}
                {selectedProject.metrics && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {t('projects.details.metrics') || 'Результати'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(selectedProject.metrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-blue-600">{value}</div>
                          <div className="text-xs text-gray-600 capitalize">
                            {key.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Кнопки дій */}
                <div className="flex gap-3">
                  <Button
                    color="primary"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                    onPress={() => {
                      setSelectedProject(null);
                      handleContactClick();
                    }}
                  >
                    Обговорити схожий проєкт
                  </Button>
                  <Button
                    variant="bordered"
                    onPress={() => setSelectedProject(null)}
                  >
                    Закрити
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info (тільки в режимі розробки) */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              📊 API Status: {apiIsLoading ? 'Loading...' : 'Ready'} | 
              Projects: {projects.length} | 
              Source: {data?.projects?.length ? 'Props' : apiProjects?.length ? 'Unified API' : 'Fallback'}
              {apiError && ` | Error: ${apiError}`}
            </p>
          </div>
        )}
      </div>

      {/* CSS для анімацій */}
      <style>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
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

export default ProjectsSection;