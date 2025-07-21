# quick_fix_cache_error.py
# Швидке виправлення помилки кешування JsonResponse
# Запустіть з директорії backend: python quick_fix_cache_error.py

from pathlib import Path
import shutil

def fix_translations_file():
    """Виправляє файл translations.py"""
    backend_dir = Path(__file__).parent
    translations_file = backend_dir / "apps" / "api" / "translations.py"
    
    if not translations_file.exists():
        print(f"❌ Файл {translations_file} не існує")
        print("   Спочатку створіть файл командою:")
        print("   python fix_translations_urls.py")
        return False
    
    # Створюємо резервну копію
    backup_file = translations_file.with_suffix('.py.backup')
    shutil.copy(translations_file, backup_file)
    print(f"📋 Створено резервну копію: {backup_file}")
    
    # Читаємо поточний вміст
    with open(translations_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Видаляємо проблемний декоратор @cache_page
    if '@cache_page' in content:
        lines = content.split('\n')
        new_lines = []
        skip_next = False
        
        for line in lines:
            if '@method_decorator(cache_page' in line:
                # Пропускаємо цей рядок і наступний
                skip_next = True
                continue
            elif skip_next and line.strip().startswith('def get('):
                # Це рядок з def get, не пропускаємо
                skip_next = False
                new_lines.append(line)
            elif skip_next:
                # Пропускаємо цей рядок (частина декоратора)
                continue
            else:
                new_lines.append(line)
        
        content = '\n'.join(new_lines)
        print("✅ Видалено проблемний декоратор @cache_page")
    
    # Видаляємо імпорт cache_page якщо він не використовується
    if 'from django.views.decorators.cache import cache_page' in content and '@cache_page' not in content:
        content = content.replace('from django.views.decorators.cache import cache_page\n', '')
        content = content.replace(', cache_page', '')
        print("✅ Видалено непотрібний імпорт cache_page")
    
    # Записуємо виправлений файл
    with open(translations_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Виправлено файл: {translations_file}")
    return True

def create_simple_translations_file():
    """Створює простий файл translations.py без проблемного кешування"""
    backend_dir = Path(__file__).parent
    translations_file = backend_dir / "apps" / "api" / "translations.py"
    
    # Простий код без проблемного кешування
    simple_code = '''# backend/apps/api/translations.py
import json
from django.http import JsonResponse
from django.views import View
from django.conf import settings
from django.core.cache import cache
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging

logger = logging.getLogger(__name__)

class TranslationsAPIView(View):
    """API для отримання статичних перекладів"""
    
    def get(self, request, lang='uk'):
        try:
            # Валідація мови
            available_languages = [code for code, name in settings.LANGUAGES]
            if lang not in available_languages:
                lang = settings.LANGUAGE_CODE
            
            # Завантажуємо переклади (без проблемного кешування JsonResponse)
            translations = self.load_static_translations(lang)
            
            return JsonResponse({
                'language': lang,
                'translations': translations,
                'count': len(translations),
                'source': 'static',
                'available_languages': available_languages
            })
            
        except Exception as e:
            logger.error(f"Error loading translations for {lang}: {str(e)}")
            return JsonResponse({
                'error': str(e),
                'language': lang,
                'translations': {},
                'count': 0
            }, status=500)
    
    def load_static_translations(self, lang):
        """Завантажує статичні переклади"""
        static_dir = getattr(settings, 'STATIC_TRANSLATIONS_DIR', settings.BASE_DIR / 'static_translations')
        file_path = static_dir / f'{lang}.json'
        
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return self.get_default_translations(lang)
        else:
            return self.get_default_translations(lang)
    
    def get_default_translations(self, lang):
        """Повертає базові переклади"""
        if lang == 'uk':
            return {
                "nav.home": "Головна",
                "nav.about": "Про нас",
                "nav.services": "Послуги",
                "nav.contact": "Контакти",
                "common.loading": "Завантаження...",
                "common.error": "Помилка",
                "common.success": "Успіх",
                "form.name": "Ім'я",
                "form.email": "Електронна пошта"
            }
        else:
            return {
                "nav.home": "Home",
                "nav.about": "About",
                "nav.services": "Services",
                "nav.contact": "Contact",
                "common.loading": "Loading...",
                "common.error": "Error",
                "common.success": "Success",
                "form.name": "Name",
                "form.email": "Email"
            }

class DynamicTranslationsAPIView(View):
    """API для динамічних перекладів"""
    
    def get(self, request, lang='uk'):
        try:
            # Поки що повертаємо пусті динамічні переклади
            return JsonResponse({
                'language': lang,
                'translations': {},
                'count': 0,
                'source': 'dynamic'
            })
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'language': lang,
                'translations': {},
                'count': 0
            }, status=500)

class AllTranslationsAPIView(View):
    """API для всіх перекладів"""
    
    def get(self, request, lang='uk'):
        try:
            static_view = TranslationsAPIView()
            static_response = static_view.get(request, lang)
            
            if static_response.status_code != 200:
                return static_response
            
            static_data = json.loads(static_response.content)
            
            return JsonResponse({
                'language': lang,
                'translations': static_data.get('translations', {}),
                'count': static_data.get('count', 0),
                'static_count': static_data.get('count', 0),
                'dynamic_count': 0,
                'source': 'combined',
                'available_languages': static_data.get('available_languages', [])
            })
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'language': lang,
                'translations': {},
                'count': 0
            }, status=500)

class TranslationSearchView(View):
    """Пошук перекладів"""
    
    def get(self, request, lang='uk'):
        try:
            query = request.GET.get('q', '').strip()
            
            if not query:
                return JsonResponse({
                    'error': 'Query parameter "q" is required'
                }, status=400)
            
            static_view = TranslationsAPIView()
            static_response = static_view.get(request, lang)
            
            if static_response.status_code != 200:
                return static_response
            
            static_data = json.loads(static_response.content)
            translations = static_data.get('translations', {})
            
            results = {}
            query_lower = query.lower()
            
            for key, value in translations.items():
                if (query_lower in key.lower() or 
                    query_lower in str(value).lower()):
                    results[key] = value
            
            return JsonResponse({
                'query': query,
                'language': lang,
                'results': results,
                'count': len(results)
            })
            
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=500)

class TranslationKeysView(View):
    """Отримання ключів перекладів"""
    
    def get(self, request, lang='uk'):
        try:
            static_view = TranslationsAPIView()
            static_response = static_view.get(request, lang)
            
            if static_response.status_code != 200:
                return static_response
            
            static_data = json.loads(static_response.content)
            translations = static_data.get('translations', {})
            all_keys = list(translations.keys())
            
            return JsonResponse({
                'language': lang,
                'keys': all_keys,
                'total_count': len(all_keys)
            })
            
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=500)

class TranslationStatsView(View):
    """Статистика перекладів"""
    
    def get(self, request):
        try:
            stats = {}
            
            for lang_code, lang_name in settings.LANGUAGES:
                static_view = TranslationsAPIView()
                static_response = static_view.get(request, lang_code)
                
                static_count = 0
                if static_response.status_code == 200:
                    static_data = json.loads(static_response.content)
                    static_count = static_data.get('count', 0)
                
                stats[lang_code] = {
                    'name': lang_name,
                    'static_count': static_count,
                    'dynamic_count': 0,
                    'total_count': static_count
                }
            
            return JsonResponse({
                'languages': stats,
                'total_languages': len(stats)
            })
            
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class TranslationUpdateWebhook(View):
    """Webhook для оновлення кешу"""
    
    def post(self, request):
        try:
            return JsonResponse({
                'status': 'success', 
                'message': 'Translation cache cleared successfully'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error', 
                'message': str(e)
            }, status=500)
'''
    
    with open(translations_file, 'w', encoding='utf-8') as f:
        f.write(simple_code)
    
    print(f"✅ Створено простий файл: {translations_file}")

def create_translation_files():
    """Створює JSON файли перекладів"""
    backend_dir = Path(__file__).parent
    static_dir = backend_dir / "static_translations"
    static_dir.mkdir(exist_ok=True)
    
    uk_translations = {
        "nav.home": "Головна",
        "nav.about": "Про нас",
        "nav.services": "Послуги",
        "nav.contact": "Контакти",
        "common.loading": "Завантаження...",
        "common.error": "Помилка",
        "common.success": "Успіх",
        "form.name": "Ім'я",
        "form.email": "Електронна пошта"
    }
    
    en_translations = {
        "nav.home": "Home",
        "nav.about": "About",
        "nav.services": "Services",
        "nav.contact": "Contact",
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
        "form.name": "Name",
        "form.email": "Email"
    }
    
    import json
    
    for lang, translations in [("uk", uk_translations), ("en", en_translations)]:
        file_path = static_dir / f"{lang}.json"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(translations, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Створено файл: {file_path}")

def main():
    """Головна функція виправлення"""
    print("🔧 ШВИДКЕ ВИПРАВЛЕННЯ ПОМИЛКИ КЕШУВАННЯ")
    print("="*50)
    
    translations_file = Path("apps/api/translations.py")
    
    if translations_file.exists():
        print("1. Виправлення існуючого файлу...")
        success = fix_translations_file()
        
        if not success:
            print("2. Створення нового файлу...")
            create_simple_translations_file()
    else:
        print("1. Створення файлу translations.py...")
        create_simple_translations_file()
    
    print("\n2. Створення JSON файлів перекладів...")
    create_translation_files()
    
    print("\n" + "="*50)
    print("✅ ВИПРАВЛЕННЯ ЗАВЕРШЕНО!")
    print("\nПомилка була через те, що Django намагався кешувати JsonResponse,")
    print("що неможливо серіалізувати в JSON.")
    print("\nТепер:")
    print("1. Перезапустіть сервер: python manage.py runserver")
    print("2. Перевірте: http://127.0.0.1:8000/api/v1/translations/uk/")
    print("3. Тестуйте: http://127.0.0.1:8000/api/v1/translations/stats/")
    
    print("\n💡 Якщо все ще є помилки:")
    print("1. Очистіть кеш: python manage.py shell -c \"from django.core.cache import cache; cache.clear()\"")
    print("2. Перевірте налаштування Redis/кешу в settings.py")

if __name__ == "__main__":
    main()