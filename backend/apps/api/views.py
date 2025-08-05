# backend/apps/api/views.py
# Додаткові API Views для використання з ViewSets

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ================== ДОПОМІЖНІ КЛАСИ ==================

class UnifiedAPIResponse:
    """Стандартизований формат відповідей API"""
    
    @staticmethod
    def success(data, message="Success", meta=None):
        response = {
            'success': True,
            'data': data,
            'message': message
        }
        if meta:
            response['meta'] = meta
        return response
    
    @staticmethod
    def error(message, code=None, details=None):
        response = {
            'success': False,
            'message': message
        }
        if code:
            response['code'] = code
        if details:
            response['details'] = details
        return response

# ================== TRANSLATIONS ENDPOINTS ==================
# Ці endpoints краще залишити як API Views для гнучкості

class TranslationsAPIView(APIView):
    """API для отримання перекладів конкретної мови"""
    permission_classes = []  # Public access for translations
    
    def get(self, request, lang='uk'):
        try:
            # Валідація мови
            available_languages = [code for code, name in settings.LANGUAGES]
            if lang not in available_languages:
                lang = settings.LANGUAGE_CODE
            
            cache_key = f'translations_{lang}'
            translations = cache.get(cache_key)
            
            if not translations:
                # Базові переклади
                translations = self._load_translations(lang)
                
                # Кешуємо на 6 годин
                cache.set(cache_key, translations, 21600)
            
            return Response(UnifiedAPIResponse.success(
                data={
                    'language': lang,
                    'translations': translations,
                    'count': len(translations),
                    'available_languages': available_languages
                },
                message=f"Переклади для мови {lang} отримано"
            ))
            
        except Exception as e:
            logger.error(f"Error in TranslationsAPIView: {str(e)}")
            return Response(
                UnifiedAPIResponse.error(
                    message="Помилка при отриманні перекладів",
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _load_translations(self, lang):
        """Завантажує переклади для мови"""
        
        # Базові переклади інтерфейсу
        base_translations = {
            'navigation': {
                'home': 'Головна' if lang == 'uk' else 'Home',
                'about': 'Про нас' if lang == 'uk' else 'About',
                'services': 'Послуги' if lang == 'uk' else 'Services',
                'projects': 'Проєкти' if lang == 'uk' else 'Projects',
                'careers': 'Кар\'єра' if lang == 'uk' else 'Careers',
                'contact': 'Контакти' if lang == 'uk' else 'Contact',
                'partnership': 'Партнерам' if lang == 'uk' else 'Partnership'
            },
            'common': {
                'read_more': 'Читати далі' if lang == 'uk' else 'Read More',
                'view_all': 'Переглянути всі' if lang == 'uk' else 'View All',
                'contact_us': 'Зв\'язатися з нами' if lang == 'uk' else 'Contact Us',
                'learn_more': 'Дізнатися більше' if lang == 'uk' else 'Learn More',
                'send': 'Відправити' if lang == 'uk' else 'Send',
                'loading': 'Завантаження...' if lang == 'uk' else 'Loading...',
                'error': 'Помилка' if lang == 'uk' else 'Error',
                'success': 'Успішно' if lang == 'uk' else 'Success'
            },
            'homepage': {
                'main_title': 'Професійний одяг кожної сфери' if lang == 'uk' else 'Professional clothing for every sphere',
                'subtitle': 'Створюємо якісний одяг для різних професій' if lang == 'uk' else 'We create quality clothing for various professions',
                'hero_description': 'Ми пропонуємо повний спектр послуг з виробництва професійного одягу' if lang == 'uk' else 'We offer a full range of professional clothing manufacturing services',
                'our_advantages': 'Наші переваги' if lang == 'uk' else 'Our Advantages',
                'featured_services': 'Популярні послуги' if lang == 'uk' else 'Featured Services',
                'recent_projects': 'Останні проєкти' if lang == 'uk' else 'Recent Projects',
                'our_team': 'Наша команда' if lang == 'uk' else 'Our Team'
            },
            'services': {
                'page_title': 'Наші послуги' if lang == 'uk' else 'Our Services',
                'medical_clothing': 'Медичний одяг' if lang == 'uk' else 'Medical Clothing',
                'work_clothing': 'Робочий одяг' if lang == 'uk' else 'Work Clothing',
                'security_uniform': 'Форма безпеки' if lang == 'uk' else 'Security Uniform',
                'school_uniform': 'Шкільна форма' if lang == 'uk' else 'School Uniform',
                'corporate_clothing': 'Корпоративний одяг' if lang == 'uk' else 'Corporate Clothing'
            },
            'projects': {
                'page_title': 'Наші проєкти' if lang == 'uk' else 'Our Projects',
                'client': 'Клієнт' if lang == 'uk' else 'Client',
                'completion_date': 'Дата завершення' if lang == 'uk' else 'Completion Date',
                'project_details': 'Деталі проєкту' if lang == 'uk' else 'Project Details',
                'challenge': 'Виклик' if lang == 'uk' else 'Challenge',
                'solution': 'Рішення' if lang == 'uk' else 'Solution',
                'result': 'Результат' if lang == 'uk' else 'Result'
            },
            'jobs': {
                'page_title': 'Кар\'єра' if lang == 'uk' else 'Careers',
                'open_positions': 'Відкриті позиції' if lang == 'uk' else 'Open Positions',
                'apply_now': 'Подати заявку' if lang == 'uk' else 'Apply Now',
                'job_requirements': 'Вимоги' if lang == 'uk' else 'Requirements',
                'job_responsibilities': 'Обов\'язки' if lang == 'uk' else 'Responsibilities',
                'employment_type': 'Тип зайнятості' if lang == 'uk' else 'Employment Type',
                'experience_required': 'Досвід роботи' if lang == 'uk' else 'Experience Required',
                'salary_range': 'Зарплатна вилка' if lang == 'uk' else 'Salary Range',
                'urgent_position': 'Термінова вакансія' if lang == 'uk' else 'Urgent Position'
            },
            'forms': {
                'name': 'Ім\'я' if lang == 'uk' else 'Name',
                'surname': 'Прізвище' if lang == 'uk' else 'Surname',
                'email': 'Електронна пошта' if lang == 'uk' else 'Email',
                'phone': 'Телефон' if lang == 'uk' else 'Phone',
                'message': 'Повідомлення' if lang == 'uk' else 'Message',
                'company_name': 'Назва компанії' if lang == 'uk' else 'Company Name',
                'position': 'Посада' if lang == 'uk' else 'Position',
                'resume': 'Резюме' if lang == 'uk' else 'Resume',
                'cover_letter': 'Супровідний лист' if lang == 'uk' else 'Cover Letter',
                'required_field': 'Обов\'язкове поле' if lang == 'uk' else 'Required field',
                'invalid_email': 'Некоректна електронна пошта' if lang == 'uk' else 'Invalid email',
                'invalid_phone': 'Некоректний номер телефону' if lang == 'uk' else 'Invalid phone number'
            },
            'contact': {
                'page_title': 'Контакти' if lang == 'uk' else 'Contact Us',
                'our_offices': 'Наші офіси' if lang == 'uk' else 'Our Offices',
                'main_office': 'Головний офіс' if lang == 'uk' else 'Main Office',
                'address': 'Адреса' if lang == 'uk' else 'Address',
                'working_hours': 'Години роботи' if lang == 'uk' else 'Working Hours',
                'get_in_touch': 'Зв\'яжіться з нами' if lang == 'uk' else 'Get in Touch'
            }
        }
        
        # Спробуємо завантажити додаткові переклади з файлів
        try:
            static_translations = self._load_static_translations(lang)
            if static_translations:
                base_translations.update(static_translations)
        except Exception as e:
            logger.warning(f"Could not load static translations for {lang}: {str(e)}")
        
        return base_translations
    
    def _load_static_translations(self, lang):
        """Завантажує статичні переклади з файлів"""
        static_dir = getattr(settings, 'STATIC_TRANSLATIONS_DIR', None)
        if not static_dir:
            return {}
        
        translation_file = Path(static_dir) / f"{lang}.json"
        
        if translation_file.exists():
            with open(translation_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        return {}


class AllTranslationsAPIView(APIView):
    """API для отримання всіх перекладів мови (розширений формат)"""
    permission_classes = []  # Public access for translations
    
    def get(self, request, lang='uk'):
        try:
            # Отримуємо базові переклади
            base_view = TranslationsAPIView()
            base_response = base_view.get(request, lang)
            
            if base_response.status_code == 200:
                base_data = base_response.data['data']
                base_translations = base_data['translations']
                
                # Додаємо метадані та статистику
                extended_data = {
                    **base_data,
                    'meta': {
                        'format': 'extended',
                        'generated_at': timezone.now().isoformat(),
                        'cache_ttl': 21600,  # 6 годин
                        'sections': list(base_translations.keys()),
                        'total_keys': sum(len(section) if isinstance(section, dict) else 1 
                                        for section in base_translations.values()),
                        'version': '1.0'
                    }
                }
                
                return Response(UnifiedAPIResponse.success(
                    data=extended_data,
                    message=f"Всі переклади для мови {lang} отримано"
                ))
            else:
                return base_response
                
        except Exception as e:
            logger.error(f"Error in AllTranslationsAPIView: {str(e)}")
            return Response(
                UnifiedAPIResponse.error(
                    message="Помилка при отриманні розширених перекладів",
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ================== UTILITY ENDPOINTS ==================

class APIHealthCheckView(APIView):
    """Перевірка здоров'я API та системи"""
    permission_classes = []  # Public access for health checks
    
    def get(self, request):
        try:
            # Основні перевірки системи
            health_checks = {
                'api': self._check_api(),
                'database': self._check_database(),
                'cache': self._check_cache(),
                'media_storage': self._check_media_storage(),
                'translations': self._check_translations()
            }
            
            # Загальний статус
            overall_status = 'healthy' if all(
                check['status'] == 'healthy' for check in health_checks.values()
            ) else 'degraded'
            
            # Додаткова інформація
            system_info = {
                'timestamp': timezone.now().isoformat(),
                'version': '1.0',
                'architecture': 'ViewSets + DRF',
                'debug_mode': settings.DEBUG,
                'overall_status': overall_status
            }
            
            response_data = {
                'system': system_info,
                'checks': health_checks
            }
            
            return Response(UnifiedAPIResponse.success(
                data=response_data,
                message=f"Перевірка здоров'я завершена. Статус: {overall_status}"
            ))
            
        except Exception as e:
            logger.error(f"Error in health check: {str(e)}")
            return Response(
                UnifiedAPIResponse.error(
                    message="Помилка при перевірці здоров'я системи",
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _check_api(self):
        """Перевірка API"""
        return {
            'status': 'healthy',
            'message': 'API працює нормально',
            'response_time': '<1ms'
        }
    
    def _check_database(self):
        """Перевірка бази даних"""
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                return {
                    'status': 'healthy',
                    'message': 'База даних доступна',
                    'connection': 'active'
                }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': 'Проблема з базою даних',
                'error': str(e)
            }
    
    def _check_cache(self):
        """Перевірка кешу"""
        try:
            test_key = 'health_check_test'
            test_value = 'working'
            
            cache.set(test_key, test_value, 60)
            cached_value = cache.get(test_key)
            
            if cached_value == test_value:
                cache.delete(test_key)
                return {
                    'status': 'healthy',
                    'message': 'Кеш працює нормально',
                    'type': cache.__class__.__name__
                }
            else:
                return {
                    'status': 'unhealthy',
                    'message': 'Кеш не відповідає'
                }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': 'Помилка кешу',
                'error': str(e)
            }
    
    def _check_media_storage(self):
        """Перевірка медіа сховища"""
        try:
            media_root = settings.MEDIA_ROOT
            if Path(media_root).exists():
                return {
                    'status': 'healthy',
                    'message': 'Медіа сховище доступне',
                    'path': media_root
                }
            else:
                return {
                    'status': 'warning',
                    'message': 'Медіа директорія не існує',
                    'path': media_root
                }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': 'Помилка медіа сховища',
                'error': str(e)
            }
    
    def _check_translations(self):
        """Перевірка системи перекладів"""
        try:
            available_languages = getattr(settings, 'LANGUAGES', [])
            return {
                'status': 'healthy',
                'message': 'Система перекладів працює',
                'available_languages': len(available_languages),
                'default_language': settings.LANGUAGE_CODE
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': 'Помилка системи перекладів',
                'error': str(e)
            }


class CacheManagementView(APIView):
    """Управління кешем системи"""
    permission_classes = [IsAdminUser]  # Only admin access for cache management
    
    def get(self, request):
        """Статистика кешу"""
        try:
            # Ключі які зазвичай кешуються
            known_cache_keys = [
                'homepage_stats_1',
                'api_general_stats',
                'translations_uk',
                'translations_en',
                'featured_services',
                'featured_projects'
            ]
            
            cache_info = {}
            active_keys = []
            
            for key in known_cache_keys:
                if cache.get(key) is not None:
                    active_keys.append(key)
                    cache_info[key] = 'active'
                else:
                    cache_info[key] = 'empty'
            
            stats = {
                'cache_backend': cache.__class__.__name__,
                'known_keys': cache_info,
                'active_keys_count': len(active_keys),
                'last_cleared': cache.get('cache_last_cleared', 'never'),
                'status': 'operational'
            }
            
            return Response(UnifiedAPIResponse.success(
                data=stats,
                message="Статистика кешу отримана"
            ))
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return Response(
                UnifiedAPIResponse.error(
                    message="Помилка при отриманні статистики кешу",
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        """Очищення кешу"""
        try:
            # Ключі для очищення
            cache_keys_to_clear = [
                'homepage_stats_1',
                'api_general_stats',
                'translations_uk', 
                'translations_en',
                'featured_services',
                'featured_projects'
            ]
            
            cleared_count = 0
            for key in cache_keys_to_clear:
                if cache.delete(key):
                    cleared_count += 1
            
            # Зберігаємо час очищення
            cache.set('cache_last_cleared', timezone.now().isoformat(), 86400)
            
            return Response(UnifiedAPIResponse.success(
                data={
                    'cleared_keys': cleared_count,
                    'total_attempted': len(cache_keys_to_clear),
                    'cleared_at': timezone.now().isoformat()
                },
                message=f"Кеш очищено. Видалено {cleared_count} ключів"
            ))
            
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
            return Response(
                UnifiedAPIResponse.error(
                    message="Помилка при очищенні кешу",
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# =============== ІНФОРМАЦІЯ ПРО АРХІТЕКТУРУ ===============

print("🏗️ API Views для ViewSets архітектури завантажено")
print("📦 Включає: Переклади, Перевірка здоров'я, Управління кешем")
print("✅ Готово до роботи з ViewSets")