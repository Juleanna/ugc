import React, { useState, useEffect } from 'react';

// Імпорт компонентів
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ServicesSection from './ServicesSection';
import ProjectsSection from './ProjectsSection';
import ContactSection from './ContactSection';
import Footer from './Footer';

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
      <Navigation 
        activeSection={activeSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
      />

      {/* Головна секція */}
      <HeroSection 
        scrollToSection={scrollToSection}
      />

      {/* Про нас */}
      <AboutSection />

      {/* Послуги */}
      <ServicesSection 
        data={data}
      />

      {/* Проєкти */}
      <ProjectsSection 
        data={data}
      />

      {/* Контакти */}
      <ContactSection 
        formData={formData}
        setFormData={setFormData}
        handleFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Футер */}
      <Footer 
        scrollToSection={scrollToSection}
      />
    </div>
  );
};

export default UGCDesign;