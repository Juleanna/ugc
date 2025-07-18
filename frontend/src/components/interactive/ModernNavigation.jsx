import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, Home, Info, Briefcase, FolderOpen, Users, Phone } from 'lucide-react';

const ModernStickyNavbar = ({ activeSection, scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Навігаційні елементи відповідно до ваших існуючих секцій
  const navigationItems = [
    { id: 'home', label: 'Головна', icon: Home },
    { id: 'about', label: 'Про нас', icon: Info },
    { id: 'services', label: 'Послуги', icon: Briefcase },
    { id: 'projects', label: 'Проєкти', icon: FolderOpen },
    { id: 'contact', label: 'Контакти', icon: Phone },
  ];

  // Відстеження скролу
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Обробка кліку по навігації
  const handleNavClick = (sectionId) => {
    setIsMenuOpen(false);
    if (scrollToSection) {
      scrollToSection(sectionId);
    }
  };

  return (
    <>
      {/* Липке меню */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/30' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-20">
            
            {/* Логотип */}
            <div className="flex items-center space-x-3">
              <div className={`text-3xl font-bold transition-all duration-300 ${
                isScrolled 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                  : 'text-white drop-shadow-lg'
              }`}>
                UGC
              </div>
              <div className={`text-sm font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-600' : 'text-white/90'
              }`}>
                Professional Clothing
              </div>
            </div>

            {/* Десктопна навігація */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                    activeSection === item.id
                      ? isScrolled
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-white bg-white/20'
                      : isScrolled
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        : 'text-white/90 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  
                  {/* Індикатор активної секції */}
                  {activeSection === item.id && (
                    <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      isScrolled 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 opacity-10' 
                        : 'bg-white/30 backdrop-blur-sm'
                    }`} />
                  )}
                  
                  {/* Hover ефект */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </button>
              ))}
            </div>

            {/* CTA кнопка */}
            <div className="hidden lg:block">
              <Button
                className={`font-medium px-6 py-2 rounded-xl transition-all duration-300 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
                    : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30'
                }`}
                onClick={() => handleNavClick('contact')}
              >
                Зв'язатися з нами
              </Button>
            </div>

            {/* Мобільне меню кнопка */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Прогрес бар скролу */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200/30">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{
              width: `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%`
            }}
          />
        </div>
      </div>

      {/* Мобільне меню */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        
        {/* Оверлей */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Панель меню */}
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-500 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          
          <div className="flex flex-col h-full">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UGC
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Навігаційні елементи */}
            <div className="flex-1 px-6 py-8">
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`transform transition-all duration-500 ${
                        isMenuOpen 
                          ? 'translate-x-0 opacity-100' 
                          : 'translate-x-8 opacity-0'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center px-4 py-4 rounded-xl transition-all duration-300 ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                        {activeSection === item.id && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Футер мобільного меню */}
            <div className="p-6 border-t border-gray-200/50">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                onClick={() => handleNavClick('contact')}
              >
                Зв'язатися з нами
              </Button>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Професійний одяг</p>
                <p className="font-medium text-gray-700">для кожної сфери</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernStickyNavbar;