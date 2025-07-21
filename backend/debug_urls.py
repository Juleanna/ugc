# debug_urls.py
# Запустіть з директорії backend: python debug_urls.py

import sys
import os
import django
from pathlib import Path

# Налаштовуємо Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ugc_backend.settings')

try:
    django.setup()
except Exception as e:
    print(f"❌ Помилка ініціалізації Django: {e}")
    sys.exit(1)

def check_translations_file():
    """Перевіряє чи існує файл translations.py"""
    translations_file = Path("apps/api/translations.py")
    
    if translations_file.exists():
        print(f"✅ Файл існує: {translations_file}")
        
        # Перевіряємо чи можна імпортувати
        try:
            from apps.api.translations import TranslationsAPIView
            print("✅ TranslationsAPIView імпортується успішно")
            return True
        except ImportError as e:
            print(f"❌ Помилка імпорту: {e}")
            return False
        except Exception as e:
            print(f"❌ Інша помилка при імпорті: {e}")
            return False
    else:
        print(f"❌ Файл не існує: {translations_file}")
        return False

def check_urls_config():
    """Перевіряє конфігурацію URL-ів"""
    try:
        from django.urls import reverse
        from django.conf import settings
        
        print("\n🔍 Перевірка URL конфігурації...")
        
        # Перевіряємо основні URL-и
        try:
            from django.core.urlresolvers import get_resolver
        except ImportError:
            from django.urls import get_resolver
        
        resolver = get_resolver()
        
        # Шукаємо URL-и перекладів
        translation_patterns = []
        
        def find_translation_urls(url_patterns, prefix=''):
            """Рекурсивно шукає URL-и перекладів"""
            for pattern in url_patterns:
                if hasattr(pattern, 'pattern'):
                    full_pattern = prefix + str(pattern.pattern)
                    if 'translation' in full_pattern:
                        translation_patterns.append(full_pattern)
                
                if hasattr(pattern, 'url_patterns'):
                    find_translation_urls(pattern.url_patterns, prefix + str(pattern.pattern))
        
        find_translation_urls(resolver.url_patterns)
        
        if translation_patterns:
            print("✅ Знайдено URL-и перекладів:")
            for pattern in translation_patterns:
                print(f"   📍 {pattern}")
        else:
            print("❌ URL-и перекладів не знайдено")
            
        return len(translation_patterns) > 0
        
    except Exception as e:
        print(f"❌ Помилка перевірки URL-ів: {e}")
        return False

def check_api_root():
    """Перевіряє API root"""
    try:
        import requests
        
        print("\n🔍 Перевірка API root...")
        
        response = requests.get("http://127.0.0.1:8000/api/v1/", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API root доступний")
            
            # Перевіряємо чи є URL-и перекладів
            translation_urls = [url for url in data.keys() if 'translation' in url.lower()]
            
            if translation_urls:
                print("✅ URL-и перекладів знайдено в API root:")
                for url in translation_urls:
                    print(f"   📍 {url}: {data[url]}")
            else:
                print("❌ URL-и перекладів відсутні в API root")
                print("📋 Доступні URL-и:")
                for key, value in data.items():
                    print(f"   📍 {key}: {value}")
            
            return len(translation_urls) > 0
        else:
            print(f"❌ API root недоступний: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Не вдається підключитися до сервера")
        print("   Переконайтеся що Django сервер запущено:")
        print("   python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Помилка перевірки API root: {e}")
        return False

def test_translation_endpoint():
    """Тестує безпосередньо ендпоінт перекладів"""
    try:
        import requests
        
        print("\n🔍 Тестування ендпоінту перекладів...")
        
        test_url = "http://127.0.0.1:8000/api/v1/translations/uk/"
        
        response = requests.get(test_url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Ендпоінт перекладів працює!")
            print(f"   Мова: {data.get('language')}")
            print(f"   Кількість перекладів: {data.get('count', 0)}")
            return True
        else:
            print(f"❌ Ендпоінт перекладів не працює: {response.status_code}")
            print(f"   Відповідь: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Помилка тестування ендпоінту: {e}")
        return False

def check_file_structure():
    """Перевіряє структуру файлів"""
    print("\n🔍 Перевірка структури файлів...")
    
    files_to_check = [
        "apps/api/__init__.py",
        "apps/api/urls.py", 
        "apps/api/views.py",
        "apps/api/translations.py",
        "static_translations/uk.json",
        "static_translations/en.json"
    ]
    
    all_exist = True
    
    for file_path in files_to_check:
        path = Path(file_path)
        if path.exists():
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}")
            all_exist = False
    
    return all_exist

def main():
    """Головна функція діагностики"""
    print("🔍 ДІАГНОСТИКА СИСТЕМИ ПЕРЕКЛАДІВ")
    print("="*50)
    
    results = []
    
    # Перевіряємо файли
    print("1. Перевірка структури файлів...")
    results.append(check_file_structure())
    
    # Перевіряємо translations.py
    print("\n2. Перевірка файлу translations.py...")
    results.append(check_translations_file())
    
    # Перевіряємо URL конфігурацію
    print("\n3. Перевірка URL конфігурації...")
    results.append(check_urls_config())
    
    # Перевіряємо API root
    print("\n4. Перевірка API root...")
    results.append(check_api_root())
    
    # Тестуємо ендпоінт
    print("\n5. Тестування ендпоінту...")
    results.append(test_translation_endpoint())
    
    # Підсумок
    print("\n" + "="*50)
    print("📊 РЕЗУЛЬТАТИ ДІАГНОСТИКИ")
    
    passed = sum(results)
    total = len(results)
    
    print(f"Пройдено: {passed}/{total}")
    
    if passed == total:
        print("🎉 Всі перевірки пройдені успішно!")
    else:
        print("⚠️  Деякі перевірки не пройдені. Рекомендації:")
        
        if not results[0]:
            print("📁 Створіть відсутні файли:")
            print("   python quick_setup_translations.py")
        
        if not results[1]:
            print("📄 Створіть файл translations.py в apps/api/")
        
        if not results[2]:
            print("🔗 Оновіть файл apps/api/urls.py")
        
        if not results[3] or not results[4]:
            print("🔄 Перезапустіть сервер:")
            print("   python manage.py runserver")

if __name__ == "__main__":
    main()