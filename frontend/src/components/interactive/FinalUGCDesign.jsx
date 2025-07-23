// frontend/src/components/interactive/FinalUGCDesign.jsx
// Main component without API call duplication

import React, { useState, useEffect, useMemo } from 'react';

// Import unified API solution
import { 
  APIProvider, 
  useHomepageData, 
  useServicesData, 
  useProjectsData,
  useHeroData,
  useFormSubmission,
  useCacheManager
} from '../../hooks/useUnifiedAPI';

// Import components
import UnifiedBackground from './UnifiedBackground';
import ModernNavigation from './ModernNavigation';
import EnhancedHeroSection from './EnhancedHeroSection';

// Import sections
import AboutSection from '../AboutSection';
import ServicesSection from '../ServicesSection';
import ProjectsSection from '../ProjectsSection';
import ContactSection from '../ContactSection';
import Footer from '../Footer';

// Internal component with API context access
const FinalUGCDesignContent = () => {
  // Local state
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // API hooks (without request duplication)
  const homepage = useHomepageData();
  const services = useServicesData();
  const projects = useProjectsData();
  const heroData = useHeroData();
  const { submitForm, isSubmitting } = useFormSubmission();
  const { preloadCriticalData, getCacheStats } = useCacheManager();

  // Combined data for components
  const unifiedData = useMemo(() => ({
    homepage: homepage.data,
    services: services.data,
    projects: projects.data,
    hero: heroData.data,
    isLoading: homepage.isLoading || services.isLoading || projects.isLoading,
    hasErrors: !!(homepage.error || services.error || projects.error)
  }), [homepage, services, projects, heroData]);

  // Initialization and preloading
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initializing FinalUGCDesign...');
        
        // Preload critical data
        const preloadResult = await preloadCriticalData();
        console.log('📊 Preload result:', preloadResult);
        
        setIsInitialized(true);
        
        // Log cache statistics
        const cacheStats = getCacheStats();
        console.log('💾 Cache stats:', cacheStats);
        
      } catch (error) {
        console.error('❌ Initialization error:', error);
        setIsInitialized(true); // Allow to continue anyway
      }
    };

    initialize();
  }, [preloadCriticalData, getCacheStats]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);

      // Determine active section
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

  // Scroll to section function
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

  // Contact form handler
  const handleContactSubmit = async (formData) => {
    try {
      const result = await submitForm('/contact-inquiries/', formData);
      
      if (result.success) {
        console.log('✅ Contact form submitted successfully');
        return { success: true, message: 'Повідомлення відправлено успішно!' };
      } else {
        console.error('❌ Form submission error:', result.error);
        return { success: false, message: result.error || 'Помилка відправки' };
      }
    } catch (error) {
      console.error('❌ Exception during form submission:', error);
      return { success: false, message: 'Виникла несподівана помилка' };
    }
  };

  // Show loading only during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Ініціалізація додатку...</p>
          <p className="text-gray-500 text-sm mt-2">Завантаження критичних даних</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Unified background */}
      <UnifiedBackground />
      
      {/* Scroll progress */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 z-50 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />
      
      {/* Navigation */}
      <ModernNavigation 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        isLoading={unifiedData.isLoading}
      />
      
      {/* Main content */}
      <main className="relative z-10">
        
        {/* Hero section */}
        <EnhancedHeroSection 
          scrollToSection={scrollToSection}
          heroData={unifiedData.hero}
          isLoading={unifiedData.isLoading}
        />
        
        {/* About us */}
        <AboutSection 
          data={unifiedData.homepage}
          scrollToSection={scrollToSection}
        />
        
        {/* Services */}
        <ServicesSection 
          data={{ services: unifiedData.services }}
          scrollToSection={scrollToSection}
        />
        
        {/* Projects */}
        <ProjectsSection 
          data={{ projects: unifiedData.projects }}
          scrollToSection={scrollToSection}
        />
        
        {/* Contacts */}
        <ContactSection 
          onSubmit={handleContactSubmit}
          isSubmitting={isSubmitting}
          scrollToSection={scrollToSection}
        />
        
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Error indicator (dev mode only) */}
      {process.env.NODE_ENV === 'development' && unifiedData.hasErrors && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <span className="text-sm">⚠️ Деякі API endpoints недоступні</span>
            <button 
              onClick={() => window.location.reload()}
              className="ml-2 text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700"
            >
              Перезавантажити
            </button>
          </div>
        </div>
      )}
      
      {/* Debug information (dev mode only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
          <div>Active: {activeSection}</div>
          <div>Progress: {Math.round(scrollProgress)}%</div>
          <div>Services: {unifiedData.services?.length || 0}</div>
          <div>Projects: {unifiedData.projects?.length || 0}</div>
          <div>Loading: {unifiedData.isLoading ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

// Main component with provider
const FinalUGCDesign = () => {
  return (
    <APIProvider>
      <FinalUGCDesignContent />
    </APIProvider>
  );
};

export default FinalUGCDesign;