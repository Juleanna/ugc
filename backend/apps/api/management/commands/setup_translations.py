# backend/apps/api/management/commands/setup_translations.py
import os
import json
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Початкове налаштування системи перекладів'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Налаштування системи перекладів...')
        
        # Створюємо необхідні директорії
        self.create_directories()
        
        # Створюємо базові файли перекладів
        self.create_base_translation_files()
        
        self.stdout.write(self.style.SUCCESS('✅ Система перекладів налаштована!'))
        self.stdout.write('Тепер ви можете:')
        self.stdout.write('1. Протестувати API: curl http://localhost:8000/api/v1/translations/uk/')
        self.stdout.write('2. Експортувати для фронтенду: python manage.py export_frontend_translations')

    def create_directories(self):
        """Створює необхідні директорії"""
        base_dir = settings.BASE_DIR
        
        directories = [
            base_dir / 'static_translations',
            base_dir / 'frontend_translations',
            base_dir / 'locale' / 'uk' / 'LC_MESSAGES',
            base_dir / 'locale' / 'en' / 'LC_MESSAGES',
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            self.stdout.write(f'📁 Створено: {directory}')

    def create_base_translation_files(self):
        """Створює базові JSON файли з перекладами"""
        
        # Українські переклади
        uk_translations = {
            # Навігація
            "nav.home": "Головна",
            "nav.about": "Про нас",
            "nav.services": "Послуги",
            "nav.projects": "Проекти",
            "nav.contact": "Контакти",
            "nav.jobs": "Вакансії",
            
            # Загальні
            "common.loading": "Завантаження...",
            "common.error": "Помилка",
            "common.success": "Успішно",
            "common.save": "Зберегти",
            "common.cancel": "Скасувати",
            "common.submit": "Відправити",
            "common.back": "Назад",
            "common.next": "Далі",
            "common.close": "Закрити",
            "common.edit": "Редагувати",
            "common.delete": "Видалити",
            "common.view": "Переглянути",
            "common.download": "Завантажити",
            "common.upload": "Завантажити",
            "common.search": "Пошук",
            "common.filter": "Фільтр",
            "common.sort": "Сортування",
            "common.yes": "Так",
            "common.no": "Ні",
            
            # Форми
            "form.name": "Ім'я",
            "form.email": "Електронна пошта",
            "form.phone": "Телефон",
            "form.company": "Компанія",
            "form.message": "Повідомлення",
            "form.subject": "Тема",
            "form.required": "Обов'язкове поле",
            "form.invalid_email": "Некоректна електронна пошта",
            "form.invalid_phone": "Некоректний номер телефону",
            "form.success": "Форма успішно відправлена",
            "form.error": "Помилка при відправці форми",
            
            # Кнопки
            "button.contact_us": "Зв'язатися з нами",
            "button.learn_more": "Дізнатися більше",
            "button.get_quote": "Отримати пропозицію",
            "button.order_now": "Замовити зараз",
            "button.view_all": "Переглянути всі",
            "button.read_more": "Читати далі",
            
            # Заголовки сторінок
            "page.home.title": "Головна сторінка",
            "page.about.title": "Про нас",
            "page.services.title": "Наші послуги",
            "page.projects.title": "Наші проекти",
            "page.contact.title": "Контакти",
            "page.jobs.title": "Вакансії",
            
            # Повідомлення
            "message.welcome": "Ласкаво просимо!",
            "message.thank_you": "Дякуємо!",
            "message.contact_success": "Ваше повідомлення відправлено. Ми зв'яжемося з вами найближчим часом.",
            "message.form_error": "Будь ласка, виправте помилки в формі",
            "message.network_error": "Помилка мережі. Спробуйте пізніше.",
            
            # Статуси
            "status.active": "Активний",
            "status.inactive": "Неактивний",
            "status.pending": "Очікує",
            "status.completed": "Завершено",
            "status.draft": "Чернетка",
            "status.published": "Опубліковано",
        }
        
        # Англійські переклади
        en_translations = {
            # Навігація
            "nav.home": "Home",
            "nav.about": "About",
            "nav.services": "Services",
            "nav.projects": "Projects",
            "nav.contact": "Contact",
            "nav.jobs": "Jobs",
            
            # Загальні
            "common.loading": "Loading...",
            "common.error": "Error",
            "common.success": "Success",
            "common.save": "Save",
            "common.cancel": "Cancel",
            "common.submit": "Submit",
            "common.back": "Back",
            "common.next": "Next",
            "common.close": "Close",
            "common.edit": "Edit",
            "common.delete": "Delete",
            "common.view": "View",
            "common.download": "Download",
            "common.upload": "Upload",
            "common.search": "Search",
            "common.filter": "Filter",
            "common.sort": "Sort",
            "common.yes": "Yes",
            "common.no": "No",
            
            # Форми
            "form.name": "Name",
            "form.email": "Email",
            "form.phone": "Phone",
            "form.company": "Company",
            "form.message": "Message",
            "form.subject": "Subject",
            "form.required": "Required field",
            "form.invalid_email": "Invalid email address",
            "form.invalid_phone": "Invalid phone number",
            "form.success": "Form submitted successfully",
            "form.error": "Error submitting form",
            
            # Кнопки
            "button.contact_us": "Contact Us",
            "button.learn_more": "Learn More",
            "button.get_quote": "Get Quote",
            "button.order_now": "Order Now",
            "button.view_all": "View All",
            "button.read_more": "Read More",
            
            # Заголовки сторінок
            "page.home.title": "Home Page",
            "page.about.title": "About Us",
            "page.services.title": "Our Services",
            "page.projects.title": "Our Projects",
            "page.contact.title": "Contact",
            "page.jobs.title": "Jobs",
            
            # Повідомлення
            "message.welcome": "Welcome!",
            "message.thank_you": "Thank you!",
            "message.contact_success": "Your message has been sent. We will contact you soon.",
            "message.form_error": "Please correct the errors in the form",
            "message.network_error": "Network error. Please try again later.",
            
            # Статуси
            "status.active": "Active",
            "status.inactive": "Inactive",
            "status.pending": "Pending",
            "status.completed": "Completed",
            "status.draft": "Draft",
            "status.published": "Published",
        }
        
        # Зберігаємо файли
        translations = {'uk': uk_translations, 'en': en_translations}
        
        static_dir = settings.BASE_DIR / 'static_translations'
        
        for lang, trans in translations.items():
            file_path = static_dir / f'{lang}.json'
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(trans, f, ensure_ascii=False, indent=2)
            self.stdout.write(f'📄 Створено: {file_path}')