# create_translation_files.py
# Запустити з директорії backend: python create_translation_files.py

import os
import json
from pathlib import Path

def create_translation_structure():
    """Створює структуру директорій та файлів для перекладів"""
    
    # Отримуємо шлях до backend директорії
    backend_dir = Path(__file__).parent
    
    # Створюємо директорію для статичних перекладів
    static_translations_dir = backend_dir / "static_translations"
    static_translations_dir.mkdir(exist_ok=True)
    
    print(f"✅ Створено директорію: {static_translations_dir}")
    
    # Базові переклади українською
    uk_translations = {
        "nav.home": "Головна",
        "nav.about": "Про нас", 
        "nav.services": "Послуги",
        "nav.projects": "Проекти",
        "nav.contact": "Контакти",
        "nav.jobs": "Вакансії",
        "nav.partners": "Партнерам",
        
        "common.loading": "Завантаження...",
        "common.error": "Помилка",
        "common.success": "Успіх",
        "common.warning": "Попередження",
        "common.info": "Інформація",
        "common.save": "Зберегти",
        "common.cancel": "Скасувати", 
        "common.submit": "Відправити",
        "common.back": "Назад",
        "common.next": "Далі",
        "common.close": "Закрити",
        "common.edit": "Редагувати",
        "common.delete": "Видалити",
        "common.view": "Переглянути",
        "common.search": "Пошук",
        "common.filter": "Фільтр",
        "common.reset": "Скинути",
        "common.more": "Більше",
        "common.less": "Менше",
        "common.yes": "Так",
        "common.no": "Ні",
        
        "form.name": "Ім'я",
        "form.email": "Електронна пошта",
        "form.phone": "Телефон",
        "form.company": "Компанія",
        "form.message": "Повідомлення",
        "form.subject": "Тема",
        "form.required": "Обов'язкове поле",
        "form.invalid_email": "Некоректний email",
        "form.invalid_phone": "Некоректний номер телефону",
        "form.success": "Форму успішно відправлено",
        "form.error": "Помилка при відправці форми",
        
        "page.home.title": "Головна сторінка",
        "page.home.subtitle": "Ласкаво просимо",
        "page.about.title": "Про нас",
        "page.services.title": "Наші послуги",
        "page.projects.title": "Наші проекти",
        "page.contact.title": "Контакти",
        "page.jobs.title": "Вакансії",
        "page.partners.title": "Партнерам",
        
        "button.learn_more": "Дізнатися більше",
        "button.contact_us": "Зв'язатися з нами",
        "button.get_quote": "Отримати пропозицію",
        "button.apply": "Подати заявку",
        "button.download": "Завантажити",
        "button.upload": "Завантажити файл",
        
        "section.features": "Особливості",
        "section.testimonials": "Відгуки",
        "section.team": "Команда",
        "section.gallery": "Галерея",
        "section.faq": "Часті питання",
        
        "status.active": "Активний",
        "status.inactive": "Неактивний",
        "status.pending": "Очікує",
        "status.approved": "Схвалено",
        "status.rejected": "Відхилено",
        
        "meta.description": "Опис",
        "meta.keywords": "Ключові слова",
        "meta.title": "Заголовок"
    }
    
    # Базові переклади англійською
    en_translations = {
        "nav.home": "Home",
        "nav.about": "About",
        "nav.services": "Services", 
        "nav.projects": "Projects",
        "nav.contact": "Contact",
        "nav.jobs": "Jobs",
        "nav.partners": "Partners",
        
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
        "common.warning": "Warning",
        "common.info": "Information",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.submit": "Submit",
        "common.back": "Back",
        "common.next": "Next",
        "common.close": "Close",
        "common.edit": "Edit",
        "common.delete": "Delete",
        "common.view": "View",
        "common.search": "Search",
        "common.filter": "Filter",
        "common.reset": "Reset",
        "common.more": "More",
        "common.less": "Less",
        "common.yes": "Yes",
        "common.no": "No",
        
        "form.name": "Name",
        "form.email": "Email",
        "form.phone": "Phone",
        "form.company": "Company",
        "form.message": "Message",
        "form.subject": "Subject",
        "form.required": "Required field",
        "form.invalid_email": "Invalid email",
        "form.invalid_phone": "Invalid phone number",
        "form.success": "Form submitted successfully",
        "form.error": "Error submitting form",
        
        "page.home.title": "Home Page",
        "page.home.subtitle": "Welcome",
        "page.about.title": "About Us",
        "page.services.title": "Our Services",
        "page.projects.title": "Our Projects",
        "page.contact.title": "Contact",
        "page.jobs.title": "Jobs",
        "page.partners.title": "Partners",
        
        "button.learn_more": "Learn More",
        "button.contact_us": "Contact Us",
        "button.get_quote": "Get Quote",
        "button.apply": "Apply",
        "button.download": "Download",
        "button.upload": "Upload File",
        
        "section.features": "Features",
        "section.testimonials": "Testimonials",
        "section.team": "Team",
        "section.gallery": "Gallery",
        "section.faq": "FAQ",
        
        "status.active": "Active",
        "status.inactive": "Inactive",
        "status.pending": "Pending",
        "status.approved": "Approved",
        "status.rejected": "Rejected",
        
        "meta.description": "Description",
        "meta.keywords": "Keywords",
        "meta.title": "Title"
    }
    
    # Створюємо файли перекладів
    for lang, translations in [("uk", uk_translations), ("en", en_translations)]:
        file_path = static_translations_dir / f"{lang}.json"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(translations, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Створено файл перекладів: {file_path} ({len(translations)} ключів)")

def check_api_structure():
    """Перевіряє структуру API папки"""
    backend_dir = Path(__file__).parent
    api_dir = backend_dir / "apps" / "api"
    
    if api_dir.exists():
        print(f"✅ API директорія існує: {api_dir}")
        
        # Перевіряємо файли
        files_to_check = ['__init__.py', 'urls.py', 'views.py']
        for file_name in files_to_check:
            file_path = api_dir / file_name
            if file_path.exists():
                print(f"  ✅ {file_name}")
            else:
                print(f"  ❌ {file_name} - відсутній")
    else:
        print(f"❌ API директорія не існує: {api_dir}")
        print("   Створіть спочатку Django додаток:")
        print("   python manage.py startapp api")

def update_settings():
    """Додає налаштування для перекладів в settings.py"""
    backend_dir = Path(__file__).parent
    settings_file = backend_dir / "ugc_backend" / "settings.py"
    
    # Читаємо поточний settings.py
    with open(settings_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Перевіряємо чи вже є налаштування
    if 'STATIC_TRANSLATIONS_DIR' not in content:
        settings_addition = '''

# ========== НАЛАШТУВАННЯ ПЕРЕКЛАДІВ ==========

# Директорія для статичних перекладів
STATIC_TRANSLATIONS_DIR = BASE_DIR / "static_translations"

# Кеш для перекладів
TRANSLATION_CACHE_TIMEOUT = 60 * 30  # 30 хвилин

# Rate limiting для API перекладів
TRANSLATION_API_RATE_LIMIT = '100/hour'
'''
        
        with open(settings_file, 'a', encoding='utf-8') as f:
            f.write(settings_addition)
        
        print(f"✅ Додано налаштування перекладів в settings.py")
    else:
        print("ℹ️  Налаштування перекладів вже існують")

def main():
    """Головна функція"""
    print("🚀 Створення системи перекладів...")
    print("="*50)
    
    # Перевіряємо структуру API
    check_api_structure()
    
    # Створюємо структуру та файли
    create_translation_structure()
    update_settings()
    
    print("\n" + "="*50)
    print("✅ Система перекладів створена!")
    print("\nНаступні кроки:")
    print("1. Скопіюйте код з артефакту 'translations_api_main' в файл:")
    print("   backend/apps/api/translations.py")
    print("\n2. Оновіть файл:")
    print("   backend/apps/api/urls.py")
    print("   (використайте код з артефакту 'updated_api_urls')")
    print("\n3. Перезапустіть сервер Django:")
    print("   python manage.py runserver")
    print("\n4. Тестуйте API:")
    print("   GET http://127.0.0.1:8000/api/v1/translations/uk/")
    print("   GET http://127.0.0.1:8000/api/v1/translations/en/")
    print("   GET http://127.0.0.1:8000/api/v1/translations/stats/")

if __name__ == "__main__":
    main()