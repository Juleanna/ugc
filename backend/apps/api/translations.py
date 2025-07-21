# backend/apps/api/translations.py
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
            return self.get_default_translations(lang)
    
    def get_default_translations(self, lang):
        """Повертає базові переклади якщо файл не знайдено"""
        if lang == 'uk':
            return {
                "nav.home": "Головна",
                "nav.about": "Про нас",
                "nav.services": "Послуги",
                "nav.projects": "Проекти",
                "nav.contact": "Контакти",
                "common.loading": "Завантаження...",
                "common.error": "Помилка",
                "common.success": "Успіх",
                "common.save": "Зберегти",
                "common.cancel": "Скасувати",
                "form.name": "Ім'я",
                "form.email": "Електронна пошта",
                "form.phone": "Телефон",
                "form.message": "Повідомлення"
            }
        else:
            return {
                "nav.home": "Home",
                "nav.about": "About",
                "nav.services": "Services", 
                "nav.projects": "Projects",
                "nav.contact": "Contact",
                "common.loading": "Loading...",
                "common.error": "Error",
                "common.success": "Success",
                "common.save": "Save",
                "common.cancel": "Cancel",
                "form.name": "Name",
                "form.email": "Email",
                "form.phone": "Phone",
                "form.message": "Message"
            }

class DynamicTranslationsAPIView(View):
    """API для динамічних перекладів з моделей"""
    
    def get(self, request, lang='uk'):
        try:
            # Спробуємо отримати з кешу
            cache_key = f'dynamic_translations_{lang}'
            translations = cache.get(cache_key)
            
            if translations is None:
                # Завантажуємо з моделей
                translations = self.load_dynamic_translations(lang)
                
                # Зберігаємо в кеш на 15 хвилин
                cache.set(cache_key, translations, 60 * 15)
                logger.info(f"Loaded dynamic translations for {lang} from models")
            else:
                logger.info(f"Loaded dynamic translations for {lang} from cache")
            
            return JsonResponse({
                'language': lang,
                'translations': translations,
                'count': len(translations),
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
    
    def load_dynamic_translations(self, lang):
        """Завантажує переклади з Django моделей"""
        dynamic_translations = {}
        
        try:
            # Переклади послуг
            try:
                from apps.services.models import Service
                services = Service.objects.filter(is_active=True)
                
                for service in services:
                    if hasattr(service, f'title_{lang}'):
                        title = getattr(service, f'title_{lang}', None)
                        if title:
                            dynamic_translations[f'service.{service.id}.title'] = title
                    
                    if hasattr(service, f'description_{lang}'):
                        desc = getattr(service, f'description_{lang}', None)
                        if desc:
                            dynamic_translations[f'service.{service.id}.description'] = desc
                            
            except ImportError:
                logger.warning("Services app not found")
            
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
                logger.warning("Projects app not found")
            
            # Переклади контенту
            try:
                from apps.content.models import HomePage, AboutPage
                
                # Головна сторінка
                homepage = HomePage.objects.filter(is_active=True).first()
                if homepage:
                    if hasattr(homepage, f'company_description_{lang}'):
                        desc = getattr(homepage, f'company_description_{lang}', None)
                        if desc:
                            dynamic_translations['homepage.company_description'] = desc
                
                # Сторінка про нас
                aboutpage = AboutPage.objects.filter(is_active=True).first()
                if aboutpage:
                    if hasattr(aboutpage, f'history_text_{lang}'):
                        history = getattr(aboutpage, f'history_text_{lang}', None)
                        if history:
                            dynamic_translations['aboutpage.history_text'] = history
                            
            except ImportError:
                logger.warning("Content app not found")
                
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

class TranslationSearchView(View):
    """Пошук перекладів"""
    
    def get(self, request, lang='uk'):
        try:
            query = request.GET.get('q', '').strip()
            
            if not query:
                return JsonResponse({
                    'error': 'Query parameter "q" is required'
                }, status=400)
            
            # Отримуємо всі переклади
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
                    query_lower in str(value).lower()):
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

class TranslationStatsView(View):
    """Статистика перекладів"""
    
    def get(self, request):
        try:
            stats = {}
            
            for lang_code, lang_name in settings.LANGUAGES:
                # Статичні переклади
                static_view = TranslationsAPIView()
                static_response = static_view.get(request, lang_code)
                
                static_count = 0
                if static_response.status_code == 200:
                    static_data = json.loads(static_response.content)
                    static_count = static_data.get('count', 0)
                
                # Динамічні переклади
                dynamic_view = DynamicTranslationsAPIView()
                dynamic_response = dynamic_view.get(request, lang_code)
                
                dynamic_count = 0
                if dynamic_response.status_code == 200:
                    dynamic_data = json.loads(dynamic_response.content)
                    dynamic_count = dynamic_data.get('count', 0)
                
                stats[lang_code] = {
                    'name': lang_name,
                    'static_count': static_count,
                    'dynamic_count': dynamic_count,
                    'total_count': static_count + dynamic_count
                }
            
            return JsonResponse({
                'languages': stats,
                'total_languages': len(stats)
            })
            
        except Exception as e:
            logger.error(f"Error getting translation stats: {str(e)}")
            return JsonResponse({
                'error': str(e)
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