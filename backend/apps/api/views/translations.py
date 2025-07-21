# backend/apps/api/views/translations.py
import json
import os
from django.http import JsonResponse
from django.views import View
from django.conf import settings
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_exempt
from django.utils import translation
import logging

logger = logging.getLogger(__name__)

class TranslationsAPIView(View):
    """API для отримання статичних перекладів"""
    
    @method_decorator(cache_page(60 * 15))  # Кеш на 15 хвилин
    def get(self, request, lang='uk'):
        try:
            # Валідація мови
            available_languages = [code for code, name in settings.LANGUAGES]
            if lang not in available_languages:
                lang = settings.LANGUAGE_CODE
            
            # Спробуємо отримати з кешу
            cache_key = f'static_translations_{lang}'
            translations = cache.get(cache_key)
            
            if translations is None:
                # Завантажуємо з файлу
                translations = self.load_static_translations(lang)
                
                # Зберігаємо в кеш на 30 хвилин
                cache.set(cache_key, translations, 60 * 30)
                logger.info(f"Loaded translations for {lang} from file")
            else:
                logger.info(f"Loaded translations for {lang} from cache")
            
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
        """Завантажує статичні переклади з JSON файлу"""
        static_dir = getattr(settings, 'STATIC_TRANSLATIONS_DIR', settings.BASE_DIR / 'static_translations')
        file_path = static_dir / f'{lang}.json'
        
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.error(f"Error reading translation file {file_path}: {e}")
                return {}
        else:
            logger.warning(f"Translation file not found: {file_path}")
            return {}

class DynamicTranslationsAPIView(View):
    """API для динамічних перекладів з моделей"""
    
    def get(self, request, lang='uk'):
        try:
            # Тут буде логіка для отримання перекладів з моделей
            # Поки що повертаємо порожній результат
            dynamic_translations = self.get_model_translations(lang)
            
            return JsonResponse({
                'language': lang,
                'translations': dynamic_translations,
                'count': len(dynamic_translations),
                'source': 'dynamic'
            })
        except Exception as e:
            logger.error(f"Error loading dynamic translations for {lang}: {str(e)}")
            return JsonResponse({
                'error': str(e),
                'language': lang,
                'translations': {},
                'count': 0
            }, status=500)
    
    def get_model_translations(self, lang):
        """Отримує переклади з моделей"""
        dynamic_translations = {}
        
        try:
            # Приклад отримання перекладів з моделей
            # Якщо використовуєте django-modeltranslation
            
            # Переклади послуг
            try:
                from apps.services.models import Service
                services = Service.objects.filter(is_active=True)
                
                for service in services:
                    # Якщо є поле title з перекладами
                    if hasattr(service, f'title_{lang}'):
                        title = getattr(service, f'title_{lang}', None)
                        if title:
                            dynamic_translations[f'service.{service.id}.title'] = title
                    
                    # Якщо є поле description з перекладами
                    if hasattr(service, f'description_{lang}'):
                        description = getattr(service, f'description_{lang}', None)
                        if description:
                            dynamic_translations[f'service.{service.id}.description'] = description
                            
            except ImportError:
                pass  # Модель не існує
            
            # Переклади проектів
            try:
                from apps.projects.models import Project
                projects = Project.objects.filter(is_active=True)
                
                for project in projects:
                    if hasattr(project, f'title_{lang}'):
                        title = getattr(project, f'title_{lang}', None)
                        if title:
                            dynamic_translations[f'project.{project.id}.title'] = title
                            
            except ImportError:
                pass  # Модель не існує
            
            # Переклади категорій
            try:
                from apps.content.models import Category
                categories = Category.objects.filter(is_active=True)
                
                for category in categories:
                    if hasattr(category, f'name_{lang}'):
                        name = getattr(category, f'name_{lang}', None)
                        if name:
                            dynamic_translations[f'category.{category.id}.name'] = name
                            
            except ImportError:
                pass  # Модель не існує
                
        except Exception as e:
            logger.error(f"Error getting model translations for {lang}: {e}")
        
        return dynamic_translations

class AllTranslationsAPIView(View):
    """API для всіх перекладів (статичні + динамічні)"""
    
    def get(self, request, lang='uk'):
        try:
            # Отримуємо статичні переклади
            static_view = TranslationsAPIView()
            static_response = static_view.get(request, lang)
            
            if static_response.status_code != 200:
                return static_response
            
            static_data = json.loads(static_response.content)
            
            # Отримуємо динамічні переклади
            dynamic_view = DynamicTranslationsAPIView()
            dynamic_response = dynamic_view.get(request, lang)
            
            if dynamic_response.status_code == 200:
                dynamic_data = json.loads(dynamic_response.content)
            else:
                dynamic_data = {'translations': {}, 'count': 0}
            
            # Об'єднуємо
            all_translations = {}
            all_translations.update(static_data.get('translations', {}))
            all_translations.update(dynamic_data.get('translations', {}))
            
            return JsonResponse({
                'language': lang,
                'translations': all_translations,
                'count': len(all_translations),
                'static_count': static_data.get('count', 0),
                'dynamic_count': dynamic_data.get('count', 0),
                'source': 'combined',
                'available_languages': static_data.get('available_languages', [])
            })
        except Exception as e:
            logger.error(f"Error loading combined translations for {lang}: {str(e)}")
            return JsonResponse({
                'error': str(e),
                'language': lang,
                'translations': {},
                'count': 0
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class TranslationUpdateWebhook(View):
    """Webhook для оновлення кешу при зміні перекладів"""
    
    def post(self, request):
        try:
            # Очищаємо кеш
            for lang_code, _ in settings.LANGUAGES:
                cache_keys = [
                    f'static_translations_{lang_code}',
                    f'dynamic_translations_{lang_code}',
                    f'combined_translations_{lang_code}'
                ]
                
                for key in cache_keys:
                    cache.delete(key)
            
            logger.info("Translation cache cleared via webhook")
            
            return JsonResponse({
                'status': 'success', 
                'message': 'Translation cache cleared successfully'
            })
        except Exception as e:
            logger.error(f"Error clearing translation cache: {str(e)}")
            return JsonResponse({
                'status': 'error', 
                'message': str(e)
            }, status=500)

class TranslationStatsView(View):
    """Статистика перекладів"""
    
    def get(self, request):
        try:
            stats = {}
            
            for lang_code, lang_name in settings.LANGUAGES:
                # Статичні переклади
                static_view = TranslationsAPIView()
                static_response = static_view.get(request, lang_code)
                
                if static_response.status_code == 200:
                    static_data = json.loads(static_response.content)
                    static_count = static_data.get('count', 0)
                else:
                    static_count = 0
                
                # Динамічні переклади
                dynamic_view = DynamicTranslationsAPIView()
                dynamic_response = dynamic_view.get(request, lang_code)
                
                if dynamic_response.status_code == 200:
                    dynamic_data = json.loads(dynamic_response.content)
                    dynamic_count = dynamic_data.get('count', 0)
                else:
                    dynamic_count = 0
                
                stats[lang_code] = {
                    'name': lang_name,
                    'static_count': static_count,
                    'dynamic_count': dynamic_count,
                    'total_count': static_count + dynamic_count
                }
            
            return JsonResponse({
                'languages': stats,
                'total_languages': len(settings.LANGUAGES)
            })
        except Exception as e:
            logger.error(f"Error getting translation stats: {str(e)}")
            return JsonResponse({
                'error': str(e)
            }, status=500)

class TranslationSearchView(View):
    """Пошук перекладів"""
    
    def get(self, request, lang='uk'):
        try:
            query = request.GET.get('q', '').strip()
            
            if not query:
                return JsonResponse({
                    'error': 'Query parameter "q" is required',
                    'results': {}
                }, status=400)
            
            # Завантажуємо переклади
            static_view = TranslationsAPIView()
            static_response = static_view.get(request, lang)
            
            if static_response.status_code != 200:
                return static_response
            
            static_data = json.loads(static_response.content)
            translations = static_data.get('translations', {})
            
            # Пошук
            results = {}
            query_lower = query.lower()
            
            for key, value in translations.items():
                if (query_lower in key.lower() or 
                    query_lower in value.lower()):
                    results[key] = value
            
            return JsonResponse({
                'query': query,
                'language': lang,
                'results': results,
                'count': len(results)
            })
            
        except Exception as e:
            logger.error(f"Error searching translations: {str(e)}")
            return JsonResponse({
                'error': str(e)
            }, status=500)

class TranslationKeysView(View):
    """Отримання всіх ключів перекладів"""
    
    def get(self, request, lang='uk'):
        try:
            # Завантажуємо переклади
            static_view = TranslationsAPIView()
            static_response = static_view.get(request, lang)
            
            if static_response.status_code != 200:
                return static_response
            
            static_data = json.loads(static_response.content)
            translations = static_data.get('translations', {})
            
            # Групуємо ключі за префіксами
            grouped_keys = {}
            all_keys = list(translations.keys())
            
            for key in all_keys:
                prefix = key.split('.')[0] if '.' in key else 'other'
                
                if prefix not in grouped_keys:
                    grouped_keys[prefix] = []
                
                grouped_keys[prefix].append(key)
            
            return JsonResponse({
                'language': lang,
                'keys': all_keys,
                'grouped_keys': grouped_keys,
                'total_count': len(all_keys)
            })
            
        except Exception as e:
            logger.error(f"Error getting translation keys: {str(e)}")
            return JsonResponse({
                'error': str(e)
            }, status=500)