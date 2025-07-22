import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, Home, Info, Briefcase, FolderOpen, Phone, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const ModernStickyNavbar = ({ activeSection, scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { t, currentLanguage, changeLanguage } = useTranslation();

  // Доступні мови
  const languages = [
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  // Навігаційні елементи
  const navigationItems = [
    { id: 'home', label: 'nav.home', icon: Home },
    { id: 'about', label: 'nav.about', icon: Info },
    { id: 'services', label: 'nav.services', icon: Briefcase },
    { id: 'projects', label: 'nav.projects', icon: FolderOpen },
    { id: 'contact', label: 'nav.contact', icon: Phone },
  ];

  // Обробка кліку по навігації
  const handleNavClick = (sectionId) => {
    setIsMenuOpen(false);
    if (scrollToSection) {
      scrollToSection(sectionId);
    }
  };

  // Обробка зміни мови
  const handleLanguageChange = async (langCode) => {
    setIsLangMenuOpen(false);
    await changeLanguage(langCode);
  };

  // Функція для отримання перекладу з fallback
  const getTranslation = (key, fallback) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  // Поточна мова для відображення
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <>
      {/* Липке меню */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-20">
            
            {/* Логотип */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                UGC
              </div>
              <div className="text-sm font-medium text-gray-600">
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
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{getTranslation(item.label, item.label)}</span>
                  </div>
                  
                  {/* Активний індикатор */}
                  {activeSection === item.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Перемикач мови та мобільне меню */}
            <div className="flex items-center space-x-4">
              
              {/* Перемикач мови (десктоп) */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {currentLang.flag} {currentLang.code.toUpperCase()}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    isLangMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Випадаюче меню мов */}
                {isLangMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-60">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                          currentLanguage === language.code 
                            ? 'text-blue-600 bg-blue-50 font-medium' 
                            : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{language.flag}</span>
                          <span>{language.name}</span>
                          {currentLanguage === language.code && (
                            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопка мобільного меню */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden relative z-50 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Мобільне меню */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Затемнений фон */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Мобільне меню */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pt-24">
            
            {/* Мобільна навігація */}
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{getTranslation(item.label, item.label)}</span>
                  </div>
                </button>
              ))}
            </nav>

            {/* Мобільний перемикач мови */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {getTranslation('common.language', 'Мова')}
                </span>
              </div>
              
              <div className="space-y-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      currentLanguage === language.code 
                        ? 'text-blue-600 bg-blue-50 border border-blue-200 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                      {currentLanguage === language.code && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Клік поза межами для закриття випадаючого меню мови */}
      {isLangMenuOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setIsLangMenuOpen(false)}
        />
      )}
    </>
  );
};

export default ModernStickyNavbar;