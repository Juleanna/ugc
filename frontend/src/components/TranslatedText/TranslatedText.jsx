// frontend/src/components/TranslatedText/TranslatedText.jsx
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Компонент для відображення перекладеного тексту
 */
const TranslatedText = ({ 
  keyName, 
  params = {}, 
  fallback = null, 
  component: Component = 'span',
  className = '',
  count = null,
  ...props 
}) => {
  const { t, plural } = useTranslation();
  
  // Використовуємо плюральну форму якщо передано count
  const translatedText = count !== null 
    ? plural(keyName, count, params)
    : t(keyName, params);
  
  // Якщо переклад не знайдено і є fallback
  const displayText = translatedText === keyName && fallback 
    ? fallback 
    : translatedText;

  return (
    <Component className={className} {...props}>
      {displayText}
    </Component>
  );
};

/**
 * Скорочена версія компонента як функція
 */
export const T = ({ k, ...props }) => (
  <TranslatedText keyName={k} {...props} />
);

/**
 * Компонент для плюральних форм
 */
export const TPlural = ({ k, count, ...props }) => (
  <TranslatedText keyName={k} count={count} {...props} />
);

/**
 * HOC для обгортання компонентів з перекладами
 */
export const withTranslation = (WrappedComponent) => {
  return function TranslatedComponent(props) {
    const translationProps = useTranslation();
    return <WrappedComponent {...props} {...translationProps} />;
  };
};

export default TranslatedText;