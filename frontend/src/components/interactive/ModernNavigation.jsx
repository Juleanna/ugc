import React, { useState, useEffect } from 'react';
import { Button } from "@nextui-org/react";
import { Home, Info, Briefcase, FolderOpen, Mail, Menu, X } from 'lucide-react';

const ModernNavigation = ({ activeSection, scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigation = [
    { id: 'home', label: 'Головна', icon: Home },
    { id: 'about', label: 'Про нас', icon: Info },
    { id: 'services', label: 'Послуги', icon: Briefcase },
    { id: 'projects', label: 'Проєкти', icon: FolderOpen },
    { id: 'contact', label: 'Контакти', icon: Mail }
  ];

  // Відстеження скролу для зміни стилю навігації
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClick = (sectionId) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Основна навігація */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/20 shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Логотип */}
            <div className="flex items-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-blue bg-clip-text text-transparent">
                UGC
              </div>
            </div>

            {/* Десктопне меню */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "solid" : "light"}
                  color="primary"
                  size="sm"
                  onPress={() => handleMenuClick(item.id)}
                  className={`relative font-medium px-4 py-2 rounded-full transition-all duration-300 ${
                    activeSection === item.id 
                      ? 'bg-gradient-blue text-white shadow-blue' 
                      : 'hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                  )}
                </Button>
              ))}
            </div>

            {/* Мобільний бургер */}
            <div className="md:hidden">
              <Button
                variant="light"
                size="sm"
                onPress={toggleMenu}
                className="p-2 rounded-full hover:bg-blue-50"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобільне меню */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          isMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Оверлей */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Меню панель */}
        <div 
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-500 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Заголовок меню */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
              <div className="text-2xl font-bold bg-gradient-blue bg-clip-text text-transparent">
                UGC
              </div>
              <Button
                variant="light"
                size="sm"
                onPress={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-gray-700" />
              </Button>
            </div>

            {/* Навігаційні елементи */}
            <div className="flex-1 px-6 py-8">
              <div className="space-y-2">
                {navigation.map((item, index) => (
                  <div
                    key={item.id}
                    className={`transform transition-all duration-500 ${
                      isMenuOpen 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <Button
                      variant="light"
                      size="lg"
                      onPress={() => handleMenuClick(item.id)}
                      className={`w-full justify-start px-4 py-4 rounded-xl transition-all duration-300 ${
                        activeSection === item.id
                          ? 'bg-gradient-blue text-white shadow-blue'
                          : 'hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                      {activeSection === item.id && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Футер меню */}
            <div className="p-6 border-t border-gray-200/50">
              <div className="text-center text-sm text-gray-500">
                <p>Професійний одяг</p>
                <p className="font-medium text-gray-700">для кожної сфери</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Індикатор прогресу скролу */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/20">
        <div 
          className="h-full bg-gradient-blue transition-all duration-300 ease-out"
          style={{
            width: `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%`
          }}
        />
      </div>
    </>
  );
};

export default ModernNavigation;