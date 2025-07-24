// frontend/src/components/ContactSection.jsx
import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  Chip, 
  Input, 
  Textarea, 
  Button, 
  Select,
  SelectItem,
  Checkbox
} from "@nextui-org/react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MessageCircle
} from 'lucide-react';

// Хуки
import { useTranslation } from '../hooks/useTranslation';
// ВИКОРИСТОВУЄМО UNIFIED API для відправки форм
import { useFormSubmission } from '../hooks/useUnifiedAPI.jsx';

const ContactSection = ({ onSubmit, isSubmitting: propIsSubmitting, scrollToSection }) => {
  const { t } = useTranslation();
  
  // ВИКОРИСТОВУЄМО UNIFIED API HOOK для форм
  const { submitForm, isSubmitting: apiIsSubmitting } = useFormSubmission();

  // Стан форми
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service_type: '',
    message: '',
    quantity: '',
    deadline: '',
    budget_range: '',
    contact_method: 'email',
    newsletter_subscription: false
  });

  // Стан UI
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [submitMessage, setSubmitMessage] = useState('');

  // Визначаємо стан завантаження
  const isSubmitting = propIsSubmitting || apiIsSubmitting;

  // Типи послуг для селекту
  const serviceTypes = [
    { key: 'corporate', label: t('contact.services.corporate') || 'Корпоративний одяг' },
    { key: 'safety', label: t('contact.services.safety') || 'Спецодяг і захист' },
    { key: 'medical', label: t('contact.services.medical') || 'Медичний одяг' },
    { key: 'education', label: t('contact.services.education') || 'Шкільна форма' },
    { key: 'horeca', label: t('contact.services.horeca') || 'Одяг для HoReCa' },
    { key: 'security', label: t('contact.services.security') || 'Форма охорони' },
    { key: 'custom', label: t('contact.services.custom') || 'Індивідуальне рішення' }
  ];

  // Діапазони бюджету
  const budgetRanges = [
    { key: 'under_10k', label: 'До 10 000 грн' },
    { key: '10k_50k', label: '10 000 - 50 000 грн' },
    { key: '50k_100k', label: '50 000 - 100 000 грн' },
    { key: '100k_500k', label: '100 000 - 500 000 грн' },
    { key: 'over_500k', label: 'Понад 500 000 грн' }
  ];

  // Методи зв'язку
  const contactMethods = [
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Телефон' },
    { key: 'telegram', label: 'Telegram' },
    { key: 'viber', label: 'Viber' }
  ];

  // Контактна інформація
  const contactInfo = [
    {
      icon: Phone,
      title: t('contact.info.phone') || 'Телефон',
      value: '+38 (067) 123-45-67',
      subtitle: 'Пн-Пт: 9:00-18:00'
    },
    {
      icon: Mail,
      title: t('contact.info.email') || 'Email',
      value: 'info@ugc.ua',
      subtitle: 'Відповідаємо протягом 2 годин'
    },
    {
      icon: MapPin,
      title: t('contact.info.address') || 'Адреса',
      value: 'м. Київ, вул. Промислова, 15',
      subtitle: 'Офіс та виробництво'
    }
  ];

  // Валідація форми
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t('contact.errors.name_required') || 'Ім\'я обов\'язкове';
    }

    if (!formData.email.trim()) {
      errors.email = t('contact.errors.email_required') || 'Email обов\'язковий';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('contact.errors.email_invalid') || 'Невірний формат email';
    }

    if (!formData.phone.trim()) {
      errors.phone = t('contact.errors.phone_required') || 'Телефон обов\'язковий';
    }

    if (!formData.message.trim()) {
      errors.message = t('contact.errors.message_required') || 'Повідомлення обов\'язкове';
    } else if (formData.message.trim().length < 10) {
      errors.message = t('contact.errors.message_too_short') || 'Повідомлення занадто коротке';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Обробник зміни полів
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Очищуємо помилку для поля при введенні
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Відправка форми
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus('error');
      setSubmitMessage(t('contact.form.validation_error') || 'Будь ласка, виправте помилки у формі');
      return;
    }

    try {
      // Використовуємо зовнішню функцію якщо передана
      if (onSubmit && typeof onSubmit === 'function') {
        const result = await onSubmit(formData);
        
        if (result?.success) {
          setSubmitStatus('success');
          setSubmitMessage(t('contact.form.success') || 'Дякуємо! Ваше повідомлення відправлено.');
          resetForm();
        } else {
          throw new Error(result?.message || 'Помилка відправки');
        }
      } else {
        // Використовуємо Unified API
        const result = await submitForm('/contact/', formData);
        
        if (result.success) {
          setSubmitStatus('success');
          setSubmitMessage(t('contact.form.success') || 'Дякуємо! Ваше повідомлення відправлено.');
          resetForm();
        } else {
          throw new Error(result.error || 'Помилка відправки');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || t('contact.form.error') || 'Виникла помилка при відправці');
    }
  };

  // Скидання форми
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      service_type: '',
      message: '',
      quantity: '',
      deadline: '',
      budget_range: '',
      contact_method: 'email',
      newsletter_subscription: false
    });
    setFormErrors({});
  };

  // Закриття повідомлення про статус
  const closeStatusMessage = () => {
    setSubmitStatus(null);
    setSubmitMessage('');
  };

  return (
    <section id="contact" className="section-padding bg-gray-50">
      <div className="container-custom">
        
        {/* Заголовок секції */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('contact.title') || 'Зв\'яжіться з нами'}
            <br />
            <span className="text-gradient-blue">
              {t('contact.subtitle') || 'прямо зараз'}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.description') || 'Готові допомогти вам з будь-якими питаннями та замовленнями. Наші експерти нададуть професійну консультацію.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Контактна інформація */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('contact.info.title') || 'Контактна інформація'}
            </h3>
            
            {contactInfo.map((info, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-blue p-3 rounded-lg flex-shrink-0">
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{info.title}</h4>
                      <p className="text-blue-600 font-medium">{info.value}</p>
                      <p className="text-gray-500 text-sm">{info.subtitle}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            {/* Додаткова інформація */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <CardBody className="p-6 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t('contact.working_hours') || 'Робочі години'}
                </h4>
                <p className="text-gray-600 text-sm">
                  Пн-Пт: 9:00-18:00<br />
                  Сб: 10:00-15:00<br />
                  Нд: Вихідний
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Форма зв'язку */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardBody className="p-6 md:p-8">
                
                {/* Заголовок форми */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-blue p-2 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t('contact.form.title') || 'Надішліть нам повідомлення'}
                  </h3>
                </div>

                {/* Повідомлення про статус */}
                {submitStatus && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    submitStatus === 'success' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {submitStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`flex-1 text-sm ${
                      submitStatus === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {submitMessage}
                    </p>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={closeStatusMessage}
                    >
                      ✕
                    </Button>
                  </div>
                )}

                {/* Форма */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  
                  {/* Особиста інформація */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('contact.form.name') || 'Ім\'я *'}
                      placeholder="Введіть ваше ім'я"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      isInvalid={!!formErrors.name}
                      errorMessage={formErrors.name}
                      isRequired
                    />
                    
                    <Input
                      label={t('contact.form.company') || 'Компанія'}
                      placeholder="Назва організації"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="email"
                      label={t('contact.form.email') || 'Email *'}
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      isInvalid={!!formErrors.email}
                      errorMessage={formErrors.email}
                      isRequired
                    />
                    
                    <Input
                      type="tel"
                      label={t('contact.form.phone') || 'Телефон *'}
                      placeholder="+38 (067) 123-45-67"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      isInvalid={!!formErrors.phone}
                      errorMessage={formErrors.phone}
                      isRequired
                    />
                  </div>

                  {/* Деталі замовлення */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label={t('contact.form.service_type') || 'Тип послуги'}
                      placeholder="Оберіть тип послуги"
                      value={formData.service_type}
                      onChange={(e) => handleInputChange('service_type', e.target.value)}
                    >
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.key} value={service.key}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      label={t('contact.form.quantity') || 'Кількість'}
                      placeholder="Наприклад: 50 штук"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('contact.form.deadline') || 'Термін виконання'}
                      placeholder="Наприклад: до кінця місяця"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                    />

                    <Select
                      label={t('contact.form.budget') || 'Бюджет'}
                      placeholder="Орієнтовний бюджет"
                      value={formData.budget_range}
                      onChange={(e) => handleInputChange('budget_range', e.target.value)}
                    >
                      {budgetRanges.map((budget) => (
                        <SelectItem key={budget.key} value={budget.key}>
                          {budget.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Повідомлення */}
                  <Textarea
                    label={t('contact.form.message') || 'Повідомлення *'}
                    placeholder="Розкажіть детальніше про ваші потреби..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    isInvalid={!!formErrors.message}
                    errorMessage={formErrors.message}
                    minRows={4}
                    isRequired
                  />

                  {/* Метод зв'язку */}
                  <Select
                    label={t('contact.form.contact_method') || 'Зручний спосіб зв\'язку'}
                    value={formData.contact_method}
                    onChange={(e) => handleInputChange('contact_method', e.target.value)}
                    defaultSelectedKeys={['email']}
                  >
                    {contactMethods.map((method) => (
                      <SelectItem key={method.key} value={method.key}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Підписка на новини */}
                  <Checkbox
                    isSelected={formData.newsletter_subscription}
                    onValueChange={(value) => handleInputChange('newsletter_subscription', value)}
                  >
                    {t('contact.form.newsletter') || 'Хочу отримувати новини та спеціальні пропозиції'}
                  </Checkbox>

                  {/* Кнопка відправки */}
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 mt-6"
                    startContent={isSubmitting ? null : <Send className="w-5 h-5" />}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? (t('contact.form.sending') || 'Відправляємо...') 
                      : (t('contact.form.send') || 'Відправити повідомлення')
                    }
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Статистика API (тільки в режимі розробки) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              📊 Form Status: {isSubmitting ? 'Submitting...' : 'Ready'} | 
              Using: {onSubmit ? 'External Handler' : 'Unified API'} |
              Status: {submitStatus || 'None'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;