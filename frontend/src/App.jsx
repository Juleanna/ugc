import React, { useState, useEffect } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Chip,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Divider,
  Link,
  Image,
  Progress
} from "@nextui-org/react";
import { 
  Home, 
  Info, 
  Briefcase, 
  FolderOpen, 
  Users, 
  Mail, 
  MapPin,
  Phone,
  Globe,
  ArrowRight,
  Star,
  Calendar,
  Send,
  CheckCircle,
  Building,
  Award,
  Zap,
  Target,
  TrendingUp,
  Heart,
  Shield,
  Lightbulb,
  ChevronRight,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Утиліта для API запитів
const apiCall = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

// Компонент навігації
const Navigation = ({ activeSection, setActiveSection, translations = {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { id: 'home', label: translations.home || 'Головна', icon: Home },
    { id: 'about', label: translations.about || 'Про нас', icon: Info },
    { id: 'services', label: translations.services || 'Послуги', icon: Briefcase },
    { id: 'projects', label: translations.projects || 'Проєкти', icon: FolderOpen },
    { id: 'jobs', label: translations.jobs || 'Вакансії', icon: Users },
    { id: 'contact', label: translations.contact || 'Контакти', icon: Mail }
  ];

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen}
      className="bg-background/70 backdrop-blur-md border-b border-divider"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-xl mr-3">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <p className="font-bold text-2xl gradient-text">
              UGC
            </p>
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavbarItem key={item.id}>
              <Button
                variant={activeSection === item.id ? "solid" : "light"}
                color={activeSection === item.id ? "primary" : "default"}
                startContent={<Icon className="h-4 w-4" />}
                onPress={() => setActiveSection(item.id)}
                className="font-medium"
                radius="lg"
              >
                {item.label}
              </Button>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarMenu>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavbarMenuItem key={item.id}>
              <Button
                variant={activeSection === item.id ? "solid" : "light"}
                color={activeSection === item.id ? "primary" : "default"}
                startContent={<Icon className="h-4 w-4" />}
                onPress={() => {
                  setActiveSection(item.id);
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start"
                size="lg"
                radius="lg"
              >
                {item.label}
              </Button>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </Navbar>
  );
};

// Hero секція
const HeroSection = ({ homeData, translations = {} }) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-primary-950 dark:via-secondary-950 dark:to-primary-900">
      {/* Анімовані елементи фону */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200 dark:bg-primary-800 rounded-full opacity-60 animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary-200 dark:bg-secondary-800 rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary-300 dark:bg-primary-700 rounded-full opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Chip 
          color="primary" 
          variant="dot" 
          size="lg"
          className="mb-8"
        >
          🚀 {translations.welcome || 'Ласкаво просимо до майбутнього'}
        </Chip>
        
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8">
          <span className="gradient-text">
            {homeData?.hero_title || translations.hero_title || 'Інноваційні рішення'}
          </span>
          <br />
          <span className="text-foreground">
            для вашого бізнесу
          </span>
        </h1>
        
        <p className="text-xl lg:text-2xl text-default-600 mb-12 max-w-4xl mx-auto leading-relaxed">
          {homeData?.hero_description || translations.hero_description || 'Ми створюємо передові технологічні рішення, які допомагають компаніям досягати нових висот у цифровому світі'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            color="primary" 
            size="lg" 
            variant="solid"
            endContent={<ArrowRight className="h-5 w-5" />}
            className="font-semibold px-8 py-3 text-lg"
            radius="xl"
          >
            {translations.get_started || 'Почати проєкт'}
          </Button>
          <Button 
            color="default" 
            variant="bordered"
            size="lg"
            endContent={<ExternalLink className="h-5 w-5" />}
            className="font-semibold px-8 py-3 text-lg"
            radius="xl"
          >
            {translations.learn_more || 'Дізнатися більше'}
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '5+', label: 'Років досвіду' },
            { value: '100+', label: 'Проєктів' },
            { value: '50+', label: 'Клієнтів' },
            { value: '24/7', label: 'Підтримка' }
          ].map((stat, index) => (
            <Card key={index} className="bg-background/60 backdrop-blur-md border-none shadow-lg">
              <CardBody className="text-center p-4">
                <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-default-600 text-sm">{stat.label}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Секція послуг
const ServicesSection = ({ services, translations = {} }) => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Chip color="secondary" variant="flat" size="lg" className="mb-6">
            ⚡ {translations.our_services || 'Наші послуги'}
          </Chip>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Професійні рішення
            <br />
            <span className="gradient-text">для вашого бізнесу</span>
          </h2>
          <p className="text-xl text-default-600 max-w-3xl mx-auto">
            {translations.services_description || 'Ми пропонуємо повний спектр IT-послуг для розвитку вашого бізнесу'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.map((service, index) => (
            <Card 
              key={service.id || index} 
              className="group hover:scale-105 transition-all duration-300 cursor-pointer border-none shadow-lg hover:shadow-2xl"
              isPressable
            >
              <CardHeader className="flex gap-3 items-start pb-2">
                <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {service.name || `Послуга ${index + 1}`}
                    </h3>
                    {service.is_featured && (
                      <Badge content={<Star className="h-3 w-3" />} color="warning" variant="solid" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-default-600 mb-4 line-clamp-3">
                  {service.short_description || service.description || 'Професійна послуга для розвитку вашого бізнесу з використанням сучасних технологій'}
                </p>
                <Button 
                  color="primary" 
                  variant="light" 
                  endContent={<ChevronRight className="h-4 w-4" />}
                  className="w-fit group-hover:bg-primary-50"
                  size="sm"
                >
                  {translations.learn_more || 'Детальніше'}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Секція проєктів
const ProjectsSection = ({ projects, translations = {} }) => {
  return (
    <section className="py-20 bg-default-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Chip color="success" variant="flat" size="lg" className="mb-6">
            🎯 {translations.our_projects || 'Наші проєкти'}
          </Chip>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Портфоліо успішних
            <br />
            <span className="gradient-text">рішень</span>
          </h2>
          <p className="text-xl text-default-600 max-w-3xl mx-auto">
            {translations.projects_description || 'Погляньте на проєкти, які ми реалізували для наших клієнтів'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects?.map((project, index) => (
            <Card 
              key={project.id || index} 
              className="group hover:scale-105 transition-all duration-300 cursor-pointer border-none shadow-lg hover:shadow-2xl"
              isPressable
            >
              <CardHeader className="relative overflow-hidden p-0">
                <div className="w-full h-48 bg-gradient-to-br from-primary-300 to-secondary-300 flex items-center justify-center">
                  <FolderOpen className="h-16 w-16 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                {project.category && (
                  <Chip 
                    color="default" 
                    size="sm" 
                    variant="solid"
                    className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
                  >
                    {project.category.name}
                  </Chip>
                )}
              </CardHeader>
              <CardBody>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {project.name || `Проєкт ${index + 1}`}
                </h3>
                <p className="text-default-600 mb-4 line-clamp-2">
                  {project.short_description || project.description || 'Інноваційне рішення для бізнесу з використанням сучасних технологій'}
                </p>
                <div className="flex items-center justify-between">
                  <Button 
                    color="primary" 
                    variant="light" 
                    size="sm"
                    endContent={<ChevronRight className="h-4 w-4" />}
                    className="group-hover:bg-primary-50"
                  >
                    {translations.view_project || 'Переглянути'}
                  </Button>
                  <div className="flex items-center text-default-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-xs">2024</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Секція вакансій
const JobsSection = ({ jobs, translations = {} }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Chip color="warning" variant="flat" size="lg" className="mb-6">
            👥 {translations.career || 'Кар\'єра'}
          </Chip>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Приєднуйтесь до нашої
            <br />
            <span className="gradient-text">команди мрійників</span>
          </h2>
          <p className="text-xl text-default-600 max-w-3xl mx-auto">
            {translations.jobs_description || 'Знайдіть свою ідеальну позицію в команді професіоналів'}
          </p>
        </div>

        <div className="space-y-6">
          {jobs?.map((job, index) => (
            <Card key={job.id || index} className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <CardBody className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-2xl">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-foreground">
                            {job.title || `Вакансія ${index + 1}`}
                          </h3>
                          {job.is_urgent && (
                            <Chip color="danger" size="sm" variant="flat">
                              ⚡ {translations.urgent || 'Терміново'}
                            </Chip>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center gap-2 text-default-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{job.location || 'Віддалено'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-default-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{job.employment_type || 'Повна зайнятість'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-default-600">
                            <Building className="h-4 w-4" />
                            <span className="text-sm">{job.department || 'IT відділ'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-default-600 leading-relaxed">
                      {job.short_description || job.description || 'Цікава вакансія для розвитку кар\'єри в IT сфері з можливістю працювати над інноваційними проєктами'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 lg:ml-6">
                    <Button 
                      color="primary" 
                      variant="solid"
                      endContent={<Send className="h-4 w-4" />}
                      className="font-semibold"
                      size="lg"
                    >
                      {translations.apply || 'Подати заявку'}
                    </Button>
                    <Button 
                      color="default" 
                      variant="bordered"
                      size="lg"
                    >
                      {translations.details || 'Детальніше'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Секція "Про нас"
const AboutSection = ({ aboutData, translations = {} }) => {
  const features = [
    {
      icon: Target,
      title: translations.quality || 'Якість',
      description: translations.quality_description || 'Ми завжди прагнемо до найвищої якості в усьому, що робимо',
      color: 'primary'
    },
    {
      icon: Users,
      title: translations.team || 'Команда',
      description: translations.team_description || 'Наша команда - це досвідчені професіонали, які працюють разом',
      color: 'secondary'
    },
    {
      icon: Lightbulb,
      title: translations.innovation || 'Інновації',
      description: translations.innovation_description || 'Ми постійно шукаємо нові способи вирішення завдань',
      color: 'success'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Chip color="secondary" variant="flat" size="lg" className="mb-6">
            🏢 {translations.about_us || 'Про нас'}
          </Chip>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Хто ми і чим
            <br />
            <span className="gradient-text">займаємося</span>
          </h2>
          <p className="text-xl text-default-600 max-w-3xl mx-auto">
            {aboutData?.subtitle || translations.about_description || 'Дізнайтесь більше про нашу компанію та цінності'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-6">
              {aboutData?.mission_title || translations.our_mission || 'Наша місія'}
            </h3>
            <p className="text-lg text-default-600 mb-8 leading-relaxed">
              {aboutData?.mission_description || translations.mission_description || 'Ми прагнемо створювати інноваційні рішення, які допомагають нашим клієнтам досягати успіху в цифровому світі. Наша команда об\'єднує досвід, креативність та технологічну експертизу.'}
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className={`bg-${feature.color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-2 text-lg">
                        {feature.title}
                      </h4>
                      <p className="text-default-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 border-2 border-primary-200 dark:border-primary-800">
            <CardBody className="p-8 text-center">
              <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-2xl w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-xl">
                <Globe className="h-12 w-12" />
              </div>
              
              <h4 className="text-2xl font-bold text-foreground mb-4">
                {aboutData?.company_name || 'UGC Company'}
              </h4>
              
              <p className="text-default-600 mb-8 leading-relaxed">
                {aboutData?.company_description || translations.company_description || 'Ми створюємо майбутнє разом з нашими клієнтами, надаючи найкращі технологічні рішення та консультації.'}
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <Card className="bg-background/60 backdrop-blur-sm">
                  <CardBody className="text-center p-4">
                    <div className="text-3xl font-bold gradient-text mb-2">5+</div>
                    <div className="text-sm text-default-600 font-medium">
                      {translations.years_experience || 'Років досвіду'}
                    </div>
                  </CardBody>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm">
                  <CardBody className="text-center p-4">
                    <div className="text-3xl font-bold gradient-text mb-2">100+</div>
                    <div className="text-sm text-default-600 font-medium">
                      {translations.projects_completed || 'Завершених проєктів'}
                    </div>
                  </CardBody>
                </Card>
              </div>
              
              <Button 
                variant="bordered" 
                color="primary"
                startContent={<Heart className="h-4 w-4" />}
                size="lg"
              >
                {translations.join_team || 'Приєднатися до команди'}
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Цінності компанії */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            {translations.our_values || 'Наші цінності'}
          </h3>
          <p className="text-lg text-default-600 max-w-2xl mx-auto">
            {translations.values_description || 'Принципи, якими ми керуємося у своїй роботі'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: translations.reliability || 'Надійність',
              description: translations.reliability_description || 'Ми завжди виконуємо свої зобов\'язання в строк та з високою якістю',
              color: 'primary'
            },
            {
              icon: TrendingUp,
              title: translations.growth || 'Розвиток',
              description: translations.growth_description || 'Ми постійно вдосконалюємося та слідкуємо за новими технологіями',
              color: 'secondary'
            },
            {
              icon: Award,
              title: translations.excellence || 'Досконалість',
              description: translations.excellence_description || 'Ми прагнемо до досконалості в кожному проєкті',
              color: 'success'
            }
          ].map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className={`group hover:bg-${value.color}-50 dark:hover:bg-${value.color}-950 transition-colors border-none shadow-lg hover:shadow-xl`}>
                <CardBody className="p-8 text-center">
                  <div className={`bg-${value.color} p-4 rounded-2xl w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-4">
                    {value.title}
                  </h4>
                  <p className="text-default-600">
                    {value.description}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Секція контактів
const ContactSection = ({ offices, translations = {} }) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact-inquiries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      });
      
      if (response.ok) {
        onOpen();
        setContactForm({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-default-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Chip color="primary" variant="flat" size="lg" className="mb-6">
            📞 {translations.contact_us || 'Зв\'яжіться з нами'}
          </Chip>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Готові почати
            <br />
            <span className="gradient-text">ваш проєкт?</span>
          </h2>
          <p className="text-xl text-default-600 max-w-3xl mx-auto">
            {translations.contact_description || 'Напишіть нам і ми обговоримо ваші ідеї'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Контактна інформація */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-foreground mb-8">
              {translations.our_offices || 'Наші офіси'}
            </h3>
            
            {offices?.map((office, index) => (
              <Card key={office.id || index} className="border-none shadow-lg">
                <CardBody className="p-6">
                  <h4 className="text-xl font-bold text-foreground mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary" />
                    {office.name || `Офіс ${index + 1}`}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-default-600">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <span>{office.address || 'Київ, Україна, вул. Хрещатик 1'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-default-600">
                      <Phone className="h-5 w-5 text-primary" />
                      <span>{office.phone || '+380 XX XXX XX XX'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-default-600">
                      <Mail className="h-5 w-5 text-primary" />
                      <span>{office.email || 'office@ugc.com'}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Форма зв'язку */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <h3 className="text-2xl font-bold text-foreground">
                {translations.send_message || 'Надіслати повідомлення'}
              </h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <Input
                label={translations.name || 'Ім\'я'}
                placeholder={translations.name_placeholder || 'Ваше ім\'я'}
                value={contactForm.name}
                onValueChange={(value) => handleInputChange('name', value)}
                variant="bordered"
                size="lg"
                startContent={<Users className="h-4 w-4 text-default-400" />}
                isRequired
              />
              <Input
                label={translations.email || 'Email'}
                placeholder={translations.email_placeholder || 'your@email.com'}
                value={contactForm.email}
                onValueChange={(value) => handleInputChange('email', value)}
                variant="bordered"
                size="lg"
                type="email"
                startContent={<Mail className="h-4 w-4 text-default-400" />}
                isRequired
              />
              <Textarea
                label={translations.message || 'Повідомлення'}
                placeholder={translations.message_placeholder || 'Розкажіть про ваш проєкт...'}
                value={contactForm.message}
                onValueChange={(value) => handleInputChange('message', value)}
                variant="bordered"
                minRows={4}
                size="lg"
                isRequired
              />
              <Button
                color="primary"
                size="lg"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                endContent={!isSubmitting && <Send className="h-4 w-4" />}
                className="w-full font-semibold"
              >
                {isSubmitting ? 'Надсилається...' : (translations.send || 'Надіслати повідомлення')}
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Модальне вікно успіху */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-success" />
                    <span>Повідомлення надіслано!</span>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <p className="text-default-600">
                    Дякуємо за ваше повідомлення! Ми зв'яжемося з вами найближчим часом.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Зрозуміло
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </section>
  );
};

// Головний компонент додатку
const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [data, setData] = useState({
    homepage: [],
    about: [],
    services: [],
    projects: [],
    jobs: [],
    offices: [],
    translations: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const [
        homepageResponse,
        aboutResponse,
        servicesResponse,
        projectsResponse,
        jobsResponse,
        officesResponse,
        translationsResponse
      ] = await Promise.all([
        apiCall('/homepage/'),
        apiCall('/about/'),
        apiCall('/services/'),
        apiCall('/projects/'),
        apiCall('/jobs/'),
        apiCall('/offices/'),
        apiCall('/translations/')
      ]);

      setData({
        homepage: homepageResponse?.results || [],
        about: aboutResponse?.results || [],
        services: servicesResponse?.results || [],
        projects: projectsResponse?.results || [],
        jobs: jobsResponse?.results || [],
        offices: officesResponse?.results || [],
        translations: translationsResponse || {}
      });
      
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <Spinner 
            size="lg" 
            color="primary" 
            className="mb-4"
          />
          <p className="text-default-600 text-lg font-medium">Завантаження...</p>
          <p className="text-default-500 text-sm mt-2">Підготовуємо для вас найкращий досвід</p>
        </div>
      </div>
    );
  }

  const homeData = data.homepage[0];
  const aboutData = data.about[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        translations={data.translations}
      />
      
      <main>
        {activeSection === 'home' && (
          <>
            <HeroSection homeData={homeData} translations={data.translations} />
            <ServicesSection services={data.services} translations={data.translations} />
            <ProjectsSection projects={data.projects} translations={data.translations} />
          </>
        )}
        
        {activeSection === 'about' && (
          <AboutSection aboutData={aboutData} translations={data.translations} />
        )}
        
        {activeSection === 'services' && (
          <ServicesSection services={data.services} translations={data.translations} />
        )}
        
        {activeSection === 'projects' && (
          <ProjectsSection projects={data.projects} translations={data.translations} />
        )}
        
        {activeSection === 'jobs' && (
          <JobsSection jobs={data.jobs} translations={data.translations} />
        )}
        
        {activeSection === 'contact' && (
          <ContactSection offices={data.offices} translations={data.translations} />
        )}
      </main>

      {/* Футер */}
      <footer className="bg-foreground text-background relative overflow-hidden">
        {/* Декоративні елементи */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full opacity-10 -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full opacity-10 translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Логотип та опис */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-xl mr-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <span className="text-3xl font-bold gradient-text">
                  UGC
                </span>
              </div>
              <p className="text-default-400 mb-6 max-w-md leading-relaxed">
                {data.translations.footer_description || 'Ми створюємо інноваційні технологічні рішення для успішного розвитку вашого бізнесу в цифровому світі.'}
              </p>
              <div className="flex gap-4">
                <Button 
                  isIconOnly 
                  variant="flat" 
                  color="primary"
                  aria-label="Website"
                >
                  <Globe className="h-5 w-5" />
                </Button>
                <Button 
                  isIconOnly 
                  variant="flat" 
                  color="primary"
                  aria-label="LinkedIn"
                >
                  <Users className="h-5 w-5" />
                </Button>
                <Button 
                  isIconOnly 
                  variant="flat" 
                  color="primary"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Швидкі посилання */}
            <div>
              <h4 className="font-bold text-background mb-6 text-lg">
                {data.translations.quick_links || 'Швидкі посилання'}
              </h4>
              <div className="space-y-2">
                {[
                  { id: 'about', label: data.translations.about || 'Про нас' },
                  { id: 'services', label: data.translations.services || 'Послуги' },
                  { id: 'projects', label: data.translations.projects || 'Проєкти' },
                  { id: 'jobs', label: data.translations.jobs || 'Вакансії' }
                ].map((link) => (
                  <Button 
                    key={link.id}
                    variant="light" 
                    size="sm" 
                    className="justify-start p-0 h-auto text-default-400 hover:text-background"
                    onPress={() => setActiveSection(link.id)}
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Контакти */}
            <div>
              <h4 className="font-bold text-background mb-6 text-lg">
                {data.translations.contact || 'Контакти'}
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-default-400">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    {data.offices[0]?.address || 'Київ, Україна'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-default-400">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    {data.offices[0]?.phone || '+380 XX XXX XX XX'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-default-400">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    {data.offices[0]?.email || 'contact@ugc.com'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Divider className="my-8 bg-default-300" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-default-500 text-sm">
              © 2024 UGC. {data.translations.all_rights_reserved || 'Всі права захищені.'}
            </p>
            <div className="flex gap-6">
              <Button 
                variant="light" 
                size="sm" 
                className="text-default-500 p-0 h-auto hover:text-background"
              >
                {data.translations.privacy_policy || 'Політика конфіденційності'}
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                className="text-default-500 p-0 h-auto hover:text-background"
              >
                {data.translations.terms_of_service || 'Умови використання'}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;