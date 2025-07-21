# backend/create_translation_files.py
"""
Скрипт для створення файлів системи перекладів
"""
import os
from pathlib import Path

def create_file_structure():
    """Створює необхідну структуру файлів"""
    
    # Базова директорія
    base_dir = Path(__file__).parent
    
    # Створюємо директорії
    directories = [
        "apps/api/utils",
        "apps/api/views", 
        "apps/api/management",
        "apps/api/management/commands",
        "static_translations",
        "frontend_translations",
    ]
    
    for directory in directories:
        dir_path = base_dir / directory
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"📁 Створено директорію: {dir_path}")
        
        # Створюємо __init__.py файли
        if "apps/" in directory:
            init_file = dir_path / "__init__.py"
            if not init_file.exists():
                init_file.touch()
                print(f"📄 Створено: {init_file}")

def create_basic_init_files():
    """Створює базові __init__.py файли"""
    
    files_content = {
        "apps/__init__.py": "",
        "apps/api/__init__.py": "",
        "apps/api/utils/__init__.py": "",
        "apps/api/views/__init__.py": "",
        "apps/api/management/__init__.py": "",
        "apps/api/management/commands/__init__.py": "",
    }
    
    base_dir = Path(__file__).parent
    
    for file_path, content in files_content.items():
        full_path = base_dir / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        if not full_path.exists():
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"📄 Створено: {full_path}")

def create_basic_translation_files():
    """Створює базові файли JSON з перекладами"""
    
    base_dir = Path(__file__).parent
    
    # Українські переклади
    uk_translations = {
        "nav.home": "Головна",
        "nav.about": "Про нас", 
        "nav.services": "Послуги",
        "nav.projects": "Проекти",
        "nav.contact": "Контакти",
        "nav.jobs": "Вакансії",
        
        "common.loading": "Завантаження...",
        "common.error": "Помилка",
        "common.success": "Успішно",
        "common.save": "Зберегти",
        "common.cancel": "Скасувати",
        "common.submit": "Відправити",
        "common.back": "Назад",
        "common.next": "Далі",
        "common.close": "Закрити",
        
        "form.name": "Ім'я",
        "form.email": "Електронна пошта", 
        "form.phone": "Телефон",
        "form.company": "Компанія",
        "form.message": "Повідомлення",
        "form.required": "Обов'язкове поле",
        "form.success": "Форма успішно відправлена",
        
        "page.home.title": "Головна сторінка",
        "page.about.title": "Про нас",
        "page.services.title": "Наші послуги",
        "page.contact.title": "Контакти",
    }
    
    # Англійські переклади
    en_translations = {
        "nav.home": "Home",
        "nav.about": "About",
        "nav.services": "Services", 
        "nav.projects": "Projects",
        "nav.contact": "Contact",
        "nav.jobs": "Jobs",
        
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.submit": "Submit",
        "common.back": "Back",
        "common.next": "Next",
        "common.close": "Close",
        
        "form.name": "Name",
        "form.email": "Email",
        "form.phone": "Phone", 
        "form.company": "Company",
        "form.message": "Message",
        "form.required": "Required field",
        "form.success": "Form submitted successfully",
        
        "page.home.title": "Home Page",
        "page.about.title": "About Us",
        "page.services.title": "Our Services",
        "page.contact.title": "Contact",
    }
    
    # Створюємо файли
    import json
    
    for lang, translations in [("uk", uk_translations), ("en", en_translations)]:
        file_path = base_dir / "static_translations" / f"{lang}.json"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(translations, f, ensure_ascii=False, indent=2)
        
        print(f"📄 Створено файл перекладів: {file_path}")

def main():
    """Головна функція"""
    print("🚀 Створення структури файлів для системи перекладів...")
    print("="*60)
    
    # Створюємо структуру директорій
    create_file_structure()
    
    # Створюємо __init__.py файли
    create_basic_init_files()
    
    # Створюємо базові файли перекладів
    create_basic_translation_files()
    
    print("\n" + "="*60)
    print("✅ Структура файлів створена!")
    print("\nТепер вам потрібно:")
    print("1. Скопіювати код з артефактів у відповідні файли:")
    print("   - apps/api/utils/translations.py")
    print("   - apps/api/views/translations.py") 
    print("   - apps/api/management/commands/setup_translations.py")
    print("   - apps/api/management/commands/export_frontend_translations.py")
    print("   - apps/api/management/commands/validate_translations.py")
    print("\n2. Оновити apps/api/urls.py")
    print("\n3. Запустити: python check_settings.py")

if __name__ == "__main__":
    main()