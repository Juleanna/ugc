// frontend/src/components/ui/LanguageSwitcher.jsx
import React, { useState } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation, useAvailableLanguages } from '../../hooks/useTranslation';

const LanguageSwitcher = ({ 
  variant = "bordered", 
  size = "sm", 
  showFlag = true, 
  showText = true,
  className = ""
}) => {
  const { currentLanguage, changeLanguage, isLoading } = useTranslation();
  const { languages } = useAvailableLanguages();

  // Конфігурація мов з прапорами та назвами
  const languageConfig = {
    uk: {
      name: 'Українська',
      shortName: 'УК',
      flag: '🇺🇦',
      color: 'primary'
    },
    en: {
      name: 'English',
      shortName: 'EN', 
      flag: '🇬🇧',
      color: 'secondary'
    }
  };

  const currentLangConfig = languageConfig[currentLanguage] || languageConfig.uk;

  const handleLanguageChange = async (selectedLanguage) => {
    if (selectedLanguage !== currentLanguage && !isLoading) {
      console.log(`🔄 Зміна мови: ${currentLanguage} → ${selectedLanguage}`);
      await changeLanguage(selectedLanguage);
    }
  };

  return (
    <div className={`language-switcher ${className}`}>
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant={variant}
            size={size}
            color={currentLangConfig.color}
            isLoading={isLoading}
            startContent={showFlag ? <span className="text-lg">{currentLangConfig.flag}</span> : <Globe className="w-4 h-4" />}
            endContent={<ChevronDown className="w-3 h-3" />}
            className="min-w-unit-16"
          >
            {showText && currentLangConfig.shortName}
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu 
          aria-label="Вибір мови"
          selectedKeys={[currentLanguage]}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const selectedLang = Array.from(keys)[0];
            if (selectedLang) {
              handleLanguageChange(selectedLang);
            }
          }}
        >
          {languages.map((lang) => {
            const config = languageConfig[lang];
            if (!config) return null;

            return (
              <DropdownItem
                key={lang}
                startContent={<span className="text-lg">{config.flag}</span>}
                description={lang === currentLanguage ? "Поточна мова" : "Змінити мову"}
                className={lang === currentLanguage ? "bg-primary-50" : ""}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{config.name}</span>
                  {lang === currentLanguage && (
                    <span className="text-primary text-sm">✓</span>
                  )}
                </div>
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

/**
 * Компактна версія перемикача для мобільних пристроїв
 */
export const CompactLanguageSwitcher = ({ className = "" }) => {
  return (
    <LanguageSwitcher
      variant="light"
      size="sm"
      showFlag={true}
      showText={false}
      className={`compact-language-switcher ${className}`}
    />
  );
};

/**
 * Повна версія перемикача для десктопу
 */
export const FullLanguageSwitcher = ({ className = "" }) => {
  return (
    <LanguageSwitcher
      variant="bordered"
      size="md"
      showFlag={true}
      showText={true}
      className={`full-language-switcher ${className}`}
    />
  );
};

export default LanguageSwitcher;