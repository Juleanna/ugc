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
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = sections[index];
          }
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Функція прокрутки до секції
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Обробка форми
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setFormData({ name: '', email: '', phone: '', message: '' });
        alert('Повідомлення надіслано успішно!');
      } else {
        throw new Error('Помилка відправки');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Помилка відправки повідомлення. Спробуйте пізніше.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* Об'єднаний фоновий компонент з усіма ефектами */}
      <UnifiedBackground />
      
      {/* Індикатор прогресу скролу */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Навігація */}
      <ModernNavigation 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* Hero секція */}
      <section id="home" className="relative min-h-screen">
        <EnhancedHeroSection 
          scrollToSection={scrollToSection}
          data={data}
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
          activeSection === 'home' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <svg 
          className="w-6 h-6 mx-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Індикатор активної секції */}
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
        <div className="space-y-3">
          {['home', 'about', 'services', 'projects', 'contact'].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`block w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === section 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={section.charAt(0).toUpperCase() + section.slice(1)}
            />
          ))}
        </div>
      </div>

      {/* Глобальні стилі */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        
        /* Кастомний скролбар */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgb(59, 130, 246), rgb(168, 85, 247));
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgb(37, 99, 235), rgb(147, 51, 234));
        }

        /* Покращені анімації */
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Анімований градієнтний текст */
        .gradient-text-animated {
          background: linear-gradient(-45deg, #3b82f6, #1d4ed8, #6366f1, #8b5cf6);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Паралакс ефект для секцій */
        .parallax-section {
          transform: translateZ(0);
          will-change: transform;
        }

        /* Покращений hover ефект */
        .enhanced-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .enhanced-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default FinalUGCDesign;