// frontend/src/components/ContactSection.jsx
// Адаптовано для ViewSets архітектури

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardBody, 
  Chip, 
  Input, 
  Textarea, 
  Button, 
  Select,
  SelectItem,
  Checkbox,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MessageCircle,
  Building,
  Users,
  Star,
  Loader
} from 'lucide-react';

// Хуки для ViewSets API
import { useTranslation } from '../hooks/useTranslation';
import { useContactData, useFormSubmission } from '../hooks/useUnifiedAPI.jsx';

const ContactSection = ({ scrollToSection }) => {
  const { t } = useTranslation();
  
  // ViewSets API хуки
  const { 
    offices, 
    partnershipInfo, 
    isLoading: contactDataLoading, 
    error: contactDataError,
    reload: reloadContactData 
  } = useContactData();
  
  const { 
    submitContactForm, 
    isSubmitting 
  } = useFormSubmission();

  // Modal для підтвердження
  const { isOpen, onOpen, onClose } = useDisclosure();

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
  const [selectedOffice, setSelectedOffice] = useState(null);

  // Обробка зміни полів форми
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищення помилки при зміні поля
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Валідація форми
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = t('contact.errors.name_required') || 'Ім\'я обов\'язкове';
    }
    
    if (!formData.email.trim()) {
      errors.email = t('contact.errors.email_required') || 'Email обов\'язковий';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('contact.errors.email_invalid') || 'Некоректний email';
    }
    
    if (!formData.message.trim()) {
      errors.message = t('contact.errors.message_required') || 'Повідомлення обов\'язкове';
    } else if (formData.message.trim().length < 10) {
      errors.message = t('contact.errors.message_too_short') || 'Повідомлення занадто коротке';
    }
    
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = t('contact.errors.phone_invalid') || 'Некоректний номер телефону';
    }
    
    return errors;
  };

  // Обробка відправки форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitStatus(null);
      setSubmitMessage('');

      // Відправка через ViewSets API
      const result = await submitContactForm(formData);

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(
          result.data?.message || 
          t('contact.success.message') || 
          'Ваше звернення успішно надіслано. Ми зв\'яжемося з вами найближчим часом.'
        );
        
        // Очищення форми
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
        
        // Показати modal підтвердження
        onOpen();
        
      } else {
        setSubmitStatus('error');
        setSubmitMessage(
          result.error || 
          t('contact.error.message') || 
          'Помилка при надсиланні звернення. Спробуйте пізніше.'
        );
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(
        t('contact.error.network') || 
        'Помилка мережі. Перевірте з\'єднання та спробуйте знову.'
      );
    }
  };

  // Типи послуг для селекту
  const serviceTypes = [
    { key: 'corporate', label: t('contact.services.corporate') || 'Корпоративний одяг' },
    { key: 'medical', label: t('contact.services.medical') || 'Медичний одяг' },
    { key: 'safety', label: t('contact.services.safety') || 'Спецодяг і захист' },
    { key: 'education', label: t('contact.services.education') || 'Шкільна форма' },
    { key: 'horeca', label: t('contact.services.horeca') || 'Одяг для HoReCa' },
    { key: 'security', label: t('contact.services.security') || 'Форма охорони' },
    { key: 'custom', label: t('contact.services.custom') || 'Індивідуальне рішення' }
  ];

  // Діапазони бюджету
  const budgetRanges = [
    { key: 'under_50k', label: t('contact.budget.under_50k') || 'До 50 000 грн' },
    { key: '50k_100k', label: t('contact.budget.50k_100k') || '50 000 - 100 000 грн' },
    { key: '100k_500k', label: t('contact.budget.100k_500k') || '100 000 - 500 000 грн' },
    { key: 'over_500k', label: t('contact.budget.over_500k') || 'Понад 500 000 грн' },
    { key: 'discuss', label: t('contact.budget.discuss') || 'Обговоримо індивідуально' }
  ];

  // Методи зв'язку
  const contactMethods = [
    { key: 'email', label: t('contact.methods.email') || 'Email' },
    { key: 'phone', label: t('contact.methods.phone') || 'Телефон' },
    { key: 'telegram', label: t('contact.methods.telegram') || 'Telegram' },
    { key: 'viber', label: t('contact.methods.viber') || 'Viber' }
  ];

  // Обробка даних офісів з ViewSets API
  const processedOffices = useMemo(() => {
    if (!offices || offices.length === 0) {
      // Fallback офіси
      return [
        {
          id: 1,
          city: 'Київ',
          address: 'вул. Хрещатик, 1',
          phone: '+380 44 123 45 67',
          email: 'kyiv@company.com',
          working_hours: 'Пн-Пт: 9:00-18:00',
          is_main: true
        },
        {
          id: 2,
          city: 'Львів',
          address: 'пр. Свободи, 15',
          phone: '+380 32 123 45 67',
          email: 'lviv@company.com',
          working_hours: 'Пн-Пт: 9:00-17:00',
          is_main: false
        }
      ];
    }
    
    return offices.sort((a, b) => b.is_main - a.is_main); // Головні офіси спочатку
  }, [offices]);

  return (
    <section id="contact" className="py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('contact.title') || 'Зв\'яжіться з нами'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle') || 'Готові обговорити ваш проект? Заповніть форму або зв\'яжіться з нами зручним способом'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Контактна форма */}
          <Card className="shadow-xl">
            <CardBody className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-blue-600" />
                {t('contact.form.title') || 'Надіслати запит'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Основна інформація */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('contact.form.name') || 'Ім\'я *'}
                    placeholder={t('contact.form.name_placeholder') || 'Ваше ім\'я'}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    isInvalid={!!formErrors.name}
                    errorMessage={formErrors.name}
                    startContent={<Users className="w-4 h-4 text-gray-400" />}
                  />
                  
                  <Input
                    label={t('contact.form.company') || 'Компанія'}
                    placeholder={t('contact.form.company_placeholder') || 'Назва компанії'}
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    startContent={<Building className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    label={t('contact.form.email') || 'Email *'}
                    placeholder={t('contact.form.email_placeholder') || 'your@email.com'}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    isInvalid={!!formErrors.email}
                    errorMessage={formErrors.email}
                    startContent={<Mail className="w-4 h-4 text-gray-400" />}
                  />
                  
                  <Input
                    type="tel"
                    label={t('contact.form.phone') || 'Телефон'}
                    placeholder={t('contact.form.phone_placeholder') || '+380 XX XXX XX XX'}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    isInvalid={!!formErrors.phone}
                    errorMessage={formErrors.phone}
                    startContent={<Phone className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                {/* Деталі проекту */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t('contact.form.service_type') || 'Тип послуги'}
                    placeholder={t('contact.form.service_type_placeholder') || 'Оберіть послугу'}
                    value={formData.service_type}
                    onChange={(value) => handleInputChange('service_type', value)}
                  >
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.key} value={service.key}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label={t('contact.form.quantity') || 'Кількість'}
                    placeholder={t('contact.form.quantity_placeholder') || 'Приблизна кількість'}
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('contact.form.deadline') || 'Термін виконання'}
                    placeholder={t('contact.form.deadline_placeholder') || 'Коли потрібно виконати'}
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    startContent={<Clock className="w-4 h-4 text-gray-400" />}
                  />

                  <Select
                    label={t('contact.form.budget') || 'Бюджет'}
                    placeholder={t('contact.form.budget_placeholder') || 'Оберіть діапазон'}
                    value={formData.budget_range}
                    onChange={(value) => handleInputChange('budget_range', value)}
                  >
                    {budgetRanges.map((range) => (
                      <SelectItem key={range.key} value={range.key}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Повідомлення */}
                <Textarea
                  label={t('contact.form.message') || 'Повідомлення *'}
                  placeholder={t('contact.form.message_placeholder') || 'Опишіть деталі вашого проекту...'}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  minRows={4}
                  maxRows={8}
                  isInvalid={!!formErrors.message}
                  errorMessage={formErrors.message}
                />

                {/* Спосіб зв'язку */}
                <Select
                  label={t('contact.form.contact_method') || 'Бажаний спосіб зв\'язку'}
                  placeholder={t('contact.form.contact_method_placeholder') || 'Як з вами зв\'язатися'}
                  value={formData.contact_method}
                  onChange={(value) => handleInputChange('contact_method', value)}
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
                  onValueChange={(checked) => handleInputChange('newsletter_subscription', checked)}
                >
                  <span className="text-sm text-gray-600">
                    {t('contact.form.newsletter') || 'Хочу отримувати новини та спеціальні пропозиції'}
                  </span>
                </Checkbox>

                {/* Статус відправки */}
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-green-800">{submitMessage}</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-red-800">{submitMessage}</span>
                  </div>
                )}

                {/* Кнопка відправки */}
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] transition-transform"
                  isLoading={isSubmitting}
                  startContent={!isSubmitting && <Send className="w-5 h-5" />}
                  loadingContent={
                    <div className="flex items-center">
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      {t('contact.form.sending') || 'Надсилання...'}
                    </div>
                  }
                >
                  {!isSubmitting && (t('contact.form.submit') || 'Надіслати запит')}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Контактна інформація та офіси */}
          <div className="space-y-8">
            
            {/* Офіси */}
            <Card className="shadow-xl">
              <CardBody className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                  {t('contact.offices.title') || 'Наші офіси'}
                </h3>

                {contactDataLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" color="primary" />
                    <span className="ml-3 text-gray-600">
                      {t('contact.offices.loading') || 'Завантаження офісів...'}
                    </span>
                  </div>
                )}

                {contactDataError && (
                  <div className="text-center py-6">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 text-sm mb-3">
                      {t('contact.offices.error') || 'Помилка завантаження офісів'}
                    </p>
                    <Button 
                      size="sm" 
                      variant="bordered" 
                      onClick={reloadContactData}
                    >
                      {t('common.retry') || 'Спробувати знову'}
                    </Button>
                  </div>
                )}

                {!contactDataLoading && !contactDataError && (
                  <div className="space-y-6">
                    {processedOffices.map((office) => (
                      <div 
                        key={office.id} 
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedOffice(office)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {office.city}
                              </h4>
                              {office.is_main && (
                                <Chip size="sm" color="primary" variant="flat" className="ml-2">
                                  <Star className="w-3 h-3 mr-1" />
                                  {t('contact.offices.main') || 'Головний'}
                                </Chip>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {office.address}
                              </div>
                              
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                <a 
                                  href={`tel:${office.phone}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {office.phone}
                                </a>
                              </div>
                              
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                <a 
                                  href={`mailto:${office.email}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {office.email}
                                </a>
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {office.working_hours}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Додаткова інформація */}
            <Card className="shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <CardBody className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  {t('contact.info.title') || 'Чому обрати нас?'}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>{t('contact.info.benefit1') || 'Безкоштовна консультація та розрахунок'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>{t('contact.info.benefit2') || 'Індивідуальний підхід до кожного проекту'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>{t('contact.info.benefit3') || 'Швидкі терміни виконання замовлень'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>{t('contact.info.benefit4') || 'Гарантія якості та післяпродажна підтримка'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm opacity-90">
                    {t('contact.info.response_time') || 
                    'Зазвичай ми відповідаємо протягом 2-х годин у робочий час'}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Modal підтвердження */}
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalContent>
            <ModalHeader className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              {t('contact.modal.title') || 'Запит надіслано!'}
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                {submitMessage || t('contact.modal.message') || 
                'Дякуємо за ваш запит! Наш менеджер зв\'яжеться з вами найближчим часом для обговорення деталей проекту.'}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                {t('contact.modal.close') || 'Зрозуміло'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Debug Info (тільки в режимі розробки) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <h4 className="font-semibold mb-2">🔧 Debug Info (ViewSets API):</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Contact Data Loading:</strong> {contactDataLoading ? 'Yes' : 'No'}<br/>
                <strong>Offices Count:</strong> {processedOffices.length}<br/>
                <strong>Form Submitting:</strong> {isSubmitting ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Submit Status:</strong> {submitStatus || 'None'}<br/>
                <strong>Form Errors:</strong> {Object.keys(formErrors).length}<br/>
                {contactDataError && <span className="text-red-600"><strong>API Error:</strong> {contactDataError}</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;