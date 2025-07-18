// API конфігурація
export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Утиліта для API запитів
export const apiCall = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

// Навігаційні елементи
export const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Головна' },
  { id: 'about', label: 'Про нас' },
  { id: 'services', label: 'Послуги' },
  { id: 'projects', label: 'Проєкти' },
  { id: 'contact', label: 'Контакти' }
];

// Контактна інформація
export const CONTACT_INFO = {
  phone: '+38 (067) 123-45-67',
  email: 'info@ugc.ua',
  address: 'м. Київ, вул. Промислова, 15'
};

// Статистика компанії
export const COMPANY_STATS = [
  { value: '5+', label: 'Років досвіду' },
  { value: '100+', label: 'Проєктів' },
  { value: '50+', label: 'Клієнтів' },
  { value: '24/7', label: 'Підтримка' }
];

// Особливості компанії
export const COMPANY_FEATURES = [
  {
    title: 'Надійність',
    description: 'Використовуємо тільки перевірені матеріали та технології'
  },
  {
    title: 'Якість',
    description: 'Контроль якості на кожному етапі виробництва'
  },
  {
    title: 'Довіра',
    description: 'Понад 50 задоволених клієнтів по всій Україні'
  }
];

// Демо послуги (якщо немає даних з API)
export const DEFAULT_SERVICES = [
  {
    title: 'Військова форма',
    description: 'Спеціалізована форма для військових підрозділів з підвищеними захисними властивостями'
  },
  {
    title: 'Медичний одяг',
    description: 'Комфортний і функціональний одяг для медичних працівників'
  },
  {
    title: 'Робочий одяг',
    description: 'Міцний і практичний одяг для різних сфер діяльності'
  },
  {
    title: 'Корпоративний одяг',
    description: 'Стильний корпоративний одяг для створення єдиного іміджу компанії'
  },
  {
    title: 'Спеціалізований одяг',
    description: 'Одяг для особливих умов праці з підвищеними вимогами безпеки'
  },
  {
    title: 'Аксесуари',
    description: 'Додаткові елементи та аксесуари для комплектації одягу'
  }
];

// Демо проєкти (якщо немає даних з API)
export const DEFAULT_PROJECTS = [
  {
    title: 'Національна Гвардія України',
    subtitle: 'Захист і комфорт для наших захисників',
    description: 'Національна Гвардія України забезпечує своїх працівників якісним спецодягом, який відповідає найвищим стандартам захисту і комфорту в різних умовах служби.',
    badge: 'Успішний проєкт'
  },
  {
    title: 'Міністерство оборони України',
    subtitle: 'Вітро-вологозахисний костюм для військових',
    description: 'Міністерство оборони України замовило спеціальний вітро-вологозахисний костюм, який забезпечує надійний захист і комфорт для військових у різних погодних умовах.',
    badge: 'Успішний проєкт'
  }
];

// Утиліта для скролу до секції
export const scrollToSection = (sectionId, setActiveSection, setIsMenuOpen) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
  if (setActiveSection) setActiveSection(sectionId);
  if (setIsMenuOpen) setIsMenuOpen(false);
};

// Утиліта для обробки форми контактів
export const handleContactFormSubmit = async (e, formData, setFormData, setIsSubmitting) => {
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