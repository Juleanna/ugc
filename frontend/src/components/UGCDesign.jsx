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
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Дякуємо! Ваше повідомлення відправлено.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        alert('Помилка при відправці. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Помилка при відправці. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Навігація */}
      <Navbar 
        className="navbar-glass fixed top-0 z-50 w-full"
        maxWidth="full"
        height="4rem"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent>
          <NavbarBrand>
            <Globe className="w-4 h-4 ml-1" /><span className="font-bold text-inherit">
                UGC</span>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden md:flex gap-4" justify="center">
          {navigation.map((item) => (
            <NavbarItem key={item.id}>
              <Button
                variant={activeSection === item.id ? "solid" : "light"}
                color="primary"
                size="sm"
                onPress={() => scrollToSection(item.id)}
                className="font-medium"
              >
                {item.label}
              </Button>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className=""
          />
        </NavbarContent>

        <NavbarMenu>
          {navigation.map((item) => (
            <NavbarMenuItem key={item.id}>
              <Button
                variant="light"
                size="lg"
                onPress={() => scrollToSection(item.id)}
                className="w-full justify-start"
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </Button>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>

      {/* Головна секція */}
      <section id="home" className="section-hero section-padding">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Професійний одяг для
              <br />
              <span className="text-gradient-blue">кожної сфери</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8  animate-slide-up">
              Ми створюємо високоякісний спецодяг, військову форму та корпоративний одяг 
              для українських підприємств та організацій.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                color="primary" 
                size="lg"
                className="btn-primary px-8 py-6 font-semibold"
                onPress={() => scrollToSection('projects')}
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                Наші проєкти
              </Button>
              <Button 
                variant="bordered"
                size="lg"
                className="px-8 py-6 font-semibold border-2"
                onPress={() => scrollToSection('about')}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Дізнатися більше
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { value: '5+', label: 'Років досвіду' },
                { value: '100+', label: 'Проєктів' },
                { value: '50+', label: 'Клієнтів' },
                { value: '24/7', label: 'Підтримка' }
              ].map((stat, index) => (
                <Card key={index} className="glass p-4 md:p-6 text-center">
                  <CardBody className="p-0">
                    <div className="text-2xl md:text-3xl font-bold text-gradient-blue mb-2">
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
      <section id="about" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Chip color="primary" variant="flat" size="lg" className="mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Про компанію
            </Chip>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Наш багаторічний досвід
              <br />
              <span className="text-gradient-blue">гарантує якість</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 ">
              Ми створюємо одяг, який забезпечує безпеку і комфорт у будь-яких умовах. 
              Наша продукція відповідає найвищим стандартам якості.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Shield,
                title: 'Надійність',
                description: 'Використовуємо тільки перевірені матеріали та технології'
              },
              {
                icon: Award,
                title: 'Якість',
                description: 'Контроль якості на кожному етапі виробництва'
              },
              {
                icon: Users,
                title: 'Довіра',
                description: 'Понад 50 задоволених клієнтів по всій Україні'
              }
            ].map((item, index) => (
              <Card key={index} className="hover-lift p-6 text-center">
                <CardBody className="p-0">
                  <div className="bg-gradient-blue p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Послуги */}
      <section id="services" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Chip color="primary" variant="flat" size="lg" className="mb-6">
              <Briefcase className="w-4 h-4 mr-2" />
              Наші послуги
            </Chip>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Повний цикл виробництва
              <br />
              <span className="text-gradient-blue">професійного одягу</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 ">
              Від проєктування до готового виробу - ми забезпечуємо якість на кожному етапі.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Якщо є дані з API, використовуємо їх */}
            {data.services.length > 0 ? 
              data.services.map((service, index) => {
                const handleServiceClick = () => {
                  console.log('Clicked service:', service.name);
                };

                return (
                  <Card 
                    key={service.id || index} 
                    className="hover-lift cursor-pointer"
                    onPress={handleServiceClick}
                  >
                    <CardHeader className="flex gap-3 items-start pb-2">
                      <div className="bg-gradient-blue p-3 rounded-xl">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {service.name}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <p className="text-gray-600 mb-4">
                        {service.short_description || service.description}
                      </p>
                      <div 
                        className="inline-flex items-center text-primary cursor-pointer hover:text-blue-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Clicked details for:', service.name);
                        }}
                      >
                        <span className="text-sm font-medium">Детальніше</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardBody>
                  </Card>
                );
              }) :
              // Якщо даних немає, показуємо демо-дані
              [
                {
                  title: 'Військова форма',
                  description: 'Спеціалізована форма для військових підрозділів з підвищеними захисними властивостями',
                  icon: Shield
                },
                {
                  title: 'Медичний одяг',
                  description: 'Комфортний і функціональний одяг для медичних працівників',
                  icon: Heart
                },
                {
                  title: 'Робочий одяг',
                  description: 'Міцний і практичний одяг для різних сфер діяльності',
                  icon: Building
                },
                {
                  title: 'Корпоративний одяг',
                  description: 'Стильний корпоративний одяг для створення єдиного іміджу компанії',
                  icon: Users
                },
                {
                  title: 'Спеціалізований одяг',
                  description: 'Одяг для особливих умов праці з підвищеними вимогами безпеки',
                  icon: Zap
                },
                {
                  title: 'Аксесуари',
                  description: 'Додаткові елементи та аксесуари для комплектації одягу',
                  icon: Star
                }
              ].map((service, index) => {
                const Icon = service.icon;
                const handleServiceClick = () => {
                  console.log('Clicked service:', service.title);
                };

                return (
                  <Card 
                    key={index} 
                    className="hover-lift cursor-pointer"
                    onPress={handleServiceClick}
                  >
                    <CardHeader className="flex gap-3 items-start pb-2">
                      <div className="bg-gradient-blue p-3 rounded-xl">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {service.title}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <p className="text-gray-600 mb-4">
                        {service.description}
                      </p>
                      <div 
                        className="inline-flex items-center text-primary cursor-pointer hover:text-blue-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Clicked details for:', service.title);
                        }}
                      >
                        <span className="text-sm font-medium">Детальніше</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            }
          </div>
        </div>
      </section>

      {/* Проєкти */}
      <section id="projects" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Chip color="warning" variant="flat" size="lg" className="mb-6">
              <FolderOpen className="w-4 h-4 mr-2" />
              Наші проєкти
            </Chip>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Успішні реалізації
              <br />
              <span className="text-gradient-blue">та довіра клієнтів</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Якщо є дані з API */}
            {data.projects.length > 0 ?
              data.projects.slice(0, 2).map((project, index) => {
                const handleProjectClick = () => {
                  console.log('Clicked project:', project.client || project.name);
                };

                return (
                  <Card 
                    key={project.id || index} 
                    className="hover-lift cursor-pointer"
                    onPress={handleProjectClick}
                  >
                    <CardHeader className="pb-0">
                      <div className="w-full">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-4">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-green-700 font-semibold text-sm">Успішний проєкт</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {project.client || project.name}
                        </h3>
                        <p className="text-lg font-medium text-primary mb-4">
                          {project.short_description || project.description}
                        </p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {project.detailed_description || project.description}
                      </p>
                      <div 
                        className="inline-flex items-center text-primary cursor-pointer hover:text-blue-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('View project details:', project.client || project.name);
                        }}
                      >
                        <span className="text-sm font-medium">Дивитися проєкт</span>
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </div>
                    </CardBody>
                  </Card>
                );
              }) :
              // Демо-дані якщо немає даних з API
              [
                {
                  title: 'Національна Гвардія України',
                  subtitle: 'Захист і комфорт для наших захисників',
                  description: 'Національна Гвардія України забезпечує своїх працівників якісним спецодягом, який відповідає найвищим стандартам захисту і комфорту в різних умовах служби.',
                  badge: 'Успішний проєкт'
                },
                {
                  title: 'Міністерство оборони України',
                  subtitle: 'Вітро-вологозахисний костюм для військових',
                  description: 'Міністерство оборони України замовило спеціальний вітро-вологозахисний костюм, який забезпечує надійний захист і комфорт для військових у різних погодних умовах.',
                  badge: 'Успішний проєкт'
                }
              ].map((project, index) => {
                const handleProjectClick = () => {
                  console.log('Clicked project:', project.title);
                };

                return (
                  <Card 
                    key={index} 
                    className="hover-lift cursor-pointer"
                    onPress={handleProjectClick}
                  >
                    <CardHeader className="pb-0">
                      <div className="w-full">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-4">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-green-700 font-semibold text-sm">{project.badge}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {project.title}
                        </h3>
                        <p className="text-lg font-medium text-primary mb-4">
                          {project.subtitle}
                        </p>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {project.description}
                      </p>
                      <div 
                        className="inline-flex items-center text-primary cursor-pointer hover:text-blue-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('View project details:', project.title);
                        }}
                      >
                        <span className="text-sm font-medium">Дивитися проєкт</span>
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            }
          </div>
        </div>
      </section>

      {/* Контакти */}
      <section id="contact" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Chip color="success" variant="flat" size="lg" className="mb-6">
              <Mail className="w-4 h-4 mr-2" />
              Контакти
            </Chip>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Зв'яжіться з нами
              <br />
              <span className="text-gradient-blue">прямо зараз</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 ">
              Готові допомогти вам з будь-якими питаннями та замовленнями.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Контактна інформація */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-6">Наші контакти</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-blue p-3 rounded-full">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Телефон</p>
                    <p className="text-gray-600">+38 (067) 123-45-67</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-blue p-3 rounded-full">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">info@ugc.ua</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-blue p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Адреса</p>
                    <p className="text-gray-600">м. Київ, вул. Промислова, 15</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Форма зворотного зв'язку */}
            <Card className="p-6">
              <CardBody className="p-0">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <Input
                    label="Ім'я"
                    placeholder="Ваше ім'я"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="form-input"
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="form-input"
                  />
                  
                  <Input
                    label="Телефон"
                    type="tel"
                    placeholder="+38 (067) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="form-input"
                  />
                  
                  <Textarea
                    label="Повідомлення"
                    placeholder="Розкажіть про ваш проєкт..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    className="form-input"
                    rows={4}
                  />
                  
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="btn-primary w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-pulse mr-2">⏳</div>
                        Відправляємо...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Відправити повідомлення
                      </>
                    )}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold mb-4">UGC</h3>
              <p className="text-gray-400">
                Професійний одяг для кожної сфери діяльності
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Швидкі посилання</h4>
              <div className="space-y-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Контакти</h4>
              <div className="space-y-2 text-gray-400">
                <p>+38 (067) 123-45-67</p>
                <p>info@ugc.ua</p>
                <p>м. Київ, вул. Промислова, 15</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 UGC. Всі права захищені.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UGCDesign;