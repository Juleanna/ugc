import React, { useState, useEffect } from 'react';

// Імпорт нового реалістичного фону
import MeshGradientBackground from './MeshGradientBackground';
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

      // Визначаємо активну секцію
      const sections = ['home', 'about', 'services', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        showNotification('success', 'Дякуємо! Ваше повідомлення відправлено.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        showNotification('error', 'Помилка при відправці. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Помилка при відправці. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setActiveSection(sectionId);
  };

  // Функція показу нотифікацій
  const showNotification = (type, message) => {
    // Створюємо красиву нотифікацію
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-500 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    notification.style.transform = 'translateX(100%)';
    
    document.body.appendChild(notification);
    
    // Анімація появи
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматичне зникнення
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Реалістичний фон як на ugc.llc */}
      <MeshGradientBackground />
      
      {/* Прогрес-бар скролу */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/20">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Сучасна навігація */}
      <ModernNavigation 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* Основний контент */}
      <main className="relative z-10">
        {/* Покращена головна секція */}
        <EnhancedHeroSection 
          scrollToSection={scrollToSection}
        />

        {/* Про нас */}
        <div className="relative z-20" style={{ backdropFilter: 'blur(1px)' }}>
          <AboutSection />
        </div>

        {/* Послуги */}
        <div className="relative z-20" style={{ backdropFilter: 'blur(1px)' }}>
          <ServicesSection data={data} />
        </div>

        {/* Проєкти */}
        <div className="relative z-20" style={{ backdropFilter: 'blur(1px)' }}>
          <ProjectsSection data={data} />
        </div>

        {/* Контакти */}
        <div className="relative z-20" style={{ backdropFilter: 'blur(1px)' }}>
          <ContactSection 
            formData={formData}
            setFormData={setFormData}
            handleFormSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Футер */}
        <div className="relative z-20">
          <Footer scrollToSection={scrollToSection} />
        </div>
      </main>

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
      <style jsx global>{`
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