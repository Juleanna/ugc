// frontend/src/components/ProjectsSection.jsx
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
// ВИКОРИСТОВУЄМО UNIFIED API
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
      badge: 'В розробці',
      status: 'in_progress',
      category: 'medical',
      completion_date: '2025',
      team_size: '15+',
      features: [
        'Антибактеріальна обробка',
        'Гіпоалергенні матеріали',
        'Сучасний дизайн',
        'Легка дезінфекція'
      ],
      image: '/images/projects/medical-center.jpg',
      metrics: {
        progress: '75%',
        delivery_time: '1 місяць',
        items_planned: '500+'
      }
    }
  ];

  // Об'єднання даних з різних джерел
  const projects = useMemo(() => {
    // Пріоритет: props -> API -> defaultProjects
    if (data?.projects?.length > 0) {
      console.log('ProjectsSection: використовуємо дані з props');
      return data.projects;
    }
    
    if (apiProjects?.length > 0) {
      console.log('ProjectsSection: використовуємо дані з Unified API');
      return apiProjects;
    }
    
    console.log('ProjectsSection: використовуємо defaultProjects як fallback');
    return getDefaultProjects();
  }, [data?.projects, apiProjects]);

  // Обробники подій
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    console.log('Clicked project:', project.client || project.name || project.title);
  };

  const handleViewDetailsClick = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    console.log('View project details:', project.client || project.name || project.title);
  };

  const handleContactClick = () => {
    scrollToSection?.('contact');
  };

  // Отримання кольору для статусу
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'planning': return 'primary';
      default: return 'default';
    }
  };

  // Отримання тексту статусу
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return t('projects.status.completed') || 'Завершено';
      case 'in_progress': return t('projects.status.in_progress') || 'В процесі';
      case 'planning': return t('projects.status.planning') || 'Планування';
      default: return t('projects.status.unknown') || 'Невідомо';
    }
  };

  // Обробка помилки API
  if (apiError && !data?.projects?.length) {
    return (
      <section id="projects" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Помилка завантаження проєктів</h3>
              <p className="text-red-600 mb-4">{apiError}</p>
              <Button 
                color="danger" 
                variant="flat" 
                onPress={reloadProjects}
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
    <section id="projects" className="section-padding bg-white">
      <div className="container-custom">
        
        {/* Заголовок секції */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('projects.title') || 'Наші проєкти'}
            <br />
            <span className="text-gradient-blue">
              {t('projects.subtitle') || 'успішно реалізовані'}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('projects.description') || 'Ми пишаємося довірою наших клієнтів та успішно реалізованими проєктами у різних галузях.'}
          </p>
        </div>

        {/* Індикатор завантаження */}
        {apiIsLoading && !projects.length && (
          <div className="text-center py-12">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600 mt-4">Завантаження проєктів...</p>
          </div>
        )}

        {/* Сітка проєктів */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <Card 
              key={project.id || index}
              className="hover-lift cursor-pointer transition-all duration-300 hover:shadow-xl"
              isPressable
              onPress={() => handleProjectClick(project)}
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

                {/* Кнопки дій */}
                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="flex-1"
                    startContent={<FolderOpen className="w-4 h-4" />}
                    onPress={(e) => handleViewDetailsClick(e, project)}
                  >
                    {t('projects.view_details') || 'Деталі'}
                  </Button>
                  
                  <Button
                    size="sm"
                    color="primary"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                    startContent={<ExternalLink className="w-4 h-4" />}
                    onPress={handleContactClick}
                  >
                    {t('projects.contact') || 'Зв\'язатись'}
                  </Button>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              startContent={<ExternalLink className="w-5 h-5" />}
              onPress={handleContactClick}
            >
              {t('projects.cta.button') || 'Обговорити проєкт'}
            </Button>
          </div>
        </div>

        {/* Статистика проєктів */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {projects.filter(p => p.status === 'completed').length}+
            </div>
            <div className="text-gray-600 text-sm">
              {t('projects.stats.completed') || 'Завершених проєктів'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600 text-sm">
              {t('projects.stats.satisfaction') || 'Задоволення клієнтів'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">5000+</div>
            <div className="text-gray-600 text-sm">
              {t('projects.stats.items') || 'Виготовлених виробів'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600 text-sm">
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
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={() => setSelectedProject(null)}
                  >
                    ✕
                  </Button>
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

                {/* Опис */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Опис проєкту</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Особливості */}
                {selectedProject.features && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Ключові особливості</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedProject.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Метрики */}
                {selectedProject.metrics && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Результати</h4>
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

        {/* Статистика API (тільки в режимі розробки) */}
        {process.env.NODE_ENV === 'development' && (
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
    </section>
  );
};

export default ProjectsSection;