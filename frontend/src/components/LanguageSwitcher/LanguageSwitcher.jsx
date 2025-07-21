// frontend/src/components/LanguageSwitcher/LanguageSwitcher.jsx
import React, { useState } from 'react';
import { useTranslation, useAvailableLanguages } from '../../hooks/useTranslation';
import './LanguageSwitcher.css';

const LanguageSwitcher = ({ className = '', showFlags = true, showText = true }) => {
  const { currentLanguage, changeLanguage, isLoading } = useTranslation();
  const { languages } = useAvailableLanguages();
  const [isOpen, setIsOpen] = useState(false);

  // Конфігурація мов
  const languageConfig = {
    uk: {
      name: 'Українська',
      shortName: 'УК',
      flag: '🇺🇦'
    },
    en: {
      name: 'English',
      shortName: 'EN',
      flag: '🇬🇧'
    }
  };

  const handleLanguageChange = async (lang) => {
    if (lang !== currentLanguage && !isLoading) {
      await changeLanguage(lang);
      setIsOpen(false);
    }
  };

  const currentLangConfig = languageConfig[currentLanguage] || languageConfig.uk;

  return (
    <div className={`language-switcher ${className}`}>
      <button
        className={`language-switcher__trigger ${isOpen ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-label="Вибрати мову"
      >
        {showFlags && (
          <span className="language-switcher__flag">
            {currentLangConfig.flag}
          </span>
        )}
        {showText && (
          <span className="language-switcher__text">
            {currentLangConfig.shortName}
          </span>
        )}
        <span className={`language-switcher__arrow ${isOpen ? 'up' : 'down'}`}>
          ▼
        </span>
        {isLoading && (
          <span className="language-switcher__loader">⟳</span>
        )}
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown">
          {languages.map((lang) => {
            const config = languageConfig[lang];
            if (!config) return null;

            return (
              <button
                key={lang}
                className={`language-switcher__option ${
                  lang === currentLanguage ? 'active' : ''
                }`}
                onClick={() => handleLanguageChange(lang)}
                disabled={isLoading || lang === currentLanguage}
              >
                {showFlags && (
                  <span className="language-switcher__flag">
                    {config.flag}
                  </span>
                )}
                <span className="language-switcher__name">
                  {config.name}
                </span>
                {lang === currentLanguage && (
                  <span className="language-switcher__check">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Overlay для закриття */}
      {isOpen && (
        <div 
          className="language-switcher__overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;