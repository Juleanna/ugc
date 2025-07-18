import React, { useState, useEffect } from 'react';

// Імпорт інтерактивних компонентів
import InteractiveBackground from './InteractiveBackground';
import FloatingElements from './FloatingElements';
import ModernNavigation from './ModernNavigation';
import EnhancedHeroSection from './EnhancedHeroSection';

// Імпорт існуючих секцій
import AboutSection from '../AboutSection';
import ServicesSection from '../ServicesSection';
import ProjectsSection from '../ProjectsSection';
import ContactSection from '../ContactSection';
import Footer from '../Footer';

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

const InteractiveUGCDesign = () => {
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

  // Відстеження активної секції при скролі
  useEffect(() => {
    const handleScroll = () => {
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
        // Показуємо красиве повідомлення про успіх
        showSuccessNotification('Дякуємо! Ваше повідомлення відправлено.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        showErrorNotification('Помилка при відправці. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorNotification('Помилка при відправці. Спробуйте ще раз.');
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

  // Функції для показу нотифікацій
  const showSuccessNotification = (message) => {
    // Тут можна додати toast нотифікацію
    alert(message); // Тимчасово
  };

  const showErrorNotification = (message) => {
    // Тут можна додати toast нотифікацію
    alert(message); // Тимчасово
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Інтерактивний фон з частинками */}
      <InteractiveBackground />
      
      {/* Плаваючі декоративні елементи */}
      <FloatingElements />
      
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
        <div className="relative z-20 bg-white/80 backdrop-blur-sm">
          <AboutSection />
        </div>

        {/* Послуги */}
        <div className="relative z-20 bg-gray-50/80 backdrop-blur-sm">
          <ServicesSection 
            data={data}
          />
        </div>

        {/* Проєкти */}
        <div className="relative z-20 bg-white/80 backdrop-blur-sm">
          <ProjectsSection 
            data={data}
          />
        </div>

        {/* Контакти */}
        <div className="relative z-20 bg-gray-50/80 backdrop-blur-sm">
          <ContactSection 
            formData={formData}
            setFormData={setFormData}
            handleFormSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Футер */}
        <div className="relative z-20">
          <Footer 
            scrollToSection={scrollToSection}
          />
        </div>
      </main>

      {/* Лоадер */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Завантаження...</p>
          </div>
        </div>
      )}

      {/* Кнопка швидкого повернення наверх */}
      <button
        onClick={() => scrollToSection('home')}
        className={`fixed bottom-8 right-8 z-30 w-12 h-12 bg-gradient-blue text-white rounded-full shadow-blue hover:shadow-2xl transform transition-all duration-300 ${
          activeSection === 'home' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
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

      {/* Додатковий стиль для smooth scroll */}
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
          background: linear-gradient(135deg, rgb(59, 130, 246), rgb(29, 78, 216));
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgb(37, 99, 235), rgb(30, 64, 175));
        }

        /* Анімації для підвантаження секцій */
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

        /* Покращені hover ефекти */
        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
        }

        /* Gradient text анімація */
        .gradient-text-animated {
          background: linear-gradient(-45deg, #3b82f6, #1d4ed8, #6366f1, #8b5cf6);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default InteractiveUGCDesign;