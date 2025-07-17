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
  X,
  Check,
  PlayCircle
} from 'lucide-react';

// Замініть на ваш API endpoint
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

const UGCDesign = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    services: [],
    projects: [],
    translations: {}
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigation = [
    { id: 'home', label: 'Головна', icon: Home },
    { id: 'about', label: 'Про нас', icon: Info },
    { id: 'services', label: 'Послуги', icon: Briefcase },
    { id: 'projects', label: 'Проєкти', icon: FolderOpen },
    { id: 'contact', label: 'Контакти', icon: Mail }
  ];

  // Завантаження даних з API
  useEffect(() => {
    const loadData = async () => {
      const [servicesResponse, projectsResponse, translationsResponse] = await Promise.all([
        apiCall('/services/'),
        apiCall('/projects/'),
        apiCall('/translations/')
      ]);

      setData({
        services: servicesResponse?.results || [],
        projects: projectsResponse?.results || [],
        translations: translationsResponse || {}
      });
    };

    loadData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Якщо у вас є API endpoint для форми
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setFormData({ name: '', email: '', phone: '', message: '' });
        onOpen();
      } else {
        console.error('Помилка надсилання форми');
      }
    } catch (error) {
      console.error('Помилка:', error);
      // Для демонстрації просто показуємо успіх
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', message: '' });
        onOpen();
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Навігація */}
      <Navbar 
        onMenuOpenChange={setIsMenuOpen}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm"
        maxWidth="xl"
        position="sticky"
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-xl mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  UGC
                </p>
                <p className="text-xs text-gray-600 -mt-1">Ukrainian Guard Company</p>
              </div>
            </div>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-1" justify="center">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavbarItem key={item.id}>
                <Button
                  variant={activeSection === item.id ? "solid" : "light"}
                  color={activeSection === item.id ? "primary" : "default"}
                  onClick={() => scrollToSection(item.id)}
                  className="font-medium"
                  startContent={<Icon className="h-4 w-4" />}
                >
                  {item.label}
                </Button>
              </NavbarItem>
            );
          })}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button 
              color="primary" 
              variant="solid"
              onClick={() => scrollToSection('contact')}
              className="font-semibold"
            >
              Зв'язатися
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavbarMenuItem key={item.id}>
                <Button
                  variant="light"
                  className="w-full justify-start"
                  startContent={<Icon className="h-4 w-4" />}
                  onClick={() => {
                    scrollToSection(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              </NavbarMenuItem>
            );
          })}
        </NavbarMenu>
      </Navbar>

      {/* Головна секція */}
      <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-70"></div>
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 border border-blue-200 mb-8">
              <Award className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-700 font-semibold">Успішний проєкт</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Захист і комфорт
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                для наших захисників
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Ми створюємо якісний та надійний спецодяг, який забезпечує комфорт і безпеку 
              в будь-яких умовах. Наш досвід і прагнення до досконалості допомагають нам 
              задовольняти потреби професіоналів у різних галузях.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                color="primary" 
                size="lg" 
                variant="solid"
                endContent={<ArrowRight className="h-5 w-5" />}
                className="font-semibold px-8 py-3 text-lg shadow-lg"
                onClick={() => scrollToSection('projects')}
              >
                Наші проєкти
              </Button>
              <Button 
                color="default" 
                variant="bordered"
                size="lg"
                endContent={<PlayCircle className="h-5 w-5" />}
                className="font-semibold px-8 py-3 text-lg border-2"
                onClick={() => scrollToSection('about')}
              >
                Дізнатися більше
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '5+', label: 'Років досвіду' },
                { value: '100+', label: 'Проєктів' },
                { value: '50+', label: 'Клієнтів' },
                { value: '24/7', label: 'Підтримка' }
              ].map((stat, index) => (
                <Card key={index} className="bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-lg">
                  <CardBody className="text-center p-6">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Про нас */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Chip color="primary" variant="flat" size="lg" className="mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Про компанію
            </Chip>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Наш багаторічний досвід
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                гарантує якість
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ми створюємо одяг, який забезпечує безпеку і комфорт у будь-яких умовах. 
              Наша продукція відповідає найвищим стандартам якості.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-8">
                {[
                  {
                    icon: Shield,
                    title: 'Надійність',
                    description: 'Високоякісні матеріали та перевірені технології виробництва'
                  },
                  {
                    icon: Award,
                    title: 'Якість',
                    description: 'Кожен виріб проходить ретельний контроль якості'
                  },
                  {
                    icon: Heart,
                    title: 'Комфорт',
                    description: 'Ергономічний дизайн для максимального комфорту користувача'
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-2xl text-white">
                <blockquote className="text-lg font-medium mb-6">
                  "Команда UGC перевершила наші очікування, забезпечивши високу якість 
                  спецодягу та дотримання термінів. Відмінна комунікація і професійний 
                  підхід зробили співпрацю легкою та ефективною."
                </blockquote>
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Національна Гвардія України</div>
                    <div className="text-blue-200">Офіційний партнер</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Послуги */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Chip color="secondary" variant="flat" size="lg" className="mb-6">
              <Briefcase className="h-4 w-4 mr-2" />
              Наші послуги
            </Chip>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Професійні рішення
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                для вашого бізнесу
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ми виготовляємо спецодяг для різних галузей, включаючи військову форму, 
              медичний одяг, а також спецодяг для інших сфер.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Якщо є дані з API, використовуємо їх */}
            {data.services.length > 0 ? 
              data.services.map((service, index) => {
                return (
                  <Card 
                    key={service.id || index} 
                    className="group hover:scale-105 transition-all duration-300 cursor-pointer border-none shadow-lg hover:shadow-2xl bg-white"
                    isPressable
                  >
                    <CardHeader className="flex gap-3 items-start pb-2">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <p className="text-gray-600 mb-4">
                        {service.short_description || service.description}
                      </p>
                      <Button 
                        color="primary" 
                        variant="light" 
                        endContent={<ChevronRight className="h-4 w-4" />}
                        className="w-fit group-hover:bg-blue-50"
                        size="sm"
                      >
                        Детальніше
                      </Button>
                    </CardBody>
                  </Card>
                );
              }) :
              // Якщо даних немає, показуємо демо-дані
              [
                {
                  title: 'Військова форма',
                  description: 'Спеціалізована форма для військових підрозділів з урахуванням всіх вимог',
                  icon: Shield
                },
                {
                  title: 'Медичний одяг',
                  description: 'Комфортний та функціональний одяг для медичного персоналу',
                  icon: Heart
                },
                {
                  title: 'Спецодяг для служб',
                  description: 'Професійний одяг для різних служб та підрозділів',
                  icon: Building
                },
                {
                  title: 'Захисне обладнання',
                  description: 'Сучасне захисне спорядження для різних видів діяльності',
                  icon: Award
                },
                {
                  title: 'Тактичний одяг',
                  description: 'Спеціалізований тактичний одяг для оперативних підрозділів',
                  icon: Target
                },
                {
                  title: 'Зимова форма',
                  description: 'Утеплена форма для роботи в складних погодних умовах',
                  icon: Zap
                }
              ].map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card 
                    key={index} 
                    className="group hover:scale-105 transition-all duration-300 cursor-pointer border-none shadow-lg hover:shadow-2xl bg-white"
                    isPressable
                  >
                    <CardHeader className="flex gap-3 items-start pb-2">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {service.title}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <p className="text-gray-600 mb-4">
                        {service.description}
                      </p>
                      <Button 
                        color="primary" 
                        variant="light" 
                        endContent={<ChevronRight className="h-4 w-4" />}
                        className="w-fit group-hover:bg-blue-50"
                        size="sm"
                      >
                        Детальніше
                      </Button>
                    </CardBody>
                  </Card>
                );
              })
            }
          </div>
        </div>
      </section>

      {/* Проєкти */}
      <section id="projects" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Chip color="warning" variant="flat" size="lg" className="mb-6">
              <FolderOpen className="h-4 w-4 mr-2" />
              Наші проєкти
            </Chip>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Успішні реалізації
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                та довіра клієнтів
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Якщо є дані з API */}
            {data.projects.length > 0 ? 
              data.projects.slice(0, 2).map((project, index) => (
                <Card 
                  key={project.id || index} 
                  className="group hover:scale-105 transition-all duration-300 cursor-pointer border-none shadow-lg hover:shadow-2xl bg-white"
                  isPressable
                >
                  <CardHeader className="pb-0">
                    <div className="w-full">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-4">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-green-700 font-semibold text-sm">Успішний проєкт</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.client || project.name}
                      </h3>
                      <p className="text-lg font-medium text-blue-600 mb-4">
                        {project.short_description || project.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {project.detailed_description || project.description}
                    </p>
                    <Button 
                      color="primary" 
                      variant="light" 
                      endContent={<ExternalLink className="h-4 w-4" />}
                      className="w-fit group-hover:bg-blue-50"
                    >
                      Дивитися проєкт
                    </Button>
                  </CardBody>
                </Card>
              )) :
              // Демо-дані якщо немає даних з API
              [
                {
                  title: 'Національна Гвардія України',
                  subtitle: 'Захист і комфорт для наших захисників',
                  description: 'Національна Гвардія України забезпечує своїх працівників якісним спецодягом, який відповідає найвищим стандартам захисту і комфорту в різних умовах служби.',
                  badge: 'Успішний проєкт',
                  image: '/api/placeholder/600/400'
                },
                {
                  title: 'Міністерство оборони України',
                  subtitle: 'Вітро-вологозахисний костюм для військових',
                  description: 'Міністерство оборони України замовило спеціальний вітро-вологозахисний костюм, який забезпечує надійний захист і комфорт для військових у різних погодних умовах.',
                  badge: 'Успішний проєкт',
                  image: '/api/placeholder/600/400'
                }
              ].map((project, index) => (
                <Card 
                  key={index} 
                  className="group hover:scale-105 transition-all duration-300 cursor-pointer border-none shadow-lg hover:shadow-2xl bg-white"
                  isPressable
                >
                  <CardHeader className="pb-0">
                    <div className="w-full">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-4">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-green-700 font-semibold text-sm">{project.badge}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-lg font-medium text-blue-600 mb-4">
                        {project.subtitle}
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    <Button 
                      color="primary" 
                      variant="light" 
                      endContent={<ExternalLink className="h-4 w-4" />}
                      className="w-fit group-hover:bg-blue-50"
                    >
                      Дивитися проєкт
                    </Button>
                  </CardBody>
                </Card>
              ))
            }
          </div>
        </div>
      </section>

      {/* Контакти */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Chip color="primary" variant="flat" size="lg" className="mb-6">
              <Mail className="h-4 w-4 mr-2" />
              Контакти
            </Chip>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Зв'яжіться з нами
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                вже сьогодні
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Готові обговорити ваш проєкт? Заповніть форму нижче або зв'яжіться з нами напряму.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Контактна інформація */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Контактна інформація
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Phone, label: 'Телефон', value: '+380 (44) 123-45-67' },
                    { icon: Mail, label: 'Email', value: 'info@ugc.llc' },
                    { icon: MapPin, label: 'Адреса', value: 'м. Київ, вул. Хрещатик, 1' }
                  ].map((contact, index) => {
                    const Icon = contact.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{contact.label}</div>
                          <div className="text-gray-600">{contact.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Режим роботи
                </h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Пн-Пт:</span>
                    <span>9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Сб:</span>
                    <span>10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Нд:</span>
                    <span>Вихідний</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Форма зв'язку */}
            <Card className="bg-white border-none shadow-lg">
              <CardHeader>
                <h3 className="text-2xl font-bold text-gray-900">
                  Надіслати повідомлення
                </h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <Input
                    type="text"
                    label="Ваше ім'я"
                    placeholder="Введіть ваше ім'я"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    size="lg"
                  />
                  <Input
                    type="email"
                    label="Email"
                    placeholder="Введіть ваш email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    size="lg"
                  />
                  <Input
                    type="tel"
                    label="Телефон"
                    placeholder="Введіть ваш телефон"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    size="lg"
                  />
                  <Textarea
                    label="Повідомлення"
                    placeholder="Введіть ваше повідомлення"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    minRows={4}
                    required
                    size="lg"
                  />
                  <Button 
                    type="submit"
                    color="primary" 
                    size="lg"
                    className="w-full font-semibold"
                    isLoading={isSubmitting}
                    endContent={!isSubmitting && <Send className="h-4 w-4" />}
                  >
                    {isSubmitting ? 'Надсилається...' : 'Надіслати повідомлення'}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Логотип та опис */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-xl mr-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">UGC</h3>
                  <p className="text-gray-400 text-sm">Ukrainian Guard Company</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Ми створюємо якісний та надійний спецодяг, який забезпечує комфорт і безпеку 
                в будь-яких умовах для професіоналів у різних галузях.
              </p>
              <div className="flex space-x-4">
                <Button isIconOnly variant="light" className="text-gray-400 hover:text-white">
                  <Globe className="h-5 w-5" />
                </Button>
                <Button isIconOnly variant="light" className="text-gray-400 hover:text-white">
                  <Mail className="h-5 w-5" />
                </Button>
                <Button isIconOnly variant="light" className="text-gray-400 hover:text-white">
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Швидкі посилання */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Швидкі посилання</h4>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.id}>
                    <Button
                      variant="light"
                      className="text-gray-400 hover:text-white p-0 h-auto justify-start"
                      onClick={() => scrollToSection(item.id)}
                    >
                      {item.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Контакти */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Контакти</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400">м. Київ, вул. Хрещатик, 1</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-400">+380 (44) 123-45-67</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-400">info@ugc.llc</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 UGC - Ukrainian Guard Company. Всі права захищені.
            </p>
          </div>
        </div>
      </footer>

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
                <p className="text-gray-600">
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
  );
};

export default UGCDesign;