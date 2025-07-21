# backend/check_settings.py
"""
Скрипт для перевірки налаштувань Django перед запуском сервера
"""
import os
import sys
import django
from pathlib import Path

# Додаємо шлях до проекту
sys.path.append(str(Path(__file__).parent))

# Налаштовуємо Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ugc_backend.settings')

def check_settings():
    """Перевіряє основні налаштування"""
    try:
        django.setup()
        from django.conf import settings
        
        print("🔍 Перевірка налаштувань Django...")
        
        # Перевірка основних налаштувань
        checks = [
            ("SECRET_KEY", hasattr(settings, 'SECRET_KEY') and settings.SECRET_KEY),
            ("DEBUG", hasattr(settings, 'DEBUG')),
            ("DATABASES", hasattr(settings, 'DATABASES') and settings.DATABASES),
            ("INSTALLED_APPS", hasattr(settings, 'INSTALLED_APPS') and len(settings.INSTALLED_APPS) > 0),
            ("LANGUAGES", hasattr(settings, 'LANGUAGES') and len(settings.LANGUAGES) > 0),
            ("CACHES", hasattr(settings, 'CACHES') and settings.CACHES),
            ("REST_FRAMEWORK", hasattr(settings, 'REST_FRAMEWORK')),
        ]
        
        all_passed = True
        for name, passed in checks:
            status = "✅" if passed else "❌"
            print(f"{status} {name}")
            if not passed:
                all_passed = False
        
        # Перевірка перекладів
        print("\n🌐 Перевірка налаштувань перекладів...")
        translation_checks = [
            ("MODELTRANSLATION_LANGUAGES", hasattr(settings, 'MODELTRANSLATION_LANGUAGES')),
            ("STATIC_TRANSLATIONS_DIR", hasattr(settings, 'STATIC_TRANSLATIONS_DIR')),
            ("TRANSLATION_CACHE_SETTINGS", hasattr(settings, 'TRANSLATION_CACHE_SETTINGS')),
            ("TRANSLATION_EXPORT_SETTINGS", hasattr(settings, 'TRANSLATION_EXPORT_SETTINGS')),
        ]
        
        for name, passed in translation_checks:
            status = "✅" if passed else "❌"
            print(f"{status} {name}")
            if not passed:
                all_passed = False
        
        # Перевірка директорій
        print("\n📁 Перевірка директорій...")
        
        required_dirs = []
        if hasattr(settings, 'STATIC_TRANSLATIONS_DIR'):
            required_dirs.append(("STATIC_TRANSLATIONS_DIR", settings.STATIC_TRANSLATIONS_DIR))
        if hasattr(settings, 'FRONTEND_TRANSLATIONS_DIR'):
            required_dirs.append(("FRONTEND_TRANSLATIONS_DIR", settings.FRONTEND_TRANSLATIONS_DIR))
        
        for name, path in required_dirs:
            exists = path.exists() if hasattr(path, 'exists') else os.path.exists(path)
            status = "✅" if exists else "❌"
            print(f"{status} {name}: {path}")
            if not exists:
                try:
                    os.makedirs(path, exist_ok=True)
                    print(f"   📁 Створено директорію: {path}")
                except Exception as e:
                    print(f"   ❌ Помилка створення директорії: {e}")
                    all_passed = False
        
        # Перевірка доступності Redis (необов'язково)
        print("\n🔄 Перевірка Redis...")
        try:
            from django.core.cache import cache
            cache.set('test_key', 'test_value', 10)
            retrieved = cache.get('test_key')
            if retrieved == 'test_value':
                print("✅ Redis підключення працює")
                cache.delete('test_key')
            else:
                print("❌ Redis підключення не працює")
                print("   💡 Переконайтеся що Redis сервер запущений")
                # Не робимо це критичною помилкою
        except Exception as e:
            print(f"⚠️ Redis недоступний: {e}")
            print("   💡 Переконайтеся що Redis сервер запущений")
            print("   💡 Або використовуйте DummyCache для розробки")
            # Не робимо це критичною помилкою
        
        # Перевірка міграцій
        print("\n🗄️ Перевірка міграцій...")
        try:
            from django.core.management import execute_from_command_line
            from io import StringIO
            import sys
            
            # Перехоплюємо вивід
            old_stdout = sys.stdout
            sys.stdout = captured_output = StringIO()
            
            try:
                execute_from_command_line(['manage.py', 'showmigrations', '--plan'])
                output = captured_output.getvalue()
                
                if '[X]' in output:
                    print("✅ Є застосовані міграції")
                else:
                    print("⚠️ Немає застосованих міграцій")
                    print("   💡 Запустіть: python manage.py migrate")
                    
            finally:
                sys.stdout = old_stdout
                
        except Exception as e:
            print(f"❌ Помилка перевірки міграцій: {e}")
        
        # Перевірка файлів перекладів
        print("\n📝 Перевірка системи перекладів...")
        try:
            # Спробуємо імпортувати компоненти перекладів
            translation_system_works = False
            
            # Перевіряємо чи існують необхідні файли
            required_files = [
                "apps/api/utils/translations.py",
                "apps/api/views/translations.py", 
                "apps/api/management/commands/setup_translations.py",
            ]
            
            missing_files = []
            for file_path in required_files:
                full_path = Path(file_path)
                if not full_path.exists():
                    missing_files.append(file_path)
            
            if missing_files:
                print("❌ Відсутні файли системи перекладів:")
                for file_path in missing_files:
                    print(f"   📄 {file_path}")
                print("   💡 Створіть файли з артефактів")
            else:
                print("✅ Файли системи перекладів присутні")
                
                # Спробуємо імпортувати
                try:
                    from apps.api.utils.translations import TranslationUtils
                    print("✅ TranslationUtils імпортується")
                    translation_system_works = True
                except Exception as e:
                    print(f"❌ Помилка імпорту TranslationUtils: {e}")
                    
        except Exception as e:
            print(f"❌ Помилка перевірки системи перекладів: {e}")
        
        # Фінальний результат
        print("\n" + "="*50)
        if all_passed:
            print("🎉 Всі основні перевірки пройдені!")
            print("💡 Можете запускати: python manage.py runserver")
        else:
            print("⚠️ Є проблеми з налаштуваннями")
            print("💡 Виправте помилки перед запуском сервера")
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Критична помилка: {e}")
        import traceback
        print("Детальна інформація про помилку:")
        traceback.print_exc()
        return False

def check_translation_files():
    """Перевіряє наявність файлів перекладів"""
    try:
        from django.conf import settings
        
        print("\n📝 Перевірка файлів перекладів...")
        
        if hasattr(settings, 'STATIC_TRANSLATIONS_DIR'):
            trans_dir = settings.STATIC_TRANSLATIONS_DIR
            
            for lang_code, lang_name in settings.LANGUAGES:
                file_path = trans_dir / f'{lang_code}.json'
                exists = file_path.exists()
                status = "✅" if exists else "❌"
                print(f"{status} {lang_name} ({lang_code}): {file_path}")
                
                if not exists:
                    print(f"   💡 Запустіть: python manage.py setup_translations")
                    return False
                    
        return True
        
    except Exception as e:
        print(f"❌ Помилка перевірки файлів перекладів: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Перевірка налаштувань UGC Backend...")
    print("="*50)
    
    settings_ok = check_settings()
    translations_ok = check_translation_files()
    
    if settings_ok and translations_ok:
        print("\n🎯 Система готова до роботи!")
        sys.exit(0)
    else:
        print("\n❌ Потрібно виправити помилки")
        sys.exit(1)