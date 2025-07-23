// frontend/src/components/interactive/FinalUGCDesign.jsx
import React, { useState, useEffect } from 'react';

// Імпорт об'єднаного фонового компоненту
import UnifiedBackground from './UnifiedBackground';
import ModernNavigation from './ModernNavigation';
import EnhancedHeroSection from './EnhancedHeroSection';

// Імпорт існуючих секцій
import AboutSection from '../AboutSection';
import ServicesSection from '../ServicesSection';
import ProjectsSection from '../ProjectsSection';
import ContactSection from '../ContactSection';
import Footer from '../Footer';

// API конфігурація
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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

const FinalUGCDesign = () => {
  const [activeSection, setActiveSection] = useState('home');
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
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Завантаження даних з API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // ВИПРАВЛЕНО: Додано відсутній виклик API для translations
      const [servicesResponse, projectsResponse, translationsResponse] = await Promise.all([
        apiCall('/services/'),
        apiCall('/projects/'),
        apiCall('/translations/uk/all/') // Додано відсутню лінію
      ]);

      setData({
        services: servicesResponse?.results || [],
        projects: projectsResponse?.results || [],
        translations: translationsResponse?.translations || {}
      });
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Відстеження скролу
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);

      // Визначення активної секції
      const sections = ['home', 'about', 'services', 'projects', 'contact'];
      const sectionElements = sections.map(id => document.getElementById(id));
      
      let current = 'home';
      sectionElements.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
            current = sections[index];
          }
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Плавний скрол до секції
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId);
    }
  };

  // Обробка форми
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await apiCall('/contacts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response) {
        // Успішно відправлено
        setFormData({ name: '', email: '', phone: '', message: '' });
        alert('Повідомлення надіслано успішно!');
      }
    } catch (error) {
      console.error('Помилка відправки:', error);
      alert('Помилка відправки. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Уніфікований фоновий компонент */}
      <UnifiedBackground />
      
      {/* Прогрес скролу */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/30 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Навігація */}
      <ModernNavigation 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* Головна секція */}
      <section id="home" className="relative min-h-screen">
        <EnhancedHeroSection 
          activeSection={activeSection}
          scrollToSection={scrollToSection}
          heroData={data.hero}
        />
      </section>

      {/* Про нас */}
      <section id="about" className="relative bg-white/80 backdrop-blur-sm">
        <div className="parallax-section">
          <AboutSection data={data} />
        </div>
      </section>

      {/* Послуги */}
      <section id="services" className="relative bg-gray-50/80 backdrop-blur-sm">
        <div className="parallax-section">
          <ServicesSection data={data} />
        </div>
      </section>

      {/* Проекти */}
      <section id="projects" className="relative bg-white/80 backdrop-blur-sm">
        <div className="parallax-section">
          <ProjectsSection data={data} />
        </div>
      </section>

      {/* Контакти */}
      <section id="contact" className="relative bg-gray-50/80 backdrop-blur-sm">
        <div className="parallax-section">
          <ContactSection 
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            translations={data.translations}
          />
        </div>
      </section>

      {/* Футер */}
      <Footer translations={data.translations} />

      {/* Лоадер */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 border-b-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-gray-600 font-medium text-lg">Завантаження UGC...</p>
            <p className="text-gray-400 text-sm mt-2">Готуємо для вас найкраще</p>
          </div>
        </div>
      )}

      {/* Кнопка швидкого повернення наверх */}
      <button
        onClick={() => scrollToSection('home')}
        className={`fixed bottom-8 right-8 z-30 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 ${
          activeSection === 'home' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Повернутися наверх"
      >
        <svg 
          className="w-6 h-6 mx-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
      </button>
    </div>
  );
};

export default FinalUGCDesign;